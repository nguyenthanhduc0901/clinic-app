import React from 'react';
import { Text, View } from 'react-native';
import { theme } from '../../utils/theme';
import { RecordStatus } from '../../types/medicalRecords';

const statusMap: Record<RecordStatus, { bg: string; text: string; label: string }> = {
  [RecordStatus.PENDING]: { bg: theme.colors.warningBg, text: theme.colors.warning, label: 'Chờ xử lý' },
  [RecordStatus.COMPLETED]: { bg: theme.colors.successBg, text: theme.colors.success, label: 'Hoàn thành' },
  [RecordStatus.CANCELLED]: { bg: theme.colors.dangerBg, text: theme.colors.danger, label: 'Đã hủy' },
};

interface MedicalRecordStatusBadgeProps {
  status: RecordStatus;
  size?: 'sm' | 'md';
}

export function MedicalRecordStatusBadge({ status, size = 'md' }: MedicalRecordStatusBadgeProps) {
  const config = statusMap[status];
  const fontSize = size === 'sm' ? 12 : 14;
  const paddingVertical = size === 'sm' ? 2 : 4;
  const paddingHorizontal = size === 'sm' ? 6 : 8;

  return (
    <View
      style={{
        backgroundColor: config.bg,
        paddingVertical,
        paddingHorizontal,
        borderRadius: 12,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: config.text,
          fontSize,
          fontWeight: '500',
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}



