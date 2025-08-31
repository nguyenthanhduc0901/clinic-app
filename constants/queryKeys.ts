export const QK = {
  appointments: {
    list: (filters: unknown) => ['appointments', 'list', filters] as const,
  },
} as const;


