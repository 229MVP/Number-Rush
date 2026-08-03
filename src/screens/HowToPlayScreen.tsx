import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { setTutorialCompleted } from '../storage/gameStorage';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'HowToPlay'>;

const ACCENT = colors.cyan;

const RULES: { title: string; body: string }[] = [
  {
    title: 'Reach exactly 21',
    body: 'Tap a lane to add the current number to its total. Land on exactly 21 for a Perfect clear.',
  },
  {
    title: 'Perfect clears build combo',
    body: 'Consecutive Perfect clears increase your combo multiplier (×1 → ×2 → ×3 → ×4), multiplying the 100-point base reward.',
  },
  {
    title: 'Busts cost a strike',
    body: 'Going over 21 busts the lane: it resets, your combo resets to ×1, and you lose one of your three strikes.',
  },
  {
    title: 'Three strikes end the run',
    body: 'Lose all three strikes and the run ends. Your final score, best score, and run stats are shown on Game Over.',
  },
  {
    title: 'Multiplier power-up',
    body: 'Doubles the next tile value before you place it. Tap again to cancel before placing.',
  },
  {
    title: 'Swap power-up',
    body: 'Exchanges the totals of two lanes you select. Does not advance the tile queue or change score.',
  },
];

export function HowToPlayScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="how-to-play-screen">
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>
      <ScreenTopBar
        title="HOW TO PLAY"
        accent={ACCENT}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('MainMenu');
        }}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {RULES.map((rule) => (
          <View
            key={rule.title}
            style={[styles.card, neonGlow(ACCENT, 4)]}
          >
            <Text style={styles.cardTitle}>{rule.title}</Text>
            <Text style={styles.cardBody}>{rule.body}</Text>
          </View>
        ))}
        <NeonButton
          testID="how-to-play-restart-tutorial"
          label="REPLAY IN-GAME TUTORIAL"
          color={ACCENT}
          size="small"
          onPress={() => {
            void setTutorialCompleted(false).then(() => {
              navigation.navigate('Gameplay', { mode: 'classic' });
            });
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(ACCENT, 0.25),
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
    color: colors.white,
  },
  cardBody: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
});
