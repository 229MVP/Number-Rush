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
export function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Alias used by Daily Tournament docs. */
export const hashStringToSeed = hashSeed;

/**
 * Mulberry32 — deterministic PRNG. Same seed → same 1–10 tile sequence.
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

export function createSeededRandom(seed: string): TileRng {
  return createMulberry32(hashSeed(seed));
}

/**
 * Returns a tile-value RNG. Classic (no seed) uses Math.random;
 * Daily passes a string seed for a deterministic Mulberry32 stream.
 */
export function createTileGenerator(seed?: string | null): TileRng {
  if (seed == null || seed === '') {
    return defaultTileRng;
  }
  return createSeededRandom(seed);
}

/** Optional numeric LCG for tests / legacy callers. */
export function createSeededRng(seed: number): TileRng {
  return createMulberry32(seed >>> 0);
}

/**
 * Prototype tile bag. Supports seeded Daily mode and optional __DEV__ sequence.
 * Seeded instances keep mutable PRNG state across placements (survives re-renders
 * via the module-level activeGenerator in the gameplay hook).
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
    return new TileGenerator(createSeededRandom(seed), false, seed);
  }

  next(): NumberTileData {
    let value: number;
    if (this.sequence && this.index < this.sequence.length) {
      value = this.sequence[this.index];
      this.index += 1;
    } else {
      value = this.rng();
      this.index += 1;
    }
    return {
      id: nextId(),
      type: 'number',
      value,
    };
  }

  /** Peek first N values for a fresh seed without affecting this instance. */
  static previewSeed(seed: string, count: number): number[] {
    const gen = TileGenerator.fromSeed(seed);
    return Array.from({ length: count }, () => gen.next().value);
  }
}

/** Development check: same seed → identical first N tiles. */
export function assertSeedStability(seed: string, count = 40): boolean {
  const a = TileGenerator.previewSeed(seed, count);
  const b = TileGenerator.previewSeed(seed, count);
  if (a.length !== b.length) return false;
  for (let i = 0; i < count; i += 1) {
    if (a[i] !== b[i]) return false;
    if (a[i] < MIN_TILE_VALUE || a[i] > MAX_TILE_VALUE) return false;
  }
  return true;
}
