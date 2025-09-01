export const QK = {
  appointments: {
    list: (filters: unknown) => ['appointments', 'list', filters] as const,
    detail: (id: number | string) => ['appointments', 'detail', id] as const,
  },
  medicalRecords: {
    list: (filters: unknown) => ['medicalRecords', 'list', filters] as const,
    detail: (id: number | string) => ['medicalRecords', 'detail', id] as const,
    attachments: (recordId: number | string) => ['medicalRecords', 'attachments', recordId] as const,
  },
  invoices: {
    list: (filters: unknown) => ['invoices', 'list', filters] as const,
    detail: (id: number | string) => ['invoices', 'detail', id] as const,
    byMedicalRecord: (recordId: number | string) => ['invoices', 'byMedicalRecord', recordId] as const,
  },
  me: ['auth', 'me'] as const,
} as const;


