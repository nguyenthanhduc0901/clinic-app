import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AppointmentsLayout() {
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
          title: 'Lịch hẹn của tôi',
          headerTitle: 'Lịch hẹn của tôi',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Chi tiết lịch hẹn',
          headerTitle: 'Chi tiết lịch hẹn',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}



