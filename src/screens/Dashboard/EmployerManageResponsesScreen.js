import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const EmployerManageResponsesScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const { isMobile } = responsive;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: colors.warning },
    { value: 'reviewed', label: 'Under Review', color: colors.info },
    { value: 'shortlisted', label: 'Shortlisted', color: colors.primary },
    { value: 'rejected', label: 'Rejected', color: colors.error },
    { value: 'hired', label: 'Hired', color: colors.success },
  ];

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs/my-jobs');
      setJobs(response.data.jobs || []);
      
      // Auto-select first job if available
      if (response.data.jobs && response.data.jobs.length > 0) {
        setSelectedJob(response.data.jobs[0]);
        loadApplications(response.data.jobs[0]._id);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (jobId) => {
    try {
      const response = await api.get(`/applications/job/${jobId}`);
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      Alert.alert('Error', 'Failed to load applications. Please try again.');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadJobs();
    if (selectedJob) {
      loadApplications(selectedJob._id);
    }
    setRefreshing(false);
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setShowJobSelector(false);
    loadApplications(job._id);
  };

  const handleApplicationSelect = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !selectedApplication) return;

    try {
      setUpdatingStatus(true);
      await api.put(`/applications/${selectedApplication.id}/status`, {
        status: newStatus
      });

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: newStatus }
            : app
        )
      );

      setStatusModalVisible(false);
      setNewStatus('');
      Alert.alert('Success', 'Application status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : colors.textSecondary;
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.label : status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderApplicationCard = (application) => (
    <TouchableOpacity
      key={application.id}
      style={styles.applicationCard}
      onPress={() => handleApplicationSelect(application)}
    >
      <View style={styles.applicationHeader}>
        <View style={styles.applicantInfo}>
          <Text style={styles.applicantName}>{application.fullName}</Text>
          <Text style={styles.applicantEmail}>{application.email}</Text>
          <Text style={styles.applicantPhone}>{application.mobileNumber}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
              {getStatusLabel(application.status)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.applicationDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{application.currentJobTitle || 'Not specified'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{application.educationLevel} - {application.course}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{application.currentLocation}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Applied {formatDate(application.appliedAt)}</Text>
        </View>
      </View>

      {application.keySkills && application.keySkills.length > 0 && (
        <View style={styles.skillsContainer}>
          <Text style={styles.skillsLabel}>Skills:</Text>
          <View style={styles.skillsList}>
            {application.keySkills.slice(0, 3).map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {application.keySkills.length > 3 && (
              <Text style={styles.moreSkillsText}>+{application.keySkills.length - 3} more</Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderApplicationDetails = () => {
    if (!selectedApplication) return null;

    return (
      <Modal
        visible={showApplicationDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Application Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowApplicationDetails(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Full Name</Text>
                  <Text style={styles.detailValue}>{selectedApplication.fullName}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{selectedApplication.email}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Mobile</Text>
                  <Text style={styles.detailValue}>{selectedApplication.mobileNumber}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>WhatsApp</Text>
                  <Text style={styles.detailValue}>{selectedApplication.whatsappNumber || 'Not provided'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Date of Birth</Text>
                  <Text style={styles.detailValue}>
                    {selectedApplication.dateOfBirth ? formatDate(selectedApplication.dateOfBirth) : 'Not provided'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Gender</Text>
                  <Text style={styles.detailValue}>{selectedApplication.gender}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Marital Status</Text>
                  <Text style={styles.detailValue}>{selectedApplication.maritalStatus}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Current Location</Text>
                  <Text style={styles.detailValue}>{selectedApplication.currentLocation}</Text>
                </View>
              </View>
            </View>

            {/* Professional Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Information</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Current Job Title</Text>
                  <Text style={styles.detailValue}>{selectedApplication.currentJobTitle || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Current Salary</Text>
                  <Text style={styles.detailValue}>
                    {selectedApplication.currentSalary ? `₹${selectedApplication.currentSalary.toLocaleString()}` : 'Not specified'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Experience Level</Text>
                  <Text style={styles.detailValue}>{selectedApplication.experienceLevel}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Job Status</Text>
                  <Text style={styles.detailValue}>{selectedApplication.jobStatus}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Notice Period</Text>
                  <Text style={styles.detailValue}>{selectedApplication.noticePeriod || 'Not specified'}</Text>
                </View>
              </View>
              
              {selectedApplication.jobProfileDescription && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Profile Description</Text>
                  <Text style={styles.detailValue}>{selectedApplication.jobProfileDescription}</Text>
                </View>
              )}

              {selectedApplication.keySkills && selectedApplication.keySkills.length > 0 && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Key Skills</Text>
                  <View style={styles.skillsList}>
                    {selectedApplication.keySkills.map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Education Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education Information</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Education Level</Text>
                  <Text style={styles.detailValue}>{selectedApplication.educationLevel}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Course</Text>
                  <Text style={styles.detailValue}>{selectedApplication.course}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Institution</Text>
                  <Text style={styles.detailValue}>{selectedApplication.institution || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Passing Year</Text>
                  <Text style={styles.detailValue}>{selectedApplication.passingYear || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Percentage</Text>
                  <Text style={styles.detailValue}>{selectedApplication.percentage || 'Not specified'}</Text>
                </View>
              </View>
            </View>

            {/* Work Experience */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Experience</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Current Company</Text>
                  <Text style={styles.detailValue}>{selectedApplication.currentCompany || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Industry</Text>
                  <Text style={styles.detailValue}>
                    {selectedApplication.industry && selectedApplication.industry.length > 0 
                      ? selectedApplication.industry.join(', ') 
                      : 'Not specified'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Company Type</Text>
                  <Text style={styles.detailValue}>{selectedApplication.companyType || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Employment Type</Text>
                  <Text style={styles.detailValue}>{selectedApplication.employmentType || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Currently Working</Text>
                  <Text style={styles.detailValue}>{selectedApplication.currentlyWorking || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Work Location</Text>
                  <Text style={styles.detailValue}>{selectedApplication.workLocation || 'Not specified'}</Text>
                </View>
              </View>
            </View>

            {/* Additional Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Disability Status</Text>
                  <Text style={styles.detailValue}>{selectedApplication.disabilityStatus || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Military Experience</Text>
                  <Text style={styles.detailValue}>{selectedApplication.militaryExperience || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Bike Available</Text>
                  <Text style={styles.detailValue}>{selectedApplication.bikeAvailable || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Driving License</Text>
                  <Text style={styles.detailValue}>{selectedApplication.drivingLicense || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>English Fluency</Text>
                  <Text style={styles.detailValue}>{selectedApplication.englishFluency || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Source of Visit</Text>
                  <Text style={styles.detailValue}>{selectedApplication.sourceOfVisit || 'Not specified'}</Text>
                </View>
              </View>
            </View>

            {/* Location Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location Information</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Current State</Text>
                  <Text style={styles.detailValue}>{selectedApplication.currentState || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Current City</Text>
                  <Text style={styles.detailValue}>{selectedApplication.currentCity || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Pincode</Text>
                  <Text style={styles.detailValue}>{selectedApplication.pincode || 'Not specified'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Home Town</Text>
                  <Text style={styles.detailValue}>{selectedApplication.homeTown || 'Not specified'}</Text>
                </View>
                {selectedApplication.preferredLocations && selectedApplication.preferredLocations.length > 0 && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Preferred Locations</Text>
                    <Text style={styles.detailValue}>{selectedApplication.preferredLocations.join(', ')}</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.statusButton]}
              onPress={() => {
                setNewStatus(selectedApplication.status);
                setStatusModalVisible(true);
              }}
            >
              <Ionicons name="create-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Update Status</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderStatusModal = () => (
    <Modal
      visible={statusModalVisible}
      transparent
      animationType="fade"
    >
      <View style={styles.statusModalOverlay}>
        <View style={styles.statusModalContent}>
          <Text style={styles.statusModalTitle}>Update Application Status</Text>
          
          <View style={styles.statusOptions}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  newStatus === option.value && styles.selectedStatusOption
                ]}
                onPress={() => setNewStatus(option.value)}
              >
                <View style={[styles.statusIndicator, { backgroundColor: option.color }]} />
                <Text style={[
                  styles.statusOptionText,
                  newStatus === option.value && styles.selectedStatusOptionText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statusModalActions}>
            <TouchableOpacity
              style={[styles.statusModalButton, styles.cancelButton]}
              onPress={() => {
                setStatusModalVisible(false);
                setNewStatus('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusModalButton, styles.updateButton]}
              onPress={handleStatusUpdate}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.updateButtonText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading job responses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isMobile && (
        <View style={styles.sidebarWrapper}>
          <EmployerSidebar permanent navigation={navigation} role="company" activeKey="responses" />
        </View>
      )}
      {isMobile && (
        <EmployerSidebar 
          visible={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          navigation={navigation} 
          role="company" 
          activeKey="responses" 
        />
      )}
      {isMobile && (
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSidebarOpen(true)}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      
      <View style={[styles.contentWrapper, isMobile && styles.contentWrapperMobile]}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerBar, isMobile && styles.headerBarMobile]}
        >
          <View style={[styles.headerLeft, isMobile && styles.headerLeftMobile]}>
            <View style={[styles.headerIconContainer, isMobile && styles.headerIconContainerMobile]}>
              <Ionicons name="people" size={isMobile ? 24 : 28} color="#3B82F6" />
            </View>
            <View>
              <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>Manage Job Responses</Text>
              <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>Review and manage job applications</Text>
            </View>
          </View>
        </LinearGradient>

        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Jobs Posted</Text>
            <Text style={styles.emptySubtitle}>You haven't posted any jobs yet</Text>
            <TouchableOpacity
              style={styles.postJobButton}
              onPress={() => navigation.navigate('EmployerPostJob')}
            >
              <Text style={styles.postJobButtonText}>Post Your First Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Job Selector */}
            <TouchableOpacity
              style={styles.jobSelector}
              onPress={() => setShowJobSelector(true)}
            >
              <View style={styles.jobSelectorContent}>
                <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
                <View style={styles.jobSelectorText}>
                  <Text style={styles.jobSelectorTitle}>
                    {selectedJob ? selectedJob.title : 'Select a job'}
                  </Text>
                  <Text style={styles.jobSelectorSubtitle}>
                    {selectedJob ? `${applications.length} applications` : 'Choose job to view applications'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Applications List */}
            {selectedJob && (
              <ScrollView
                style={styles.applicationsList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                  />
                }
              >
                {applications.length === 0 ? (
                  <View style={styles.emptyApplications}>
                    <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyApplicationsTitle}>No Applications Yet</Text>
                    <Text style={styles.emptyApplicationsSubtitle}>
                      Applications for this job will appear here
                    </Text>
                  </View>
                ) : (
                  applications.map(renderApplicationCard)
                )}
              </ScrollView>
            )}
          </>
        )}
      </View>

      {/* Job Selector Modal */}
      <Modal
        visible={showJobSelector}
        transparent
        animationType="fade"
      >
        <View style={styles.jobSelectorOverlay}>
          <View style={styles.jobSelectorModal}>
            <Text style={styles.jobSelectorModalTitle}>Select Job</Text>
            <ScrollView style={styles.jobSelectorList}>
              {jobs.map((job) => (
                <TouchableOpacity
                  key={job._id}
                  style={[
                    styles.jobSelectorItem,
                    selectedJob && selectedJob._id === job._id && styles.selectedJobItem
                  ]}
                  onPress={() => handleJobSelect(job)}
                >
                  <Text style={styles.jobSelectorItemTitle}>{job.title}</Text>
                  <Text style={styles.jobSelectorItemSubtitle}>
                    {job.company} • {job.location}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.jobSelectorCloseButton}
              onPress={() => setShowJobSelector(false)}
            >
              <Text style={styles.jobSelectorCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderApplicationDetails()}
      {renderStatusModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
  },
  sidebarWrapper: {
    width: 280,
    backgroundColor: colors.sidebarBackground,
  },
  menuButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentWrapperMobile: {
    paddingTop: spacing.xl + 40,
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
  headerBar: {
    padding: spacing.xl,
    ...shadows.md,
  },
  headerBarMobile: {
    padding: spacing.md,
    paddingTop: spacing.xl + 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerLeftMobile: {
    gap: spacing.sm,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainerMobile: {
    width: 48,
    height: 48,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerTitleMobile: {
    fontSize: 22,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  headerSubtitleMobile: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
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
  postJobButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  postJobButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
  jobSelector: {
    margin: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  jobSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  jobSelectorText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  jobSelectorTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '600',
  },
  jobSelectorSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  applicationsList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  emptyApplications: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyApplicationsTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyApplicationsSubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  applicantEmail: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  applicantPhone: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  statusContainer: {
    marginLeft: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  applicationDetails: {
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
  skillsContainer: {
    marginTop: spacing.sm,
  },
  skillsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  skillTag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  skillText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  moreSkillsText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  detailGrid: {
    gap: spacing.md,
  },
  detailItem: {
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body2,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  statusButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
  jobSelectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobSelectorModal: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxHeight: '70%',
    ...shadows.lg,
  },
  jobSelectorModalTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '600',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  jobSelectorList: {
    maxHeight: 400,
  },
  jobSelectorItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedJobItem: {
    backgroundColor: colors.primary + '10',
  },
  jobSelectorItemTitle: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  jobSelectorItemSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  jobSelectorCloseButton: {
    padding: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  jobSelectorCloseText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
  },
  statusModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusModalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxWidth: 400,
    ...shadows.lg,
  },
  statusModalTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '600',
    padding: spacing.lg,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusOptions: {
    padding: spacing.lg,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  selectedStatusOption: {
    backgroundColor: colors.primary + '10',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  statusOptionText: {
    ...typography.body1,
    color: colors.text,
  },
  selectedStatusOptionText: {
    fontWeight: '600',
    color: colors.primary,
  },
  statusModalActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  statusModalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.textSecondary + '20',
  },
  updateButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  updateButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
});

export default EmployerManageResponsesScreen;
