import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HelpCircle,
  Shield,
  Snowflake,
  Zap,
} from 'lucide-react-native';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type TrayItem = {
  id: 'bomb' | 'freeze' | 'shield' | 'wild';
  name: string;
  quantity: number;
  selected: boolean;
  color: string;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: TrayItem[];
  disabled?: boolean;
  lockedReason?: string | null;
};

function ItemIcon({
  id,
  color,
}: {
  id: TrayItem['id'];
  color: string;
}) {
  if (id === 'bomb') return <Zap size={20} color={color} />;
  if (id === 'freeze') return <Snowflake size={20} color={color} />;
  if (id === 'shield') return <Shield size={20} color={color} />;
  return <HelpCircle size={20} color={color} />;
}

export function PowerUpTray({
  visible,
  onClose,
  items,
  disabled = false,
  lockedReason = null,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
          // Prevent backdrop close when tapping sheet
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.title}>POWER-UPS</Text>
          {lockedReason ? (
            <Text style={styles.locked}>{lockedReason}</Text>
          ) : null}
          <View style={styles.grid}>
            {items.map((item) => {
              const unavailable =
                disabled || lockedReason != null || item.quantity <= 0;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, ${item.quantity} remaining`}
                  accessibilityState={{
                    disabled: unavailable && !item.selected,
                    selected: item.selected,
                  }}
                  disabled={unavailable && !item.selected}
                  onPress={() => {
                    item.onPress();
                    onClose();
                  }}
                  style={[
                    styles.card,
                    {
                      borderColor: item.selected
                        ? item.color
                        : withAlpha(item.color, 0.35),
                      backgroundColor: withAlpha(
                        item.color,
                        item.selected ? 0.2 : 0.1,
                      ),
                      opacity: unavailable && !item.selected ? 0.45 : 1,
                    },
                    item.selected ? neonGlow(item.color, 8) : null,
                  ]}
                >
                  <ItemIcon id={item.id} color={item.color} />
                  <Text style={[styles.name, { color: item.color }]}>
                    {item.name}
                  </Text>
                  <Text style={styles.qty}>×{item.quantity}</Text>
                  {item.selected ? (
                    <Text style={[styles.state, { color: item.color }]}>
                      ACTIVE
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close power-ups"
            onPress={onClose}
            style={styles.closeBtn}
          >
            <Text style={styles.closeText}>CLOSE</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: withAlpha('#000', 0.65),
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.25),
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  title: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 13,
    color: colors.white,
    letterSpacing: 2,
    textAlign: 'center',
  },
  locked: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '47%',
    flexGrow: 1,
    minHeight: 88,
    borderRadius: radii.card,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  qty: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 14,
    color: colors.white,
  },
  state: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
  },
  closeBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: withAlpha(colors.muted, 0.4),
  },
  closeText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1,
  },
});
