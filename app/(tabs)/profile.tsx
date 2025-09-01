import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { } from '@tanstack/react-query';
import { router } from 'expo-router';

import { ApiError } from '../../lib/api';
import { MOCK_MODE } from '../../lib/mockApi';
import { useSession } from '../../hooks/useSession';
import { useMe } from '../../hooks/useAppointments';
import { QK } from '../../constants/queryKeys';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';
import { Notice } from '../../components/ui/Notice';
 

export default function ProfileScreen() {
  const { logout } = useSession();

  const meQuery = useMe();

  const me = meQuery.data as any;

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  

  // Early returns after all hooks
  if (meQuery.isLoading) {
    return <LoadingSpinner message="Đang tải thông tin hồ sơ..." />;
  }

  if (meQuery.error) {
    const error = meQuery.error as unknown as ApiError;
    return (
      <ErrorMessage
        title="Không thể tải thông tin hồ sơ"
        message={error.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Profile Information */}
        <View style={{
          backgroundColor: '#f8fafc',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 16,
          }}>
            Thông tin cá nhân
          </Text>

          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 4,
            }}>
              Họ và tên
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#111827',
              fontWeight: '500',
            }}>
              {me?.patient?.fullName || 'Chưa cập nhật'}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 4,
            }}>
              Email
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#111827',
              fontWeight: '500',
            }}>
              {me?.email}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 4,
            }}>
              Số điện thoại
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#111827',
              fontWeight: '500',
            }}>
              {me?.patient?.phone || me?.phone || 'Chưa cập nhật'}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 4,
            }}>
              Năm sinh
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#111827',
              fontWeight: '500',
            }}>
              {me?.patient?.birthYear ?? 'Chưa cập nhật'}
            </Text>
          </View>

          <View>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 4,
            }}>
              Địa chỉ
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#111827',
              fontWeight: '500',
            }}>
              {me?.patient?.address || 'Chưa cập nhật'}
            </Text>
          </View>
        </View>

        {/* Banner nếu chưa có hồ sơ bệnh nhân liên kết */}
        {me?.patient == null && (
          <Notice type="warning" message="Chưa có hồ sơ bệnh nhân liên kết" />
        )}

        {/* Bỏ qua phần quyền truy cập theo yêu cầu */}

        {/* Bỏ qua chỉnh sửa hồ sơ theo yêu cầu */}

        {/* Actions */}
        <View style={{ gap: 12 }}>
          <Button
            title="Đăng xuất"
            variant="danger"
            onPress={handleLogout}
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={{
            fontSize: 12,
            color: '#9ca3af',
            textAlign: 'center',
          }}>
            ID: {me?.id}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
