import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import { colors, radius, spacing, shadowCard } from '@/src/theme';
import { api, Prescription, Doctor } from '@/src/api';
import Avatar from '@/src/components/Avatar';

export default function PrescriptionDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [rx, setRx] = useState<Prescription | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await api.prescription(id);
        setRx(r);
        const d = await api.doctor(r.doctor_id);
        setDoctor(d);
      } catch (e) {
        console.log('rx detail err', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading || !rx) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="prescription-detail">
      <LinearGradient
        colors={['#EAF3FF', '#E6FBF3', '#F8FAFC']}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="rx-back">
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Prescription</Text>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.85}>
            <Ionicons name="share-outline" size={20} color={colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={styles.rxBadge}>
          <View style={styles.rxIcon}>
            <Text style={styles.rxIconTxt}>Rx</Text>
          </View>
          <Text style={styles.rxTitle}>{rx.title}</Text>
          <Text style={styles.rxDate}>{dayjs(rx.date).format('DD MMMM YYYY')}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: spacing.xl }}
      >
        {/* Doctor card */}
        {doctor ? (
          <TouchableOpacity
            testID="rx-doctor-card"
            activeOpacity={0.85}
            onPress={() => router.push(`/doctor/${doctor.id}`)}
            style={[styles.doctorCard, shadowCard]}
          >
            <Avatar uri={doctor.avatar} initials={doctor.initials} color={doctor.color} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={styles.docName}>{doctor.name}</Text>
              <Text style={styles.docSpec}>{doctor.specialty}</Text>
              <Text style={styles.docHosp}>{doctor.hospital}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>
        ) : null}

        {/* Diagnosis */}
        <View style={[styles.card, shadowCard]}>
          <View style={styles.cardHead}>
            <View style={[styles.cardIcon, { backgroundColor: colors.blueTint }]}>
              <Ionicons name="clipboard-outline" size={16} color={colors.brandPrimary} />
            </View>
            <Text style={styles.cardTitle}>Diagnosis</Text>
          </View>
          <Text style={styles.body}>{rx.diagnosis}</Text>
        </View>

        {/* Medicines */}
        <View style={[styles.card, shadowCard]}>
          <View style={styles.cardHead}>
            <View style={[styles.cardIcon, { backgroundColor: colors.mintTint }]}>
              <Ionicons name="medkit-outline" size={16} color={colors.brandSecondary} />
            </View>
            <Text style={styles.cardTitle}>Medicines</Text>
            <View style={styles.countBadge}><Text style={styles.countBadgeTxt}>{rx.medicines.length}</Text></View>
          </View>
          <View style={{ gap: spacing.md }}>
            {rx.medicines.map((m, i) => (
              <View key={i} style={styles.medRow} testID={`medicine-${i}`}>
                <View style={styles.medIndex}>
                  <Text style={styles.medIndexTxt}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{m.name}</Text>
                  <View style={styles.medMeta}>
                    <View style={styles.medChip}>
                      <Text style={styles.medChipTxt}>{m.dosage}</Text>
                    </View>
                    <View style={styles.medChip}>
                      <Text style={styles.medChipTxt}>{m.duration}</Text>
                    </View>
                  </View>
                  <Text style={styles.medNote}>{m.note}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Advice */}
        <View style={[styles.card, shadowCard]}>
          <View style={styles.cardHead}>
            <View style={[styles.cardIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.cardTitle}>Doctor{'\u2019'}s Advice</Text>
          </View>
          <Text style={styles.body}>{rx.advice}</Text>
        </View>

        <View style={styles.footerNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.brandSecondary} />
          <Text style={styles.footerTxt}>Digitally issued & stored securely</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', ...shadowCard,
  },
  topTitle: { fontSize: 15, color: colors.onSurface, fontWeight: '500' },
  rxBadge: {
    alignItems: 'center', gap: 6, marginTop: spacing.md,
  },
  rxIcon: {
    width: 56, height: 56, borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    ...shadowCard,
  },
  rxIconTxt: { fontSize: 22, color: colors.brandPrimary, fontWeight: '500' },
  rxTitle: { fontSize: 20, color: colors.onSurface, fontWeight: '500', marginTop: spacing.sm },
  rxDate: { fontSize: 12, color: colors.muted, fontWeight: '500' },

  doctorCard: {
    marginHorizontal: spacing.xl,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#FFFFFF', padding: spacing.lg, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.divider,
  },
  docName: { fontSize: 14, color: colors.onSurface, fontWeight: '500' },
  docSpec: { fontSize: 12, color: colors.brandPrimary, fontWeight: '500', marginTop: 2 },
  docHosp: { fontSize: 11, color: colors.muted, marginTop: 1 },

  card: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.divider,
    gap: spacing.md,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardIcon: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { flex: 1, fontSize: 14, color: colors.onSurface, fontWeight: '500' },
  countBadge: {
    minWidth: 22, height: 20, paddingHorizontal: 6, borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary, alignItems: 'center', justifyContent: 'center',
  },
  countBadgeTxt: { fontSize: 10, color: colors.brandPrimary, fontWeight: '500' },
  body: { fontSize: 13, color: colors.onSurfaceSecondary, lineHeight: 20 },

  medRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  medIndex: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  medIndexTxt: { fontSize: 11, color: colors.brandPrimary, fontWeight: '500' },
  medName: { fontSize: 14, color: colors.onSurface, fontWeight: '500' },
  medMeta: { flexDirection: 'row', gap: 6, marginTop: 4 },
  medChip: {
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.pill,
  },
  medChipTxt: { fontSize: 10, color: colors.onSurfaceSecondary, fontWeight: '500' },
  medNote: { fontSize: 11, color: colors.muted, marginTop: 4 },

  footerNote: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: spacing.xl,
  },
  footerTxt: { fontSize: 11, color: colors.muted, fontWeight: '500' },
});
