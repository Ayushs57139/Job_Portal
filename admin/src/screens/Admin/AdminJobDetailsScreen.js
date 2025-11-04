import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminJobDetailsScreen = ({ route, navigation }) => {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading job details...</Text>
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
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#E74C3C" />
          <Text style={styles.errorText}>Job not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
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
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#4A90E2" />
              <Text style={styles.backBtnText}>Back to Jobs</Text>
            </TouchableOpacity>
          </View>

          {/* Job Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.jobTitle}>{jobTitle}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {job.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>

          {/* Company Info */}
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#4A90E2" />
              <Text style={styles.infoLabel}>Company:</Text>
              <Text style={styles.infoValue}>{companyName}</Text>
            </View>
            {job.company?.type && (
              <View style={styles.infoRow}>
                <Ionicons name="briefcase-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Company Type:</Text>
                <Text style={styles.infoValue}>{job.company.type}</Text>
              </View>
            )}
          </View>

          {/* Key Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Information</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#4A90E2" />
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{formatLocation(job.location)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={20} color="#4A90E2" />
              <Text style={styles.infoLabel}>Experience:</Text>
              <Text style={styles.infoValue}>{formatExperience(job.totalExperience)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color="#4A90E2" />
              <Text style={styles.infoLabel}>Salary:</Text>
              <Text style={styles.infoValue}>{formatSalary(job.salary)}</Text>
            </View>

            {job.numberOfVacancy && (
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Vacancies:</Text>
                <Text style={styles.infoValue}>{job.numberOfVacancy}</Text>
              </View>
            )}

            {job.employmentType && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Employment Type:</Text>
                <Text style={styles.infoValue}>{job.employmentType}</Text>
              </View>
            )}

            {job.jobType && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Job Type:</Text>
                <Text style={styles.infoValue}>{job.jobType}</Text>
              </View>
            )}

            {job.jobModeType && (
              <View style={styles.infoRow}>
                <Ionicons name="laptop-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Work Mode:</Text>
                <Text style={styles.infoValue}>{job.jobModeType}</Text>
              </View>
            )}

            {job.jobShiftType && (
              <View style={styles.infoRow}>
                <Ionicons name="partly-sunny-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Shift:</Text>
                <Text style={styles.infoValue}>{job.jobShiftType}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {job.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Job Description</Text>
              <Text style={styles.description}>{job.description}</Text>
            </View>
          )}

          {/* Key Skills */}
          {job.keySkills && job.keySkills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Skills</Text>
              <View style={styles.skillsContainer}>
                {job.keySkills.map((skill, index) => (
                  <View key={index} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Additional Benefits */}
          {job.additionalBenefits && job.additionalBenefits.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Benefits</Text>
              <View style={styles.benefitsList}>
                {job.additionalBenefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* HR Contact */}
          {job.hrContact && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>HR Contact Information</Text>
              {job.hrContact.name && (
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color="#4A90E2" />
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{job.hrContact.name}</Text>
                </View>
              )}
              {job.hrContact.email && (
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color="#4A90E2" />
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{job.hrContact.email}</Text>
                </View>
              )}
              {job.hrContact.number && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#4A90E2" />
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <Text style={styles.infoValue}>{job.hrContact.number}</Text>
                </View>
              )}
            </View>
          )}

          {/* Metadata */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Metadata</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
              <Text style={styles.infoLabel}>Posted:</Text>
              <Text style={styles.infoValue}>{formatDate(job.createdAt)}</Text>
            </View>
            {job.updatedAt && (
              <View style={styles.infoRow}>
                <Ionicons name="refresh-outline" size={20} color="#4A90E2" />
                <Text style={styles.infoLabel}>Last Updated:</Text>
                <Text style={styles.infoValue}>{formatDate(job.updatedAt)}</Text>
              </View>
            )}
            {job.featured && (
              <View style={styles.infoRow}>
                <Ionicons name="star-outline" size={20} color="#F59E0B" />
                <Text style={styles.infoLabel}>Featured Job</Text>
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
    fontSize: 14,
    color: '#555',
  },
});

export default AdminJobDetailsScreen;

