export const colors = {
  surface: '#F8FAFC',
  onSurface: '#0F172A',
  surfaceSecondary: '#FFFFFF',
  onSurfaceSecondary: '#1E293B',
  surfaceTertiary: '#F1F5F9',
  onSurfaceTertiary: '#334155',
  surfaceInverse: '#0F172A',
  onSurfaceInverse: '#FFFFFF',
  brand: '#2A7AF2',
  brandPrimary: '#2A7AF2',
  onBrandPrimary: '#FFFFFF',
  brandSecondary: '#10B981',
  onBrandSecondary: '#FFFFFF',
  brandTertiary: '#E0F2FE',
  onBrandTertiary: '#1D4ED8',
  mintTint: '#DCFCE7',
  blueTint: '#DBEAFE',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  divider: '#F1F5F9',
  muted: '#64748B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const type = {
  size: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
  },
};

export const shadowSoft = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 20,
  elevation: 3,
};

export const shadowCard = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 14,
  elevation: 2,
};

export const shadowFab = {
  shadowColor: '#2A7AF2',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.35,
  shadowRadius: 20,
  elevation: 10,
};

export const specialties = [
  { key: 'Cardio', label: 'Cardio', icon: 'heart', color: '#EF4444', bg: '#FEE2E2' },
  { key: 'Derma', label: 'Derma', icon: 'color-palette', color: '#F59E0B', bg: '#FEF3C7' },
  { key: 'Neuro', label: 'Neuro', icon: 'pulse', color: '#8B5CF6', bg: '#EDE9FE' },
  { key: 'Dental', label: 'Dental', icon: 'medkit', color: '#06B6D4', bg: '#CFFAFE' },
  { key: 'Ortho', label: 'Ortho', icon: 'body', color: '#10B981', bg: '#DCFCE7' },
  { key: 'ENT', label: 'ENT', icon: 'ear', color: '#3B82F6', bg: '#DBEAFE' },
  { key: 'General', label: 'General', icon: 'medical', color: '#2A7AF2', bg: '#E0F2FE' },
  { key: 'Eye', label: 'Eye', icon: 'eye', color: '#EC4899', bg: '#FCE7F3' },
];
