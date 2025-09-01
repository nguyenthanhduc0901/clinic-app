import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function InvoicesLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
        },
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#111827',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Hóa đơn',
          headerTitle: 'Hóa đơn của tôi',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Chi tiết hóa đơn',
          headerTitle: 'Chi tiết hóa đơn',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}



