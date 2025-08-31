import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

interface DateInputProps {
  value?: string;
  onChange: (val: string) => void;
}

export function DateInput({ value, onChange }: DateInputProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#ffffff' }}>
      <TextInput
        style={{ flex: 1, color: '#111827' }}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#9ca3af"
        keyboardType="numbers-and-punctuation"
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
      />
      {value ? (
        <TouchableOpacity onPress={() => onChange('')}>
          <Text style={{ color: '#6b7280' }}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}


