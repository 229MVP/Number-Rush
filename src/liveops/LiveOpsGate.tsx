import React, { useMemo } from 'react';
import { View } from 'react-native';

import { AnnouncementModalHost } from '../components/liveops/AnnouncementModal';
import { getAppVersionLabel } from '../config/releaseChannel';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { evaluateVersionPolicy } from '../liveops/versionPolicy';
import { MaintenanceScreen } from '../screens/MaintenanceScreen';
import { UpdateRequiredScreen } from '../screens/UpdateRequiredScreen';

type Props = {
  children: React.ReactNode;
};

/**
 * Remote maintenance + minimum-version gates.
 * Recommended updates are non-blocking (surfaced via News/announcements).
 * Dev builds may bypass maintenance via EXPO_PUBLIC_LIVEOPS_BYPASS_MAINTENANCE=true.
 */
export function LiveOpsGate({ children }: Props) {
  const { config } = useRemoteConfig();
  const bypassMaintenance =
    __DEV__ &&
    process.env.EXPO_PUBLIC_LIVEOPS_BYPASS_MAINTENANCE?.trim().toLowerCase() === 'true';

  const versionDecision = useMemo(
    () =>
      evaluateVersionPolicy({
        currentVersion: getAppVersionLabel(),
        minimumSupportedVersion: config.app.minimumSupportedVersion,
        recommendedVersion: config.app.recommendedVersion,
        forceUpdateEnabled: config.app.forceUpdateEnabled,
      }),
    [config],
  );

  if (versionDecision.status === 'force_update') {
    return <UpdateRequiredScreen navigation={noopNav as never} route={noopRoute as never} />;
  }

  if (config.app.maintenanceMode && !bypassMaintenance) {
    return <MaintenanceScreen navigation={noopNav as never} route={noopRoute as never} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
      <AnnouncementModalHost enabled />
    </View>
  );
}

const noopNav = {
  navigate: () => undefined,
  goBack: () => undefined,
};

const noopRoute = { key: 'liveops', name: 'Maintenance', params: undefined };
