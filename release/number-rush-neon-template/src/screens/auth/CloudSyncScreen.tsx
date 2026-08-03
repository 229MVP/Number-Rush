import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cloud, CloudOff } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../../components/AnimatedNeonBackground';
import { GridBackground } from '../../components/GridBackground';
import { NeonButton } from '../../components/NeonButton';
import { ScreenTopBar } from '../../components/ScreenTopBar';
import { useAuth } from '../../hooks/useAuth';
import { useCloudSync } from '../../hooks/useCloudSync';
import { useNetwork } from '../../network/NetworkProvider';
import type { RootStackParamList } from '../../navigation/navigationTypes';
import type { SyncStatus } from '../../sync/syncTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CloudSync'>;

const ACCENT = colors.cyan;

function describeStatus(
  status: SyncStatus,
  enabled: boolean,
  online: boolean,
): string {
  if (!enabled) {
    return 'Cloud sync is turned off in this build.';
  }
  if (!online) {
    return 'No network — changes will sync when you are back online.';
  }
  switch (status) {
    case 'idle':
      return 'Your progress is synced with the cloud.';
    case 'pending':
      return 'Local changes are queued and will upload shortly.';
    case 'syncing':
      return 'Uploading and downloading your profile…';
    case 'error':
      return 'Last sync failed. Tap Sync Now to retry.';
    case 'offline':
      return 'Offline — sync paused.';
    default:
      return status;
  }
}

export function CloudSyncScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { status, enabled, syncNow, lastBundle } = useCloudSync();
  const { isConnected, isInternetReachable } = useNetwork();
  const online = isConnected && isInternetReachable;
  const [syncing, setSyncing] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Account');
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await syncNow();
    } finally {
      setSyncing(false);
    }
  };

  const busy = syncing || status === 'syncing';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="screen-cloud-sync">
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar title="CLOUD SYNC" accent={ACCENT} onBack={goBack} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {!isAuthenticated ? (
          <Text style={styles.warn}>
            Sign in to enable cloud backup and sync.
          </Text>
        ) : null}

        <View style={[styles.card, neonGlow(ACCENT, 6)]}>
          {enabled && online ? (
            <Cloud size={36} color={ACCENT} />
          ) : (
            <CloudOff size={36} color={colors.muted} />
          )}
          <Text style={styles.statusTitle}>
            {enabled ? status.toUpperCase() : 'DISABLED'}
          </Text>
          <Text style={styles.statusBody}>
            {describeStatus(status, enabled, online)}
          </Text>
          {busy ? (
            <ActivityIndicator color={ACCENT} style={{ marginTop: 8 }} />
          ) : null}
        </View>

        {lastBundle?.profile ? (
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>CLOUD PROFILE</Text>
            <Text style={styles.metaValue}>{lastBundle.profile.username}</Text>
            <Text style={styles.metaSub}>
              Level {lastBundle.profile.level} ·{' '}
              {lastBundle.profile.coins.toLocaleString()} coins
            </Text>
          </View>
        ) : null}

        <NeonButton
          testID="cloud-sync-now"
          label={busy ? 'SYNCING…' : 'SYNC NOW'}
          color={ACCENT}
          size="large"
          disabled={!isAuthenticated || !enabled || busy}
          onPress={() => void handleSync()}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  warn: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 13,
    color: colors.orange,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(ACCENT, 0.35),
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  statusTitle: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.white,
  },
  statusBody: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    textAlign: 'center',
  },
  metaCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.muted, 0.2),
    padding: 14,
    gap: 4,
  },
  metaLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.muted,
  },
  metaValue: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 16,
    color: colors.white,
  },
  metaSub: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
});
