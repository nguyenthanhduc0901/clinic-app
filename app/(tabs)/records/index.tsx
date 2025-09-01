import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { useListMyMedicalRecords } from '../../../hooks/useMedicalRecords';
import { RecordStatus, ListMedicalRecordsParams } from '../../../types/medicalRecords';
import { formatDate } from '../../../utils/date';
import { ApiError } from '../../../lib/api';

// Components
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Notice } from '../../../components/ui/Notice';
import { Button } from '../../../components/ui/Button';
import { MedicalRecordStatusBadge } from '../../../components/ui/MedicalRecordStatusBadge';
import { Paginator } from '../../../components/ui/Paginator';
import { DateInput } from '../../../components/ui/DateInput';
import { QK } from '../../../constants/queryKeys';

export default function MedicalRecordsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<ListMedicalRecordsParams>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: records, total, isLoading, error, refetch } = useListMyMedicalRecords(filters);

  const handleFilterChange = (newFilters: Partial<ListMedicalRecordsParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  if (isLoading && !records.length) {
    return <LoadingSpinner message="Đang tải hồ sơ y tế..." />;
  }

  if (error) {
    const apiError = error as unknown as ApiError;
    
    // Handle specific error cases
    if (apiError.statusCode === 404) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <View style={{ flex: 1, padding: 20 }}>
            <Notice
              type="warning"
              title="Chưa có hồ sơ bệnh nhân"
              message="Tài khoản của bạn chưa liên kết với hồ sơ bệnh nhân. Vui lòng liên hệ phòng khám."
            />
          </View>
        </SafeAreaView>
      );
    }

    if (apiError.statusCode === 403) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <View style={{ flex: 1, padding: 20 }}>
            <Notice
              type="error"
              title="Không có quyền truy cập"
              message="Bạn không có quyền xem hồ sơ y tế."
            />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <ErrorMessage
        title="Không thể tải hồ sơ y tế"
        message={apiError.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
        onRetry={() => queryClient.invalidateQueries({ queryKey: QK.medicalRecords.list(filters) })}
      />
    );
  }

  const hasFilters = filters.status || filters.dateFrom || filters.dateTo;
  const showEmpty = !isLoading && records.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* Filter Section */}
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              backgroundColor: '#f8fafc',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151' }}>
              Bộ lọc {hasFilters && '(có lọc)'}
            </Text>
            <Text style={{ fontSize: 18, color: '#6b7280' }}>
              {showFilters ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showFilters && (
            <View style={{
              marginTop: 12,
              padding: 16,
              backgroundColor: '#ffffff',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}>
              {/* Status Filter */}
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Trạng thái
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => handleFilterChange({ status: undefined })}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: !filters.status ? '#0ea5e9' : '#f1f5f9',
                    borderWidth: 1,
                    borderColor: !filters.status ? '#0ea5e9' : '#cbd5e1',
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    color: !filters.status ? '#ffffff' : '#64748b',
                    fontWeight: '500',
                  }}>
                    Tất cả
                  </Text>
                </TouchableOpacity>

                {Object.values(RecordStatus).map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => handleFilterChange({ status })}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: filters.status === status ? '#0ea5e9' : '#f1f5f9',
                      borderWidth: 1,
                      borderColor: filters.status === status ? '#0ea5e9' : '#cbd5e1',
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      color: filters.status === status ? '#ffffff' : '#64748b',
                      fontWeight: '500',
                    }}>
                      {status === RecordStatus.PENDING && 'Chờ xử lý'}
                      {status === RecordStatus.COMPLETED && 'Hoàn thành'}
                      {status === RecordStatus.CANCELLED && 'Đã hủy'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Filters */}
              <DateInput
                label="Từ ngày"
                value={filters.dateFrom}
                onChange={(date) => handleFilterChange({ dateFrom: date })}
                placeholder="Chọn ngày bắt đầu"
              />

              <DateInput
                label="Đến ngày"
                value={filters.dateTo}
                onChange={(date) => handleFilterChange({ dateTo: date })}
                placeholder="Chọn ngày kết thúc"
              />

              {/* Clear Filters */}
              {hasFilters && (
                <Button
                  title="Xóa bộ lọc"
                  variant="outline"
                  onPress={clearFilters}
                  size="sm"
                />
              )}
            </View>
          )}
        </View>

        {/* Results Summary */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>
            {total > 0 ? `${total} bản ghi` : 'Không có kết quả'}
          </Text>
        </View>

        {/* Empty State */}
        {showEmpty && (
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 40,
          }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              {hasFilters ? 'Không tìm thấy bản ghi' : 'Chưa có hồ sơ y tế'}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 }}>
              {hasFilters
                ? 'Thử điều chỉnh bộ lọc để tìm kết quả khác'
                : 'Hồ sơ y tế sẽ xuất hiện ở đây sau khi bạn khám bệnh'
              }
            </Text>
          </View>
        )}

        {/* Medical Records List */}
        {records.map((record) => (
          <TouchableOpacity
            key={record.id}
            activeOpacity={0.7}
            onPress={() => router.push(`/(tabs)/records/${record.id}`)}
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 }}>
                {formatDate(record.examinationDate)}
              </Text>
              <MedicalRecordStatusBadge status={record.status} size="sm" />
            </View>

            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 4, fontWeight: '500' }}>
              {record.diagnosis}
            </Text>

            {record.symptoms && (
              <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 18 }}>
                Triệu chứng: {record.symptoms}
              </Text>
            )}

            <View style={{ marginTop: 12, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: '#0ea5e9', fontWeight: '500' }}>
                Xem chi tiết →
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Pagination */}
        {total > 0 && (
          <Paginator
            currentPage={filters.page || 1}
            totalItems={total}
            itemsPerPage={filters.limit || 10}
            onPageChange={handlePageChange}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}