import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import Button from '../../components/Button';
import api from '../../config/api';

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

const JobDetailsScreen = ({ route, navigation }) => {
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
    if (isWeb && typeof window !== 'undefined') {
      const url = `${window.location.origin}/jobs/${similarJobId}`;
      window.open(url, '_blank');
    } else {
      navigation.navigate('JobDetails', { jobId: similarJobId, id: similarJobId });
    }
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Job not found</Text>
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

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.contentWrapper}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          style={styles.leftScrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainColumn}>
            {/* Header Section with Gradient */}
            <View style={styles.headerCard}>
              <View style={styles.headerTop}>
                <View style={styles.companyBadge}>
                  <View style={styles.companyIconContainer}>
                    <Ionicons name="business" size={24} color={colors.primary} />
                  </View>
                  {companyName && (
                    <Text style={styles.company}>{companyName}</Text>
                  )}
                </View>
              </View>

              <Text style={styles.title}>{jobTitle}</Text>

              <View style={styles.details}>
                {job.location && (
                  <View style={styles.detailBadge}>
                    <View style={[styles.detailIconContainer, styles.locationIcon]}>
                      <Ionicons name="location" size={18} color="#ffffff" />
                    </View>
                    <Text style={styles.detailText}>{formatLocation(job.location)}</Text>
                  </View>
                )}
                
                {experienceText && (
                  <View style={styles.detailBadge}>
                    <View style={[styles.detailIconContainer, styles.experienceIcon]}>
                      <Ionicons name="briefcase" size={18} color="#ffffff" />
                    </View>
                    <Text style={styles.detailText}>{experienceText}</Text>
                  </View>
                )}
                
                {salaryText && (
                  <View style={styles.detailBadge}>
                    <View style={[styles.detailIconContainer, styles.salaryIcon]}>
                      <Ionicons name="cash" size={18} color="#ffffff" />
                    </View>
                    <Text style={styles.detailText}>{salaryText}</Text>
                  </View>
                )}
                
                {job.jobType && (
                  <View style={styles.detailBadge}>
                    <View style={[styles.detailIconContainer, styles.jobTypeIcon]}>
                      <Ionicons name="time" size={18} color="#ffffff" />
                    </View>
                    <Text style={styles.detailText}>{job.jobType}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Job Description Section */}
            {job.description && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Job Description</Text>
                </View>
                <Text style={styles.sectionText}>{job.description}</Text>
              </View>
            )}

            {/* Requirements Section */}
            {job.requirements && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Requirements</Text>
                </View>
                <Text style={styles.sectionText}>{job.requirements}</Text>
              </View>
            )}

            {/* Skills Section */}
            {jobSkills && jobSkills.length > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="code-slash" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Required Skills</Text>
                </View>
                <View style={styles.skills}>
                  {jobSkills.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Benefits Section */}
            {benefits && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="gift" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Benefits</Text>
                </View>
                <Text style={styles.sectionText}>{benefits}</Text>
              </View>
            )}

            {/* Apply Button Section - Mobile Only */}
            {!isWeb && (
              <View style={styles.actionBar}>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Ready to apply?</Text>
                  <Text style={styles.actionSubtitle}>Submit your application now</Text>
                </View>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.8}>
                  <Text style={styles.applyButtonText}>Apply Now</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
                </TouchableOpacity>
              </View>
            )}

            {/* Similar Jobs - Mobile */}
            {!isWeb && similarJobs.length > 0 && (
              <View style={styles.mobileSimilarJobs}>
                <View style={styles.mobileSimilarJobsHeader}>
                  <Ionicons name="briefcase" size={22} color={colors.primary} />
                  <Text style={styles.mobileSimilarJobsTitle}>Similar Jobs</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mobileSimilarJobsScroll}>
                  {similarJobs.map((similarJob) => {
                    const similarJobTitle = similarJob.title || similarJob.jobTitle || 'Untitled Job';
                    const similarCompanyName = similarJob.company?.name || similarJob.companyName;
                    const similarSalary = similarJob.salary ? formatSimilarJobSalary(similarJob.salary) : (similarJob.salaryMin || similarJob.salaryMax) ? `${api.formatIndianCurrency(similarJob.salaryMin || 0)} - ${api.formatIndianCurrency(similarJob.salaryMax || 0)}` : 'Not disclosed';
                    const similarLocation = similarJob.location ? formatSimilarJobLocation(similarJob.location) : 'Location not specified';
                    
                    return (
                      <TouchableOpacity
                        key={similarJob._id}
                        style={styles.mobileSimilarJobCard}
                        onPress={() => handleSimilarJobClick(similarJob._id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.similarJobHeader}>
                          <View style={styles.similarJobIconContainer}>
                            <Ionicons name="briefcase" size={18} color={colors.primary} />
                          </View>
                          <View style={styles.similarJobHeaderText}>
                            <Text style={styles.similarJobTitle} numberOfLines={2}>
                              {similarJobTitle}
                            </Text>
                            {similarCompanyName && (
                              <Text style={styles.similarJobCompany} numberOfLines={1}>
                                {similarCompanyName}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.similarJobDetails}>
                          <View style={styles.similarJobDetail}>
                            <Ionicons name="location" size={14} color={colors.textSecondary} />
                            <Text style={styles.similarJobDetailText} numberOfLines={1}>
                              {similarLocation}
                            </Text>
                          </View>
                          <View style={styles.similarJobDetail}>
                            <Ionicons name="cash" size={14} color={colors.success || '#10B981'} />
                            <Text style={styles.similarJobDetailText} numberOfLines={1}>
                              {similarSalary}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.similarJobFooter}>
                          <Text style={styles.viewJobText}>View Job</Text>
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
        {isWeb && (
          <View style={styles.sidebar}>
            {/* Apply Button for Web */}
            <View style={styles.applyCard}>
              <Text style={styles.applyCardTitle}>Interested in this role?</Text>
              <TouchableOpacity style={styles.applyButtonWeb} onPress={handleApply} activeOpacity={0.8}>
                <Text style={styles.applyButtonText}>Apply Now</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
              </TouchableOpacity>
            </View>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <View style={styles.similarJobsContainer}>
                <View style={styles.sidebarHeader}>
                  <Ionicons name="briefcase" size={22} color={colors.primary} />
                  <Text style={styles.sidebarTitle}>Similar Jobs</Text>
                </View>
                <ScrollView style={styles.similarJobsScroll} showsVerticalScrollIndicator={false}>
                  {similarJobs.map((similarJob) => {
                    const similarJobTitle = similarJob.title || similarJob.jobTitle || 'Untitled Job';
                    const similarCompanyName = similarJob.company?.name || similarJob.companyName;
                    const similarSalary = similarJob.salary ? formatSimilarJobSalary(similarJob.salary) : (similarJob.salaryMin || similarJob.salaryMax) ? `${api.formatIndianCurrency(similarJob.salaryMin || 0)} - ${api.formatIndianCurrency(similarJob.salaryMax || 0)}` : 'Not disclosed';
                    const similarLocation = similarJob.location ? formatSimilarJobLocation(similarJob.location) : 'Location not specified';
                    
                    return (
                      <TouchableOpacity
                        key={similarJob._id}
                        style={styles.similarJobCard}
                        onPress={() => handleSimilarJobClick(similarJob._id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.similarJobHeader}>
                          <View style={styles.similarJobIconContainer}>
                            <Ionicons name="briefcase" size={18} color={colors.primary} />
                          </View>
                          <View style={styles.similarJobHeaderText}>
                            <Text style={styles.similarJobTitle} numberOfLines={2}>
                              {similarJobTitle}
                            </Text>
                            {similarCompanyName && (
                              <Text style={styles.similarJobCompany} numberOfLines={1}>
                                {similarCompanyName}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.similarJobDetails}>
                          <View style={styles.similarJobDetail}>
                            <Ionicons name="location" size={14} color={colors.textSecondary} />
                            <Text style={styles.similarJobDetailText} numberOfLines={1}>
                              {similarLocation}
                            </Text>
                          </View>
                          <View style={styles.similarJobDetail}>
                            <Ionicons name="cash" size={14} color={colors.success || '#10B981'} />
                            <Text style={styles.similarJobDetailText} numberOfLines={1}>
                              {similarSalary}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.similarJobFooter}>
                          <Text style={styles.viewJobText}>View Job</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  contentWrapper: {
    flex: 1,
    flexDirection: isWeb ? 'row' : 'column',
    backgroundColor: colors.background,
  },
  leftScrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: isWeb ? spacing.xl : spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    ...(isWeb && {
      alignItems: 'flex-start',
      maxWidth: 800,
    }),
  },
  mainColumn: {
    width: '100%',
    maxWidth: isWeb ? 800 : '100%',
  },
  // Header Card Styles
  headerCard: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
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
    marginBottom: spacing.lg,
    lineHeight: 40,
    fontSize: isWeb ? 36 : 32,
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
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
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
    width: isWeb ? 400 : '100%',
    backgroundColor: colors.background,
    borderLeftWidth: isWeb ? 1 : 0,
    borderLeftColor: colors.borderLight,
    padding: spacing.lg,
    ...(isWeb && {
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
    ...(isWeb && {
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
    padding: spacing.lg,
    marginLeft: spacing.md,
    marginRight: spacing.xs,
    width: 320,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
});

export default JobDetailsScreen;

