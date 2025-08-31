import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface PaginatorProps {
  page: number;
  total: number;
  limit: number;
  onChange: (nextPage: number) => void;
}

export function Paginator({ page, total, limit, onChange }: PaginatorProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
      <TouchableOpacity
        style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: canPrev ? '#0ea5e9' : '#d1d5db' }}
        disabled={!canPrev}
        onPress={() => onChange(page - 1)}
      >
        <Text style={{ color: '#ffffff', fontWeight: '600' }}>Trước</Text>
      </TouchableOpacity>

      <Text style={{ color: '#374151' }}>
        Trang {page}/{totalPages}
      </Text>

      <TouchableOpacity
        style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: canNext ? '#0ea5e9' : '#d1d5db' }}
        disabled={!canNext}
        onPress={() => onChange(page + 1)}
      >
        <Text style={{ color: '#ffffff', fontWeight: '600' }}>Sau</Text>
      </TouchableOpacity>
    </View>
  );
}


