import React from 'react';
import { View, Text, ScrollView, ImageBackground, Image, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';

export default function HomeScreen() {
  const apiBaseUrl = (Constants.expoConfig?.extra as any)?.apiBaseUrl;
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 36, height: 36, marginRight: 12 }}
            resizeMode="contain"
          />
          <View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>Clinic Patient</Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Quản lý sức khoẻ dễ dàng</Text>
          </View>
        </View>

        {/* Hero Banner */}
        <View style={{ marginBottom: 24 }}>
          <ImageBackground
            source={require('../../assets/banner-page.png')}
            style={{ height: 180, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end' }}
            resizeMode="cover"
          >
            <View style={{ backgroundColor: 'rgba(0,0,0,0.35)', padding: 14 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: 8,
              }}>
                Chào mừng bạn đến với Phòng khám
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#e5e7eb',
                lineHeight: 20,
                marginBottom: 12,
              }}>
                Quản lý lịch hẹn, hồ sơ y tế và hoá đơn của bạn một cách dễ dàng.
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <Button title="Lịch hẹn" onPress={() => router.push('/(tabs)/appointments' as any)} size="sm" style={{ marginRight: 8 }} />
                <Button title="Hồ sơ y tế" variant="outline" onPress={() => router.push('/(tabs)/records' as any)} size="sm" />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 }}>Truy cập nhanh</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/appointments' as any)}
              activeOpacity={0.8}
              style={{ width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginBottom: 12 }}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>📅</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>Lịch hẹn</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Xem và đặt lịch</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/records' as any)}
              activeOpacity={0.8}
              style={{ width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginBottom: 12 }}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>📋</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>Hồ sơ y tế</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Kết quả và toa thuốc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/invoices' as any)}
              activeOpacity={0.8}
              style={{ width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginBottom: 12 }}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>💰</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>Hóa đơn</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Theo dõi chi phí</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile' as any)}
              activeOpacity={0.8}
              style={{ width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginBottom: 12 }}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>👤</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>Tài khoản</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Thông tin cá nhân</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
