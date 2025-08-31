import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Button } from './Button';

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
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 8,
      }}>
        {title}
      </Text>
      
      <Text style={{
        fontSize: 16,
        color: '#6b7280',
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
