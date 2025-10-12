/**
 * Theme System
 * Single theme configuration using design tokens for your dark-themed application
 */

import { designTokens } from './tokens';

export interface Theme {
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: typeof designTokens.spacing;
  typography: typeof designTokens.typography;
  borderRadius: typeof designTokens.borderRadius;
  shadow: typeof designTokens.shadow;
  zIndex: typeof designTokens.zIndex;
  transition: typeof designTokens.transition;
  breakpoints: typeof designTokens.breakpoints;
}

/**
 * Main application theme (dark-themed)
 */
export const theme: Theme = {
  colors: {
    primary: designTokens.colors.primary[400],
    primaryHover: designTokens.colors.primary[500],
    secondary: designTokens.colors.secondary[400],
    secondaryHover: designTokens.colors.secondary[500],
    background: {
      primary: designTokens.colors.background.dark,
      secondary: designTokens.colors.background.darker,
      tertiary: designTokens.colors.neutral[900],
    },
    text: {
      primary: designTokens.colors.neutral[50],
      secondary: designTokens.colors.neutral[300],
      tertiary: designTokens.colors.neutral[400],
      inverse: designTokens.colors.text.primary,
    },
    border: designTokens.colors.neutral[700],
    error: designTokens.colors.error.light,
    success: designTokens.colors.success.light,
    warning: designTokens.colors.warning.light,
    info: designTokens.colors.info.light,
  },
  spacing: designTokens.spacing,
  typography: designTokens.typography,
  borderRadius: designTokens.borderRadius,
  shadow: designTokens.shadow,
  zIndex: designTokens.zIndex,
  transition: designTokens.transition,
  breakpoints: designTokens.breakpoints,
};

export default theme;
