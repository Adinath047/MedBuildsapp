import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '@/src/theme';
import { api, Doctor } from '@/src/api';
import DoctorCard from '@/src/components/DoctorCard';

const FILTERS = ['All', 'Cardiologist', 'Dermatologist', 'General Physician', 'Neurologist'];

export default function MyDocsScreen() {
  const insets = useSafeAreaInsets();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('All');

  const load = useCallback(async () => {
    try {
      const d = await api.doctors();
      setDoctors(d);
    } catch (e) {
      console.log('doctors err', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchQ = !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q);
      const matchF = filter === 'All' || d.specialty === filter;
      return matchQ && matchF;
    });
  }, [doctors, query, filter]);

  return (
    <View style={styles.container} testID="mydocs-screen">
      <LinearGradient
        colors={['#EAF3FF', '#F8FAFC']}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.hSub}>Your care team</Text>
            <Text style={styles.hTitle}>My Doctors</Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countPillTxt}>{doctors.length} connected</Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            testID="mydocs-search"
            placeholder="Search doctor, specialty, hospital"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} testID="mydocs-search-clear">
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipRowScroll}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              testID={`filter-chip-${f}`}
              onPress={() => setFilter(f)}
              activeOpacity={0.85}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{f}</Text>
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
          {list.length === 0 ? (
            <View style={styles.empty} testID="mydocs-empty">
              <Ionicons name="search" size={28} color={colors.muted} />
              <Text style={styles.emptyT}>No doctors found</Text>
              <Text style={styles.emptyS}>Try a different search or filter.</Text>
            </View>
          ) : (
            list.map((d) => (
              <DoctorCard key={d.id} doctor={d} showConsulted />
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
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  hSub: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  hTitle: { fontSize: 26, color: colors.onSurface, fontWeight: '500', marginTop: 2 },
  countPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  countPillTxt: { fontSize: 11, color: colors.brandPrimary, fontWeight: '500' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.onSurface, padding: 0 },
  chipRowScroll: { maxHeight: 56, marginTop: spacing.md },
  chipRow: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
    height: 56,
  },
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
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipTxt: { fontSize: 12, color: colors.onSurfaceSecondary, fontWeight: '500' },
  chipTxtActive: { color: '#FFFFFF' },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: 140,
    gap: spacing.md,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyT: { fontSize: 15, color: colors.onSurface, fontWeight: '500' },
  emptyS: { fontSize: 12, color: colors.muted },
});
