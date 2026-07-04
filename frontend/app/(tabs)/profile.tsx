import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadowCard } from '@/src/theme';
import { api, Patient, setAuthToken } from '@/src/api';
import Avatar from '@/src/components/Avatar';
import { storage } from '@/src/utils/storage';

const OPTIONS: { key: string; label: string; icon: any; color: string; bg: string; route?: string }[] = [
  { key: 'personal', label: 'Personal Details', icon: 'person-outline', color: '#2A7AF2', bg: '#DBEAFE' },
  { key: 'doctors', label: 'My Doctors', icon: 'people-outline', color: '#10B981', bg: '#DCFCE7', route: '/(tabs)/mydocs' },
  { key: 'appts', label: 'My Appointments', icon: 'calendar-outline', color: '#8B5CF6', bg: '#EDE9FE', route: '/(tabs)/appointments' },
  { key: 'rx', label: 'Prescriptions', icon: 'document-text-outline', color: '#F59E0B', bg: '#FEF3C7', route: '/(tabs)/prescription' },
  { key: 'notif', label: 'Notifications', icon: 'notifications-outline', color: '#EC4899', bg: '#FCE7F3' },
  { key: 'help', label: 'Help & Support', icon: 'help-circle-outline', color: '#06B6D4', bg: '#CFFAFE' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    api.patient().then(setPatient).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await storage.secureRemove('auth_token');
      setAuthToken(null);
      router.replace('/login');
    } catch (e) {
      console.warn('Logout failed', e);
    }
  };

  return (
    <View style={styles.container} testID="profile-screen">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <LinearGradient
          colors={['#EAF3FF', '#E6FBF3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
        >
          <View style={styles.avatarRing}>
            <Avatar uri={patient?.avatar} size={96} testID="profile-avatar" />
          </View>
          <Text style={styles.name}>{patient?.name}</Text>
          <View style={styles.locWrap}>
            <Ionicons name="location-outline" size={14} color={colors.brandPrimary} />
            <Text style={styles.locTxt}>{patient?.location}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{patient?.blood_group}</Text>
              <Text style={styles.statLbl}>Blood</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>4</Text>
              <Text style={styles.statLbl}>Doctors</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>6</Text>
              <Text style={styles.statLbl}>Visits</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={colors.muted} />
            <Text style={styles.infoTxt}>{patient?.phone}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={16} color={colors.muted} />
            <Text style={styles.infoTxt}>{patient?.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          {OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt.key}
              testID={`profile-opt-${opt.key}`}
              activeOpacity={0.85}
              onPress={() => opt.route && router.push(opt.route as any)}
              style={[styles.optRow, i === OPTIONS.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={[styles.optIcon, { backgroundColor: opt.bg }]}>
                <Ionicons name={opt.icon} size={18} color={opt.color} />
              </View>
              <Text style={styles.optLabel}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          testID="logout-btn"
          activeOpacity={0.85}
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutBtnTxt}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Premium Health Connect · v1.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: spacing.sm,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    ...shadowCard,
  },
  name: { fontSize: 22, color: colors.onSurface, fontWeight: '500', marginTop: spacing.sm },
  locWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locTxt: { fontSize: 12, color: colors.brandPrimary, fontWeight: '500' },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadowCard,
  },
  statVal: { fontSize: 18, color: colors.onSurface, fontWeight: '500' },
  statLbl: { fontSize: 11, color: colors.muted, marginTop: 2 },
  infoCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadowCard,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 4 },
  infoTxt: { fontSize: 13, color: colors.onSurface },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  section: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    ...shadowCard,
  },
  optRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  optLabel: { flex: 1, fontSize: 14, color: colors.onSurface, fontWeight: '500' },
  version: { textAlign: 'center', fontSize: 11, color: colors.muted, marginTop: spacing.xl },
  logoutBtn: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: '#FFF5F5',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutBtnTxt: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
});
