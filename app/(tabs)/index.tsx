import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const apiBaseUrl = (Constants.expoConfig?.extra as any)?.apiBaseUrl;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 8,
          }}>
            Chào mừng bạn đến với Phòng khám
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#6b7280',
            lineHeight: 24,
          }}>
            Quản lý lịch hẹn, hồ sơ y tế và hoá đơn của bạn một cách dễ dàng.
          </Text>
        </View>

        <View style={{
          backgroundColor: '#f8fafc',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#334155',
            marginBottom: 12,
          }}>
            Tính năng chính
          </Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 16,
              color: '#475569',
              marginBottom: 4,
            }}>
              📅 Lịch hẹn
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#64748b',
            }}>
              Xem và quản lý các cuộc hẹn của bạn
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 16,
              color: '#475569',
              marginBottom: 4,
            }}>
              📋 Hồ sơ y tế
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#64748b',
            }}>
              Truy cập hồ sơ và kết quả khám bệnh
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 16,
              color: '#475569',
              marginBottom: 4,
            }}>
              💰 Hoá đơn
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#64748b',
            }}>
              Theo dõi chi phí và thanh toán
            </Text>
          </View>

          <View>
            <Text style={{
              fontSize: 16,
              color: '#475569',
              marginBottom: 4,
            }}>
              👤 Hồ sơ cá nhân
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#64748b',
            }}>
              Quản lý thông tin tài khoản
            </Text>
          </View>
        </View>

        <View style={{
          backgroundColor: '#e0f2fe',
          padding: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#0ea5e9',
        }}>
          <Text style={{
            fontSize: 14,
            color: '#0c4a6e',
            textAlign: 'center',
          }}>
            💡 Sử dụng menu dưới cùng để điều hướng giữa các tính năng
          </Text>
          <Text style={{
            fontSize: 12,
            color: '#075985',
            textAlign: 'center',
            marginTop: 6,
          }}>
            API Base URL: {typeof apiBaseUrl === 'string' ? apiBaseUrl : JSON.stringify(apiBaseUrl)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
