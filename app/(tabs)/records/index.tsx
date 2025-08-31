import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice } from '../../../components/ui/Notice';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { EmptyState } from '../../../components/ui/EmptyState';
import api, { ApiError } from '../../../lib/api';
import { MOCK_MODE } from '../../../lib/mockApi';

export default function RecordsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [missingOwnEndpoint, setMissingOwnEndpoint] = useState(false);

  // Attempt fetch; if 403/404, show Notice about missing own endpoints
  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (MOCK_MODE) {
        setMissingOwnEndpoint(true);
        return;
      }
      await api.get('/me/medical-records');
    } catch (e: any) {
      const err = e as ApiError;
      if (err?.statusCode === 403 || err?.statusCode === 404) {
        setMissingOwnEndpoint(true);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Không thể tải dữ liệu');
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchRecords();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  const toggleErrorState = () => {
    setShowError(!showError);
    setShowEmpty(false);
  };

  const toggleEmptyState = () => {
    setShowEmpty(!showEmpty);
    setShowError(false);
  };

  const toggleLoadingState = async () => {
    setShowError(false);
    setShowEmpty(false);
    await fetchRecords();
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner message="Đang tải hồ sơ y tế..." />;
  }

  if (showError && !missingOwnEndpoint) {
    return (
      <ErrorMessage
        title="Không thể tải hồ sơ y tế"
        message="Đã xảy ra lỗi khi tải hồ sơ y tế. Vui lòng thử lại."
        onRetry={toggleErrorState}
      />
    );
  }

  if (showEmpty) {
    return (
      <EmptyState
        title="Chưa có hồ sơ y tế"
        message="Bạn chưa có hồ sơ y tế nào trong hệ thống."
        icon={
          <Text style={{ fontSize: 48 }}>📋</Text>
        }
        action={
          <Button
            title="Làm mới"
            variant="outline"
            onPress={toggleEmptyState}
          />
        }
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Notice about missing endpoints */}
        {missingOwnEndpoint && (
          <Notice
            type="warning"
            title="Endpoint chưa sẵn sàng"
            message="Endpoint /me/medical-records chưa được triển khai từ backend. Vui lòng chờ backend team hoàn thiện."
          />
        )}

        {/* Filter Section */}
        <View style={{
          backgroundColor: '#f8fafc',
          padding: 16,
          borderRadius: 8,
          marginBottom: 20,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#334155',
            marginBottom: 12,
          }}>
            Bộ lọc
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: 8,
          }}>
            <Button title="Tất cả" variant="outline" size="sm" />
            <Button title="Khám tổng quát" variant="outline" size="sm" />
            <Button title="Xét nghiệm" variant="outline" size="sm" />
            <Button title="Chẩn đoán hình ảnh" variant="outline" size="sm" />
          </View>
        </View>

        {/* Demo UI State Toggles */}
        <View style={{
          backgroundColor: '#e0f2fe',
          padding: 16,
          borderRadius: 8,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#0ea5e9',
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#0c4a6e',
            marginBottom: 12,
          }}>
            Demo: Các trạng thái UI
          </Text>
          
          <View style={{ gap: 8 }}>
            <Button
              title="Hiển thị trạng thái loading"
              variant="outline"
              size="sm"
              onPress={toggleLoadingState}
            />
            <Button
              title="Hiển thị trạng thái lỗi"
              variant="outline"
              size="sm"
              onPress={toggleErrorState}
            />
            <Button
              title="Hiển thị trạng thái rỗng"
              variant="outline"
              size="sm"
              onPress={toggleEmptyState}
            />
          </View>
        </View>

        {/* Placeholder Content */}
        <View style={{
          backgroundColor: '#f9fafb',
          padding: 20,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderStyle: 'dashed',
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 8,
          }}>
            Hồ sơ y tế sẽ hiển thị ở đây
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#9ca3af',
            textAlign: 'center',
          }}>
            Bao gồm kết quả khám bệnh, đơn thuốc, xét nghiệm và chẩn đoán hình ảnh
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
