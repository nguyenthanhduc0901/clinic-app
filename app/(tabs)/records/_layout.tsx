import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function MedicalRecordsLayout() {
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
          title: 'Hồ sơ y tế',
          headerTitle: 'Hồ sơ y tế của tôi',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Chi tiết bệnh án',
          headerTitle: 'Chi tiết bệnh án',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="[id]/attachments"
        options={{
          title: 'Tệp đính kèm',
          headerTitle: 'Tệp đính kèm',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}



