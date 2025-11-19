import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import api from '../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isPhone = width <= 480;
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

const JobCard = ({ job }) => {
  const navigation = useNavigation();
  const [isSaved, setIsSaved] = useState(false);

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
    
    // If location is a string, return it directly
    if (typeof location === 'string') return location;
    
    // If location is an object, build a formatted string
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
    if (isWeb && typeof window !== 'undefined') {
      const url = `${window.location.origin}/jobs/${job._id}`;
      window.open(url, '_blank');
    } else {
      navigation.navigate('JobDetails', { jobId: job._id });
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleJobClick}
      activeOpacity={0.9}
    >
      {/* Top Bar with Company Logo and Save Button */}
      <View style={styles.topBar}>
        <View style={styles.companyLogoContainer}>
          <View style={styles.companyLogo}>
            <Ionicons name="business" size={24} color={colors.primary} />
          </View>
          <View style={styles.companyInfo}>
            {companyName && (
              <Text style={styles.company} numberOfLines={1}>
                {companyName}
              </Text>
            )}
            <Text style={styles.postedDate}>
              Posted {api.formatIndianDate(job.createdAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isSaved ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Job Title */}
      <Text style={styles.title} numberOfLines={2}>
        {jobTitle}
      </Text>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        {job.location && (
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="location" size={16} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {formatLocation(job.location)}
              </Text>
            </View>
          </View>
        )}
        
        {experienceRequired && (
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="briefcase" size={16} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Experience</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {experienceRequired}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Salary Badge */}
      <View style={styles.salaryBadge}>
        <Ionicons name="cash" size={18} color={colors.success || '#10B981'} />
        <Text style={styles.salaryText}>
          {formatSalary(salaryMin, salaryMax)}
        </Text>
      </View>

      {/* Skills */}
      {jobSkills && jobSkills.length > 0 && (
        <View style={styles.skills}>
          {jobSkills.slice(0, 4).map((skill, index) => (
            <View key={index} style={styles.skill}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {jobSkills.length > 4 && (
            <View style={styles.skill}>
              <Text style={styles.skillText}>+{jobSkills.length - 4}</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer with Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={(e) => {
            e.stopPropagation();
            navigation.navigate('JobApplication', { jobId: job._id });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.textWhite} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: isPhone ? spacing.md : (isMobile ? spacing.md : isTablet ? spacing.lg : spacing.lg),
    width: '100%',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...(isWeb && {
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      cursor: 'pointer',
      boxShadow: '0 15px 40px rgba(15, 23, 42, 0.08)',
    }),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  companyLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  companyLogo: {
    width: isPhone ? 40 : (isMobile ? 44 : (isTablet ? 48 : 50)),
    height: isPhone ? 40 : (isMobile ? 44 : (isTablet ? 48 : 50)),
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  companyInfo: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  company: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    fontSize: isPhone ? 13 : (isMobile ? 14 : (isTablet ? 15 : (isDesktop ? 16 : 15))),
  },
  postedDate: {
    ...typography.caption,
    color: colors.textLight,
    fontSize: isPhone ? 10 : (isMobile ? 11 : (isTablet ? 11 : (isDesktop ? 12 : 11))),
  },
  saveButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  title: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginBottom: isPhone ? spacing.sm : spacing.md,
    lineHeight: isPhone ? 20 : (isMobile ? 22 : (isTablet ? 24 : (isDesktop ? 26 : 24))),
    fontSize: isPhone ? 14 : (isMobile ? 16 : (isTablet ? 17 : (isDesktop ? 18 : 17))),
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isPhone ? spacing.xs : (isMobile ? spacing.sm : isTablet ? spacing.sm : spacing.md),
    marginBottom: isPhone ? spacing.sm : spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: isPhone ? '100%' : (isMobile ? '100%' : '45%'),
    flex: isPhone ? 1 : (isMobile ? 1 : 0),
  },
  detailIcon: {
    width: isPhone ? 26 : (isMobile ? 28 : (isTablet ? 30 : 32)),
    height: isPhone ? 26 : (isMobile ? 28 : (isTablet ? 30 : 32)),
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textLight,
    fontSize: isPhone ? 9 : (isMobile ? 10 : (isTablet ? 10 : (isDesktop ? 11 : 10))),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    fontSize: isPhone ? 12 : (isMobile ? 13 : (isTablet ? 13 : (isDesktop ? 14 : 13))),
  },
  salaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.sm : isTablet ? spacing.md : spacing.md),
    paddingVertical: isPhone ? spacing.xs : spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: isPhone ? spacing.sm : spacing.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  salaryText: {
    ...typography.body2,
    color: '#059669',
    fontWeight: '700',
    fontSize: isPhone ? 12 : (isMobile ? 13 : (isTablet ? 13 : (isDesktop ? 14 : 13))),
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isPhone ? spacing.xs : spacing.xs,
    marginBottom: isPhone ? spacing.md : spacing.lg,
  },
  skill: {
    backgroundColor: colors.background,
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.sm : isTablet ? spacing.md : spacing.md),
    paddingVertical: isPhone ? spacing.xs : spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: isPhone ? 10 : (isMobile ? 11 : (isTablet ? 11 : (isDesktop ? 12 : 11))),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : isTablet ? spacing.lg : spacing.xl),
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
    minWidth: isPhone ? 100 : (isMobile ? 120 : (isTablet ? 130 : 140)),
  },
  applyButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: isPhone ? 13 : (isMobile ? 14 : (isTablet ? 14 : (isDesktop ? 15 : 14))),
  },
});

export default JobCard;

