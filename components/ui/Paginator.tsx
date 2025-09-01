import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../utils/theme';

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
        style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: canPrev ? theme.colors.primary : theme.colors.borderMuted }}
        disabled={!canPrev}
        onPress={() => onChange(page - 1)}
      >
        <Text style={{ color: '#ffffff', fontWeight: '600' }}>Trước</Text>
      </TouchableOpacity>

      <Text style={{ color: theme.colors.text }}>
        Trang {page}/{totalPages}
      </Text>

      <TouchableOpacity
        style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: canNext ? theme.colors.primary : theme.colors.borderMuted }}
        disabled={!canNext}
        onPress={() => onChange(page + 1)}
      >
        <Text style={{ color: '#ffffff', fontWeight: '600' }}>Sau</Text>
      </TouchableOpacity>
    </View>
  );
}


