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

/**
 * Optional deterministic generator for future Daily Tournament seeding.
 * Uses a simple LCG so the same seed always yields the same sequence.
 */
export function createSeededRng(seed: number): TileRng {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    const span = MAX_TILE_VALUE - MIN_TILE_VALUE + 1;
    return MIN_TILE_VALUE + (state % span);
  };
}

/**
 * Prototype tile bag. Supports an optional __DEV__ fixed sequence for QA.
 * Production path always uses random (or a provided seeded RNG).
 */
export class TileGenerator {
  private rng: TileRng;
  private sequence: number[] | null;
  private index = 0;

  constructor(rng: TileRng = defaultTileRng, useDevSequence = USE_DEV_TILE_SEQUENCE) {
    this.rng = rng;
    const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
    this.sequence = isDev && useDevSequence ? [...DEV_TILE_SEQUENCE] : null;
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
}
