import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Flag, Home, Play, RotateCcw, Settings } from 'lucide-react-native';
import { NeonButton } from '../NeonButton';
import type { GameMode } from '../../game/gameTypes';
import { colors, fontFamilies, neonGlow, radii, spacing, withAlpha } from '../../theme';

type Props = {
  visible: boolean;
  mode: GameMode;
  officialAttempt: boolean;
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onQuit: () => void;
  onForfeitOfficial?: () => void;
};

export function PauseModal({
  visible,
  mode,
  officialAttempt,
  onResume,
  onRestart,
  onSettings,
  onQuit,
  onForfeitOfficial,
}: Props) {
  const [confirmForfeit, setConfirmForfeit] = useState(false);
  const isDailyOfficial = mode === 'daily' && officialAttempt;
  const isDailyPractice = mode === 'daily' && !officialAttempt;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onResume}
      >
        <View style={styles.backdrop}>
          <View style={[styles.card, neonGlow(colors.neonPink, 18)]}>
            <Text style={[styles.title, neonGlow(colors.neonPink, 10)]}>
              PAUSED
            </Text>
            <NeonButton
              testID="pause-resume"
              label="RESUME"
              color={colors.neonPink}
              size="large"
              icon={<Play size={17} color={colors.white} />}
              onPress={onResume}
            />
            {isDailyPractice ? (
              <NeonButton
                label="RESTART PRACTICE"
                color={colors.orange}
                icon={<RotateCcw size={15} color={colors.white} />}
                onPress={onRestart}
              />
            ) : null}
            {!isDailyOfficial && !isDailyPractice ? (
              <NeonButton
                label="RESTART RUN"
                color={colors.orange}
                icon={<RotateCcw size={15} color={colors.white} />}
                onPress={onRestart}
              />
            ) : null}
            <NeonButton
              label="SETTINGS"
              color={colors.electricBlue}
              icon={<Settings size={15} color={colors.white} />}
              onPress={onSettings}
            />
            {isDailyOfficial ? (
              <NeonButton
                label="FORFEIT ATTEMPT"
                color={colors.red}
                icon={<Flag size={15} color={colors.white} />}
                onPress={() => setConfirmForfeit(true)}
              />
            ) : (
              <NeonButton
                testID="pause-quit"
                label={isDailyPractice ? 'QUIT PRACTICE' : 'QUIT TO MENU'}
                color={colors.muted}
                icon={<Home size={15} color={colors.white} />}
                onPress={onQuit}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmForfeit}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmForfeit(false)}
      >
        <View style={styles.backdrop}>
          <View style={[styles.card, neonGlow(colors.red, 14)]}>
            <Text style={[styles.title, { color: colors.red, fontSize: 22 }]}>
              FORFEIT?
            </Text>
            <Text style={styles.confirmText}>
              Forfeit today’s official attempt? Your current score will be
              submitted and you cannot restart the official attempt today.
            </Text>
            <NeonButton
              label="FORFEIT"
              color={colors.red}
              onPress={() => {
                setConfirmForfeit(false);
                onForfeitOfficial?.();
              }}
            />
            <NeonButton
              label="CANCEL"
              color={colors.muted}
              onPress={() => setConfirmForfeit(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: withAlpha(colors.background, 0.88),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: withAlpha(colors.neonPink, 0.4),
    borderRadius: radii.modal,
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 28,
    color: colors.neonPink,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 4,
  },
  confirmText: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
});
