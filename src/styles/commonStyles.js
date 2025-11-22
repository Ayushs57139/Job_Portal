// Common styles used across the app
import { StyleSheet, Dimensions } from 'react-native';
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

const { width } = Dimensions.get('window');
const isWeb = getPlatform().OS === 'web';
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 768;

export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...(isWeb && {
      width: '100%',
      height: '100%',
    }),
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  // Cards
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: isMobile ? spacing.sm : spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
    ...(isWeb && {
      width: '100%',
    }),
  },
  cardElevated: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: isMobile ? spacing.md : spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
    ...(isWeb && {
      width: '100%',
    }),
  },
  
  // Inputs
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  
  // Buttons
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  buttonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonSecondaryText: {
    ...typography.button,
    color: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  
  // Typography
  heading1: {
    ...typography.h1,
    color: colors.text,
    fontSize: isMobile ? 28 : (isTablet ? 30 : typography.h1.fontSize),
  },
  heading2: {
    ...typography.h2,
    color: colors.text,
    fontSize: isMobile ? 24 : (isTablet ? 26 : typography.h2.fontSize),
  },
  heading3: {
    ...typography.h3,
    color: colors.text,
    fontSize: isMobile ? 20 : (isTablet ? 22 : typography.h3.fontSize),
  },
  heading4: {
    ...typography.h4,
    color: colors.text,
    fontSize: isMobile ? 18 : (isTablet ? 19 : typography.h4.fontSize),
  },
  bodyText: {
    ...typography.body1,
    color: colors.text,
  },
  bodyTextSecondary: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  caption: {
    ...typography.caption,
    color: colors.textLight,
  },
  
  // Layout
  row: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'center',
    gap: isMobile ? spacing.sm : 0,
  },
  rowBetween: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'center',
    justifyContent: isMobile ? 'flex-start' : 'space-between',
    gap: isMobile ? spacing.sm : 0,
  },
  
  // Spacing
  marginTopSm: { marginTop: spacing.sm },
  marginTopMd: { marginTop: spacing.md },
  marginTopLg: { marginTop: spacing.lg },
  marginBottomSm: { marginBottom: spacing.sm },
  marginBottomMd: { marginBottom: spacing.md },
  marginBottomLg: { marginBottom: spacing.lg },
  paddingSm: { padding: spacing.sm },
  paddingMd: { padding: spacing.md },
  paddingLg: { padding: spacing.lg },
  
  // Alert
  alert: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  alertSuccess: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  alertError: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  alertText: {
    ...typography.body2,
  },
  alertSuccessText: {
    color: '#065f46',
  },
  alertErrorText: {
    color: '#991b1b',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.h4,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  
  // Badge
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
});

export default commonStyles;

