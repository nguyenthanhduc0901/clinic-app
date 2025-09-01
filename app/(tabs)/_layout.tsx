import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, Text } from 'react-native';

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
        },
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#111827',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarLabel: 'Trang chủ',
          headerTitle: 'Trang chủ',
          tabBarIcon: () => <Text style={{fontSize: 20}}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Lịch hẹn',
          tabBarLabel: 'Lịch hẹn',
          headerTitle: 'Lịch hẹn của tôi',
          tabBarIcon: () => <Text style={{fontSize: 20}}>📅</Text>,
          headerShown: false, // Let the stack handle headers
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Hồ sơ y tế',
          tabBarLabel: 'Hồ sơ',
          headerTitle: 'Hồ sơ y tế',
          tabBarIcon: () => <Text style={{fontSize: 20}}>📋</Text>,
          headerShown: false, // Let the stack handle headers
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Hoá đơn',
          tabBarLabel: 'Hoá đơn',
          headerTitle: 'Hoá đơn của tôi',
          tabBarIcon: () => <Text style={{fontSize: 20}}>💰</Text>,
          headerShown: false, // Let the stack handle headers
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ cá nhân',
          tabBarLabel: 'Hồ sơ',
          headerTitle: 'Hồ sơ cá nhân',
          tabBarIcon: () => <Text style={{fontSize: 20}}>👤</Text>,
        }}
      />
    </Tabs>
  );
}


