export const theme = {
  colors: {
    // Primary medical blue/teal palette
    primary: '#0ea5e9', // sky-500
    primaryDark: '#0284c7', // sky-600
    primaryLight: '#e0f2fe', // sky-100

    // Success/Warning/Error
    success: '#16a34a',
    successBg: '#dcfce7',
    warning: '#b45309',
    warningBg: '#fef3c7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',

    // Neutral grays
    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    borderMuted: '#d1d5db',
    bg: '#ffffff',
    bgMuted: '#f8fafc',
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },
  typography: {
    h1: { fontSize: 24, fontWeight: '700' as const },
    h2: { fontSize: 20, fontWeight: '700' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16 },
    caption: { fontSize: 12 },
  },
};

export type Theme = typeof theme;

