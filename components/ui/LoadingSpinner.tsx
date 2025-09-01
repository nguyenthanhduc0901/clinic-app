import React from 'react';
import { View, ActivityIndicator, Text, ViewStyle } from 'react-native';
import { theme } from '../../utils/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  style?: ViewStyle;
}

export function LoadingSpinner({ 
  message = 'Đang tải...', 
  size = 'large', 
  style 
}: LoadingSpinnerProps) {
  return (
    <View style={[{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }, style]}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && (
        <Text style={{
          marginTop: 12,
          fontSize: 16,
          color: theme.colors.textMuted,
          textAlign: 'center',
        }}>
          {message}
        </Text>
      )}
    </View>
  );
}
