import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { trackEvent } from '../analytics/analyticsService';
import { useLiveEvents } from '../hooks/useLiveEvents';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Events'>;

export function EventsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { config } = useRemoteConfig();
  const { events, loading, refresh } = useLiveEvents();

  React.useEffect(() => {
    trackEvent('event_viewed', { count: events.length });
  }, [events.length]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <AnimatedNeonBackground />
      </View>
      <ScreenTopBar title="LIVE EVENTS" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {!config.liveOps.eventsEnabled ? (
          <Text style={styles.empty}>Events are currently disabled.</Text>
        ) : loading ? (
          <Text style={styles.empty}>Loading events…</Text>
        ) : events.length === 0 ? (
          <Text style={styles.empty}>No active events right now.</Text>
        ) : (
          events.map((event) => (
            <View key={event.id} style={[styles.card, neonGlow(colors.cyan, 6)]}>
              <Text style={styles.badge}>
                {event.status === 'active' ? 'LIVE' : event.status.toUpperCase()}
              </Text>
              <Text style={styles.name}>{event.name}</Text>
              <Text style={styles.desc}>{event.description}</Text>
              <Text style={styles.meta}>
                {event.startsAt.slice(0, 10)} → {event.endsAt.slice(0, 10)}
              </Text>
              <NeonButton
                label="VIEW"
                color={colors.cyan}
                size="small"
                onPress={() =>
                  navigation.navigate('EventDetail', {
                    eventId: event.id,
                    eventKey: event.eventKey,
                  })
                }
              />
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
    borderColor: withAlpha(colors.cyan, 0.35),
    padding: 16,
    gap: 8,
  },
  badge: {
    fontFamily: fontFamilies.orbitronBold,
    color: colors.green,
    fontSize: 11,
    letterSpacing: 1,
  },
  name: {
    fontFamily: fontFamilies.orbitronBold,
    color: colors.white,
    fontSize: 16,
  },
  desc: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.muted,
    fontSize: 14,
  },
  meta: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.cyan,
    fontSize: 12,
  },
});
