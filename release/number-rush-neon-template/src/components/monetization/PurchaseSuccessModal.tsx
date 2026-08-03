import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { NeonButton } from '../NeonButton';
import type { PurchaseProductId } from '../../monetization/monetizationTypes';
import { getCatalogProduct } from '../../purchases/purchaseCatalog';
import { PRODUCT_REWARD_MAP } from '../../purchases/productRewardMap';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type Props = {
  visible: boolean;
  productId: PurchaseProductId | null;
  onClose: () => void;
};

function describeRewards(productId: PurchaseProductId): string {
  const catalog = getCatalogProduct(productId);
  const preview = PRODUCT_REWARD_MAP[productId];
  const parts: string[] = [];
  if (preview.gems) parts.push(`${preview.gems} gems`);
  if (preview.entitlements?.removeAds) parts.push('Remove Ads active');
  if (preview.entitlements?.clubActive) parts.push('Club membership active');
  if (preview.themeOrFrame) parts.push(preview.themeOrFrame);  if (preview.inventory) {
    const invParts = Object.entries(preview.inventory)
      .filter(([, n]) => (n ?? 0) > 0)
      .map(([k, n]) => `${k}×${n}`);
    if (invParts.length) parts.push(invParts.join(', '));
  }
  if (parts.length === 0 && catalog) return catalog.subtitle;
  return parts.join(' · ');
}

export function PurchaseSuccessModal({ visible, productId, onClose }: Props) {
  const title =
    productId != null
      ? (getCatalogProduct(productId)?.title ?? 'Purchase complete')
      : 'Purchase complete';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, neonGlow(colors.green, 14)]}>
          <Text style={[styles.title, neonGlow(colors.green, 8)]}>
            THANK YOU!
          </Text>
          <Text style={styles.product}>{title}</Text>
          {productId ? (
            <Text style={styles.rewards}>{describeRewards(productId)}</Text>
          ) : null}
          <Text style={styles.note}>
            Rewards sync when connected. Entitlements apply on this device.
          </Text>
          <NeonButton label="CONTINUE" color={colors.green} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,6,23,0.88)',
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
    borderColor: withAlpha(colors.green, 0.4),
    padding: 24,
    gap: 12,
  },
  title: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 20,
    color: colors.green,
    textAlign: 'center',
    letterSpacing: 2,
  },
  product: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 13,
    color: colors.white,
    textAlign: 'center',
  },
  rewards: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    color: colors.cyan,
    textAlign: 'center',
  },
  note: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 17,
  },
});
