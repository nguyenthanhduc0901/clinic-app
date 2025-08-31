import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { getProfile, getMyPermissions, ApiError, updateProfile, UpdateProfileDto } from '../../lib/api';
import { MOCK_MODE, mockGetProfile, mockGetMyPermissions, mockUpdateProfile } from '../../lib/mockApi';
import { useSession } from '../../hooks/useSession';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';
import { Notice } from '../../components/ui/Notice';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '../../components/ui/FormField';
import { useToast } from '../../providers/ToastProvider';

export default function ProfileScreen() {
  const { logout } = useSession();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['auth','profile'],
    queryFn: MOCK_MODE ? mockGetProfile : getProfile,
    retry: 1,
  });

  const permissionsQuery = useQuery({
    queryKey: ['auth','permissions'],
    queryFn: MOCK_MODE ? mockGetMyPermissions : getMyPermissions,
    retry: 1,
  });

  // Zod schema per Prompt 2 - moved before conditional returns
  const updateSchema = z.object({
    email: z.string().email().optional(),
    phone: z.string().regex(/^0\d{9,10}$/).optional().or(z.literal('').optional()),
    fullName: z.string().min(1).optional(),
    gender: z.enum(['Nam','Nữ','Khác']).optional(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    address: z.string().optional(),
    avatarUrl: z.string().url().optional(),
  });

  type ProfileFormData = z.infer<typeof updateSchema>;

  const profile = profileQuery.data;
  const permissions = permissionsQuery.data;

  // Always call useForm - moved before conditional returns
  const { control, handleSubmit, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      email: profile?.email || '',
      phone: profile?.phone || '',
      fullName: (profile as any)?.fullName || profile?.name || '',
      gender: (profile as any)?.gender,
      birthDate: (profile as any)?.birthDate || profile?.dateOfBirth || '',
      address: profile?.address || '',
      avatarUrl: (profile as any)?.avatarUrl || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (dto: UpdateProfileDto) => {
      if (MOCK_MODE) {
        return mockUpdateProfile(dto);
      }
      return updateProfile(dto);
    },
    onSuccess: () => {
      showToast('Cập nhật hồ sơ thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['auth','profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
    onError: (error: ApiError) => {
      if (error.statusCode === 409) {
        showToast(error.message || 'Xung đột dữ liệu', 'warning');
        return;
      }
      showToast(error.message || 'Cập nhật thất bại', 'error');
    },
  });

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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['auth','profile'] });
    queryClient.invalidateQueries({ queryKey: ['auth','permissions'] });
  };

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  // Early returns after all hooks
  if (profileQuery.isLoading || permissionsQuery.isLoading) {
    return <LoadingSpinner message="Đang tải thông tin hồ sơ..." />;
  }

  if (profileQuery.error || permissionsQuery.error) {
    const error = (profileQuery.error || permissionsQuery.error) as ApiError;
    return (
      <ErrorMessage
        title="Không thể tải thông tin hồ sơ"
        message={error.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
        onRetry={handleRefresh}
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
              {profile?.name || 'Chưa cập nhật'}
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
              {profile?.email}
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
              {profile?.phone || 'Chưa cập nhật'}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 4,
            }}>
              Ngày sinh
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#111827',
              fontWeight: '500',
            }}>
              {profile?.dateOfBirth || 'Chưa cập nhật'}
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
              {profile?.address || 'Chưa cập nhật'}
            </Text>
          </View>
        </View>

        {/* Permissions */}
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
            Quyền truy cập
          </Text>

          <Text style={{
            fontSize: 14,
            color: '#6b7280',
            marginBottom: 8,
          }}>
            Vai trò: {profile?.role || 'Không xác định'}
          </Text>

          {permissions?.permissions && permissions.permissions.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {permissions.permissions.map((permission, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#e0f2fe',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#0ea5e9',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: '#0c4a6e',
                    fontWeight: '500',
                  }}>
                    {permission}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Notice
              type="warning"
              message="Không có quyền truy cập nào được tìm thấy"
            />
          )}
        </View>

        {/* Edit Form */}
        <View style={{
          backgroundColor: '#f8fafc',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>Chỉnh sửa hồ sơ</Text>
            <Button
              title={isEditing ? 'Hủy' : 'Sửa'}
              variant="outline"
              onPress={() => {
                if (isEditing) {
                  reset();
                }
                setIsEditing(!isEditing);
              }}
            />
          </View>

          {isEditing && (
            <View style={{ marginTop: 16 }}>
              <FormField name="email" control={control} label="Email" autoCapitalize="none" keyboardType="email-address" />
              <FormField name="phone" control={control} label="Số điện thoại" keyboardType="phone-pad" />
              <FormField name="fullName" control={control} label="Họ và tên" />
              <FormField name="gender" control={control} label="Giới tính (Nam/Nữ/Khác)" />
              <FormField name="birthDate" control={control} label="Ngày sinh (YYYY-MM-DD)" />
              <FormField name="address" control={control} label="Địa chỉ" />
              <FormField name="avatarUrl" control={control} label="Avatar URL" autoCapitalize="none" />

              <Button title="Lưu thay đổi" onPress={handleSubmit(onSubmit)} loading={mutation.isPending} />
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={{ gap: 12 }}>
          <Button
            title="Làm mới thông tin"
            variant="outline"
            onPress={handleRefresh}
          />
          
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
            ID: {profile?.id}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
