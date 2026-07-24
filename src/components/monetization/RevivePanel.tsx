import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { NeonButton } from '../NeonButton';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type Props = {
  visible: boolean;
  loading: boolean;
  adUnavailable: boolean;
  onWatchAd: () => void;
  onEndRun: () => void;
};

export function RevivePanel({
  visible,
  loading,
  adUnavailable,
  onWatchAd,
  onEndRun,
}: Props) {
  const watchDisabled = loading || adUnavailable;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onEndRun}
    >
      <View style={styles.backdrop} testID="revive-panel">
        <View style={[styles.card, neonGlow(colors.cyan, 16)]}>
          <Text style={[styles.title, neonGlow(colors.cyan, 10)]}>
            ONE MORE CHANCE?
          </Text>
          <Text style={styles.body}>
            Watch an ad to restore one strike and continue this run.
          </Text>
          {adUnavailable ? (
            <Text style={styles.unavailable}>
              Rewarded ad unavailable right now.
            </Text>
          ) : null}
          {loading ? (
            <ActivityIndicator color={colors.cyan} style={styles.spinner} />
          ) : null}
          <NeonButton
            testID="revive-watch-ad"
            label={loading ? 'LOADING…' : 'WATCH AD'}
            color={colors.cyan}
            size="large"
            disabled={watchDisabled}
            onPress={onWatchAd}
          />
          <NeonButton
            testID="revive-end-run"
            label="END RUN"
            color={colors.red}
            disabled={loading}
            onPress={onEndRun}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,6,23,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: radii.modal,
    borderWidth: 1,
    borderColor: withAlpha(colors.cyan, 0.45),
    padding: 24,
    gap: 14,
    alignItems: 'stretch',
  },
  title: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 18,
    letterSpacing: 1.5,
    color: colors.cyan,
    textAlign: 'center',
  },
  body: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.muted,
    textAlign: 'center',
  },
  unavailable: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: colors.orange,
    textAlign: 'center',
  },
  spinner: { marginVertical: 4 },
});
