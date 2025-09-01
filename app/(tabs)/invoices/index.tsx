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

import { useListMyInvoices } from '../../../hooks/useInvoices';
import { InvoiceStatus, ListInvoicesParams } from '../../../types/invoices';
import { formatDate } from '../../../utils/date';
import { ApiError } from '../../../lib/api';

// Components
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Notice } from '../../../components/ui/Notice';
import { Button } from '../../../components/ui/Button';
import { InvoiceStatusBadge } from '../../../components/ui/InvoiceStatusBadge';
import { Paginator } from '../../../components/ui/Paginator';
import { DateInput } from '../../../components/ui/DateInput';
import { QK } from '../../../constants/queryKeys';

export default function InvoicesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<ListInvoicesParams>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: invoices, total, isLoading, error, refetch } = useListMyInvoices(filters);

  const handleFilterChange = (newFilters: Partial<ListInvoicesParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString('vi-VN') + 'đ';
  };

  if (isLoading && !invoices.length) {
    return <LoadingSpinner message="Đang tải danh sách hóa đơn..." />;
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
              message="Bạn không có quyền xem hóa đơn."
            />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <ErrorMessage
        title="Không thể tải danh sách hóa đơn"
        message={apiError.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
        onRetry={() => queryClient.invalidateQueries({ queryKey: QK.invoices.list(filters) })}
      />
    );
  }

  const hasFilters = filters.status || filters.date;
  const showEmpty = !isLoading && invoices.length === 0;

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

                {Object.values(InvoiceStatus).map((status) => (
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
                      {status === InvoiceStatus.PENDING && 'Chờ thanh toán'}
                      {status === InvoiceStatus.PAID && 'Đã thanh toán'}
                      {status === InvoiceStatus.CANCELLED && 'Đã hủy'}
                      {status === InvoiceStatus.REFUNDED && 'Đã hoàn tiền'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Filter */}
              <DateInput
                label="Ngày"
                value={filters.date}
                onChange={(date) => handleFilterChange({ date })}
                placeholder="Chọn ngày"
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
            {total > 0 ? `${total} hóa đơn` : 'Không có kết quả'}
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
            <Text style={{ fontSize: 48, marginBottom: 16 }}>💰</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              {hasFilters ? 'Không tìm thấy hóa đơn' : 'Chưa có hóa đơn'}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 }}>
              {hasFilters
                ? 'Thử điều chỉnh bộ lọc để tìm kết quả khác'
                : 'Hóa đơn sẽ xuất hiện ở đây sau khi bạn sử dụng dịch vụ'
              }
            </Text>
          </View>
        )}

        {/* Invoices List */}
        {invoices.map((invoice: any) => (
          <TouchableOpacity
            key={invoice.id}
            activeOpacity={0.7}
            onPress={() => router.push(`/(tabs)/invoices/${invoice.id}` as any)}
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
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                Hóa đơn #{invoice.id}
              </Text>
              <InvoiceStatusBadge status={invoice.status} size="sm" />
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 2 }}>Tổng tiền</Text>
              <Text style={{ fontSize: 18, color: '#059669', fontWeight: '600' }}>
                {formatCurrency(invoice.totalFee)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Tiền khám</Text>
                <Text style={{ fontSize: 14, color: '#374151' }}>
                  {formatCurrency(invoice.examinationFee)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Tiền thuốc</Text>
                <Text style={{ fontSize: 14, color: '#374151' }}>
                  {formatCurrency(invoice.medicineFee)}
                </Text>
              </View>
            </View>

            {invoice.paymentDate && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Ngày thanh toán</Text>
                <Text style={{ fontSize: 14, color: '#374151' }}>
                  {formatDate(invoice.paymentDate)}
                </Text>
              </View>
            )}

            {invoice.paymentMethod && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Phương thức</Text>
                <Text style={{ fontSize: 14, color: '#374151' }}>
                  {invoice.paymentMethod === 'cash' ? 'Tiền mặt' : 
                   invoice.paymentMethod === 'card' ? 'Thẻ' : 
                   invoice.paymentMethod === 'transfer' ? 'Chuyển khoản' : 
                   invoice.paymentMethod}
                </Text>
              </View>
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
            page={filters.page || 1}
            total={total}
            limit={filters.limit || 10}
            onChange={handlePageChange}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}