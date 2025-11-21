import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminApplicationDetailsScreen = ({ route, navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const { applicationId } = route.params;
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Fetching application:', `${API_URL}/admin/applications/${applicationId}`);
      const response = await fetch(`${API_URL}/admin/applications/${applicationId}`, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        setApplication(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Application data received:', data);
      setApplication(data.application || data);
    } catch (error) {
      console.error('Error fetching application details:', error);
      Alert.alert('Error', 'Failed to fetch application details: ' + error.message);
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      Alert.alert('Success', 'Application status updated successfully');
      fetchApplicationDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update application status');
    }
  };

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return { bg: '#FEF3C7', text: '#F59E0B' };
      case 'REVIEWED':
        return { bg: '#DBEAFE', text: '#3B82F6' };
      case 'SHORTLISTED':
        return { bg: '#E9D5FF', text: '#A855F7' };
      case 'REJECTED':
        return { bg: '#FEE2E2', text: '#EF4444' };
      case 'ACCEPTED':
        return { bg: '#D1FAE5', text: '#10B981' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Application Details"
        activeScreen="AdminApplications"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={dynamicStyles.loadingText}>Loading application details...</Text>
        </View>
      </AdminLayout>
    );
  }

  if (!application) {
    return (
      <AdminLayout
        title="Application Details"
        activeScreen="AdminApplications"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#E74C3C" />
          <Text style={dynamicStyles.errorText}>Application not found</Text>
          <TouchableOpacity style={dynamicStyles.backButton} onPress={handleBack}>
            <Text style={dynamicStyles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </AdminLayout>
    );
  }

  const statusColors = getStatusColor(application.status);

  return (
    <AdminLayout
      title="Application Details"
      activeScreen="AdminApplications"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.container}>
          {/* Header with Back Button */}
          <View style={dynamicStyles.header}>
            <TouchableOpacity style={dynamicStyles.backBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#4A90E2" />
              <Text style={dynamicStyles.backBtnText}>Back to Applications</Text>
            </TouchableOpacity>
          </View>

          {/* Candidate Info Section */}
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.candidateHeader}>
              <View>
                <Text style={dynamicStyles.candidateName}>
                  {application.fullName || application.candidateName || application.candidate?.name || 'N/A'}
                </Text>
                <Text style={dynamicStyles.candidateEmail}>
                  {application.email || application.candidate?.email || 'N/A'}
                </Text>
              </View>
              <View style={[dynamicStyles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[dynamicStyles.statusText, { color: statusColors.text }]}>
                  {application.status?.toLowerCase() || 'pending'}
                </Text>
              </View>
            </View>
          </View>

          {/* Status Update Actions */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Update Application Status</Text>
            <View style={dynamicStyles.statusActions}>
              {['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    dynamicStyles.statusActionButton,
                    application.status?.toLowerCase() === status && dynamicStyles.statusActionButtonActive
                  ]}
                  onPress={() => updateStatus(status)}
                >
                  <Text style={[
                    dynamicStyles.statusActionText,
                    application.status?.toLowerCase() === status && dynamicStyles.statusActionTextActive
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Job Information */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Job Information</Text>
            <View style={dynamicStyles.infoRow}>
              <Ionicons name="briefcase-outline" size={20} color="#4A90E2" />
              <Text style={dynamicStyles.infoLabel}>Job Title:</Text>
              <Text style={dynamicStyles.infoValue}>
                {application.jobTitle || application.job?.title || 'N/A'}
              </Text>
            </View>
            {application.job?.company?.name && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="business-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Company:</Text>
                <Text style={dynamicStyles.infoValue}>{application.job.company.name}</Text>
              </View>
            )}
          </View>

          {/* Contact Information */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Contact Information</Text>
            {application.mobileNumber && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Mobile:</Text>
                <Text style={dynamicStyles.infoValue}>{application.mobileNumber}</Text>
              </View>
            )}
            {application.whatsappNumber && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={dynamicStyles.infoLabel}>WhatsApp:</Text>
                <Text style={dynamicStyles.infoValue}>{application.whatsappNumber}</Text>
              </View>
            )}
            {application.email && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="mail-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Email:</Text>
                <Text style={dynamicStyles.infoValue}>{application.email}</Text>
              </View>
            )}
          </View>

          {/* Personal Information */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Personal Information</Text>
            {application.gender && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="person-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Gender:</Text>
                <Text style={dynamicStyles.infoValue}>{application.gender}</Text>
              </View>
            )}
            {application.dateOfBirth && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Date of Birth:</Text>
                <Text style={dynamicStyles.infoValue}>{formatDate(application.dateOfBirth)}</Text>
              </View>
            )}
            {application.maritalStatus && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="people-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Marital Status:</Text>
                <Text style={dynamicStyles.infoValue}>{application.maritalStatus}</Text>
              </View>
            )}
          </View>

          {/* Professional Information */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Professional Information</Text>
            {application.totalExperience && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="briefcase-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Total Experience:</Text>
                <Text style={dynamicStyles.infoValue}>{application.totalExperience}</Text>
              </View>
            )}
            {application.currentJobTitle && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="business-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Current Job Title:</Text>
                <Text style={dynamicStyles.infoValue}>{application.currentJobTitle}</Text>
              </View>
            )}
            {application.currentCompanyName && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="business-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Current Company:</Text>
                <Text style={dynamicStyles.infoValue}>{application.currentCompanyName}</Text>
              </View>
            )}
            {application.currentSalary && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="cash-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Current Salary:</Text>
                <Text style={dynamicStyles.infoValue}>₹{application.currentSalary.toLocaleString('en-IN')}</Text>
              </View>
            )}
            {application.expectedSalary && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="cash-outline" size={20} color="#10B981" />
                <Text style={dynamicStyles.infoLabel}>Expected Salary:</Text>
                <Text style={dynamicStyles.infoValue}>₹{application.expectedSalary.toLocaleString('en-IN')}</Text>
              </View>
            )}
            {application.noticePeriod && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Notice Period:</Text>
                <Text style={dynamicStyles.infoValue}>{application.noticePeriod}</Text>
              </View>
            )}
          </View>

          {/* Education */}
          {application.education && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Education</Text>
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="school-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Education:</Text>
                <Text style={dynamicStyles.infoValue}>{application.education}</Text>
              </View>
              {application.course && (
                <View style={dynamicStyles.infoRow}>
                  <Ionicons name="book-outline" size={20} color="#4A90E2" />
                  <Text style={dynamicStyles.infoLabel}>Course:</Text>
                  <Text style={dynamicStyles.infoValue}>{application.course}</Text>
                </View>
              )}
            </View>
          )}

          {/* Skills */}
          {application.skills && application.skills.length > 0 && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Skills</Text>
              <View style={dynamicStyles.skillsContainer}>
                {(typeof application.skills === 'string' ? application.skills.split(',') : application.skills).map((skill, index) => (
                  <View key={index} style={dynamicStyles.skillBadge}>
                    <Text style={dynamicStyles.skillText}>{skill.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Location */}
          {(application.currentCity || application.currentState) && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Location</Text>
              {application.currentCity && (
                <View style={dynamicStyles.infoRow}>
                  <Ionicons name="location-outline" size={20} color="#4A90E2" />
                  <Text style={dynamicStyles.infoLabel}>City:</Text>
                  <Text style={dynamicStyles.infoValue}>{application.currentCity}</Text>
                </View>
              )}
              {application.currentState && (
                <View style={dynamicStyles.infoRow}>
                  <Ionicons name="map-outline" size={20} color="#4A90E2" />
                  <Text style={dynamicStyles.infoLabel}>State:</Text>
                  <Text style={dynamicStyles.infoValue}>{application.currentState}</Text>
                </View>
              )}
            </View>
          )}

          {/* Cover Letter */}
          {application.coverLetter && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Cover Letter</Text>
              <Text style={dynamicStyles.coverLetter}>{application.coverLetter}</Text>
            </View>
          )}

          {/* Resume */}
          {application.resumeUrl && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Resume</Text>
              <TouchableOpacity
                style={dynamicStyles.resumeButton}
                onPress={() => Alert.alert('Resume', 'Resume download functionality would open here')}
              >
                <Ionicons name="document-text-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.resumeButtonText}>View Resume</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Application Metadata */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Application Metadata</Text>
            <View style={dynamicStyles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
              <Text style={dynamicStyles.infoLabel}>Applied On:</Text>
              <Text style={dynamicStyles.infoValue}>{formatDate(application.createdAt || application.appliedAt)}</Text>
            </View>
            {application.updatedAt && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="refresh-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Last Updated:</Text>
                <Text style={dynamicStyles.infoValue}>{formatDate(application.updatedAt)}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: isMobile ? 12 : isTablet ? 16 : 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? 16 : isTablet ? 18 : 20,
  },
  errorText: {
    fontSize: isMobile ? 16 : isTablet ? 17 : 18,
    color: '#E74C3C',
    marginTop: 15,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: isMobile ? 16 : isTablet ? 18 : 20,
    paddingVertical: isMobile ? 8 : isTablet ? 9 : 10,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#357ABD',
        transform: 'translateY(-1px)',
      },
    }),
  },
  backButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isMobile ? 6 : 8,
  },
  backBtnText: {
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 14 : isTablet ? 17 : 20,
    marginBottom: isMobile ? 12 : isTablet ? 14 : 15,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  sectionTitle: {
    fontSize: isMobile ? 16 : isTablet ? 17 : 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: isMobile ? 12 : isTablet ? 14 : 15,
  },
  candidateHeader: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'flex-start',
    gap: isMobile ? 12 : 0,
  },
  candidateName: {
    fontSize: isMobile ? 20 : isTablet ? 22 : 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  candidateEmail: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 5 : 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: isMobile ? 11 : isTablet ? 11.5 : 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isMobile ? 8 : 10,
  },
  statusActionButton: {
    paddingHorizontal: isMobile ? 12 : isTablet ? 14 : 16,
    paddingVertical: isMobile ? 8 : isTablet ? 9 : 10,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E8ECF1',
      },
    }),
  },
  statusActionButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  statusActionText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusActionTextActive: {
    color: '#FFF',
  },
  infoRow: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? 10 : 12,
    gap: isMobile ? 4 : 10,
  },
  infoLabel: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#666',
    fontWeight: '600',
    minWidth: isMobile ? '100%' : 140,
  },
  infoValue: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#333',
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isMobile ? 8 : 10,
  },
  skillBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 5 : 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  skillText: {
    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
    color: '#4A90E2',
    fontWeight: '600',
  },
  coverLetter: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#555',
    lineHeight: isMobile ? 20 : 22,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? 6 : 8,
    paddingVertical: isMobile ? 10 : isTablet ? 11 : 12,
    paddingHorizontal: isMobile ? 16 : isTablet ? 18 : 20,
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#DBEAFE',
        transform: 'translateY(-1px)',
      },
    }),
  },
  resumeButtonText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({});

export default AdminApplicationDetailsScreen;

