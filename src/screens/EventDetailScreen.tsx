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
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

export function EventDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { events } = useLiveEvents();
  const event =
    events.find((e) => e.id === route.params.eventId) ??
    events.find((e) => e.eventKey === route.params.eventKey) ??
    null;

  React.useEffect(() => {
    if (event) trackEvent('event_viewed', { eventKey: event.eventKey });
  }, [event]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <AnimatedNeonBackground />
      </View>
      <ScreenTopBar title="EVENT" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {!event ? (
          <Text style={styles.empty}>Event unavailable or no longer active.</Text>
        ) : (
          <View style={[styles.card, neonGlow(colors.purple, 8)]}>
            <Text style={styles.badge}>
              {event.status === 'active' ? 'LIVE' : event.status.toUpperCase()}
            </Text>
            <Text style={styles.name}>{event.name}</Text>
            <Text style={styles.desc}>{event.description}</Text>
            <Text style={styles.meta}>Type: {event.eventType}</Text>
            <Text style={styles.meta}>
              Window: {event.startsAt} → {event.endsAt}
            </Text>
            <Text style={styles.note}>
              Progress updates from validated Classic runs. Rewards claim once via server.
            </Text>
            <NeonButton
              label="PLAY CLASSIC"
              color={colors.cyan}
              onPress={() => {
                trackEvent('event_joined', { eventKey: event.eventKey });
                navigation.navigate('Gameplay', {
                  mode: 'classic',
                  eventId: event.id,
                  eventKey: event.eventKey,
                });
              }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  content: { padding: 16, gap: 12 },
  empty: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.modal,
    borderWidth: 1,
    borderColor: withAlpha(colors.purple, 0.4),
    padding: 20,
    gap: 10,
  },
  badge: {
    fontFamily: fontFamilies.orbitronBold,
    color: colors.green,
    fontSize: 11,
  },
  name: {
    fontFamily: fontFamilies.orbitronBlack,
    color: colors.white,
    fontSize: 20,
  },
  desc: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.cyan,
    fontSize: 12,
  },
  note: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
