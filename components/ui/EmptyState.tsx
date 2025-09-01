import React from 'react';
import { View, Text, ViewStyle, Image } from 'react-native';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({ 
  title = 'Không có dữ liệu',
  message, 
  icon,
  action,
  style 
}: EmptyStateProps) {
  return (
    <View style={[{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }, style]}>
      {icon ? (
        <View style={{ marginBottom: 16 }}>
          {icon}
        </View>
      ) : (
        <Image
          source={require('../../assets/banner.png')}
          style={{ width: 200, height: 120, marginBottom: 16 }}
          resizeMode="contain"
        />
      )}
      
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
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

      {action && action}
    </View>
  );
}
