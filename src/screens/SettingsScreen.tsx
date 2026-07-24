import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { useAudio } from '../audio/AudioProvider';
import { useHaptics } from '../haptics/HapticsProvider';
import { useSettings } from '../settings/SettingsProvider';
import { useOptionalGameTheme } from '../themes/GameThemeProvider';
import { resetAllDailyData } from '../storage/dailyStorage';
import { resetPlayerProgression } from '../storage/playerStorage';
import { resetMissions } from '../storage/missionStorage';
import { setBestScore, setTutorialCompleted } from '../storage/gameStorage';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const ACCENT = colors.electricBlue;

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

function ToggleRow({
  label,
  value,
  onToggle,
  accent = ACCENT,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  accent?: string;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={disabled ? undefined : onToggle}
        disabled={disabled}
        trackColor={{
          false: withAlpha(colors.muted, 0.3),
          true: withAlpha(accent, 0.65),
        }}
        thumbColor={value ? accent : colors.muted}
        ios_backgroundColor={withAlpha(colors.muted, 0.3)}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ChevronRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} hitSlop={6}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { settings, patchSettings, restoreDefaults } = useSettings();
  const {
    musicEnabled,
    musicVolume,
    soundEffectsEnabled,
    soundEffectsVolume,
    setMusicEnabled,
    setSoundEffectsEnabled,
    setMusicVolume,
    setSoundEffectsVolume,
    playSound,
  } = useAudio();
  const { hapticsEnabled, setHapticsEnabled, selection: hapticSelect } = useHaptics();
  const themeCtx = useOptionalGameTheme();

  const [resetText, setResetText] = useState('');
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  function tap() {
    playSound('buttonTap');
    hapticSelect();
  }

  async function handleMusicToggle() {
    tap();
    await setMusicEnabled(!musicEnabled);
  }

  async function handleSfxToggle() {
    tap();
    await setSoundEffectsEnabled(!soundEffectsEnabled);
  }

  async function handleHapticsToggle() {
    tap();
    await setHapticsEnabled(!hapticsEnabled);
  }

  async function handleReducedMotionToggle() {
    tap();
    await patchSettings({ reducedMotion: !settings.reducedMotion });
  }

  async function handleHighContrastToggle() {
    tap();
    await patchSettings({ highContrast: !settings.highContrast });
  }

  async function handleConfirmPowerUpToggle() {
    tap();
    await patchSettings({ confirmPowerUpUse: !settings.confirmPowerUpUse });
  }

  async function handleResetTutorial() {
    tap();
    await setTutorialCompleted(false);
    Alert.alert(
      'Tutorial Reset',
      'The gameplay tutorial will appear again on your next Classic game.',
    );
  }

  function handleRestoreDefaults() {
    tap();
    Alert.alert(
      'Restore Defaults',
      'Reset audio, haptics, and accessibility settings to defaults? Scores and progress are unaffected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            await restoreDefaults();
            Alert.alert('Restored', 'Settings have been restored to defaults.');
          },
        },
      ],
    );
  }

  function handleResetAllPress() {
    tap();
    Alert.alert(
      '⚠ RESET ALL LOCAL PROGRESS',
      'This will permanently delete ALL scores, missions, power-ups, currency, themes, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: () => {
            setResetText('');
            setResetModalVisible(true);
          },
        },
      ],
    );
  }

  async function handleFinalReset() {
    if (resetText.trim() !== 'RESET') return;
    setIsResetting(true);
    try {
      await resetPlayerProgression();
      await resetMissions();
      await setBestScore(0);
      await setTutorialCompleted(false);
      await restoreDefaults();
      await resetAllDailyData();
      await themeCtx?.refreshThemes();
      setResetModalVisible(false);
      navigation.navigate('MainMenu');
    } finally {
      setIsResetting(false);
    }
  }

  const confirmed = resetText.trim() === 'RESET';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar
        title="SETTINGS"
        accent={ACCENT}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('MainMenu');
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── AUDIO ─── */}
        <SectionHeader label="AUDIO" />
        <View style={styles.section}>
          <ToggleRow
            label="Music"
            value={musicEnabled}
            onToggle={() => { void handleMusicToggle(); }}
            accent={colors.purple}
          />
          <View style={[styles.sliderRow, !musicEnabled && styles.sliderDisabled]}>
            <View style={styles.sliderMeta}>
              <Text style={styles.sliderLabel}>Music Volume</Text>
              <Text style={styles.sliderVal}>{Math.round(musicVolume * 100)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              disabled={!musicEnabled}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={musicVolume}
              minimumTrackTintColor={colors.purple}
              maximumTrackTintColor={withAlpha(colors.muted, 0.35)}
              thumbTintColor={colors.purple}
              onSlidingComplete={(v) => { void setMusicVolume(v); }}
            />
          </View>

          <ToggleRow
            label="Sound Effects"
            value={soundEffectsEnabled}
            onToggle={() => { void handleSfxToggle(); }}
            accent={colors.cyan}
          />
          <View style={[styles.sliderRow, !soundEffectsEnabled && styles.sliderDisabled]}>
            <View style={styles.sliderMeta}>
              <Text style={styles.sliderLabel}>SFX Volume</Text>
              <Text style={styles.sliderVal}>{Math.round(soundEffectsVolume * 100)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              disabled={!soundEffectsEnabled}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={soundEffectsVolume}
              minimumTrackTintColor={colors.cyan}
              maximumTrackTintColor={withAlpha(colors.muted, 0.35)}
              thumbTintColor={colors.cyan}
              onSlidingComplete={(v) => { void setSoundEffectsVolume(v); }}
            />
          </View>
        </View>

        {/* ─── FEEDBACK ─── */}
        <SectionHeader label="FEEDBACK" />
        <View style={styles.section}>
          <ToggleRow
            label="Haptics"
            value={hapticsEnabled}
            onToggle={() => { void handleHapticsToggle(); }}
            accent={colors.orange}
          />
          <ToggleRow
            label="Reduced Motion"
            value={settings.reducedMotion}
            onToggle={() => { void handleReducedMotionToggle(); }}
            accent={colors.yellow}
          />
          <ToggleRow
            label="High Contrast"
            value={settings.highContrast}
            onToggle={() => { void handleHighContrastToggle(); }}
            accent={colors.green}
          />
        </View>

        {/* ─── GAMEPLAY ─── */}
        <SectionHeader label="GAMEPLAY" />
        <View style={styles.section}>
          <ToggleRow
            label="Confirm Power-Up Use"
            value={settings.confirmPowerUpUse}
            onToggle={() => { void handleConfirmPowerUpToggle(); }}
            accent={colors.orange}
          />
          <NeonButton
            label="RESET GAMEPLAY TUTORIAL"
            color={colors.electricBlue}
            size="small"
            onPress={() => { void handleResetTutorial(); }}
          />
        </View>

        {/* ─── PREFERENCES ─── */}
        <SectionHeader label="PREFERENCES" />
        <View style={styles.section}>
          <InfoRow label="Language" value="English" />
          <ChevronRow
            label="Privacy"
            onPress={() => {
              tap();
              Alert.alert('Privacy', 'Privacy policy will be available in a future update.');
            }}
          />
          <ChevronRow
            label="Support"
            onPress={() => {
              tap();
              Alert.alert('Support', 'Support options will be available in a future update.');
            }}
          />
        </View>

        {/* ─── DATA ─── */}
        <SectionHeader label="DATA" />
        <View style={styles.section}>
          <NeonButton
            label="RESTORE LOCAL DEFAULTS"
            color={colors.electricBlue}
            size="small"
            onPress={handleRestoreDefaults}
          />
          <NeonButton
            label="RESET ALL LOCAL PROGRESS"
            color={colors.red}
            size="small"
            onPress={handleResetAllPress}
          />
        </View>

        {/* ─── ACCOUNT ─── */}
        <SectionHeader label="ACCOUNT" />
        <View style={styles.section}>
          <View style={[styles.comingCard, neonGlow(colors.electricBlue, 5)]}>
            <Text style={styles.comingText}>ACCOUNTS COMING LATER</Text>
          </View>
        </View>
      </ScrollView>

      {/* ─── Reset Confirmation Modal ─── */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalBox, neonGlow(colors.red, 10)]}>
            <Text style={styles.modalTitle}>FINAL CONFIRMATION</Text>
            <Text style={styles.modalBody}>
              Type{' '}
              <Text style={{ color: colors.red, fontFamily: fontFamilies.orbitronBold }}>
                RESET
              </Text>
              {' '}to permanently delete all local progress.
            </Text>
            <TextInput
              style={[
                styles.resetInput,
                confirmed && { borderColor: colors.red, color: colors.red },
              ]}
              value={resetText}
              onChangeText={setResetText}
              placeholder="Type RESET"
              placeholderTextColor={withAlpha(colors.muted, 0.5)}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <NeonButton
                label="CANCEL"
                color={colors.muted}
                size="small"
                fullWidth={false}
                style={styles.modalBtn}
                onPress={() => setResetModalVisible(false)}
              />
              <NeonButton
                label={isResetting ? 'RESETTING…' : 'CONFIRM RESET'}
                color={colors.red}
                size="small"
                fullWidth={false}
                style={styles.modalBtn}
                disabled={!confirmed || isResetting}
                onPress={() => { void handleFinalReset(); }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  scroll: { padding: 16, paddingBottom: 40 },

  sectionHeader: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 10,
    letterSpacing: 2,
    color: ACCENT,
    marginTop: 24,
    marginBottom: 8,
  },

  section: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(ACCENT, 0.18),
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(colors.muted, 0.1),
  },
  rowDisabled: { opacity: 0.45 },
  rowLabel: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    color: colors.white,
  },
  rowValue: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 13,
    color: colors.muted,
  },
  chevron: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 20,
    color: colors.muted,
    lineHeight: 22,
  },

  sliderRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(colors.muted, 0.1),
  },
  sliderDisabled: { opacity: 0.4 },
  sliderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sliderLabel: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  sliderVal: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 11,
    color: colors.white,
  },
  slider: { width: '100%', height: 32 },

  comingCard: {
    backgroundColor: withAlpha(colors.electricBlue, 0.08),
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.25),
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    margin: 2,
  },
  comingText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: withAlpha(colors.electricBlue, 0.7),
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5,6,23,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radii.modal,
    borderWidth: 1,
    borderColor: withAlpha(colors.red, 0.5),
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
    letterSpacing: 1.5,
    color: colors.red,
    textAlign: 'center',
  },
  modalBody: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  resetInput: {
    backgroundColor: withAlpha(colors.red, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(colors.muted, 0.35),
    borderRadius: radii.compact,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 3,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  modalBtn: { flex: 1 },
});
