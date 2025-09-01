import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useMyAppointmentDetail, useRescheduleMyAppointment, useCancelMyAppointment } from '../../../hooks/useAppointments';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Notice } from '../../../components/ui/Notice';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { DateInput } from '../../../components/ui/DateInput';
import { useToast } from '../../../providers/ToastProvider';
import { ApiError } from '../../../lib/api';

const RescheduleSchema = z.object({
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày dạng YYYY-MM-DD'),
});

type RescheduleForm = z.infer<typeof RescheduleSchema>;

export default function AppointmentDetailScreen() {
  const params = useLocalSearchParams();
  const idParam = (params as any).id as string | string[] | undefined;
  const apptId = Array.isArray(idParam) ? idParam[0] : idParam;
  const { showToast } = useToast();
  const [isRescheduling, setIsRescheduling] = useState(false);

  if (!apptId) {
    return <Notice type="error" title="Thiếu tham số" message="Không xác định mã lịch hẹn." />;
  }

  const detailQuery = useMyAppointmentDetail(apptId);
  const rescheduleMutation = useRescheduleMyAppointment(apptId, {});
  const cancelMutation = useCancelMyAppointment(apptId, {});

  const { control, handleSubmit, setValue, watch } = useForm<RescheduleForm>({
    resolver: zodResolver(RescheduleSchema),
    defaultValues: { appointmentDate: '' },
  });
  const appointmentDateValue = watch('appointmentDate');

  if (detailQuery.isLoading) {
    return <LoadingSpinner message="Đang tải chi tiết lịch hẹn..." />;
  }

  if (detailQuery.error) {
    const error = detailQuery.error as ApiError;
    if (error.statusCode === 404) {
      return <Notice type="error" title="Không tìm thấy" message="Lịch hẹn không tồn tại hoặc không thuộc sở hữu của bạn." />;
    }
    return (
      <ErrorMessage
        title="Không thể tải chi tiết lịch hẹn"
        message={error.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
        onRetry={detailQuery.refetch}
      />
    );
  }

  const appt = detailQuery.data;
  if (!appt) {
    return <Notice type="error" title="Không thể tải" message="Dữ liệu lịch hẹn trống." />;
  }

  const onReschedule = (form: RescheduleForm) => {
    rescheduleMutation.mutate(
      { appointmentDate: form.appointmentDate },
      {
        onSuccess: () => {
          showToast('Dời lịch thành công', 'success');
          detailQuery.refetch();
          setIsRescheduling(false);
        },
        onError: (err: ApiError) => {
          if (err.statusCode === 409) return showToast('Có xung đột, vui lòng thử lại', 'warning');
          if (err.statusCode === 400 && Array.isArray(err.details)) return showToast(err.message || 'Dữ liệu không hợp lệ', 'warning');
          showToast(err.message || 'Dời lịch thất bại', 'error');
        },
      }
    );
  };

  const onCancel = () => {
    Alert.alert('Hủy lịch', 'Bạn có chắc chắn muốn hủy lịch hẹn này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy lịch', style: 'destructive', onPress: () => {
          cancelMutation.mutate(undefined as any, {
            onSuccess: () => {
              showToast('Hủy lịch thành công', 'success');
              detailQuery.refetch();
            },
            onError: (err: ApiError) => {
              if (err.statusCode === 409) return showToast('Có xung đột, vui lòng thử lại', 'warning');
              if (err.statusCode === 404) return showToast('Không tìm thấy lịch hẹn', 'warning');
              showToast(err.message || 'Hủy lịch thất bại', 'error');
            }
          });
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>{appt.appointmentDate}</Text>
            <StatusBadge status={appt.status} />
          </View>
          <Text style={{ color: '#6b7280', marginTop: 6 }}>Số thứ tự: {appt.orderNumber}</Text>
          <Text style={{ color: '#6b7280', marginTop: 6 }}>BN: {appt.patient?.fullName || '—'} {appt.patient?.phone ? `(${appt.patient.phone})` : ''}</Text>
          <Text style={{ color: '#6b7280', marginTop: 6 }}>BS: {appt.staff?.fullName || 'Chưa gán'}</Text>
          {appt.notes ? (<Text style={{ color: '#6b7280', marginTop: 6 }}>Ghi chú: {appt.notes}</Text>) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <Button title={isRescheduling ? 'Đóng' : 'Dời lịch'} variant="outline" onPress={() => { setIsRescheduling(!isRescheduling); setValue('appointmentDate', appt.appointmentDate); }} />
          <Button title="Hủy lịch" variant="danger" onPress={onCancel} loading={cancelMutation.isPending} />
        </View>

        {isRescheduling && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>Ngày mới (YYYY-MM-DD)</Text>
            <DateInput value={appointmentDateValue} onChange={(v) => setValue('appointmentDate', v)} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Button title="Lưu" onPress={handleSubmit(onReschedule)} loading={rescheduleMutation.isPending} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


