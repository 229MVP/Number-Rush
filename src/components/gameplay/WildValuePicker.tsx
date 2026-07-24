import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type Props = {
  visible: boolean;
  selectedValue: number | null;
  onSelect: (value: number) => void;
  onConfirm: (value: number) => void;
  onCancel: () => void;
};

const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function WildValuePicker({
  visible,
  selectedValue,
  onSelect,
  onConfirm,
  onCancel,
}: Props) {
  const [draft, setDraft] = useState<number | null>(selectedValue);

  useEffect(() => {
    if (visible) setDraft(selectedValue);
  }, [visible, selectedValue]);

  useEffect(() => {
    if (!visible || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setDraft((v) => {
          const next = v == null ? 1 : Math.min(10, v + 1);
          onSelect(next);
          return next;
        });
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setDraft((v) => {
          const next = v == null ? 1 : Math.max(1, v - 1);
          onSelect(next);
          return next;
        });
      }
      if (e.key === 'Enter' && draft != null) {
        e.preventDefault();
        onConfirm(draft);
      }
      const num = Number.parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        setDraft(num);
        onSelect(num);
      }
      if (e.key === '0') {
        setDraft(10);
        onSelect(10);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, draft, onCancel, onConfirm, onSelect]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, neonGlow(colors.purple, 10)]}>
          <Text style={styles.title}>WILD VALUE</Text>
          <Text style={styles.sub}>Choose 1 through 10</Text>
          <View style={styles.grid}>
            {VALUES.map((n) => {
              const on = draft === n;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityLabel={`Wild value ${n}`}
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    setDraft(n);
                    onSelect(n);
                  }}
                  style={[
                    styles.cell,
                    on && styles.cellOn,
                    on ? neonGlow(colors.purple, 6) : null,
                  ]}
                >
                  <Text style={[styles.cellText, on && styles.cellTextOn]}>
                    {n}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel wild"
              onPress={onCancel}
              style={styles.cancel}
            >
              <Text style={styles.cancelText}>CANCEL</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Use wild value"
              disabled={draft == null}
              onPress={() => {
                if (draft != null) onConfirm(draft);
              }}
              style={[
                styles.use,
                draft == null && styles.useDisabled,
                draft != null ? neonGlow(colors.purple, 8) : null,
              ]}
            >
              <Text style={styles.useText}>USE VALUE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: withAlpha('#000', 0.72),
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.purple, 0.5),
    padding: 18,
    gap: 12,
  },
  title: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
    color: colors.purple,
    letterSpacing: 2,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  cell: {
    width: 56,
    height: 48,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: withAlpha(colors.purple, 0.35),
    backgroundColor: withAlpha(colors.purple, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellOn: {
    borderColor: colors.purple,
    backgroundColor: withAlpha(colors.purple, 0.28),
  },
  cellText: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 16,
    color: colors.muted,
  },
  cellTextOn: { color: colors.white },
  actions: { flexDirection: 'row', gap: 10 },
  cancel: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: withAlpha(colors.muted, 0.4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 11,
    color: colors.muted,
  },
  use: {
    flex: 1.4,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.purple,
    backgroundColor: withAlpha(colors.purple, 0.25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  useDisabled: { opacity: 0.4 },
  useText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 11,
    color: colors.white,
  },
});
