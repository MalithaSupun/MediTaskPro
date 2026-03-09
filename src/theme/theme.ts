import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import type { ColorSchemeName } from 'react-native';

export interface AppTheme {
  isDark: boolean;
  colors: {
    background: string;
    card: string;
    cardSecondary: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    primary: string;
    primaryMuted: string;
    danger: string;
    success: string;
    warning: string;
    shadow: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
}

const lightTheme: AppTheme = {
  isDark: false,
  colors: {
    background: '#F4F8FB',
    card: '#FFFFFF',
    cardSecondary: '#EEF3F8',
    textPrimary: '#13293D',
    textSecondary: '#49637D',
    border: '#D3DEE9',
    primary: '#0B7A75',
    primaryMuted: '#D7F1EF',
    danger: '#B42318',
    success: '#147A4B',
    warning: '#B75D00',
    shadow: 'rgba(6, 24, 44, 0.12)',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    pill: 999,
  },
};

const darkTheme: AppTheme = {
  isDark: true,
  colors: {
    background: '#0D1A26',
    card: '#102233',
    cardSecondary: '#163045',
    textPrimary: '#EAF2FA',
    textSecondary: '#A9C0D5',
    border: '#26435B',
    primary: '#44C2BB',
    primaryMuted: '#143D47',
    danger: '#F97066',
    success: '#4ADE80',
    warning: '#FDBA74',
    shadow: 'rgba(2, 8, 20, 0.5)',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    pill: 999,
  },
};

export function getAppTheme(colorScheme: ColorSchemeName): AppTheme {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

export function getNavigationTheme(appTheme: AppTheme): NavigationTheme {
  const baseTheme = appTheme.isDark ? NavigationDarkTheme : NavigationDefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: appTheme.colors.primary,
      background: appTheme.colors.background,
      card: appTheme.colors.card,
      text: appTheme.colors.textPrimary,
      border: appTheme.colors.border,
      notification: appTheme.colors.warning,
    },
  };
}
