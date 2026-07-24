import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import type { RootStackParamList } from '../navigation/navigationTypes';
import type { SyncConflict } from '../sync/syncTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SyncConflict'>;

type Resolution = 'local' | 'cloud' | 'merge';

export function SyncConflictScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const conflicts: SyncConflict[] = route.params.conflicts;
  const [choice, setChoice] = useState<Resolution | null>(null);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('CloudSync');
  };

  const apply = () => {
    // Resolution is applied by sync layer when wired; screen records user intent.
    goBack();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="screen-sync-conflict">
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar title="SYNC CONFLICT" accent={colors.orange} onBack={goBack} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>
          Local and cloud progress differ. Choose which copy to keep.
        </Text>

        {conflicts.map((conflict) => (
          <View
            key={conflict.domain}
            style={[styles.domainCard, neonGlow(colors.orange, 4)]}
          >
            <Text style={styles.domainTitle}>{conflict.domain.toUpperCase()}</Text>
            {conflict.fields.slice(0, 6).map((field) => (
              <View key={field.field} style={styles.fieldRow}>
                <Text style={styles.fieldName}>{field.field}</Text>
                <Text style={styles.fieldVal}>
                  Local: {String(field.localValue)} · Cloud:{' '}
                  {String(field.cloudValue)}
                </Text>
              </View>
            ))}
            {conflict.fields.length > 6 ? (
              <Text style={styles.more}>
                +{conflict.fields.length - 6} more fields
              </Text>
            ) : null}
          </View>
        ))}

        <View style={styles.choices}>
          {(
            [
              ['local', 'KEEP LOCAL', colors.electricBlue],
              ['cloud', 'USE CLOUD', colors.cyan],
              ['merge', 'MERGE SAFELY', colors.green],
            ] as const
          ).map(([id, label, color]) => (
            <NeonButton
              key={id}
              label={label}
              color={color}
              size="small"
              onPress={() => setChoice(id)}
              style={
                choice === id
                  ? { borderWidth: 2, borderColor: color }
                  : undefined
              }
            />
          ))}
        </View>

        <NeonButton
          testID="sync-conflict-apply"
          label="APPLY CHOICE"
          color={colors.neonPink}
          size="large"
          disabled={!choice}
          onPress={apply}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  intro: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  domainCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.orange, 0.35),
    padding: 14,
    gap: 8,
  },
  domainTitle: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.orange,
  },
  fieldRow: { gap: 2 },
  fieldName: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: colors.white,
  },
  fieldVal: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 11,
    color: colors.muted,
  },
  more: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 11,
    color: colors.muted,
  },
  choices: { gap: 8, marginTop: 4 },
});
