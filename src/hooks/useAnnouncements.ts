import { useCallback, useEffect, useState } from 'react';

import { listActiveAnnouncements } from '../liveops/announcementService';
import type { AnnouncementSummary } from '../liveops/liveOpsTypes';
import { useRemoteConfig } from './useRemoteConfig';

export function useAnnouncements() {
  const { config } = useRemoteConfig();
  const [announcements, setAnnouncements] = useState<AnnouncementSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!config.liveOps.announcementsEnabled) {
      setAnnouncements([]);
      return;
    }
    setLoading(true);
    try {
      setAnnouncements(await listActiveAnnouncements());
    } finally {
      setLoading(false);
    }
  }, [config.liveOps.announcementsEnabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { announcements, loading, refresh };
}
