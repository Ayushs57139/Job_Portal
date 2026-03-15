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
        {/* ── Main Column ── */}
        <ScrollView
          contentContainerStyle={dynamicStyles.scrollContent}
          style={dynamicStyles.leftScrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={dynamicStyles.mainColumn}>

            {/* ── Hero Card ── */}
            <View style={dynamicStyles.heroCard}>
              {/* Company row */}
              <View style={dynamicStyles.companyRow}>
                <View style={dynamicStyles.companyLogo}>
                  <Ionicons name="business" size={22} color="#4F46E5" />
                </View>
                {companyName && <Text style={dynamicStyles.companyName}>{companyName}</Text>}
              </View>

              {/* Title */}
              <Text style={dynamicStyles.jobTitle}>{jobTitle}</Text>

              {/* Meta pills */}
              <View style={dynamicStyles.metaRow}>
                {job.location && (
                  <View style={[dynamicStyles.metaPill, dynamicStyles.metaBlue]}>
                    <Ionicons name="location-outline" size={13} color="#3B82F6" />
                    <Text style={[dynamicStyles.metaText, { color: '#3B82F6' }]}>{formatLocation(job.location)}</Text>
                  </View>
                )}
                {experienceText && (
                  <View style={[dynamicStyles.metaPill, dynamicStyles.metaPurple]}>
                    <Ionicons name="briefcase-outline" size={13} color="#7C3AED" />
                    <Text style={[dynamicStyles.metaText, { color: '#7C3AED' }]}>{experienceText}</Text>
                  </View>
                )}
                {salaryText && (
                  <View style={[dynamicStyles.metaPill, dynamicStyles.metaGreen]}>
                    <Ionicons name="cash-outline" size={13} color="#059669" />
                    <Text style={[dynamicStyles.metaText, { color: '#059669' }]}>{salaryText}</Text>
                  </View>
                )}
                {job.jobType && (
                  <View style={[dynamicStyles.metaPill, dynamicStyles.metaAmber]}>
                    <Ionicons name="time-outline" size={13} color="#D97706" />
                    <Text style={[dynamicStyles.metaText, { color: '#D97706' }]}>{job.jobType}</Text>
                  </View>
                )}
              </View>

              {/* Divider + quick info grid */}
              <View style={dynamicStyles.divider} />
              <View style={dynamicStyles.infoGrid}>
                {job.department && (
                  <View style={dynamicStyles.infoItem}>
                    <Text style={dynamicStyles.infoLabel}>Department</Text>
                    <Text style={dynamicStyles.infoValue}>{job.department}</Text>
                  </View>
                )}
                {job.industry && (
                  <View style={dynamicStyles.infoItem}>
                    <Text style={dynamicStyles.infoLabel}>Industry</Text>
                    <Text style={dynamicStyles.infoValue}>{job.industry}</Text>
                  </View>
                )}
                {job.educationLevel && (
                  <View style={dynamicStyles.infoItem}>
                    <Text style={dynamicStyles.infoLabel}>Education</Text>
                    <Text style={dynamicStyles.infoValue}>{job.educationLevel}</Text>
                  </View>
                )}
                {job.openings && (
                  <View style={dynamicStyles.infoItem}>
                    <Text style={dynamicStyles.infoLabel}>Openings</Text>
                    <Text style={dynamicStyles.infoValue}>{job.openings}</Text>
                  </View>
                )}
              </View>

              {/* Mobile apply button */}
              {!showSidebarLayout && (
                <TouchableOpacity style={dynamicStyles.applyBtnMobile} onPress={handleApply} activeOpacity={0.85}>
                  <Text style={dynamicStyles.applyBtnText}>Apply Now</Text>
                  <Ionicons name="arrow-forward" size={17} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            {/* ── Job Description ── */}
            {job.description && (
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                  <View style={dynamicStyles.sectionBar} />
                  <Text style={dynamicStyles.sectionTitle}>Job Description</Text>
                </View>
                <Text style={dynamicStyles.sectionText}>{job.description}</Text>
              </View>
            )}

            {/* ── Requirements ── */}
            {job.requirements && (
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                  <View style={dynamicStyles.sectionBar} />
                  <Text style={dynamicStyles.sectionTitle}>Requirements</Text>
                </View>
                <Text style={dynamicStyles.sectionText}>{job.requirements}</Text>
              </View>
            )}

            {/* ── Skills ── */}
            {jobSkills && jobSkills.length > 0 && (
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                  <View style={dynamicStyles.sectionBar} />
                  <Text style={dynamicStyles.sectionTitle}>Key Skills</Text>
                </View>
                <View style={dynamicStyles.skillsWrap}>
                  {jobSkills.map((skill, i) => (
                    <View key={i} style={dynamicStyles.skillChip}>
                      <Text style={dynamicStyles.skillChipText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── Benefits ── */}
            {benefits && (
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                  <View style={dynamicStyles.sectionBar} />
                  <Text style={dynamicStyles.sectionTitle}>Benefits</Text>
                </View>
                <Text style={dynamicStyles.sectionText}>{benefits}</Text>
              </View>
            )}

            {/* ── Mobile Similar Jobs ── */}
            {!showSidebarLayout && similarJobs.length > 0 && (
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionHeader}>
                  <View style={dynamicStyles.sectionBar} />
                  <Text style={dynamicStyles.sectionTitle}>Similar Jobs</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {similarJobs.map((sj) => {
                    const sjTitle = sj.title || sj.jobTitle || 'Untitled';
                    const sjCompany = sj.company?.name || sj.companyName;
                    const sjSalary = sj.salary ? formatSimilarJobSalary(sj.salary) : 'Not disclosed';
                    const sjLocation = sj.location ? formatSimilarJobLocation(sj.location) : '';
                    return (
                      <TouchableOpacity key={sj._id} style={dynamicStyles.mobileSJCard} onPress={() => handleSimilarJobClick(sj._id)} activeOpacity={0.8}>
                        <View style={dynamicStyles.sjIconWrap}>
                          <Ionicons name="briefcase" size={16} color="#4F46E5" />
                        </View>
                        <Text style={dynamicStyles.sjTitle} numberOfLines={2}>{sjTitle}</Text>
                        {sjCompany && <Text style={dynamicStyles.sjCompany} numberOfLines={1}>{sjCompany}</Text>}
                        <View style={dynamicStyles.sjMeta}>
                          {sjLocation ? <><Ionicons name="location-outline" size={12} color="#64748B" /><Text style={dynamicStyles.sjMetaText}>{sjLocation}</Text></> : null}
                        </View>
                        <Text style={dynamicStyles.sjSalary}>{sjSalary}</Text>
                        <View style={dynamicStyles.sjFooter}>
                          <Text style={dynamicStyles.sjViewJob}>View Job</Text>
                          <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

          </View>
        </ScrollView>

        {/* ── Sidebar (web only) ── */}
        {showSidebarLayout && (
          <View style={dynamicStyles.sidebar}>

            {/* Apply card */}
            <View style={dynamicStyles.applyCard}>
              <Text style={dynamicStyles.applyCardLabel}>Interested in this role?</Text>
              <TouchableOpacity style={dynamicStyles.applyBtnWeb} onPress={handleApply} activeOpacity={0.85}>
                <Text style={dynamicStyles.applyBtnText}>Apply Now</Text>
                <Ionicons name="arrow-forward" size={17} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Similar jobs */}
            {similarJobs.length > 0 && (
              <View style={dynamicStyles.similarCard}>
                <View style={dynamicStyles.sectionHeader}>
                  <View style={dynamicStyles.sectionBar} />
                  <Text style={dynamicStyles.sectionTitle}>Similar Jobs</Text>
                </View>
                {similarJobs.map((sj) => {
                  const sjTitle = sj.title || sj.jobTitle || 'Untitled';
                  const sjCompany = sj.company?.name || sj.companyName;
                  const sjSalary = sj.salary ? formatSimilarJobSalary(sj.salary) : 'Not disclosed';
                  const sjLocation = sj.location ? formatSimilarJobLocation(sj.location) : '';
                  return (
                    <TouchableOpacity key={sj._id} style={dynamicStyles.sjCard} onPress={() => handleSimilarJobClick(sj._id)} activeOpacity={0.8}>
                      <View style={dynamicStyles.sjRow}>
                        <View style={dynamicStyles.sjIconWrap}>
                          <Ionicons name="briefcase" size={16} color="#4F46E5" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={dynamicStyles.sjTitle} numberOfLines={2}>{sjTitle}</Text>
                          {sjCompany && <Text style={dynamicStyles.sjCompany} numberOfLines={1}>{sjCompany}</Text>}
                        </View>
                      </View>
                      <View style={dynamicStyles.sjMeta}>
                        {sjLocation ? <><Ionicons name="location-outline" size={12} color="#64748B" /><Text style={dynamicStyles.sjMetaText}>{sjLocation}</Text></> : null}
                      </View>
                      <View style={dynamicStyles.sjMeta}>
                        <Ionicons name="cash-outline" size={12} color="#059669" />
                        <Text style={[dynamicStyles.sjMetaText, { color: '#059669' }]}>{sjSalary}</Text>
                      </View>
                      <View style={dynamicStyles.sjFooter}>
                        <Text style={dynamicStyles.sjViewJob}>View Job</Text>
                        <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
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
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    contentWrapper: {
      flex: 1,
      flexDirection: showSidebarLayout ? 'row' : 'column',
      backgroundColor: '#F1F5F9',
    },
    leftScrollView: { flex: 1 },
    scrollContent: {
      padding: isMobile ? 12 : 20,
      paddingBottom: 40,
      maxWidth: showSidebarLayout ? 820 : '100%',
    },
    mainColumn: { width: '100%' },

    // Hero Card
    heroCard: {
      backgroundColor: '#fff',
      borderRadius: 14,
      padding: isMobile ? 16 : 24,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
      marginBottom: 14,
    },
    companyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    companyLogo: {
      width: 44, height: 44, borderRadius: 10,
      backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: '#C7D2FE',
    },
    companyName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    jobTitle: {
      fontSize: isMobile ? 22 : isSmallScreen ? 26 : 30,
      fontWeight: '800', color: '#0F172A',
      lineHeight: isMobile ? 30 : 38,
      marginBottom: 16, letterSpacing: -0.3,
    },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    metaPill: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      paddingHorizontal: 10, paddingVertical: 5,
      borderRadius: 20, borderWidth: 1,
    },
    metaBlue: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
    metaPurple: { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' },
    metaGreen: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
    metaAmber: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
    metaText: { fontSize: 12, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    infoItem: { width: '50%', paddingVertical: 8, paddingRight: 12 },
    infoLabel: {
      fontSize: 11, fontWeight: '700', color: '#94A3B8',
      textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3,
    },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    applyBtnMobile: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: '#4F46E5', borderRadius: 10, paddingVertical: 13, marginTop: 16,
      shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
    },
    applyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

    // Section Cards
    sectionCard: {
      backgroundColor: '#fff', borderRadius: 14,
      padding: isMobile ? 16 : 22,
      borderWidth: 1, borderColor: '#E2E8F0',
      shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 1, marginBottom: 14,
    },
    sectionHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      marginBottom: 14, paddingBottom: 12,
      borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    sectionBar: { width: 4, height: 20, borderRadius: 2, backgroundColor: '#4F46E5' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', letterSpacing: 0.1 },
    sectionText: { fontSize: 14, color: '#334155', lineHeight: 24 },

    // Skills
    skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillChip: {
      backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE',
      paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    },
    skillChipText: { fontSize: 13, fontWeight: '600', color: '#4338CA' },

    // Sidebar
    sidebar: {
      width: showSidebarLayout ? 340 : '100%',
      backgroundColor: '#F1F5F9',
      borderLeftWidth: showSidebarLayout ? 1 : 0,
      borderLeftColor: '#E2E8F0',
      padding: 16,
      ...(showSidebarLayout && {
        position: 'sticky', top: 0,
        height: '100vh', maxHeight: '100vh', overflowY: 'auto',
      }),
    },
    applyCard: {
      backgroundColor: '#fff', borderRadius: 14, padding: 20,
      borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14,
      shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    applyCardLabel: {
      fontSize: 14, fontWeight: '700', color: '#0F172A',
      textAlign: 'center', marginBottom: 14,
    },
    applyBtnWeb: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: '#4F46E5', borderRadius: 10, paddingVertical: 13,
      shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
    },
    similarCard: {
      backgroundColor: '#fff', borderRadius: 14, padding: 18,
      borderWidth: 1, borderColor: '#E2E8F0',
      shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
    },

    // Similar Job Card (sidebar)
    sjCard: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    sjRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
    sjIconWrap: {
      width: 34, height: 34, borderRadius: 8,
      backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    },
    sjTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', lineHeight: 20, marginBottom: 2 },
    sjCompany: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    sjMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    sjMetaText: { fontSize: 12, color: '#64748B' },
    sjSalary: { fontSize: 12, fontWeight: '600', color: '#059669', marginBottom: 8 },
    sjFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    sjViewJob: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },

    // Mobile Similar Job Card
    mobileSJCard: {
      backgroundColor: '#fff', borderRadius: 12, padding: 14,
      marginRight: 12, width: isMobile ? 240 : 280,
      borderWidth: 1, borderColor: '#E2E8F0',
      shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
    },

    // keep these so old references don't crash (unused but harmless)
    container2: {},
  });
};

export default JobDetailsScreen;