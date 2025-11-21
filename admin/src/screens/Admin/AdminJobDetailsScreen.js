import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminJobDetailsScreen = ({ route, navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const { jobId } = route.params;
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Fetching job:', `${API_URL}/jobs/${jobId}`);
      const response = await fetch(`${API_URL}/jobs/${jobId}`, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        setJob(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Job data received:', data);
      setJob(data.job || data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      Alert.alert('Error', 'Failed to fetch job details: ' + error.message);
      setJob(null);
    } finally {
      setLoading(false);
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

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
    if (salary.min && salary.max) {
      return `₹${salary.min.toLocaleString('en-IN')} - ₹${salary.max.toLocaleString('en-IN')} ${salary.currency || 'INR'}`;
    }
    if (salary.min) return `From ₹${salary.min.toLocaleString('en-IN')}`;
    if (salary.max) return `Up to ₹${salary.max.toLocaleString('en-IN')}`;
    return 'Not disclosed';
  };

  const formatExperience = (totalExp) => {
    if (!totalExp) return 'Not specified';
    if (totalExp.min && totalExp.max) {
      return `${totalExp.min} - ${totalExp.max}`;
    }
    if (totalExp.min) return `From ${totalExp.min}`;
    if (totalExp.max) return `Up to ${totalExp.max}`;
    return 'Not specified';
  };

  const formatLocation = (location) => {
    if (!location) return 'Not specified';
    if (typeof location === 'string') return location;
    const parts = [];
    if (location.locality) parts.push(location.locality);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  };

  if (loading) {
    return (
      <AdminLayout
        title="Job Details"
        activeScreen="AdminJobs"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={dynamicStyles.loadingText}>Loading job details...</Text>
        </View>
      </AdminLayout>
    );
  }

  if (!job) {
    return (
      <AdminLayout
        title="Job Details"
        activeScreen="AdminJobs"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={isMobile ? 48 : isTablet ? 56 : 64} color="#E74C3C" />
          <Text style={dynamicStyles.errorText}>Job not found</Text>
          <TouchableOpacity style={dynamicStyles.backButton} onPress={handleBack}>
            <Text style={dynamicStyles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </AdminLayout>
    );
  }

  const companyName = job.company?.name || job.companyName || 'N/A';
  const jobTitle = job.title || job.jobTitle || 'Untitled Job';

  return (
    <AdminLayout
      title="Job Details"
      activeScreen="AdminJobs"
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
              <Text style={dynamicStyles.backBtnText}>Back to Jobs</Text>
            </TouchableOpacity>
          </View>

          {/* Job Title Section */}
          <View style={dynamicStyles.titleSection}>
            <Text style={dynamicStyles.jobTitle}>{jobTitle}</Text>
            <View style={dynamicStyles.statusBadge}>
              <Text style={dynamicStyles.statusText}>
                {job.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>

          {/* Company Info */}
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#4A90E2" />
              <Text style={dynamicStyles.infoLabel}>Company:</Text>
              <Text style={dynamicStyles.infoValue}>{companyName}</Text>
            </View>
            {job.company?.type && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="briefcase-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Company Type:</Text>
                <Text style={dynamicStyles.infoValue}>{job.company.type}</Text>
              </View>
            )}
          </View>

          {/* Key Information */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Key Information</Text>
            
            <View style={dynamicStyles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#4A90E2" />
              <Text style={dynamicStyles.infoLabel}>Location:</Text>
              <Text style={dynamicStyles.infoValue}>{formatLocation(job.location)}</Text>
            </View>

            <View style={dynamicStyles.infoRow}>
              <Ionicons name="briefcase-outline" size={20} color="#4A90E2" />
              <Text style={dynamicStyles.infoLabel}>Experience:</Text>
              <Text style={dynamicStyles.infoValue}>{formatExperience(job.totalExperience)}</Text>
            </View>

            <View style={dynamicStyles.infoRow}>
              <Ionicons name="cash-outline" size={20} color="#4A90E2" />
              <Text style={dynamicStyles.infoLabel}>Salary:</Text>
              <Text style={dynamicStyles.infoValue}>{formatSalary(job.salary)}</Text>
            </View>

            {job.numberOfVacancy && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="people-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Vacancies:</Text>
                <Text style={dynamicStyles.infoValue}>{job.numberOfVacancy}</Text>
              </View>
            )}

            {job.employmentType && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Employment Type:</Text>
                <Text style={dynamicStyles.infoValue}>{job.employmentType}</Text>
              </View>
            )}

            {job.jobType && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Job Type:</Text>
                <Text style={dynamicStyles.infoValue}>{job.jobType}</Text>
              </View>
            )}

            {job.jobModeType && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="laptop-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Work Mode:</Text>
                <Text style={dynamicStyles.infoValue}>{job.jobModeType}</Text>
              </View>
            )}

            {job.jobShiftType && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="partly-sunny-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Shift:</Text>
                <Text style={dynamicStyles.infoValue}>{job.jobShiftType}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {job.description && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Job Description</Text>
              <Text style={dynamicStyles.description}>{job.description}</Text>
            </View>
          )}

          {/* Key Skills */}
          {job.keySkills && job.keySkills.length > 0 && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Key Skills</Text>
              <View style={dynamicStyles.skillsContainer}>
                {job.keySkills.map((skill, index) => (
                  <View key={index} style={dynamicStyles.skillBadge}>
                    <Text style={dynamicStyles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Additional Benefits */}
          {job.additionalBenefits && job.additionalBenefits.length > 0 && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Additional Benefits</Text>
              <View style={dynamicStyles.benefitsList}>
                {job.additionalBenefits.map((benefit, index) => (
                  <View key={index} style={dynamicStyles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={dynamicStyles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* HR Contact */}
          {job.hrContact && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>HR Contact Information</Text>
              {job.hrContact.name && (
                <View style={dynamicStyles.infoRow}>
                  <Ionicons name="person-outline" size={20} color="#4A90E2" />
                  <Text style={dynamicStyles.infoLabel}>Name:</Text>
                  <Text style={dynamicStyles.infoValue}>{job.hrContact.name}</Text>
                </View>
              )}
              {job.hrContact.email && (
                <View style={dynamicStyles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color="#4A90E2" />
                  <Text style={dynamicStyles.infoLabel}>Email:</Text>
                  <Text style={dynamicStyles.infoValue}>{job.hrContact.email}</Text>
                </View>
              )}
              {job.hrContact.number && (
                <View style={dynamicStyles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#4A90E2" />
                  <Text style={dynamicStyles.infoLabel}>Phone:</Text>
                  <Text style={dynamicStyles.infoValue}>{job.hrContact.number}</Text>
                </View>
              )}
            </View>
          )}

          {/* Metadata */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Job Metadata</Text>
            <View style={dynamicStyles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
              <Text style={dynamicStyles.infoLabel}>Posted:</Text>
              <Text style={dynamicStyles.infoValue}>{formatDate(job.createdAt)}</Text>
            </View>
            {job.updatedAt && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="refresh-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.infoLabel}>Last Updated:</Text>
                <Text style={dynamicStyles.infoValue}>{formatDate(job.updatedAt)}</Text>
              </View>
            )}
            {job.featured && (
              <View style={dynamicStyles.infoRow}>
                <Ionicons name="star-outline" size={20} color="#F59E0B" />
                <Text style={dynamicStyles.infoLabel}>Featured Job</Text>
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
    gap: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  titleSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
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
    minWidth: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
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
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#555',
  },
});

const styles = StyleSheet.create({});

export default AdminJobDetailsScreen;

