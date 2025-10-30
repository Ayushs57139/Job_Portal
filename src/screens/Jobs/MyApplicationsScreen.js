import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

const MyApplicationsScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const statusConfig = {
    pending: { label: 'Pending', color: colors.warning, icon: 'time-outline' },
    reviewed: { label: 'Under Review', color: colors.info, icon: 'eye-outline' },
    shortlisted: { label: 'Shortlisted', color: colors.primary, icon: 'checkmark-circle-outline' },
    rejected: { label: 'Not Selected', color: colors.error, icon: 'close-circle-outline' },
    hired: { label: 'Hired', color: colors.success, icon: 'trophy-outline' },
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/my-applications');
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      Alert.alert('Error', 'Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadApplications();
    setRefreshing(false);
  };

  const getStatusConfig = (status) => {
    return statusConfig[status] || { label: status, color: colors.textSecondary, icon: 'help-outline' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderApplicationCard = (application) => {
    const status = getStatusConfig(application.status);
    
    return (
      <TouchableOpacity
        key={application.id}
        style={styles.applicationCard}
        onPress={() => {
          // Navigate to job details or application details
          navigation.navigate('JobDetails', { jobId: application.job._id });
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle}>{application.job.title}</Text>
            <Text style={styles.companyName}>{application.job.company}</Text>
            <Text style={styles.jobLocation}>{application.job.location}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Ionicons name={status.icon} size={16} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="briefcase-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{application.currentJobTitle || 'Not specified'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{application.experienceLevel}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>Applied {formatDate(application.appliedAt)}</Text>
          </View>
        </View>

        {application.job.salary && (
          <View style={styles.salaryContainer}>
            <Text style={styles.salaryText}>
              {application.job.salary.min && application.job.salary.max
                ? `₹${application.job.salary.min.toLocaleString()} - ₹${application.job.salary.max.toLocaleString()}`
                : application.job.salary.min
                ? `₹${application.job.salary.min.toLocaleString()}+`
                : 'Salary not specified'
              }
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getStatusCounts = () => {
    const counts = {
      total: applications.length,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
    };

    applications.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Applications" navigation={navigation} />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Status Overview */}
        <View style={styles.statusOverview}>
          <Text style={styles.overviewTitle}>Application Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusCount}>{statusCounts.total}</Text>
              <Text style={styles.statusLabel}>Total</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusCount, { color: colors.warning }]}>{statusCounts.pending}</Text>
              <Text style={styles.statusLabel}>Pending</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusCount, { color: colors.info }]}>{statusCounts.reviewed}</Text>
              <Text style={styles.statusLabel}>Under Review</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusCount, { color: colors.primary }]}>{statusCounts.shortlisted}</Text>
              <Text style={styles.statusLabel}>Shortlisted</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusCount, { color: colors.success }]}>{statusCounts.hired}</Text>
              <Text style={styles.statusLabel}>Hired</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusCount, { color: colors.error }]}>{statusCounts.rejected}</Text>
              <Text style={styles.statusLabel}>Rejected</Text>
            </View>
          </View>
        </View>

        {/* Applications List */}
        {applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start applying to jobs to see your applications here
            </Text>
            <TouchableOpacity
              style={styles.browseJobsButton}
              onPress={() => navigation.navigate('Jobs')}
            >
              <Text style={styles.browseJobsButtonText}>Browse Jobs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.applicationsList}>
            <Text style={styles.sectionTitle}>Your Applications</Text>
            {applications.map(renderApplicationCard)}
          </View>
        )}
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
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  content: {
    flex: 1,
  },
  statusOverview: {
    backgroundColor: colors.cardBackground,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  overviewTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statusItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: spacing.sm,
  },
  statusCount: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  applicationsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  browseJobsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  browseJobsButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
  applicationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  companyName: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  jobLocation: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  statusContainer: {
    marginLeft: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  salaryContainer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  salaryText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default MyApplicationsScreen;
