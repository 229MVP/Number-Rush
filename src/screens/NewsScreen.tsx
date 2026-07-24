import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { trackEvent } from '../analytics/analyticsService';
import { useAnnouncements } from '../hooks/useAnnouncements';
import {
  isApprovedExternalUrl,
  isApprovedInternalRoute,
} from '../liveops/contentVersioning';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'News'>;

export function NewsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { announcements, loading, refresh } = useAnnouncements();

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <AnimatedNeonBackground />
      </View>
      <ScreenTopBar title="NEWS" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <Text style={styles.empty}>Loading…</Text>
        ) : announcements.length === 0 ? (
          <Text style={styles.empty}>No announcements.</Text>
        ) : (
          announcements.map((item) => (
            <View key={item.id} style={[styles.card, neonGlow(colors.orange, 5)]}>
              <Text style={styles.type}>{item.announcementType.toUpperCase()}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              {item.actionType === 'internal_route' &&
              item.actionValue &&
              isApprovedInternalRoute(item.actionValue) ? (
                <NeonButton
                  label="OPEN"
                  color={colors.cyan}
                  size="small"
                  onPress={() => {
                    trackEvent('announcement_action_tapped', { id: item.id });
                    const route = item.actionValue as keyof RootStackParamList;
                    // Approved allowlist only — params not accepted from server.
                    // @ts-expect-error allowlisted routes without params
                    navigation.navigate(route);
                  }}
                />
              ) : null}
              {item.actionType === 'external_url' &&
              item.actionValue &&
              isApprovedExternalUrl(item.actionValue) ? (
                <NeonButton
                  label="OPEN LINK"
                  color={colors.purple}
                  size="small"
                  onPress={() => {
                    trackEvent('announcement_action_tapped', { id: item.id });
                    void Linking.openURL(item.actionValue!);
                  }}
                />
              ) : null}
            </View>
          ))
        )}
        <NeonButton label="REFRESH" color={colors.purple} onPress={() => void refresh()} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  empty: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.muted,
    textAlign: 'center',
    marginVertical: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.orange, 0.35),
    padding: 16,
    gap: 8,
  },
  type: {
    fontFamily: fontFamilies.orbitronBold,
    color: colors.orange,
    fontSize: 11,
  },
  title: {
    fontFamily: fontFamilies.orbitronBold,
    color: colors.white,
    fontSize: 15,
  },
  body: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
