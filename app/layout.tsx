import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AppProviders } from '../providers/AppProviders';
import { useSession } from '../hooks/useSession';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [segments, isAuthenticated, isLoading]);

  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}


