import React from 'react';
import { View, Text } from 'react-native';
import { TextInput } from './TextInput';
import { formatDate } from '../../utils/date';

interface DateInputProps {
  label: string;
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string | undefined) => void;
  placeholder?: string;
  error?: string;
}

export function DateInput({ label, value, onChange, placeholder = 'YYYY-MM-DD', error }: DateInputProps) {
  const handleTextChange = (text: string) => {
    // Basic date format validation
    if (!text) {
      onChange(undefined);
      return;
    }
    
    // Only allow digits and hyphens
    const cleaned = text.replace(/[^\d-]/g, '');
    
    // Auto-format as user types
    let formatted = cleaned;
    if (cleaned.length >= 4 && cleaned[4] !== '-') {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }
    if (formatted.length >= 7 && formatted[7] !== '-') {
      formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
    }
    
    // Limit to YYYY-MM-DD format
    if (formatted.length <= 10) {
      onChange(formatted || undefined);
    }
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <TextInput
        label={label}
        value={value || ''}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        error={error}
        keyboardType="numeric"
      />
      {value && (
        <Text style={{
          fontSize: 12,
          color: '#6b7280',
          marginTop: 4,
        }}>
          {formatDate(value)}
        </Text>
      )}
    </View>
  );
}