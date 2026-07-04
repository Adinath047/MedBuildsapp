import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '@/src/utils/storage';
import { setAuthToken } from '@/src/api';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await storage.secureGet('auth_token', '');
        if (token) {
          setAuthToken(token);
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      } catch (e) {
        router.replace('/login');
      }
    }
    checkAuth();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
      <ActivityIndicator size="large" color="#2A7AF2" />
    </View>
  );
}
