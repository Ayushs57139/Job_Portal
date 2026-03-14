// Enhanced Responsive utility functions for React Native Web
// Supports all device sizes: phones, tablets, laptops, desktops, and large screens
import { Dimensions, PixelRatio } from 'react-native';
import { useState, useEffect, useCallback } from 'react';

// Safely get Platform - lazy evaluation to avoid runtime errors
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {
    // Platform not ready
  }
  return { OS: 'android' };
};

// Get window dimensions
const getWindowDimensions = () => {
  return Dimensions.get('window');
};

// Enhanced Breakpoints for all device sizes
export const breakpoints = {
  // Extra small phones (iPhone SE, small Android)
  xsPhone: 320,
  // Small phones (iPhone 8, most Android phones)
  smallPhone: 375,
  // Regular phones (iPhone 12/13/14, larger Android)
  phone: 414,
  // Large phones / phablets (iPhone Plus, Max models)
  largePhone: 480,
  // Small tablets (iPad Mini, small Android tablets)
  smallTablet: 600,
  // Regular tablets (iPad, Android tablets)
  tablet: 768,
  // Large tablets (iPad Pro 11")
  largeTablet: 834,
  // Small laptops (iPad Pro 12.9", small laptops)
  smallLaptop: 1024,
  // Regular laptops
  laptop: 1200,
  // Desktop monitors
  desktop: 1440,
  // Large desktops / wide screens
  largeDesktop: 1920,
  // Ultra wide screens
  ultraWide: 2560,
};

// Check if current platform is web - lazy evaluation
export const isWeb = () => {
  try {
    return getPlatform().OS === 'web';
  } catch (e) {
    return false;
  }
};

// Base dimensions for scaling (iPhone 12/13/14 as reference)
const baseWidth = 390;
const baseHeight = 844;

// Get scale factor based on screen width - Optimized for all devices
export const getScaleFactor = (width) => {
  if (width <= breakpoints.xsPhone) return 0.8;
  if (width <= breakpoints.smallPhone) return 0.85;
  if (width <= breakpoints.phone) return 0.9;
  if (width <= breakpoints.largePhone) return 0.95;
  if (width <= breakpoints.smallTablet) return 1.0;
  if (width <= breakpoints.tablet) return 1.05;
  if (width <= breakpoints.largeTablet) return 1.1;
  if (width <= breakpoints.smallLaptop) return 1.15;
  if (width <= breakpoints.laptop) return 1.2;
  if (width <= breakpoints.desktop) return 1.25;
  if (width <= breakpoints.largeDesktop) return 1.3;
  if (width <= breakpoints.ultraWide) return 1.35;
  return 1.4;
};

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
  const scaleFactor = getScaleFactor(width);
  const pixelRatio = PixelRatio.get();
  
  // Device type detection
  const isXsPhone = width <= breakpoints.xsPhone;
  const isSmallPhone = width > breakpoints.xsPhone && width <= breakpoints.smallPhone;
  const isPhone = width > breakpoints.smallPhone && width <= breakpoints.phone;
  const isLargePhone = width > breakpoints.phone && width <= breakpoints.largePhone;
  const isSmallTablet = width > breakpoints.largePhone && width <= breakpoints.smallTablet;
  const isTablet = width > breakpoints.smallTablet && width <= breakpoints.tablet;
  const isLargeTablet = width > breakpoints.tablet && width <= breakpoints.largeTablet;
  const isSmallLaptop = width > breakpoints.largeTablet && width <= breakpoints.smallLaptop;
  const isLaptop = width > breakpoints.smallLaptop && width <= breakpoints.laptop;
  const isDesktop = width > breakpoints.laptop && width <= breakpoints.desktop;
  const isLargeDesktop = width > breakpoints.desktop && width <= breakpoints.largeDesktop;
  const isUltraWide = width > breakpoints.largeDesktop;
  
  // Simplified device categories
  const isMobile = width <= breakpoints.largePhone; // All phones
  const isTabletDevice = width > breakpoints.largePhone && width <= breakpoints.largeTablet;
  const isLaptopDevice = width > breakpoints.largeTablet && width <= breakpoints.laptop;
  const isDesktopDevice = width > breakpoints.laptop;
  const isWideScreen = width > breakpoints.desktop;
  
  // Orientation
  const isPortrait = height > width;
  const isLandscape = width > height;
  
  // For web, also check if it's mobile viewport
  const web = isWeb();
  const isMobileWeb = web && isMobile;
  const isTabletWeb = web && isTabletDevice;
  const isDesktopWeb = web && isDesktopDevice;
  
  // Dynamic scaling functions
  const scale = useCallback((size) => {
    return Math.round(size * scaleFactor);
  }, [scaleFactor]);
  
  const moderateScale = useCallback((size, factor = 0.5) => {
    return Math.round(size + (scaleFactor - 1) * size * factor);
  }, [scaleFactor]);
  
  const verticalScale = useCallback((size) => {
    return Math.round(size * (height / baseHeight));
  }, [height]);
  
  const horizontalScale = useCallback((size) => {
    return Math.round(size * (width / baseWidth));
  }, [width]);
  
  // Font scaling
  const fontScale = useCallback((size) => {
    const newSize = size * scaleFactor;
    if (web) {
      return Math.round(newSize);
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }, [scaleFactor, web]);
  
  // Spacing scaling
  const spacingScale = useCallback((size) => {
    return Math.round(size * scaleFactor);
  }, [scaleFactor]);
  
  // Get number of columns for grid layouts
  const getColumns = useCallback((minColumnWidth = 300) => {
    const cols = Math.floor(width / minColumnWidth);
    return Math.max(1, Math.min(cols, 6)); // Between 1 and 6 columns
  }, [width]);
  
  // Get container max width based on screen size - Modern responsive containers
  const getContainerMaxWidth = useCallback(() => {
    if (width <= breakpoints.largePhone) return '100%';
    if (width <= breakpoints.tablet) return '100%';
    if (width <= breakpoints.smallLaptop) return 960;
    if (width <= breakpoints.laptop) return 1140;
    if (width <= breakpoints.desktop) return 1320;
    if (width <= breakpoints.largeDesktop) return 1400;
    if (width <= breakpoints.ultraWide) return 1600;
    return 1800;
  }, [width]);
  
  // Get padding based on screen size - Modern minimal spacing
  const getHorizontalPadding = useCallback(() => {
    if (width <= breakpoints.xsPhone) return 12;
    if (width <= breakpoints.smallPhone) return 16;
    if (width <= breakpoints.phone) return 20;
    if (width <= breakpoints.largePhone) return 24;
    if (width <= breakpoints.smallTablet) return 28;
    if (width <= breakpoints.tablet) return 32;
    if (width <= breakpoints.largeTablet) return 40;
    if (width <= breakpoints.smallLaptop) return 48;
    if (width <= breakpoints.laptop) return 56;
    if (width <= breakpoints.desktop) return 64;
    if (width <= breakpoints.largeDesktop) return 80;
    return 96;
  }, [width]);
  
  return {
    // Dimensions
    width,
    height,
    pixelRatio,
    scaleFactor,
    
    // Detailed device detection
    isXsPhone,
    isSmallPhone,
    isPhone,
    isLargePhone,
    isSmallTablet,
    isTablet,
    isLargeTablet,
    isSmallLaptop,
    isLaptop,
    isDesktop,
    isLargeDesktop,
    isUltraWide,
    
    // Simplified categories
    isMobile,
    isTabletDevice,
    isLaptopDevice,
    isDesktopDevice,
    isWideScreen,
    
    // Orientation
    isPortrait,
    isLandscape,
    
    // Web specific
    isMobileWeb,
    isTabletWeb,
    isDesktopWeb,
    
    // Scaling functions
    scale,
    moderateScale,
    verticalScale,
    horizontalScale,
    fontScale,
    spacingScale,
    
    // Layout helpers
    getColumns,
    getContainerMaxWidth,
    getHorizontalPadding,
  };
};

// Get responsive style values (static version for StyleSheet)
export const getResponsiveValue = (mobile, tablet, desktop, largeDesktop) => {
  const { width } = getWindowDimensions();
  
  if (width <= breakpoints.largePhone) {
    return mobile;
  } else if (width <= breakpoints.largeTablet) {
    return tablet !== undefined ? tablet : mobile;
  } else if (width <= breakpoints.laptop) {
    return desktop !== undefined ? desktop : tablet !== undefined ? tablet : mobile;
  } else {
    return largeDesktop !== undefined ? largeDesktop : desktop !== undefined ? desktop : tablet !== undefined ? tablet : mobile;
  }
};

// Get responsive font size
export const getResponsiveFontSize = (baseSize) => {
  const { width } = getWindowDimensions();
  const scaleFactor = getScaleFactor(width);
  return Math.round(baseSize * scaleFactor);
};

// Get responsive padding
export const getResponsivePadding = (basePadding) => {
  const { width } = getWindowDimensions();
  const scaleFactor = getScaleFactor(width);
  return Math.round(basePadding * scaleFactor);
};

// Get responsive margin
export const getResponsiveMargin = (baseMargin) => {
  const { width } = getWindowDimensions();
  const scaleFactor = getScaleFactor(width);
  return Math.round(baseMargin * scaleFactor);
};

// Get responsive width percentage
export const getResponsiveWidth = (mobilePercent, tabletPercent, desktopPercent, largeDesktopPercent) => {
  const { width } = getWindowDimensions();
  
  if (width <= breakpoints.largePhone) {
    return `${mobilePercent}%`;
  } else if (width <= breakpoints.largeTablet) {
    return `${tabletPercent !== undefined ? tabletPercent : mobilePercent}%`;
  } else if (width <= breakpoints.laptop) {
    return `${desktopPercent !== undefined ? desktopPercent : tabletPercent !== undefined ? tabletPercent : mobilePercent}%`;
  } else {
    return `${largeDesktopPercent !== undefined ? largeDesktopPercent : desktopPercent !== undefined ? desktopPercent : tabletPercent !== undefined ? tabletPercent : mobilePercent}%`;
  }
};

// Get card width for grid layouts
export const getCardWidth = (containerWidth, minCardWidth = 280, gap = 16) => {
  const { width } = getWindowDimensions();
  const effectiveContainerWidth = containerWidth || width;
  
  // Calculate number of cards that can fit
  let numCards;
  if (effectiveContainerWidth <= breakpoints.largePhone) {
    numCards = 1;
  } else if (effectiveContainerWidth <= breakpoints.tablet) {
    numCards = 2;
  } else if (effectiveContainerWidth <= breakpoints.laptop) {
    numCards = 3;
  } else {
    numCards = 4;
  }
  
  // Calculate card width accounting for gaps
  const totalGaps = (numCards - 1) * gap;
  const cardWidth = (effectiveContainerWidth - totalGaps) / numCards;
  
  return Math.max(minCardWidth, cardWidth);
};

// Export window dimensions helper
export const getWindowWidth = () => getWindowDimensions().width;
export const getWindowHeight = () => getWindowDimensions().height;

// Get device type string for debugging/analytics
export const getDeviceType = () => {
  const { width } = getWindowDimensions();
  
  if (width <= breakpoints.largePhone) return 'phone';
  if (width <= breakpoints.largeTablet) return 'tablet';
  if (width <= breakpoints.laptop) return 'laptop';
  if (width <= breakpoints.desktop) return 'desktop';
  return 'large-desktop';
};

// Helper to create responsive styles object
export const createResponsiveStyles = (phoneStyles, tabletStyles, desktopStyles, largeDesktopStyles) => {
  const { width } = getWindowDimensions();
  
  if (width <= breakpoints.largePhone) {
    return { ...phoneStyles };
  } else if (width <= breakpoints.largeTablet) {
    return { ...phoneStyles, ...tabletStyles };
  } else if (width <= breakpoints.laptop) {
    return { ...phoneStyles, ...tabletStyles, ...desktopStyles };
  } else {
    return { ...phoneStyles, ...tabletStyles, ...desktopStyles, ...largeDesktopStyles };
  }
};
