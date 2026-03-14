import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import AdminLayout from '../../components/Admin/AdminLayout';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { DropdownField, MultiSelectField, AutoCompleteField } from '../../components/FormFields';
import CandidateLabelManager from '../../components/CandidateLabelManager';
import CandidateLabels from '../../components/CandidateLabels';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';
import {
  jobTitleOptions,
  companyTypeOptions,
  genderOptions,
  jobModeOptions,
  employmentTypeOptions,
  jobTypeOptions,
  languageOptions,
} from '../../data/jobPostFormConfig';
import { INDUSTRIES_DATA } from '../../data/industriesData';
import { DEPARTMENTS_DATA } from '../../data/departmentsData';
import { EDUCATION_LEVEL_OPTIONS } from '../../data/educationData';

const AdminEditCandidateScreen = ({ route, navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const { candidateId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      whatsappNumber: '',
      gender: '',
      dateOfBirth: '',
      currentCity: '',
      pincode: '',
      category: '',
      maritalStatus: ''
    },
    professional: {
      currentJobTitle: '',
      currentCompany: '',
      experienceLevel: '',
      totalExperience: '',
      currentSalary: '',
      industry: '',
      department: '',
      keySkills: [],
      preferredLanguage: [],
      englishFluencyLevel: '',
      companyType: ''
    },
    education: [],
    preferences: {
      jobTypePreference: '',
      employmentType: '',
      workMode: '',
      expectedSalary: '',
      noticePeriod: '',
      willingToRelocate: false,
      preferredLocations: []
    },
    labels: []
  });

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
        setFormData({
          personalInfo: {
            fullName: data.profile.personalInfo?.fullName || '',
            email: data.profile.personalInfo?.email || '',
            phone: data.profile.personalInfo?.phone || '',
            whatsappNumber: data.profile.personalInfo?.whatsappNumber || '',
            gender: data.profile.personalInfo?.gender || '',
            dateOfBirth: data.profile.personalInfo?.dateOfBirth || '',
            currentCity: data.profile.personalInfo?.currentCity || '',
            pincode: data.profile.personalInfo?.pincode || '',
            category: data.profile.personalInfo?.category || '',
            maritalStatus: data.profile.personalInfo?.maritalStatus || ''
          },
          professional: {
            currentJobTitle: data.profile.professional?.currentJobTitle || '',
            currentCompany: data.profile.professional?.currentCompany || '',
            experienceLevel: data.profile.professional?.experienceLevel || '',
            totalExperience: data.profile.professional?.totalExperience || '',
            currentSalary: data.profile.professional?.currentSalary || '',
            industry: data.profile.professional?.industry || '',
            department: data.profile.professional?.department || '',
            keySkills: data.profile.professional?.keySkills || [],
            preferredLanguage: data.profile.professional?.preferredLanguage || [],
            englishFluencyLevel: data.profile.professional?.englishFluencyLevel || '',
            companyType: data.profile.professional?.companyType || ''
          },
          education: data.profile.education || [],
          preferences: {
            jobTypePreference: data.profile.preferences?.jobTypePreference || '',
            employmentType: data.profile.preferences?.employmentType || '',
            workMode: data.profile.preferences?.workMode || '',
            expectedSalary: data.profile.preferences?.expectedSalary || '',
            noticePeriod: data.profile.preferences?.noticePeriod || '',
            willingToRelocate: data.profile.preferences?.willingToRelocate || false,
            preferredLocations: data.profile.preferences?.preferredLocations || []
          },
          labels: data.profile.labels || []
        });
        
        if (data.profile.profileImage) {
          setProfileImage(data.profile.profileImage);
        }
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('adminToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const response = await fetch(`${API_URL}/admin/candidates/${candidateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Candidate details updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to update candidate details');
      }
    } catch (error) {
      console.error('Update candidate error:', error);
      Alert.alert('Error', 'Failed to update candidate details');
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfileImage = async (image) => {
    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('adminToken');
      
      const formData = new FormData();
      formData.append('profileImage', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'profile.jpg'
      });

      const response = await fetch(`${API_URL}/admin/candidates/${candidateId}/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfileImage(data.imageUrl);
        Alert.alert('Success', 'Profile image uploaded successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload image error:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handlePickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });

      if (result.type === 'success') {
        await uploadResume(result);
      }
    } catch (error) {
      console.error('Pick resume error:', error);
      Alert.alert('Error', 'Failed to pick resume');
    }
  };

  const uploadResume = async (file) => {
    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('adminToken');
      
      const formData = new FormData();
      formData.append('resume', {
        uri: file.uri,
        type: file.mimeType,
        name: file.name
      });

      const response = await fetch(`${API_URL}/admin/candidates/${candidateId}/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResumeFile(data.resumeUrl);
        Alert.alert('Success', 'Resume uploaded successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Upload resume error:', error);
      Alert.alert('Error', 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleLoginAsUser = async () => {
    Alert.alert(
      'Login as User',
      'Are you sure you want to login as this user? You will be logged out from admin panel.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Login',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('adminToken');
              
              const response = await fetch(`${API_URL}/admin/login-as-user/${candidateId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              const data = await response.json();

              if (response.ok && data.success) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                await AsyncStorage.removeItem('adminToken');
                
                Alert.alert('Success', 'Logged in as user successfully');
                navigation.replace('UserDashboard');
              } else {
                Alert.alert('Error', data.message || 'Failed to login as user');
              }
            } catch (error) {
              console.error('Login as user error:', error);
              Alert.alert('Error', 'Failed to login as user');
            }
          }
        }
      ]
    );
  };

  const updateField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const renderPersonalInfo = () => (
    <View style={dynamicStyles.section}>
      <Text style={dynamicStyles.sectionTitle}>Personal Information</Text>
      
      <Input
        label="Full Name"
        value={formData.personalInfo.fullName}
        onChangeText={(value) => updateField('personalInfo', 'fullName', value)}
        placeholder="Enter full name"
      />
      
      <Input
        label="Email"
        value={formData.personalInfo.email}
        onChangeText={(value) => updateField('personalInfo', 'email', value)}
        placeholder="Enter email"
        keyboardType="email-address"
      />
      
      <Input
        label="Phone"
        value={formData.personalInfo.phone}
        onChangeText={(value) => updateField('personalInfo', 'phone', value)}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
      />
      
      <Input
        label="WhatsApp Number"
        value={formData.personalInfo.whatsappNumber}
        onChangeText={(value) => updateField('personalInfo', 'whatsappNumber', value)}
        placeholder="Enter WhatsApp number"
        keyboardType="phone-pad"
      />
      
      <DropdownField
        label="Gender"
        value={formData.personalInfo.gender}
        onValueChange={(value) => updateField('personalInfo', 'gender', value)}
        options={genderOptions}
        placeholder="Select gender"
      />
      
      <Input
        label="Date of Birth"
        value={formData.personalInfo.dateOfBirth}
        onChangeText={(value) => updateField('personalInfo', 'dateOfBirth', value)}
        placeholder="YYYY-MM-DD"
      />
      
      <Input
        label="Current City"
        value={formData.personalInfo.currentCity}
        onChangeText={(value) => updateField('personalInfo', 'currentCity', value)}
        placeholder="Enter current city"
      />
      
      <Input
        label="Pincode"
        value={formData.personalInfo.pincode}
        onChangeText={(value) => updateField('personalInfo', 'pincode', value)}
        placeholder="Enter pincode"
        keyboardType="numeric"
      />
    </View>
  );

  const renderProfessionalInfo = () => (
    <View style={dynamicStyles.section}>
      <Text style={dynamicStyles.sectionTitle}>Professional Information</Text>
      
      <AutoCompleteField
        label="Current Job Title"
        value={formData.professional.currentJobTitle}
        onValueChange={(value) => updateField('professional', 'currentJobTitle', value)}
        options={jobTitleOptions}
        placeholder="Enter job title"
      />
      
      <Input
        label="Current Company"
        value={formData.professional.currentCompany}
        onChangeText={(value) => updateField('professional', 'currentCompany', value)}
        placeholder="Enter company name"
      />
      
      <Input
        label="Total Experience (years)"
        value={formData.professional.totalExperience?.toString()}
        onChangeText={(value) => updateField('professional', 'totalExperience', value)}
        placeholder="Enter experience"
        keyboardType="numeric"
      />
      
      <Input
        label="Current Salary"
        value={formData.professional.currentSalary?.toString()}
        onChangeText={(value) => updateField('professional', 'currentSalary', value)}
        placeholder="Enter current salary"
        keyboardType="numeric"
      />
      
      <DropdownField
        label="Industry"
        value={formData.professional.industry}
        onValueChange={(value) => updateField('professional', 'industry', value)}
        options={INDUSTRIES_DATA.map(ind => ({ value: ind.industry, label: ind.industry }))}
        placeholder="Select industry"
      />
      
      <DropdownField
        label="Department"
        value={formData.professional.department}
        onValueChange={(value) => updateField('professional', 'department', value)}
        options={DEPARTMENTS_DATA.map(dept => ({ value: dept.department, label: dept.department }))}
        placeholder="Select department"
      />
      
      <MultiSelectField
        label="Key Skills"
        value={formData.professional.keySkills}
        onValueChange={(value) => updateField('professional', 'keySkills', value)}
        options={[]}
        placeholder="Add skills"
        allowCustom={true}
      />
      
      <MultiSelectField
        label="Preferred Languages"
        value={formData.professional.preferredLanguage}
        onValueChange={(value) => updateField('professional', 'preferredLanguage', value)}
        options={languageOptions}
        placeholder="Select languages"
      />
    </View>
  );

  const renderPreferences = () => (
    <View style={dynamicStyles.section}>
      <Text style={dynamicStyles.sectionTitle}>Job Preferences</Text>
      
      <DropdownField
        label="Job Type"
        value={formData.preferences.jobTypePreference}
        onValueChange={(value) => updateField('preferences', 'jobTypePreference', value)}
        options={jobTypeOptions}
        placeholder="Select job type"
      />
      
      <DropdownField
        label="Employment Type"
        value={formData.preferences.employmentType}
        onValueChange={(value) => updateField('preferences', 'employmentType', value)}
        options={employmentTypeOptions}
        placeholder="Select employment type"
      />
      
      <DropdownField
        label="Work Mode"
        value={formData.preferences.workMode}
        onValueChange={(value) => updateField('preferences', 'workMode', value)}
        options={jobModeOptions}
        placeholder="Select work mode"
      />
      
      <Input
        label="Expected Salary"
        value={formData.preferences.expectedSalary?.toString()}
        onChangeText={(value) => updateField('preferences', 'expectedSalary', value)}
        placeholder="Enter expected salary"
        keyboardType="numeric"
      />
      
      <Input
        label="Notice Period"
        value={formData.preferences.noticePeriod}
        onChangeText={(value) => updateField('preferences', 'noticePeriod', value)}
        placeholder="e.g., 30 Days"
      />
    </View>
  );

  if (loading) {
    return (
      <AdminLayout navigation={navigation} title="Edit Candidate">
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={dynamicStyles.loadingText}>Loading candidate details...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout navigation={navigation} title="Edit Candidate">
      <ScrollView style={dynamicStyles.container}>
        {/* Header Card */}
        <View style={dynamicStyles.headerCard}>
          <View style={dynamicStyles.profileSection}>
            <TouchableOpacity onPress={handlePickImage} style={dynamicStyles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={dynamicStyles.profileImage} />
              ) : (
                <View style={dynamicStyles.profileImagePlaceholder}>
                  <Ionicons name="person" size={48} color="#007bff" />
                </View>
              )}
              <View style={dynamicStyles.editImageBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <View style={dynamicStyles.profileInfo}>
              <Text style={dynamicStyles.candidateName}>
                {formData.personalInfo.fullName || 'Not specified'}
              </Text>
              <Text style={dynamicStyles.candidateEmail}>
                {formData.personalInfo.email || 'Not specified'}
              </Text>
              
              {formData.labels.length > 0 && (
                <View style={dynamicStyles.labelsSection}>
                  <CandidateLabels labels={formData.labels} />
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={dynamicStyles.actionButtons}>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => setShowLabelManager(true)}
            >
              <Ionicons name="pricetag" size={20} color="#007bff" />
              <Text style={dynamicStyles.actionButtonText}>Manage Labels</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[dynamicStyles.actionButton, { backgroundColor: '#28a745' }]}
              onPress={handleLoginAsUser}
            >
              <Ionicons name="log-in" size={20} color="#fff" />
              <Text style={[dynamicStyles.actionButtonText, { color: '#fff' }]}>Login as User</Text>
            </TouchableOpacity>
          </View>

          {/* Upload Buttons */}
          <View style={dynamicStyles.uploadButtons}>
            <TouchableOpacity
              style={dynamicStyles.uploadButton}
              onPress={handlePickResume}
              disabled={uploading}
            >
              <Ionicons name="document-text" size={20} color="#007bff" />
              <Text style={dynamicStyles.uploadButtonText}>
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={dynamicStyles.tabs}>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'personal' && dynamicStyles.activeTab]}
            onPress={() => setActiveTab('personal')}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'personal' && dynamicStyles.activeTabText]}>
              Personal
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'professional' && dynamicStyles.activeTab]}
            onPress={() => setActiveTab('professional')}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'professional' && dynamicStyles.activeTabText]}>
              Professional
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'preferences' && dynamicStyles.activeTab]}
            onPress={() => setActiveTab('preferences')}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'preferences' && dynamicStyles.activeTabText]}>
              Preferences
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        {activeTab === 'personal' && renderPersonalInfo()}
        {activeTab === 'professional' && renderProfessionalInfo()}
        {activeTab === 'preferences' && renderPreferences()}

        {/* Save Button */}
        <View style={dynamicStyles.saveButtonContainer}>
          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={saving}
          />
        </View>
      </ScrollView>

      {/* Label Manager Modal */}
      <CandidateLabelManager
        candidateId={candidateId}
        currentLabels={formData.labels}
        onLabelsUpdate={(labels) => setFormData(prev => ({ ...prev, labels }))}
        visible={showLabelManager}
        onClose={() => setShowLabelManager(false)}
      />
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
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
  headerCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  profileSection: {
    flexDirection: 'row',
    marginBottom: 20
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e7f3ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007bff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  candidateName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  candidateEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8
  },
  labelsSection: {
    marginTop: 8
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e7f3ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#007bff'
  },
  actionButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600'
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#007bff'
  },
  uploadButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600'
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#007bff'
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  saveButtonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20
  }
});

export default AdminEditCandidateScreen;
