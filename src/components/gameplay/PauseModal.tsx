import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, View } from 'react-native';
import { Home, Play, RotateCcw, Settings, Flag } from 'lucide-react-native';
import { NeonButton } from '../NeonButton';
import type { GameMode } from '../../game/gameTypes';
import { colors, fontFamilies, neonGlow, radii, spacing, withAlpha } from '../../theme';

type Props = {
  visible: boolean;
  mode: GameMode;
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onQuit: () => void;
  onForfeit?: () => void;
};

export function PauseModal({
  visible,
  mode,
  onResume,
  onRestart,
  onSettings,
  onQuit,
  onForfeit,
}: Props) {
  const [confirmForfeit, setConfirmForfeit] = useState(false);
  const isRanked = mode === 'ranked';

  const requestForfeit = () => {
    if (typeof Alert.alert === 'function') {
      Alert.alert(
        'Forfeit Match?',
        'This counts as a ranked loss (−25 RP).',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Forfeit',
            style: 'destructive',
            onPress: () => onForfeit?.(),
          },
        ],
      );
      return;
    }
    setConfirmForfeit(true);
  };

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
              label="RESUME"
              color={colors.neonPink}
              size="large"
              icon={<Play size={17} color={colors.white} />}
              onPress={onResume}
            />
            {!isRanked ? (
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
            {isRanked ? (
              <NeonButton
                label="FORFEIT MATCH"
                color={colors.red}
                icon={<Flag size={15} color={colors.white} />}
                onPress={requestForfeit}
              />
            ) : (
              <NeonButton
                label="QUIT TO MENU"
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
            <Text style={[styles.title, { color: colors.red }]}>FORFEIT?</Text>
            <Text style={styles.confirmText}>
              This counts as a ranked loss (−25 RP).
            </Text>
            <NeonButton
              label="CONFIRM FORFEIT"
              color={colors.red}
              onPress={() => {
                setConfirmForfeit(false);
                onForfeit?.();
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
  },
});
