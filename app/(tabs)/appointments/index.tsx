import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice } from '../../../components/ui/Notice';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { DateInput } from '../../../components/ui/DateInput';
import { Paginator } from '../../../components/ui/Paginator';
import { useListMyAppointments, useCreateMyAppointment } from '../../../hooks/useAppointments';
import { AppointmentStatus } from '../../../types/appointments';
import { CreateAppointmentSchema } from '../../../schemas/appointments';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../../providers/ToastProvider';
import { OwnEndpointMissingError } from '../../../lib/appointments.client';
import { ApiError } from '../../../lib/api';
import { FormField } from '../../../components/ui/FormField';

export default function AppointmentsScreen() {
  const { showToast } = useToast();
  const [filters, setFilters] = useState<{ date?: string; status?: AppointmentStatus; page: number; limit: number }>({ page: 1, limit: 10 });
  const { data, total, isLoading, isError, error, refetch } = useListMyAppointments(filters);
  const createMutation = useCreateMyAppointment(filters);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  type CreateAppointmentForm = z.infer<typeof CreateAppointmentSchema>;
  const { control: createControl, handleSubmit: handleCreateSubmit, reset: resetCreate, setError: setCreateError } = useForm<CreateAppointmentForm>({
    resolver: zodResolver(CreateAppointmentSchema),
    defaultValues: { appointmentDate: '', notes: '' },
  });
  const statuses: (AppointmentStatus | 'all')[] = useMemo(
    () => ['all', 'waiting', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled'],
    []
  );

  // Attempt fetch; if 403/404, show Notice about missing own endpoints
  const fetchAppointments = async () => {
    await refetch();
  };
  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const onCreate = (form: CreateAppointmentForm) => {
    createMutation.mutate(
      { appointmentDate: form.appointmentDate, notes: form.notes || undefined },
      {
        onSuccess: () => {
          showToast('Tạo lịch hẹn thành công', 'success');
          setIsCreating(false);
          resetCreate();
        },
        onError: (err: ApiError | OwnEndpointMissingError) => {
          if (err instanceof OwnEndpointMissingError || (err as ApiError)?.statusCode === 403) {
            showToast('Không có quyền hoặc endpoint own chưa sẵn', 'warning');
            return;
          }
          const e = err as ApiError;
          if (e.statusCode === 400 && Array.isArray(e.details)) {
            e.details.forEach((d: any) => {
              if (d?.field && d?.message && (d.field === 'appointmentDate' || d.field === 'notes')) {
                setCreateError(d.field, { message: d.message });
              }
            });
            return;
          }
          if (e.statusCode === 409) {
            showToast(e.message || 'Xung đột dữ liệu', 'warning');
            return;
          }
          showToast(e.message || 'Tạo lịch hẹn thất bại', 'error');
        },
      }
    );
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner message="Đang tải lịch hẹn..." />;
  }

  if (isError && !(error instanceof OwnEndpointMissingError)) {
    return (
      <ErrorMessage
        title="Không thể tải lịch hẹn"
        message={(error as any)?.message || 'Đã xảy ra lỗi khi tải danh sách lịch hẹn. Vui lòng thử lại.'}
        onRetry={fetchAppointments}
      />
    );
  }

  if (showEmpty) {
    return (
      <EmptyState
        title="Chưa có lịch hẹn"
        message="Bạn chưa có lịch hẹn nào. Liên hệ phòng khám để đặt lịch hẹn."
        icon={
          <Text style={{ fontSize: 48 }}>📅</Text>
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
        {error instanceof OwnEndpointMissingError && (
          <Notice
            type="warning"
            title="Endpoint chưa sẵn sàng"
            message="Endpoint /me/appointments chưa được triển khai từ backend. Vui lòng chờ backend team hoàn thiện."
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
          
          <View style={{ gap: 8 }}>
            <DateInput value={filters.date} onChange={(v) => setFilters(prev => ({ ...prev, date: v || undefined, page: 1 }))} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {statuses.map(s => (
                <Button
                  key={s}
                  title={s === 'all' ? 'Tất cả' : s}
                  variant={filters.status === (s as AppointmentStatus) || (s === 'all' && !filters.status) ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setFilters(prev => ({ ...prev, status: s === 'all' ? undefined : (s as AppointmentStatus), page: 1 }))}
                />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Button title="Áp dụng" variant="outline" onPress={fetchAppointments} />
              <Button title="Đặt lại" variant="outline" onPress={() => { setFilters({ page: 1, limit: 10 }); fetchAppointments(); }} />
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>Cuộc hẹn của tôi</Text>
          <Button title="Tạo lịch hẹn" onPress={() => setIsCreating(true)} />
        </View>

        {/* List */}
        {(!data || data.length === 0) && !(error instanceof OwnEndpointMissingError) ? (
          <EmptyState
            title="Chưa có lịch hẹn"
            message="Bạn chưa có lịch hẹn nào"
          />
        ) : (
          <View style={{ gap: 8 }}>
            {data.map(item => (
              <View key={item.id} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>{item.appointmentDate}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={{ color: '#6b7280', marginTop: 4 }}>Số thứ tự: {item.orderNumber}</Text>
                {item.notes ? (
                  <Text numberOfLines={2} style={{ color: '#6b7280', marginTop: 2 }}>{item.notes}</Text>
                ) : null}
              </View>
            ))}

            <Paginator page={filters.page} total={total} limit={filters.limit} onChange={(p) => setFilters(prev => ({ ...prev, page: p }))} />
          </View>
        )}
      </ScrollView>

      <Modal visible={isCreating} transparent animationType="slide" onRequestClose={() => setIsCreating(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 }}>Tạo lịch hẹn</Text>
            <FormField name="appointmentDate" control={createControl} label="Ngày hẹn (YYYY-MM-DD)" placeholder="YYYY-MM-DD" autoCapitalize="none" />
            <FormField name="notes" control={createControl} label="Ghi chú" placeholder="Tùy chọn" multiline />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Button title="Hủy" variant="outline" onPress={() => { setIsCreating(false); }} />
              <Button title="Tạo" onPress={handleCreateSubmit(onCreate)} loading={createMutation.isPending} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
