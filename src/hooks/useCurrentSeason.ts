import { useCallback, useEffect, useState } from 'react';

import { fetchCurrentRankedSeason } from '../liveops/seasonService';
import type { RankedSeasonSummary } from '../liveops/liveOpsTypes';
import { useRemoteConfig } from './useRemoteConfig';

export function useCurrentSeason() {
  const { config } = useRemoteConfig();
  const [season, setSeason] = useState<RankedSeasonSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSeason(await fetchCurrentRankedSeason());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!config.liveOps.currentSeasonKey && !config.gameplay.rankedEnabled) return;
    void refresh();
  }, [config.gameplay.rankedEnabled, config.liveOps.currentSeasonKey, refresh]);

  return { season, loading, refresh };
}
