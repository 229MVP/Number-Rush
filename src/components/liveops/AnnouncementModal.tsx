import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { NeonButton } from '../NeonButton';
import { trackEvent } from '../../analytics/analyticsService';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnnouncementSummary } from '../../liveops/liveOpsTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

const DISMISS_KEY = 'numberRush.announcements.dismissed';

async function readDismissed(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(DISMISS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

async function writeDismissed(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(DISMISS_KEY, JSON.stringify(ids));
}

type Props = {
  enabled: boolean;
};

export function AnnouncementModalHost({ enabled }: Props) {
  const { announcements } = useAnnouncements();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [active, setActive] = useState<AnnouncementSummary | null>(null);
  const shownRef = useRef(false);

  useEffect(() => {
    void readDismissed().then(setDismissed);
  }, []);

  const candidate = useMemo(() => {
    if (!enabled || shownRef.current) return null;
    return (
      announcements
        .filter((a) => a.priority >= 50 || a.announcementType === 'maintenance')
        .filter((a) => !(a.dismissible && dismissed.includes(a.id)))
        .sort((a, b) => b.priority - a.priority)[0] ?? null
    );
  }, [announcements, dismissed, enabled]);

  useEffect(() => {
    if (candidate && !active) {
      shownRef.current = true;
      setActive(candidate);
      trackEvent('announcement_viewed', { id: candidate.id });
    }
  }, [candidate, active]);

  if (!active) return null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => setActive(null)}>
      <View style={styles.backdrop}>
        <View style={[styles.card, neonGlow(colors.orange, 12)]}>
          <Text style={styles.eyebrow}>{active.announcementType.toUpperCase()}</Text>
          <Text style={styles.title}>{active.title}</Text>
          <Text style={styles.body}>{active.body}</Text>
          <NeonButton
            label={active.dismissible ? 'DISMISS' : 'OK'}
            color={colors.cyan}
            onPress={() => {
              if (active.dismissible) {
                const next = [...new Set([...dismissed, active.id])];
                setDismissed(next);
                void writeDismissed(next);
              }
              setActive(null);
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,6,23,0.88)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.modal,
    borderWidth: 1,
    borderColor: withAlpha(colors.orange, 0.45),
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    fontFamily: fontFamilies.orbitronBold,
    color: colors.orange,
    fontSize: 11,
  },
  title: {
    fontFamily: fontFamilies.orbitronBlack,
    color: colors.white,
    fontSize: 18,
  },
  body: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
