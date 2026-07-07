import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
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

  // Modal edit fields
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [bloodGroupInput, setBloodGroupInput] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadPatient();
  }, []);

  const loadPatient = () => {
    api.patient().then(setPatient).catch(() => {});
  };

  const handleLogout = async () => {
    try {
      await storage.secureRemove('auth_token');
      setAuthToken(null);
      router.replace('/login');
    } catch (e) {
      console.warn('Logout failed', e);
    }
  };

  const openEditModal = () => {
    if (patient) {
      setEmailInput(patient.email || '');
      setLocationInput(patient.location || '');
      setBloodGroupInput(patient.blood_group || '');
      setModalVisible(true);
    }
  };

  const handleSaveDetails = async () => {
    setUpdating(true);
    try {
      const updated = await api.updatePatient({
        email: emailInput.trim(),
        location: locationInput.trim(),
        blood_group: bloodGroupInput.trim()
      });
      setPatient(updated);
      setModalVisible(false);
      Alert.alert('Success', 'Profile details updated successfully!');
    } catch (err: any) {
      console.warn('Error updating details:', err);
      Alert.alert('Error', 'Failed to update profile details.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access your gallery is required to update your profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        const base64Image = `data:image/png;base64,${result.assets[0].base64}`;
        setUpdating(true);
        const updated = await api.updatePatient({ avatar: base64Image });
        setPatient(updated);
        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (err: any) {
      console.warn('Error picking image:', err);
      Alert.alert('Error', 'Failed to update profile photo.');
    } finally {
      setUpdating(false);
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
          <TouchableOpacity activeOpacity={0.85} onPress={handlePickImage} style={styles.avatarRing}>
            <Avatar uri={patient?.avatar} size={96} testID="profile-avatar" />
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{patient?.name}</Text>
          <View style={styles.locWrap}>
            <Ionicons name="location-outline" size={14} color={colors.brandPrimary} />
            <Text style={styles.locTxt}>{patient?.location || 'Not specified'}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{patient?.blood_group || '—'}</Text>
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
            <Text style={styles.infoTxt}>{patient?.email || 'No email provided'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          {OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt.key}
              testID={`profile-opt-${opt.key}`}
              activeOpacity={0.85}
              onPress={() => {
                if (opt.key === 'personal') {
                  openEditModal();
                } else if (opt.route) {
                  router.push(opt.route as any);
                }
              }}
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

      {/* Edit Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile Details</Text>
            
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="patient@example.com"
            />

            <Text style={styles.label}>Location / Address</Text>
            <TextInput
              style={styles.input}
              value={locationInput}
              onChangeText={setLocationInput}
              placeholder="City, Country"
            />

            <Text style={styles.label}>Blood Group</Text>
            <TextInput
              style={styles.input}
              value={bloodGroupInput}
              onChangeText={setBloodGroupInput}
              placeholder="e.g. O+, A-, B+"
              autoCapitalize="characters"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.btnCancel} 
                onPress={() => setModalVisible(false)}
                disabled={updating}
              >
                <Text style={styles.btnCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.btnSave} 
                onPress={handleSaveDetails}
                disabled={updating}
              >
                {updating && <ActivityIndicator size="small" color="#FFFFFF" />}
                <Text style={styles.btnSaveTxt}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    position: 'relative',
    padding: 4,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    ...shadowCard,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.brandPrimary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadowCard,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.onSurface,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  btnCancel: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: '#F3F4F6',
  },
  btnCancelTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
  },
  btnSave: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnSaveTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
