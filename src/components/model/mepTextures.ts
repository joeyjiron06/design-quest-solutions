/**
 * Procedural surface maps for the model.
 *
 * Generated rather than downloaded, deliberately. A stock sheet-metal
 * photograph would mean a licence to track for a commercial client site, a
 * megabyte or two of binary in the repo and another request on the page, and
 * it would still have to be made seamless by hand. Everything here tiles by
 * construction, costs a few milliseconds at mount and ships as nothing at all.
 *
 * The maps are deliberately exaggerated, for a measured reason. At the zoom
 * this model is viewed at, one model unit is about five screen pixels, so a
 * duct trunk is eleven pixels across and a branch is four. A real 1.5in joint
 * flange is 0.6 of a pixel: it would mipmap straight out of existence, and the
 * fine brushed grain people reach for first would sit below the pixel grid and
 * shimmer through the orbit rather than read as metal. So the features that
 * carry the look here are the low-frequency ones, panel waviness above all,
 * with joint ribs pushed to roughly twice life size so that they survive.
 */
import {
  DataTexture,
  LinearMipmapLinearFilter,
  LinearFilter,
  RGBAFormat,
  RepeatWrapping,
  UnsignedByteType,
  type Texture,
  type WebGLRenderer,
} from "three";

/** Power of two, so mipmaps are exact. 256 is plenty for this feature size. */
const SIZE = 256;

export interface SurfaceMaps {
  /** Tangent-space normals. Carries the ribs and the panel waviness. */
  readonly normal: Texture;
  /** Roughness in the green channel, which is the one Three.js samples. */
  readonly roughness: Texture;
}

/** Deterministic, so the model is byte-identical on every load. */
function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * Value noise on a wrapping lattice, so the result tiles seamlessly. The
 * lattice index wraps with a modulo rather than being clamped, which is the
 * whole trick: the right edge interpolates back into the left.
 */
function valueNoise(cells: number, rand: () => number): Float32Array {
  const lattice = new Float32Array(cells * cells);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rand();

  const out = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    const fy = (y / SIZE) * cells;
    const y0 = Math.floor(fy) % cells;
    const y1 = (y0 + 1) % cells;
    const ty = smoothstep(0, 1, fy - Math.floor(fy));

    for (let x = 0; x < SIZE; x++) {
      const fx = (x / SIZE) * cells;
      const x0 = Math.floor(fx) % cells;
      const x1 = (x0 + 1) % cells;
      const tx = smoothstep(0, 1, fx - Math.floor(fx));

      const top = lattice[y0 * cells + x0] * (1 - tx) + lattice[y0 * cells + x1] * tx;
      const bottom = lattice[y1 * cells + x0] * (1 - tx) + lattice[y1 * cells + x1] * tx;
      out[y * SIZE + x] = top * (1 - ty) + bottom * ty;
    }
  }
  return out;
}

/** Octaves of value noise, each doubling in frequency and halving in weight. */
function fractalNoise(baseCells: number, octaves: number, rand: () => number) {
  const out = new Float32Array(SIZE * SIZE);
  let cells = baseCells;
  let weight = 1;
  let total = 0;

  for (let o = 0; o < octaves; o++) {
    const layer = valueNoise(cells, rand);
    for (let i = 0; i < out.length; i++) out[i] += layer[i] * weight;
    total += weight;
    cells *= 2;
    weight *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

function configure(texture: DataTexture, anisotropy: number) {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  // Ducts are seen at grazing angles most of the time, which is exactly the
  // case trilinear filtering alone blurs into mush.
  texture.anisotropy = anisotropy;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  // No colour space conversion: these are measurements, not colours.
  texture.needsUpdate = true;
  return texture;
}

/**
 * Central differences on a wrapping height field. `strength` is how far the
 * normals tilt; the height field itself stays in 0..1 so the knob means the
 * same thing for every surface.
 */
function heightToNormal(height: Float32Array, strength: number, anisotropy: number) {
  const data = new Uint8Array(SIZE * SIZE * 4);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const left = height[y * SIZE + ((x - 1 + SIZE) % SIZE)];
      const right = height[y * SIZE + ((x + 1) % SIZE)];
      const down = height[((y - 1 + SIZE) % SIZE) * SIZE + x];
      const up = height[((y + 1) % SIZE) * SIZE + x];

      const nx = (left - right) * strength;
      const ny = (down - up) * strength;
      const length = Math.hypot(nx, ny, 1);

      const i = (y * SIZE + x) * 4;
      data[i] = ((nx / length) * 0.5 + 0.5) * 255;
      data[i + 1] = ((ny / length) * 0.5 + 0.5) * 255;
      data[i + 2] = (1 / length) * 0.5 * 255 + 127.5;
      data[i + 3] = 255;
    }
  }

  return configure(
    new DataTexture(data, SIZE, SIZE, RGBAFormat, UnsignedByteType),
    anisotropy,
  );
}

/** Roughness written to every channel, since Three.js reads only the green. */
function scalarTexture(values: Float32Array, anisotropy: number) {
  const data = new Uint8Array(SIZE * SIZE * 4);
  for (let i = 0; i < values.length; i++) {
    const v = Math.min(255, Math.max(0, values[i] * 255));
    data[i * 4] = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  return configure(
    new DataTexture(data, SIZE, SIZE, RGBAFormat, UnsignedByteType),
    anisotropy,
  );
}

interface SurfaceOptions {
  readonly seed: number;
  /**
   * Joint ribs across the run. `count` per tile, `width` as a fraction of the
   * tile and `height` in height-field units. Zero count means a plain surface.
   */
  readonly ribCount: number;
  readonly ribWidth: number;
  readonly ribHeight: number;
  /**
   * Recessed access-panel seams, on a grid in both axes. `count` divisions
   * per tile per axis. This is what makes a casing read as a bolted box
   * rather than a solid block, and it is the only equipment detail large
   * enough to survive at the size these boxes are drawn.
   */
  readonly panels: number;
  readonly seamWidth: number;
  readonly seamDepth: number;
  /** Low-frequency panel waviness. The feature that survives at any zoom. */
  readonly wave: number;
  readonly waveCells: number;
  /** High-frequency surface grain. Keep small, it is near the pixel grid. */
  readonly grain: number;
  /** Multiplier on the material's own roughness, and its swing. */
  readonly roughBase: number;
  readonly roughSwing: number;
  /** How far the normals tilt. */
  readonly relief: number;
}

/**
 * Builds a matched normal and roughness pair.
 *
 * The U axis of the texture runs along the length of a duct or pipe and the V
 * axis runs around its perimeter, which is how the UVs are laid out in the
 * sweep. That means a joint rib is a band of constant U, drawn here as a
 * vertical stripe, and it wraps the section without any seam to hide.
 */
function surfaceMaps(options: SurfaceOptions, anisotropy: number): SurfaceMaps {
  const rand = makeRandom(options.seed);
  const wave = fractalNoise(options.waveCells, 3, rand);
  // Coarse on purpose. Grain finer than this lands below the pixel grid at
  // the zoom this model is viewed at, where it stops being surface detail and
  // becomes crawling noise through the orbit.
  const grain = fractalNoise(14, 2, rand);

  const height = new Float32Array(SIZE * SIZE);
  const rough = new Float32Array(SIZE * SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = y * SIZE + x;
      const u = x / SIZE;
      const v = y / SIZE;

      // Distance to the nearest rib, measured on a circle so the tile seam
      // lands in the middle of a rib rather than cutting one in half.
      let rib = 0;
      if (options.ribCount > 0) {
        const phase = u * options.ribCount;
        const toRib = Math.abs(phase - Math.round(phase)) / options.ribCount;
        rib = 1 - smoothstep(0, options.ribWidth, toRib);
      }

      // Panel seams run on both axes, so the same wrapping trick is applied
      // twice and the nearer of the two wins. A seam therefore continues
      // straight through a corner instead of stopping at it.
      let seam = 0;
      if (options.panels > 0) {
        const pu = u * options.panels;
        const pv = v * options.panels;
        const toU = Math.abs(pu - Math.round(pu)) / options.panels;
        const toV = Math.abs(pv - Math.round(pv)) / options.panels;
        seam = 1 - smoothstep(0, options.seamWidth, Math.min(toU, toV));
      }

      height[i] =
        rib * options.ribHeight -
        seam * options.seamDepth +
        (wave[i] - 0.5) * options.wave +
        (grain[i] - 0.5) * options.grain;

      // Worked metal at a fold is burnished slightly smoother than the panel,
      // and the panel itself is never uniform. Grain is weighted harder here
      // than in the height field: roughness variation survives minification
      // as a softening, where normal variation survives it as noise.
      // A seam is the opposite of a fold: it collects dirt and sits rougher.
      rough[i] =
        options.roughBase +
        (grain[i] - 0.5) * options.roughSwing +
        (wave[i] - 0.5) * options.roughSwing * 0.6 -
        rib * options.roughSwing * 1.4 +
        seam * options.roughSwing * 1.2;
    }
  }

  return {
    normal: heightToNormal(height, options.relief, anisotropy),
    roughness: scalarTexture(rough, anisotropy),
  };
}

export interface ModelSurfaces {
  /** Rectangular ductwork: ribbed, wavy galvanised sheet. */
  readonly duct: SurfaceMaps;
  /** Round pipe and conduit: couplings, and a gentler surface. */
  readonly pipe: SurfaceMaps;
  /** Equipment casings: panel seams, no ribs. */
  readonly casing: SurfaceMaps;
  /** Concrete: no ribs, coarse grain, so it stops reading as plastic. */
  readonly concrete: SurfaceMaps;
  dispose(): void;
}

/**
 * The surface names only, without `dispose`.
 *
 * Indexing ModelSurfaces by a plain `keyof` would widen to
 * `SurfaceMaps | (() => void)`, because the disposer is a member too.
 */
export type SurfaceFamily = Exclude<keyof ModelSurfaces, "dispose">;

/**
 * Generates every surface the model uses. Costs a handful of milliseconds and
 * about a megabyte of texture memory, all of it at mount.
 */
export function buildSurfaces(renderer: WebGLRenderer): ModelSurfaces {
  // Capped rather than maxed. Past 4x the returns are invisible here and the
  // sampling cost is not, and some mobile drivers report 16 they cannot afford.
  const anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  const duct = surfaceMaps(
    {
      seed: 11,
      ribCount: 4,
      ribWidth: 0.055,
      ribHeight: 0.85,
      panels: 0,
      seamWidth: 0,
      seamDepth: 0,
      wave: 0.5,
      waveCells: 3,
      grain: 0.04,
      roughBase: 0.95,
      roughSwing: 0.18,
      relief: 2.6,
    },
    anisotropy,
  );

  const pipe = surfaceMaps(
    {
      seed: 23,
      // Couplings, not joints, so fewer and shallower than a duct's.
      ribCount: 2,
      ribWidth: 0.045,
      ribHeight: 0.6,
      panels: 0,
      seamWidth: 0,
      seamDepth: 0,
      wave: 0.22,
      waveCells: 4,
      grain: 0.05,
      roughBase: 0.94,
      roughSwing: 0.22,
      relief: 2,
    },
    anisotropy,
  );

  /**
   * Equipment casing: an air handler or a VAV box is a bolted steel cabinet,
   * so it gets access panels rather than duct ribs.
   *
   * Two divisions per tile, paired with a three-unit tile in mepScene, puts a
   * panel every 1.5 units. That is deliberately matched to the geometry: a VAV
   * box is 1.5 units and reads as exactly one panel with its seams landing on
   * the box edges, while a rooftop air handler is six and a half and reads as
   * four. Finer than this and the small boxes, which are eight pixels across,
   * turn into noise.
   */
  const casing = surfaceMaps(
    {
      seed: 37,
      // A light stiffening bead between panels, not a duct joint.
      ribCount: 2,
      ribWidth: 0.018,
      ribHeight: 0.3,
      panels: 2,
      seamWidth: 0.028,
      seamDepth: 1,
      wave: 0.4,
      waveCells: 4,
      grain: 0.05,
      roughBase: 0.96,
      roughSwing: 0.18,
      relief: 2.2,
    },
    anisotropy,
  );

  const concrete = surfaceMaps(
    {
      seed: 59,
      ribCount: 0,
      ribWidth: 0,
      ribHeight: 0,
      // Formwork boards leave a grid of joints in poured concrete, wide
      // enough apart to read at this size.
      panels: 1,
      seamWidth: 0.012,
      seamDepth: 0.35,
      wave: 0.7,
      waveCells: 3,
      grain: 0.07,
      roughBase: 0.98,
      roughSwing: 0.14,
      relief: 1,
    },
    anisotropy,
  );

  return {
    duct,
    pipe,
    casing,
    concrete,
    dispose() {
      for (const set of [duct, pipe, casing, concrete]) {
        set.normal.dispose();
        set.roughness.dispose();
      }
    },
  };
}
