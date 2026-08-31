/**
 * Campus Food Mobile Theme - Bright Light White & Sky Blue Theme
 */

export const COLORS = {
  // Main backgrounds & surfaces
  background: '#F0F7FF',       // Soft icy sky-blue tint background
  backgroundSecondary: '#F8FAFC',
  card: '#FFFFFF',             // Clean crisp white card surface
  cardElevated: '#FFFFFF',
  cardSubtle: '#F1F5F9',

  // Primary Brand Sky Blue
  primary: '#0284C7',          // Sky-600
  primaryDark: '#0369A1',      // Sky-700
  primaryLight: '#E0F2FE',     // Sky-100
  primarySubtle: '#F0F9FF',    // Sky-50
  primaryBorder: '#BAE6FD',    // Sky-200

  // Text Colors
  textPrimary: '#0F172A',      // Slate-900 high contrast
  textSecondary: '#475569',    // Slate-600
  textMuted: '#94A3B8',        // Slate-400
  textInverse: '#FFFFFF',      // White

  // Borders & Dividers
  border: '#E2E8F0',          // Slate-200
  borderLight: '#F1F5F9',     // Slate-100
  borderFocus: '#0284C7',

  // Status & Feedback Colors
  success: '#16A34A',         // Emerald-600
  successBg: '#F0FDF4',       // Emerald-50
  successBorder: '#BBF7D0',   // Emerald-200

  warning: '#D97706',         // Amber-600
  warningBg: '#FFFBEB',       // Amber-50
  warningBorder: '#FDE68A',   // Amber-200

  danger: '#DC2626',          // Rose-600
  dangerBg: '#FEF2F2',        // Rose-50
  dangerBorder: '#FECACA',    // Rose-200

  info: '#0284C7',            // Sky-600
  infoBg: '#F0F9FF',          // Sky-50
  infoBorder: '#BAE6FD',      // Sky-200

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
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
};
