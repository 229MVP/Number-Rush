import { useEffect, useState } from 'react';

function getMsUntilNextUtcMidnight(now: Date = new Date()): number {
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  );
  return Math.max(0, next - now.getTime());
}

export function formatUtcCountdown(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/**
 * Remaining time until next UTC midnight. Updates once per minute.
 */
export function useUtcCountdown(): { msRemaining: number; label: string } {
  const [msRemaining, setMsRemaining] = useState(() => getMsUntilNextUtcMidnight());

  useEffect(() => {
    const tick = () => setMsRemaining(getMsUntilNextUtcMidnight());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return {
    msRemaining,
    label: formatUtcCountdown(msRemaining),
  };
}
