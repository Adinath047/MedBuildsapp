import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, shadowCard } from '@/src/theme';
import { api, setAuthToken } from '@/src/api';
import { storage } from '@/src/utils/storage';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid mobile number.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const res = await api.sendOtp(phone);
      setStep('otp');
      if (res.otp) {
        setDebugOtp(res.otp);
      }
    } catch (err: any) {
      console.log('send otp error', err);
      if (err.message && err.message.toLowerCase().includes('failed')) {
        setError('Connection failed. Please check your network or verify the backend server is reachable.');
      } else {
        setError(err.message || 'This number is not registered. Please contact the clinic.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.verifyOtp(phone, otp);
      await storage.secureSet('auth_token', res.token);
      setAuthToken(res.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.log('verify otp error', err);
      if (err.message && err.message.toLowerCase().includes('failed')) {
        setError('Connection failed. Please check your network connection.');
      } else {
        setError(err.message || 'Invalid verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      testID="login-screen"
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandContainer}>
          <LinearGradient
            colors={['#EAF3FF', '#DBEAFE']}
            style={styles.logoBg}
          >
            <Ionicons name="pulse" size={44} color={colors.brandPrimary} />
          </LinearGradient>
          <Text style={styles.brandName}>Medicos</Text>
          <Text style={styles.brandTagline}>Patient Portal</Text>
        </View>

        <View style={[styles.card, shadowCard]}>
          <Text style={styles.cardTitle}>
            {step === 'phone' ? 'Patient Sign In' : 'Enter Verification Code'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {step === 'phone'
              ? 'Access your prescriptions, appointments, and lab reports by signing in with your registered mobile number.'
              : `We have sent a 6-digit verification code to ${phone}. Please enter it below.`}
          </Text>

          {error ? (
            <View style={styles.errorContainer} testID="login-error">
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {step === 'phone' ? (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  testID="phone-input"
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    setError('');
                  }}
                  style={styles.input}
                  editable={!loading}
                />
              </View>
            </View>
          ) : (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Verification Code (OTP)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  testID="otp-input"
                  placeholder="e.g. 123456"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(val) => {
                    setOtp(val);
                    setError('');
                  }}
                  style={[styles.input, { letterSpacing: 6, fontSize: 16 }]}
                  editable={!loading}
                />
              </View>

              {debugOtp ? (
                <View style={styles.debugContainer} testID="debug-otp-hint">
                  <Text style={styles.debugText}>
                    💡 Developer Mock OTP is: <Text style={{ fontWeight: 'bold' }}>{debugOtp}</Text>
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          <TouchableOpacity
            testID="submit-btn"
            activeOpacity={0.85}
            onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
            disabled={loading}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={[colors.brandPrimary, '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    {step === 'phone' ? 'Send OTP' : 'Verify & Continue'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {step === 'otp' ? (
            <TouchableOpacity
              testID="back-btn"
              onPress={() => {
                setStep('phone');
                setError('');
                setOtp('');
              }}
              disabled={loading}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Change Mobile Number</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.footer}>
          Only registered patients can sign in. If you are a new patient, please register at the hospital front desk.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
  },
  brandContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: colors.brandPrimary,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: spacing.xl,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FEF2F2',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: colors.error,
    fontWeight: '500',
  },
  inputWrapper: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceTertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F8FAFC',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: colors.onSurface,
  },
  debugContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.blueTint,
    borderRadius: radius.sm,
  },
  debugText: {
    fontSize: 12,
    color: colors.brandPrimary,
    fontWeight: '500',
  },
  buttonWrapper: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  button: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 12,
    color: colors.brandPrimary,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
    paddingHorizontal: spacing.xl,
  },
});
