// Responsive utility functions for React Native Web
import { Platform, Dimensions } from 'react-native';

// Get window dimensions
const getWindowDimensions = () => {
  return Dimensions.get('window');
};

// Breakpoints
export const breakpoints = {
  mobile: 600,
  tablet: 768,
  desktop: 1024,
  wide: 1200,
};

// Check if current platform is web
export const isWeb = Platform.OS === 'web';

// Get responsive values based on screen width
export const useResponsive = () => {
  const { width } = getWindowDimensions();
  
  return {
    width,
    isMobile: width <= breakpoints.mobile,
    isTablet: width > breakpoints.mobile && width <= breakpoints.tablet,
    isDesktop: width > breakpoints.tablet,
    isWideScreen: width > breakpoints.wide,
    // For web, also check if it's mobile viewport
    isMobileWeb: isWeb && width <= breakpoints.mobile,
    isTabletWeb: isWeb && width > breakpoints.mobile && width <= breakpoints.tablet,
  };
};

// Get responsive style values
export const getResponsiveValue = (mobile, tablet, desktop) => {
  const { width } = getWindowDimensions();
  
  if (width <= breakpoints.mobile) {
    return mobile;
  } else if (width <= breakpoints.tablet) {
    return tablet !== undefined ? tablet : mobile;
  } else {
    return desktop !== undefined ? desktop : tablet !== undefined ? tablet : mobile;
  }
};

// Get responsive font size
export const getResponsiveFontSize = (baseSize) => {
  const { width } = getWindowDimensions();
  
  if (width <= breakpoints.mobile) {
    return baseSize * 0.9;
  } else if (width <= breakpoints.tablet) {
    return baseSize * 0.95;
  }
  return baseSize;
};

// Get responsive padding
export const getResponsivePadding = (basePadding) => {
  const { width } = getWindowDimensions();
  
  if (width <= breakpoints.mobile) {
    return basePadding * 0.75;
  } else if (width <= breakpoints.tablet) {
    return basePadding * 0.875;
  }
  return basePadding;
};

// Export window dimensions helper
export const getWindowWidth = () => getWindowDimensions().width;
export const getWindowHeight = () => getWindowDimensions().height;

