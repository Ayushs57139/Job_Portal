import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import api from '../config/api';
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

const JobCard = ({ job }) => {
  const navigation = useNavigation();
  const responsive = useResponsive();
  const [isSaved, setIsSaved] = useState(false);
  
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

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not disclosed';
    if (min && max) {
      return `${api.formatIndianCurrency(min)} - ${api.formatIndianCurrency(max)}`;
    }
    if (min) return `From ${api.formatIndianCurrency(min)}`;
    return `Up to ${api.formatIndianCurrency(max)}`;
  };

  const formatLocation = (location) => {
    if (!location) return 'Location not specified';
    if (typeof location === 'string') return location;
    const parts = [];
    if (location.locality) parts.push(location.locality);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const formatExperience = (totalExp) => {
    if (!totalExp) return 'Not specified';
    if (typeof totalExp === 'string') return totalExp;
    if (totalExp.min && totalExp.max) {
      return `${totalExp.min} - ${totalExp.max}`;
    }
    if (totalExp.min) return `From ${totalExp.min}`;
    if (totalExp.max) return `Up to ${totalExp.max}`;
    return 'Not specified';
  };

  // Extract job data with proper field mapping
  const companyName = job.company?.name || job.companyName || 'N/A';
  const jobTitle = job.title || job.jobTitle || 'Untitled Job';
  const salaryMin = job.salary?.min || job.salaryMin;
  const salaryMax = job.salary?.max || job.salaryMax;
  const experienceRequired = job.totalExperience ? formatExperience(job.totalExperience) : (job.experienceRequired || 'Not specified');
  const jobSkills = job.keySkills || job.skills || [];

  const handleSave = (e) => {
    if (e) e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleJobClick = () => {
    navigation.navigate('JobDetails', { jobId: job._id, id: job._id });
  };

  // Get icon size based on device
  const getIconSize = (base) => {
    if (isXsPhone) return base - 4;
    if (isSmallPhone) return base - 2;
    if (isMobile) return base;
    if (isTabletDevice) return base + 2;
    return base + 4;
  };

  // Get number of skills to show
  const getSkillsToShow = () => {
    if (isXsPhone) return 2;
    if (isSmallPhone) return 2;
    if (isMobile) return 3;
    if (isSmallTablet) return 3;
    if (isTabletDevice) return 4;
    return 5;
  };

  const skillsToShow = getSkillsToShow();

  return (
    <TouchableOpacity
      style={dynamicStyles.card}
      onPress={handleJobClick}
      activeOpacity={0.9}
    >
      {/* Top Bar with Company Logo and Save Button */}
      <View style={dynamicStyles.topBar}>
        <View style={dynamicStyles.companyLogoContainer}>
          <View style={dynamicStyles.companyLogo}>
            <Ionicons name="business" size={getIconSize(18)} color={colors.primary} />
          </View>
          <View style={dynamicStyles.companyInfo}>
            {companyName && (
              <Text style={dynamicStyles.company} numberOfLines={1}>
                {companyName}
              </Text>
            )}
            <Text style={dynamicStyles.postedDate}>
              Posted {api.formatIndianDate(job.createdAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={dynamicStyles.saveButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={getIconSize(18)}
            color={isSaved ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Job Title */}
      <Text style={dynamicStyles.title} numberOfLines={2}>
        {jobTitle}
      </Text>

      {/* Details Grid */}
      <View style={dynamicStyles.detailsGrid}>
        {job.location && (
          <View style={dynamicStyles.detailItem}>
            <View style={dynamicStyles.detailIcon}>
              <Ionicons name="location" size={getIconSize(12)} color={colors.primary} />
            </View>
            <View style={dynamicStyles.detailContent}>
              <Text style={dynamicStyles.detailLabel}>Location</Text>
              <Text style={dynamicStyles.detailValue} numberOfLines={1}>
                {formatLocation(job.location)}
              </Text>
            </View>
          </View>
        )}
        
        {experienceRequired && (
          <View style={dynamicStyles.detailItem}>
            <View style={dynamicStyles.detailIcon}>
              <Ionicons name="briefcase" size={getIconSize(12)} color={colors.primary} />
            </View>
            <View style={dynamicStyles.detailContent}>
              <Text style={dynamicStyles.detailLabel}>Experience</Text>
              <Text style={dynamicStyles.detailValue} numberOfLines={1}>
                {experienceRequired}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Salary Badge */}
      <View style={dynamicStyles.salaryBadge}>
        <Ionicons name="cash" size={getIconSize(14)} color={colors.success || '#10B981'} />
        <Text style={dynamicStyles.salaryText}>
          {formatSalary(salaryMin, salaryMax)}
        </Text>
      </View>

      {/* Skills */}
      {jobSkills && jobSkills.length > 0 && (
        <View style={dynamicStyles.skills}>
          {jobSkills.slice(0, skillsToShow).map((skill, index) => (
            <View key={index} style={dynamicStyles.skill}>
              <Text style={dynamicStyles.skillText} numberOfLines={1}>{skill}</Text>
            </View>
          ))}
          {jobSkills.length > skillsToShow && (
            <View style={dynamicStyles.skill}>
              <Text style={dynamicStyles.skillText}>+{jobSkills.length - skillsToShow}</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer with Apply Button */}
      <View style={dynamicStyles.footer}>
        <TouchableOpacity
          style={dynamicStyles.applyButton}
          onPress={(e) => {
            e.stopPropagation();
            navigation.navigate('JobApplication', { jobId: job._id });
          }}
          activeOpacity={0.8}
        >
          <Text style={dynamicStyles.applyButtonText}>Apply Now</Text>
          <Ionicons name="arrow-forward" size={getIconSize(14)} color={colors.textWhite} />
        </TouchableOpacity>
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
  const cardPadding = isXsPhone ? 10 : isSmallPhone ? 12 : isMobile ? 14 : isSmallTablet ? 16 : isTabletDevice ? 18 : 20;
  const cardHeight = isXsPhone ? 340 : isSmallPhone ? 360 : isMobile ? 380 : isSmallTablet ? 400 : isTabletDevice ? 420 : 440;
  
  return StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: isXsPhone ? borderRadius.md : borderRadius.lg,
      padding: cardPadding,
      width: '100%',
      height: cardHeight,
      flexDirection: 'column',
      ...shadows.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
      ...(isWeb && {
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
      }),
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: isXsPhone ? 8 : isMobile ? 10 : 14,
    },
    companyLogoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isXsPhone ? 6 : isMobile ? 8 : 10,
      flex: 1,
    },
    companyLogo: {
      width: isXsPhone ? 32 : isSmallPhone ? 36 : isMobile ? 40 : isTabletDevice ? 44 : 48,
      height: isXsPhone ? 32 : isSmallPhone ? 36 : isMobile ? 40 : isTabletDevice ? 44 : 48,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    companyInfo: {
      flex: 1,
      gap: 2,
    },
    company: {
      ...typography.body2,
      color: colors.text,
      fontWeight: '600',
      fontSize: isXsPhone ? 11 : isSmallPhone ? 12 : isMobile ? 13 : isTabletDevice ? 14 : 15,
    },
    postedDate: {
      ...typography.caption,
      color: colors.textLight,
      fontSize: isXsPhone ? 9 : isSmallPhone ? 9 : isMobile ? 10 : isTabletDevice ? 11 : 12,
    },
    saveButton: {
      padding: isXsPhone ? 4 : 6,
      borderRadius: borderRadius.sm,
    },
    title: {
      ...typography.h6,
      color: colors.text,
      fontWeight: '700',
      marginBottom: isXsPhone ? 8 : isMobile ? 10 : 14,
      lineHeight: isXsPhone ? 18 : isSmallPhone ? 20 : isMobile ? 22 : isTabletDevice ? 24 : 26,
      fontSize: isXsPhone ? 13 : isSmallPhone ? 14 : isMobile ? 15 : isTabletDevice ? 16 : 18,
    },
    detailsGrid: {
      flexDirection: isXsPhone ? 'column' : 'row',
      flexWrap: 'wrap',
      gap: isXsPhone ? 6 : isMobile ? 8 : 10,
      marginBottom: isXsPhone ? 8 : isMobile ? 10 : 14,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isXsPhone ? 4 : 6,
      minWidth: isXsPhone ? '100%' : isMobile ? '100%' : '45%',
      flex: isXsPhone ? 1 : 0,
    },
    detailIcon: {
      width: isXsPhone ? 22 : isSmallPhone ? 24 : isMobile ? 26 : isTabletDevice ? 28 : 30,
      height: isXsPhone ? 22 : isSmallPhone ? 24 : isMobile ? 26 : isTabletDevice ? 28 : 30,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailContent: {
      flex: 1,
      gap: 1,
    },
    detailLabel: {
      ...typography.caption,
      color: colors.textLight,
      fontSize: isXsPhone ? 8 : isSmallPhone ? 8 : isMobile ? 9 : isTabletDevice ? 10 : 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detailValue: {
      ...typography.body2,
      color: colors.text,
      fontWeight: '600',
      fontSize: isXsPhone ? 10 : isSmallPhone ? 11 : isMobile ? 12 : isTabletDevice ? 13 : 14,
    },
    salaryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isXsPhone ? 4 : 6,
      backgroundColor: '#ECFDF5',
      paddingHorizontal: isXsPhone ? 8 : isMobile ? 10 : 12,
      paddingVertical: isXsPhone ? 4 : isMobile ? 6 : 8,
      borderRadius: borderRadius.md,
      alignSelf: 'flex-start',
      marginBottom: isXsPhone ? 8 : isMobile ? 10 : 14,
      borderWidth: 1,
      borderColor: '#A7F3D0',
    },
    salaryText: {
      ...typography.body2,
      color: '#059669',
      fontWeight: '700',
      fontSize: isXsPhone ? 10 : isSmallPhone ? 11 : isMobile ? 12 : isTabletDevice ? 13 : 14,
    },
    skills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isXsPhone ? 4 : 6,
      marginBottom: isXsPhone ? 10 : isMobile ? 12 : 16,
    },
    skill: {
      backgroundColor: colors.background,
      paddingHorizontal: isXsPhone ? 6 : isMobile ? 8 : 10,
      paddingVertical: isXsPhone ? 3 : isMobile ? 4 : 6,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      maxWidth: isXsPhone ? 80 : isMobile ? 100 : 120,
    },
    skillText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
      fontSize: isXsPhone ? 9 : isSmallPhone ? 9 : isMobile ? 10 : isTabletDevice ? 11 : 12,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: isXsPhone ? 10 : isMobile ? 12 : 14,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      marginTop: 'auto',
    },
    applyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isXsPhone ? 4 : 6,
      backgroundColor: colors.primary,
      paddingHorizontal: isXsPhone ? 14 : isMobile ? 18 : isTabletDevice ? 22 : 28,
      paddingVertical: isXsPhone ? 8 : isMobile ? 10 : 12,
      borderRadius: borderRadius.md,
      ...shadows.sm,
      minWidth: isXsPhone ? 100 : isMobile ? 120 : isTabletDevice ? 140 : 160,
    },
    applyButtonText: {
      ...typography.button,
      color: colors.textWhite,
      fontWeight: '700',
      fontSize: isXsPhone ? 11 : isSmallPhone ? 12 : isMobile ? 13 : isTabletDevice ? 14 : 15,
    },
  });
};

export default JobCard;
