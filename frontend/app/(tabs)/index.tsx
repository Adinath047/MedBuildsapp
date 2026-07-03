import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import dayjs from 'dayjs';

import { colors, radius, spacing, shadowCard, specialties } from '@/src/theme';
import { api, Doctor, Appointment, HealthTip, Patient, Prescription } from '@/src/api';
import Avatar from '@/src/components/Avatar';
import DoctorCard from '@/src/components/DoctorCard';

const { width: SCREEN_W } = Dimensions.get('window');
const TIP_W = SCREEN_W - spacing.xl * 2;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [tips, setTips] = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, d, a, r, t] = await Promise.all([
        api.patient(),
        api.doctors(),
        api.appointments(),
        api.prescriptions(),
        api.healthTips(),
      ]);
      setPatient(p);
      setDoctors(d);
      setAppointments(a);
      setPrescriptions(r);
      setTips(t);
    } catch (e) {
      console.log('home load error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const upcoming = appointments
    .filter((a) => a.status === 'confirmed')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const upcomingDoctor = upcoming ? doctors.find((d) => d.id === upcoming.doctor_id) : undefined;
  const latestRx = prescriptions[0];
  const latestRxDoctor = latestRx ? doctors.find((d) => d.id === latestRx.doctor_id) : undefined;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]} testID="home-loading">
        <ActivityIndicator color={colors.brandPrimary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="home-screen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.brandPrimary}
          />
        }
      >
        {/* Gradient header area with top bar + welcome banner */}
        <LinearGradient
          colors={['#EAF3FF', '#E6FBF3', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerBg, { paddingTop: insets.top + spacing.md }]}
        >
          <View style={styles.topBar}>
            <View style={styles.locWrap} testID="home-location">
              <View style={styles.locIcon}>
                <Ionicons name="location" size={14} color={colors.brandPrimary} />
              </View>
              <View>
                <Text style={styles.locSmall}>Your location</Text>
                <Text style={styles.locBig}>{patient?.location}</Text>
              </View>
            </View>

            <TouchableOpacity
              testID="home-avatar"
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.85}
              style={styles.avatarBtn}
            >
              <Avatar uri={patient?.avatar} size={44} />
            </TouchableOpacity>
          </View>

          {/* Welcome Banner */}
          <View style={[styles.banner, shadowCard]}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.bannerGreeting}>{greeting()},</Text>
              <Text style={styles.bannerName}>{patient?.name?.split(' ')[0]} 👋</Text>
              <Text style={styles.bannerLine}>
                Your health journey, all in one place.
              </Text>
              <TouchableOpacity
                testID="banner-find-doctor"
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/mydocs')}
                style={styles.bannerBtn}
              >
                <Text style={styles.bannerBtnTxt}>Find a doctor</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.bannerIllust}>
              <LinearGradient
                colors={['#DBEAFE', '#DCFCE7']}
                style={styles.illustBg}
              />
              <Ionicons name="pulse" size={44} color={colors.brandPrimary} style={{ position: 'absolute' }} />
              <View style={styles.miniPill}>
                <Ionicons name="heart" size={12} color="#EF4444" />
                <Text style={styles.miniPillTxt}>72 bpm</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick cards row */}
        <View style={styles.quickRow}>
          {upcoming && upcomingDoctor ? (
            <TouchableOpacity
              testID="quick-upcoming"
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/appointments')}
              style={[styles.quickCard, shadowCard]}
            >
              <View style={[styles.quickIcon, { backgroundColor: colors.blueTint }]}>
                <Ionicons name="calendar" size={18} color={colors.brandPrimary} />
              </View>
              <Text style={styles.quickTitle}>Next Visit</Text>
              <Text style={styles.quickBig} numberOfLines={1}>{dayjs(upcoming.date).format('MMM D')}, {upcoming.time}</Text>
              <Text style={styles.quickSub} numberOfLines={1}>{upcomingDoctor.name}</Text>
            </TouchableOpacity>
          ) : null}
          {latestRx && latestRxDoctor ? (
            <TouchableOpacity
              testID="quick-prescription"
              activeOpacity={0.85}
              onPress={() => router.push(`/prescription/${latestRx.id}`)}
              style={[styles.quickCard, shadowCard]}
            >
              <View style={[styles.quickIcon, { backgroundColor: colors.mintTint }]}>
                <Ionicons name="medkit" size={18} color={colors.brandSecondary} />
              </View>
              <Text style={styles.quickTitle}>Latest Rx</Text>
              <Text style={styles.quickBig} numberOfLines={1}>{latestRx.title}</Text>
              <Text style={styles.quickSub} numberOfLines={1}>{latestRxDoctor.name}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Specialties */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <TouchableOpacity><Text style={styles.sectionLink}>See all</Text></TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specRow}
          >
            {specialties.map((s) => (
              <TouchableOpacity
                key={s.key}
                testID={`specialty-${s.key}`}
                activeOpacity={0.8}
                style={styles.specItem}
              >
                <View style={[styles.specIcon, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon as any} size={24} color={s.color} />
                </View>
                <Text style={styles.specLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* My Doc */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>My Doc</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/mydocs')}>
              <Text style={styles.sectionLink}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.docRow}
          >
            {doctors.map((d) => (
              <DoctorCard key={d.id} doctor={d} variant="mini" />
            ))}
          </ScrollView>
        </View>

        {/* Health Tips */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Health Tips</Text>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={TIP_W + spacing.md}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md }}
          >
            {tips.map((t) => (
              <View
                key={t.id}
                testID={`tip-${t.id}`}
                style={[styles.tipCard, { width: TIP_W }, shadowCard]}
              >
                <Image source={{ uri: t.image }} style={styles.tipImg} contentFit="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(15,23,42,0.85)']}
                  style={styles.tipScrim}
                />
                <View style={styles.tipTag}>
                  <Text style={styles.tipTagTxt}>{t.tag}</Text>
                </View>
                <View style={styles.tipBody}>
                  <Text style={styles.tipTitle}>{t.title}</Text>
                  <Text style={styles.tipSub}>{t.subtitle}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: { alignItems: 'center', justifyContent: 'center' },

  headerBg: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  locWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  locIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locSmall: { fontSize: 10, color: colors.muted, fontWeight: '500' },
  locBig: { fontSize: 14, color: colors.onSurface, fontWeight: '500' },
  avatarBtn: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 22,
  },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    gap: spacing.md,
  },
  bannerGreeting: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  bannerName: { fontSize: 22, color: colors.onSurface, fontWeight: '500' },
  bannerLine: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 2 },
  bannerBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  bannerBtnTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '500' },
  bannerIllust: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  miniPill: {
    position: 'absolute',
    top: 4,
    right: -2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    ...shadowCard,
  },
  miniPillTxt: { fontSize: 10, color: colors.onSurface, fontWeight: '500' },

  quickRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: -spacing.md,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickTitle: { fontSize: 11, color: colors.muted, fontWeight: '500' },
  quickBig: { fontSize: 14, color: colors.onSurface, fontWeight: '500' },
  quickSub: { fontSize: 11, color: colors.brandPrimary, fontWeight: '500' },

  section: { marginTop: spacing.xl },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 16, color: colors.onSurface, fontWeight: '500' },
  sectionLink: { fontSize: 12, color: colors.brandPrimary, fontWeight: '500' },

  specRow: { paddingHorizontal: spacing.xl, gap: spacing.md },
  specItem: { alignItems: 'center', gap: 6, width: 68 },
  specIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specLabel: { fontSize: 11, color: colors.onSurfaceSecondary, fontWeight: '500' },

  docRow: { paddingHorizontal: spacing.xl, gap: spacing.md },

  tipCard: {
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceTertiary,
  },
  tipImg: { ...StyleSheet.absoluteFillObject },
  tipScrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%' },
  tipTag: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tipTagTxt: { fontSize: 10, color: colors.brandPrimary, fontWeight: '500' },
  tipBody: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  tipTitle: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },
  tipSub: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 3, lineHeight: 18 },
});
