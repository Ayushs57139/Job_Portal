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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import api from '../../config/api';

const AdminApplicationsScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [filterStatus]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      const response = await api.getApplicationsForAdmin(filters);
      setApplications(response.applications || response || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      Alert.alert('Error', 'Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadApplications();
  };

  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.applicant?.firstName?.toLowerCase().includes(query) ||
      app.applicant?.lastName?.toLowerCase().includes(query) ||
      app.applicant?.email?.toLowerCase().includes(query) ||
      app.job?.title?.toLowerCase().includes(query) ||
      app.job?.company?.toLowerCase().includes(query)
    );
  });

  const handleApplicationPress = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to change the status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await api.updateApplicationStatus(applicationId, newStatus);
              Alert.alert('Success', 'Application status updated successfully');
              loadApplications();
              setShowDetailsModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to update application status');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'hired':
        return colors.success;
      case 'pending':
      case 'under review':
        return colors.warning;
      case 'rejected':
      case 'withdrawn':
        return colors.error;
      case 'shortlisted':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const openResume = (resumeUrl) => {
    if (resumeUrl) {
      Linking.openURL(resumeUrl).catch(() => {
        Alert.alert('Error', 'Could not open resume');
      });
    } else {
      Alert.alert('No Resume', 'No resume available for this application');
    }
  };

  const renderApplicationCard = (application) => (
    <TouchableOpacity
      key={application._id}
      style={styles.applicationCard}
      onPress={() => handleApplicationPress(application)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.applicantSection}>
          <View style={styles.applicantIcon}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.applicantInfo}>
            <Text style={styles.applicantName}>
              {application.applicant?.firstName} {application.applicant?.lastName}
            </Text>
            <Text style={styles.applicantEmail}>
              {application.applicant?.email}
            </Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(application.status) }
        ]}>
          <Text style={styles.statusText}>
            {application.status || 'pending'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.jobSection}>
          <Ionicons name="briefcase" size={16} color={colors.primary} />
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle}>{application.job?.title || 'Job not found'}</Text>
            <Text style={styles.companyName}>
              {application.job?.company || 'Unknown Company'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {application.applicant?.phone || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Applied: {api.formatIndianDate(application.createdAt)}
          </Text>
        </View>

        {application.coverLetter && (
          <View style={styles.infoRow}>
            <Ionicons name="document-text" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>
              Cover letter provided
            </Text>
          </View>
        )}
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
            <Text style={styles.modalTitle}>Application Details</Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedApplication && (
            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Applicant Information</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Full Name</Text>
                <Text style={styles.detailValue}>
                  {selectedApplication.applicant?.firstName} {selectedApplication.applicant?.lastName}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>
                  {selectedApplication.applicant?.email}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>
                  {selectedApplication.applicant?.phone || 'N/A'}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Job Information</Text>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Job Title</Text>
                <Text style={styles.detailValue}>
                  {selectedApplication.job?.title || 'N/A'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Company</Text>
                <Text style={styles.detailValue}>
                  {selectedApplication.job?.company || 'N/A'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {selectedApplication.job?.location || 'N/A'}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Application Details</Text>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[
                  styles.detailValue,
                  { color: getStatusColor(selectedApplication.status) }
                ]}>
                  {selectedApplication.status || 'pending'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Applied On</Text>
                <Text style={styles.detailValue}>
                  {api.formatIndianDateTime(selectedApplication.createdAt)}
                </Text>
              </View>

              {selectedApplication.coverLetter && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Cover Letter</Text>
                  <Text style={styles.detailValue}>
                    {selectedApplication.coverLetter}
                  </Text>
                </View>
              )}

              {selectedApplication.expectedSalary && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Expected Salary</Text>
                  <Text style={styles.detailValue}>
                    {api.formatIndianCurrency(selectedApplication.expectedSalary)}
                  </Text>
                </View>
              )}

              {selectedApplication.noticePeriod && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Notice Period</Text>
                  <Text style={styles.detailValue}>
                    {selectedApplication.noticePeriod}
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                {selectedApplication.resume && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resumeButton]}
                    onPress={() => openResume(selectedApplication.resume)}
                  >
                    <Ionicons name="document-text" size={20} color={colors.textWhite} />
                    <Text style={styles.actionButtonText}>View Resume</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.jobButton]}
                  onPress={() => {
                    setShowDetailsModal(false);
                    navigation.navigate('JobDetails', { jobId: selectedApplication.job?._id });
                  }}
                >
                  <Ionicons name="briefcase" size={20} color={colors.textWhite} />
                  <Text style={styles.actionButtonText}>View Job</Text>
                </TouchableOpacity>

                <Text style={styles.actionSectionTitle}>Update Status:</Text>

                <View style={styles.statusButtonsRow}>
                  <TouchableOpacity
                    style={[styles.statusActionButton, { backgroundColor: colors.info }]}
                    onPress={() => handleUpdateStatus(selectedApplication._id, 'shortlisted')}
                  >
                    <Text style={styles.statusActionText}>Shortlist</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusActionButton, { backgroundColor: colors.success }]}
                    onPress={() => handleUpdateStatus(selectedApplication._id, 'accepted')}
                  >
                    <Text style={styles.statusActionText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusActionButton, { backgroundColor: colors.error }]}
                    onPress={() => handleUpdateStatus(selectedApplication._id, 'rejected')}
                  >
                    <Text style={styles.statusActionText}>Reject</Text>
                  </TouchableOpacity>
                </View>
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
        <Text style={styles.loadingText}>Loading applications...</Text>
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
        <Text style={styles.headerTitle}>All Applications</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by applicant or job..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'shortlisted', 'accepted', 'rejected', 'hired'].map((status) => (
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

      {/* Applications List */}
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
          {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
        </Text>

        {filteredApplications.map(renderApplicationCard)}

        {filteredApplications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No applications found</Text>
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
  applicationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  applicantSection: {
    flexDirection: 'row',
    flex: 1,
    marginRight: spacing.sm,
  },
  applicantIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicantInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  applicantName: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '600',
  },
  applicantEmail: {
    ...typography.caption,
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
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  jobSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: `${colors.primary}05`,
    borderRadius: borderRadius.sm,
  },
  jobInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  jobTitle: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
  },
  companyName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  sectionTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
  resumeButton: {
    backgroundColor: colors.primary,
  },
  jobButton: {
    backgroundColor: colors.info,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '600',
  },
  actionSectionTitle: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusActionButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statusActionText: {
    ...typography.body2,
    color: colors.textWhite,
    fontWeight: '600',
  },
});

export default AdminApplicationsScreen;

