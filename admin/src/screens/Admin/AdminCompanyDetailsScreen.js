import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Image, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminCompanyDetailsScreen = ({ navigation, route }) => {
  const { companyId, mode = 'view' } = route.params;
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(mode === 'edit');
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    contactPerson: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    website: '',
    industry: '',
    sectors: [],
    departments: [],
    designation: '',
    description: '',
    foundedYear: '',
    companySize: '',
    profilePhoto: null,
    coverPhoto: null,
  });
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/companies/${companyId}`, { headers });
      const data = await response.json();
      
      setCompany(data.company);
      setFormData({
        companyName: data.company.companyName || '',
        email: data.company.email || '',
        phone: data.company.phone || '',
        contactPerson: data.company.contactPerson || '',
        address: data.company.address || '',
        city: data.company.city || '',
        state: data.company.state || '',
        country: data.company.country || '',
        pincode: data.company.pincode || '',
        website: data.company.website || '',
        industry: data.company.industry || '',
        sectors: data.company.sectors || [],
        departments: data.company.departments || [],
        designation: data.company.designation || '',
        description: data.company.description || '',
        foundedYear: data.company.foundedYear || '',
        companySize: data.company.companySize || '',
        profilePhoto: data.company.profilePhoto || null,
        coverPhoto: data.company.coverPhoto || null,
      });
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching company details:', error);
      Alert.alert('Error', 'Failed to fetch company details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/companies/${companyId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update company');
      }

      Alert.alert('Success', 'Company updated successfully');
      setEditMode(false);
      fetchCompanyDetails();
    } catch (error) {
      console.error('Error updating company:', error);
      Alert.alert('Error', error.message || 'Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  const handleImagePick = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // Upload image
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `${type}_photo.jpg`,
        });

        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/companies/${companyId}/upload-${type}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setFormData(prev => ({
            ...prev,
            [type === 'profile' ? 'profilePhoto' : 'coverPhoto']: data.imageUrl
          }));
          Alert.alert('Success', `${type === 'profile' ? 'Profile' : 'Cover'} photo updated successfully`);
        } else {
          throw new Error(data.message || 'Failed to upload image');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleSendEmail = (type) => {
    Alert.alert(
      'Send Email',
      `Select email type to send to ${company.companyName}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Activation Link', onPress: () => sendEmail('activation') },
        { text: 'Password Reset', onPress: () => sendEmail('password-reset') },
        { text: 'Custom Email', onPress: () => sendEmail('custom') },
      ]
    );
  };

  const sendEmail = async (emailType) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/admin/companies/${companyId}/send-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ emailType })
      });

      Alert.alert('Success', 'Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', 'Failed to send email');
    }
  };

  const handleAssignPackage = () => {
    Alert.alert('Assign Package', 'Package assignment feature coming soon');
  };

  const handleManageComments = () => {
    Alert.alert('Manage Comments', 'Comments management feature coming soon');
  };

  const handleSuspend = async () => {
    Alert.alert(
      'Suspend Company',
      'Are you sure you want to suspend this company?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              await fetch(`${API_URL}/admin/companies/${companyId}/suspend`, {
                method: 'POST',
                headers
              });

              Alert.alert('Success', 'Company suspended successfully');
              fetchCompanyDetails();
            } catch (error) {
              console.error('Error suspending company:', error);
              Alert.alert('Error', 'Failed to suspend company');
            }
          }
        }
      ]
    );
  };

  const handleDuplicate = async () => {
    Alert.alert(
      'Duplicate Company',
      'Are you sure you want to create a duplicate of this company?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Duplicate',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              const response = await fetch(`${API_URL}/admin/companies/${companyId}/duplicate`, {
                method: 'POST',
                headers
              });

              const data = await response.json();

              if (response.ok) {
                Alert.alert('Success', 'Company duplicated successfully');
                navigation.navigate('AdminCompanyDetails', { companyId: data.company._id });
              } else {
                throw new Error(data.message || 'Failed to duplicate company');
              }
            } catch (error) {
              console.error('Error duplicating company:', error);
              Alert.alert('Error', 'Failed to duplicate company');
            }
          }
        }
      ]
    );
  };

  const handleLoginAsUser = async () => {
    if (!company.userId) {
      Alert.alert('Error', 'No user account associated with this company');
      return;
    }

    Alert.alert(
      'Login as Company User',
      `Are you sure you want to login as ${company.companyName}?\n\nYou will be logged out from admin panel and logged in as this company user.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Login',
          style: 'default',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              };

              const apiUrl = `${API_URL}/admin/login-as-user/${company.userId}`;
              console.log('🔵 Making API call to:', apiUrl);

              const response = await fetch(apiUrl, {
                method: 'POST',
                headers
              });

              const data = await response.json();
              console.log('🔵 API Response:', data);

              if (response.ok && data.success) {
                // Store admin token for later
                await AsyncStorage.setItem('adminToken', token);
                
                // Store new user token
                await AsyncStorage.setItem('token', data.token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                
                console.log('✅ Tokens stored successfully');
                
                Alert.alert(
                  'Success',
                  `You are now logged in as ${company.companyName}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Navigate to appropriate dashboard based on user type
                        if (data.user.userType === 'EMPLOYER' || data.user.userType === 'COMPANY') {
                          navigation.replace('EmployerDashboard');
                        } else {
                          navigation.replace('Dashboard');
                        }
                      }
                    }
                  ]
                );
              } else {
                Alert.alert(
                  'Error',
                  data.message || 'Failed to login as user'
                );
              }
            } catch (error) {
              console.error('❌ Error logging in as user:', error);
              Alert.alert('Error', 'Failed to login as user. Please try again.');
            }
          }
        }
      ]
    );
  };

  const dynamicStyles = getStyles(isMobile, isTablet);

  if (loading) {
    return (
      <AdminLayout
        title="Company Details"
        activeScreen="AdminCompanies"
        onNavigate={(screen) => navigation.navigate(screen)}
        onLogout={() => navigation.replace('AdminLogin')}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={dynamicStyles.loadingText}>Loading company details...</Text>
        </View>
      </AdminLayout>
    );
  }

  if (!company) {
    return (
      <AdminLayout
        title="Company Details"
        activeScreen="AdminCompanies"
        onNavigate={(screen) => navigation.navigate(screen)}
        onLogout={() => navigation.replace('AdminLogin')}
      >
        <View style={dynamicStyles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#E74C3C" />
          <Text style={dynamicStyles.errorText}>Company not found</Text>
          <TouchableOpacity
            style={dynamicStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={dynamicStyles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Company Details"
      activeScreen="AdminCompanies"
      onNavigate={(screen) => navigation.navigate(screen)}
      onLogout={() => navigation.replace('AdminLogin')}
    >
      <ScrollView style={dynamicStyles.container}>
        {/* Header Actions */}
        <View style={dynamicStyles.headerActions}>
          <TouchableOpacity
            style={dynamicStyles.backIconButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <View style={dynamicStyles.headerActionsRight}>
            {editMode ? (
              <>
                <TouchableOpacity
                  style={[dynamicStyles.actionButton, dynamicStyles.cancelButton]}
                  onPress={() => {
                    setEditMode(false);
                    fetchCompanyDetails();
                  }}
                >
                  <Ionicons name="close-outline" size={20} color="#666" />
                  <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.actionButton, dynamicStyles.saveButton]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Ionicons name="checkmark-outline" size={20} color="#FFF" />
                  <Text style={dynamicStyles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[dynamicStyles.actionButton, dynamicStyles.editButton]}
                onPress={() => setEditMode(true)}
              >
                <Ionicons name="create-outline" size={20} color="#FFF" />
                <Text style={dynamicStyles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Cover Photo */}
        <View style={dynamicStyles.coverPhotoContainer}>
          {formData.coverPhoto ? (
            <Image source={{ uri: formData.coverPhoto }} style={dynamicStyles.coverPhoto} />
          ) : (
            <View style={dynamicStyles.coverPhotoPlaceholder}>
              <Ionicons name="image-outline" size={48} color="#CCC" />
            </View>
          )}
          {editMode && (
            <TouchableOpacity
              style={dynamicStyles.changeCoverButton}
              onPress={() => handleImagePick('cover')}
            >
              <Ionicons name="camera-outline" size={20} color="#FFF" />
              <Text style={dynamicStyles.changeCoverButtonText}>Change Cover</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Photo */}
        <View style={dynamicStyles.profilePhotoContainer}>
          {formData.profilePhoto ? (
            <Image source={{ uri: formData.profilePhoto }} style={dynamicStyles.profilePhoto} />
          ) : (
            <View style={dynamicStyles.profilePhotoPlaceholder}>
              <Ionicons name="business-outline" size={48} color="#CCC" />
            </View>
          )}
          {editMode && (
            <TouchableOpacity
              style={dynamicStyles.changeProfileButton}
              onPress={() => handleImagePick('profile')}
            >
              <Ionicons name="camera-outline" size={16} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Company Info */}
        <View style={dynamicStyles.infoSection}>
          <Text style={dynamicStyles.companyName}>{company.companyName}</Text>
          <View style={dynamicStyles.statusRow}>
            <View style={[dynamicStyles.statusBadge, company.isActive ? dynamicStyles.statusActive : dynamicStyles.statusInactive]}>
              <Text style={dynamicStyles.statusText}>{company.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
            {company.isVerified && (
              <View style={dynamicStyles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                <Text style={dynamicStyles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        {!editMode && (
          <View style={dynamicStyles.quickActions}>
            <TouchableOpacity style={dynamicStyles.quickActionButton} onPress={() => handleSendEmail('activation')}>
              <Ionicons name="mail-outline" size={20} color="#4A90E2" />
              <Text style={dynamicStyles.quickActionText}>Send Email</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[dynamicStyles.quickActionButton, !company.userId && dynamicStyles.quickActionButtonDisabled]} 
              onPress={handleLoginAsUser}
              disabled={!company.userId}
            >
              <Ionicons name="log-in-outline" size={20} color={company.userId ? "#28a745" : "#CCC"} />
              <Text style={[dynamicStyles.quickActionText, !company.userId && dynamicStyles.quickActionTextDisabled]}>Login As User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.quickActionButton} onPress={handleAssignPackage}>
              <Ionicons name="cube-outline" size={20} color="#9B59B6" />
              <Text style={dynamicStyles.quickActionText}>Assign Package</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.quickActionButton} onPress={handleDuplicate}>
              <Ionicons name="copy-outline" size={20} color="#F39C12" />
              <Text style={dynamicStyles.quickActionText}>Duplicate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.quickActionButton} onPress={handleSuspend}>
              <Ionicons name="ban-outline" size={20} color="#E74C3C" />
              <Text style={dynamicStyles.quickActionText}>Suspend</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form Fields */}
        <View style={dynamicStyles.formContainer}>
          <Text style={dynamicStyles.sectionTitle}>Company Information</Text>
          
          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>Company Name *</Text>
            <TextInput
              style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
              value={formData.companyName}
              onChangeText={(text) => setFormData({ ...formData, companyName: text })}
              editable={editMode}
              placeholder="Enter company name"
            />
          </View>

          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>Email *</Text>
            <TextInput
              style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              editable={editMode}
              placeholder="Enter email"
              keyboardType="email-address"
            />
          </View>

          <View style={dynamicStyles.formRow}>
            <View style={[dynamicStyles.formGroup, dynamicStyles.formGroupHalf]}>
              <Text style={dynamicStyles.label}>Phone</Text>
              <TextInput
                style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                editable={editMode}
                placeholder="Enter phone"
                keyboardType="phone-pad"
              />
            </View>

            <View style={[dynamicStyles.formGroup, dynamicStyles.formGroupHalf]}>
              <Text style={dynamicStyles.label}>Contact Person</Text>
              <TextInput
                style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
                value={formData.contactPerson}
                onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
                editable={editMode}
                placeholder="Enter contact person"
              />
            </View>
          </View>

          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>Address</Text>
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea, !editMode && dynamicStyles.inputDisabled]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              editable={editMode}
              placeholder="Enter address"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={dynamicStyles.formRow}>
            <View style={[dynamicStyles.formGroup, dynamicStyles.formGroupHalf]}>
              <Text style={dynamicStyles.label}>City</Text>
              <TextInput
                style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                editable={editMode}
                placeholder="Enter city"
              />
            </View>

            <View style={[dynamicStyles.formGroup, dynamicStyles.formGroupHalf]}>
              <Text style={dynamicStyles.label}>State</Text>
              <TextInput
                style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
                editable={editMode}
                placeholder="Enter state"
              />
            </View>
          </View>

          <View style={dynamicStyles.formRow}>
            <View style={[dynamicStyles.formGroup, dynamicStyles.formGroupHalf]}>
              <Text style={dynamicStyles.label}>Country</Text>
              <TextInput
                style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
                value={formData.country}
                onChangeText={(text) => setFormData({ ...formData, country: text })}
                editable={editMode}
                placeholder="Enter country"
              />
            </View>

            <View style={[dynamicStyles.formGroup, dynamicStyles.formGroupHalf]}>
              <Text style={dynamicStyles.label}>Pincode</Text>
              <TextInput
                style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
                value={formData.pincode}
                onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                editable={editMode}
                placeholder="Enter pincode"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>Website</Text>
            <TextInput
              style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
              value={formData.website}
              onChangeText={(text) => setFormData({ ...formData, website: text })}
              editable={editMode}
              placeholder="Enter website URL"
              keyboardType="url"
            />
          </View>

          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>Industry</Text>
            <TextInput
              style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
              value={formData.industry}
              onChangeText={(text) => setFormData({ ...formData, industry: text })}
              editable={editMode}
              placeholder="Enter industry"
            />
          </View>

          <View style={dynamicStyles.formRow}>
            <View style={[dynamicStyles.formGroup, dynamicStyles.formGroupHalf]}>
              <Text style={dynamicStyles.label}>Founded Year</Text>
              <TextInput
                style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
                value={formData.foundedYear}
                onChangeText={(text) => setFormData({ ...formData, foundedYear: text })}
                editable={editMode}
                placeholder="Enter founded year"
                keyboardType="numeric"
              />
            </View>

            <View style={[dynamicStyles.formGroup, dynamicStyles.formGroupHalf]}>
              <Text style={dynamicStyles.label}>Company Size</Text>
              <TextInput
                style={[dynamicStyles.input, !editMode && dynamicStyles.inputDisabled]}
                value={formData.companySize}
                onChangeText={(text) => setFormData({ ...formData, companySize: text })}
                editable={editMode}
                placeholder="e.g., 50-100"
              />
            </View>
          </View>

          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>Description</Text>
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea, !editMode && dynamicStyles.inputDisabled]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              editable={editMode}
              placeholder="Enter company description"
              multiline
              numberOfLines={5}
            />
          </View>
        </View>

        {/* Jobs Section */}
        <View style={dynamicStyles.jobsSection}>
          <View style={dynamicStyles.jobsHeader}>
            <Text style={dynamicStyles.sectionTitle}>Posted Jobs ({jobs.length})</Text>
            <TouchableOpacity
              style={dynamicStyles.viewAllButton}
              onPress={() => navigation.navigate('AdminJobs', { companyId })}
            >
              <Text style={dynamicStyles.viewAllButtonText}>View All</Text>
              <Ionicons name="arrow-forward" size={16} color="#4A90E2" />
            </TouchableOpacity>
          </View>
          {jobs.length === 0 ? (
            <View style={dynamicStyles.emptyJobs}>
              <Ionicons name="briefcase-outline" size={48} color="#CCC" />
              <Text style={dynamicStyles.emptyJobsText}>No jobs posted yet</Text>
            </View>
          ) : (
            jobs.slice(0, 5).map((job) => (
              <TouchableOpacity
                key={job._id}
                style={dynamicStyles.jobCard}
                onPress={() => navigation.navigate('AdminJobDetails', { jobId: job._id })}
              >
                <View style={dynamicStyles.jobCardHeader}>
                  <Text style={dynamicStyles.jobTitle}>{job.title}</Text>
                  <View style={[dynamicStyles.jobStatusBadge, job.status === 'active' ? dynamicStyles.jobStatusActive : dynamicStyles.jobStatusInactive]}>
                    <Text style={dynamicStyles.jobStatusText}>{job.status}</Text>
                  </View>
                </View>
                <Text style={dynamicStyles.jobLocation}>{job.location}</Text>
                <Text style={dynamicStyles.jobDate}>Posted: {formatDate(job.createdAt)}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E74C3C',
    marginTop: 16,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backIconButton: {
    padding: 8,
  },
  headerActionsRight: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#4A90E2',
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#27AE60',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  coverPhotoContainer: {
    height: 200,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  changeCoverButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  changeCoverButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profilePhotoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#FFF',
    marginTop: -60,
    marginLeft: 20,
    position: 'relative',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    resizeMode: 'cover',
  },
  profilePhotoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  changeProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#27AE60',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 16,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  jobsSection: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 10,
    marginBottom: 20,
  },
  jobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  emptyJobs: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyJobsText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  jobCard: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  jobStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobStatusActive: {
    backgroundColor: '#D1FAE5',
  },
  jobStatusInactive: {
    backgroundColor: '#FEE2E2',
  },
  jobStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  jobLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  jobDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default AdminCompanyDetailsScreen;
