import { useCallback, useEffect, useState } from 'react';

import { listActiveLiveEvents } from '../liveops/eventService';
import type { LiveEventSummary } from '../liveops/liveOpsTypes';
import { useRemoteConfig } from './useRemoteConfig';

export function useLiveEvents() {
  const { config } = useRemoteConfig();
  const [events, setEvents] = useState<LiveEventSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!config.liveOps.eventsEnabled) {
      setEvents([]);
      return;
    }
    setLoading(true);
    try {
      setEvents(await listActiveLiveEvents());
    } finally {
      setLoading(false);
    }
  }, [config.liveOps.eventsEnabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { events, loading, refresh };
}
