import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { getAppEnvironment, getAppVersion } from '../config/environment';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BetaFeedback'>;

const CATEGORIES = [
  'Bug',
  'Gameplay',
  'Visual',
  'Performance',
  'Suggestion',
] as const;

type Category = (typeof CATEGORIES)[number];

const ACCENT = colors.neonPink;

export function BetaFeedbackScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<Category>('Bug');
  const [description, setDescription] = useState('');

  const meta = useMemo(
    () => ({
      version: getAppVersion(),
      platform: Platform.OS,
      env: getAppEnvironment(),
    }),
    [],
  );

  const reportText = useMemo(() => {
    const body = description.trim() || '(no description)';
    return [
      'Number Rush — Beta Feedback',
      `Category: ${category}`,
      `Version: ${meta.version}`,
      `Platform: ${meta.platform}`,
      `Environment: ${meta.env}`,
      '',
      body,
      '',
      '(Local draft — not submitted to a server.)',
    ].join('\n');
  }, [category, description, meta.env, meta.platform, meta.version]);

  async function handleShareReport() {
    try {
      await Share.share({
        message: reportText,
        title: 'Number Rush Beta Feedback',
      });
    } catch {
      Alert.alert('Report ready', reportText);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="screen-beta-feedback">
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar
        title="BETA FEEDBACK"
        accent={ACCENT}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('Settings');
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          Share a local report via your device share sheet. Nothing is uploaded to a Number Rush
          server.
        </Text>

        <Text style={styles.sectionLabel}>CATEGORY</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => {
            const on = c === category;
            return (
              <Pressable
                key={c}
                testID={`feedback-category-${c.toLowerCase()}`}
                onPress={() => setCategory(c)}
                style={[
                  styles.chip,
                  on && {
                    borderColor: ACCENT,
                    backgroundColor: withAlpha(ACCENT, 0.18),
                  },
                  on ? neonGlow(ACCENT, 4) : null,
                ]}
              >
                <Text style={[styles.chipText, on && { color: colors.white }]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>DESCRIPTION</Text>
        <TextInput
          testID="feedback-description"
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="What happened? Steps to reproduce help."
          placeholderTextColor={withAlpha(colors.muted, 0.55)}
          multiline
          textAlignVertical="top"
        />

        <View style={[styles.metaCard, neonGlow(colors.electricBlue, 4)]}>
          <Text style={styles.metaLine}>Version {meta.version}</Text>
          <Text style={styles.metaLine}>Platform {meta.platform}</Text>
          <Text style={styles.metaLine}>Env {meta.env}</Text>
        </View>

        <NeonButton
          testID="feedback-copy-report"
          label="COPY / SHARE REPORT"
          color={ACCENT}
          size="large"
          onPress={() => {
            void handleShareReport();
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  lead: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  sectionLabel: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 10,
    letterSpacing: 2,
    color: ACCENT,
    marginTop: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: withAlpha(colors.muted, 0.35),
    borderRadius: radii.compact,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  chipText: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 13,
    color: colors.muted,
  },
  input: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: withAlpha(ACCENT, 0.35),
    borderRadius: radii.card,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  metaCard: {
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.35),
    borderRadius: radii.card,
    backgroundColor: withAlpha(colors.electricBlue, 0.08),
    padding: 14,
    gap: 4,
  },
  metaLine: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.electricBlue,
  },
});
