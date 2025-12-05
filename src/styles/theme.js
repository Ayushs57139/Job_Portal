// Enhanced Theme configuration for the app with universal responsiveness
import { Dimensions, PixelRatio } from 'react-native';

// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';

// Get current window dimensions
const getWindowDimensions = () => {
  return Dimensions.get('window');
};

// Breakpoints matching responsive.js
const breakpoints = {
  xsPhone: 320,
  smallPhone: 375,
  phone: 414,
  largePhone: 480,
  smallTablet: 600,
  tablet: 768,
  largeTablet: 834,
  smallLaptop: 1024,
  laptop: 1200,
  desktop: 1440,
  largeDesktop: 1920,
};

// Get scale factor based on screen width
const getScaleFactor = () => {
  const { width } = getWindowDimensions();
  if (width <= breakpoints.xsPhone) return 0.85;
  if (width <= breakpoints.smallPhone) return 0.9;
  if (width <= breakpoints.phone) return 0.95;
  if (width <= breakpoints.largePhone) return 1;
  if (width <= breakpoints.smallTablet) return 1.05;
  if (width <= breakpoints.tablet) return 1.1;
  if (width <= breakpoints.largeTablet) return 1.15;
  if (width <= breakpoints.smallLaptop) return 1.2;
  if (width <= breakpoints.laptop) return 1.25;
  if (width <= breakpoints.desktop) return 1.3;
  if (width <= breakpoints.largeDesktop) return 1.35;
  return 1.4;
};

// Helper to scale fonts
const scaleFontSize = (baseSize) => {
  const scaleFactor = getScaleFactor();
  const newSize = baseSize * scaleFactor;
  if (isWeb) {
    return Math.round(newSize);
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Color Palette
export const colors = {
  // Primary Colors
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#DBEAFE',
  primaryHover: '#1D4ED8',
  
  // Secondary Colors
  secondary: '#FF6B35',
  secondaryDark: '#E55A28',
  secondaryLight: '#FFE8E0',
  
  // Accent Colors
  accent: '#1E88E5',
  accentLight: '#E3F2FD',
  
  // Backgrounds
  background: '#F9FAFB',
  backgroundSecondary: '#F3F4F6',
  cardBackground: '#ffffff',
  white: '#ffffff',
  
  // Text Colors
  text: '#2D3748',
  textDark: '#1A202C',
  textSecondary: '#718096',
  textLight: '#A0AEC0',
  textMuted: '#CBD5E0',
  textWhite: '#ffffff',
  
  // UI Elements
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E0',
  divider: '#E5E7EB',
  
  // Status Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  
  // Gradients
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  gradientPrimary: ['#2563EB', '#3B82F6'],
  gradientSecondary: ['#FF6B35', '#FF8F65'],
  gradientSuccess: ['#10B981', '#34D399'],
};

// Dynamic Spacing based on screen size
export const getSpacing = () => {
  const { width } = getWindowDimensions();
  
  // Base spacing values that scale with screen size
  let baseMultiplier = 1;
  
  if (width <= breakpoints.xsPhone) {
    baseMultiplier = 0.75;
  } else if (width <= breakpoints.smallPhone) {
    baseMultiplier = 0.85;
  } else if (width <= breakpoints.largePhone) {
    baseMultiplier = 1;
  } else if (width <= breakpoints.tablet) {
    baseMultiplier = 1.1;
  } else if (width <= breakpoints.laptop) {
    baseMultiplier = 1.2;
  } else {
    baseMultiplier = 1.3;
  }
  
  return {
    xs: Math.round(4 * baseMultiplier),
    sm: Math.round(8 * baseMultiplier),
    md: Math.round(16 * baseMultiplier),
    lg: Math.round(24 * baseMultiplier),
    xl: Math.round(32 * baseMultiplier),
    xxl: Math.round(48 * baseMultiplier),
    xxxl: Math.round(64 * baseMultiplier),
  };
};

// Static spacing for backward compatibility
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Dynamic Typography that scales with screen size
export const getTypography = () => {
  const { width } = getWindowDimensions();
  
  // Base font sizes that scale with screen size
  let fontMultiplier = 1;
  
  if (width <= breakpoints.xsPhone) {
    fontMultiplier = 0.8;
  } else if (width <= breakpoints.smallPhone) {
    fontMultiplier = 0.85;
  } else if (width <= breakpoints.largePhone) {
    fontMultiplier = 0.95;
  } else if (width <= breakpoints.tablet) {
    fontMultiplier = 1;
  } else if (width <= breakpoints.laptop) {
    fontMultiplier = 1.1;
  } else {
    fontMultiplier = 1.15;
  }
  
  return {
    h1: {
      fontSize: Math.round(32 * fontMultiplier),
      fontWeight: '700',
      lineHeight: Math.round(40 * fontMultiplier),
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: Math.round(28 * fontMultiplier),
      fontWeight: '700',
      lineHeight: Math.round(36 * fontMultiplier),
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: Math.round(24 * fontMultiplier),
      fontWeight: '600',
      lineHeight: Math.round(32 * fontMultiplier),
    },
    h4: {
      fontSize: Math.round(20 * fontMultiplier),
      fontWeight: '600',
      lineHeight: Math.round(28 * fontMultiplier),
    },
    h5: {
      fontSize: Math.round(18 * fontMultiplier),
      fontWeight: '600',
      lineHeight: Math.round(24 * fontMultiplier),
    },
    h6: {
      fontSize: Math.round(16 * fontMultiplier),
      fontWeight: '600',
      lineHeight: Math.round(22 * fontMultiplier),
    },
    body: {
      fontSize: Math.round(14 * fontMultiplier),
      fontWeight: '400',
      lineHeight: Math.round(20 * fontMultiplier),
    },
    body1: {
      fontSize: Math.round(16 * fontMultiplier),
      fontWeight: '400',
      lineHeight: Math.round(24 * fontMultiplier),
    },
    body2: {
      fontSize: Math.round(14 * fontMultiplier),
      fontWeight: '400',
      lineHeight: Math.round(20 * fontMultiplier),
    },
    caption: {
      fontSize: Math.round(12 * fontMultiplier),
      fontWeight: '400',
      lineHeight: Math.round(16 * fontMultiplier),
    },
    small: {
      fontSize: Math.round(11 * fontMultiplier),
      fontWeight: '400',
      lineHeight: Math.round(14 * fontMultiplier),
    },
    button: {
      fontSize: Math.round(16 * fontMultiplier),
      fontWeight: '600',
      lineHeight: Math.round(24 * fontMultiplier),
    },
    buttonSmall: {
      fontSize: Math.round(14 * fontMultiplier),
      fontWeight: '600',
      lineHeight: Math.round(20 * fontMultiplier),
    },
  };
};

// Static typography for backward compatibility
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  small: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
};

// Dynamic Border Radius
export const getBorderRadius = () => {
  const { width } = getWindowDimensions();
  
  let multiplier = 1;
  if (width <= breakpoints.largePhone) {
    multiplier = 0.9;
  } else if (width > breakpoints.laptop) {
    multiplier = 1.1;
  }
  
  return {
    xs: Math.round(4 * multiplier),
    sm: Math.round(8 * multiplier),
    md: Math.round(12 * multiplier),
    lg: Math.round(16 * multiplier),
    xl: Math.round(20 * multiplier),
    xxl: Math.round(24 * multiplier),
    round: 50,
    full: 999,
  };
};

// Static border radius for backward compatibility
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
  full: 999,
};

// Shadows with platform-specific handling
export const shadows = {
  xs: {
    ...(isWeb ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    }),
  },
  sm: {
    ...(isWeb ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  md: {
    ...(isWeb ? {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
  lg: {
    ...(isWeb ? {
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    }),
  },
  xl: {
    ...(isWeb ? {
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.18)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 12,
    }),
  },
  card: {
    ...(isWeb ? {
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 5,
    }),
  },
  dropdown: {
    ...(isWeb ? {
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 25,
      elevation: 10,
    }),
  },
};

// Helper function to get shadow styles based on platform
export const getShadow = (size = 'md') => {
  return shadows[size] || shadows.md;
};

// Z-index scale for consistent layering
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
  overlay: 700,
  max: 9999,
};

// Animation durations
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Default export with all theme properties
export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  zIndex,
  animation,
  // Dynamic getters
  getSpacing,
  getTypography,
  getBorderRadius,
  getScaleFactor,
};
