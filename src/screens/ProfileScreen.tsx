import React, { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, Pencil } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { BottomNavigation } from '../components/BottomNavigation';
import { CurrencyChip } from '../components/CurrencyChip';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import type { MissionDefinition } from '../missions/missionTypes';
import type { BottomNavRoute, RootStackParamList } from '../navigation/navigationTypes';
import type {
  LifetimeStats,
  PlayerProfile,
} from '../progression/progressionTypes';
import { getLevelProgress, getRankTitleForLevel } from '../progression/xpSystem';
import { validateUsername } from '../progression/username';
import {
  countClaimableMissions,
  getActiveMissionDefinitions,
  getDailyMissionState,
  getWeeklyMissionState,
} from '../storage/missionStorage';
import {
  getLifetimeStats,
  getPlayerProfile,
  updatePlayerProfile,
} from '../storage/playerStorage';
import { GAME_THEMES } from '../themes/gameThemes';
import { useGameTheme } from '../themes/GameThemeProvider';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type MissionPreview = {
  def: MissionDefinition;
  progress: number;
  target: number;
  ratio: number;
};

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { selectTheme, refreshThemes } = useGameTheme();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [stats, setStats] = useState<LifetimeStats | null>(null);
  const [missions, setMissions] = useState<MissionPreview[]>([]);
  const [claimable, setClaimable] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [p, s, daily, weekly, c] = await Promise.all([
      getPlayerProfile(),
      getLifetimeStats(),
      getDailyMissionState(),
      getWeeklyMissionState(),
      countClaimableMissions(),
    ]);
    setProfile(p);
    setStats(s);
    setClaimable(c);
    await refreshThemes();

    const dailyDefs = getActiveMissionDefinitions('daily').definitions;
    const weeklyDefs = getActiveMissionDefinitions('weekly').definitions;
    const previews: MissionPreview[] = [];
    for (const def of [...dailyDefs, ...weeklyDefs]) {
      const state = def.period === 'daily' ? daily : weekly;
      const prog = state.missions.find((m) => m.missionId === def.id);
      if (!prog || prog.claimed) continue;
      previews.push({
        def,
        progress: prog.progress,
        target: def.target,
        ratio: prog.progress / def.target,
      });
    }
    previews.sort((a, b) => b.ratio - a.ratio);
    setMissions(previews.slice(0, 2));
  }, [refreshThemes]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const onBottomNav = (route: BottomNavRoute) => {
    if (route === 'Profile') return;
    navigation.navigate(route);
  };

  const saveUsername = async () => {
    const result = validateUsername(nameDraft);
    if (!result.ok) {
      setNameError(result.error ?? 'Invalid username');
      return;
    }
    const next = await updatePlayerProfile({ username: result.value });
    setProfile(next);
    setEditOpen(false);
    setNameError(null);
  };

  if (!profile || !stats) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Text style={styles.loading}>Loading profile…</Text>
      </View>
    );
  }

  const progress = getLevelProgress(profile);
  const rankTitle = getRankTitleForLevel(profile.level);

  const statCards = [
    {
      label: 'Highest Classic',
      value: stats.highestClassicScore.toLocaleString(),
      color: colors.yellow,
    },
    {
      label: 'Games Played',
      value: String(stats.gamesPlayed),
      color: colors.electricBlue,
    },
    {
      label: 'Best Combo',
      value: `x${stats.highestComboMultiplier}`,
      color: colors.orange,
    },
    {
      label: 'Ranked Wins',
      value: String(stats.rankedWins),
      color: colors.green,
    },
    {
      label: 'Perfect Clears',
      value: String(stats.totalPerfectClears),
      color: colors.cyan,
    },
    {
      label: 'Tiles Placed',
      value: stats.totalTilesPlaced.toLocaleString(),
      color: colors.purple,
    },
    {
      label: 'Daily Games',
      value: String(stats.dailyGamesPlayed),
      color: colors.orange,
    },
    {
      label: 'Ranked Tier',
      value: '—',
      color: colors.muted,
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <View style={styles.header}>
        <Text style={[styles.heading, neonGlow(colors.electricBlue, 4)]}>
          PROFILE
        </Text>
        <CurrencyChip coins={profile.coins} gems={profile.gems} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.avatarCard, neonGlow(colors.neonPink, 6)]}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, neonGlow(colors.neonPink, 10)]}>
              <Text style={styles.avatarGlyph}>NR</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{profile.level}</Text>
            </View>
          </View>
          <View style={styles.avatarMeta}>
            <View style={styles.nameRow}>
              <Text style={[styles.username, neonGlow(colors.neonPink, 4)]}>
                {profile.username}
              </Text>
              <Pressable
                accessibilityLabel="Edit username"
                onPress={() => {
                  setNameDraft(profile.username);
                  setNameError(null);
                  setEditOpen(true);
                }}
                hitSlop={8}
              >
                <Pencil size={14} color={colors.muted} />
              </Pressable>
            </View>
            <Text style={styles.rankTitle}>{rankTitle}</Text>
            <Text style={styles.xpLine}>
              {progress.currentXp.toLocaleString()} /{' '}
              {progress.requiredXp.toLocaleString()} XP
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${progress.progressPercentage}%` },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {statCards.map((s) => (
            <View
              key={s.label}
              style={[
                styles.statCard,
                { borderColor: withAlpha(s.color, 0.35) },
              ]}
            >
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text
                style={[styles.statValue, { color: s.color }, neonGlow(s.color, 4)]}
              >
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>UNLOCKED THEMES</Text>
          <Pressable onPress={() => navigation.navigate('Shop')}>
            <Text style={styles.link}>View All</Text>
          </Pressable>
        </View>
        <View style={styles.themesRow}>
          {GAME_THEMES.map((theme) => {
            const unlocked = profile.unlockedThemeIds.includes(theme.id);
            const active = profile.selectedThemeId === theme.id;
            return (
              <Pressable
                key={theme.id}
                disabled={!unlocked}
                onPress={() => {
                  if (unlocked) void selectTheme(theme.id).then(() => refresh());
                }}
                style={[
                  styles.themeChip,
                  {
                    borderColor: withAlpha(theme.colors.primary, unlocked ? 0.55 : 0.2),
                    opacity: unlocked ? 1 : 0.35,
                    backgroundColor: withAlpha(theme.colors.primary, 0.12),
                  },
                  active ? neonGlow(theme.colors.primary, 6) : null,
                ]}
              >
                {active ? (
                  <Check size={12} color={theme.colors.primary} />
                ) : (
                  <View
                    style={[
                      styles.themeDot,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>ACTIVE MISSIONS</Text>
          <Pressable onPress={() => navigation.navigate('Missions')}>
            <Text style={styles.link}>All</Text>
          </Pressable>
        </View>
        {missions.length === 0 ? (
          <Text style={styles.emptyMissions}>No active missions nearby.</Text>
        ) : (
          missions.map((m) => (
            <View
              key={m.def.id}
              style={[
                styles.missionCard,
                { borderColor: withAlpha(colors.electricBlue, 0.3) },
              ]}
            >
              <Text style={styles.missionTitle}>{m.def.title}</Text>
              <Text style={styles.missionProg}>
                {m.progress.toLocaleString()} / {m.target.toLocaleString()}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, m.ratio * 100)}%`,
                      backgroundColor: colors.electricBlue,
                    },
                  ]}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNavigation
        activeRoute="Profile"
        onNavigate={onBottomNav}
        missionsBadgeCount={claimable}
      />

      <Modal transparent visible={editOpen} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>EDIT USERNAME</Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              maxLength={16}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              placeholder="NeonPlayer"
              placeholderTextColor={colors.muted}
            />
            {nameError ? (
              <Text style={styles.error}>{nameError}</Text>
            ) : (
              <Text style={styles.hint}>3–16 letters, numbers, spaces, _</Text>
            )}
            <View style={styles.modalActions}>
              <NeonButton
                label="CANCEL"
                color={colors.muted}
                size="small"
                fullWidth={false}
                onPress={() => setEditOpen(false)}
              />
              <NeonButton
                label="SAVE"
                color={colors.neonPink}
                size="small"
                fullWidth={false}
                onPress={() => void saveUsername()}
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
  loading: {
    color: colors.muted,
    fontFamily: fontFamilies.rajdhaniBold,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heading: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
    color: colors.white,
    letterSpacing: 2,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  avatarCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.neonPink, 0.35),
    padding: 16,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: colors.neonPink,
    backgroundColor: withAlpha(colors.purple, 0.45),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyph: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 18,
    color: colors.white,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.yellow,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  levelBadgeText: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 9,
    color: '#000',
  },
  avatarMeta: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  username: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 16,
    color: colors.neonPink,
  },
  rankTitle: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  xpLine: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 10,
    color: colors.muted,
  },
  barTrack: {
    height: 5,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.neonPink,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  statLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.muted,
  },
  statValue: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 16,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 2,
  },
  link: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    color: colors.cyan,
  },
  themesRow: { flexDirection: 'row', gap: 8 },
  themeChip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeDot: { width: 10, height: 10, borderRadius: 5 },
  missionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  missionTitle: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: colors.white,
  },
  missionProg: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 10,
    color: colors.muted,
  },
  emptyMissions: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: withAlpha('#000', 0.7),
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.neonPink, 0.4),
    padding: 18,
    gap: 10,
  },
  modalTitle: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 12,
    color: colors.white,
    letterSpacing: 1,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.35),
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.white,
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 16,
  },
  error: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    color: colors.red,
  },
  hint: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 11,
    color: colors.muted,
  },
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
});
