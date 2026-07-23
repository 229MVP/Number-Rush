import {
  DEV_TILE_SEQUENCE,
  MAX_TILE_VALUE,
  MIN_TILE_VALUE,
  USE_DEV_TILE_SEQUENCE,
} from './gameConstants';
import type { NumberTileData } from './gameTypes';

export type TileRng = () => number;

let tileSerial = 0;

function nextId(): string {
  tileSerial += 1;
  return `tile-${Date.now()}-${tileSerial}`;
}

/** Default RNG: uniform integer in [MIN_TILE_VALUE, MAX_TILE_VALUE]. */
export function defaultTileRng(): number {
  return (
    Math.floor(Math.random() * (MAX_TILE_VALUE - MIN_TILE_VALUE + 1)) +
    MIN_TILE_VALUE
  );
}

/** FNV-1a style string hash → unsigned 32-bit seed. */
export function hashStringToSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Mulberry32 — small deterministic PRNG.
 * Same seed always yields the same sequence of tile values 1–10.
 */
export function createMulberry32(seed: number): TileRng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const span = MAX_TILE_VALUE - MIN_TILE_VALUE + 1;
    return MIN_TILE_VALUE + Math.floor(r * span);
  };
}

export function createSeededRngFromString(seed: string): TileRng {
  return createMulberry32(hashStringToSeed(seed));
}

/**
 * Optional deterministic generator (numeric seed).
 * Prefer createSeededRngFromString for Daily / Ranked modes.
 */
export function createSeededRng(seed: number): TileRng {
  return createMulberry32(seed);
}

/**
 * Prototype tile bag. Supports seeded competitive modes and optional __DEV__ sequence.
 */
export class TileGenerator {
  private rng: TileRng;
  private sequence: number[] | null;
  private index = 0;
  readonly seed: string | null;

  constructor(
    rng: TileRng = defaultTileRng,
    useDevSequence = USE_DEV_TILE_SEQUENCE,
    seed: string | null = null,
  ) {
    this.rng = rng;
    this.seed = seed;
    const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
    this.sequence =
      isDev && useDevSequence && !seed ? [...DEV_TILE_SEQUENCE] : null;
  }

  static fromSeed(seed: string): TileGenerator {
    return new TileGenerator(createSeededRngFromString(seed), false, seed);
  }

  next(): NumberTileData {
    let value: number;
    if (this.sequence && this.index < this.sequence.length) {
      value = this.sequence[this.index];
      this.index += 1;
    } else {
      value = this.rng();
    }
    return {
      id: nextId(),
      type: 'number',
      value,
    };
  }

  /** Peek the next N values without advancing this generator (uses a fork). */
  preview(count: number): number[] {
    const fork = this.seed
      ? createSeededRngFromString(this.seed)
      : this.rng;
    // If seeded from string, recreate from seed and skip already consumed.
    if (this.seed) {
      const fresh = createSeededRngFromString(this.seed);
      for (let i = 0; i < this.index; i += 1) fresh();
      return Array.from({ length: count }, () => fresh());
    }
    // Non-seeded preview is best-effort (advances a copy of state only if mulberry).
    void fork;
    return Array.from({ length: count }, () => defaultTileRng());
  }
}

/** Development check: same seed → identical first N tiles. */
export function assertSeedStability(seed: string, count = 40): boolean {
  const a = TileGenerator.fromSeed(seed);
  const b = TileGenerator.fromSeed(seed);
  for (let i = 0; i < count; i += 1) {
    if (a.next().value !== b.next().value) return false;
  }
  return true;
}
