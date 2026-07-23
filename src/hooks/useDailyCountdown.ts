import { useCallback, useEffect, useRef, useState } from 'react';
import {
  formatDailyCountdown,
  getMillisecondsUntilNextUtcReset,
  getUtcDateKey,
} from '../game/dailyTournament';

/**
 * Remaining time until next UTC midnight. Updates ~once per minute.
 * Invokes onDateChange when the UTC calendar date rolls over while mounted.
 */
export function useDailyCountdown(onDateChange?: (dateKey: string) => void): {
  msRemaining: number;
  label: string;
  dateKey: string;
} {
  const [msRemaining, setMsRemaining] = useState(() =>
    getMillisecondsUntilNextUtcReset(),
  );
  const [dateKey, setDateKey] = useState(() => getUtcDateKey());
  const onDateChangeRef = useRef(onDateChange);
  onDateChangeRef.current = onDateChange;

  const tick = useCallback(() => {
    setMsRemaining(getMillisecondsUntilNextUtcReset());
    const nextKey = getUtcDateKey();
    setDateKey((prev) => {
      if (prev !== nextKey) {
        onDateChangeRef.current?.(nextKey);
        return nextKey;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [tick]);

  return {
    msRemaining,
    label: formatDailyCountdown(msRemaining),
    dateKey,
  };
}
