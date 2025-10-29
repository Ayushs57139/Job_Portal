import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import api from '../../config/api';

const AdminJobsScreen = ({ navigation, route }) => {
  const { showPending = false } = route.params || {};
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState(showPending ? 'pending' : 'all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [filterStatus]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      const response = await api.getJobsForAdmin(filters);
      setJobs(response.jobs || response || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(query) ||
      job.company?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query) ||
      job.jobType?.toLowerCase().includes(query)
    );
  });

  const handleJobPress = (job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  const handleApproveJob = async (jobId) => {
    Alert.alert(
      'Approve Job',
      'Are you sure you want to approve this job posting?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await api.approveJob(jobId);
              Alert.alert('Success', 'Job approved successfully');
              loadJobs();
              setShowDetailsModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to approve job');
            }
          },
        },
      ]
    );
  };

  const handleRejectJob = async (jobId) => {
    Alert.prompt(
      'Reject Job',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            try {
              await api.rejectJob(jobId, reason || 'No reason provided');
              Alert.alert('Success', 'Job rejected successfully');
              loadJobs();
              setShowDetailsModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to reject job');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDeleteJob = async (jobId) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteJob(jobId);
              Alert.alert('Success', 'Job deleted successfully');
              loadJobs();
              setShowDetailsModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete job');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'rejected':
      case 'closed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getJobTypeIcon = (jobType) => {
    switch (jobType?.toLowerCase()) {
      case 'full-time':
        return 'briefcase';
      case 'part-time':
        return 'time';
      case 'contract':
        return 'document-text';
      case 'internship':
        return 'school';
      default:
        return 'briefcase-outline';
    }
  };

  const renderJobCard = (job) => (
    <TouchableOpacity
      key={job._id}
      style={styles.jobCard}
      onPress={() => handleJobPress(job)}
    >
      <View style={styles.jobCardHeader}>
        <View style={styles.jobTitleSection}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.companyName}>{job.company || job.postedBy?.firstName || 'Unknown Company'}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(job.status) }
        ]}>
          <Text style={styles.statusText}>
            {job.status || 'pending'}
          </Text>
        </View>
      </View>
      
      <View style={styles.jobCardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>{job.location || 'Not specified'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name={getJobTypeIcon(job.jobType)} size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>{job.jobType || 'Not specified'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {job.salaryMin && job.salaryMax 
              ? `${api.formatIndianCurrency(job.salaryMin)} - ${api.formatIndianCurrency(job.salaryMax)}`
              : 'Not disclosed'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Posted: {api.formatIndianDate(job.createdAt)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {job.applicationsCount || 0} Application{job.applicationsCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Job Details</Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedJob && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Job Title</Text>
                <Text style={styles.detailValue}>{selectedJob.title}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Company</Text>
                <Text style={styles.detailValue}>
                  {selectedJob.company || selectedJob.postedBy?.firstName || 'N/A'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{selectedJob.location || 'N/A'}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Job Type</Text>
                <Text style={styles.detailValue}>{selectedJob.jobType || 'N/A'}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Salary Range</Text>
                <Text style={styles.detailValue}>
                  {selectedJob.salaryMin && selectedJob.salaryMax
                    ? `${api.formatIndianCurrency(selectedJob.salaryMin)} - ${api.formatIndianCurrency(selectedJob.salaryMax)}`
                    : 'Not disclosed'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Experience Required</Text>
                <Text style={styles.detailValue}>
                  {selectedJob.experienceMin && selectedJob.experienceMax
                    ? `${selectedJob.experienceMin} - ${selectedJob.experienceMax} years`
                    : 'N/A'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[
                  styles.detailValue,
                  { color: getStatusColor(selectedJob.status) }
                ]}>
                  {selectedJob.status || 'pending'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>
                  {selectedJob.description || 'No description available'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Skills Required</Text>
                <View style={styles.skillsContainer}>
                  {selectedJob.skills && selectedJob.skills.length > 0 ? (
                    selectedJob.skills.map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.detailValue}>No skills specified</Text>
                  )}
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Posted By</Text>
                <Text style={styles.detailValue}>
                  {selectedJob.postedBy?.firstName} {selectedJob.postedBy?.lastName} ({selectedJob.postedBy?.userType})
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Posted On</Text>
                <Text style={styles.detailValue}>
                  {api.formatIndianDateTime(selectedJob.createdAt)}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Applications</Text>
                <Text style={styles.detailValue}>
                  {selectedJob.applicationsCount || 0} application{selectedJob.applicationsCount !== 1 ? 's' : ''}
                </Text>
              </View>

              <View style={styles.modalActions}>
                {selectedJob.status === 'pending' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApproveJob(selectedJob._id)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={colors.textWhite} />
                      <Text style={styles.actionButtonText}>Approve Job</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectJob(selectedJob._id)}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.textWhite} />
                      <Text style={styles.actionButtonText}>Reject Job</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.viewButton]}
                  onPress={() => {
                    setShowDetailsModal(false);
                    navigation.navigate('JobDetails', { jobId: selectedJob._id });
                  }}
                >
                  <Ionicons name="eye" size={20} color={colors.textWhite} />
                  <Text style={styles.actionButtonText}>View Full Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteJob(selectedJob._id)}
                >
                  <Ionicons name="trash" size={20} color={colors.textWhite} />
                  <Text style={styles.actionButtonText}>Delete Job</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showPending ? 'Pending Jobs' : 'All Jobs'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs by title, company, or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'active', 'approved', 'rejected', 'closed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterTab, filterStatus === status && styles.filterTabActive]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[styles.filterTabText, filterStatus === status && styles.filterTabTextActive]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Jobs List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={styles.resultCount}>
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </Text>

        {filteredJobs.map(renderJobCard)}

        {filteredJobs.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No jobs found</Text>
          </View>
        )}
      </ScrollView>

      {renderDetailsModal()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body1,
    color: colors.text,
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.textWhite,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  resultCount: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  jobCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  jobTitleSection: {
    flex: 1,
    marginRight: spacing.sm,
  },
  jobTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '600',
  },
  companyName: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  jobCardBody: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  infoText: {
    ...typography.body2,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  modalBody: {
    padding: spacing.md,
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  skillTag: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  skillText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  modalActions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  viewButton: {
    backgroundColor: colors.info,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '600',
  },
});

export default AdminJobsScreen;

