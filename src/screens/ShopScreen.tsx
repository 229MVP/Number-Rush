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
import { useGameTheme } from '../themes/GameThemeProvider';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;
type Tab = 'powerup' | 'theme' | 'coins' | 'gems';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'powerup', label: 'POWER-UPS' },
  { id: 'theme', label: 'THEMES' },
  { id: 'coins', label: 'COINS' },
  { id: 'gems', label: 'GEMS' },
];

function ownedForItem(item: ShopItem, inv: PlayerInventory): number | null {
  if (!item.inventoryReward) return null;
  const key = Object.keys(item.inventoryReward)[0] as keyof PlayerInventory | undefined;
  if (!key) return null;
  return inv[key];
}

export function ShopScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { selectTheme, refreshThemes } = useGameTheme();
  const [tab, setTab] = useState<Tab>('powerup');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [inventory, setInventory] = useState<PlayerInventory | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

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
    }, [refresh]),
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

  const unlockRequirement = (theme: GameTheme): string => {
    if (theme.unlockType === 'default') return 'Owned';
    if (theme.unlockType === 'level') return `Level ${theme.unlockValue}`;
    if (theme.unlockType === 'coins') return `${theme.unlockValue} coins`;
    if (theme.unlockType === 'gems') return `${theme.unlockValue} gems`;
    if (theme.unlockType === 'rank') {
      return `Reach ${String(theme.unlockValue).toUpperCase()} division`;
    }
    return 'Locked';
  };

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
                      onPress={() => {
                        void selectTheme(theme.id).then(() => refresh());
                      }}
                    />
                  ) : canBuy && shopItem ? (
                    <NeonButton
                      label={`BUY ${shopItem.priceCurrency === 'gems' ? '◆' : '⬡'} ${shopItem.price}`}
                      color={theme.colors.primary}
                      size="small"
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

        {(tab === 'coins' || tab === 'gems') && (
          <View style={styles.comingCard}>
            <Text style={styles.comingTitle}>
              REAL-MONEY PURCHASES COMING LATER
            </Text>
            <Text style={styles.desc}>
              Coin and gem packs are not available in this build. Earn currency
              through gameplay, missions, and level rewards.
            </Text>
            <NeonButton
              label="VIEW POWER-UPS"
              color={colors.purple}
              onPress={() => navigation.navigate('PowerUps')}
            />
          </View>
        )}
      </ScrollView>
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
});
