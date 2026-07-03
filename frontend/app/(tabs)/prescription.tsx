import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { colors, radius, spacing } from '@/src/theme';
import { api, Prescription, Doctor } from '@/src/api';
import PrescriptionCard from '@/src/components/PrescriptionCard';

type Group = { key: string; label: string; items: Prescription[] };

export default function PrescriptionScreen() {
  const insets = useSafeAreaInsets();
  const [rx, setRx] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'All' | string>('All');

  const load = useCallback(async () => {
    try {
      const [r, d] = await Promise.all([api.prescriptions(), api.doctors()]);
      setRx(r);
      setDoctors(d);
    } catch (e) {
      console.log('rx err', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (filter === 'All') return rx;
    return rx.filter((r) => r.doctor_id === filter);
  }, [rx, filter]);

  const groups: Group[] = useMemo(() => {
    const map = new Map<string, Prescription[]>();
    for (const r of filtered) {
      const key = dayjs(r.date).format('MMMM YYYY');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).map(([label, items]) => ({ key: label, label, items }));
  }, [filtered]);

  return (
    <View style={styles.container} testID="prescription-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={styles.hSub}>All your</Text>
          <Text style={styles.hTitle}>Prescriptions</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="document-text" size={14} color={colors.brandPrimary} />
          <Text style={styles.badgeTxt}>{rx.length}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        <TouchableOpacity
          testID="rx-filter-All"
          onPress={() => setFilter('All')}
          activeOpacity={0.85}
          style={[styles.chip, filter === 'All' && styles.chipActive]}
        >
          <Text style={[styles.chipTxt, filter === 'All' && styles.chipTxtActive]}>All</Text>
        </TouchableOpacity>
        {doctors.map((d) => {
          const active = filter === d.id;
          return (
            <TouchableOpacity
              key={d.id}
              testID={`rx-filter-${d.id}`}
              onPress={() => setFilter(d.id)}
              activeOpacity={0.85}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipTxt, active && styles.chipTxtActive]} numberOfLines={1}>{d.name.replace('Dr. ', '')}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.brandPrimary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.brandPrimary}
            />
          }
        >
          {groups.length === 0 ? (
            <View style={styles.empty} testID="rx-empty">
              <View style={styles.emptyIcon}>
                <Ionicons name="medkit-outline" size={28} color={colors.brandPrimary} />
              </View>
              <Text style={styles.emptyT}>No prescriptions yet</Text>
              <Text style={styles.emptyS}>Your prescriptions will appear here.</Text>
            </View>
          ) : (
            groups.map((g) => (
              <View key={g.key} style={{ gap: spacing.md }}>
                <Text style={styles.groupTitle}>{g.label}</Text>
                {g.items.map((r) => {
                  const doc = doctors.find((d) => d.id === r.doctor_id);
                  return <PrescriptionCard key={r.id} prescription={r} doctor={doc} />;
                })}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  hSub: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  hTitle: { fontSize: 26, color: colors.onSurface, fontWeight: '500', marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  badgeTxt: { fontSize: 12, color: colors.brandPrimary, fontWeight: '500' },
  chipScroll: { maxHeight: 56, marginTop: spacing.md },
  chipRow: { paddingHorizontal: spacing.xl, gap: spacing.sm, alignItems: 'center', height: 56 },
  chip: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipTxt: { fontSize: 12, color: colors.onSurfaceSecondary, fontWeight: '500' },
  chipTxtActive: { color: '#FFFFFF' },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: 140,
    gap: spacing.xl,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  groupTitle: { fontSize: 13, color: colors.muted, fontWeight: '500', letterSpacing: 0.4, textTransform: 'uppercase' },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyT: { fontSize: 16, color: colors.onSurface, fontWeight: '500' },
  emptyS: { fontSize: 12, color: colors.muted },
});
