import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/src/theme';
import { api, Appointment, Doctor } from '@/src/api';
import AppointmentCard from '@/src/components/AppointmentCard';

export default function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [a, d] = await Promise.all([api.appointments(), api.doctors()]);
      setAppointments(a);
      setDoctors(d);
    } catch (e) {
      console.log('appts err', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const list = useMemo(() => {
    if (tab === 'upcoming') return appointments.filter((a) => a.status === 'confirmed');
    return appointments.filter((a) => a.status !== 'confirmed');
  }, [appointments, tab]);

  return (
    <View style={styles.container} testID="appointments-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={styles.hSub}>Manage your</Text>
          <Text style={styles.hTitle}>Appointments</Text>
        </View>
        <TouchableOpacity
          testID="book-new-btn"
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/mydocs')}
          style={styles.bookBtn}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.bookBtnTxt}>Book</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segmentWrap}>
        <View style={styles.segment} testID="appointments-tabs">
          {(['upcoming', 'past'] as const).map((k) => (
            <TouchableOpacity
              key={k}
              testID={`tab-${k}`}
              activeOpacity={0.85}
              onPress={() => setTab(k)}
              style={[styles.segItem, tab === k && styles.segItemActive]}
            >
              <Text style={[styles.segTxt, tab === k && styles.segTxtActive]}>
                {k === 'upcoming' ? 'Upcoming' : 'Past'}
              </Text>
              <View style={[styles.count, tab === k && styles.countActive]}>
                <Text style={[styles.countTxt, tab === k && styles.countTxtActive]}>
                  {k === 'upcoming'
                    ? appointments.filter((a) => a.status === 'confirmed').length
                    : appointments.filter((a) => a.status !== 'confirmed').length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
            <View style={styles.empty} testID="appointments-empty">
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={32} color={colors.brandPrimary} />
              </View>
              <Text style={styles.emptyT}>No {tab} appointments</Text>
              <Text style={styles.emptyS}>Book a consultation to get started.</Text>
              <TouchableOpacity
                testID="empty-book-btn"
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/mydocs')}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnTxt}>Find a doctor</Text>
              </TouchableOpacity>
            </View>
          ) : (
            list.map((apt) => {
              const doc = doctors.find((d) => d.id === apt.doctor_id);
              return (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  doctor={doc}
                  onView={() => doc && router.push(`/doctor/${doc.id}`)}
                  onPrimary={() => doc && router.push(`/book/${doc.id}`)}
                />
              );
            })
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
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  bookBtnTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '500' },
  segmentWrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceTertiary,
    padding: 4,
    borderRadius: radius.pill,
  },
  segItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  segItemActive: { backgroundColor: '#FFFFFF' },
  segTxt: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  segTxtActive: { color: colors.onSurface },
  count: {
    minWidth: 22,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  countActive: { backgroundColor: colors.brandTertiary },
  countTxt: { fontSize: 10, color: colors.muted, fontWeight: '500' },
  countTxtActive: { color: colors.brandPrimary },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 140,
    gap: spacing.md,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyT: { fontSize: 16, color: colors.onSurface, fontWeight: '500' },
  emptyS: { fontSize: 13, color: colors.muted },
  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  emptyBtnTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
});
