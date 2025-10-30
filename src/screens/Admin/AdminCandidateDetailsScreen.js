import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import { API_URL } from '../../config/api';

const AdminCandidateDetailsScreen = ({ route, navigation }) => {
  const { candidateId } = route.params;
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    fetchCandidateDetails();
  }, [candidateId]);

  const fetchCandidateDetails = async () => {
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem('adminToken');
      if (!token) {
        Alert.alert('Error', 'Please login again');
        navigation.replace('AdminLogin');
        return;
      }

      const response = await fetch(`${API_URL}/user-profiles/${candidateId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCandidate(data.profile);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch candidate details');
      }
    } catch (error) {
      console.error('Fetch candidate details error:', error);
      Alert.alert('Error', 'Failed to fetch candidate details');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (type, value) => {
    if (type === 'email') {
      Linking.openURL(`mailto:${value}`);
    } else if (type === 'phone') {
      Linking.openURL(`tel:${value}`);
    } else if (type === 'whatsapp') {
      Linking.openURL(`https://wa.me/${value}`);
    }
  };

  const renderSection = (title, content) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {content}
      </View>
    </View>
  );

  const renderDetailRow = (label, value, icon = null) => (
    <View style={styles.detailRow}>
      {icon && <Ionicons name={icon} size={20} color="#666" style={styles.detailIcon} />}
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'Not specified'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <AdminLayout navigation={navigation} title="Candidate Details">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading candidate details...</Text>
        </View>
      </AdminLayout>
    );
  }

  if (!candidate) {
    return (
      <AdminLayout navigation={navigation} title="Candidate Details">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#dc3545" />
          <Text style={styles.errorText}>Candidate not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout navigation={navigation} title="Candidate Details">
      <ScrollView style={styles.container}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.profileImageContainer}>
              <Ionicons name="person" size={48} color="#007bff" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.candidateName}>
                {candidate.personalInfo?.fullName || 'Not specified'}
              </Text>
              <Text style={styles.candidateRole}>
                {candidate.professional?.currentJobTitle || 'Not specified'}
              </Text>
              <Text style={styles.candidateCompany}>
                {candidate.professional?.currentCompany || 'Not specified'}
              </Text>
            </View>
          </View>
          
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {candidate.personalInfo?.email && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleContact('email', candidate.personalInfo.email)}
              >
                <Ionicons name="mail" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Email</Text>
              </TouchableOpacity>
            )}
            
            {candidate.personalInfo?.phone && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleContact('phone', candidate.personalInfo.phone)}
              >
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            )}
            
            {candidate.personalInfo?.whatsappAvailable && candidate.personalInfo?.phone && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#25D366' }]}
                onPress={() => handleContact('whatsapp', candidate.personalInfo.phone)}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Personal Information */}
        {renderSection('Personal Information', (
          <>
            {renderDetailRow('Email', candidate.personalInfo?.email, 'mail-outline')}
            {renderDetailRow('Phone', candidate.personalInfo?.phone, 'call-outline')}
            {renderDetailRow('Gender', candidate.personalInfo?.gender, 'person-outline')}
            {renderDetailRow('Age', candidate.personalInfo?.age, 'calendar-outline')}
            {renderDetailRow('Current City', candidate.personalInfo?.currentCity, 'location-outline')}
            {renderDetailRow('Pincode', candidate.personalInfo?.pincode, 'location-outline')}
            {candidate.personalInfo?.category && renderDetailRow('Category', candidate.personalInfo.category)}
          </>
        ))}

        {/* Professional Information */}
        {renderSection('Professional Information', (
          <>
            {renderDetailRow('Current Job Title', candidate.professional?.currentJobTitle, 'briefcase-outline')}
            {renderDetailRow('Current Company', candidate.professional?.currentCompany, 'business-outline')}
            {renderDetailRow('Experience Level', candidate.professional?.experienceLevel)}
            {renderDetailRow('Total Experience', `${candidate.professional?.totalExperience || 0} years`, 'time-outline')}
            {renderDetailRow('Company Type', candidate.professional?.companyType)}
            {renderDetailRow('Industry', candidate.professional?.industry)}
            {renderDetailRow('Department', candidate.professional?.department)}
            {renderDetailRow('Current Salary', candidate.professional?.currentSalary ? `₹${candidate.professional.currentSalary.toLocaleString()}` : 'Not specified', 'cash-outline')}
            
            {candidate.professional?.keySkills && candidate.professional.keySkills.length > 0 && (
              <View style={styles.skillsSection}>
                <Text style={styles.detailLabel}>Key Skills</Text>
                <View style={styles.skillsContainer}>
                  {candidate.professional.keySkills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {candidate.professional?.preferredLanguage && candidate.professional.preferredLanguage.length > 0 && (
              <View style={styles.languagesSection}>
                <Text style={styles.detailLabel}>Preferred Languages</Text>
                <Text style={styles.detailValue}>
                  {candidate.professional.preferredLanguage.join(', ')}
                </Text>
              </View>
            )}
            
            {renderDetailRow('English Fluency', candidate.professional?.englishFluencyLevel)}
          </>
        ))}

        {/* Education Information */}
        {candidate.education && candidate.education.length > 0 && renderSection('Education', (
          <>
            {candidate.education.map((edu, index) => (
              <View key={index} style={styles.educationCard}>
                <Text style={styles.educationTitle}>
                  {edu.degree || edu.educationLevel || 'Education'}
                </Text>
                {edu.institution && (
                  <Text style={styles.educationInstitution}>{edu.institution}</Text>
                )}
                {edu.specialization && (
                  <Text style={styles.educationSpecialization}>{edu.specialization}</Text>
                )}
                <View style={styles.educationDetails}>
                  {edu.educationStatus && (
                    <Text style={styles.educationDetail}>Status: {edu.educationStatus}</Text>
                  )}
                  {edu.educationType && (
                    <Text style={styles.educationDetail}>Type: {edu.educationType}</Text>
                  )}
                  {(edu.startDate || edu.endDate) && (
                    <Text style={styles.educationDetail}>
                      {edu.startDate || 'N/A'} - {edu.endDate || 'N/A'}
                    </Text>
                  )}
                  {edu.marksType && edu.marksValue && (
                    <Text style={styles.educationDetail}>
                      {edu.marksType}: {edu.marksValue}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </>
        ))}

        {/* Job Preferences */}
        {renderSection('Job Preferences', (
          <>
            {renderDetailRow('Job Type', candidate.preferences?.jobTypePreference)}
            {renderDetailRow('Employment Type', candidate.preferences?.employmentType)}
            {renderDetailRow('Work Mode', candidate.preferences?.workMode)}
            {renderDetailRow('Job Mode', candidate.preferences?.jobModeType)}
            {renderDetailRow('Job Shift', candidate.preferences?.jobShiftType)}
            {renderDetailRow('Expected Salary', candidate.preferences?.expectedSalary ? `₹${candidate.preferences.expectedSalary.toLocaleString()}` : 'Not specified', 'attach-money')}
            {renderDetailRow('Notice Period', candidate.preferences?.noticePeriod, 'schedule')}
            {renderDetailRow('Willing to Relocate', candidate.preferences?.willingToRelocate ? 'Yes' : 'No')}
            
            {candidate.preferences?.preferredLocations && candidate.preferences.preferredLocations.length > 0 && (
              <View style={styles.preferredLocationsSection}>
                <Text style={styles.detailLabel}>Preferred Locations</Text>
                <Text style={styles.detailValue}>
                  {candidate.preferences.preferredLocations.join(', ')}
                </Text>
              </View>
            )}
            
            {candidate.preferences?.assetRequirements && candidate.preferences.assetRequirements.length > 0 && (
              <View style={styles.assetsSection}>
                <Text style={styles.detailLabel}>Asset Requirements</Text>
                <View style={styles.assetsContainer}>
                  {candidate.preferences.assetRequirements.map((asset, index) => (
                    <View key={index} style={styles.assetTag}>
                      <Text style={styles.assetText}>{asset}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        ))}

        {/* Certifications */}
        {candidate.professional?.certifications && candidate.professional.certifications.length > 0 && renderSection('Certifications', (
          <>
            {candidate.professional.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationCard}>
                <Text style={styles.certificationName}>{cert.name}</Text>
                {cert.issuer && (
                  <Text style={styles.certificationIssuer}>Issued by: {cert.issuer}</Text>
                )}
                {cert.date && (
                  <Text style={styles.certificationDate}>
                    Date: {new Date(cert.date).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </>
        ))}

        {/* Profile Status */}
        {renderSection('Profile Status', (
          <>
            <View style={styles.statusRow}>
              <Ionicons 
                name={candidate.profileStatus?.hasResume ? 'checkmark-circle' : 'close-circle'} 
                size={24} 
                color={candidate.profileStatus?.hasResume ? '#28a745' : '#dc3545'} 
              />
              <Text style={styles.statusText}>Resume Uploaded</Text>
            </View>
            
            <View style={styles.statusRow}>
              <Ionicons 
                name={candidate.profileStatus?.emailVerified ? 'checkmark-circle' : 'close-circle'} 
                size={24} 
                color={candidate.profileStatus?.emailVerified ? '#28a745' : '#dc3545'} 
              />
              <Text style={styles.statusText}>Email Verified</Text>
            </View>
            
            <View style={styles.statusRow}>
              <Ionicons 
                name={candidate.profileStatus?.mobileVerified ? 'checkmark-circle' : 'close-circle'} 
                size={24} 
                color={candidate.profileStatus?.mobileVerified ? '#28a745' : '#dc3545'} 
              />
              <Text style={styles.statusText}>Mobile Verified</Text>
            </View>
            
            <View style={styles.statusRow}>
              <Ionicons 
                name={candidate.profileStatus?.whatsappAvailable ? 'checkmark-circle' : 'close-circle'} 
                size={24} 
                color={candidate.profileStatus?.whatsappAvailable ? '#28a745' : '#dc3545'} 
              />
              <Text style={styles.statusText}>WhatsApp Available</Text>
            </View>
            
            <View style={styles.completionBar}>
              <View style={styles.completionBarLabel}>
                <Text style={styles.completionLabel}>Profile Completion</Text>
                <Text style={styles.completionPercentage}>
                  {candidate.profileStatus?.completionPercentage || 0}%
                </Text>
              </View>
              <View style={styles.completionBarBackground}>
                <View 
                  style={[
                    styles.completionBarFill, 
                    { width: `${candidate.profileStatus?.completionPercentage || 0}%` }
                  ]} 
                />
              </View>
            </View>
          </>
        ))}

        {/* Additional Information */}
        {candidate.additionalInfo?.bio && renderSection('About', (
          <Text style={styles.bioText}>{candidate.additionalInfo.bio}</Text>
        ))}
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center'
  },
  backButton: {
    marginTop: 24,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 20
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e7f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  candidateName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  candidateRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2
  },
  candidateCompany: {
    fontSize: 16,
    color: '#007bff'
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  sectionContent: {
    gap: 12
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  detailIcon: {
    marginRight: 12,
    marginTop: 2
  },
  detailContent: {
    flex: 1
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  detailValue: {
    fontSize: 16,
    color: '#333'
  },
  skillsSection: {
    marginTop: 8
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  skillTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  skillText: {
    fontSize: 12,
    color: '#495057'
  },
  languagesSection: {
    marginTop: 8
  },
  educationCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  educationInstitution: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 2
  },
  educationSpecialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  educationDetails: {
    gap: 4
  },
  educationDetail: {
    fontSize: 12,
    color: '#666'
  },
  preferredLocationsSection: {
    marginTop: 8
  },
  assetsSection: {
    marginTop: 8
  },
  assetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  assetTag: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffc107'
  },
  assetText: {
    fontSize: 12,
    color: '#856404'
  },
  certificationCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  certificationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  certificationIssuer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  certificationDate: {
    fontSize: 12,
    color: '#999'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  statusText: {
    fontSize: 14,
    color: '#333'
  },
  completionBar: {
    marginTop: 12
  },
  completionBarLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  completionLabel: {
    fontSize: 14,
    color: '#666'
  },
  completionPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745'
  },
  completionBarBackground: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden'
  },
  completionBarFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  }
});

export default AdminCandidateDetailsScreen;

