import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AppProviders } from '../providers/AppProviders';
import { useSession } from '../hooks/useSession';

function GuardedRoutes() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;
    
    const timer = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login');
      }
      if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 500); // Increased timeout to avoid race conditions
    return () => clearTimeout(timer);
  }, [segments, isAuthenticated, isLoading]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <GuardedRoutes />
    </AppProviders>
  );
}


