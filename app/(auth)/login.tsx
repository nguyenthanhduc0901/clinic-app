import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Notice } from '../../components/ui/Notice';
import { authLogin, getProfile, getMyPermissions, ApiError } from '../../lib/api';
import { MOCK_MODE, mockAuthLogin, mockGetProfile, mockGetMyPermissions } from '../../lib/mockApi';
import { setToken } from '../../lib/auth';
import { useToast } from '../../providers/ToastProvider';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // Clear any previous errors
      setApiError(null);

      // Use mock API if backend is not available
      if (MOCK_MODE) {
        // Step 1: Mock login and get token
        const loginResponse = await mockAuthLogin(data);
        
        // Step 2: Store token
        await setToken(loginResponse.accessToken);
        
        // Step 3: Fetch profile and permissions to ensure they're cached
        const [profile, permissions] = await Promise.all([
          mockGetProfile(),
          mockGetMyPermissions(),
        ]);

        return { loginResponse, profile, permissions };
      } else {
        // Real API calls
        const loginResponse = await authLogin(data);
        await setToken(loginResponse.accessToken);
        const [profile, permissions] = await Promise.all([
          getProfile(),
          getMyPermissions(),
        ]);

        return { loginResponse, profile, permissions };
      }
    },
    onSuccess: ({ profile, permissions }) => {
      // Cache the profile and permissions data
      queryClient.setQueryData(['auth','profile'], profile);
      queryClient.setQueryData(['auth','permissions'], permissions);
      
      // Navigate to main app
      router.replace('/(tabs)');
    },
    onError: (error: ApiError) => {
      console.error('Login error:', error);
      
      // Handle specific error cases
      switch (error.statusCode) {
        case 400:
          setApiError(error.message);
          if (Array.isArray(error.details)) {
            error.details.forEach((d: any) => {
              if (d?.field && d?.message && (d.field === 'email' || d.field === 'password')) {
                // Map server validation to RHF field errors
                setError(d.field as keyof LoginFormData, { type: 'server', message: d.message });
              }
            });
          }
          break;
        case 401:
          setApiError('Email hoặc mật khẩu không đúng');
          break;
        case 409:
          showToast(error.message || 'Xung đột dữ liệu', 'warning');
          // Keep form values intact for 409 conflicts
          break;
        case 0:
          setApiError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.');
          break;
        default:
          setApiError(error.message || 'Đã xảy ra lỗi không xác định');
      }
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: 48 }}>
            <Text style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#111827',
              textAlign: 'center',
              marginBottom: 8,
            }}>
              Đăng nhập
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#6b7280',
              textAlign: 'center',
            }}>
              Chào mừng bạn trở lại
            </Text>
          </View>

          {MOCK_MODE && (
            <Notice
              type="info"
              title="Demo Mode"
              message="App đang chạy ở chế độ demo. Sử dụng: email: patient@test.com, password: test123"
              style={{ marginBottom: 24 }}
            />
          )}

          {apiError && (
            <Notice
              type="error"
              message={apiError}
              style={{ marginBottom: 24 }}
            />
          )}

          <View style={{ marginBottom: 32 }}>
            <FormField
              name="email"
              control={control}
              label="Email"
              placeholder="Nhập email của bạn"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <FormField
              name="password"
              control={control}
              label="Mật khẩu"
              placeholder="Nhập mật khẩu của bạn"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <Button
            title="Đăng nhập"
            onPress={handleSubmit(onSubmit)}
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}
            size="lg"
          />

          <View style={{ marginTop: 24 }}>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
            }}>
              Bạn chưa có tài khoản? Liên hệ phòng khám để được hỗ trợ
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
