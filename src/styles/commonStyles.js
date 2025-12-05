// Enhanced Common styles used across the app with universal responsiveness
import { StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from './theme';

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

// Breakpoints for responsive design
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

// Get current window dimensions
const getWindowDimensions = () => Dimensions.get('window');
const { width: screenWidth, height: screenHeight } = getWindowDimensions();

const isWeb = getPlatform().OS === 'web';

// Device type detection
const isXsPhone = screenWidth <= breakpoints.xsPhone;
const isSmallPhone = screenWidth > breakpoints.xsPhone && screenWidth <= breakpoints.smallPhone;
const isPhone = screenWidth > breakpoints.smallPhone && screenWidth <= breakpoints.phone;
const isLargePhone = screenWidth > breakpoints.phone && screenWidth <= breakpoints.largePhone;
const isMobile = screenWidth <= breakpoints.largePhone;
const isSmallTablet = screenWidth > breakpoints.largePhone && screenWidth <= breakpoints.smallTablet;
const isTablet = screenWidth > breakpoints.smallTablet && screenWidth <= breakpoints.tablet;
const isLargeTablet = screenWidth > breakpoints.tablet && screenWidth <= breakpoints.largeTablet;
const isTabletDevice = screenWidth > breakpoints.largePhone && screenWidth <= breakpoints.largeTablet;
const isSmallLaptop = screenWidth > breakpoints.largeTablet && screenWidth <= breakpoints.smallLaptop;
const isLaptop = screenWidth > breakpoints.smallLaptop && screenWidth <= breakpoints.laptop;
const isDesktop = screenWidth > breakpoints.laptop && screenWidth <= breakpoints.desktop;
const isLargeDesktop = screenWidth > breakpoints.desktop;
const isDesktopDevice = screenWidth > breakpoints.largeTablet;

// Get scale factor for responsive sizing
const getScaleFactor = () => {
  if (screenWidth <= breakpoints.xsPhone) return 0.8;
  if (screenWidth <= breakpoints.smallPhone) return 0.85;
  if (screenWidth <= breakpoints.phone) return 0.9;
  if (screenWidth <= breakpoints.largePhone) return 1;
  if (screenWidth <= breakpoints.smallTablet) return 1.05;
  if (screenWidth <= breakpoints.tablet) return 1.1;
  if (screenWidth <= breakpoints.largeTablet) return 1.15;
  if (screenWidth <= breakpoints.smallLaptop) return 1.2;
  if (screenWidth <= breakpoints.laptop) return 1.25;
  if (screenWidth <= breakpoints.desktop) return 1.3;
  return 1.35;
};

const scaleFactor = getScaleFactor();

// Helper functions for responsive values
const rs = (size) => Math.round(size * scaleFactor); // responsive size
const rf = (size) => {
  const newSize = size * scaleFactor;
  return isWeb ? Math.round(newSize) : Math.round(PixelRatio.roundToNearestPixel(newSize));
}; // responsive font

// Get responsive padding
const getResponsivePadding = () => {
  if (isXsPhone) return spacing.xs;
  if (isSmallPhone || isPhone) return spacing.sm;
  if (isLargePhone) return spacing.md;
  if (isSmallTablet || isTablet) return spacing.lg;
  if (isLargeTablet || isSmallLaptop) return spacing.xl;
  return spacing.xxl;
};

// Get container max width
const getContainerMaxWidth = () => {
  if (isMobile) return '100%';
  if (isTabletDevice) return '100%';
  if (isSmallLaptop) return 960;
  if (isLaptop) return 1140;
  if (isDesktop) return 1320;
  return 1400;
};

// Get horizontal padding
const getHorizontalPadding = () => {
  if (isXsPhone) return 8;
  if (isSmallPhone) return 12;
  if (isPhone || isLargePhone) return 16;
  if (isSmallTablet) return 20;
  if (isTablet) return 24;
  if (isLargeTablet) return 32;
  if (isSmallLaptop) return 40;
  if (isLaptop) return 48;
  return 64;
};

export const commonStyles = StyleSheet.create({
  // ==========================================
  // CONTAINERS
  // ==========================================
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...(isWeb && {
      width: '100%',
      height: '100%',
      minHeight: '100vh',
    }),
  },
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: rs(spacing.xxl),
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: getHorizontalPadding(),
    maxWidth: getContainerMaxWidth(),
    alignSelf: 'center',
    width: '100%',
  },
  pageContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: getHorizontalPadding(),
  },
  
  // ==========================================
  // CARDS
  // ==========================================
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: isMobile ? rs(spacing.sm) : isTabletDevice ? rs(spacing.md) : rs(spacing.lg),
    marginBottom: rs(spacing.md),
    ...shadows.card,
    ...(isWeb && {
      width: '100%',
    }),
  },
  cardElevated: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: isMobile ? rs(spacing.md) : isTabletDevice ? rs(spacing.lg) : rs(spacing.xl),
    marginBottom: rs(spacing.md),
    ...shadows.lg,
    ...(isWeb && {
      width: '100%',
    }),
  },
  cardCompact: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.sm,
    padding: isMobile ? rs(spacing.xs) : rs(spacing.sm),
    marginBottom: rs(spacing.sm),
    ...shadows.sm,
  },
  cardFlat: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: isMobile ? rs(spacing.sm) : rs(spacing.md),
    marginBottom: rs(spacing.md),
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // ==========================================
  // INPUTS
  // ==========================================
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: isMobile ? rs(spacing.sm) : rs(spacing.md),
    fontSize: rf(16),
    color: colors.text,
    minHeight: isMobile ? 44 : 48,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  inputDisabled: {
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.7,
  },
  inputLabel: {
    ...typography.body2,
    fontSize: rf(14),
    fontWeight: '600',
    color: colors.text,
    marginBottom: rs(spacing.xs),
  },
  inputHelper: {
    ...typography.caption,
    fontSize: rf(12),
    color: colors.textSecondary,
    marginTop: rs(spacing.xs),
  },
  inputErrorText: {
    ...typography.caption,
    fontSize: rf(12),
    color: colors.error,
    marginTop: rs(spacing.xs),
  },
  
  // ==========================================
  // BUTTONS
  // ==========================================
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: isMobile ? rs(spacing.sm) : rs(spacing.md),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isMobile ? 44 : 48,
    ...shadows.sm,
  },
  buttonText: {
    ...typography.button,
    fontSize: rf(16),
    color: colors.textWhite,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonSecondaryText: {
    ...typography.button,
    fontSize: rf(16),
    color: colors.primary,
    fontWeight: '600',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonOutlineText: {
    ...typography.button,
    fontSize: rf(16),
    color: colors.text,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonSmall: {
    padding: isMobile ? rs(spacing.xs) : rs(spacing.sm),
    minHeight: isMobile ? 36 : 40,
  },
  buttonSmallText: {
    ...typography.buttonSmall,
    fontSize: rf(14),
  },
  buttonLarge: {
    padding: isMobile ? rs(spacing.md) : rs(spacing.lg),
    minHeight: isMobile ? 52 : 56,
  },
  buttonLargeText: {
    fontSize: rf(18),
    fontWeight: '600',
  },
  buttonIcon: {
    flexDirection: 'row',
    gap: rs(spacing.sm),
  },
  
  // ==========================================
  // TYPOGRAPHY
  // ==========================================
  heading1: {
    ...typography.h1,
    fontSize: rf(isXsPhone ? 24 : isSmallPhone ? 26 : isMobile ? 28 : isTabletDevice ? 32 : 36),
    color: colors.text,
    lineHeight: rf(isXsPhone ? 32 : isSmallPhone ? 34 : isMobile ? 36 : isTabletDevice ? 40 : 44),
  },
  heading2: {
    ...typography.h2,
    fontSize: rf(isXsPhone ? 20 : isSmallPhone ? 22 : isMobile ? 24 : isTabletDevice ? 28 : 32),
    color: colors.text,
    lineHeight: rf(isXsPhone ? 28 : isSmallPhone ? 30 : isMobile ? 32 : isTabletDevice ? 36 : 40),
  },
  heading3: {
    ...typography.h3,
    fontSize: rf(isXsPhone ? 18 : isSmallPhone ? 19 : isMobile ? 20 : isTabletDevice ? 24 : 28),
    color: colors.text,
    lineHeight: rf(isXsPhone ? 24 : isSmallPhone ? 26 : isMobile ? 28 : isTabletDevice ? 32 : 36),
  },
  heading4: {
    ...typography.h4,
    fontSize: rf(isXsPhone ? 16 : isSmallPhone ? 17 : isMobile ? 18 : isTabletDevice ? 20 : 24),
    color: colors.text,
    lineHeight: rf(isXsPhone ? 22 : isSmallPhone ? 24 : isMobile ? 26 : isTabletDevice ? 28 : 32),
  },
  heading5: {
    ...typography.h5,
    fontSize: rf(isXsPhone ? 14 : isSmallPhone ? 15 : isMobile ? 16 : isTabletDevice ? 18 : 20),
    color: colors.text,
    lineHeight: rf(isXsPhone ? 20 : isSmallPhone ? 22 : isMobile ? 24 : isTabletDevice ? 26 : 28),
  },
  heading6: {
    ...typography.h6,
    fontSize: rf(isXsPhone ? 13 : isSmallPhone ? 14 : isMobile ? 15 : isTabletDevice ? 16 : 18),
    color: colors.text,
    lineHeight: rf(isXsPhone ? 18 : isSmallPhone ? 20 : isMobile ? 22 : isTabletDevice ? 24 : 26),
  },
  bodyText: {
    ...typography.body1,
    fontSize: rf(isXsPhone ? 14 : isMobile ? 15 : 16),
    color: colors.text,
    lineHeight: rf(isXsPhone ? 20 : isMobile ? 22 : 24),
  },
  bodyTextSecondary: {
    ...typography.body2,
    fontSize: rf(isXsPhone ? 13 : isMobile ? 14 : 15),
    color: colors.textSecondary,
    lineHeight: rf(isXsPhone ? 18 : isMobile ? 20 : 22),
  },
  caption: {
    ...typography.caption,
    fontSize: rf(isXsPhone ? 10 : isMobile ? 11 : 12),
    color: colors.textLight,
    lineHeight: rf(isXsPhone ? 14 : isMobile ? 16 : 18),
  },
  smallText: {
    ...typography.small,
    fontSize: rf(isXsPhone ? 9 : isMobile ? 10 : 11),
    color: colors.textLight,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
  
  // ==========================================
  // LAYOUT - FLEXBOX
  // ==========================================
  row: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'center',
    gap: isMobile ? rs(spacing.sm) : rs(spacing.md),
  },
  rowAlways: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
  },
  rowBetween: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'center',
    justifyContent: isMobile ? 'flex-start' : 'space-between',
    gap: isMobile ? rs(spacing.sm) : rs(spacing.md),
  },
  rowBetweenAlways: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(spacing.sm),
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(spacing.sm),
  },
  column: {
    flexDirection: 'column',
    gap: rs(spacing.sm),
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(spacing.sm),
  },
  flex1: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  
  // ==========================================
  // GRID SYSTEM
  // ==========================================
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -rs(spacing.xs),
  },
  gridItem: {
    paddingHorizontal: rs(spacing.xs),
    marginBottom: rs(spacing.md),
  },
  gridItemFull: {
    width: '100%',
    paddingHorizontal: rs(spacing.xs),
    marginBottom: rs(spacing.md),
  },
  gridItemHalf: {
    width: isMobile ? '100%' : '50%',
    paddingHorizontal: rs(spacing.xs),
    marginBottom: rs(spacing.md),
  },
  gridItemThird: {
    width: isMobile ? '100%' : isTabletDevice ? '50%' : '33.333%',
    paddingHorizontal: rs(spacing.xs),
    marginBottom: rs(spacing.md),
  },
  gridItemQuarter: {
    width: isMobile ? '100%' : isTabletDevice ? '50%' : isLaptop ? '33.333%' : '25%',
    paddingHorizontal: rs(spacing.xs),
    marginBottom: rs(spacing.md),
  },
  
  // ==========================================
  // SPACING
  // ==========================================
  marginTopXs: { marginTop: rs(spacing.xs) },
  marginTopSm: { marginTop: rs(spacing.sm) },
  marginTopMd: { marginTop: rs(spacing.md) },
  marginTopLg: { marginTop: rs(spacing.lg) },
  marginTopXl: { marginTop: rs(spacing.xl) },
  marginBottomXs: { marginBottom: rs(spacing.xs) },
  marginBottomSm: { marginBottom: rs(spacing.sm) },
  marginBottomMd: { marginBottom: rs(spacing.md) },
  marginBottomLg: { marginBottom: rs(spacing.lg) },
  marginBottomXl: { marginBottom: rs(spacing.xl) },
  marginHorizontalSm: { marginHorizontal: rs(spacing.sm) },
  marginHorizontalMd: { marginHorizontal: rs(spacing.md) },
  marginHorizontalLg: { marginHorizontal: rs(spacing.lg) },
  marginVerticalSm: { marginVertical: rs(spacing.sm) },
  marginVerticalMd: { marginVertical: rs(spacing.md) },
  marginVerticalLg: { marginVertical: rs(spacing.lg) },
  paddingXs: { padding: rs(spacing.xs) },
  paddingSm: { padding: rs(spacing.sm) },
  paddingMd: { padding: rs(spacing.md) },
  paddingLg: { padding: rs(spacing.lg) },
  paddingXl: { padding: rs(spacing.xl) },
  paddingHorizontalSm: { paddingHorizontal: rs(spacing.sm) },
  paddingHorizontalMd: { paddingHorizontal: rs(spacing.md) },
  paddingHorizontalLg: { paddingHorizontal: rs(spacing.lg) },
  paddingVerticalSm: { paddingVertical: rs(spacing.sm) },
  paddingVerticalMd: { paddingVertical: rs(spacing.md) },
  paddingVerticalLg: { paddingVertical: rs(spacing.lg) },
  
  // ==========================================
  // ALERTS & MESSAGES
  // ==========================================
  alert: {
    padding: rs(spacing.md),
    borderRadius: borderRadius.md,
    marginBottom: rs(spacing.md),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
  },
  alertSuccess: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.success,
  },
  alertError: {
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
  },
  alertWarning: {
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  alertInfo: {
    backgroundColor: colors.infoLight,
    borderWidth: 1,
    borderColor: colors.info,
  },
  alertText: {
    ...typography.body2,
    fontSize: rf(14),
    flex: 1,
  },
  alertSuccessText: {
    color: colors.successDark,
  },
  alertErrorText: {
    color: colors.errorDark,
  },
  alertWarningText: {
    color: colors.warningDark,
  },
  alertInfoText: {
    color: colors.infoDark,
  },
  
  // ==========================================
  // LOADING & EMPTY STATES
  // ==========================================
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(spacing.xl),
  },
  loadingText: {
    ...typography.body2,
    fontSize: rf(14),
    color: colors.textSecondary,
    marginTop: rs(spacing.md),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(spacing.xl),
  },
  emptyStateIcon: {
    marginBottom: rs(spacing.md),
    opacity: 0.5,
  },
  emptyStateText: {
    ...typography.h4,
    fontSize: rf(isMobile ? 18 : 20),
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: rs(spacing.md),
  },
  emptyStateSubtext: {
    ...typography.body2,
    fontSize: rf(isMobile ? 14 : 15),
    color: colors.textLight,
    textAlign: 'center',
    marginTop: rs(spacing.sm),
  },
  
  // ==========================================
  // DIVIDERS & SEPARATORS
  // ==========================================
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: rs(spacing.md),
  },
  dividerLight: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: rs(spacing.sm),
  },
  dividerThick: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: rs(spacing.lg),
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: rs(spacing.md),
  },
  
  // ==========================================
  // BADGES & TAGS
  // ==========================================
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingHorizontal: rs(spacing.sm),
    paddingVertical: rs(spacing.xs),
  },
  badgeText: {
    ...typography.caption,
    fontSize: rf(11),
    color: colors.textWhite,
    fontWeight: '600',
  },
  badgeSecondary: {
    backgroundColor: colors.primaryLight,
  },
  badgeSecondaryText: {
    color: colors.primary,
  },
  badgeSuccess: {
    backgroundColor: colors.successLight,
  },
  badgeSuccessText: {
    color: colors.successDark,
  },
  badgeError: {
    backgroundColor: colors.errorLight,
  },
  badgeErrorText: {
    color: colors.errorDark,
  },
  badgeWarning: {
    backgroundColor: colors.warningLight,
  },
  badgeWarningText: {
    color: colors.warningDark,
  },
  tag: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: rs(spacing.sm),
    paddingVertical: rs(spacing.xs),
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    ...typography.caption,
    fontSize: rf(12),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  
  // ==========================================
  // AVATARS
  // ==========================================
  avatar: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarSmall: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
  },
  avatarLarge: {
    width: rs(56),
    height: rs(56),
    borderRadius: rs(28),
  },
  avatarXLarge: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: rf(16),
  },
  
  // ==========================================
  // ICONS
  // ==========================================
  iconContainer: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(8),
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSmall: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(6),
  },
  iconContainerLarge: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(10),
  },
  
  // ==========================================
  // SECTION HEADERS
  // ==========================================
  sectionHeader: {
    marginBottom: rs(spacing.lg),
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: rf(isMobile ? 20 : isTabletDevice ? 24 : 28),
    color: colors.text,
    fontWeight: '700',
    marginBottom: rs(spacing.xs),
  },
  sectionSubtitle: {
    ...typography.body2,
    fontSize: rf(isMobile ? 14 : 16),
    color: colors.textSecondary,
  },
  
  // ==========================================
  // MODAL & OVERLAY
  // ==========================================
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(spacing.lg),
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    width: isMobile ? '100%' : isTabletDevice ? '80%' : 500,
    maxWidth: 500,
    maxHeight: '90%',
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: rs(spacing.lg),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h5,
    fontSize: rf(isMobile ? 18 : 20),
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: rs(spacing.lg),
  },
  modalFooter: {
    padding: rs(spacing.lg),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: rs(spacing.sm),
  },
  
  // ==========================================
  // LIST ITEMS
  // ==========================================
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rs(spacing.md),
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: rs(spacing.md),
  },
  listItemPressed: {
    backgroundColor: colors.backgroundSecondary,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    ...typography.body1,
    fontSize: rf(15),
    fontWeight: '600',
    color: colors.text,
  },
  listItemSubtitle: {
    ...typography.body2,
    fontSize: rf(13),
    color: colors.textSecondary,
    marginTop: rs(spacing.xs / 2),
  },
  
  // ==========================================
  // FORM GROUPS
  // ==========================================
  formGroup: {
    marginBottom: rs(spacing.md),
  },
  formGroupRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: rs(spacing.md),
    marginBottom: rs(spacing.md),
  },
  formGroupHalf: {
    flex: 1,
  },
  
  // ==========================================
  // SCREEN-SPECIFIC
  // ==========================================
  screenPadding: {
    padding: getHorizontalPadding(),
  },
  screenPaddingHorizontal: {
    paddingHorizontal: getHorizontalPadding(),
  },
  screenPaddingVertical: {
    paddingVertical: rs(spacing.lg),
  },
  
  // ==========================================
  // WEB-SPECIFIC
  // ==========================================
  ...(isWeb && {
    webContainer: {
      maxWidth: getContainerMaxWidth(),
      marginHorizontal: 'auto',
      width: '100%',
    },
    webScrollable: {
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
    },
    webClickable: {
      cursor: 'pointer',
      userSelect: 'none',
    },
    webTransition: {
      transition: 'all 0.2s ease',
    },
  }),
});

// Export helper functions
export const responsiveHelpers = {
  rs, // responsive size
  rf, // responsive font
  getScaleFactor,
  getHorizontalPadding,
  getContainerMaxWidth,
  getResponsivePadding,
  isMobile,
  isTabletDevice,
  isDesktopDevice,
  isWeb,
  breakpoints,
};

export default commonStyles;
