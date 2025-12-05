import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import Button from '../../components/Button';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

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

const isWebPlatform = getPlatform().OS === 'web';

const JobDetailsScreen = ({ route, navigation }) => {
  const responsive = useResponsive();
  const { width } = responsive;
  
  // Show sidebar layout only on web AND larger screens (not phone-sized)
  const showSidebarLayout = isWebPlatform && width > 768;
  const { jobId, id } = route.params || {};
  const actualJobId = jobId || id;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarJobs, setSimilarJobs] = useState([]);

  useEffect(() => {
    loadJobDetails();
  }, [actualJobId]);

  const loadJobDetails = async () => {
    if (!actualJobId) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.getJob(actualJobId);
      const jobData = response.job || response;
      setJob(jobData);

      // Build filters for similar jobs
      const filters = { limit: 10 };
      
      // Use job title for search to find similar jobs
      if (jobData.title || jobData.jobTitle) {
        filters.search = (jobData.title || jobData.jobTitle).split(' ').slice(0, 2).join(' ');
      }
      
      // Add job type filter if available
      if (jobData.jobType) {
        filters.jobType = jobData.jobType;
      }
      
      // Add skills filter if available
      const jobSkills = jobData.keySkills || jobData.skills || [];
      if (jobSkills.length > 0) {
        filters.skills = jobSkills.slice(0, 3).join(',');
      }

      try {
        const relatedJobs = await api.getJobs(filters);
        let similarJobsList = (relatedJobs.jobs || [])
          .filter((item) => item._id !== jobData._id)
          .slice(0, 4);

        // If we don't have enough similar jobs, get more recent jobs
        if (similarJobsList.length < 4) {
          const recentJobs = await api.getJobs({ limit: 10 });
          const additionalJobs = (recentJobs.jobs || [])
            .filter((item) => 
              item._id !== jobData._id && 
              !similarJobsList.some(sj => sj._id === item._id)
            )
            .slice(0, 4 - similarJobsList.length);
          similarJobsList = [...similarJobsList, ...additionalJobs];
        }

        setSimilarJobs(similarJobsList.slice(0, 4));
      } catch (similarJobsError) {
        console.error('Error loading similar jobs:', similarJobsError);
        // Try to get recent jobs as fallback
        try {
          const recentJobs = await api.getJobs({ limit: 10 });
          setSimilarJobs(
            (recentJobs.jobs || [])
              .filter((item) => item._id !== jobData._id)
              .slice(0, 4)
          );
        } catch (fallbackError) {
          console.error('Error loading fallback jobs:', fallbackError);
          setSimilarJobs([]);
        }
      }
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    navigation.navigate('JobApplication', { jobId: actualJobId });
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
    if (!totalExp) return null;
    if (typeof totalExp === 'string') return totalExp;
    if (totalExp.min && totalExp.max) {
      return `${totalExp.min} - ${totalExp.max}`;
    }
    if (totalExp.min) return `From ${totalExp.min}`;
    if (totalExp.max) return `Up to ${totalExp.max}`;
    return null;
  };

  const formatSalary = (salary) => {
    if (!salary) return null;
    if (salary.min && salary.max) {
      return `${api.formatIndianCurrency(salary.min)} - ${api.formatIndianCurrency(salary.max)}`;
    }
    if (salary.min) return `From ${api.formatIndianCurrency(salary.min)}`;
    if (salary.max) return `Up to ${api.formatIndianCurrency(salary.max)}`;
    return null;
  };

  const handleSimilarJobClick = (similarJobId) => {
    navigation.navigate('JobDetails', { jobId: similarJobId, id: similarJobId });
  };

  const formatSimilarJobLocation = (location) => {
    if (!location) return 'Location not specified';
    if (typeof location === 'string') return location;
    const parts = [];
    if (location.locality) parts.push(location.locality);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const formatSimilarJobSalary = (salary) => {
    if (!salary) return 'Not disclosed';
    if (salary.min && salary.max) {
      return `${api.formatIndianCurrency(salary.min)} - ${api.formatIndianCurrency(salary.max)}`;
    }
    if (salary.min) return `From ${api.formatIndianCurrency(salary.min)}`;
    if (salary.max) return `Up to ${api.formatIndianCurrency(salary.max)}`;
    return 'Not disclosed';
  };

  if (loading) {
    return (
      <View style={staticStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={staticStyles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={staticStyles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={staticStyles.errorText}>Job not found</Text>
      </View>
    );
  }

  // Extract job data with proper field mapping
  const jobTitle = job.title || job.jobTitle || 'Untitled Job';
  const companyName = job.company?.name || job.companyName;
  const experienceText = job.totalExperience ? formatExperience(job.totalExperience) : job.experienceRequired;
  const salaryText = job.salary ? formatSalary(job.salary) : (job.salaryMin || job.salaryMax) ? `${api.formatIndianCurrency(job.salaryMin || 0)} - ${api.formatIndianCurrency(job.salaryMax || 0)}` : null;
  const jobSkills = job.keySkills || job.skills || [];
  const benefits = job.additionalBenefits || job.benefits;

  // Dynamic styles based on screen size
  const dynamicStyles = getStyles(showSidebarLayout, width);

  return (
    <View style={dynamicStyles.container}>
      <Header />
      
      <View style={dynamicStyles.contentWrapper}>
        <ScrollView 
          contentContainerStyle={dynamicStyles.scrollContent}
          style={dynamicStyles.leftScrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={dynamicStyles.mainColumn}>
            {/* Header Section with Gradient */}
            <View style={dynamicStyles.headerCard}>
              <View style={dynamicStyles.headerTop}>
                <View style={dynamicStyles.companyBadge}>
                  <View style={dynamicStyles.companyIconContainer}>
                    <Ionicons name="business" size={24} color={colors.primary} />
                  </View>
                  {companyName && (
                    <Text style={dynamicStyles.company}>{companyName}</Text>
                  )}
                </View>
              </View>

              <Text style={dynamicStyles.title}>{jobTitle}</Text>

              <View style={dynamicStyles.details}>
                {job.location && (
                  <View style={dynamicStyles.detailBadge}>
                    <View style={[dynamicStyles.detailIconContainer, dynamicStyles.locationIcon]}>
                      <Ionicons name="location" size={18} color="#ffffff" />
                    </View>
                    <Text style={dynamicStyles.detailText}>{formatLocation(job.location)}</Text>
                  </View>
                )}
                
                {experienceText && (
                  <View style={dynamicStyles.detailBadge}>
                    <View style={[dynamicStyles.detailIconContainer, dynamicStyles.experienceIcon]}>
                      <Ionicons name="briefcase" size={18} color="#ffffff" />
                    </View>
                    <Text style={dynamicStyles.detailText}>{experienceText}</Text>
                  </View>
                )}
                
                {salaryText && (
                  <View style={dynamicStyles.detailBadge}>
                    <View style={[dynamicStyles.detailIconContainer, dynamicStyles.salaryIcon]}>
                      <Ionicons name="cash" size={18} color="#ffffff" />
                    </View>
                    <Text style={dynamicStyles.detailText}>{salaryText}</Text>
                  </View>
                )}
                
                {job.jobType && (
                  <View style={dynamicStyles.detailBadge}>
                    <View style={[dynamicStyles.detailIconContainer, dynamicStyles.jobTypeIcon]}>
                      <Ionicons name="time" size={18} color="#ffffff" />
                    </View>
                    <Text style={dynamicStyles.detailText}>{job.jobType}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Job Description Section */}
            {job.description && (
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                  <Ionicons name="document-text" size={24} color={colors.primary} />
                  <Text style={dynamicStyles.sectionTitle}>Job Description</Text>
                </View>
                <Text style={dynamicStyles.sectionText}>{job.description}</Text>
              </View>
            )}

            {/* Requirements Section */}
            {job.requirements && (
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  <Text style={dynamicStyles.sectionTitle}>Requirements</Text>
                </View>
                <Text style={dynamicStyles.sectionText}>{job.requirements}</Text>
              </View>
            )}

            {/* Skills Section */}
            {jobSkills && jobSkills.length > 0 && (
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                  <Ionicons name="code-slash" size={24} color={colors.primary} />
                  <Text style={dynamicStyles.sectionTitle}>Required Skills</Text>
                </View>
                <View style={dynamicStyles.skills}>
                  {jobSkills.map((skill, index) => (
                    <View key={index} style={dynamicStyles.skillBadge}>
                      <Text style={dynamicStyles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Benefits Section */}
            {benefits && (
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                  <Ionicons name="gift" size={24} color={colors.primary} />
                  <Text style={dynamicStyles.sectionTitle}>Benefits</Text>
                </View>
                <Text style={dynamicStyles.sectionText}>{benefits}</Text>
              </View>
            )}

            {/* Apply Button Section - Mobile Only */}
            {!showSidebarLayout && (
              <View style={dynamicStyles.actionBar}>
                <View style={dynamicStyles.actionInfo}>
                  <Text style={dynamicStyles.actionTitle}>Ready to apply?</Text>
                  <Text style={dynamicStyles.actionSubtitle}>Submit your application now</Text>
                </View>
                <TouchableOpacity style={dynamicStyles.applyButton} onPress={handleApply} activeOpacity={0.8}>
                  <Text style={dynamicStyles.applyButtonText}>Apply Now</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
                </TouchableOpacity>
              </View>
            )}

            {/* Similar Jobs - Mobile */}
            {!showSidebarLayout && similarJobs.length > 0 && (
              <View style={dynamicStyles.mobileSimilarJobs}>
                <View style={dynamicStyles.mobileSimilarJobsHeader}>
                  <Ionicons name="briefcase" size={22} color={colors.primary} />
                  <Text style={dynamicStyles.mobileSimilarJobsTitle}>Similar Jobs</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.mobileSimilarJobsScroll}>
                  {similarJobs.map((similarJob) => {
                    const similarJobTitle = similarJob.title || similarJob.jobTitle || 'Untitled Job';
                    const similarCompanyName = similarJob.company?.name || similarJob.companyName;
                    const similarSalary = similarJob.salary ? formatSimilarJobSalary(similarJob.salary) : (similarJob.salaryMin || similarJob.salaryMax) ? `${api.formatIndianCurrency(similarJob.salaryMin || 0)} - ${api.formatIndianCurrency(similarJob.salaryMax || 0)}` : 'Not disclosed';
                    const similarLocation = similarJob.location ? formatSimilarJobLocation(similarJob.location) : 'Location not specified';
                    
                    return (
                      <TouchableOpacity
                        key={similarJob._id}
                        style={dynamicStyles.mobileSimilarJobCard}
                        onPress={() => handleSimilarJobClick(similarJob._id)}
                        activeOpacity={0.8}
                      >
                        <View style={dynamicStyles.similarJobHeader}>
                          <View style={dynamicStyles.similarJobIconContainer}>
                            <Ionicons name="briefcase" size={18} color={colors.primary} />
                          </View>
                          <View style={dynamicStyles.similarJobHeaderText}>
                            <Text style={dynamicStyles.similarJobTitle} numberOfLines={2}>
                              {similarJobTitle}
                            </Text>
                            {similarCompanyName && (
                              <Text style={dynamicStyles.similarJobCompany} numberOfLines={1}>
                                {similarCompanyName}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={dynamicStyles.similarJobDetails}>
                          <View style={dynamicStyles.similarJobDetail}>
                            <Ionicons name="location" size={14} color={colors.textSecondary} />
                            <Text style={dynamicStyles.similarJobDetailText} numberOfLines={1}>
                              {similarLocation}
                            </Text>
                          </View>
                          <View style={dynamicStyles.similarJobDetail}>
                            <Ionicons name="cash" size={14} color={colors.success || '#10B981'} />
                            <Text style={dynamicStyles.similarJobDetailText} numberOfLines={1}>
                              {similarSalary}
                            </Text>
                          </View>
                        </View>
                        <View style={dynamicStyles.similarJobFooter}>
                          <Text style={dynamicStyles.viewJobText}>View Job</Text>
                          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Sidebar - Similar Jobs */}
        {showSidebarLayout && (
          <View style={dynamicStyles.sidebar}>
            {/* Apply Button for Web */}
            <View style={dynamicStyles.applyCard}>
              <Text style={dynamicStyles.applyCardTitle}>Interested in this role?</Text>
              <TouchableOpacity style={dynamicStyles.applyButtonWeb} onPress={handleApply} activeOpacity={0.8}>
                <Text style={dynamicStyles.applyButtonText}>Apply Now</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
              </TouchableOpacity>
            </View>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <View style={dynamicStyles.similarJobsContainer}>
                <View style={dynamicStyles.sidebarHeader}>
                  <Ionicons name="briefcase" size={22} color={colors.primary} />
                  <Text style={dynamicStyles.sidebarTitle}>Similar Jobs</Text>
                </View>
                <ScrollView style={dynamicStyles.similarJobsScroll} showsVerticalScrollIndicator={false}>
                  {similarJobs.map((similarJob) => {
                    const similarJobTitle = similarJob.title || similarJob.jobTitle || 'Untitled Job';
                    const similarCompanyName = similarJob.company?.name || similarJob.companyName;
                    const similarSalary = similarJob.salary ? formatSimilarJobSalary(similarJob.salary) : (similarJob.salaryMin || similarJob.salaryMax) ? `${api.formatIndianCurrency(similarJob.salaryMin || 0)} - ${api.formatIndianCurrency(similarJob.salaryMax || 0)}` : 'Not disclosed';
                    const similarLocation = similarJob.location ? formatSimilarJobLocation(similarJob.location) : 'Location not specified';
                    
                    return (
                      <TouchableOpacity
                        key={similarJob._id}
                        style={dynamicStyles.similarJobCard}
                        onPress={() => handleSimilarJobClick(similarJob._id)}
                        activeOpacity={0.8}
                      >
                        <View style={dynamicStyles.similarJobHeader}>
                          <View style={dynamicStyles.similarJobIconContainer}>
                            <Ionicons name="briefcase" size={18} color={colors.primary} />
                          </View>
                          <View style={dynamicStyles.similarJobHeaderText}>
                            <Text style={dynamicStyles.similarJobTitle} numberOfLines={2}>
                              {similarJobTitle}
                            </Text>
                            {similarCompanyName && (
                              <Text style={dynamicStyles.similarJobCompany} numberOfLines={1}>
                                {similarCompanyName}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={dynamicStyles.similarJobDetails}>
                          <View style={dynamicStyles.similarJobDetail}>
                            <Ionicons name="location" size={14} color={colors.textSecondary} />
                            <Text style={dynamicStyles.similarJobDetailText} numberOfLines={1}>
                              {similarLocation}
                            </Text>
                          </View>
                          <View style={dynamicStyles.similarJobDetail}>
                            <Ionicons name="cash" size={14} color={colors.success || '#10B981'} />
                            <Text style={dynamicStyles.similarJobDetailText} numberOfLines={1}>
                              {similarSalary}
                            </Text>
                          </View>
                        </View>
                        <View style={dynamicStyles.similarJobFooter}>
                          <Text style={dynamicStyles.viewJobText}>View Job</Text>
                          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// Static styles for loading/error states
const staticStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorText: {
    ...typography.h4,
    color: colors.error,
    marginTop: spacing.md,
  },
});

// Dynamic styles based on screen size
const getStyles = (showSidebarLayout, width) => {
  const isMobile = width <= 480;
  const isSmallScreen = width <= 600;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentWrapper: {
      flex: 1,
      flexDirection: showSidebarLayout ? 'row' : 'column',
      backgroundColor: colors.background,
    },
    leftScrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: isMobile ? spacing.md : isSmallScreen ? spacing.lg : spacing.xl,
      paddingBottom: spacing.xxl,
      gap: spacing.lg,
      ...(showSidebarLayout && {
        alignItems: 'flex-start',
        maxWidth: 800,
      }),
    },
    mainColumn: {
      width: '100%',
      maxWidth: showSidebarLayout ? 800 : '100%',
    },
  // Header Card Styles
  headerCard: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: isMobile ? borderRadius.lg : borderRadius.xl,
    padding: isMobile ? spacing.md : spacing.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  headerTop: {
    marginBottom: spacing.lg,
  },
  companyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  companyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: isMobile ? spacing.md : spacing.lg,
    lineHeight: isMobile ? 28 : 40,
    fontSize: isMobile ? 22 : isSmallScreen ? 26 : showSidebarLayout ? 36 : 32,
  },
  company: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  // Detail Badges
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xs,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIcon: {
    backgroundColor: '#3B82F6',
  },
  experienceIcon: {
    backgroundColor: '#8B5CF6',
  },
  salaryIcon: {
    backgroundColor: '#10B981',
  },
  jobTypeIcon: {
    backgroundColor: '#F59E0B',
  },
  detailText: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
    fontSize: 15,
  },
  // Section Cards
  sectionCard: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: isMobile ? borderRadius.lg : borderRadius.xl,
    padding: isMobile ? spacing.md : spacing.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: isMobile ? spacing.md : spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    fontSize: 20,
  },
  sectionText: {
    ...typography.body1,
    color: colors.text,
    lineHeight: 28,
    fontSize: 16,
  },
  // Skills
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  skillBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.xs,
  },
  skillText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  // Action Bar (Mobile)
  actionBar: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    flexDirection: 'column',
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
    marginTop: spacing.md,
  },
  actionInfo: {
    gap: spacing.xs,
  },
  actionTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  actionSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    ...shadows.sm,
    width: '100%',
  },
  applyButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: 16,
  },
  // Sidebar Styles (Web)
  sidebar: {
    width: showSidebarLayout ? 400 : '100%',
    backgroundColor: colors.background,
    borderLeftWidth: showSidebarLayout ? 1 : 0,
    borderLeftColor: colors.borderLight,
    padding: spacing.lg,
    ...(showSidebarLayout && {
      position: 'sticky',
      top: 0,
      height: '100vh',
      maxHeight: '100vh',
      overflowY: 'auto',
    }),
  },
  // Apply Card (Web Sidebar)
  applyCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  applyCardTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  applyButtonWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    ...shadows.sm,
    width: '100%',
  },
  // Similar Jobs Container
  similarJobsContainer: {
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sidebarTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    fontSize: 20,
  },
  similarJobsScroll: {
    flex: 1,
  },
  // Similar Job Card
  similarJobCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...(isWebPlatform && {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }),
  },
  similarJobHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  similarJobIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  similarJobHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  similarJobTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
  },
  similarJobCompany: {
    ...typography.body2,
    color: colors.textSecondary,
    fontSize: 13,
  },
  similarJobDetails: {
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  similarJobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  similarJobDetailText: {
    ...typography.caption,
    color: colors.text,
    fontSize: 13,
    flex: 1,
  },
  similarJobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  viewJobText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  // Mobile Similar Jobs
  mobileSimilarJobs: {
    width: '100%',
    marginTop: spacing.lg,
  },
  mobileSimilarJobsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  mobileSimilarJobsTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    fontSize: 20,
  },
  mobileSimilarJobsScroll: {
    marginHorizontal: -spacing.xs,
  },
  mobileSimilarJobCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: isMobile ? spacing.md : spacing.lg,
    marginLeft: spacing.md,
    marginRight: spacing.xs,
    width: isMobile ? 280 : 320,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
})};

export default JobDetailsScreen;

