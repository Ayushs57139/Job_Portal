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
  const { isMobile, isTabletDevice } = responsive;
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
      const response = await api.getMyJobs();
      setJobs(response.jobs || []);
      
      // Auto-select first job if available
      if (response.jobs && response.jobs.length > 0) {
        setSelectedJob(response.jobs[0]);
        loadApplications(response.jobs[0]._id);
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
      const response = await api.getJobApplications(jobId);
      setApplications(response.applications || []);
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
      await api.updateApplicationStatus(selectedApplication.id, newStatus);

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
      activeOpacity={0.7}
    >
      <View style={styles.applicationHeader}>
        <View style={styles.applicantAvatar}>
          <Text style={styles.applicantAvatarText}>
            {application.fullName?.charAt(0)?.toUpperCase() || 'A'}
          </Text>
        </View>
        <View style={styles.applicantInfo}>
          <Text style={styles.applicantName}>{application.fullName}</Text>
          <View style={styles.applicantContact}>
            <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.applicantEmail}>{application.email}</Text>
          </View>
          <View style={styles.applicantContact}>
            <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.applicantPhone}>{application.mobileNumber}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '15', borderColor: getStatusColor(application.status) + '40' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(application.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
              {getStatusLabel(application.status)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.applicationDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="briefcase-outline" size={18} color="#6366F1" />
          </View>
          <Text style={styles.detailText}>{application.currentJobTitle || 'Not specified'}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="school-outline" size={18} color="#8B5CF6" />
          </View>
          <Text style={styles.detailText}>{application.educationLevel} - {application.course}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="location-outline" size={18} color="#EC4899" />
          </View>
          <Text style={styles.detailText}>{application.currentLocation}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="time-outline" size={18} color="#10B981" />
          </View>
          <Text style={styles.detailText}>Applied {formatDate(application.appliedAt)}</Text>
        </View>
      </View>

      {application.keySkills && application.keySkills.length > 0 && (
        <View style={styles.skillsContainer}>
          <Text style={styles.skillsLabel}>Key Skills</Text>
          <View style={styles.skillsList}>
            {application.keySkills.slice(0, 4).map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {application.keySkills.length > 4 && (
              <View style={styles.moreSkillsTag}>
                <Text style={styles.moreSkillsText}>+{application.keySkills.length - 4}</Text>
              </View>
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
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalTitleIcon}>
                  <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Application Details</Text>
                  <Text style={styles.modalSubtitle}>{selectedApplication.fullName}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowApplicationDetails(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Personal Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="person-outline" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              <View style={styles.detailGrid}>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="person" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Full Name</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.fullName}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="mail" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Email</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.email}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="call" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Mobile</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.mobileNumber}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                    <Text style={styles.modernDetailLabel}>WhatsApp</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.whatsappNumber || 'Not provided'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="calendar" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Date of Birth</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>
                    {selectedApplication.dateOfBirth ? formatDate(selectedApplication.dateOfBirth) : 'Not provided'}
                  </Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="people" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Gender</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.gender}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="heart" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Marital Status</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.maritalStatus}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="location" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Current Location</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.currentLocation}</Text>
                </View>
              </View>
            </View>

            {/* Professional Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="briefcase-outline" size={20} color="#10B981" />
                </View>
                <Text style={styles.sectionTitle}>Professional Information</Text>
              </View>
              <View style={styles.detailGrid}>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="briefcase" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Current Job Title</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.currentJobTitle || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="cash" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Current Salary</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>
                    {selectedApplication.currentSalary ? `₹${selectedApplication.currentSalary.toLocaleString()}` : 'Not specified'}
                  </Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="trending-up" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Experience Level</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.experienceLevel}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Job Status</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.jobStatus}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="time" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Notice Period</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.noticePeriod || 'Not specified'}</Text>
                </View>
              </View>
              
              {selectedApplication.jobProfileDescription && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Profile Description</Text>
                  <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>{selectedApplication.jobProfileDescription}</Text>
                  </View>
                </View>
              )}

              {selectedApplication.keySkills && selectedApplication.keySkills.length > 0 && (
                <View style={styles.skillsSection}>
                  <Text style={styles.skillsSectionLabel}>Key Skills</Text>
                  <View style={styles.skillsList}>
                    {selectedApplication.keySkills.map((skill, index) => (
                      <View key={index} style={styles.modalSkillTag}>
                        <Text style={styles.modalSkillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Education Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="school-outline" size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.sectionTitle}>Education Information</Text>
              </View>
              <View style={styles.detailGrid}>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="school" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Education Level</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.educationLevel}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="book" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Course</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.course}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="business" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Institution</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.institution || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="calendar" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Passing Year</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.passingYear || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="trophy" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Percentage</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.percentage || 'Not specified'}</Text>
                </View>
              </View>
            </View>

            {/* Work Experience */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="briefcase-outline" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.sectionTitle}>Work Experience</Text>
              </View>
              <View style={styles.detailGrid}>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="business" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Current Company</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.currentCompany || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="layers" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Industry</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>
                    {selectedApplication.industry && selectedApplication.industry.length > 0 
                      ? selectedApplication.industry.join(', ') 
                      : 'Not specified'}
                  </Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="cube" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Company Type</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.companyType || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="contract" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Employment Type</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.employmentType || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Currently Working</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.currentlyWorking || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="location" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Work Location</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.workLocation || 'Not specified'}</Text>
                </View>
              </View>
            </View>

            {/* Additional Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="information-circle-outline" size={20} color="#EC4899" />
                </View>
                <Text style={styles.sectionTitle}>Additional Information</Text>
              </View>
              <View style={styles.detailGrid}>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="accessibility" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Disability Status</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.disabilityStatus || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="shield" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Military Experience</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.militaryExperience || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="bicycle" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Bike Available</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.bikeAvailable || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="card" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Driving License</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.drivingLicense || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="chatbubbles" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>English Fluency</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.englishFluency || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="globe" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Source of Visit</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.sourceOfVisit || 'Not specified'}</Text>
                </View>
              </View>
            </View>

            {/* Location Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="location-outline" size={20} color="#10B981" />
                </View>
                <Text style={styles.sectionTitle}>Location Information</Text>
              </View>
              <View style={styles.detailGrid}>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="map" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Current State</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.currentState || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="location" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Current City</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.currentCity || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="pin" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Pincode</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.pincode || 'Not specified'}</Text>
                </View>
                <View style={styles.modernDetailItem}>
                  <View style={styles.modernDetailLabelContainer}>
                    <Ionicons name="home" size={16} color="#6B7280" />
                    <Text style={styles.modernDetailLabel}>Home Town</Text>
                  </View>
                  <Text style={styles.modernDetailValue}>{selectedApplication.homeTown || 'Not specified'}</Text>
                </View>
                {selectedApplication.preferredLocations && selectedApplication.preferredLocations.length > 0 && (
                  <View style={styles.modernDetailItem}>
                    <View style={styles.modernDetailLabelContainer}>
                      <Ionicons name="star" size={16} color="#6B7280" />
                      <Text style={styles.modernDetailLabel}>Preferred Locations</Text>
                    </View>
                    <Text style={styles.modernDetailValue}>{selectedApplication.preferredLocations.join(', ')}</Text>
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
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Update Status</Text>
              </LinearGradient>
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
        <View style={[styles.sidebarWrapper, isTabletDevice && styles.sidebarWrapperTablet]}>
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
      
      <View style={[styles.contentWrapper, isMobile && styles.contentWrapperMobile, isTabletDevice && styles.contentWrapperTablet]}>
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
  sidebarWrapperTablet: {
    width: 240,
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
  contentWrapperTablet: {
    paddingTop: 0,
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  applicantAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicantAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
  },
  applicantInfo: {
    flex: 1,
    gap: 6,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  applicantContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  applicantEmail: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  applicantPhone: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  applicationDetails: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
  skillsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  skillsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  skillText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  moreSkillsTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  moreSkillsText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 0,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalTitleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  detailGrid: {
    gap: 16,
  },
  modernDetailItem: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  modernDetailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modernDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modernDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
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
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  skillsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  skillsSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalSkillTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  modalSkillText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  statusButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
