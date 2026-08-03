import type { RunStats } from '../game/gameTypes';

export type RunMode = 'daily' | 'ranked';

export type RunPlacementEvent = {
  type: 'place';
  /** Zero-based placement index in submission order. */
  seq: number;
  tileValue: number;
  laneIndex: number;
};

export type RunEvent = RunPlacementEvent;

export type RunPayloadMeta = {
  mode: RunMode;
  seed: string;
  ticketId?: string;
  dateKey?: string;
  finalScore: number;
  strikesRemaining: number;
  perfectClears: number;
  maxComboMultiplier: number;
  eventsHash: string;
  eventCount: number;
};

export type RunSubmissionPayload = RunPayloadMeta & {
  events: RunEvent[];
  runStats: RunStats;
};

/** Stable non-cryptographic hash for event integrity checks. */
export function stableHashString(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function hashRunEvents(events: RunEvent[]): string {
  const canonical = events
    .map(
      (e) =>
        `${e.type}:${e.seq}:${e.tileValue}:${e.laneIndex}`,
    )
    .join('|');
  return stableHashString(canonical);
}

export function buildRunPayload(args: {
  mode: RunMode;
  seed: string;
  events: RunEvent[];
  runStats: RunStats;
  strikesRemaining: number;
  ticketId?: string;
  dateKey?: string;
}): RunSubmissionPayload {
  const eventsHash = hashRunEvents(args.events);
  return {
    mode: args.mode,
    seed: args.seed,
    ticketId: args.ticketId,
    dateKey: args.dateKey,
    finalScore: args.runStats.score,
    strikesRemaining: args.strikesRemaining,
    perfectClears: args.runStats.perfectClears,
    maxComboMultiplier: args.runStats.maxComboMultiplier,
    eventsHash,
    eventCount: args.events.length,
    events: args.events,
    runStats: args.runStats,
  };
}
