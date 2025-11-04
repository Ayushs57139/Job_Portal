import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminApplicationDetailsScreen = ({ route, navigation }) => {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading application details...</Text>
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
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#E74C3C" />
          <Text style={styles.errorText}>Application not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
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
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#4A90E2" />
              <Text style={styles.backBtnText}>Back to Applications</Text>
            </TouchableOpacity>
          </View>

          {/* Candidate Info Section */}
          <View style={styles.section}>
            <View style={styles.candidateHeader}>
              <View>
                <Text style={styles.candidateName}>
                  {application.fullName || application.candidateName || application.candidate?.name || 'N/A'}
                </Text>
                <Text style={styles.candidateEmail}>
                  {application.email || application.candidate?.email || 'N/A'}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusText, { color: statusColors.text }]}>
                  {application.status?.toLowerCase() || 'pending'}
                </Text>
              </View>
            </View>
          </View>

          {/* Status Update Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Application Status</Text>
            <View style={styles.statusActions}>
              {['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusActionButton,
                    application.status?.toLowerCase() === status && styles.statusActionButtonActive
                  ]}
                  onPress={() => updateStatus(status)}
                >
                  <Text style={[
                    styles.statusActionText,
                    application.status?.toLowerCase() === status && styles.statusActionTextActive
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Job Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Information</Text>
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={20} color="#4A90E2" />
              <Text style={styles.infoLabel}>Job Title:</Text>
              <Text style={styles.infoValue}>
                {application.jobTitle || application.job?.title || 'N/A'}
              </Text>
            </View>
            {application.job?.company?.name && (
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Company:</Text>
                <Text style={styles.infoValue}>{application.job.company.name}</Text>
              </View>
            )}
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {application.mobileNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Mobile:</Text>
                <Text style={styles.infoValue}>{application.mobileNumber}</Text>
              </View>
            )}
            {application.whatsappNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={styles.infoLabel}>WhatsApp:</Text>
                <Text style={styles.infoValue}>{application.whatsappNumber}</Text>
              </View>
            )}
            {application.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{application.email}</Text>
              </View>
            )}
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {application.gender && (
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Gender:</Text>
                <Text style={styles.infoValue}>{application.gender}</Text>
              </View>
            )}
            {application.dateOfBirth && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Date of Birth:</Text>
                <Text style={styles.infoValue}>{formatDate(application.dateOfBirth)}</Text>
              </View>
            )}
            {application.maritalStatus && (
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Marital Status:</Text>
                <Text style={styles.infoValue}>{application.maritalStatus}</Text>
              </View>
            )}
          </View>

          {/* Professional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            {application.totalExperience && (
              <View style={styles.infoRow}>
                <Ionicons name="briefcase-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Total Experience:</Text>
                <Text style={styles.infoValue}>{application.totalExperience}</Text>
              </View>
            )}
            {application.currentJobTitle && (
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Current Job Title:</Text>
                <Text style={styles.infoValue}>{application.currentJobTitle}</Text>
              </View>
            )}
            {application.currentCompanyName && (
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Current Company:</Text>
                <Text style={styles.infoValue}>{application.currentCompanyName}</Text>
              </View>
            )}
            {application.currentSalary && (
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Current Salary:</Text>
                <Text style={styles.infoValue}>₹{application.currentSalary.toLocaleString('en-IN')}</Text>
              </View>
            )}
            {application.expectedSalary && (
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={20} color="#10B981" />
                <Text style={styles.infoLabel}>Expected Salary:</Text>
                <Text style={styles.infoValue}>₹{application.expectedSalary.toLocaleString('en-IN')}</Text>
              </View>
            )}
            {application.noticePeriod && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Notice Period:</Text>
                <Text style={styles.infoValue}>{application.noticePeriod}</Text>
              </View>
            )}
          </View>

          {/* Education */}
          {application.education && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              <View style={styles.infoRow}>
                <Ionicons name="school-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Education:</Text>
                <Text style={styles.infoValue}>{application.education}</Text>
              </View>
              {application.course && (
                <View style={styles.infoRow}>
                  <Ionicons name="book-outline" size={20} color="#4A90E2" />
                  <Text style={styles.infoLabel}>Course:</Text>
                  <Text style={styles.infoValue}>{application.course}</Text>
                </View>
              )}
            </View>
          )}

          {/* Skills */}
          {application.skills && application.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {(typeof application.skills === 'string' ? application.skills.split(',') : application.skills).map((skill, index) => (
                  <View key={index} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Location */}
          {(application.currentCity || application.currentState) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              {application.currentCity && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color="#4A90E2" />
                  <Text style={styles.infoLabel}>City:</Text>
                  <Text style={styles.infoValue}>{application.currentCity}</Text>
                </View>
              )}
              {application.currentState && (
                <View style={styles.infoRow}>
                  <Ionicons name="map-outline" size={20} color="#4A90E2" />
                  <Text style={styles.infoLabel}>State:</Text>
                  <Text style={styles.infoValue}>{application.currentState}</Text>
                </View>
              )}
            </View>
          )}

          {/* Cover Letter */}
          {application.coverLetter && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cover Letter</Text>
              <Text style={styles.coverLetter}>{application.coverLetter}</Text>
            </View>
          )}

          {/* Resume */}
          {application.resumeUrl && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resume</Text>
              <TouchableOpacity
                style={styles.resumeButton}
                onPress={() => Alert.alert('Resume', 'Resume download functionality would open here')}
              >
                <Ionicons name="document-text-outline" size={20} color="#4A90E2" />
                <Text style={styles.resumeButtonText}>View Resume</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Application Metadata */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Application Metadata</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
              <Text style={styles.infoLabel}>Applied On:</Text>
              <Text style={styles.infoValue}>{formatDate(application.createdAt || application.appliedAt)}</Text>
            </View>
            {application.updatedAt && (
              <View style={styles.infoRow}>
                <Ionicons name="refresh-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Last Updated:</Text>
                <Text style={styles.infoValue}>{formatDate(application.updatedAt)}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    marginTop: 15,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  candidateName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  candidateEmail: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusActionButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  statusActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusActionTextActive: {
    color: '#FFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    minWidth: 140,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  skillText: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '600',
  },
  coverLetter: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  resumeButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default AdminApplicationDetailsScreen;

