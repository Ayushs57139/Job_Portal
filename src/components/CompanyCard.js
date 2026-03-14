import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
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

const CompanyCard = ({ company }) => {
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

  // Get company initials for avatar
  const getInitials = (name) => {
    if (!name) return 'C';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const starSize = isXsPhone ? 10 : isSmallPhone ? 11 : isMobile ? 12 : 14;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={starSize} color="#FFB800" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="star-half" name="star-half" size={starSize} color="#FFB800" />
      );
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Ionicons key={`star-empty-${i}`} name="star-outline" size={starSize} color="#FFB800" />
      );
    }
    
    return stars;
  };

  // Get consistent color based on company name
  const getAvatarColor = (name) => {
    const avatarColors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    if (!name) return avatarColors[0];
    const charCode = name.charCodeAt(0);
    return avatarColors[charCode % avatarColors.length];
  };

  const getTextValue = (value, fallback) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' || typeof value === 'number') return value.toString();
    if (Array.isArray(value)) return value.filter(Boolean).join(', ') || fallback;
    if (typeof value === 'object') {
      const objectText = Object.values(value)
        .filter((v) => typeof v === 'string' && v.trim())
        .join(', ');
      return objectText || fallback;
    }
    return fallback;
  };

  const location = getTextValue(
    company.profile?.company?.location ||
      company.profile?.company?.city ||
      company.location?.city ||
      company.location,
    'Multiple locations'
  );

  const companyType = getTextValue(
    company.profile?.company?.companyType || company.companyType || (company.employerType === 'consultancy' ? 'Consultancy' : 'Company'),
    company.employerType === 'consultancy' ? 'Consultancy' : 'Private company'
  );

  const employeeCount = getTextValue(
    company.profile?.company?.company?.employeeCount || 
    company.profile?.company?.consultancy?.teamSize || 
    company.profile?.company?.size || 
    company.employeeCount,
    company.employerType === 'consultancy' ? 'Team size not specified' : '200+ employees'
  );

  const hiringStatus = (company.openPositions || 0) > 0 ? 'Actively hiring' : 'Building talent pool';

  // Get icon size based on device
  const getIconSize = (base) => {
    if (isXsPhone) return base - 4;
    if (isSmallPhone) return base - 2;
    if (isMobile) return base;
    if (isTabletDevice) return base + 2;
    return base + 4;
  };

  return (
    <TouchableOpacity 
      style={dynamicStyles.card}
      onPress={() => navigation.navigate('CompanyDetails', { companyId: company._id, id: company._id })}
      activeOpacity={0.9}
    >
      <View style={dynamicStyles.trustBadge}>
        <Ionicons name="shield-checkmark" size={getIconSize(10)} color="#4338CA" />
        <Text style={dynamicStyles.trustBadgeText}>
          {company.isFeatured ? 'Featured' : (company.isVerified || company.isEmployerVerified) ? 'Verified' : 'Unverified'}
        </Text>
      </View>

      <View style={dynamicStyles.header}>
        <View style={[dynamicStyles.avatar, { backgroundColor: getAvatarColor(company.profile?.company?.name || company.name) }]}>
          <Text style={dynamicStyles.avatarText}>{getInitials(company.profile?.company?.name || company.name)}</Text>
        </View>
        
        <View style={dynamicStyles.headerInfo}>
          <Text style={dynamicStyles.companyName} numberOfLines={1}>
            {company.profile?.company?.name || company.name}
          </Text>
          <View style={dynamicStyles.industryBadge}>
            <Text style={dynamicStyles.industryText} numberOfLines={1}>
              {company.profile?.company?.industry || company.industry || 'Technology'}
            </Text>
          </View>
        </View>
      </View>

      <View style={dynamicStyles.statsRow}>
        <Text style={dynamicStyles.openPositions}>
          {company.openPositions || 0} open {company.openPositions === 1 ? 'position' : 'positions'}
        </Text>
        
        {company.rating && (
          <View style={dynamicStyles.ratingContainer}>
            <View style={dynamicStyles.stars}>
              {renderStars(company.rating)}
            </View>
            <Text style={dynamicStyles.ratingText}>
              {company.rating}/5
            </Text>
          </View>
        )}
      </View>

      <View style={dynamicStyles.metaChips}>
        <View style={dynamicStyles.metaChip}>
          <Ionicons name="location-outline" size={getIconSize(10)} color="#4338CA" />
          <Text style={dynamicStyles.metaChipText} numberOfLines={1}>{location}</Text>
        </View>
        <View style={dynamicStyles.metaChip}>
          <Ionicons name="briefcase-outline" size={getIconSize(10)} color="#4338CA" />
          <Text style={dynamicStyles.metaChipText} numberOfLines={1}>{companyType}</Text>
        </View>
        {!isXsPhone && (
          <View style={dynamicStyles.metaChip}>
            <Ionicons name="people-outline" size={getIconSize(10)} color="#4338CA" />
            <Text style={dynamicStyles.metaChipText} numberOfLines={1}>{employeeCount}</Text>
          </View>
        )}
      </View>

      <Text style={dynamicStyles.description} numberOfLines={2}>
        {company.profile?.company?.description || company.description || 'Leading company in the industry'}
      </Text>

      <View style={dynamicStyles.cardFooter}>
        <View style={dynamicStyles.viewJobsButton}>
          <Text style={dynamicStyles.viewJobsText}>View Jobs</Text>
          <Ionicons name="arrow-forward" size={getIconSize(12)} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </View>
        <View style={dynamicStyles.hiringTag}>
          <Ionicons name="flash" size={getIconSize(10)} color="#10B981" />
          <Text style={dynamicStyles.hiringTagText} numberOfLines={1}>{hiringStatus}</Text>
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
  // Calculate responsive values
  const cardPadding = isXsPhone ? 10 : isSmallPhone ? 12 : isMobile ? 14 : isTabletDevice ? 16 : 18;
  
  return StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: isXsPhone ? borderRadius.md : borderRadius.lg,
      padding: cardPadding,
      width: '100%',
      minHeight: isXsPhone ? 260 : isSmallPhone ? 280 : isMobile ? 300 : isTabletDevice ? 310 : 320,
      height: '100%',
      ...shadows.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
      position: 'relative',
      ...(isWeb && {
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isXsPhone ? 8 : isMobile ? 10 : 14,
      gap: isXsPhone ? 8 : isMobile ? 10 : 12,
      marginTop: isXsPhone ? 16 : 20,
    },
    avatar: {
      width: isXsPhone ? 36 : isSmallPhone ? 40 : isMobile ? 44 : isTabletDevice ? 48 : 52,
      height: isXsPhone ? 36 : isSmallPhone ? 40 : isMobile ? 44 : isTabletDevice ? 48 : 52,
      borderRadius: isXsPhone ? 18 : isSmallPhone ? 20 : isMobile ? 22 : isTabletDevice ? 24 : 26,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: isXsPhone ? 14 : isSmallPhone ? 16 : isMobile ? 18 : isTabletDevice ? 20 : 22,
      fontWeight: '700',
      color: colors.textWhite,
    },
    headerInfo: {
      flex: 1,
    },
    companyName: {
      fontSize: isXsPhone ? 12 : isSmallPhone ? 13 : isMobile ? 14 : isTabletDevice ? 15 : 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    industryBadge: {
      backgroundColor: '#E0E7FF',
      paddingHorizontal: isXsPhone ? 6 : 8,
      paddingVertical: 3,
      borderRadius: borderRadius.sm,
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
    industryText: {
      fontSize: isXsPhone ? 9 : isSmallPhone ? 9 : isMobile ? 10 : isTabletDevice ? 11 : 12,
      fontWeight: '600',
      color: '#4F46E5',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isXsPhone ? 8 : isMobile ? 10 : 12,
      paddingBottom: isXsPhone ? 6 : 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    openPositions: {
      fontSize: isXsPhone ? 10 : isSmallPhone ? 11 : isMobile ? 12 : isTabletDevice ? 13 : 14,
      color: colors.text,
      fontWeight: '500',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    stars: {
      flexDirection: 'row',
      gap: 1,
    },
    ratingText: {
      fontSize: isXsPhone ? 9 : isSmallPhone ? 10 : isMobile ? 11 : isTabletDevice ? 12 : 13,
      color: colors.text,
      fontWeight: '600',
    },
    description: {
      fontSize: isXsPhone ? 10 : isSmallPhone ? 11 : isMobile ? 12 : isTabletDevice ? 13 : 14,
      color: colors.textSecondary,
      marginBottom: isXsPhone ? 8 : isMobile ? 10 : 12,
      lineHeight: isXsPhone ? 14 : isSmallPhone ? 16 : isMobile ? 18 : 20,
    },
    metaChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isXsPhone ? 4 : 6,
      marginBottom: isXsPhone ? 8 : isMobile ? 10 : 12,
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: isXsPhone ? 6 : 8,
      paddingVertical: isXsPhone ? 3 : 5,
      borderRadius: borderRadius.lg,
      backgroundColor: '#EEF2FF',
      maxWidth: isXsPhone ? 100 : 130,
    },
    metaChipText: {
      fontSize: isXsPhone ? 9 : isSmallPhone ? 10 : isMobile ? 10 : 11,
      fontWeight: '600',
      color: '#4338CA',
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isXsPhone ? 6 : 8,
      marginTop: 'auto',
    },
    viewJobsButton: {
      flex: 1,
      backgroundColor: '#6366F1',
      borderRadius: borderRadius.md,
      paddingVertical: isXsPhone ? 8 : isMobile ? 10 : 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewJobsText: {
      fontSize: isXsPhone ? 11 : isSmallPhone ? 12 : isMobile ? 13 : isTabletDevice ? 14 : 15,
      fontWeight: '600',
      color: colors.textWhite,
    },
    hiringTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: isXsPhone ? 6 : 8,
      paddingVertical: isXsPhone ? 6 : 8,
      borderRadius: borderRadius.md,
      backgroundColor: '#ECFDF5',
      maxWidth: isXsPhone ? 90 : 110,
    },
    hiringTagText: {
      fontSize: isXsPhone ? 9 : isSmallPhone ? 9 : isMobile ? 10 : 11,
      fontWeight: '600',
      color: '#047857',
    },
    trustBadge: {
      position: 'absolute',
      top: isXsPhone ? 6 : 8,
      right: isXsPhone ? 6 : 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: '#EEF2FF',
      borderRadius: borderRadius.lg,
      paddingHorizontal: isXsPhone ? 6 : 8,
      paddingVertical: 3,
      zIndex: 1,
    },
    trustBadgeText: {
      fontSize: isXsPhone ? 8 : isSmallPhone ? 9 : 10,
      fontWeight: '600',
      color: '#4338CA',
    },
  });
};

export default CompanyCard;
