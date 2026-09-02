/**
 * Campus Food - Unified Design System & Color Tokens
 * Teal Light Theme
 */

export const ThemeTokens = {
  // Brand Primary & Accents
  primary: '#0D9488',
  primaryHover: '#0F766E',
  primaryLight: '#CCFBF1',
  secondary: '#14B8A6',
  accent: '#2DD4BF',

  // Background & Surface
  background: '#F0FDFA',
  backgroundSecondary: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHover: '#CCFBF1',

  // Typography
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  // Borders
  border: '#E2E8F0',
  borderAccent: '#99F6E4',

  // Status Colors
  success: '#059669',
  successBackground: '#ECFDF5',
  warning: '#D97706',
  warningBackground: '#FFFBEB',
  danger: '#DC2626',
  dangerBackground: '#FEF2F2',
} as const;

export type ThemeTokensType = typeof ThemeTokens;
