import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';

interface NoticeProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  style?: ViewStyle;
}

export function Notice({ type = 'info', title, message, style }: NoticeProps) {
  const colorMap = {
    info: { bg: '#e0f2fe', text: '#0c4a6e', icon: 'ℹ️' },
    warning: { bg: '#fef3c7', text: '#78350f', icon: '⚠️' },
    error: { bg: '#fee2e2', text: '#7f1d1d', icon: '⛔' },
    success: { bg: '#dcfce7', text: '#14532d', icon: '✅' },
  } as const;

  const colors = colorMap[type];

  const barStyle: ViewStyle = {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.bg,
    marginVertical: 8,
  };

  const titleStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  };

  const messageStyle: TextStyle = {
    fontSize: 14,
    color: colors.text,
    marginLeft: title ? 28 : 8,
    marginTop: title ? 4 : 0,
  };

  return (
    <View style={[barStyle, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 16 }}>{colors.icon}</Text>
        {title && <Text style={titleStyle}>{title}</Text>}
      </View>
      <Text style={messageStyle}>{message}</Text>
    </View>
  );
}
