/** Countdown helpers for mission period resets (UTC). */

export function msUntilNextUtcMidnight(now = new Date()): number {
  const next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ),
  );
  return Math.max(0, next.getTime() - now.getTime());
}

/** Next Monday 00:00 UTC after the current ISO week. */
export function msUntilNextUtcWeek(now = new Date()): number {
  const day = now.getUTCDay(); // 0 Sun … 6 Sat
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilMonday,
      0,
      0,
      0,
      0,
    ),
  );
  return Math.max(0, next.getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (hours >= 48) {
    const days = Math.floor(hours / 24);
    const remH = hours % 24;
    return `${days}d ${remH}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}
