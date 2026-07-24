import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  HelpCircle,
  Shield,
  Snowflake,
  Zap,
} from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { CurrencyChip } from '../components/CurrencyChip';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import type { RootStackParamList } from '../navigation/navigationTypes';
import type { PlayerInventory, PlayerProfile } from '../progression/progressionTypes';
import {
  getPlayerInventory,
  getPlayerProfile,
} from '../storage/playerStorage';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PowerUps'>;

type AvailLabel = 'USABLE IN CLASSIC' | 'DISABLED IN DAILY' | 'DISABLED IN RANKED';

type PowerRow = {
  key: keyof PlayerInventory;
  name: string;
  description: string;
  labels: AvailLabel[];
  color: string;
  icon: 'x2' | 'swap' | 'bomb' | 'freeze' | 'shield' | 'wild';
};

const ROWS: PowerRow[] = [
  {
    key: 'multiplier',
    name: 'MULTIPLIER',
    description: 'Double the next tile value.',
    labels: ['USABLE IN CLASSIC', 'DISABLED IN DAILY', 'DISABLED IN RANKED'],
    color: colors.orange,
    icon: 'x2',
  },
  {
    key: 'swap',
    name: 'SWAP',
    description: 'Exchange the totals of two lanes.',
    labels: ['USABLE IN CLASSIC', 'DISABLED IN DAILY', 'DISABLED IN RANKED'],
    color: colors.electricBlue,
    icon: 'swap',
  },
  {
    key: 'bomb',
    name: 'BOMB',
    description: 'Clear one lane without placing a tile.',
    labels: ['USABLE IN CLASSIC', 'DISABLED IN DAILY', 'DISABLED IN RANKED'],
    color: colors.red,
    icon: 'bomb',
  },
  {
    key: 'freeze',
    name: 'FREEZE',
    description: 'Use the current tile for one extra turn.',
    labels: ['USABLE IN CLASSIC', 'DISABLED IN DAILY', 'DISABLED IN RANKED'],
    color: colors.cyan,
    icon: 'freeze',
  },
  {
    key: 'shield',
    name: 'SHIELD',
    description: 'Block the next lost strike.',
    labels: ['USABLE IN CLASSIC', 'DISABLED IN DAILY', 'DISABLED IN RANKED'],
    color: colors.electricBlue,
    icon: 'shield',
  },
  {
    key: 'wild',
    name: 'WILD',
    description: 'Choose a value from 1 through 10.',
    labels: ['USABLE IN CLASSIC', 'DISABLED IN DAILY', 'DISABLED IN RANKED'],
    color: colors.purple,
    icon: 'wild',
  },
];

const LABEL_COLORS: Record<AvailLabel, string> = {
  'USABLE IN CLASSIC': colors.green,
  'DISABLED IN DAILY': colors.muted,
  'DISABLED IN RANKED': colors.muted,
};

function RowIcon({ icon, color }: { icon: PowerRow['icon']; color: string }) {
  if (icon === 'x2') {
    return <Text style={[styles.x2, { color }]}>x2</Text>;
  }
  if (icon === 'swap') {
    return <Text style={[styles.x2, { color }]}>⇄</Text>;
  }
  if (icon === 'bomb') return <Zap size={22} color={color} />;
  if (icon === 'freeze') return <Snowflake size={22} color={color} />;
  if (icon === 'shield') return <Shield size={22} color={color} />;
  if (icon === 'wild') return <HelpCircle size={22} color={color} />;
  return <HelpCircle size={22} color={color} />;
}

export function PowerUpsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [inventory, setInventory] = useState<PlayerInventory | null>(null);

  const refresh = useCallback(async () => {
    const [p, inv] = await Promise.all([
      getPlayerProfile(),
      getPlayerInventory(),
    ]);
    setProfile(p);
    setInventory(inv);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar
        title="POWER-UPS"
        accent={colors.orange}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('MainMenu');
        }}
        right={
          <CurrencyChip
            coins={profile?.coins ?? 0}
            gems={profile?.gems ?? 0}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {inventory
          ? ROWS.map((row) => {
              const qty = inventory[row.key];
              const low = qty <= 0;
              return (
                <View
                  key={row.key}
                  style={[
                    styles.card,
                    { borderColor: withAlpha(row.color, 0.4) },
                    neonGlow(row.color, 5),
                  ]}
                >
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: withAlpha(row.color, 0.12),
                        borderColor: withAlpha(row.color, 0.4),
                      },
                    ]}
                  >
                    <RowIcon icon={row.icon} color={row.color} />
                  </View>

                  <View style={styles.body}>
                    <Text style={[styles.name, { color: row.color }]}>
                      {row.name}
                    </Text>
                    <Text style={styles.desc}>{row.description}</Text>
                    <View style={styles.labelsRow}>
                      {row.labels.map((lbl) => (
                        <Text
                          key={lbl}
                          style={[styles.label, { color: LABEL_COLORS[lbl] }]}
                        >
                          {lbl}
                        </Text>
                      ))}
                    </View>
                  </View>

                  <View style={styles.qtyCol}>
                    <Text style={styles.qty}>{qty}</Text>
                    <Text style={styles.owned}>OWNED</Text>
                    {low ? (
                      <Pressable
                        onPress={() =>
                          navigation.navigate('Shop', { initialTab: 'powerup' })
                        }
                      >
                        <Text style={styles.shopLink}>SHOP</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            })
          : null}

        <NeonButton
          label="OPEN SHOP"
          color={colors.purple}
          onPress={() => navigation.navigate('Shop', { initialTab: 'powerup' })}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  scroll: { padding: 16, gap: 10, paddingBottom: 28 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  x2: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 18,
  },
  body: { flex: 1, gap: 3 },
  name: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  desc: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  labelsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  label: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    letterSpacing: 0.3,
  },
  qtyCol: { alignItems: 'center', minWidth: 52 },
  qty: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 22,
    color: colors.white,
  },
  owned: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    color: colors.muted,
  },
  shopLink: {
    marginTop: 4,
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 9,
    color: colors.purple,
  },
});
