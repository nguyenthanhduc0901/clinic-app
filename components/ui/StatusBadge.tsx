import React from 'react';
import { Text, View } from 'react-native';
import { AppointmentStatus } from '../../types/appointments';

const map: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
  waiting: { bg: '#f3f4f6', text: '#374151', label: 'Chờ xác nhận' },
  confirmed: { bg: '#dbeafe', text: '#1d4ed8', label: 'Đã xác nhận' },
  checked_in: { bg: '#ede9fe', text: '#6d28d9', label: 'Đã check-in' },
  in_progress: { bg: '#fef3c7', text: '#b45309', label: 'Đang xử lý' },
  completed: { bg: '#dcfce7', text: '#15803d', label: 'Hoàn tất' },
  cancelled: { bg: '#fee2e2', text: '#b91c1c', label: 'Đã hủy' },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = map[status];
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: s.bg }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: s.text }}>{s.label}</Text>
    </View>
  );
}


