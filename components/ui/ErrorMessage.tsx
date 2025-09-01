import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Button } from './Button';
import { theme } from '../../utils/theme';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  style?: ViewStyle;
}

export function ErrorMessage({ 
  title = 'Đã xảy ra lỗi',
  message, 
  onRetry,
  retryText = 'Thử lại',
  style 
}: ErrorMessageProps) {
  return (
    <View style={[{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }, style]}>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.danger,
        textAlign: 'center',
        marginBottom: 8,
      }}>
        {title}
      </Text>
      
      <Text style={{
        fontSize: 16,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
      }}>
        {message}
      </Text>

      {onRetry && (
        <Button 
          title={retryText}
          onPress={onRetry}
          variant="outline"
          size="md"
        />
      )}
    </View>
  );
}
