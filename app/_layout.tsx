import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthContext, useAuth } from "@/contexts/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && segments[0] === 'login') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isInitialized, segments, router]);

  if (!isInitialized) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Atrás" }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext>
        <GestureHandlerRootView>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AuthContext>
    </QueryClientProvider>
  );
}
