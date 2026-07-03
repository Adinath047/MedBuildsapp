import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import { colors, radius, spacing, shadowCard, shadowFab } from '@/src/theme';
import { api, Doctor } from '@/src/api';
import Avatar from '@/src/components/Avatar';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:30 AM', '12:30 PM', '2:00 PM', '3:30 PM', '4:30 PM', '6:00 PM'];
const VISIT_TYPES: { key: 'In-Clinic' | 'Video'; label: string; icon: any }[] = [
  { key: 'In-Clinic', label: 'In-Clinic', icon: 'location-outline' },
  { key: 'Video', label: 'Video Call', icon: 'videocam-outline' },
];

function next14Days() {
  return Array.from({ length: 14 }, (_, i) => dayjs().add(i, 'day'));
}

export default function BookAppointment() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => next14Days(), []);
  const [selectedDate, setSelectedDate] = useState(days[0].format('YYYY-MM-DD'));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [visitType, setVisitType] = useState<'In-Clinic' | 'Video'>('In-Clinic');
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState<null | { date: string; time: string }>(null);

  useEffect(() => {
    if (!id) return;
    api.doctor(id).then(setDoctor).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    if (!doctor || !selectedTime) return;
    setBooking(true);
    try {
      await api.createAppointment({
        doctor_id: doctor.id,
        date: selectedDate,
        time: selectedTime,
        type: visitType,
        reason: 'Consultation',
      });
      setConfirmed({ date: selectedDate, time: selectedTime });
    } catch (e) {
      console.log('booking err', e);
    } finally {
      setBooking(false);
    }
  };

  if (loading || !doctor) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="book-appointment-screen">
      <LinearGradient
        colors={['#EAF3FF', '#F8FAFC']}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="book-back">
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Book Appointment</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.docCard, shadowCard]}>
          <Avatar uri={doctor.avatar} initials={doctor.initials} color={doctor.color} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={styles.docName}>{doctor.name}</Text>
            <Text style={styles.docSpec}>{doctor.specialty}</Text>
            <Text style={styles.docHosp}>{doctor.hospital}</Text>
          </View>
          <View style={styles.docFee}>
            <Text style={styles.feeVal}>₹{doctor.fee}</Text>
            <Text style={styles.feeLbl}>fee</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* Visit Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Type</Text>
          <View style={styles.typeRow}>
            {VISIT_TYPES.map((t) => {
              const active = visitType === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  testID={`type-${t.key}`}
                  activeOpacity={0.85}
                  onPress={() => setVisitType(t.key)}
                  style={[styles.typeCard, active && styles.typeCardActive]}
                >
                  <Ionicons name={t.icon} size={18} color={active ? '#FFFFFF' : colors.brandPrimary} />
                  <Text style={[styles.typeLabel, active && { color: '#FFFFFF' }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
            {days.map((d) => {
              const iso = d.format('YYYY-MM-DD');
              const active = iso === selectedDate;
              return (
                <TouchableOpacity
                  key={iso}
                  testID={`day-${iso}`}
                  activeOpacity={0.85}
                  onPress={() => setSelectedDate(iso)}
                  style={[styles.dayCard, active && styles.dayCardActive]}
                >
                  <Text style={[styles.dayName, active && { color: '#FFFFFF' }]}>{d.format('ddd')}</Text>
                  <Text style={[styles.dayNum, active && { color: '#FFFFFF' }]}>{d.format('D')}</Text>
                  <Text style={[styles.dayMon, active && { color: 'rgba(255,255,255,0.85)' }]}>{d.format('MMM')}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const active = selectedTime === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  testID={`time-${slot}`}
                  activeOpacity={0.85}
                  onPress={() => setSelectedTime(slot)}
                  style={[styles.timeChip, active && styles.timeChipActive]}
                >
                  <Text style={[styles.timeTxt, active && { color: '#FFFFFF' }]}>{slot}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Confirm */}
      <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryLbl}>Total</Text>
          <Text style={styles.summaryVal}>₹{doctor.fee}</Text>
        </View>
        <TouchableOpacity
          testID="confirm-booking-btn"
          activeOpacity={0.85}
          disabled={!selectedTime || booking}
          onPress={handleConfirm}
          style={[styles.confirmBtn, (!selectedTime || booking) && styles.confirmBtnDisabled, shadowFab]}
        >
          <LinearGradient
            colors={selectedTime && !booking ? [colors.brandPrimary, colors.brandSecondary] : ['#CBD5E1', '#CBD5E1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmGradient}
          >
            {booking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.confirmTxt}>{selectedTime ? 'Confirm Booking' : 'Select a time slot'}</Text>
                {selectedTime ? <Ionicons name="arrow-forward" size={16} color="#FFFFFF" /> : null}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Confirmation modal */}
      <Modal visible={!!confirmed} transparent animationType="fade" testID="confirmation-modal">
        <View style={styles.modalScrim}>
          <View style={styles.modalCard}>
            <View style={styles.tickWrap}>
              <LinearGradient
                colors={[colors.brandPrimary, colors.brandSecondary]}
                style={styles.tick}
              >
                <Ionicons name="checkmark" size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.modalTitle}>Appointment Confirmed</Text>
            <Text style={styles.modalSub}>Your booking with {doctor.name} is set.</Text>
            <View style={styles.modalInfo}>
              <View style={styles.modalRow}>
                <Ionicons name="calendar" size={14} color={colors.brandPrimary} />
                <Text style={styles.modalTxt}>{confirmed && dayjs(confirmed.date).format('ddd, DD MMM YYYY')}</Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons name="time" size={14} color={colors.brandPrimary} />
                <Text style={styles.modalTxt}>{confirmed?.time}</Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons name={visitType === 'Video' ? 'videocam' : 'location'} size={14} color={colors.brandPrimary} />
                <Text style={styles.modalTxt}>{visitType}</Text>
              </View>
            </View>
            <TouchableOpacity
              testID="confirmation-done-btn"
              activeOpacity={0.85}
              onPress={() => {
                setConfirmed(null);
                router.replace('/(tabs)/appointments');
              }}
              style={styles.modalBtn}
            >
              <Text style={styles.modalBtnTxt}>View Appointments</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', ...shadowCard,
  },
  topTitle: { fontSize: 15, color: colors.onSurface, fontWeight: '500' },
  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#FFFFFF', padding: spacing.lg, borderRadius: radius.lg, marginTop: spacing.sm,
    borderWidth: 1, borderColor: colors.divider,
  },
  docName: { fontSize: 15, color: colors.onSurface, fontWeight: '500' },
  docSpec: { fontSize: 12, color: colors.brandPrimary, fontWeight: '500', marginTop: 2 },
  docHosp: { fontSize: 11, color: colors.muted, marginTop: 2 },
  docFee: { alignItems: 'flex-end' },
  feeVal: { fontSize: 16, color: colors.onSurface, fontWeight: '500' },
  feeLbl: { fontSize: 10, color: colors.muted },

  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl, gap: spacing.md },
  sectionTitle: { fontSize: 14, color: colors.onSurface, fontWeight: '500' },

  typeRow: { flexDirection: 'row', gap: spacing.md },
  typeCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, borderRadius: radius.lg,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: colors.border,
  },
  typeCardActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  typeLabel: { fontSize: 13, color: colors.onSurface, fontWeight: '500' },

  dayRow: { gap: spacing.sm, paddingRight: spacing.xl },
  dayCard: {
    width: 60, paddingVertical: spacing.md, alignItems: 'center',
    borderRadius: radius.lg, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: colors.border, gap: 2,
  },
  dayCardActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  dayName: { fontSize: 10, color: colors.muted, fontWeight: '500' },
  dayNum: { fontSize: 18, color: colors.onSurface, fontWeight: '500' },
  dayMon: { fontSize: 10, color: colors.muted, fontWeight: '500' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  timeChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border,
  },
  timeChipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  timeTxt: { fontSize: 12, color: colors.onSurface, fontWeight: '500' },

  stickyBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl, paddingTop: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06, shadowRadius: 16, elevation: 12,
  },
  summaryLbl: { fontSize: 10, color: colors.muted, fontWeight: '500' },
  summaryVal: { fontSize: 18, color: colors.onSurface, fontWeight: '500', marginTop: 2 },
  confirmBtn: { flex: 2, borderRadius: radius.pill, overflow: 'hidden' },
  confirmBtnDisabled: { opacity: 0.7 },
  confirmGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14,
  },
  confirmTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },

  modalScrim: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },
  modalCard: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 28,
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm,
  },
  tickWrap: { padding: 6, borderRadius: 60, backgroundColor: '#FFFFFF', marginBottom: spacing.sm },
  tick: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontSize: 20, color: colors.onSurface, fontWeight: '500' },
  modalSub: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  modalInfo: {
    width: '100%', gap: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    padding: spacing.lg, borderRadius: radius.lg, marginTop: spacing.md,
  },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  modalTxt: { fontSize: 13, color: colors.onSurface, fontWeight: '500' },
  modalBtn: {
    marginTop: spacing.lg, width: '100%',
    backgroundColor: colors.brandPrimary, paddingVertical: 14,
    borderRadius: radius.pill, alignItems: 'center',
  },
  modalBtnTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
});
