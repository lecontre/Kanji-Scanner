import { StyleSheet } from 'react-native';
import { DefaultTheme } from 'react-native-paper';

// Use the default React Native Paper theme without customization
export const paperTheme = {
  ...DefaultTheme,
};

// Export lowercase colors for React Native Paper compatibility with Hermes
export const colors = {
  ...DefaultTheme.colors,
  // Additional colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#CCCCCC',
  lightGray: '#F0F0F0',
  lightText: '#7D7D7D',
  n5Color: '#4CC9F0',
  n4Color: '#4361EE', 
  n3Color: '#3A0CA3',
  n2Color: '#7209B7', 
  n1Color: '#F72585',
};

// Basic colors for backward compatibility
export const COLORS = {
  primary: DefaultTheme.colors.primary,
  secondary: DefaultTheme.colors.secondary,
  background: DefaultTheme.colors.background,
  surface: DefaultTheme.colors.surface,
  error: DefaultTheme.colors.error,
  text: DefaultTheme.colors.onSurface,
  white: '#FFFFFF',
  black: '#000000',
  gray: '#CCCCCC',
  lightGray: '#F0F0F0',
  transparent: 'transparent',
  
  // JLPT level colors - using standard colors
  n5Color: '#4CC9F0',
  n4Color: '#4361EE', 
  n3Color: '#3A0CA3',
  n2Color: '#7209B7', 
  n1Color: '#F72585',
  
  // Additional colors for backward compatibility
  lightText: '#7D7D7D',
  success: '#4CD964',
  warning: '#FF9500',
  info: '#5AC8FA',
  darkBackground: '#121212',
  
  // Material Design specific colors
  primaryContainer: DefaultTheme.colors.primaryContainer,
  secondaryContainer: DefaultTheme.colors.secondaryContainer,
  onPrimary: DefaultTheme.colors.onPrimary,
  onSecondary: DefaultTheme.colors.onSecondary,
  onBackground: DefaultTheme.colors.onBackground,
  onSurface: DefaultTheme.colors.onSurface,
  onError: DefaultTheme.colors.onError
};


// Minimal spacing values
export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

// Minimal radius values
export const RADIUS = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  circle: 9999,
};

// Minimal shadows
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Basic typography sizes
export const FONT_SIZES = {
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 18,
  xxlarge: 24,
  kanji: 72,
};

// Font families
export const FONTS = {
  regular: 'System',
  medium: 'System-Medium',
  light: 'System-Light',
  thin: 'System-Thin',
  bold: 'System-Bold',
  semiBold: 'System-SemiBold',
};

// Typography styles combining sizes and families
export const TYPOGRAPHY = {
  header: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxlarge,
  },
  subheader: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.xlarge,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.large,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.medium,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.medium,
  },
  caption: {
    fontFamily: FONTS.light,
    fontSize: FONT_SIZES.small,
  },
  kanji: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.kanji,
  },
};

// For backward compatibility
export const SIZES = FONT_SIZES;

// Export lowercase variants for Hermes compatibility
export const spacing = SPACING;
export const radius = RADIUS;
export const shadows = SHADOWS;
export const fonts = FONTS;
export const typography = TYPOGRAPHY;
export const fontSizes = FONT_SIZES;

// Backward compatibility constants for components that haven't been updated yet
export const RADIUS_XS = RADIUS.xs;
export const RADIUS_S = RADIUS.s;
export const RADIUS_M = RADIUS.m;
export const RADIUS_L = RADIUS.l;
export const RADIUS_XL = RADIUS.xl;
export const RADIUS_XXL = RADIUS.xxl;
export const RADIUS_CIRCLE = RADIUS.circle;

export const SPACING_XS = SPACING.xs;
export const SPACING_S = SPACING.s;
export const SPACING_M = SPACING.m;
export const SPACING_L = SPACING.l;
export const SPACING_XL = SPACING.xl;
export const SPACING_XXL = SPACING.xxl;

export const SHADOW_SMALL = SHADOWS.small;
export const SHADOW_MEDIUM = SHADOWS.medium;
export const SHADOW_LARGE = SHADOWS.large;

// Backward compatibility functions for components that haven't been updated yet
export function getRadiusValue(size) {
  return RADIUS[size];
}

export function getSpacingValue(size) {
  return SPACING[size];
}

export function getShadowStyle(size) {
  return SHADOWS[size];
}

// Minimal set of common styles
export const COMMON_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DefaultTheme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: DefaultTheme.colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
