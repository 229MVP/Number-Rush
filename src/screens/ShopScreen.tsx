import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { CurrencyChip } from '../components/CurrencyChip';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import type { RootStackParamList } from '../navigation/navigationTypes';
import type { PlayerInventory, PlayerProfile } from '../progression/progressionTypes';
import { getShopItemsByType, type ShopItem } from '../shop/shopCatalog';
import { purchaseShopItem } from '../shop/purchaseShopItem';
import {
  getPlayerInventory,
  getPlayerProfile,
} from '../storage/playerStorage';
import { GAME_THEMES, type GameTheme } from '../themes/gameThemes';
import { useOptionalAudio } from '../audio/AudioProvider';
import { useOptionalHaptics } from '../haptics/HapticsProvider';
import { PurchaseSuccessModal } from '../components/monetization/PurchaseSuccessModal';
import {
  removeAdsProductEnabled,
  starterBundleEnabled,
  subscriptionsEnabled,
} from '../config/featureFlags';
import { usePurchases } from '../hooks/usePurchases';
import type { PurchaseProductId } from '../monetization/monetizationTypes';
import { CATALOG_PRODUCTS, getCatalogProduct } from '../purchases/purchaseCatalog';
import type { PurchaseOffering, PurchasePackageRef } from '../purchases/purchaseTypes';
import { useGameTheme } from '../themes/GameThemeProvider';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;
type Tab = 'powerup' | 'theme' | 'coins' | 'gems' | 'premium';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'powerup', label: 'POWER-UPS' },
  { id: 'theme', label: 'THEMES' },
  { id: 'gems', label: 'GEMS' },
  { id: 'premium', label: 'PREMIUM' },
];

function ownedForItem(item: ShopItem, inv: PlayerInventory): number | null {
  if (!item.inventoryReward) return null;
  const key = Object.keys(item.inventoryReward)[0] as keyof PlayerInventory | undefined;
  if (!key) return null;
  return inv[key];
}

const GEM_PRODUCT_IDS: PurchaseProductId[] = [
  'numberrush.gems_80',
  'numberrush.gems_450',
  'numberrush.gems_1000',
  'numberrush.gems_2500',
];

function unlockRequirement(theme: GameTheme): string {
  if (theme.unlockType === 'default') return 'Owned';
  if (theme.unlockType === 'level') return `Level ${theme.unlockValue}`;
  if (theme.unlockType === 'coins') return `${theme.unlockValue} coins`;
  if (theme.unlockType === 'gems') return `${theme.unlockValue} gems`;
  if (theme.unlockType === 'rank') {
    return `Reach ${String(theme.unlockValue).toUpperCase()} division`;
  }
  return 'Locked';
}

function findPackage(
  offerings: PurchaseOffering[],
  productId: PurchaseProductId,
): PurchasePackageRef | null {
  for (const offering of offerings) {
    const match = offering.packages.find((p) => p.productId === productId);
    if (match) return match;
  }
  return null;
}

export function ShopScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const audio = useOptionalAudio();
  const haptics = useOptionalHaptics();
  const { selectTheme, refreshThemes } = useGameTheme();
  const purchases = usePurchases();
  const [tab, setTab] = useState<Tab>(
    route.params?.initialTab === 'coins' ? 'gems' : (route.params?.initialTab ?? 'powerup'),
  );
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [inventory, setInventory] = useState<PlayerInventory | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [successProductId, setSuccessProductId] = useState<PurchaseProductId | null>(
    null,
  );

  const refresh = useCallback(async () => {
    const [p, inv] = await Promise.all([
      getPlayerProfile(),
      getPlayerInventory(),
    ]);
    setProfile(p);
    setInventory(inv);
    await refreshThemes();
  }, [refreshThemes]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void purchases.refreshOfferings();
    }, [refresh, purchases]),
  );

  const buy = (item: ShopItem) => {
    if (busyId) return;
    Alert.alert(
      'Confirm purchase',
      `Buy ${item.name} for ${item.price} ${item.priceCurrency}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: () => {
            void (async () => {
              setBusyId(item.id);
              setFeedback(null);
              try {
                const result = await purchaseShopItem(item);
                if (!result.ok) {
                  setFeedback(result.reason);
                } else {
                  setProfile(result.profile);
                  setInventory(result.inventory);
                  setFeedback(`Purchased ${item.name}`);
                  audio?.playSound('purchase');
                  haptics?.success();
                  await refreshThemes();
                }
              } finally {
                setBusyId(null);
              }
            })();
          },
        },
      ],
    );
  };

  const buyIap = (productId: PurchaseProductId, pkg: PurchasePackageRef | null) => {
    if (busyId || !pkg) return;
    const catalog = getCatalogProduct(productId);
    const priceLabel = purchases.monetizationTestMode
      ? 'Sandbox (test mode)'
      : 'the App Store / Play Store';
    Alert.alert(
      'Confirm purchase',
      `Buy ${catalog?.title ?? productId} via ${priceLabel}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: () => {
            void (async () => {
              setBusyId(productId);
              setFeedback(null);
              try {
                const result = await purchases.purchasePackage(pkg);
                if (result.ok) {
                  setSuccessProductId(result.productId);
                  audio?.playSound('purchase');
                  haptics?.success();
                  await refresh();
                } else if (!result.cancelled) {
                  setFeedback(result.error);
                }
              } finally {
                setBusyId(null);
              }
            })();
          },
        },
      ],
    );
  };

  const restoreIap = () => {
    void (async () => {
      setFeedback(null);
      const result = await purchases.restorePurchases();
      if (result.ok) {
        setFeedback('Purchases restored');
        haptics?.success();
      } else {
        setFeedback(result.error);
      }
    })();
  };

  const premiumProductIds: PurchaseProductId[] = [
    ...(removeAdsProductEnabled ? (['numberrush.remove_ads'] as const) : []),
    ...(starterBundleEnabled ? (['numberrush.starter_bundle'] as const) : []),
    ...(subscriptionsEnabled
      ? (['numberrush.club.monthly', 'numberrush.club.annual'] as const)
      : []),
  ];

  const storeReady =
    purchases.purchasesAvailable && purchases.purchaseState === 'ready';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar
        title="SHOP"
        accent={colors.purple}
        onBack={() => navigation.navigate('MainMenu')}
        right={
          <CurrencyChip
            coins={profile?.coins ?? 0}
            gems={profile?.gems ?? 0}
          />
        }
      />

      <View style={styles.tabs}>
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[styles.tab, on && styles.tabOn]}
            >
              <Text style={[styles.tabText, on && styles.tabTextOn]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'powerup' && inventory
          ? getShopItemsByType('powerup').map((item) => {
              const owned = ownedForItem(item, inventory);
              return (
                <View
                  key={item.id}
                  style={[styles.card, neonGlow(colors.orange, 4)]}
                >
                  <View style={styles.iconBox}>
                    <Text style={styles.icon}>{item.icon}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.desc}>{item.description}</Text>
                    {owned != null ? (
                      <Text style={styles.owned}>Owned: {owned}</Text>
                    ) : null}
                  </View>
                  <NeonButton
                    label={`${item.priceCurrency === 'gems' ? '◆' : '⬡'} ${item.price}`}
                    color={colors.orange}
                    size="small"
                    fullWidth={false}
                    disabled={busyId === item.id}
                    onPress={() => buy(item)}
                  />
                </View>
              );
            })
          : null}

        {tab === 'theme' && profile
          ? GAME_THEMES.map((theme) => {
              const unlocked = profile.unlockedThemeIds.includes(theme.id);
              const active = profile.selectedThemeId === theme.id;
              const shopItem = getShopItemsByType('theme').find(
                (i) => i.themeId === theme.id,
              );
              const canBuy =
                !unlocked &&
                (theme.unlockType === 'coins' || theme.unlockType === 'gems') &&
                shopItem != null;
              return (
                <View
                  key={theme.id}
                  style={[
                    styles.themeCard,
                    { borderColor: withAlpha(theme.colors.primary, 0.45) },
                  ]}
                >
                  <View
                    style={[
                      styles.themePreview,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.swatch,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                    <View
                      style={[
                        styles.swatch,
                        { backgroundColor: theme.colors.secondary },
                      ]}
                    />
                    <View
                      style={[
                        styles.swatch,
                        { backgroundColor: theme.colors.accent },
                      ]}
                    />
                  </View>
                  <Text style={[styles.name, { color: theme.colors.primary }]}>
                    {theme.name}
                  </Text>
                  <Text style={styles.desc}>{theme.description}</Text>
                  <Text style={styles.owned}>
                    {active
                      ? 'ACTIVE'
                      : unlocked
                        ? 'UNLOCKED'
                        : unlockRequirement(theme)}
                  </Text>
                  {active ? null : unlocked ? (
                    <NeonButton
                      label="SELECT"
                      color={theme.colors.primary}
                      size="small"
                      fullWidth={false}
                      onPress={() => {
                        void selectTheme(theme.id).then(() => refresh());
                      }}
                    />
                  ) : canBuy && shopItem ? (
                    <NeonButton
                      label={`BUY ${shopItem.priceCurrency === 'gems' ? '◆' : '⬡'} ${shopItem.price}`}
                      color={theme.colors.primary}
                      size="small"
                      fullWidth={false}
                      disabled={busyId === shopItem.id}
                      onPress={() => buy(shopItem)}
                    />
                  ) : (
                    <Text style={styles.locked}>Locked</Text>
                  )}
                </View>
              );
            })
          : null}

        {(tab === 'gems' || tab === 'premium') && (
          <>
            {!storeReady ? (
              <View style={styles.comingCard}>
                <Text style={styles.comingTitle}>STORE UNAVAILABLE</Text>
                <Text style={styles.desc}>
                  In-app purchases are not available on this device right now.
                  Browse packs below for what is offered when the store connects.
                </Text>
              </View>
            ) : purchases.monetizationTestMode ? (
              <Text style={styles.testMode}>
                TEST MODE — prices shown as Sandbox; fulfillment is local only.
              </Text>
            ) : null}

            {(tab === 'gems' ? GEM_PRODUCT_IDS : premiumProductIds).map(
              (productId) => {
                const catalog =
                  getCatalogProduct(productId) ??
                  CATALOG_PRODUCTS.find((p) => p.id === productId);
                if (!catalog) return null;
                const pkg = findPackage(purchases.offerings, productId);
                const ownedPremium =
                  productId === 'numberrush.remove_ads' &&
                  purchases.entitlements.removeAds;
                const clubActive =
                  (productId === 'numberrush.club.monthly' ||
                    productId === 'numberrush.club.annual') &&
                  purchases.entitlements.clubActive;
                return (
                  <View
                    key={productId}
                    style={[styles.card, neonGlow(colors.purple, 4)]}
                  >
                    <View style={styles.cardBody}>
                      <Text style={[styles.name, { color: colors.purple }]}>
                        {catalog.title}
                        {catalog.badge ? ` · ${catalog.badge}` : ''}
                      </Text>
                      <Text style={styles.desc}>{catalog.subtitle}</Text>
                      <Text style={styles.owned}>
                        {ownedPremium
                          ? 'OWNED — ADS REMOVED'
                          : clubActive
                            ? 'CLUB ACTIVE'
                            : purchases.monetizationTestMode
                              ? 'Sandbox price'
                              : pkg
                                ? 'Price in store'
                                : 'Not in current offering'}
                      </Text>
                    </View>
                    <NeonButton
                      label={ownedPremium || clubActive ? 'OWNED' : 'BUY'}
                      color={colors.purple}
                      size="small"
                      fullWidth={false}
                      disabled={
                        busyId === productId ||
                        !pkg ||
                        !storeReady ||
                        ownedPremium ||
                        clubActive
                      }
                      onPress={() => buyIap(productId, pkg)}
                    />
                  </View>
                );
              },
            )}

            <NeonButton
              label="RESTORE PURCHASES"
              color={colors.electricBlue}
              size="small"
              onPress={restoreIap}
            />
          </>
        )}
      </ScrollView>

      <PurchaseSuccessModal
        visible={successProductId != null}
        productId={successProductId}
        onClose={() => setSuccessProductId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  tabs: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.13),
    alignItems: 'center',
  },
  tabOn: {
    backgroundColor: withAlpha(colors.neonPink, 0.13),
    borderColor: colors.neonPink,
  },
  tabText: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: colors.muted,
  },
  tabTextOn: { color: colors.neonPink },
  feedback: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: colors.cyan,
    textAlign: 'center',
    paddingTop: 8,
  },
  scroll: { padding: 16, gap: 10, paddingBottom: 28 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.orange, 0.3),
    padding: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: withAlpha(colors.orange, 0.12),
    borderWidth: 1,
    borderColor: withAlpha(colors.orange, 0.35),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 14,
    color: colors.orange,
  },
  cardBody: { flex: 1, gap: 2 },
  name: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 11,
    color: colors.orange,
    letterSpacing: 0.5,
  },
  desc: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 11,
    color: colors.muted,
  },
  owned: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.cyan,
  },
  themeCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  themePreview: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  swatch: { width: 18, height: 18, borderRadius: 9 },
  locked: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    color: colors.muted,
  },
  comingCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.purple, 0.35),
    padding: 18,
    gap: 12,
  },
  comingTitle: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 12,
    color: colors.purple,
    letterSpacing: 1,
    textAlign: 'center',
  },
  testMode: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    color: colors.yellow,
    textAlign: 'center',
  },
});
