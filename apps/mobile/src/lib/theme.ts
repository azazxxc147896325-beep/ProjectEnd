/**
 * Campus Food Mobile Theme - Teal Light Theme
 * Design System tokens matching shared-types and web app
 */

export const COLORS = {
  // Main backgrounds & surfaces
  background: '#F0FDFA',       // Teal-50
  backgroundSecondary: '#F8FAFC', // Slate-50
  card: '#FFFFFF',             // Clean crisp white card surface
  cardElevated: '#FFFFFF',
  cardSubtle: '#F8FAFC',
  surfaceHover: '#CCFBF1',     // Teal-100

  // Primary Brand Teal
  primary: '#0D9488',          // Teal-600
  primaryHover: '#0F766E',     // Teal-700
  primaryDark: '#0F766E',      // Teal-700
  secondary: '#14B8A6',        // Teal-500
  accent: '#2DD4BF',           // Teal-400
  primaryLight: '#CCFBF1',     // Teal-100
  primarySubtle: '#F0FDFA',    // Teal-50
  primaryBorder: '#99F6E4',    // Teal-200
  borderAccent: '#99F6E4',     // Teal-200

  // Text Colors
  textPrimary: '#0F172A',      // Slate-900 high contrast
  textSecondary: '#475569',    // Slate-600
  textMuted: '#94A3B8',        // Slate-400
  textInverse: '#FFFFFF',      // White

  // Borders & Dividers
  border: '#E2E8F0',          // Slate-200
  borderLight: '#F1F5F9',     // Slate-100
  borderFocus: '#0D9488',

  // Status & Feedback Colors
  success: '#059669',         // Emerald-600
  successBg: '#ECFDF5',       // Emerald-50
  successBorder: '#A7F3D0',   // Emerald-200

  warning: '#D97706',         // Amber-600
  warningBg: '#FFFBEB',       // Amber-50
  warningBorder: '#FDE68A',   // Amber-200

  danger: '#DC2626',          // Red-600
  dangerBg: '#FEF2F2',        // Red-50
  dangerBorder: '#FECACA',    // Red-200

  info: '#0D9488',            // Teal-600
  infoBg: '#CCFBF1',          // Teal-100
  infoBorder: '#99F6E4',      // Teal-200

  purple: '#7C3AED',          // Violet-600
  purpleBg: '#F5F3FF',        // Violet-50
  purpleBorder: '#DDD6FE',    // Violet-200
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
};
