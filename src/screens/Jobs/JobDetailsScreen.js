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

const JobDetailsScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      const response = await api.getJob(jobId);
      setJob(response.job || response);
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    navigation.navigate('JobApplication', { jobId });
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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>{jobTitle}</Text>
          {companyName && (
            <Text style={styles.company}>{companyName}</Text>
          )}

          <View style={styles.details}>
            {job.location && (
              <View style={styles.detail}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={styles.detailText}>{formatLocation(job.location)}</Text>
              </View>
            )}
            
            {experienceText && (
              <View style={styles.detail}>
                <Ionicons name="briefcase" size={20} color={colors.primary} />
                <Text style={styles.detailText}>{experienceText}</Text>
              </View>
            )}
            
            {salaryText && (
              <View style={styles.detail}>
                <Ionicons name="cash" size={20} color={colors.primary} />
                <Text style={styles.detailText}>
                  {salaryText}
                </Text>
              </View>
            )}
            
            {job.jobType && (
              <View style={styles.detail}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <Text style={styles.detailText}>{job.jobType}</Text>
              </View>
            )}
          </View>

          {job.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Job Description</Text>
              <Text style={styles.sectionText}>{job.description}</Text>
            </View>
          )}

          {job.requirements && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              <Text style={styles.sectionText}>{job.requirements}</Text>
            </View>
          )}

          {jobSkills && jobSkills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Required Skills</Text>
              <View style={styles.skills}>
                {jobSkills.map((skill, index) => (
                  <View key={index} style={styles.skill}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {benefits && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benefits</Text>
              {Array.isArray(benefits) ? (
                <View style={styles.benefitsList}>
                  {benefits.map((benefit, index) => (
                    <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.sectionText}>{benefits}</Text>
              )}
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.postedDate}>
              Posted on {api.formatIndianDate(job.createdAt)}
            </Text>
          </View>
        </View>

        <Button
          title="Apply for this Job"
          onPress={handleApply}
          style={styles.applyButton}
        />
      </ScrollView>
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
  },
  errorText: {
    ...typography.h4,
    color: colors.error,
    marginTop: spacing.md,
  },
  scrollContent: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  company: {
    ...typography.h5,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  details: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    ...typography.body1,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionText: {
    ...typography.body1,
    color: colors.text,
    lineHeight: 24,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skill: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  skillText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  benefitsList: {
    gap: spacing.xs,
  },
  benefitItem: {
    ...typography.body1,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  postedDate: {
    ...typography.caption,
    color: colors.textLight,
  },
  applyButton: {
    marginTop: spacing.md,
  },
});

export default JobDetailsScreen;

