import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import { colors, radius, spacing, shadowCard, shadowFab } from '@/src/theme';
import { api, Doctor, Appointment, Prescription } from '@/src/api';
import Avatar from '@/src/components/Avatar';
import StatusBadge from '@/src/components/StatusBadge';
import PrescriptionCard from '@/src/components/PrescriptionCard';

const shadowSoftBottom = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: -6 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  elevation: 12,
};

export default function DoctorOverview() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [d, a, r] = await Promise.all([
        api.doctor(id),
        api.appointments(id),
        api.prescriptions(id),
      ]);
      setDoctor(d);
      setAppointments(a);
      setPrescriptions(r);
    } catch (e) {
      console.log('doctor overview err', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading || !doctor) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="doctor-overview">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Hero */}
        <LinearGradient
          colors={['#EAF3FF', '#E6FBF3', '#F8FAFC']}
          style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}
        >
          <View style={styles.topRow}>
            <TouchableOpacity
              testID="doctor-back"
              onPress={() => router.back()}
              style={styles.iconBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Doctor Profile</Text>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
              <Ionicons name="heart-outline" size={20} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroBody}>
            <View style={styles.avatarWrap}>
              <Avatar
                uri={doctor.avatar}
                initials={doctor.initials}
                color={doctor.color}
                size={110}
              />
            </View>
            <Text style={styles.name}>{doctor.name}</Text>
            <Text style={styles.spec}>{doctor.specialty}</Text>
            <View style={styles.hospitalWrap}>
              <Ionicons name="business-outline" size={12} color={colors.muted} />
              <Text style={styles.hospital}>{doctor.hospital}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}><Ionicons name="star" size={14} color="#F59E0B" /></View>
                <Text style={styles.statVal}>{doctor.rating.toFixed(1)}</Text>
                <Text style={styles.statLbl}>Rating</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIcon}><Ionicons name="briefcase" size={14} color={colors.brandPrimary} /></View>
                <Text style={styles.statVal}>{doctor.experience_years}y</Text>
                <Text style={styles.statLbl}>Experience</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIcon}><Ionicons name="cash-outline" size={14} color={colors.brandSecondary} /></View>
                <Text style={styles.statVal}>₹{doctor.fee}</Text>
                <Text style={styles.statLbl}>Fee</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Appointments till date */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Appointments till date</Text>
            <View style={styles.countBadge}><Text style={styles.countBadgeTxt}>{appointments.length}</Text></View>
          </View>
          {appointments.length === 0 ? (
            <Text style={styles.emptyLine}>No visits yet.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {appointments.map((a) => (
                <View key={a.id} style={[styles.aptRow, shadowCard]} testID={`hist-apt-${a.id}`}>
                  <View style={[styles.aptDot, { backgroundColor: a.status === 'confirmed' ? colors.brandSecondary : colors.brandPrimary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.aptDate}>{dayjs(a.date).format('ddd, DD MMM YYYY')}</Text>
                    <Text style={styles.aptMeta}>{a.time} • {a.type}</Text>
                    {a.reason ? <Text style={styles.aptReason} numberOfLines={1}>{a.reason}</Text> : null}
                  </View>
                  <StatusBadge status={a.status} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Prescriptions */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Prescriptions</Text>
            <View style={styles.countBadge}><Text style={styles.countBadgeTxt}>{prescriptions.length}</Text></View>
          </View>
          {prescriptions.length === 0 ? (
            <Text style={styles.emptyLine}>No prescriptions from this doctor.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {prescriptions.map((r) => (
                <PrescriptionCard key={r.id} prescription={r} doctor={doctor} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Book Again */}
      <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.feeInfo}>
          <Text style={styles.feeLbl}>Consultation Fee</Text>
          <Text style={styles.feeVal}>₹{doctor.fee}</Text>
        </View>
        <TouchableOpacity
          testID="book-again-btn"
          activeOpacity={0.85}
          onPress={() => router.push(`/book/${doctor.id}`)}
          style={[styles.bookBtn, shadowFab]}
        >
          <LinearGradient
            colors={[colors.brandPrimary, colors.brandSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookBtnGradient}
          >
            <Text style={styles.bookBtnTxt}>Book Again</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: { alignItems: 'center', justifyContent: 'center' },
  hero: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    ...shadowCard,
  },
  topTitle: { fontSize: 14, color: colors.onSurface, fontWeight: '500' },
  heroBody: { alignItems: 'center', gap: 4 },
  avatarWrap: {
    padding: 4, borderRadius: 60, backgroundColor: '#FFFFFF', ...shadowCard,
    marginBottom: spacing.md,
  },
  name: { fontSize: 20, color: colors.onSurface, fontWeight: '500' },
  spec: { fontSize: 13, color: colors.brandPrimary, fontWeight: '500' },
  hospitalWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  hospital: { fontSize: 12, color: colors.muted },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, width: '100%' },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', padding: spacing.md, borderRadius: radius.lg,
    alignItems: 'center', gap: 4, ...shadowCard,
  },
  statIcon: { marginBottom: 2 },
  statVal: { fontSize: 14, color: colors.onSurface, fontWeight: '500' },
  statLbl: { fontSize: 10, color: colors.muted, fontWeight: '500' },

  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl, gap: spacing.md },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 15, color: colors.onSurface, fontWeight: '500' },
  countBadge: {
    minWidth: 24, height: 22, paddingHorizontal: 8, borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary, alignItems: 'center', justifyContent: 'center',
  },
  countBadgeTxt: { fontSize: 11, color: colors.brandPrimary, fontWeight: '500' },
  aptRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, backgroundColor: '#FFFFFF', borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.divider,
  },
  aptDot: { width: 8, height: 8, borderRadius: 4 },
  aptDate: { fontSize: 13, color: colors.onSurface, fontWeight: '500' },
  aptMeta: { fontSize: 11, color: colors.muted, marginTop: 2 },
  aptReason: { fontSize: 11, color: colors.onSurfaceSecondary, marginTop: 2 },
  emptyLine: { fontSize: 12, color: colors.muted, fontStyle: 'italic' },

  stickyBar: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    ...shadowSoftBottom,
  } as any,
  feeInfo: { flex: 0.9 },
  feeLbl: { fontSize: 10, color: colors.muted, fontWeight: '500' },
  feeVal: { fontSize: 18, color: colors.onSurface, fontWeight: '500', marginTop: 2 },
  bookBtn: { flex: 1.4, borderRadius: radius.pill, overflow: 'hidden' },
  bookBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, paddingHorizontal: spacing.lg,
  },
  bookBtnTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
});
