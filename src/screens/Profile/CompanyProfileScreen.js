import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';

const COMPANY_TYPES = ['Indian MNC', 'Foreign MNC', 'Govt/PSU', 'Startup', 'Unicorn', 'Corporate', 'Consultancy'];
const COMPANY_SIZES = ['0-10', '11-25', '26-50', '51-100', '101-200', '201-500', '500-1000', '1001-2000', '2000-3000', '3000 Above'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const SOCIAL_MEDIA_OPTIONS = ['Facebook', 'Instagram', 'LinkedIn', 'Telegram', 'Arattai Messenger', 'WhatsApp', 'YouTube', 'X / Twitter', 'Grokipedia', 'Wikipedia'];

const CompanyProfileScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('company');
  const [activeSection, setActiveSection] = useState('basic');
  
  // Master data
  const [industries, setIndustries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  
  // Dropdown states
  const [showCompanyType, setShowCompanyType] = useState(false);
  const [showSize, setShowSize] = useState(false);
  const [showGender, setShowGender] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const [showIndustryCategory, setShowIndustryCategory] = useState(false);
  const [showDeptCategory, setShowDeptCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    hrName: '',
    hrDesignation: '',
    gender: '',
    profile: {
      company: {
        name: '',
        companyType: '',
        website: '',
        industry: '',
        industryCategory: '',
        industrySubcategories: [],
        departmentCategory: '',
        departmentSubcategories: [],
        size: '',
        description: '',
        location: {
          city: '',
          state: '',
          locality: '',
          areaPincode: '',
          country: 'India',
        },
        establishedYear: '',
        socialMediaProfile: '',
        socialMediaLink: '',
        logo: '',
        ...(userRole === 'company' ? {
          company: {
            foundedYear: '',
            revenue: '',
            employeeCount: '',
            departments: [],
            benefits: [],
            culture: '',
            workEnvironment: '',
            growthStage: '',
          },
        } : {
          consultancy: {
            licenseNumber: '',
            registrationNumber: '',
            specializations: [],
            clientTypes: [],
            serviceAreas: [],
            establishedYear: '',
            teamSize: '',
          },
        }),
      },
    },
  });

  const [tempField, setTempField] = useState('');
  const [showArrayModal, setShowArrayModal] = useState(false);
  const [arrayFieldType, setArrayFieldType] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadMasterData();
    loadProfile();
  }, []);

  const loadMasterData = async () => {
    try {
      // Load industries
      const industriesRes = await api.request('/industries');
      if (industriesRes.success && industriesRes.data) {
        setIndustries(industriesRes.data);
      }
      
      // Load departments
      const deptRes = await api.request('/departments');
      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
      }
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const handleIndustryCategorySelect = (category) => {
    updateField('profile.company.industryCategory', category);
    // Load subcategories for this industry
    const selectedIndustry = industries.find(ind => ind.name === category);
    if (selectedIndustry && selectedIndustry.subcategories) {
      setAvailableSubcategories(selectedIndustry.subcategories);
    } else {
      setAvailableSubcategories([]);
    }
  };

  const handleDepartmentCategorySelect = (category) => {
    updateField('profile.company.departmentCategory', category);
    // Load subcategories for this department
    const selectedDept = departments.find(dept => dept.name === category);
    if (selectedDept && selectedDept.subcategories) {
      setAvailableSubcategories(selectedDept.subcategories);
    } else {
      setAvailableSubcategories([]);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      let profileData;
      
      const currentUser = await api.getCurrentUserFromStorage();
      setUserRole(currentUser?.employerType || 'company');

      if (currentUser?.employerType === 'consultancy') {
        profileData = await api.getConsultancyProfile();
      } else {
        profileData = await api.getCompanyProfile();
      }

      if (profileData) {
        setUser(profileData);
        const profileCompany = profileData.profile?.company || {};
        const nestedCompany = profileCompany.company || profileCompany.consultancy || {};
        
        setFormData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          whatsappNumber: profileData.whatsappNumber || '',
          hrName: profileData.hrName || '',
          hrDesignation: profileData.hrDesignation || '',
          gender: profileData.gender || '',
          profile: {
            company: {
              name: profileCompany.name || '',
              companyType: profileCompany.companyType || '',
              website: profileCompany.website || '',
              industry: profileCompany.industry || '',
              industryCategory: profileCompany.industryCategory || '',
              industrySubcategories: profileCompany.industrySubcategories || [],
              departmentCategory: profileCompany.departmentCategory || '',
              departmentSubcategories: profileCompany.departmentSubcategories || [],
              size: profileCompany.size || '',
              description: profileCompany.description || '',
              location: profileCompany.location || { city: '', state: '', locality: '', areaPincode: '', country: 'India' },
              establishedYear: profileCompany.establishedYear || '',
              socialMediaProfile: profileCompany.socialMediaProfile || '',
              socialMediaLink: profileCompany.socialMediaLink || '',
              logo: profileCompany.logo || '',
              ...(currentUser?.employerType === 'consultancy' ? {
                consultancy: {
                  licenseNumber: nestedCompany.licenseNumber || '',
                  registrationNumber: nestedCompany.registrationNumber || '',
                  specializations: nestedCompany.specializations || [],
                  clientTypes: nestedCompany.clientTypes || [],
                  serviceAreas: nestedCompany.serviceAreas || [],
                  establishedYear: nestedCompany.establishedYear?.toString() || '',
                  teamSize: nestedCompany.teamSize?.toString() || '',
                },
              } : {
                company: {
                  foundedYear: nestedCompany.foundedYear?.toString() || '',
                  revenue: nestedCompany.revenue || '',
                  employeeCount: nestedCompany.employeeCount?.toString() || '',
                  departments: nestedCompany.departments || [],
                  benefits: nestedCompany.benefits || [],
                  culture: nestedCompany.culture || '',
                  workEnvironment: nestedCompany.workEnvironment || '',
                  growthStage: nestedCompany.growthStage || '',
                },
              }),
            },
          },
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const updateField = (path, value) => {
    const pathParts = path.split('.');
    const newFormData = { ...formData };
    let current = newFormData;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    setFormData(newFormData);
    setErrors({ ...errors, [path]: null });
  };

  const addToArray = (path, value) => {
    if (!value.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }
    
    const pathParts = path.split('.');
    const newFormData = { ...formData };
    let current = newFormData;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    
    const fieldName = pathParts[pathParts.length - 1];
    if (!current[fieldName]) {
      current[fieldName] = [];
    }
    
    if (!current[fieldName].includes(value.trim())) {
      current[fieldName].push(value.trim());
    }
    
    setFormData(newFormData);
    setTempField('');
    setShowArrayModal(false);
  };

  const removeFromArray = (path, index) => {
    const pathParts = path.split('.');
    const newFormData = { ...formData };
    let current = newFormData;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    
    const fieldName = pathParts[pathParts.length - 1];
    current[fieldName] = current[fieldName].filter((_, i) => i !== index);
    setFormData(newFormData);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors['firstName'] = 'First name is required';
    if (!formData.lastName.trim()) newErrors['lastName'] = 'Last name is required';
    if (!formData.phone.trim()) newErrors['phone'] = 'Phone is required';
    if (!formData.profile.company.name.trim()) newErrors['profile.company.name'] = 'Company name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber,
        hrName: formData.hrName,
        hrDesignation: formData.hrDesignation,
        gender: formData.gender,
        profile: {
          company: {
            ...formData.profile.company,
            location: formData.profile.company.location,
          },
        },
      };

      let response;
      if (userRole === 'consultancy') {
        response = await api.updateConsultancyProfile(updateData);
      } else {
        response = await api.updateCompanyProfile(updateData);
      }

      if (response) {
        Alert.alert('Success', 'Profile updated successfully!');
        await loadProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openArrayModal = (fieldType, predefinedOptions = null) => {
    setArrayFieldType(fieldType);
    if (predefinedOptions) {
      setAvailableSubcategories(predefinedOptions);
    }
    setShowArrayModal(true);
  };

  const renderDropdown = (label, value, options, onSelect, showModal, setShowModal) => (
    <View style={styles.fullInput}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowModal(!showModal)}
        >
          <Text style={[styles.dropdownText, !value && styles.placeholder]}>
            {value || `Select ${label.toLowerCase()}`}
          </Text>
          <Ionicons name={showModal ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
        </TouchableOpacity>
        {showModal && (
          <View style={styles.dropdownMenu}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(option);
                  setShowModal(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderArrayInput = (title, array, path, maxItems = 5, options = null) => (
    <View style={styles.arrayContainer}>
      <View style={styles.arrayHeader}>
        <Text style={styles.arrayTitle}>{title} {maxItems > 0 ? `(Up to ${maxItems})` : ''}</Text>
        {(!maxItems || array.length < maxItems) && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openArrayModal(path, options)}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      {array && array.length > 0 && (
        <View style={styles.tagsContainer}>
          {array.map((item, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
              <TouchableOpacity onPress={() => removeFromArray(path, index)}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderSection = () => {
    const sectionStyles = {
      basic: [styles.section, activeSection === 'basic' && styles.activeSection],
      company: [styles.section, activeSection === 'company' && styles.activeSection],
      location: [styles.section, activeSection === 'location' && styles.activeSection],
      extra: [styles.section, activeSection === 'extra' && styles.activeSection],
    };

    return (
      <>
        <TouchableOpacity style={sectionStyles.basic} onPress={() => setActiveSection('basic')}>
          <Ionicons name="person-outline" size={20} color={activeSection === 'basic' ? '#4A90E2' : '#666'} />
          <Text style={[styles.sectionText, activeSection === 'basic' && styles.activeSectionText]}>
            Basic Info
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={sectionStyles.company} onPress={() => setActiveSection('company')}>
          <Ionicons name="business-outline" size={20} color={activeSection === 'company' ? '#4A90E2' : '#666'} />
          <Text style={[styles.sectionText, activeSection === 'company' && styles.activeSectionText]}>
            {userRole === 'consultancy' ? 'Consultancy' : 'Company'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={sectionStyles.location} onPress={() => setActiveSection('location')}>
          <Ionicons name="location-outline" size={20} color={activeSection === 'location' ? '#4A90E2' : '#666'} />
          <Text style={[styles.sectionText, activeSection === 'location' && styles.activeSectionText]}>
            Location
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={sectionStyles.extra} onPress={() => setActiveSection('extra')}>
          <Ionicons name="information-circle-outline" size={20} color={activeSection === 'extra' ? '#4A90E2' : '#666'} />
          <Text style={[styles.sectionText, activeSection === 'extra' && styles.activeSectionText]}>
            Additional
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderFormContent = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <View style={styles.formContent}>
            <Text style={styles.sectionTitle}>HR / Recruiter Information</Text>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => updateField('firstName', text)}
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.label}>Mobile Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => updateField('phone', text)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Email ID *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.label}>WhatsApp Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.whatsappNumber}
                  onChangeText={(text) => updateField('whatsappNumber', text)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>HR Job Title/Designation</Text>
                <TextInput
                  style={styles.input}
                  value={formData.hrDesignation}
                  onChangeText={(text) => updateField('hrDesignation', text)}
                />
              </View>
              
              {renderDropdown(
                'Gender',
                formData.gender,
                GENDER_OPTIONS,
                (value) => updateField('gender', value),
                showGender,
                setShowGender
              )}
            </View>
          </View>
        );
        
      case 'company':
        return (
          <View style={styles.formContent}>
            <Text style={styles.sectionTitle}>{userRole === 'consultancy' ? 'Consultancy' : 'Company'} Details</Text>
            
            <View style={styles.fullInput}>
              <Text style={styles.label}>Company/Consultancy Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.profile.company.name}
                onChangeText={(text) => updateField('profile.company.name', text)}
              />
              {errors['profile.company.name'] && <Text style={styles.errorText}>{errors['profile.company.name']}</Text>}
            </View>
            
            {renderDropdown(
              'Company Type',
              formData.profile.company.companyType,
              COMPANY_TYPES,
              (value) => updateField('profile.company.companyType', value),
              showCompanyType,
              setShowCompanyType
            )}
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Company Website</Text>
                <TextInput
                  style={styles.input}
                  value={formData.profile.company.website}
                  onChangeText={(text) => updateField('profile.company.website', text)}
                  placeholder="https://example.com"
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.label}>Establishment/Founded Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.profile.company.establishedYear}
                  onChangeText={(text) => updateField('profile.company.establishedYear', text)}
                  placeholder="DD-MM-YYYY"
                />
              </View>
            </View>
            
            {renderDropdown(
              'Industry Category',
              formData.profile.company.industryCategory,
              industries.map(ind => ind.name),
              (value) => handleIndustryCategorySelect(value),
              showIndustryCategory,
              setShowIndustryCategory
            )}
            
            {formData.profile.company.industryCategory && (
              renderArrayInput(
                'Industry Subcategories (Up to 5)',
                formData.profile.company.industrySubcategories,
                'profile.company.industrySubcategories',
                5,
                (() => {
                  const selectedIndustry = industries.find(ind => ind.name === formData.profile.company.industryCategory);
                  return selectedIndustry?.subcategories || [];
                })()
              )
            )}
            
            {renderDropdown(
              'Department Category',
              formData.profile.company.departmentCategory,
              departments.map(dept => dept.name),
              (value) => handleDepartmentCategorySelect(value),
              showDeptCategory,
              setShowDeptCategory
            )}
            
            {formData.profile.company.departmentCategory && (
              renderArrayInput(
                'Department Subcategories (Up to 5)',
                formData.profile.company.departmentSubcategories,
                'profile.company.departmentSubcategories',
                5,
                (() => {
                  const selectedDept = departments.find(dept => dept.name === formData.profile.company.departmentCategory);
                  return selectedDept?.subcategories || [];
                })()
              )
            )}
            
            {renderDropdown(
              'Total Employees Count',
              formData.profile.company.size,
              COMPANY_SIZES,
              (value) => updateField('profile.company.size', value),
              showSize,
              setShowSize
            )}
            
            <View style={styles.fullInput}>
              <Text style={styles.label}>About the Company (Up to 1000 words)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.profile.company.description}
                onChangeText={(text) => updateField('profile.company.description', text)}
                multiline
                numberOfLines={6}
                maxLength={5000}
              />
            </View>
          </View>
        );
        
      case 'location':
        return (
          <View style={styles.formContent}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Office State</Text>
                <TextInput
                  style={styles.input}
                  value={formData.profile.company.location?.state || ''}
                  onChangeText={(text) => updateField('profile.company.location', {
                    ...formData.profile.company.location,
                    state: text,
                  })}
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.label}>Office City/Region</Text>
                <TextInput
                  style={styles.input}
                  value={formData.profile.company.location?.city || ''}
                  onChangeText={(text) => updateField('profile.company.location', {
                    ...formData.profile.company.location,
                    city: text,
                  })}
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Office Locality/Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.profile.company.location?.locality || ''}
                  onChangeText={(text) => updateField('profile.company.location', {
                    ...formData.profile.company.location,
                    locality: text,
                  })}
                  multiline
                  numberOfLines={2}
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.label}>Office Area Pincode</Text>
                <TextInput
                  style={styles.input}
                  value={formData.profile.company.location?.areaPincode || ''}
                  onChangeText={(text) => updateField('profile.company.location', {
                    ...formData.profile.company.location,
                    areaPincode: text,
                  })}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>
            
            <View style={styles.row}>
              {renderDropdown(
                'Online Social Profile',
                formData.profile.company.socialMediaProfile,
                SOCIAL_MEDIA_OPTIONS,
                (value) => updateField('profile.company.socialMediaProfile', value),
                showSocialMedia,
                setShowSocialMedia
              )}
            </View>
            
            <View style={styles.fullInput}>
              <Text style={styles.label}>Social Media Link</Text>
              <TextInput
                style={styles.input}
                value={formData.profile.company.socialMediaLink}
                onChangeText={(text) => updateField('profile.company.socialMediaLink', text)}
                placeholder="https://"
              />
            </View>
          </View>
        );
        
      case 'extra':
        return (
          <View style={styles.formContent}>
            {userRole === 'consultancy' ? (
              <>
                <Text style={styles.sectionTitle}>Consultancy Additional Information</Text>
                
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>License Number</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.profile.company.consultancy?.licenseNumber || ''}
                      onChangeText={(text) => updateField('profile.company.consultancy', {
                        ...formData.profile.company.consultancy,
                        licenseNumber: text,
                      })}
                    />
                  </View>
                  
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Registration Number</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.profile.company.consultancy?.registrationNumber || ''}
                      onChangeText={(text) => updateField('profile.company.consultancy', {
                        ...formData.profile.company.consultancy,
                        registrationNumber: text,
                      })}
                    />
                  </View>
                </View>
                
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Established Year</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.profile.company.consultancy?.establishedYear || ''}
                      onChangeText={(text) => updateField('profile.company.consultancy', {
                        ...formData.profile.company.consultancy,
                        establishedYear: text,
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Team Size</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.profile.company.consultancy?.teamSize || ''}
                      onChangeText={(text) => updateField('profile.company.consultancy', {
                        ...formData.profile.company.consultancy,
                        teamSize: text,
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                {renderArrayInput(
                  'Specializations',
                  formData.profile.company.consultancy?.specializations,
                  'profile.company.consultancy.specializations'
                )}
                
                {renderArrayInput(
                  'Client Types',
                  formData.profile.company.consultancy?.clientTypes,
                  'profile.company.consultancy.clientTypes'
                )}
                
                {renderArrayInput(
                  'Service Areas',
                  formData.profile.company.consultancy?.serviceAreas,
                  'profile.company.consultancy.serviceAreas'
                )}
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Additional Company Information</Text>
                
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Founded Year</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.profile.company.company?.foundedYear || ''}
                      onChangeText={(text) => updateField('profile.company.company', {
                        ...formData.profile.company.company,
                        foundedYear: text,
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Revenue</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.profile.company.company?.revenue || ''}
                      onChangeText={(text) => updateField('profile.company.company', {
                        ...formData.profile.company.company,
                        revenue: text,
                      })}
                    />
                  </View>
                </View>
                
                <View style={styles.fullInput}>
                  <Text style={styles.label}>Employee Count</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.profile.company.company?.employeeCount || ''}
                    onChangeText={(text) => updateField('profile.company.company', {
                      ...formData.profile.company.company,
                      employeeCount: text,
                    })}
                    keyboardType="numeric"
                  />
                </View>
                
                {renderArrayInput(
                  'Departments',
                  formData.profile.company.company?.departments,
                  'profile.company.company.departments'
                )}
                
                {renderArrayInput(
                  'Benefits',
                  formData.profile.company.company?.benefits,
                  'profile.company.company.benefits'
                )}
                
                <View style={styles.fullInput}>
                  <Text style={styles.label}>Company Culture</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.profile.company.company?.culture || ''}
                    onChangeText={(text) => updateField('profile.company.company', {
                      ...formData.profile.company.company,
                      culture: text,
                    })}
                    multiline
                    numberOfLines={3}
                  />
                </View>
                
                <View style={styles.fullInput}>
                  <Text style={styles.label}>Work Environment</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.profile.company.company?.workEnvironment || ''}
                    onChangeText={(text) => updateField('profile.company.company', {
                      ...formData.profile.company.company,
                      workEnvironment: text,
                    })}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </>
            )}
          </View>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sidebarWrapper}>
        <EmployerSidebar 
          permanent 
          navigation={navigation} 
          role={userRole} 
          activeKey="orgProfile" 
        />
      </View>
      
      <View style={styles.mainContentWrapper}>
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
        {/* Header */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              {userRole === 'consultancy' ? 'Consultancy' : 'Company'} Profile
            </Text>
            <Text style={styles.headerSubtitle}>Manage your organization details</Text>
          </View>
        </View>

        {/* Section Tabs */}
        <View style={styles.sectionsContainer}>
          {renderSection()}
        </View>

        {/* Form Content */}
        {renderFormContent()}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
        </ScrollView>
        
        {/* Dropdown Overlay - positioned absolutely to cover everything */}
        {(showCompanyType || showSize || showGender || showSocialMedia || showIndustryCategory || showDeptCategory) && (
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => {
              setShowCompanyType(false);
              setShowSize(false);
              setShowGender(false);
              setShowSocialMedia(false);
              setShowIndustryCategory(false);
              setShowDeptCategory(false);
            }}
          />
        )}
      </View>
      
      {/* Array Input Modal */}
      <Modal
        visible={showArrayModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowArrayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Item</Text>
            <View style={{ maxHeight: 200 }}>
              <ScrollView showsVerticalScrollIndicator={true}>
                {availableSubcategories.length > 0 && availableSubcategories.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickSelectItem}
                    onPress={() => {
                      addToArray(arrayFieldType, option);
                    }}
                  >
                    <Text style={styles.quickSelectText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.modalDivider}>
              <Text style={styles.dividerText}>OR</Text>
            </View>
            <TextInput
              style={styles.modalInput}
              value={tempField}
              onChangeText={setTempField}
              placeholder="Type or add custom item"
              onSubmitEditing={() => addToArray(arrayFieldType, tempField)}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowArrayModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => addToArray(arrayFieldType, tempField)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F6FA',
  },
  sidebarWrapper: {
    width: 260,
  },
  mainContentWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  headerBar: {
    backgroundColor: '#FFF',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  sectionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: spacing.lg,
    padding: spacing.xs,
  },
  section: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    gap: 8,
  },
  activeSection: {
    backgroundColor: '#E0E7FF',
  },
  sectionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeSectionText: {
    color: '#4A90E2',
  },
  formContent: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  fullInput: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.md,
    marginTop: 4,
    zIndex: 1001,
    maxHeight: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  arrayContainer: {
    marginBottom: spacing.md,
  },
  arrayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  arrayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  tagText: {
    fontSize: 13,
    color: '#333',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: spacing.lg,
  },
  quickSelectItem: {
    padding: spacing.md,
    backgroundColor: '#F0F0F0',
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  quickSelectText: {
    fontSize: 15,
    color: '#333',
  },
  modalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerText: {
    flex: 1,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  modalButtonPrimary: {
    backgroundColor: '#4A90E2',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonTextPrimary: {
    color: '#FFF',
  },
});

export default CompanyProfileScreen;

