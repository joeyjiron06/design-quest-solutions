/**
 * Tuned defaults for the light rig and the build sequence.
 *
 * Kept apart from mepScene because none of it is rendering: these are the
 * numbers that were settled by eye, and they should be readable without
 * scrolling through a thousand lines of WebGL to find them.
 *
 * System colours are not here. They live in SYSTEMS in mepGeometry.ts, which
 * is the single source both the canvas and any legend read from.
 */

/** Light rig, every value an intensity multiplier unless noted. */
export interface LightingSettings {
  key: number;
  fill: number;
  rim: number;
  /** Hemisphere, the colourless wash that keeps undersides off black. */
  ambient: number;
  /** Prefiltered room environment, the direction-dependent ambient. */
  environment: number;
  /** Renderer tone mapping exposure. */
  exposure: number;
  /** Bloom strength once the model has finished drafting itself in. */
  bloom: number;
  /** How hard contact shadows bite at the end of the build. */
  ao: number;
}

/** A stage of the build, as a pair of fractions of the total run. */
export type Stage = readonly [start: number, end: number];

export interface TimingSettings {
  /** Total build length in seconds. */
  build: number;
  /** Glowing line work for the shell. */
  structureLines: Stage;
  /** Glowing centrelines for the services. */
  serviceLines: Stage;
  /** Ducts and pipes inflating out of those centrelines. */
  ducts: Stage;
  /** Slabs, columns and walls growing as grey mass. */
  walls: Stage;
  /** Radians per second once the build is done. */
  orbit: number;
}

/**
 * Baked-in lighting, tuned by eye and pasted back.
 *
 * Split by palette because the two need genuinely different rigs: the same
 * intensities that model the form against oxblood wash the concrete out
 * against paper. The hero sheet is dark, so the dark set is the one in use;
 * the light set is the earlier balance, kept so the model still renders
 * sensibly if it is ever dropped on a light section.
 */
export const DEFAULT_LIGHTING: Record<"dark" | "light", LightingSettings> = {
  dark: {
    key: 3.1,
    fill: 0.5,
    // Nearly off. The rim was separating the model from the background, a job
    // the much stronger key and ambient now do on their own.
    rim: 0.1,
    ambient: 1.45,
    environment: 0.42,
    exposure: 1.45,
    // Zero at rest. The drafting phase still flares, see BLOOM_DRAFTING in
    // mepScene, but the finished model carries no glow at all.
    bloom: 0,
    ao: 1.5,
  },
  light: {
    key: 1.05,
    fill: 0.35,
    rim: 0.28,
    ambient: 0.55,
    environment: 0.4,
    exposure: 1.05,
    bloom: 0,
    ao: 1,
  },
};

/** Baked-in timing. Stages are fractions of `build`. */
export const DEFAULT_TIMING: TimingSettings = {
  build: 5.2,
  structureLines: [0, 0.4],
  serviceLines: [0.08, 0.62],
  ducts: [0.18, 0.78],
  // Starts while the structure lines are still drawing and finishes ahead of
  // the ducts, so the grey mass is already settled when the contact shadows
  // arrive at 0.9 and the orbit eases in at 0.82.
  walls: [0.24, 0.71],
  orbit: 0.155,
};
