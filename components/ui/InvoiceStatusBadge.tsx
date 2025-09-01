import React from 'react';
import { Text, View } from 'react-native';
import { theme } from '../../utils/theme';
import { InvoiceStatus } from '../../types/invoices';

const statusMap: Record<InvoiceStatus, { bg: string; text: string; label: string }> = {
  [InvoiceStatus.PENDING]: { bg: theme.colors.warningBg, text: theme.colors.warning, label: 'Chờ thanh toán' },
  [InvoiceStatus.PAID]: { bg: theme.colors.successBg, text: theme.colors.success, label: 'Đã thanh toán' },
  [InvoiceStatus.CANCELLED]: { bg: theme.colors.dangerBg, text: theme.colors.danger, label: 'Đã hủy' },
  [InvoiceStatus.REFUNDED]: { bg: '#ede9fe', text: '#6d28d9', label: 'Đã hoàn tiền' },
};

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: 'sm' | 'md';
}

export function InvoiceStatusBadge({ status, size = 'md' }: InvoiceStatusBadgeProps) {
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



