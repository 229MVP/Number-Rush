import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedNeonBackground } from '../../components/AnimatedNeonBackground';
import { GridBackground } from '../../components/GridBackground';
import { NeonButton } from '../../components/NeonButton';
import { ScreenTopBar } from '../../components/ScreenTopBar';
import { accountDeletionEnabled } from '../../config/featureFlags';
import { maskEmail } from '../../auth/authService';
import { useAuth } from '../../hooks/useAuth';
import { useCloudSync } from '../../hooks/useCloudSync';
import type { RootStackParamList } from '../../navigation/navigationTypes';
import type { SyncStatus } from '../../sync/syncTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

const ACCENT = colors.electricBlue;

function statusLabel(status: SyncStatus, enabled: boolean): string {
  if (!enabled) return 'Cloud sync disabled';
  switch (status) {
    case 'idle':
      return 'Up to date';
    case 'pending':
      return 'Changes pending';
    case 'syncing':
      return 'Syncing…';
    case 'error':
      return 'Sync error — retry from Cloud Sync';
    case 'offline':
      return 'Offline';
    default:
      return status;
  }
}

export function AccountScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    isAuthenticated,
    isGuest,
    user,
    signOut,
    deleteAccount,
    authStatus,
  } = useAuth();
  const { status: syncStatus, enabled: syncEnabled } = useCloudSync();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Settings');
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can sign in again with your magic link.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          void signOut().then(() => navigation.navigate('SignIn'));
        },
      },
    ]);
  };

  const handleDelete = async () => {
    if (deleteText.trim() !== 'DELETE') return;
    setDeleting(true);
    try {
      const result = await deleteAccount();
      if (!result.ok) {
        const msg =
          result.error === 'feature_disabled'
            ? 'Account deletion is not enabled in this build.'
            : result.error;
        Alert.alert('Could not delete account', msg);
        return;
      }
      setDeleteOpen(false);
      navigation.navigate('MainMenu');
    } finally {
      setDeleting(false);
    }
  };

  const accountLine = isAuthenticated
    ? user?.email
      ? maskEmail(user.email)
      : 'Signed in'
    : isGuest
      ? 'Playing as guest'
      : 'Not signed in';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="screen-account">
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar title="ACCOUNT" accent={ACCENT} onBack={goBack} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, neonGlow(ACCENT, 5)]}>
          <Text style={styles.cardLabel}>STATUS</Text>
          <Text style={styles.cardValue}>{accountLine}</Text>
          <Text style={styles.meta}>Auth: {authStatus}</Text>
        </View>

        {isAuthenticated ? (
          <View style={styles.section}>
            <Text style={styles.rowLabel}>Cloud sync</Text>
            <Text style={styles.rowValue}>
              {statusLabel(syncStatus, syncEnabled)}
            </Text>
            <NeonButton
              label="MANAGE CLOUD SYNC"
              color={colors.cyan}
              size="small"
              onPress={() => navigation.navigate('CloudSync')}
            />
            <NeonButton
              testID="account-sign-out"
              label="SIGN OUT"
              color={colors.orange}
              size="small"
              onPress={handleSignOut}
            />
            {accountDeletionEnabled ? (
              <NeonButton
                testID="account-delete"
                label="DELETE ACCOUNT"
                color={colors.red}
                size="small"
                onPress={() => {
                  setDeleteText('');
                  setDeleteOpen(true);
                }}
              />
            ) : null}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.guestNote}>
              Guest progress stays on this device. Sign in to back up and compete
              on live leaderboards.
            </Text>
            <NeonButton
              label="SIGN IN"
              color={colors.neonPink}
              size="large"
              onPress={() => navigation.navigate('SignIn')}
            />
          </View>
        )}
      </ScrollView>

      <Modal transparent visible={deleteOpen} animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modalBox, neonGlow(colors.red, 10)]}>
            <Text style={styles.modalTitle}>DELETE ACCOUNT</Text>
            <Text style={styles.modalBody}>
              This permanently removes your cloud profile. Type{' '}
              <Text style={{ color: colors.red, fontFamily: fontFamilies.orbitronBold }}>
                DELETE
              </Text>{' '}
              to confirm.
            </Text>
            <TextInput
              testID="account-delete-confirm"
              style={styles.deleteInput}
              value={deleteText}
              onChangeText={setDeleteText}
              placeholder="Type DELETE"
              placeholderTextColor={withAlpha(colors.muted, 0.5)}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <NeonButton
                label="CANCEL"
                color={colors.muted}
                size="small"
                fullWidth={false}
                onPress={() => setDeleteOpen(false)}
              />
              <NeonButton
                label={deleting ? 'DELETING…' : 'CONFIRM'}
                color={colors.red}
                size="small"
                fullWidth={false}
                disabled={deleteText.trim() !== 'DELETE' || deleting}
                onPress={() => void handleDelete()}
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
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(ACCENT, 0.3),
    padding: 16,
    gap: 6,
  },
  cardLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.muted,
  },
  cardValue: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 16,
    color: colors.white,
  },
  meta: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  section: { gap: 12 },
  rowLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: colors.muted,
  },
  rowValue: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    color: colors.white,
    marginBottom: 4,
  },
  guestNote: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
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
    gap: 14,
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
  deleteInput: {
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
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
});
