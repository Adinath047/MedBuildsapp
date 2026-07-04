import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { storage } from "@/src/utils/storage";
import { setAuthToken } from "@/src/api";

LogBox.ignoreAllLogs(true);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useIconFonts();
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await storage.secureGet("auth_token", "");
        if (token) {
          setAuthToken(token);
        }
      } catch (e) {
        console.warn("Failed to restore session", e);
      } finally {
        setSessionLoaded(true);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    if ((loaded || error) && sessionLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, sessionLoaded]);

  if ((!loaded && !error) || !sessionLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F8FAFC" },
        }}
      />
    </SafeAreaProvider>
  );
}
