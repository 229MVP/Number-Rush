import type { ServerClockSnapshot } from './liveOpsTypes';

let snapshot: ServerClockSnapshot = {
  serverTimeIso: null,
  offsetMs: 0,
  synchronizedAtMs: null,
  trusted: false,
};

export function getServerClockSnapshot(): ServerClockSnapshot {
  return snapshot;
}

/** Apply a server timestamp (ISO) measured against local now. */
export function applyServerTime(serverTimeIso: string, localNowMs = Date.now()): void {
  const serverMs = Date.parse(serverTimeIso);
  if (!Number.isFinite(serverMs)) return;
  snapshot = {
    serverTimeIso,
    offsetMs: serverMs - localNowMs,
    synchronizedAtMs: localNowMs,
    trusted: true,
  };
}

export function markServerClockUntrusted(): void {
  snapshot = { ...snapshot, trusted: false };
}

/** Approximate now using last known offset. */
export function getAdjustedNowMs(localNowMs = Date.now()): number {
  return localNowMs + snapshot.offsetMs;
}

export function getAdjustedNowIso(localNowMs = Date.now()): string {
  return new Date(getAdjustedNowMs(localNowMs)).toISOString();
}

export function isServerClockFresh(maxAgeMs = 15 * 60 * 1000, localNowMs = Date.now()): boolean {
  if (!snapshot.synchronizedAtMs || !snapshot.trusted) return false;
  return localNowMs - snapshot.synchronizedAtMs <= maxAgeMs;
}
