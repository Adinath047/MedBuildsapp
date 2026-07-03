import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { colors, radius, spacing, shadowCard } from '../theme';
import type { Prescription, Doctor } from '../api';

type Props = {
  prescription: Prescription;
  doctor?: Doctor;
};

export default function PrescriptionCard({ prescription, doctor }: Props) {
  const router = useRouter();
  const preview = prescription.medicines.slice(0, 2).map((m) => m.name).join(', ');
  const more = prescription.medicines.length - 2;
  return (
    <TouchableOpacity
      testID={`prescription-card-${prescription.id}`}
      activeOpacity={0.85}
      onPress={() => router.push(`/prescription/${prescription.id}`)}
      style={[styles.card, shadowCard]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="medkit" size={22} color={colors.brandPrimary} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.title} numberOfLines={1}>{prescription.title}</Text>
        <Text style={styles.doc} numberOfLines={1}>{doctor?.name || 'Doctor'} • {doctor?.specialty}</Text>
        <Text style={styles.date}>{dayjs(prescription.date).format('DD MMM YYYY')}</Text>
        <Text style={styles.meds} numberOfLines={1}>
          {preview}{more > 0 ? ` +${more} more` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '500', color: colors.onSurface },
  doc: { fontSize: 12, color: colors.brandPrimary, fontWeight: '500' },
  date: { fontSize: 11, color: colors.muted },
  meds: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 2 },
});
