/**
 * MODEL V2 — renders the building on a canvas, builds it, then orbits it.
 *
 * Two layers, offset in time. First a glowing centreline traces every run,
 * bottom to top. A beat later the solid duct or pipe inflates out of that same
 * centreline, swallowing the glow as it goes. The lines never move; the solid
 * grows from zero radius, which is why the two read as one object.
 *
 * How that is done without hundreds of draw calls: every run is written into
 * one merged geometry per system, with a per-vertex `aReveal` saying when that
 * vertex's slice of the model should appear. A single uniform per layer then
 * sweeps 0 to 1 and the shader decides what is visible. The whole model,
 * roughly 500 runs and 110 pieces of equipment, is about 17 draw calls.
 *
 * Everything is in one module so the 3D dependency graph, Three.js, its
 * post-processing addons and GSAP included, lands in a single lazy chunk.
 */
import gsap from "gsap";
import {
  AdditiveBlending,
  BoxGeometry,
  Box3,
  BufferGeometry,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  LineSegments,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  NeutralToneMapping,
  NoToneMapping,
  NormalBlending,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  buildingV2,
  EDGE_COLOR,
  PROFILES,
  SYSTEMS,
  type Point,
  type Profile,
  type Run,
  type SystemId,
} from "./mepGeometry";
import {
  buildSurfaces,
  type ModelSurfaces,
  type SurfaceFamily,
  type SurfaceMaps,
} from "./mepTextures";
import { DEFAULT_LIGHTING, DEFAULT_TIMING, type Stage } from "./mepDefaults";

/** Corner radius on elbows, and how many chords each elbow gets. */
const ELBOW = 0.55;
const ELBOW_SEGMENTS = 5;
/** Spacing between spine samples. Sets how smoothly a run draws itself. */
const SPINE_SPACING = 0.8;
const WIRE_SPACING = 1.1;
/** Segment length along a box's growth axis. Same job as SPINE_SPACING. */
const BOX_SEGMENT = 1.2;

/**
 * Below this, in model units, an object gets no drawn edges.
 *
 * Revit's edges look right because you are usually looking at a duct that is
 * tens of pixels wide. A branch takeoff in this view is three or four, and
 * four corner lines on a four-pixel duct is not a duct with edges, it is a
 * black line. Only the trunks, risers, headers and plant are big enough to
 * carry line work; everything smaller reads as pure colour, which is also
 * what a real view at this zoom does.
 */
const EDGE_MIN_SIZE = 1.5;

/**
 * A narrow field of view keeps the perspective shallow, which is what makes a
 * model read as a drawing rather than a photograph.
 */
const CAMERA_FOV = 30;
/**
 * The camera fit is computed from centrelines, so it has to allow for the
 * half-thickness of the fattest duct and the largest equipment box on top.
 */
const SURFACE_MARGIN = 2.5;

/**
 * Bloom strength while the model is still drafting itself in as line work.
 * Where it settles afterwards is a tuned default, see DEFAULT_LIGHTING.
 */
const BLOOM_DRAFTING = 0.62;

/**
 * How reveal order is split. Mostly height, so the model grows floor by
 * floor, with a little along-path so each run still draws end to end.
 */
const HEIGHT_WEIGHT = 0.86;
const PATH_WEIGHT = 0.12;

/**
 * How much of the model has to be on screen before the build starts.
 *
 * The build is the whole point of the visual, so starting it while the canvas
 * is a sliver at the bottom of the screen wastes it: by the time the viewer
 * arrives the building is already up. This holds the first frame until the
 * model is genuinely being looked at.
 */
const START_RATIO = 0.75;

/**
 * Steps for the start gate, every 5%.
 *
 * A bare [0, 0.75] only reports those two crossings, which is no use when the
 * gate below also tests how much of the viewport is filled. Twenty-one steps
 * is cheap and means a fast scroll still lands on one.
 */
const START_STEPS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * Whether the model counts as "being looked at".
 *
 * Two ways to qualify, because the ratio alone breaks on short screens: a
 * canvas taller than the viewport can never be 75% visible, so it would hang
 * at the gate forever. Filling 75% of the viewport counts as well.
 */
function bigEnough(entry: IntersectionObserverEntry): boolean {
  if (entry.intersectionRatio >= START_RATIO) return true;
  const root = entry.rootBounds;
  if (!root || root.height <= 0) return false;
  return entry.intersectionRect.height / root.height >= START_RATIO;
}

export interface MepModel {
  /** Restart the build from an empty frame. */
  replay(): void;
  /** Release GPU memory and detach every listener. Safe to call twice. */
  dispose(): void;
}

// ---------------------------------------------------------------------------
// Theme colours
// ---------------------------------------------------------------------------

let probe: CanvasRenderingContext2D | null | undefined;

/**
 * Converts any CSS colour to 0-1 sRGB. The theme is written in oklch(), which
 * THREE.Color cannot parse, so the browser does the conversion through a 1x1
 * canvas. Returns null when the browser cannot parse the value either.
 */
function cssToRgb(value: string): [number, number, number] | null {
  if (probe === undefined) {
    probe =
      document.createElement("canvas").getContext("2d", {
        willReadFrequently: true,
      }) ?? null;
  }
  if (!probe || !value) return null;

  // An unparseable value leaves fillStyle untouched, which is how we detect it.
  probe.fillStyle = "#000000";
  probe.fillStyle = value;
  if (probe.fillStyle === "#000000") return null;

  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

/** Reads a theme token off the element, falling back to a hex if it is unset. */
function themeColor(el: Element, token: string, fallback: number): Color {
  const rgb = cssToRgb(getComputedStyle(el).getPropertyValue(token).trim());
  return rgb
    ? new Color().setRGB(rgb[0], rgb[1], rgb[2], SRGBColorSpace)
    : new Color(fallback);
}

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const toVectors = (points: readonly Point[]) =>
  points.map(([x, y, z]) => new Vector3(x, y, z));

/**
 * Replaces each interior corner with a quadratic Bezier elbow, so a swept
 * section turns rather than creasing.
 */
function roundCorners(points: Vector3[], radius: number): Vector3[] {
  if (points.length < 3 || radius <= 0) return points;

  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const corner = points[i];
    const toPrev = points[i - 1].clone().sub(corner);
    const toNext = points[i + 1].clone().sub(corner);
    const prevLen = toPrev.length();
    const nextLen = toNext.length();
    if (prevLen < 1e-6 || nextLen < 1e-6) continue;

    // Never eat more than half a leg, or two elbows on a short run would cross.
    const r = Math.min(radius, prevLen / 2, nextLen / 2);
    const a = corner.clone().addScaledVector(toPrev.divideScalar(prevLen), r);
    const b = corner.clone().addScaledVector(toNext.divideScalar(nextLen), r);

    out.push(a);
    for (let s = 1; s < ELBOW_SEGMENTS; s++) {
      const t = s / ELBOW_SEGMENTS;
      out.push(a.clone().lerp(corner, t).lerp(corner.clone().lerp(b, t), t));
    }
    out.push(b);
  }
  out.push(points[points.length - 1]);
  return out;
}

/**
 * Subdivides long legs so no gap exceeds `spacing`. Only adds points, so the
 * elbow chords produced above survive untouched.
 */
function densify(points: Vector3[], spacing: number): Vector3[] {
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const distance = points[i - 1].distanceTo(points[i]);
    if (distance < 1e-6) continue; // drop duplicates, they break the frame
    const steps = Math.max(1, Math.ceil(distance / spacing));
    for (let s = 1; s <= steps; s++) {
      out.push(points[i - 1].clone().lerp(points[i], s / steps));
    }
  }
  return out;
}

/** Ordered spine samples for a run, elbows rounded and long legs subdivided. */
function spineFor(points: readonly Point[], spacing: number): Vector3[] {
  return densify(roundCorners(toVectors(points), ELBOW), spacing);
}

/** Normalised distance along the spine, 0 at the first point, 1 at the last. */
function progressAlong(spine: Vector3[]): number[] {
  const cumulative = [0];
  let total = 0;
  for (let i = 1; i < spine.length; i++) {
    total += spine[i - 1].distanceTo(spine[i]);
    cumulative.push(total);
  }
  if (total < 1e-6) return cumulative.map(() => 0);
  return cumulative.map((d) => d / total);
}

// ---------------------------------------------------------------------------
// Cross sections
// ---------------------------------------------------------------------------

/** One ring vertex: offset in the frame's plane, plus its outward normal. */
interface SectionVertex {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

/**
 * A closed cross section. `edges` lists which vertex pairs form a face, so a
 * rectangle can duplicate its corners and keep hard edges while a circle
 * shares them and stays smooth.
 *
 * `corners` names one vertex per real geometric corner. Those are the creases
 * Revit draws a black line along, and a rectangle has four of them where a
 * circle has none.
 *
 * `perimeter` is the arc length from the first vertex round to each one, in
 * model units. It becomes the V coordinate, so a texture wraps a big trunk
 * and a small branch at the same physical scale instead of being stretched to
 * fit whatever is there.
 */
interface Section {
  verts: SectionVertex[];
  edges: readonly (readonly [number, number])[];
  corners: readonly number[];
  perimeter: readonly number[];
}

/** Rectangular duct. Four flat faces, corners duplicated for crisp edges. */
function rectSection(w: number, h: number): Section {
  const a = w / 2;
  const b = h / 2;
  return {
    verts: [
      { x: a, y: b, nx: 0, ny: 1 },
      { x: -a, y: b, nx: 0, ny: 1 },
      { x: -a, y: b, nx: -1, ny: 0 },
      { x: -a, y: -b, nx: -1, ny: 0 },
      { x: -a, y: -b, nx: 0, ny: -1 },
      { x: a, y: -b, nx: 0, ny: -1 },
      { x: a, y: -b, nx: 1, ny: 0 },
      { x: a, y: b, nx: 1, ny: 0 },
    ],
    edges: [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
    ],
    // One vertex per corner, in order around the section, so the same list
    // serves both the long corner lines and the closed loop of a joint ring.
    corners: [0, 1, 3, 5],
    // Walks the four faces in turn. The duplicated corners share a coordinate,
    // which is what keeps the texture continuous around the turn.
    perimeter: [0, w, w, w + h, w + h, w * 2 + h, w * 2 + h, w * 2 + h * 2],
  };
}

/** Round pipe or conduit. No creases, so no edge lines. */
function roundSection(r: number, segments: number): Section {
  const verts: SectionVertex[] = [];
  const edges: [number, number][] = [];
  const perimeter: number[] = [];
  const step = (Math.PI * 2 * r) / segments;

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    verts.push({ x: c * r, y: s * r, nx: c, ny: s });
    edges.push([i, (i + 1) % segments]);
    perimeter.push(i * step);
  }
  return { verts, edges, corners: [], perimeter };
}

function sectionFor(profile: Profile, scale: number): Section {
  if (profile.kind === "rect") {
    return rectSection(profile.w * scale, profile.h * scale);
  }
  const r = profile.r * scale;
  // Small pipes get fewer sides. At this zoom nobody counts them, and it keeps
  // the vertex budget for the ductwork that actually reads.
  return roundSection(r, r > 0.3 ? 10 : 7);
}

/** The widest the section gets, used to decide whether it earns edge lines. */
function sectionSize(profile: Profile, scale: number): number {
  return profile.kind === "rect" ? profile.w * scale : profile.r * 2 * scale;
}

// ---------------------------------------------------------------------------
// Solid builder
// ---------------------------------------------------------------------------

const UP = new Vector3(0, 1, 0);
const SIDE = new Vector3(0, 0, 1);

/**
 * Accumulates swept sections and boxes into one interleaved buffer.
 *
 * Alongside position and normal it writes `aSpine`, the centreline point that
 * each vertex belongs to, and `aReveal`, when that vertex appears. The vertex
 * shader lerps between the two to inflate the solid out of the line.
 */
class SolidBuilder {
  private readonly position: number[] = [];
  private readonly normal: number[] = [];
  private readonly uv: number[] = [];
  private readonly spine: number[] = [];
  private readonly reveal: number[] = [];
  private readonly index: number[] = [];

  /**
   * The black line work that rides on the surface. Kept in the same builder
   * because it is generated from the same sweep: the topology is already known
   * here, whereas EdgesGeometry would have to rediscover it from a merged mesh
   * and would drop the reveal attributes doing it.
   */
  constructor(readonly edges: EdgeBuilder) {}

  get isEmpty() {
    return this.position.length === 0;
  }

  /**
   * Sweeps `section` along `spine`, carrying the frame forward from one sample
   * to the next so the section cannot spin around the path.
   */
  addSweep(spine: Vector3[], section: Section, reveals: number[], drawEdges: boolean) {
    if (spine.length < 2) return;

    const ring = section.verts.length;
    const base = this.position.length / 3;
    /** Corner positions per sample, kept so the edge lines can be strung. */
    const rail: Vector3[][] = [];
    const wantRail = drawEdges && section.corners.length > 0;

    const tangent = new Vector3();
    const up = new Vector3();
    const side = new Vector3();
    const carried = new Vector3();
    let seeded = false;
    /** Distance travelled along the spine, which becomes the U coordinate. */
    let travelled = 0;

    for (let i = 0; i < spine.length; i++) {
      if (i > 0) travelled += spine[i].distanceTo(spine[i - 1]);
      const prev = spine[Math.max(0, i - 1)];
      const next = spine[Math.min(spine.length - 1, i + 1)];
      tangent.subVectors(next, prev);
      if (tangent.lengthSq() < 1e-12) tangent.set(0, 0, 1);
      tangent.normalize();

      // A vertical leg cannot use world up as its reference.
      const reference = Math.abs(tangent.y) > 0.97 ? SIDE : UP;
      if (!seeded) {
        carried.copy(reference);
        seeded = true;
      }

      // Gram-Schmidt against the carried reference: smooth, and never flips.
      up.copy(carried).addScaledVector(tangent, -carried.dot(tangent));
      if (up.lengthSq() < 1e-8) {
        // The carried frame has collapsed onto the tangent. Re-seed rather
        // than emit NaN, which would poison the whole merged geometry.
        up.copy(reference).addScaledVector(tangent, -reference.dot(tangent));
      }
      up.normalize();
      side.crossVectors(up, tangent);
      carried.copy(up);

      const p = spine[i];
      const r = reveals[i];
      for (let j = 0; j < section.verts.length; j++) {
        const v = section.verts[j];
        this.position.push(
          p.x + side.x * v.x + up.x * v.y,
          p.y + side.y * v.x + up.y * v.y,
          p.z + side.z * v.x + up.z * v.y,
        );
        this.normal.push(
          side.x * v.nx + up.x * v.ny,
          side.y * v.nx + up.y * v.ny,
          side.z * v.nx + up.z * v.ny,
        );
        // Both axes are in model units. The material sets repeat to turn that
        // into tiles, so retuning the texture scale never touches geometry.
        this.uv.push(travelled, section.perimeter[j]);
        this.spine.push(p.x, p.y, p.z);
        this.reveal.push(r);
      }

      if (wantRail) {
        rail.push(
          section.corners.map((c) => {
            const v = section.verts[c];
            return new Vector3(
              p.x + side.x * v.x + up.x * v.y,
              p.y + side.y * v.x + up.y * v.y,
              p.z + side.z * v.x + up.z * v.y,
            );
          }),
        );
      }
    }

    for (let i = 0; i < spine.length - 1; i++) {
      const here = base + i * ring;
      const ahead = here + ring;
      for (const [a, b] of section.edges) {
        this.index.push(here + a, here + b, ahead + b);
        this.index.push(here + a, ahead + b, ahead + a);
      }
    }

    if (!rail.length) return;

    // The four corner creases, running the length of the duct.
    for (let i = 0; i < rail.length - 1; i++) {
      for (let c = 0; c < rail[i].length; c++) {
        this.edges.addSegment(
          rail[i][c],
          rail[i + 1][c],
          spine[i],
          spine[i + 1],
          reveals[i],
          reveals[i + 1],
        );
      }
    }

    // The cross-section outline at each open end, so a run reads as a duct
    // with a mouth rather than a bar that stops. Deliberately only at the
    // ends: a ring at every joint along the run is what a close-up Revit view
    // shows, but at this zoom a duct is a few pixels wide and the rings close
    // up into a solid black line.
    for (const i of [0, rail.length - 1]) {
      const loop = rail[i];
      for (let c = 0; c < loop.length; c++) {
        this.edges.addSegment(
          loop[c],
          loop[(c + 1) % loop.length],
          spine[i],
          spine[i],
          reveals[i],
          reveals[i],
        );
      }
    }
  }

  /**
   * A box, which grows along its longest axis out of its own centreline, the
   * same way a swept run grows out of its spine.
   *
   * `revealFor` is asked per vertex rather than once per box. One reveal for
   * the whole box means a forty-unit column snaps into existence in a single
   * frame, and since its centre is halfway up the building that frame lands
   * halfway through the build: the entire structural frame appears at once,
   * out of nowhere, in the middle of the animation.
   */
  addBox(
    center: Point,
    size: Point,
    drawEdges: boolean,
    revealFor: (spine: Vector3, t: number) => number,
  ) {
    // Longest axis wins: a column grows upward, a slab band grows along its
    // length, and a roughly cubic plant box grows whichever way it is widest,
    // where the direction barely reads anyway.
    const axis =
      size[0] >= size[1] && size[0] >= size[2] ? 0 : size[1] >= size[2] ? 1 : 2;
    const length = Math.max(1e-6, size[axis]);
    const start = center[axis] - length / 2;

    // Subdivided along that axis, because inflating out of the centreline is a
    // vertex operation. With a single segment a forty-unit column has two rows
    // of vertices, so mid-build it interpolates from full width at the bottom
    // to nothing at the top and reads as a spike rather than a column.
    const steps = MathUtils.clamp(Math.round(length / BOX_SEGMENT), 1, 40);
    const divisions: [number, number, number] = [1, 1, 1];
    divisions[axis] = steps;

    const geometry = new BoxGeometry(
      size[0],
      size[1],
      size[2],
      divisions[0],
      divisions[1],
      divisions[2],
    );
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    const indices = geometry.getIndex();
    const base = this.position.length / 3;

    const spine = new Vector3();

    /** Sets `spine` for a world point and returns when that point appears. */
    const place = (x: number, y: number, z: number) => {
      const along = axis === 0 ? x : axis === 1 ? y : z;
      spine.set(center[0], center[1], center[2]);
      spine.setComponent(axis, along);
      return revealFor(spine, (along - start) / length);
    };

    for (let i = 0; i < position.count; i++) {
      const lx = position.getX(i);
      const ly = position.getY(i);
      const lz = position.getZ(i);
      const x = lx + center[0];
      const y = ly + center[1];
      const z = lz + center[2];
      const reveal = place(x, y, z);

      this.position.push(x, y, z);
      const nx = normal.getX(i);
      const ny = normal.getY(i);
      const nz = normal.getZ(i);
      this.normal.push(nx, ny, nz);

      // Planar projection onto whichever axis the face points along, in box
      // local space. BoxGeometry's own UVs are 0..1 per face, which would
      // stretch the texture to fit whatever size the box happens to be, and
      // they no longer come four to a face once it is subdivided.
      const ax = Math.abs(nx);
      const ay = Math.abs(ny);
      const az = Math.abs(nz);
      if (ax >= ay && ax >= az) this.uv.push(lz, ly);
      else if (ay >= az) this.uv.push(lx, lz);
      else this.uv.push(lx, ly);

      this.spine.push(spine.x, spine.y, spine.z);
      this.reveal.push(reveal);
    }
    if (indices) {
      for (let i = 0; i < indices.count; i++) {
        this.index.push(base + indices.getX(i));
      }
    }
    geometry.dispose();

    if (!drawEdges) return;

    // All twelve edges of the box, so equipment reads as a drawn object
    // rather than a flat-shaded block.
    const hx = size[0] / 2;
    const hy = size[1] / 2;
    const hz = size[2] / 2;
    const corner = (sx: number, sy: number, sz: number) =>
      new Vector3(center[0] + sx * hx, center[1] + sy * hy, center[2] + sz * hz);

    const edge = (a: Vector3, b: Vector3) => {
      const aReveal = place(a.x, a.y, a.z);
      const aSpine = spine.clone();
      const bReveal = place(b.x, b.y, b.z);
      this.edges.addSegment(a, b, aSpine, spine.clone(), aReveal, bReveal);
    };

    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) edge(corner(-1, sy, sz), corner(1, sy, sz));
    }
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) edge(corner(sx, -1, sz), corner(sx, 1, sz));
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) edge(corner(sx, sy, -1), corner(sx, sy, 1));
    }
  }

  build(): BufferGeometry {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(this.position, 3));
    geometry.setAttribute("normal", new Float32BufferAttribute(this.normal, 3));
    geometry.setAttribute("uv", new Float32BufferAttribute(this.uv, 2));
    geometry.setAttribute("aSpine", new Float32BufferAttribute(this.spine, 3));
    geometry.setAttribute("aReveal", new Float32BufferAttribute(this.reveal, 1));
    geometry.setIndex(this.index);
    geometry.computeBoundingSphere();
    return geometry;
  }
}

/**
 * Accumulates the black line work that sits on the surface of the solids.
 *
 * Every vertex carries the same `aSpine` and `aReveal` as the surface it
 * belongs to, so the lines inflate and appear in lockstep with it rather than
 * hanging in the air waiting for their duct to arrive.
 */
class EdgeBuilder {
  private readonly position: number[] = [];
  private readonly spine: number[] = [];
  private readonly reveal: number[] = [];

  get isEmpty() {
    return this.position.length === 0;
  }

  addSegment(
    a: Vector3,
    b: Vector3,
    aSpine: Vector3,
    bSpine: Vector3,
    aReveal: number,
    bReveal: number,
  ) {
    this.position.push(a.x, a.y, a.z, b.x, b.y, b.z);
    this.spine.push(aSpine.x, aSpine.y, aSpine.z, bSpine.x, bSpine.y, bSpine.z);
    this.reveal.push(aReveal, bReveal);
  }

  build(): BufferGeometry {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(this.position, 3));
    geometry.setAttribute("aSpine", new Float32BufferAttribute(this.spine, 3));
    geometry.setAttribute("aReveal", new Float32BufferAttribute(this.reveal, 1));
    geometry.computeBoundingSphere();
    return geometry;
  }
}

/** Accumulates centrelines as one LineSegments geometry per system. */
class WireBuilder {
  private readonly position: number[] = [];
  private readonly reveal: number[] = [];

  get isEmpty() {
    return this.position.length === 0;
  }

  addPolyline(spine: Vector3[], reveals: number[]) {
    for (let i = 0; i < spine.length - 1; i++) {
      const a = spine[i];
      const b = spine[i + 1];
      this.position.push(a.x, a.y, a.z, b.x, b.y, b.z);
      this.reveal.push(reveals[i], reveals[i + 1]);
    }
  }

  build(): BufferGeometry {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(this.position, 3));
    geometry.setAttribute("aReveal", new Float32BufferAttribute(this.reveal, 1));
    geometry.computeBoundingSphere();
    return geometry;
  }
}

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const WIRE_VERTEX = /* glsl */ `
  attribute float aReveal;
  varying float vReveal;
  void main() {
    vReveal = aReveal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

/**
 * The draw-in line work.
 *
 * On a dark background it is emissive and additively blended, so overlapping
 * runs pile into a brighter core the way a real glow does. On a light one that
 * would be invisible, so the same maths drives alpha instead and the line is
 * drafted on in its own colour. Either way a head races along the line as it
 * draws, then the whole line fades once the solid catches up and swallows it.
 */
const WIRE_FRAGMENT = (glow: boolean) => /* glsl */ `
  uniform vec3 uColor;
  uniform float uWire;
  uniform float uFill;
  uniform float uBase;
  uniform float uHead;
  uniform float uSwallow;
  varying float vReveal;

  void main() {
    float drawn = uWire - vReveal;
    if ( drawn < 0.0 ) discard;

    float head = exp( -drawn * 30.0 ) * uHead;
    float swallowed = smoothstep( vReveal - 0.01, vReveal + 0.07, uFill );
    float intensity = ( uBase + head ) * ( 1.0 - uSwallow * swallowed );

    ${
      glow
        ? `gl_FragColor = vec4( uColor * intensity, 1.0 );`
        : `gl_FragColor = vec4( uColor, clamp( intensity, 0.0, 1.0 ) );`
    }
  }
`;

interface RevealUniforms {
  wire: { value: number };
  fill: { value: number };
}

/** A colour uniform shared by every material that draws in that colour. */
interface ColorUniform {
  value: Color;
}

function makeWireMaterial(
  color: Color,
  uniforms: RevealUniforms,
  base: number,
  head: number,
  swallow: number,
  glow: boolean,
) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: color },
      uWire: uniforms.wire,
      uFill: uniforms.fill,
      uBase: { value: base },
      uHead: { value: head },
      uSwallow: { value: swallow },
    },
    vertexShader: WIRE_VERTEX,
    fragmentShader: WIRE_FRAGMENT(glow),
    transparent: true,
    depthWrite: false,
    blending: glow ? AdditiveBlending : NormalBlending,
  });
}

/**
 * The black line Revit puts along every surface boundary.
 *
 * It rides on the solid, so it takes the same spine-to-surface inflation, and
 * it is nudged a hair towards the camera in clip space. Without that nudge it
 * sits exactly on the face it outlines and z-fights it into a dashed mess.
 * polygonOffset is the usual cure but it does not apply to line primitives.
 *
 * The size of the nudge only means anything relative to the camera's clip
 * range, which is why placeCamera keeps that range wrapped tight around the
 * model. At the ranges used here this is worth well under a tenth of a unit.
 */
const EDGE_VERTEX = /* glsl */ `
  attribute float aReveal;
  attribute vec3 aSpine;
  uniform float uFill;
  varying float vReveal;

  void main() {
    float grow = smoothstep( aReveal, aReveal + 0.05, uFill );
    vReveal = aReveal;
    vec4 clip = projectionMatrix * modelViewMatrix * vec4( mix( aSpine, position, grow ), 1.0 );
    clip.z -= 0.0016 * clip.w;
    gl_Position = clip;
  }
`;

const EDGE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uFill;
  varying float vReveal;

  void main() {
    if ( vReveal > uFill ) discard;
    gl_FragColor = vec4( uColor, uOpacity );
  }
`;

function makeEdgeMaterial(
  edgeUniform: ColorUniform,
  opacity: number,
  uniforms: RevealUniforms,
) {
  return new ShaderMaterial({
    uniforms: {
      uColor: edgeUniform,
      uOpacity: { value: opacity },
      uFill: uniforms.fill,
    },
    vertexShader: EDGE_VERTEX,
    fragmentShader: EDGE_FRAGMENT,
    transparent: true,
    depthWrite: false,
  });
}
/**
 * Surface roughness per system, 0 being a mirror and 1 being chalk.
 *
 * Ductwork is sheet metal in a coordination view, not a showroom. It wants to
 * read as flat system colour with just enough shading to tell one face from
 * another, so it sits near the matte end. Pipe, conduit and equipment keep a
 * little more sheen, partly because painted steel really does, and partly so
 * they do not flatten into the ducts they cross.
 */
const ROUGHNESS: Record<SystemId, number> = {
  supplyAir: 0.92,
  returnAir: 0.92,
  exhaustAir: 0.92,
  domesticWater: 0.7,
  sanitary: 0.7,
  fireProtection: 0.7,
  electrical: 0.68,
  equipment: 0.82,
  structure: 0.95,
};

/**
 * Which systems get a darkened silhouette instead of drawn edge lines.
 *
 * Round pipe has no creases to draw a line along, so its outline comes from
 * darkening the fragments that face away from the camera. Ductwork, equipment
 * and structure must not use it: they are made of flat faces, and on a flat
 * face the facing ratio is constant, so this would darken whole panels rather
 * than their borders.
 */
const SILHOUETTE: Partial<Record<SystemId, boolean>> = {
  domesticWater: true,
  sanitary: true,
  fireProtection: true,
  electrical: true,
};

/**
 * Which surface each system is made of, and how large its texture sits on it.
 *
 * `tile` is in model units: one tile of the map covers that much of the real
 * object. For duct it is set so the four ribs in the map land roughly every
 * half unit, which is about twice life size, because at life size they would
 * be well under a pixel.
 */
const SURFACE: Record<
  SystemId,
  { family: SurfaceFamily; tile: number; relief: number }
> = {
  supplyAir: { family: "duct", tile: 2, relief: 0.55 },
  returnAir: { family: "duct", tile: 2, relief: 0.55 },
  exhaustAir: { family: "duct", tile: 2, relief: 0.55 },
  domesticWater: { family: "pipe", tile: 1.4, relief: 0.45 },
  sanitary: { family: "pipe", tile: 1.6, relief: 0.45 },
  fireProtection: { family: "pipe", tile: 1.2, relief: 0.4 },
  electrical: { family: "pipe", tile: 1, relief: 0.4 },
  // Three units, against two panel divisions per tile, puts a seam every 1.5
  // units. That is matched to the boxes: a VAV is 1.5 across and reads as one
  // panel, a rooftop air handler is 6.6 and reads as four. The relief is
  // pushed harder than anywhere else because a recessed seam has to survive on
  // a box that is only twenty-odd pixels wide.
  equipment: { family: "casing", tile: 3, relief: 0.95 },
  structure: { family: "concrete", tile: 5, relief: 0.5 },
};

/**
 * How metallic each system reads.
 *
 * Kept low everywhere on purpose. There is an environment map to reflect now,
 * so even a little metalness gives a real sheen rather than the blown-out
 * specular hit that made an earlier pass look like plastic. Galvanised duct
 * really is quite reflective, but paired with a roughness near 0.9 this stays
 * a broad soft sheen and never a hotspot.
 */
const METALNESS: Record<SystemId, number> = {
  supplyAir: 0.14,
  returnAir: 0.14,
  exhaustAir: 0.14,
  domesticWater: 0.18,
  sanitary: 0.1,
  fireProtection: 0.16,
  electrical: 0.2,
  equipment: 0.12,
  structure: 0, // concrete
};

/**
 * Standard PBR, patched twice over.
 *
 * First, each vertex starts collapsed onto its centreline and inflates outward
 * when the fill sweep reaches it. Scaling about the spine is a radial scale,
 * so the surface normals stay correct throughout.
 *
 * Second, on round sections the grazing fragments are pulled towards the edge
 * colour, which stands in for the outline that a pipe has no crease to carry.
 */
function makeSolidMaterial(
  color: Color,
  roughness: number,
  metalness: number,
  maps: SurfaceMaps,
  tile: number,
  relief: number,
  edgeUniform: ColorUniform,
  silhouette: boolean,
  uniforms: RevealUniforms,
) {
  // The UVs are baked in model units, so repeat is what turns them into
  // tiles. Textures are shared between systems, so each material clones the
  // ones it uses rather than reaching in and changing everyone's scale.
  const normalMap = maps.normal.clone();
  const roughnessMap = maps.roughness.clone();
  for (const map of [normalMap, roughnessMap]) {
    map.repeat.set(1 / tile, 1 / tile);
    map.needsUpdate = true;
  }

  const material = new MeshStandardMaterial({
    color,
    roughness,
    metalness,
    normalMap,
    // Per system. On a duct the relief only has to catch the key light along
    // a rib, and pushing it further turns eleven pixels of duct into a relief
    // sculpture. On an equipment casing the panel seams are the whole point,
    // so they get nearly twice as much.
    normalScale: new Vector2(relief, relief),
    // Multiplies the roughness above rather than replacing it, so the per
    // system values still set the overall level and the map only varies it.
    roughnessMap,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFill = uniforms.fill;
    // The shared uniform object, not a copy, so changing the edge colour on
    // the control panel reaches every material at once.
    if (silhouette) shader.uniforms.uEdge = edgeUniform;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `
          #include <common>
          attribute float aReveal;
          attribute vec3 aSpine;
          uniform float uFill;
          varying float vReveal;
        `,
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `
          vec3 transformed = vec3( position );
          float grow = smoothstep( aReveal, aReveal + 0.05, uFill );
          transformed = mix( aSpine, transformed, grow );
          vReveal = aReveal;
        `,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `
          #include <common>
          uniform float uFill;
          varying float vReveal;
          ${silhouette ? "uniform vec3 uEdge;" : ""}
        `,
      )
      .replace(
        "#include <clipping_planes_fragment>",
        /* glsl */ `
          #include <clipping_planes_fragment>
          if ( vReveal > uFill ) discard;
        `,
      );

    if (silhouette) {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        /* glsl */ `
          float facing = abs( dot( normal, normalize( vViewPosition ) ) );
          outgoingLight = mix( uEdge, outgoingLight, smoothstep( 0.0, 0.5, facing ) );
          #include <opaque_fragment>
        `,
      );
    }
  };

  // Without this every patched material could collide with an unpatched one in
  // the program cache and lose the injected code.
  material.customProgramCacheKey = () => `mep-reveal-${silhouette ? "sil" : "flat"}`;

  return { material, maps: [normalMap, roughnessMap] };
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

/**
 * Returns null when WebGL is unavailable, so the caller can leave its static
 * fallback in place rather than showing an empty canvas.
 */
export function mountMepModel(canvas: HTMLCanvasElement): MepModel | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      // The canvas composites over whatever the parent paints, so the model
      // sits on the sheet rather than on a rectangle of its own.
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- scene ---------------------------------------------------------------

  /**
   * The parent's background colour.
   *
   * Still read even though the canvas no longer paints it, for two reasons:
   * it decides which way round the palette is, below, and the fog has to fade
   * distant geometry towards whatever is really behind the canvas, or the
   * depth cue shows up as a coloured haze instead of disappearing.
   */
  const background = themeColor(canvas, "--background", 0xf1ece4);
  const fogColor = background.clone();
  const foreground = themeColor(canvas, "--foreground", 0x2a2420);
  /** Shared by every edge line and every silhouette, so one write repaints all. */
  const edgeUniform: ColorUniform = { value: new Color(EDGE_COLOR) };

  /**
   * Which way round the palette is, taken from the theme rather than assumed.
   *
   * It decides two things that cannot both be right at once: whether the
   * draw-in line work glows additively or is drafted on in its own colour, and
   * whether bloom runs at all. Bloom over a light background would blow the
   * background itself out, since the paper is far brighter than any threshold
   * worth setting for the model.
   */
  const onDark =
    0.2126 * background.r + 0.7152 * background.g + 0.0722 * background.b < 0.12;

  // Tone mapping earns its keep when bloom is pushing values past 1. Without
  // bloom it only greys down a palette that was chosen deliberately, so the
  // light path renders the colours as specified.
  renderer.toneMapping = onDark ? NeutralToneMapping : NoToneMapping;

  /** The tuned rig for whichever palette this canvas has landed on. */
  const lit = DEFAULT_LIGHTING[onDark ? "dark" : "light"];
  renderer.toneMappingExposure = lit.exposure;

  const scene = new Scene();
  // Transparent, so the parent's background comes through. The whole
  // post-processing chain preserves alpha: GTAOPass blends with DstAlphaFactor
  // and OutputPass only rewrites .rgb, so nothing downstream fills it back in.
  scene.background = null;
  renderer.setClearColor(0x000000, 0);

  const model = new Group(); // holds the geometry, offset so its centre is at 0
  const pivot = new Group(); // orbits
  pivot.add(model);
  scene.add(pivot);

  // Broad, even and colourless, which is how a shaded coordination view is
  // lit. A strong key with coloured fill reads as a product render and fights
  // the system colours for attention.
  const skyColor = onDark ? foreground : new Color(0xffffff);
  const groundColor = onDark ? background : new Color(0xb9bcc0);

  /**
   * Image-based ambient.
   *
   * A hemisphere light is only two colours lerped by which way a surface
   * points, so every face with the same normal gets identical light no matter
   * where it sits. That is what makes a dense model look like flat cutouts.
   * Prefiltering a small room into an environment map gives every surface a
   * direction-dependent ambient with real falloff, which is most of what was
   * missing here. It is generated once and costs a cubemap lookup per pixel.
   */
  const pmrem = new PMREMGenerator(renderer);
  const roomEnvironment = new RoomEnvironment();
  const environment = pmrem.fromScene(roomEnvironment, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = lit.environment;
  roomEnvironment.dispose();
  pmrem.dispose();

  // A hemisphere still earns its place on top of the environment: it is what
  // keeps undersides tinted towards the ground rather than going flat black.
  const hemisphere = new HemisphereLight(skyColor, groundColor, lit.ambient);
  scene.add(hemisphere);

  // Three-point rig. The key models the form and the fill keeps the shadow
  // side from going dead. The rim is near zero on the dark palette: it was
  // there to separate the model from the background, and the far stronger key
  // and ambient now do that on their own.
  const key = new DirectionalLight(skyColor, lit.key);
  key.position.set(16, 26, 14);
  scene.add(key);

  const fill = new DirectionalLight(skyColor, lit.fill);
  fill.position.set(-20, 6, 12);
  scene.add(fill);

  const rim = new DirectionalLight(skyColor, lit.rim);
  rim.position.set(-10, 14, -22);
  scene.add(rim);

  const under = new DirectionalLight(groundColor, 0.2);
  under.position.set(0, -14, 6);
  scene.add(under);

  // --- surfaces ------------------------------------------------------------

  const surfaces = buildSurfaces(renderer);

  /**
   * The concrete grey is picked to sit behind the services on paper. On the
   * dark palette that same grey is the brightest thing in the frame, the
   * services vanish behind it, and it is bright enough to trip the bloom
   * threshold and halo. Take it down to where it reads as mass again.
   */
  const shadeFor = (system: SystemId, hex: number) => {
    const color = new Color(hex);
    if (system === "structure" && onDark) color.multiplyScalar(0.4);
    return color;
  };

  /** On paper the shell's own light grey is invisible, so it borrows the edge. */
  const wireColorFor = (system: SystemId, hex: number, edge: number) =>
    new Color(system === "structure" && !onDark ? edge : hex);

  // --- reveal state --------------------------------------------------------

  const shellUniforms: RevealUniforms = { wire: { value: 0 }, fill: { value: 0 } };
  const mepUniforms: RevealUniforms = { wire: { value: 0 }, fill: { value: 0 } };

  const { minY, maxY } = buildingV2.bounds;
  const span = Math.max(1e-6, maxY - minY);

  /** When a point appears: mostly its height, a little its place along the run. */
  const revealAt = (y: number, t: number, jitter: number) =>
    MathUtils.clamp(
      HEIGHT_WEIGHT * MathUtils.clamp((y - minY) / span, 0, 1) + PATH_WEIGHT * t + jitter,
      0,
      1,
    );

  // --- geometry ------------------------------------------------------------

  const solidBuilders = new Map<SystemId, SolidBuilder>();
  const edgeBuilders = new Map<SystemId, EdgeBuilder>();
  const wireBuilders = new Map<SystemId, WireBuilder>();

  /**
   * Every centreline point, kept just long enough to work out how far back the
   * camera has to sit.
   *
   * Fitting a bounding box or sphere is far simpler but wastes a lot of frame
   * here. The tall part of this model is the tower, which sits well inside the
   * podium footprint, so a box fit pushes the camera back as though the podium
   * corners were also forty units in the air. Sampling the real geometry gives
   * the real trade between how high a point is and how far out in plan it is.
   */
  let samples: number[] = [];
  const sample = (x: number, y: number, z: number) => samples.push(x, y, z);

  const edgeFor = (system: SystemId) => {
    let builder = edgeBuilders.get(system);
    if (!builder) edgeBuilders.set(system, (builder = new EdgeBuilder()));
    return builder;
  };
  const solidFor = (system: SystemId) => {
    let builder = solidBuilders.get(system);
    if (!builder) solidBuilders.set(system, (builder = new SolidBuilder(edgeFor(system))));
    return builder;
  };
  const wireFor = (system: SystemId) => {
    let builder = wireBuilders.get(system);
    if (!builder) wireBuilders.set(system, (builder = new WireBuilder()));
    return builder;
  };

  buildingV2.runs.forEach((run: Run, i) => {
    const spine = spineFor(run.points, SPINE_SPACING);
    if (spine.length < 2) return;

    // A deterministic nudge per run, so identical floors do not snap into
    // existence in perfect lockstep.
    const jitter = (((i * 2654435761) % 1000) / 1000 - 0.5) * 0.024;
    const along = progressAlong(spine);
    const reveals = spine.map((p, k) => revealAt(p.y, along[k], jitter));
    for (const p of spine) sample(p.x, p.y, p.z);

    solidFor(run.system).addSweep(
      spine,
      sectionFor(PROFILES[run.system], run.scale ?? 1),
      reveals,
      sectionSize(PROFILES[run.system], run.scale ?? 1) >= EDGE_MIN_SIZE,
    );
    wireFor(run.system).addPolyline(spine, reveals);
  });

  for (const box of buildingV2.equipment) {
    // Boxes appear with the run they hang off, a beat behind it. Only the
    // plant is big enough to carry edges; a VAV box at this zoom is not.
    solidFor("equipment").addBox(
      box.center,
      box.size,
      Math.min(box.size[0], box.size[1], box.size[2]) >= EDGE_MIN_SIZE,
      (spine, t) => revealAt(spine.y, t, 0.012),
    );
    for (const sx of [-0.5, 0.5]) {
      for (const sy of [-0.5, 0.5]) {
        for (const sz of [-0.5, 0.5]) {
          sample(
            box.center[0] + sx * box.size[0],
            box.center[1] + sy * box.size[1],
            box.center[2] + sz * box.size[2],
          );
        }
      }
    }
  }

  for (const wire of buildingV2.structure) {
    const spine = densify(toVectors(wire.points), WIRE_SPACING);
    if (spine.length < 2) continue;
    const along = progressAlong(spine);
    for (const p of spine) sample(p.x, p.y, p.z);
    wireFor("structure").addPolyline(
      spine,
      spine.map((p, k) => revealAt(p.y, along[k], 0)),
    );
  }

  // Slabs, columns and cores as grey mass. Line work alone was what gave the
  // model its hologram look; a coordination view puts the architecture in as
  // dumb solid geometry and lets the services carry all of the colour.
  //
  // No drawn edges on any of it: the shell already has its own line work in
  // buildingV2.structure, which traces the same slabs and columns far more
  // sparsely than twelve box edges per element would.
  for (const box of buildingV2.structureSolids) {
    solidFor("structure").addBox(box.center, box.size, false, (spine, t) =>
      revealAt(spine.y, t, 0),
    );
    for (const sx of [-0.5, 0.5]) {
      for (const sy of [-0.5, 0.5]) {
        for (const sz of [-0.5, 0.5]) {
          sample(
            box.center[0] + sx * box.size[0],
            box.center[1] + sy * box.size[1],
            box.center[2] + sz * box.size[2],
          );
        }
      }
    }
  }

  // --- meshes --------------------------------------------------------------

  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  /** Per-material texture clones. Each one owns GPU memory of its own. */
  const clonedMaps: Texture[] = [];

  for (const [system, builder] of solidBuilders) {
    if (builder.isEmpty) continue;
    const geometry = builder.build();
    const surface = SURFACE[system];
    const built = makeSolidMaterial(
      shadeFor(system, SYSTEMS[system].color),
      ROUGHNESS[system],
      METALNESS[system],
      surfaces[surface.family],
      surface.tile,
      surface.relief,
      edgeUniform,
      SILHOUETTE[system] === true,
      system === "structure" ? shellUniforms : mepUniforms,
    );
    geometries.push(geometry);
    materials.push(built.material);
    clonedMaps.push(...built.maps);
    model.add(new Mesh(geometry, built.material));
  }

  for (const [system, builder] of edgeBuilders) {
    if (builder.isEmpty) continue;
    const geometry = builder.build();
    const material = makeEdgeMaterial(
      edgeUniform,
      system === "structure" ? 0.45 : 0.75,
      system === "structure" ? shellUniforms : mepUniforms,
    );
    geometries.push(geometry);
    materials.push(material);
    const lines = new LineSegments(geometry, material);
    lines.renderOrder = 2; // after the surfaces they outline
    model.add(lines);
  }

  for (const [system, builder] of wireBuilders) {
    if (builder.isEmpty) continue;
    const geometry = builder.build();
    const shell = system === "structure";
    const material = makeWireMaterial(
      wireColorFor(system, SYSTEMS[system].color, EDGE_COLOR),
      shell ? shellUniforms : mepUniforms,
      onDark ? (shell ? 0.16 : 0.34) : shell ? 0.34 : 0.5,
      onDark ? (shell ? 0.9 : 2.1) : shell ? 0.4 : 0.6,
      // The shell's line work is the permanent slab and column linework of the
      // drawing, not a construction line, so it barely dims once its own grey
      // mass fills in behind it. A service's centreline is genuinely replaced
      // by the duct that grows over it, so that one mostly goes.
      shell ? 0.18 : 0.62,
      onDark,
    );
    geometries.push(geometry);
    materials.push(material);
    const lines = new LineSegments(geometry, material);
    lines.renderOrder = 1; // after the opaque solids, so blending is correct
    model.add(lines);
  }

  // Centre the model inside the pivot so it orbits about its own middle.
  const box = new Box3();
  for (const geometry of geometries) {
    geometry.computeBoundingBox();
    if (geometry.boundingBox) box.union(geometry.boundingBox);
  }
  const centre = box.getCenter(new Vector3());
  model.position.copy(centre).negate();

  /**
   * The model's silhouette: the furthest it reaches out in plan, at each of a
   * few dozen heights.
   *
   * The camera fit needs both numbers together. Something high up and
   * something far out in plan each need room, but what actually decides the
   * distance is whichever is worst in combination, and on this model that is
   * the corner of the podium rather than the top of the tower.
   */
  const silhouette: { readonly h: number; readonly r: number }[] = [];
  let modelRadius = 1;
  {
    const BANDS = 48;
    let hMin = Infinity;
    let hMax = -Infinity;
    for (let i = 1; i < samples.length; i += 3) {
      const h = samples[i] - centre.y;
      if (h < hMin) hMin = h;
      if (h > hMax) hMax = h;
    }
    const step = (hMax - hMin) / BANDS || 1;
    const reach = new Float64Array(BANDS);
    for (let i = 0; i < samples.length; i += 3) {
      const h = samples[i + 1] - centre.y;
      const r = Math.hypot(samples[i] - centre.x, samples[i + 2] - centre.z);
      const band = MathUtils.clamp(Math.floor((h - hMin) / step), 0, BANDS - 1);
      if (r > reach[band]) reach[band] = r;
    }
    for (let band = 0; band < BANDS; band++) {
      if (reach[band] === 0) continue;
      const r = reach[band] + SURFACE_MARGIN;
      // Both edges of the band, since that reach applies across all of it.
      const lo = hMin + band * step - SURFACE_MARGIN;
      const hi = hMin + (band + 1) * step + SURFACE_MARGIN;
      silhouette.push({ h: lo, r }, { h: hi, r });
      modelRadius = Math.max(modelRadius, Math.hypot(r, lo), Math.hypot(r, hi));
    }
    samples = []; // a few hundred KB that nothing needs after this point
  }
  if (silhouette.length === 0) {
    // Cannot happen with the current geometry, but an empty silhouette would
    // park the camera inside the model rather than fail loudly.
    const extent = box.getSize(new Vector3());
    silhouette.push({
      h: extent.y / 2 + SURFACE_MARGIN,
      r: Math.hypot(extent.x, extent.z) / 2 + SURFACE_MARGIN,
    });
    modelRadius = Math.hypot(silhouette[0].h, silhouette[0].r);
  }

  // Range is set per frame in placeCamera, once the camera distance is known.
  const fog = new Fog(fogColor, 1, 2);
  scene.fog = fog;

  // --- camera --------------------------------------------------------------

  const camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.5, 600);  // padding is margin on top of an exact fit. 1.0 would put the outermost
  // point of the model exactly on the edge of the frame at some point in the
  // turn, which looks like a mistake even though it is not one.
  const START = { azimuth: -0.12, elevation: 0.06, padding: 1.85 };
  const REST = { azimuth: 0.66, elevation: 0.33, padding: 1.04 };
  const view = { ...START };

  // --- post processing -----------------------------------------------------

  /**
   * Ambient occlusion is the piece that was actually missing. No number of
   * lights makes a duct look like it is resting against a slab; what does is
   * the darkening in the crease where the two meet, and in a model this dense
   * that crease is most of what you are looking at.
   *
   * Bloom only makes sense on the dark palette. Over a light background it
   * would blow the background itself out, because paper is brighter than any
   * threshold worth setting for the model.
   */
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const aoPass = new GTAOPass(scene, camera, 1, 1);
  const bloomPass = onDark
    ? new UnrealBloomPass(new Vector2(256, 256), BLOOM_DRAFTING, 0.55, 0.42)
    : null;
  const outputPass = new OutputPass();

  aoPass.output = GTAOPass.OUTPUT.Default;
  // Starts off entirely. See the timeline: the pass builds its depth and
  // normal buffers with scene.overrideMaterial, which bypasses the vertex
  // shader that inflates each run out of its centreline. During the build the
  // occlusion would therefore be computed from the finished building while a
  // half-built one is on screen, and the result is shadows cast by ductwork
  // that has not appeared yet.
  aoPass.blendIntensity = 0;
  aoPass.updateGtaoMaterial({
    // In model units, so a little over half a duct width. Wider than this and
    // the whole model just gets muddier rather than better defined.
    radius: 1.1,
    distanceExponent: 1,
    thickness: 1,
    scale: 1,
    samples: 16,
    screenSpaceRadius: false,
  });

  composer.addPass(renderPass);
  composer.addPass(aoPass);
  if (bloomPass) composer.addPass(bloomPass);
  composer.addPass(outputPass);

  // --- sizing --------------------------------------------------------------

  function layout() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // A hidden or zero-height canvas would produce a NaN aspect ratio.
    if (!w || !h) return false;

    // Bloom and AO both run full-frame passes, so pixel ratio is the single
    // biggest cost here. Cap it, and cap it harder on large canvases.
    const budget = w * h > 1_400_000 ? 1.25 : 1.6;
    const ratio = Math.min(window.devicePixelRatio || 1, budget);

    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(ratio);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    return true;
  }

  function placeCamera() {
    const vFov = MathUtils.degToRad(camera.fov);
    const tanV = Math.tan(vFov / 2);
    const tanH = tanV * camera.aspect;
    const { azimuth, elevation } = view;
    const cosE = Math.cos(elevation);
    const sinE = Math.sin(elevation);

    // The smallest distance at which the whole silhouette stays inside all
    // four frame edges, at every angle of the turn.
    //
    // A point `h` above the centre and `r` out in plan comes `r*cos + h*sin`
    // nearer the camera at the worst moment of the turn, and sits
    // `h*cos - r*sin` off the view axis. Tilting the camera down therefore
    // pulls the top of the model closer and swings the bottom of it further
    // out of frame, which is why elevation has to be part of this rather than
    // a fixed allowance. Fitting against whichever edge is tighter is what
    // makes a portrait viewport pull back instead of cropping.
    let need = 1;
    for (const { h, r } of silhouette) {
      const nearer = r * cosE + h * sinE;
      const offAxis = Math.abs(h * cosE - r * sinE);
      const forHeight = offAxis / tanV + nearer;
      const forWidth = r / tanH + nearer;
      if (forHeight > need) need = forHeight;
      if (forWidth > need) need = forWidth;
    }

    const distance = need * view.padding;

    camera.position.set(
      distance * cosE * Math.sin(azimuth),
      distance * Math.sin(elevation),
      distance * cosE * Math.cos(azimuth),
    );
    camera.lookAt(0, 0, 0);

    // Wrap the clip planes tightly around the model, every frame.
    //
    // This is not an optimisation. A 0.5 to 600 range spreads the depth buffer
    // so thinly at a hundred-odd units out that one world unit is worth about
    // 0.00004 in clip space, which makes the edge shader's hairline nudge
    // towards the camera worth tens of units instead, and the black line work
    // then floats in front of the whole building. Tight planes give roughly
    // 0.017 per unit, where a hairline is actually a hairline.
    camera.near = Math.max(0.5, distance - modelRadius * 1.15);
    camera.far = distance + modelRadius * 2.2;
    camera.updateProjectionMatrix();

    // Tie the fog band to the camera so the depth cue stays gentle at any
    // distance. Fixed values would bury the model on a narrow viewport.
    fog.near = distance - modelRadius * 0.35;
    fog.far = distance + modelRadius * 3.2;
  }

  // --- build timeline ------------------------------------------------------

  const orbit = { value: 0 }; // ramps 0 to 1 so the turn eases in, not snaps
  // Assigned once, below. `let` only because buildTimeline() closes over
  // state declared further down, so it cannot be called at this point.
  let timeline = gsap.timeline({ paused: true });

  /**
   * Puts every animated value back to its start.
   *
   * GSAP records a tween's from-value the first time it renders, so a timeline
   * rebuilt while the model is half-built would capture the half-built state
   * as its origin and never return to zero on replay.
   */
  /**
   * Builds the whole sequence from DEFAULT_TIMING.
   *
   * Every stage is a pair of fractions of the total run rather than seconds,
   * so the running order reads at a glance and retiming one stage does not
   * quietly change what the others mean.
   */
  function buildTimeline() {
    const t = DEFAULT_TIMING;
    const total = Math.max(0.5, t.build);
    const at = (stage: Stage) => stage[0] * total;
    const dur = (stage: Stage) => Math.max(0.01, (stage[1] - stage[0]) * total);

    const next = gsap.timeline({ paused: true });

    // The shell draws first and alone, so the systems have something to hang
    // on, then the glowing service centrelines, bottom to top.
    next.to(
      shellUniforms.wire,
      { value: 1, duration: dur(t.structureLines), ease: "power1.inOut" },
      at(t.structureLines),
    );
    next.to(
      mepUniforms.wire,
      { value: 1, duration: dur(t.serviceLines), ease: "power1.inOut" },
      at(t.serviceLines),
    );
    // Then the ducts and pipes inflate out of those centrelines. Keeping this
    // behind the service lines is what stops a solid appearing with no line
    // under it; the panel allows the inversion, it just does not look right.
    next.to(
      mepUniforms.fill,
      { value: 1, duration: dur(t.ducts), ease: "power1.inOut" },
      at(t.ducts),
    );
    // The grey mass climbs steadily. Linear on purpose: an eased fill reads as
    // the walls hesitating and then lunging.
    next.to(
      shellUniforms.fill,
      { value: 1, duration: dur(t.walls), ease: "none" },
      at(t.walls),
    );

    // Glow hard while the model is line work, then settle to almost nothing as
    // the solids arrive. The drafting phase earns a bit of drama; the finished
    // model is a deliverable and should not look lit from within.
    if (bloomPass) {
      next.to(
        bloomPass,
        { strength: lit.bloom, duration: total * 0.38, ease: "power2.out" },
        total * 0.42,
      );
    }
    // Contact shadows arrive last, once every run is at full size and the
    // occlusion buffers agree with what is actually on screen.
    next.to(
      aoPass,
      { blendIntensity: lit.ao, duration: total * 0.1, ease: "power2.out" },
      total * 0.9,
    );

    next.to(view, { ...REST, duration: total * 0.95, ease: "power2.inOut" }, 0);
    next.to(orbit, { value: 1, duration: total * 0.18, ease: "power1.in" }, total * 0.82);
    // Belt and braces. Every stage is already expressed against the total, so
    // this is a no-op unless one has been dragged past the end.
    next.duration(total);
    return next;
  }

  timeline = buildTimeline();

  // --- loop ----------------------------------------------------------------

  let lastFrame = 0;
  let turn = 0;

  function frame() {
    const now = performance.now();
    // A large delta after a pause would jump the rotation, so clamp it.
    const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
    lastFrame = now;
    if (!reduceMotion) turn += DEFAULT_TIMING.orbit * orbit.value * delta;

    pivot.rotation.y = turn;
    placeCamera();
    // A bloom pass at zero strength still runs its whole mip chain every
    // frame for a result that is added as nothing. Now that the tuned default
    // settles bloom at zero, that is most of the run.
    if (bloomPass) bloomPass.enabled = bloomPass.strength > 0.002;
    composer.render(delta);
  }

  // --- lifecycle -----------------------------------------------------------

  let running = false;
  let visible = false;
  let disposed = false;
  /**
   * Whether the start gate has been crossed.
   *
   * Reduced motion arms straight away: there is no build to miss, so holding
   * a still image back until the canvas is three-quarters on screen would
   * just be a blank panel for no reason.
   */
  let armed = reduceMotion;

  function start() {
    if (running || disposed || !armed || !layout()) return;
    if (reduceMotion) {
      // Nothing moves, so one frame is the whole job. Holding an animation
      // loop open would burn a GPU and a laptop battery to redraw a still.
      frame();
      return;
    }
    running = true;
    lastFrame = 0; // discard idle time so the first frame is not a jump
    renderer.setAnimationLoop(frame);
    timeline.play();
  }

  function stop() {
    running = false;
    renderer.setAnimationLoop(null);
    timeline.pause();
  }

  if (reduceMotion) {
    // Show the finished model, no build and no orbit.
    timeline.progress(1).pause();
  }

  // Only burn frames while the canvas is actually on screen. Deliberately
  // separate from the start gate below, and deliberately still at threshold 0:
  // once the build is running, scrolling the model half out of frame should
  // not freeze the orbit. Only leaving the screen entirely should.
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    },
    { threshold: 0 },
  );
  observer.observe(canvas);

  // The start gate. Fires once, then stops watching: the build is a one-off,
  // and re-arming would restart the building every time it scrolled back.
  const starter = new IntersectionObserver(
    ([entry]) => {
      if (!bigEnough(entry)) return;
      starter.disconnect();
      armed = true;
      start();
    },
    { threshold: START_STEPS },
  );
  starter.observe(canvas);

  const resizer = new ResizeObserver(() => {
    if (!layout()) return;
    // start() bails when the canvas has no size, which happens inside a
    // collapsed panel or a hidden tab. This is the retry once it measures.
    if (visible) start();
    else if (!disposed) frame();
  });
  resizer.observe(canvas);

  const onContextLost = (event: Event) => {
    event.preventDefault();
    stop();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  return {
    replay() {
      if (disposed || reduceMotion) return;
      // An explicit replay is its own trigger, so it does not wait on the gate.
      armed = true;
      turn = 0;
      orbit.value = 0;
      timeline.restart(true);
      start();
    },

    dispose() {
      if (disposed) return;
      disposed = true;

      stop();
      timeline.kill();
      observer.disconnect();
      starter.disconnect();
      resizer.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);

      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      for (const map of clonedMaps) map.dispose();
      surfaces.dispose();
      environment.dispose();
      // composer.dispose() only covers its own buffers, not the passes.
      bloomPass?.dispose();
      aoPass.dispose();
      outputPass.dispose();
      renderPass.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
