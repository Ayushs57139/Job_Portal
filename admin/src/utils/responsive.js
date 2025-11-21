// Responsive utility functions for React Native Web
import { Platform, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';

// Get window dimensions
const getWindowDimensions = () => {
  return Dimensions.get('window');
};

// Breakpoints
export const breakpoints = {
  mobile: 768,      // Mobile: < 768px
  tablet: 1024,     // Tablet: 768px - 1024px
  desktop: 1024,    // Desktop: > 1024px
  wide: 1440,       // Wide screen: > 1440px
};

// Check if current platform is web
export const isWeb = Platform.OS === 'web';

// Get responsive values based on screen width with dynamic updates
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(() => getWindowDimensions());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  
  return {
    width,
    height,
    isMobile: width < breakpoints.mobile,           // < 768px
    isTablet: width >= breakpoints.mobile && width < breakpoints.tablet,  // 768px - 1024px
    isDesktop: width >= breakpoints.tablet,         // >= 1024px
    isWideScreen: width >= breakpoints.wide,        // >= 1440px
    // For web, also check if it's mobile viewport
    isMobileWeb: isWeb && width < breakpoints.mobile,
    isTabletWeb: isWeb && width >= breakpoints.mobile && width < breakpoints.tablet,
  };
};

// Get responsive style values (static version for StyleSheet)
export const getResponsiveValue = (mobile, tablet, desktop) => {
  const { width } = getWindowDimensions();
  
  if (width < breakpoints.mobile) {
    return mobile;
  } else if (width < breakpoints.tablet) {
    return tablet !== undefined ? tablet : mobile;
  } else {
    return desktop !== undefined ? desktop : tablet !== undefined ? tablet : mobile;
  }
};

// Get responsive font size
export const getResponsiveFontSize = (baseSize) => {
  const { width } = getWindowDimensions();
  
  if (width < breakpoints.mobile) {
    return baseSize * 0.9;
  } else if (width < breakpoints.tablet) {
    return baseSize * 0.95;
  }
  return baseSize;
};

// Get responsive padding
export const getResponsivePadding = (basePadding) => {
  const { width } = getWindowDimensions();
  
  if (width < breakpoints.mobile) {
    return basePadding * 0.75;
  } else if (width < breakpoints.tablet) {
    return basePadding * 0.875;
  }
  return basePadding;
};

// Get responsive margin
export const getResponsiveMargin = (baseMargin) => {
  const { width } = getWindowDimensions();
  
  if (width < breakpoints.mobile) {
    return baseMargin * 0.75;
  } else if (width < breakpoints.tablet) {
    return baseMargin * 0.875;
  }
  return baseMargin;
};

// Get responsive width percentage
export const getResponsiveWidth = (mobilePercent, tabletPercent, desktopPercent) => {
  const { width } = getWindowDimensions();
  
  if (width < breakpoints.mobile) {
    return `${mobilePercent}%`;
  } else if (width < breakpoints.tablet) {
    return `${tabletPercent !== undefined ? tabletPercent : mobilePercent}%`;
  } else {
    return `${desktopPercent !== undefined ? desktopPercent : tabletPercent !== undefined ? tabletPercent : mobilePercent}%`;
  }
};

// Export window dimensions helper
export const getWindowWidth = () => getWindowDimensions().width;
export const getWindowHeight = () => getWindowDimensions().height;

