import React from 'react';
import { Text, View } from 'react-native';
import { theme } from '../../utils/theme';
import { AppointmentStatus } from '../../types/appointments';

const map: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
  waiting: { bg: theme.colors.bgMuted, text: '#374151', label: 'Chờ xác nhận' },
  confirmed: { bg: theme.colors.primaryLight, text: theme.colors.primaryDark, label: 'Đã xác nhận' },
  checked_in: { bg: '#ede9fe', text: '#6d28d9', label: 'Đã check-in' },
  in_progress: { bg: theme.colors.warningBg, text: theme.colors.warning, label: 'Đang xử lý' },
  completed: { bg: theme.colors.successBg, text: theme.colors.success, label: 'Hoàn tất' },
  cancelled: { bg: theme.colors.dangerBg, text: theme.colors.danger, label: 'Đã hủy' },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = map[status];
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: s.bg }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: s.text }}>{s.label}</Text>
    </View>
  );
}


