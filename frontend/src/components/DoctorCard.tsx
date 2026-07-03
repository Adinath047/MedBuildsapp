import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, shadowCard } from '../theme';
import Avatar from './Avatar';
import type { Doctor } from '../api';

type Props = {
  doctor: Doctor;
  variant?: 'row' | 'mini';
  showConsulted?: boolean;
};

export default function DoctorCard({ doctor, variant = 'row', showConsulted }: Props) {
  const router = useRouter();
  const onOpen = () => router.push(`/doctor/${doctor.id}`);

  if (variant === 'mini') {
    return (
      <TouchableOpacity
        testID={`mini-doctor-card-${doctor.id}`}
        activeOpacity={0.85}
        onPress={onOpen}
        style={[styles.mini, shadowCard]}
      >
        <Avatar uri={doctor.avatar} initials={doctor.initials} color={doctor.color} size={64} />
        <Text style={styles.miniName} numberOfLines={1}>{doctor.name}</Text>
        <Text style={styles.miniSpec} numberOfLines={1}>{doctor.specialty}</Text>
        <Text style={styles.miniHosp} numberOfLines={1}>{doctor.hospital}</Text>
        <View style={styles.miniBtn}>
          <Text style={styles.miniBtnTxt}>Visit</Text>
          <Ionicons name="arrow-forward" size={12} color={colors.brandPrimary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      testID={`doctor-card-${doctor.id}`}
      activeOpacity={0.85}
      onPress={onOpen}
      style={[styles.row, shadowCard]}
    >
      <Avatar uri={doctor.avatar} initials={doctor.initials} color={doctor.color} size={60} />
      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={1}>{doctor.name}</Text>
        <Text style={styles.rowSpec} numberOfLines={1}>{doctor.specialty}</Text>
        <Text style={styles.rowHosp} numberOfLines={1}>{doctor.hospital}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={styles.metaTxt}>{doctor.rating.toFixed(1)}</Text>
          </View>
          {showConsulted ? (
            <View style={styles.metaChip}>
              <Ionicons name="checkmark-circle" size={11} color={colors.brandSecondary} />
              <Text style={styles.metaTxt}>Consulted {doctor.consulted_count}x</Text>
            </View>
          ) : (
            <View style={styles.metaChip}>
              <Ionicons name="briefcase-outline" size={11} color={colors.muted} />
              <Text style={styles.metaTxt}>{doctor.experience_years}y exp</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.cta}>
        <Text style={styles.ctaTxt}>Visit</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  rowBody: { flex: 1, gap: 2 },
  rowName: { fontSize: 15, fontWeight: '500', color: colors.onSurface },
  rowSpec: { fontSize: 12, color: colors.brandPrimary, fontWeight: '500' },
  rowHosp: { fontSize: 12, color: colors.muted },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 6 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  metaTxt: { fontSize: 10, color: colors.onSurfaceTertiary, fontWeight: '500' },
  cta: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  ctaTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '500' },

  mini: {
    width: 168,
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  miniName: { fontSize: 14, fontWeight: '500', color: colors.onSurface, marginTop: spacing.sm },
  miniSpec: { fontSize: 11, color: colors.brandPrimary, fontWeight: '500' },
  miniHosp: { fontSize: 11, color: colors.muted, textAlign: 'center' },
  miniBtn: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  miniBtnTxt: { color: colors.brandPrimary, fontSize: 12, fontWeight: '500' },
});
