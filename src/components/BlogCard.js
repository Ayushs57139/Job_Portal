import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import { useResponsive } from '../utils/responsive';

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

const BlogCard = ({ blog }) => {
  const navigation = useNavigation();
  const responsive = useResponsive();
  
  // Enhanced device detection
  const { width } = responsive;
  const isXsPhone = width <= 320;
  const isSmallPhone = width > 320 && width <= 375;
  const isPhone = width > 375 && width <= 414;
  const isLargePhone = width > 414 && width <= 480;
  const isMobile = width <= 480;
  const isSmallTablet = width > 480 && width <= 600;
  const isTablet = width > 600 && width <= 768;
  const isLargeTablet = width > 768 && width <= 834;
  const isTabletDevice = width > 480 && width <= 834;
  const isSmallLaptop = width > 834 && width <= 1024;
  const isLaptop = width > 1024 && width <= 1200;
  const isDesktop = width > 1200 && width <= 1440;
  const isLargeDesktop = width > 1440;
  const isDesktopDevice = width > 834;
  
  const dynamicStyles = getStyles(
    isXsPhone, isSmallPhone, isPhone, isLargePhone, isMobile,
    isSmallTablet, isTablet, isLargeTablet, isTabletDevice,
    isSmallLaptop, isLaptop, isDesktop, isLargeDesktop, isDesktopDevice, width
  );

  const getCategoryColor = (category) => {
    const categoryColors = {
      'Networking': '#3B82F6',
      'Workplace Trends': '#8B5CF6',
      'Interview Prep': '#10B981',
      'Career Tips': '#F59E0B',
      'Skills': '#EF4444',
    };
    return categoryColors[category] || colors.primary;
  };

  // Get icon size based on device
  const getIconSize = (base) => {
    if (isXsPhone) return base - 6;
    if (isSmallPhone) return base - 4;
    if (isMobile) return base - 2;
    if (isTabletDevice) return base;
    return base + 2;
  };

  return (
    <TouchableOpacity
      style={dynamicStyles.card}
      onPress={() => navigation.navigate('BlogDetail', { slug: blog.slug })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dynamicStyles.imageContainer}
      >
        <Ionicons name="newspaper-outline" size={getIconSize(48)} color={colors.textWhite} />
      </LinearGradient>

      <View style={dynamicStyles.content}>
        <View style={[dynamicStyles.categoryBadge, { backgroundColor: getCategoryColor(blog.category) }]}>
          <Text style={dynamicStyles.categoryText}>{blog.category}</Text>
        </View>

        <Text style={dynamicStyles.title} numberOfLines={2}>
          {blog.title}
        </Text>

        {blog.excerpt && (
          <Text style={dynamicStyles.excerpt} numberOfLines={3}>
            {blog.excerpt}
          </Text>
        )}

        <View style={dynamicStyles.footer}>
          <View style={dynamicStyles.meta}>
            <Ionicons name="time-outline" size={getIconSize(14)} color={colors.textSecondary} />
            <Text style={dynamicStyles.metaText}>{blog.readTime || '5 min read'}</Text>
          </View>
          <TouchableOpacity style={dynamicStyles.readMore}>
            <Text style={dynamicStyles.readMoreText}>Read More</Text>
            <Ionicons name="arrow-forward" size={getIconSize(14)} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (
  isXsPhone, isSmallPhone, isPhone, isLargePhone, isMobile,
  isSmallTablet, isTablet, isLargeTablet, isTabletDevice,
  isSmallLaptop, isLaptop, isDesktop, isLargeDesktop, isDesktopDevice, width
) => {
  // Calculate responsive card width
  const getCardWidth = () => {
    if (isXsPhone) return width - 32;
    if (isSmallPhone) return width - 36;
    if (isMobile) return width - 40;
    if (isSmallTablet) return 260;
    if (isTablet) return 280;
    if (isLargeTablet) return 300;
    if (isSmallLaptop) return 310;
    if (isLaptop) return 320;
    return 340;
  };
  
  return StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: isXsPhone ? borderRadius.md : borderRadius.lg,
      marginRight: isXsPhone ? 8 : isMobile ? spacing.sm : spacing.md,
      width: getCardWidth(),
      overflow: 'hidden',
      ...shadows.card,
      ...(isWeb && {
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }),
    },
    imageContainer: {
      height: isXsPhone ? 100 : isSmallPhone ? 120 : isMobile ? 140 : isSmallTablet ? 150 : isTabletDevice ? 160 : 180,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: isXsPhone ? 10 : isSmallPhone ? 12 : isMobile ? spacing.sm : isTabletDevice ? spacing.md : spacing.lg,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: isXsPhone ? 6 : isMobile ? spacing.xs : spacing.sm,
      paddingVertical: isXsPhone ? 2 : spacing.xs,
      borderRadius: borderRadius.sm,
      marginBottom: isXsPhone ? 6 : spacing.sm,
    },
    categoryText: {
      ...typography.caption,
      color: colors.textWhite,
      fontWeight: '600',
      fontSize: isXsPhone ? 9 : isSmallPhone ? 10 : isMobile ? 10 : isTabletDevice ? 11 : 12,
    },
    title: {
      ...typography.h4,
      color: colors.text,
      marginBottom: isXsPhone ? 6 : spacing.sm,
      fontSize: isXsPhone ? 14 : isSmallPhone ? 15 : isMobile ? 16 : isSmallTablet ? 17 : isTabletDevice ? 18 : 20,
      lineHeight: isXsPhone ? 18 : isSmallPhone ? 20 : isMobile ? 22 : isTabletDevice ? 24 : 26,
    },
    excerpt: {
      ...typography.body2,
      color: colors.textSecondary,
      marginBottom: isXsPhone ? 8 : isMobile ? spacing.sm : spacing.md,
      lineHeight: isXsPhone ? 16 : isSmallPhone ? 17 : isMobile ? 18 : 20,
      fontSize: isXsPhone ? 11 : isSmallPhone ? 11 : isMobile ? 12 : isTabletDevice ? 13 : 14,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isXsPhone ? 2 : spacing.xs,
    },
    metaText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: isXsPhone ? 9 : isSmallPhone ? 10 : isMobile ? 10 : isTabletDevice ? 11 : 12,
    },
    readMore: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isXsPhone ? 2 : spacing.xs,
    },
    readMoreText: {
      ...typography.body2,
      color: colors.primary,
      fontWeight: '600',
      fontSize: isXsPhone ? 10 : isSmallPhone ? 11 : isMobile ? 12 : isTabletDevice ? 13 : 14,
    },
  });
};

export default BlogCard;
