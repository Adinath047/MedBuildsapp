import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

const MAP: Record<string, { bg: string; fg: string; label: string }> = {
  confirmed: { bg: '#DCFCE7', fg: '#047857', label: 'Confirmed' },
  completed: { bg: '#DBEAFE', fg: '#1D4ED8', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', fg: '#B91C1C', label: 'Cancelled' },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] || { bg: colors.surfaceTertiary, fg: colors.onSurfaceTertiary, label: status };
  return (
    <View style={[styles.wrap, { backgroundColor: s.bg }]}>
      <View style={[styles.dot, { backgroundColor: s.fg }]} />
      <Text style={[styles.txt, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  txt: {
    fontSize: 11,
    fontWeight: '500',
  },
});
