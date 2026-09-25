/**
 * MODEL V2 — the building, as plain data. No Three.js in here on purpose, so
 * the shape of the building can be edited without touching rendering code.
 *
 * An 11-storey tower on a sprawling podium, carrying six MEP systems plus the
 * architectural shell. Roughly 550 runs and 120 pieces of equipment, which is
 * what gives it the density of a real coordination model.
 *
 * Every run is an ordered list of points, written in the direction the real
 * system would be installed. Air leaves the rooftop unit and works down and
 * out; water enters at the street and works up. The build animation reveals a
 * run from its first point to its last, so that order is visible.
 *
 * Nearly every X and Z is expressed as a fraction of the plan, through `span`
 * and `across`, so widening the building is a one-line change rather than a
 * hundred hand-edited coordinates.
 *
 * Units are arbitrary but consistent. One unit reads as roughly one foot.
 * The model is centred on X and Z, and the ground floor sits at Y = 0.
 */

export type Point = readonly [x: number, y: number, z: number];

/**
 * The systems, in legend order. `color` is the Revit system colour.
 *
 * These are drawing colours, not screen colours. They are picked to read the
 * way a coordination view reads once it is printed: saturated enough to tell
 * apart at a glance, dark enough that a black edge line sits on top of them,
 * and nowhere near the neon end, which is what makes a model look like a toy
 * rather than a deliverable.
 *
 * NOTE, deliberately: these hexes are the one place in the project that steps
 * outside the theme tokens in src/global.css. They are not decoration, they
 * are the industry convention for colour-coding an MEP model, and the whole
 * point of the visual is that a viewer can tell the systems apart. Page chrome
 * around the canvas stays on theme tokens. Change them here and both the
 * canvas and the legend follow.
 */
export const SYSTEMS = {
  supplyAir: { label: "Supply air", color: 0x1789cc },
  returnAir: { label: "Return air", color: 0xb02ab0 },
  exhaustAir: { label: "Exhaust air", color: 0x6c3f9e },
  domesticWater: { label: "Domestic water", color: 0x1f8f4e },
  sanitary: { label: "Sanitary & vent", color: 0x11736f },
  fireProtection: { label: "Fire protection", color: 0xbe2b2b },
  electrical: { label: "Electrical", color: 0xc0871c },
  equipment: { label: "Equipment", color: 0xbb9a6e },
  structure: { label: "Architectural shell", color: 0xc2c7cb },
} as const;

/**
 * The line Revit draws along every surface boundary in a shaded view. It is
 * the single biggest reason a shaded model reads as a drawing rather than a
 * render, so it is near-black rather than a tint of anything.
 */
export const EDGE_COLOR = 0x191c1f;

export type SystemId = keyof typeof SYSTEMS;

/**
 * Cross-section of a run. `rect` is ductwork, `round` is pipe and conduit.
 * Sizes are the full width and height, not half-extents.
 */
export type Profile =
  | { readonly kind: "rect"; readonly w: number; readonly h: number }
  | { readonly kind: "round"; readonly r: number };

/**
 * Default profile per system. Individual runs scale it with `Run.scale`.
 *
 * Ductwork is deliberately oversized relative to the pipework. It is the
 * dominant visual in a real coordination model and in the reference image,
 * and if the pipes compete with it the whole thing turns to noise.
 */
export const PROFILES: Record<Exclude<SystemId, "equipment" | "structure">, Profile> = {
  supplyAir: { kind: "rect", w: 1.75, h: 0.95 },
  returnAir: { kind: "rect", w: 1.6, h: 0.9 },
  exhaustAir: { kind: "rect", w: 1.2, h: 0.8 },
  domesticWater: { kind: "round", r: 0.17 },
  sanitary: { kind: "round", r: 0.25 },
  fireProtection: { kind: "round", r: 0.14 },
  electrical: { kind: "round", r: 0.12 },
};

export interface Run {
  readonly system: Exclude<SystemId, "equipment" | "structure">;
  readonly points: readonly Point[];
  /** Multiplier on the system profile. Trunks run large, branches small. */
  readonly scale?: number;
}

export interface Box {
  readonly center: Point;
  /** Full width, height and depth. */
  readonly size: Point;
}

/** A structural line. Drawn as a glowing polyline, never solid. */
export interface Wire {
  readonly points: readonly Point[];
}

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

const FLOORS = 11;
// Generous enough that the plenum of one floor does not close up against the
// slab of the next. Below about 3.4 the whole tower reads as a solid block.
const FLOOR_H = 3.5;
/** Tall ground level under the tower: lobby, parking, central plant. */
const PODIUM_H = 5;

const TOWER_HW = 21; // half-width on X
const TOWER_HD = 8.5; // half-depth on Z
// The podium is what sets how far back the camera has to sit, because it is
// both the widest thing in the model and the lowest. Every unit of sprawl
// here costs frame for the tower, which is the part worth looking at.
const PODIUM_HW = 25;
const PODIUM_HD = 11.5;

const ROOF_Y = PODIUM_H + FLOORS * FLOOR_H;

/** Slab level of tower floor `f`, 0-indexed from the podium roof. */
const slabY = (f: number) => PODIUM_H + f * FLOOR_H;
/** Ceiling plenum of floor `f`, where the air side runs. */
const plenumY = (f: number) => slabY(f) + FLOOR_H - 1;
/** Ceiling plenum of the podium, where the big distribution fans out. */
const PODIUM_PLENUM = PODIUM_H - 1.35;

const floors = Array.from({ length: FLOORS }, (_, i) => i);

/** X, as a fraction of the tower half-width. -1 is the left face, 1 the right. */
const span = (fraction: number) => fraction * TOWER_HW;
/** Z, as a fraction of the tower half-depth. */
const across = (fraction: number) => fraction * TOWER_HD;

/** `count` evenly spaced values from `from` to `to`, both inclusive. */
const spread = (count: number, from: number, to: number) =>
  count === 1
    ? [(from + to) / 2]
    : Array.from({ length: count }, (_, i) => from + ((to - from) * i) / (count - 1));

/** Structural grid. Columns and beams sit on these. */
const GRID_X = spread(8, -TOWER_HW, TOWER_HW);
const GRID_Z = [-TOWER_HD, 0, TOWER_HD];

/** Mechanical shaft, left end of the core. Everything on the air side uses it. */
const MECH_X = span(-0.76);
const MECH_Z = 0;
/** Wet shaft and electrical shaft, right end of the plan. */
const WET_X = span(0.78);
const WET_Z = across(-0.4);
const ELEC_X = span(0.78);
const ELEC_Z = across(0.4);

/** Takeoff positions along each trunk. The visual rhythm of every floor. */
const SUPPLY_TAPS = spread(10, span(-0.62), span(0.93));
const RETURN_TAPS = spread(5, span(-0.5), span(0.86));
const SPRINKLER_TAPS = spread(6, span(-0.84), span(0.84));
const FIXTURE_TAPS = spread(5, span(-0.55), span(0.4));
const PANEL_TAPS = spread(4, span(-0.72), span(0.32));

/** Deterministic jitter, so the model is identical on every reload. */
function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = makeRandom(20260924);
/** Symmetric jitter in +/- `amount`. */
const wobble = (amount: number) => (rand() * 2 - 1) * amount;

// ---------------------------------------------------------------------------
// Air side — rooftop units down the mechanical shaft, out along every floor
// ---------------------------------------------------------------------------

// Supply and its VAV boxes sit on the +Z face, which is the one the resting
// camera looks at. It is the busiest, most legible part of a real model and
// it is what the reference leads with.
const SUPPLY_Z = across(0.34); // trunk offset from the core centreline
const RETURN_Z = across(-0.34);
/** Where the takeoffs terminate: supply to the front wall, return to the back. */
const SUPPLY_WALL = across(0.83);
const RETURN_WALL = across(-0.83);

/**
 * Where supply takeoff `i` ends, shared by the duct and the VAV box on it.
 *
 * Every third one crosses to the back half, and alternate ones stop short.
 * Without that the tower is a flat wall of cyan on one face and a flat wall
 * of magenta on the other, which is the one thing a real plan never looks
 * like from any angle.
 */
const supplyWallAt = (i: number) =>
  i % 3 === 2 ? RETURN_WALL * 0.9 : SUPPLY_WALL - (i % 2) * across(0.13);

/** The same trick on the return side, where the wall effect is worse. */
const returnWallAt = (i: number) =>
  i % 4 === 1 ? SUPPLY_WALL * 0.86 : RETURN_WALL + (i % 2) * across(0.16);

const airRisers: Run[] = [
  // Supply from the rooftop air handler, down the shaft to the lowest floor.
  {
    system: "supplyAir",
    scale: 2.1,
    points: [
      [MECH_X + 4.5, ROOF_Y + 2.4, MECH_Z],
      [MECH_X, ROOF_Y + 2.4, MECH_Z],
      [MECH_X, ROOF_Y + 2.4, SUPPLY_Z],
      [MECH_X, plenumY(0) - 1.6, SUPPLY_Z],
    ],
  },
  // Return back up to the same unit.
  {
    system: "returnAir",
    scale: 2.1,
    points: [
      [MECH_X - 2.6, plenumY(0) - 1.6, RETURN_Z],
      [MECH_X - 2.6, ROOF_Y + 2.4, RETURN_Z],
      [MECH_X - 2.6, ROOF_Y + 2.4, MECH_Z],
      [MECH_X + 4.5, ROOF_Y + 2.4, MECH_Z],
    ],
  },
  // Toilet exhaust, bottom to the roof fan.
  {
    system: "exhaustAir",
    scale: 1.4,
    points: [
      [MECH_X + 3, PODIUM_H + 1.2, across(-0.66)],
      [MECH_X + 3, ROOF_Y + 1.5, across(-0.66)],
      [MECH_X + 8, ROOF_Y + 1.5, across(-0.66)],
    ],
  },
  // Two return risers brought out to the front wall. Real towers put them
  // there, and without them the front face has no vertical accent at all.
  ...[span(-0.44), span(0.5)].map<Run>((x) => ({
    system: "returnAir",
    scale: 1.25,
    points: [
      [x, PODIUM_PLENUM - 0.6, SUPPLY_WALL - 0.9],
      [x, ROOF_Y + 1.1, SUPPLY_WALL - 0.9],
      [x, ROOF_Y + 1.1, across(0.2)],
    ],
  })),
];

/** One supply and one return trunk per floor, running the length of the plan. */
const airTrunks: Run[] = floors.flatMap<Run>((f) => {
  const y = plenumY(f);
  return [
    {
      system: "supplyAir",
      scale: 1.32,
      points: [
        [MECH_X, y, SUPPLY_Z],
        [span(0.97), y, SUPPLY_Z],
      ],
    },
    {
      system: "returnAir",
      scale: 1.15,
      points: [
        [span(0.92), y - 0.35, RETURN_Z],
        [MECH_X - 2.6, y - 0.35, RETURN_Z],
      ],
    },
  ];
});

/**
 * Takeoffs. Each one leaves the trunk, crosses to the facade, and drops to a
 * diffuser. The VAV box that sits on the branch is added as equipment below.
 */
const airBranches: Run[] = floors.flatMap<Run>((f) => {
  const y = plenumY(f);
  const supply = SUPPLY_TAPS.map<Run>((x, i) => {
    const wall = supplyWallAt(i);
    return {
      system: "supplyAir",
      scale: 0.52,
      points: [
        [x, y, SUPPLY_Z],
        [x, y, wall],
        [x, y - 1, wall],
      ],
    };
  });
  const returns = RETURN_TAPS.map<Run>((x, i) => {
    const wall = returnWallAt(i);
    return {
      system: "returnAir",
      scale: 0.5,
      points: [
        [x, y - 0.35, RETURN_Z],
        [x, y - 0.35, wall],
        [x, y - 1.15, wall],
      ],
    };
  });
  const exhaust: Run = {
    system: "exhaustAir",
    scale: 0.75,
    points: [
      [MECH_X + 3, y - 0.45, across(-0.66)],
      [MECH_X + 7, y - 0.45, across(-0.66)],
      [MECH_X + 7, y - 1.2, across(-0.66)],
    ],
  };
  return [...supply, ...returns, exhaust];
});

// ---------------------------------------------------------------------------
// Wet side — service in from the street, up the risers, out to the fixtures
// ---------------------------------------------------------------------------

const WATER_Z = across(-0.93);
const SAN_Z = across(0.93);

const wetRisers: Run[] = [
  // Domestic cold water, street to roof tank.
  {
    system: "domesticWater",
    scale: 2.1,
    points: [
      [PODIUM_HW + 3, -0.9, WET_Z],
      [WET_X, -0.9, WET_Z],
      [WET_X, ROOF_Y + 1.3, WET_Z],
    ],
  },
  // Hot water return, alongside.
  {
    system: "domesticWater",
    scale: 1.4,
    points: [
      [WET_X + 0.9, PODIUM_H - 1.4, WET_Z],
      [WET_X + 0.9, ROOF_Y + 0.5, WET_Z],
    ],
  },
  // Sanitary stack, vented through the roof and draining to the street.
  {
    system: "sanitary",
    scale: 1.6,
    points: [
      [WET_X - 1.8, ROOF_Y + 1.7, WET_Z - 1.6],
      [WET_X - 1.8, -1.3, WET_Z - 1.6],
      [PODIUM_HW + 3, -1.7, WET_Z - 1.6],
    ],
  },
  // Second stack on the far side of the core.
  {
    system: "sanitary",
    scale: 1.5,
    points: [
      [WET_X - 1.8, ROOF_Y + 1.3, SAN_Z],
      [WET_X - 1.8, -1.3, SAN_Z],
      [WET_X - 1.8, -1.3, WET_Z - 1.6],
    ],
  },
  // Fire standpipe, from the pump room in the podium.
  {
    system: "fireProtection",
    scale: 2.4,
    points: [
      [PODIUM_HW + 3, -0.4, across(0.62)],
      [WET_X + 2.6, -0.4, across(0.62)],
      [WET_X + 2.6, ROOF_Y + 0.7, across(0.62)],
    ],
  },
  // Second standpipe at the far stair.
  {
    system: "fireProtection",
    scale: 2,
    points: [
      [MECH_X - 1.6, PODIUM_H - 2, across(0.55)],
      [MECH_X - 1.6, ROOF_Y + 0.5, across(0.55)],
    ],
  },
];

const wetBranches: Run[] = floors.flatMap<Run>((f) => {
  const base = slabY(f);
  const waterY = base + 2.5;
  const sanY = base + 0.65;

  const runs: Run[] = [
    // Floor water main, heading away from the riser down the wet wall.
    {
      system: "domesticWater",
      scale: 1.2,
      points: [
        [WET_X, waterY, WET_Z],
        [WET_X, waterY, WATER_Z],
        [span(-0.66), waterY, WATER_Z],
      ],
    },
    // Floor sanitary main, gathering back to the stack.
    {
      system: "sanitary",
      scale: 1.1,
      points: [
        [span(-0.6), sanY + 0.4, SAN_Z],
        [WET_X - 1.8, sanY, SAN_Z],
        [WET_X - 1.8, sanY - 0.3, WET_Z - 1.6],
      ],
    },
  ];

  // Fixture groups. Water drops down, waste picks up off the floor.
  for (const x of FIXTURE_TAPS) {
    runs.push({
      system: "domesticWater",
      scale: 0.72,
      points: [
        [x, waterY, WATER_Z],
        [x, waterY - 1.3, WATER_Z],
        [x, waterY - 1.3, WATER_Z + 1.6],
      ],
    });
    runs.push({
      system: "sanitary",
      scale: 0.72,
      points: [
        [x - 0.8, sanY + 1.3, SAN_Z - 1.6],
        [x - 0.8, sanY + 0.4, SAN_Z - 1.6],
        [x - 0.8, sanY + 0.4, SAN_Z],
      ],
    });
  }
  return runs;
});

// ---------------------------------------------------------------------------
// Fire protection — a loop per floor with sprinkler drops
// ---------------------------------------------------------------------------

const fireRuns: Run[] = floors.flatMap<Run>((f) => {
  // Dropped well below the air side. Stacking every service at the plenum is
  // what turns a floor into an opaque band instead of something you can see
  // through.
  const y = slabY(f) + 1.45;
  const ix = span(0.9);
  const iz = across(0.78);

  const loop: Run = {
    system: "fireProtection",
    scale: 1.5,
    points: [
      [WET_X + 2.6, y, across(0.62)],
      [ix, y, iz],
      [-ix, y, iz],
      [-ix, y, -iz],
      [ix, y, -iz],
      [ix, y, iz],
    ],
  };

  const drops = SPRINKLER_TAPS.flatMap<Run>((x) =>
    [-1, 1].map<Run>((side) => ({
      system: "fireProtection",
      scale: 0.6,
      points: [
        [x, y, side * iz],
        [x, y, side * iz * 0.45],
        [x, y - 0.6, side * iz * 0.45],
      ],
    })),
  );

  return [loop, ...drops];
});

// ---------------------------------------------------------------------------
// Electrical — bus riser up the shaft, cable tray along every floor
// ---------------------------------------------------------------------------

const electricalRuns: Run[] = [
  ...[-0.6, 0, 0.6].map<Run>((offset, i) => ({
    system: "electrical",
    scale: 2.2 - i * 0.3,
    points: [
      [ELEC_X + offset, -0.6, ELEC_Z],
      [ELEC_X + offset, ROOF_Y + 0.9, ELEC_Z],
    ],
  })),
  ...floors.flatMap<Run>((f) => {
    const y = plenumY(f) - 0.2;
    const tray: Run = {
      system: "electrical",
      scale: 1.8,
      points: [
        [ELEC_X, y, ELEC_Z],
        [ELEC_X, y, across(-0.93)],
        [span(-0.94), y, across(-0.93)],
      ],
    };
    const drops = PANEL_TAPS.map<Run>((x) => ({
      system: "electrical",
      scale: 0.7,
      points: [
        [x, y, across(-0.93)],
        [x, y - 2, across(-0.93)],
        [x + 1.2, y - 2, across(-0.93)],
      ],
    }));
    return [tray, ...drops];
  }),
];

// ---------------------------------------------------------------------------
// Roof plant
// ---------------------------------------------------------------------------

const roofRuns: Run[] = [
  // Air handler to the shaft, and a second unit feeding the same header.
  {
    system: "supplyAir",
    scale: 1.9,
    points: [
      [MECH_X + 4.5, ROOF_Y + 2.4, MECH_Z],
      [span(0.2), ROOF_Y + 2.4, MECH_Z],
      [span(0.2), ROOF_Y + 2.4, across(-0.6)],
    ],
  },
  {
    system: "returnAir",
    scale: 1.8,
    points: [
      [span(0.2), ROOF_Y + 2.9, across(0.6)],
      [span(0.2), ROOF_Y + 2.9, MECH_Z + 1.4],
      [MECH_X + 4.5, ROOF_Y + 2.9, MECH_Z + 1.4],
    ],
  },
  {
    system: "exhaustAir",
    scale: 1.2,
    points: [
      [MECH_X + 8, ROOF_Y + 1.5, across(-0.66)],
      [MECH_X + 8, ROOF_Y + 2.9, across(-0.66)],
    ],
  },
  // Condenser water out to the cooling tower and back.
  {
    system: "domesticWater",
    scale: 1.8,
    points: [
      [WET_X, ROOF_Y + 1.3, WET_Z],
      [WET_X, ROOF_Y + 1.3, across(0.75)],
      [span(0.42), ROOF_Y + 1.3, across(0.75)],
    ],
  },
  {
    system: "domesticWater",
    scale: 1.6,
    points: [
      [span(0.42), ROOF_Y + 2, across(0.42)],
      [WET_X + 2, ROOF_Y + 2, across(0.42)],
      [WET_X + 2, ROOF_Y + 2, WET_Z],
    ],
  },
  {
    system: "electrical",
    scale: 1.6,
    points: [
      [ELEC_X, ROOF_Y + 0.9, ELEC_Z],
      [ELEC_X, ROOF_Y + 1.8, ELEC_Z],
      [span(0.24), ROOF_Y + 1.8, ELEC_Z],
      [span(0.24), ROOF_Y + 1.8, across(0.75)],
    ],
  },
];

// ---------------------------------------------------------------------------
// Podium — where the big distribution fans out before it reaches the tower
// ---------------------------------------------------------------------------

const podiumRuns: Run[] = [
  // Two large supply headers crossing the podium ceiling.
  {
    system: "supplyAir",
    scale: 2.5,
    points: [
      [MECH_X, PODIUM_PLENUM, SUPPLY_Z],
      [MECH_X, PODIUM_PLENUM, -PODIUM_HD + 2.8],
      [PODIUM_HW - 3.5, PODIUM_PLENUM, -PODIUM_HD + 2.8],
    ],
  },
  {
    system: "supplyAir",
    scale: 2.1,
    points: [
      [MECH_X, PODIUM_PLENUM - 1.1, SUPPLY_Z],
      [MECH_X - 7, PODIUM_PLENUM - 1.1, SUPPLY_Z],
      [MECH_X - 7, PODIUM_PLENUM - 1.1, PODIUM_HD - 2.8],
      [span(0.3), PODIUM_PLENUM - 1.1, PODIUM_HD - 2.8],
    ],
  },
  {
    system: "returnAir",
    scale: 2.3,
    points: [
      [PODIUM_HW - 6, PODIUM_PLENUM - 2.1, PODIUM_HD - 5.4],
      [span(-0.25), PODIUM_PLENUM - 2.1, PODIUM_HD - 5.4],
      [span(-0.25), PODIUM_PLENUM - 2.1, RETURN_Z],
      [MECH_X - 2.6, PODIUM_PLENUM - 2.1, RETURN_Z],
    ],
  },
  // Takeoffs off the north header.
  ...spread(8, -PODIUM_HW + 4, PODIUM_HW - 5).map<Run>((x) => ({
    system: "supplyAir",
    scale: 0.8,
    points: [
      [x, PODIUM_PLENUM, -PODIUM_HD + 2.8],
      [x, PODIUM_PLENUM, -PODIUM_HD + 7],
      [x, PODIUM_PLENUM - 0.9, -PODIUM_HD + 7],
    ],
  })),
  // Takeoffs off the south header.
  ...spread(6, -PODIUM_HW + 5, span(0.25)).map<Run>((x) => ({
    system: "supplyAir",
    scale: 0.76,
    points: [
      [x, PODIUM_PLENUM - 1.1, PODIUM_HD - 2.8],
      [x, PODIUM_PLENUM - 1.1, PODIUM_HD - 6.4],
      [x, PODIUM_PLENUM - 1.9, PODIUM_HD - 6.4],
    ],
  })),
  // Below-slab building drain, out to the street.
  {
    system: "sanitary",
    scale: 2.4,
    points: [
      [-PODIUM_HW + 5, -1.9, across(-0.55)],
      [WET_X - 1.8, -1.9, across(-0.55)],
      [WET_X - 1.8, -1.7, WET_Z - 1.6],
    ],
  },
  // Podium sprinkler grid.
  {
    system: "fireProtection",
    scale: 1.6,
    points: [
      [WET_X + 2.6, PODIUM_PLENUM - 2.6, across(0.62)],
      [-PODIUM_HW + 4, PODIUM_PLENUM - 2.6, across(0.62)],
    ],
  },
  ...spread(6, -PODIUM_HW + 5, span(0.35)).map<Run>((x) => ({
    system: "fireProtection",
    scale: 0.68,
    points: [
      [x, PODIUM_PLENUM - 2.6, across(0.62)],
      [x, PODIUM_PLENUM - 2.6, across(0.1)],
      [x, PODIUM_PLENUM - 3.2, across(0.1)],
    ],
  })),
  // Main switchgear feed in from the street.
  {
    system: "electrical",
    scale: 2.4,
    points: [
      [-PODIUM_HW - 3, -0.6, across(0.78)],
      [ELEC_X, -0.6, across(0.78)],
      [ELEC_X, -0.6, ELEC_Z],
    ],
  },
];

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

const equipment: Box[] = [
  // VAV box on every supply takeoff, sitting part-way along the branch. The
  // repeating orange rhythm per floor.
  ...floors.flatMap<Box>((f) =>
    SUPPLY_TAPS.map<Box>((x, i) => ({
      center: [x, plenumY(f) - 0.1, supplyWallAt(i) * 0.72],
      size: [1.5, 0.9, 1.6],
    })),
  ),
  // Electrical panel at the tray on each floor.
  ...floors.map<Box>((f) => ({
    center: [span(-0.2), plenumY(f) - 1.85, across(-0.93)],
    size: [1.2, 1.8, 0.5],
  })),
  // Rooftop plant.
  { center: [MECH_X + 7.4, ROOF_Y + 2.4, MECH_Z], size: [6.4, 3.2, 5.2] },
  { center: [span(0.2), ROOF_Y + 2.7, MECH_Z + 0.7], size: [6.6, 3.4, 5.6] },
  { center: [span(0.42), ROOF_Y + 1.9, across(0.6)], size: [5, 3.8, 4.2] },
  { center: [MECH_X + 8, ROOF_Y + 3.5, across(-0.66)], size: [2.2, 1.6, 2.2] },
  { center: [WET_X + 0.8, ROOF_Y + 1.8, WET_Z], size: [2.8, 3, 2.8] },
  { center: [span(-0.28), ROOF_Y + 1.2, across(-0.55)], size: [4, 1.8, 2.8] },
  // Central plant in the podium.
  { center: [WET_X + 2.6, 1.4, across(0.62)], size: [3, 2.6, 2.4] },
  { center: [WET_X - 4.4, 1.2, across(0.62)], size: [2.4, 2.2, 2.2] },
  { center: [MECH_X - 3, 1.6, -PODIUM_HD + 4.4], size: [5.2, 3, 3.4] },
  { center: [ELEC_X - 4.6, 1.5, across(0.78)], size: [3.8, 2.8, 1.8] },
  { center: [-PODIUM_HW + 6, 1.3, across(0.78)], size: [3.2, 2.4, 2] },
];

// ---------------------------------------------------------------------------
// Architectural shell
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Architectural shell, as solid mass
// ---------------------------------------------------------------------------

/**
 * The four edge beams that ring a floor plate.
 *
 * A solid plate would be more honest but would also hide every service above
 * it, and there are eleven of them. The edge band gives the same grey mass and
 * the same dark slab line along each storey without closing the model up.
 */
const slabBand = (y: number, hw: number, hd: number, w = 0.55, t = 0.5): Box[] => [
  { center: [0, y - t / 2, -hd + w / 2], size: [hw * 2, t, w] },
  { center: [0, y - t / 2, hd - w / 2], size: [hw * 2, t, w] },
  { center: [-hw + w / 2, y - t / 2, 0], size: [w, t, hd * 2 - w * 2] },
  { center: [hw - w / 2, y - t / 2, 0], size: [w, t, hd * 2 - w * 2] },
];

/** Four thin walls enclosing a shaft. Kept short so they do not box the plan in. */
const coreShell = (x0: number, x1: number, z0: number, z1: number, t = 0.35): Box[] => {
  const cz = (z0 + z1) / 2;
  // Only the two end walls. A full enclosure is what a real core is, but a
  // twelve-by-forty solid slab through the middle of the model hides most of
  // the services behind it, and this view exists to show the services.
  return [
    { center: [x0, ROOF_Y / 2, cz], size: [t, ROOF_Y, z1 - z0] },
    { center: [x1, ROOF_Y / 2, cz], size: [t, ROOF_Y, z1 - z0] },
  ];
};

/**
 * The shell as solid geometry, drawn in grey with the same dark edges as
 * everything else. Previously the shell was glowing line work only, which is
 * what gave the model its hologram look; real coordination views put the
 * architecture in as dumb grey mass and let the services carry the colour.
 */
const structureSolids: Box[] = [
  // Site plate, so the building stands on something.
  { center: [0, -0.16, 0], size: [(PODIUM_HW + 2) * 2, 0.32, (PODIUM_HD + 1.5) * 2] },
  // Podium slabs, heavier than the tower's.
  ...slabBand(0, PODIUM_HW, PODIUM_HD, 0.9, 0.7),
  ...slabBand(PODIUM_H, PODIUM_HW, PODIUM_HD, 0.9, 0.7),
  // Tower slabs, including the roof.
  ...Array.from({ length: FLOORS + 1 }, (_, f) =>
    slabBand(slabY(f), TOWER_HW, TOWER_HD),
  ).flat(),
  // Tower columns, full height.
  ...GRID_X.flatMap((x) =>
    GRID_Z.map<Box>((z) => ({
      center: [x, ROOF_Y / 2, z],
      size: [0.8, ROOF_Y, 0.8],
    })),
  ),
  // Podium columns, stopping at the podium roof.
  ...spread(5, -PODIUM_HW, PODIUM_HW).flatMap((x) =>
    [-PODIUM_HD, PODIUM_HD].map<Box>((z) => ({
      center: [x, PODIUM_H / 2, z],
      size: [0.9, PODIUM_H, 0.9],
    })),
  ),
  // Lift and stair core, then the wet and electrical core.
  ...coreShell(MECH_X - 3, MECH_X + 9, across(-0.72), across(0.72)),
  ...coreShell(WET_X - 3.4, WET_X + 4, WET_Z - 2.6, ELEC_Z + 2.6),
];

// ---------------------------------------------------------------------------
// Architectural shell, as line work
// ---------------------------------------------------------------------------

const rect = (y: number, hw: number, hd: number): Wire => ({
  points: [
    [-hw, y, -hd],
    [hw, y, -hd],
    [hw, y, hd],
    [-hw, y, hd],
    [-hw, y, -hd],
  ],
});

const coreWalls = (x0: number, x1: number, z0: number, z1: number): Wire[] =>
  Array.from({ length: FLOORS + 1 }, (_, f) => {
    const y = slabY(f) + 0.02;
    return {
      points: [
        [x0, y, z0],
        [x1, y, z0],
        [x1, y, z1],
        [x0, y, z1],
        [x0, y, z0],
      ] as Point[],
    };
  });

/**
 * Where the site line work sits, and how far inside the solid plate it is
 * held.
 *
 * The plate spans Y from -0.32 to 0 and reaches to PODIUM_HW + 2. Drawing the
 * site lines on that exact footprint puts them coincident with the plate's own
 * faces, which z-fights into a dashed outline around the ground. Tucking them
 * to the plate's mid-height and a third of a unit inside means they draw
 * cleanly while the plate is still growing, then get swallowed whole.
 */
const SITE_Y = -0.16;
const SITE_HW = PODIUM_HW + 2 - 0.35;
const SITE_HD = PODIUM_HD + 1.5 - 0.35;

const structure: Wire[] = [
  // Site plate and podium slabs. The plate is kept close to the podium on
  // purpose: it is decoration, and every unit it reaches out is a unit the
  // camera has to pull back to keep it in frame.
  rect(SITE_Y, SITE_HW, SITE_HD),
  rect(0, PODIUM_HW, PODIUM_HD),
  rect(PODIUM_H, PODIUM_HW, PODIUM_HD),
  // Tower slabs, including the roof.
  ...Array.from({ length: FLOORS + 1 }, (_, f) => rect(slabY(f), TOWER_HW, TOWER_HD)),
  // Tower columns.
  ...GRID_X.flatMap((x) =>
    GRID_Z.map<Wire>((z) => ({
      points: [
        [x, 0, z],
        [x, ROOF_Y, z],
      ],
    })),
  ),
  // Podium columns, stopping at the podium roof.
  ...spread(5, -PODIUM_HW, PODIUM_HW).flatMap((x) =>
    [-PODIUM_HD, PODIUM_HD].map<Wire>((z) => ({
      points: [
        [x, 0, z],
        [x, PODIUM_H, z],
      ],
    })),
  ),
  // Lift and stair core, drawn at every level.
  ...coreWalls(MECH_X - 3, MECH_X + 9, across(-0.72), across(0.72)),
  // Wet and electrical core.
  ...coreWalls(WET_X - 3.4, WET_X + 4, WET_Z - 2.6, ELEC_Z + 2.6),
  // Beams, one bay line per floor, to read as structure rather than outline.
  ...floors.flatMap<Wire>((f) =>
    GRID_X.slice(1, -1).map<Wire>((x) => ({
      points: [
        [x, slabY(f + 1) - 0.35, -TOWER_HD],
        [x, slabY(f + 1) - 0.35, TOWER_HD],
      ],
    })),
  ),
  // Site grid, so the podium does not float.
  ...spread(7, -SITE_HW, SITE_HW).map<Wire>((x) => ({
    points: [
      [x, SITE_Y, -SITE_HD],
      [x, SITE_Y, SITE_HD],
    ],
  })),
  ...spread(5, -SITE_HD, SITE_HD).map<Wire>((z) => ({
    points: [
      [-SITE_HW, SITE_Y, z],
      [SITE_HW, SITE_Y, z],
    ],
  })),
];

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * Every run, tagged by system. Grouping happens in the renderer, which merges
 * one geometry per system so the whole model is a handful of draw calls.
 */
const runs: readonly Run[] = [
  ...airRisers,
  ...airTrunks,
  ...airBranches,
  ...wetRisers,
  ...wetBranches,
  ...fireRuns,
  ...electricalRuns,
  ...roofRuns,
  ...podiumRuns,
].map((run) =>
  // A hair of variation on the branch sizes keeps the repetition from reading
  // as a copy-paste grid.
  run.scale && run.scale < 1 ? { ...run, scale: run.scale + wobble(0.06) } : run,
);

export const buildingV2 = {
  runs,
  equipment,
  structure,
  structureSolids,
  /** Vertical extent, used to drive the bottom-to-top build. */
  bounds: { minY: -2.2, maxY: ROOF_Y + 4.5 },
} as const;
