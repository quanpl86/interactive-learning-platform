export const designTokens = {
  color: {
    page: '#F7F9FC',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    primary: '#047857',
    primaryHover: '#065F46',
    primarySoft: '#ECFDF5',
    secondary: '#1D4ED8',
    secondarySoft: '#EFF6FF',
    border: '#DFE5EC',
    borderStrong: '#CBD5E1',
    focus: '#2563EB',
    error: '#B91C1C',
  },
  layout: {
    contentMaxPx: 1440,
    desktopSidebarPx: 228,
    touchTargetMinPx: 44,
  },
  theme: 'light-only',
} as const;

export type DesignTokens = typeof designTokens;
