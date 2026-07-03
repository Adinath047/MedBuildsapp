import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadowCard } from '../theme';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import type { Appointment, Doctor } from '../api';
import dayjs from 'dayjs';

type Props = {
  appointment: Appointment;
  doctor?: Doctor;
  onView?: () => void;
  onPrimary?: () => void;
  primaryLabel?: string;
};

export default function AppointmentCard({ appointment, doctor, onView, onPrimary, primaryLabel }: Props) {
  const dateFmt = dayjs(appointment.date).format('ddd, MMM D');
  return (
    <View style={[styles.card, shadowCard]} testID={`appointment-card-${appointment.id}`}>
      <View style={styles.head}>
        <Avatar uri={doctor?.avatar} initials={doctor?.initials} color={doctor?.color} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{doctor?.name || 'Doctor'}</Text>
          <Text style={styles.spec} numberOfLines={1}>{doctor?.specialty}</Text>
          <Text style={styles.hosp} numberOfLines={1}>{doctor?.hospital}</Text>
        </View>
        <StatusBadge status={appointment.status} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={14} color={colors.brandPrimary} />
          <Text style={styles.metaTxt}>{dateFmt}</Text>
        </View>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={14} color={colors.brandPrimary} />
          <Text style={styles.metaTxt}>{appointment.time}</Text>
        </View>
        <View style={styles.meta}>
          <Ionicons
            name={appointment.type === 'Video' ? 'videocam-outline' : 'location-outline'}
            size={14}
            color={colors.brandPrimary}
          />
          <Text style={styles.metaTxt}>{appointment.type}</Text>
        </View>
      </View>

      {appointment.reason ? <Text style={styles.reason} numberOfLines={2}>{appointment.reason}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity
          testID={`appointment-view-${appointment.id}`}
          style={styles.ghost}
          activeOpacity={0.8}
          onPress={onView}
        >
          <Text style={styles.ghostTxt}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={`appointment-primary-${appointment.id}`}
          style={styles.primary}
          activeOpacity={0.85}
          onPress={onPrimary}
        >
          <Text style={styles.primaryTxt}>{primaryLabel || (appointment.status === 'completed' ? 'Book Again' : 'Reschedule')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { fontSize: 15, fontWeight: '500', color: colors.onSurface },
  spec: { fontSize: 12, color: colors.brandPrimary, fontWeight: '500', marginTop: 1 },
  hosp: { fontSize: 12, color: colors.muted, marginTop: 1 },
  metaRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTxt: { fontSize: 12, color: colors.onSurfaceSecondary, fontWeight: '500' },
  reason: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: 2 },
  ghost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center',
  },
  ghostTxt: { fontSize: 13, color: colors.onSurfaceSecondary, fontWeight: '500' },
  primary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
  },
  primaryTxt: { fontSize: 13, color: '#FFFFFF', fontWeight: '500' },
});
