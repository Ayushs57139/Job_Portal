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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { DropdownField } from '../../components/FormFields';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';

const COMPANY_TYPES = ['Indian MNC', 'Foreign MNC', 'Govt/PSU', 'Startup', 'Unicorn', 'Corporate', 'Consultancy'];
const COMPANY_SIZES = ['0-10', '11-25', '26-50', '51-100', '101-200', '201-500', '500-1000', '1001-2000', '2000-3000', '3000 Above'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const SOCIAL_MEDIA_OPTIONS = ['Facebook', 'Instagram', 'LinkedIn', 'Telegram', 'Arattai Messenger', 'WhatsApp', 'YouTube', 'X / Twitter', 'Grokipedia', 'Wikipedia'];

const CompanyProfileScreen = ({ navigation, route }) => {
  const responsive = useResponsive();
  const {
    width,
    isMobile,
    isTabletDevice,
    isLaptopDevice,
    isDesktopDevice,
    isSmallLaptop,
    isLaptop,
    isDesktop,
    isLargeDesktop,
    getHorizontalPadding,
    getContainerMaxWidth,
  } = responsive;
  
  const isPhone = isMobile;
  const dynamicStyles = getStyles(responsive);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('company');
  const [activeSection, setActiveSection] = useState('basic');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
    if (formData.phone && formData.phone.length < 10) newErrors['phone'] = 'Phone number must be at least 10 digits';
    if (!formData.email.trim()) newErrors['email'] = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors['email'] = 'Please enter a valid email address';
    }
    if (!formData.profile.company.name.trim()) newErrors['profile.company.name'] = 'Company name is required';
    if (formData.profile.company.website && !/^https?:\/\/.+/.test(formData.profile.company.website) && formData.profile.company.website.length > 0) {
      newErrors['profile.company.website'] = 'Please enter a valid URL (start with http:// or https://)';
    }
    if (formData.profile.company.socialMediaLink && !/^https?:\/\/.+/.test(formData.profile.company.socialMediaLink) && formData.profile.company.socialMediaLink.length > 0) {
      newErrors['profile.company.socialMediaLink'] = 'Please enter a valid URL (start with http:// or https://)';
    }
    
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
      // Build complete update data with all nested fields
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber || '',
        hrName: formData.hrName || '',
        hrDesignation: formData.hrDesignation || '',
        gender: formData.gender || '',
        profile: {
          company: {
            name: formData.profile.company.name,
            companyType: formData.profile.company.companyType || '',
            website: formData.profile.company.website || '',
            industry: formData.profile.company.industry || '',
            industryCategory: formData.profile.company.industryCategory || '',
            industrySubcategories: formData.profile.company.industrySubcategories || [],
            departmentCategory: formData.profile.company.departmentCategory || '',
            departmentSubcategories: formData.profile.company.departmentSubcategories || [],
            size: formData.profile.company.size || '',
            description: formData.profile.company.description || '',
            location: formData.profile.company.location || { city: '', state: '', locality: '', areaPincode: '', country: 'India' },
            establishedYear: formData.profile.company.establishedYear || '',
            socialMediaProfile: formData.profile.company.socialMediaProfile || '',
            socialMediaLink: formData.profile.company.socialMediaLink || '',
            logo: formData.profile.company.logo || '',
            // Include nested company or consultancy data
            ...(userRole === 'consultancy' 
              ? {
                  consultancy: {
                    licenseNumber: formData.profile.company.consultancy?.licenseNumber || '',
                    registrationNumber: formData.profile.company.consultancy?.registrationNumber || '',
                    specializations: formData.profile.company.consultancy?.specializations || [],
                    clientTypes: formData.profile.company.consultancy?.clientTypes || [],
                    serviceAreas: formData.profile.company.consultancy?.serviceAreas || [],
                    establishedYear: formData.profile.company.consultancy?.establishedYear || '',
                    teamSize: formData.profile.company.consultancy?.teamSize || '',
                  }
                }
              : {
                  company: {
                    foundedYear: formData.profile.company.company?.foundedYear || '',
                    revenue: formData.profile.company.company?.revenue || '',
                    employeeCount: formData.profile.company.company?.employeeCount || '',
                    departments: formData.profile.company.company?.departments || [],
                    benefits: formData.profile.company.company?.benefits || [],
                    culture: formData.profile.company.company?.culture || '',
                    workEnvironment: formData.profile.company.company?.workEnvironment || '',
                    growthStage: formData.profile.company.company?.growthStage || '',
                  }
                }
            ),
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

  const renderDropdown = (label, value, options, onSelect, icon = null, required = false) => {
    // Convert string options to {value, label} format for DropdownField
    const formattedOptions = options.map(opt => 
      typeof opt === 'string' ? { value: opt, label: opt } : opt
    );
    
    const selectedOption = formattedOptions.find(opt => 
      opt.value === value || opt.label === value
    );

    return (
      <DropdownField
        label={label}
        value={selectedOption}
        options={formattedOptions}
        onSelect={(option) => onSelect(option.value || option.label || option)}
        placeholder={`Select ${label.toLowerCase()}`}
        icon={icon}
        required={required}
      />
    );
  };

  const renderArrayInput = (title, array, path, maxItems = 5, options = null) => (
    <View style={dynamicStyles.arrayContainer}>
      <View style={dynamicStyles.arrayHeader}>
        <Text style={dynamicStyles.arrayTitle}>{title} {maxItems > 0 ? `(Up to ${maxItems})` : ''}</Text>
        {(!maxItems || array.length < maxItems) && (
          <TouchableOpacity
            style={dynamicStyles.addButton}
            onPress={() => openArrayModal(path, options)}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      {array && array.length > 0 && (
        <View style={dynamicStyles.tagsContainer}>
          {array.map((item, index) => (
            <View key={index} style={dynamicStyles.tag}>
              <Text style={dynamicStyles.tagText}>{item}</Text>
              <TouchableOpacity onPress={() => removeFromArray(path, index)}>
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: 'person' },
    { id: 'company', label: userRole === 'consultancy' ? 'Consultancy' : 'Company', icon: 'business' },
    { id: 'location', label: 'Location', icon: 'location' },
    { id: 'extra', label: 'Additional', icon: 'add-circle' }
  ];

  const renderFormContent = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>HR / Recruiter Information</Text>
            
            <Input
              label="Full Name"
              value={formData.firstName}
              onChangeText={(text) => updateField('firstName', text)}
              placeholder="Enter full name"
              icon="person-outline"
              required
              error={errors.firstName}
            />
            
            <Input
              label="Mobile Number"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              placeholder="Enter mobile number"
              icon="call-outline"
              keyboardType="phone-pad"
              maxLength={10}
              required
              error={errors.phone}
            />
            
            <Input
              label="Email ID"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="Enter email address"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              required
              error={errors.email}
            />
            
            <Input
              label="WhatsApp Number"
              value={formData.whatsappNumber}
              onChangeText={(text) => updateField('whatsappNumber', text)}
              placeholder="Enter WhatsApp number"
              icon="logo-whatsapp"
              keyboardType="phone-pad"
              maxLength={10}
            />
            
            <Input
              label="HR Job Title/Designation"
              value={formData.hrDesignation}
              onChangeText={(text) => updateField('hrDesignation', text)}
              placeholder="Enter job title/designation"
              icon="briefcase-outline"
            />
            
            {renderDropdown(
              'Gender',
              formData.gender,
              GENDER_OPTIONS,
              (value) => updateField('gender', value),
              null,
              null,
              'people-outline',
              true
            )}
          </View>
        );
        
      case 'company':
        return (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>{userRole === 'consultancy' ? 'Consultancy' : 'Company'} Details</Text>
            
            <Input
              label="Company/Consultancy Name"
              value={formData.profile.company.name}
              onChangeText={(text) => updateField('profile.company.name', text)}
              placeholder="Enter company/consultancy name"
              icon="business-outline"
              required
              error={errors['profile.company.name']}
            />
            
            {renderDropdown(
              'Company Type',
              formData.profile.company.companyType,
              COMPANY_TYPES,
              (value) => updateField('profile.company.companyType', value),
              'business-outline'
            )}
            
            <Input
              label="Company Website"
              value={formData.profile.company.website}
              onChangeText={(text) => updateField('profile.company.website', text)}
              placeholder="https://example.com"
              icon="globe-outline"
              keyboardType="url"
              error={errors['profile.company.website']}
            />
            
            <Input
              label="Establishment/Founded Date"
              value={formData.profile.company.establishedYear}
              onChangeText={(text) => updateField('profile.company.establishedYear', text)}
              placeholder="DD-MM-YYYY"
              icon="calendar-outline"
            />
            
            {renderDropdown(
              'Industry Category',
              formData.profile.company.industryCategory,
              industries.map(ind => ind.name),
              (value) => handleIndustryCategorySelect(value),
              'briefcase-outline'
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
              'folder-outline'
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
              null,
              null,
              'people-outline'
            )}
            
            <Input
              label="About the Company (Up to 1000 words)"
              value={formData.profile.company.description}
              onChangeText={(text) => updateField('profile.company.description', text)}
              placeholder="Describe your company..."
              icon="document-text-outline"
              multiline
              numberOfLines={6}
              maxLength={5000}
            />
          </View>
        );
        
      case 'location':
        return (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Location Details</Text>
            
            <Input
              label="Office State"
              value={formData.profile.company.location?.state || ''}
              onChangeText={(text) => updateField('profile.company.location', {
                ...formData.profile.company.location,
                state: text,
              })}
              placeholder="Enter state"
              icon="location-outline"
            />
            
            <Input
              label="Office City/Region"
              value={formData.profile.company.location?.city || ''}
              onChangeText={(text) => updateField('profile.company.location', {
                ...formData.profile.company.location,
                city: text,
              })}
              placeholder="Enter city"
              icon="business-outline"
            />
            
            <Input
              label="Office Locality/Address"
              value={formData.profile.company.location?.locality || ''}
              onChangeText={(text) => updateField('profile.company.location', {
                ...formData.profile.company.location,
                locality: text,
              })}
              placeholder="Enter locality/address"
              icon="map-outline"
              multiline
              numberOfLines={2}
            />
            
            <Input
              label="Office Area Pincode"
              value={formData.profile.company.location?.areaPincode || ''}
              onChangeText={(text) => updateField('profile.company.location', {
                ...formData.profile.company.location,
                areaPincode: text,
              })}
              placeholder="Enter pincode"
              icon="navigate-outline"
              keyboardType="number-pad"
              maxLength={6}
            />
            
            {renderDropdown(
              'Online Social Profile',
              formData.profile.company.socialMediaProfile,
              SOCIAL_MEDIA_OPTIONS,
              (value) => updateField('profile.company.socialMediaProfile', value),
              'share-social-outline'
            )}
            
            <Input
              label="Social Media Link"
              value={formData.profile.company.socialMediaLink}
              onChangeText={(text) => updateField('profile.company.socialMediaLink', text)}
              placeholder="https://"
              icon="link-outline"
              keyboardType="url"
              error={errors['profile.company.socialMediaLink']}
            />
          </View>
        );
        
      case 'extra':
        return (
          <View style={dynamicStyles.section}>
            {userRole === 'consultancy' ? (
              <>
                <Text style={dynamicStyles.sectionTitle}>Consultancy Additional Information</Text>
                
                <View style={dynamicStyles.row}>
                  <View style={dynamicStyles.halfInput}>
                    <Text style={dynamicStyles.label}>License Number</Text>
                    <TextInput
                      style={dynamicStyles.input}
                      value={formData.profile.company.consultancy?.licenseNumber || ''}
                      onChangeText={(text) => updateField('profile.company.consultancy', {
                        ...formData.profile.company.consultancy,
                        licenseNumber: text,
                      })}
                      placeholder="Enter license number"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                  
                  <View style={dynamicStyles.halfInput}>
                    <Text style={dynamicStyles.label}>Registration Number</Text>
                    <TextInput
                      style={dynamicStyles.input}
                      value={formData.profile.company.consultancy?.registrationNumber || ''}
                      onChangeText={(text) => updateField('profile.company.consultancy', {
                        ...formData.profile.company.consultancy,
                        registrationNumber: text,
                      })}
                      placeholder="Enter registration number"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                </View>
                
                <View style={dynamicStyles.row}>
                  <View style={dynamicStyles.halfInput}>
                    <Text style={dynamicStyles.label}>Established Year</Text>
                    <TextInput
                      style={dynamicStyles.input}
                      value={formData.profile.company.consultancy?.establishedYear || ''}
                      onChangeText={(text) => updateField('profile.company.consultancy', {
                        ...formData.profile.company.consultancy,
                        establishedYear: text,
                      })}
                      keyboardType="numeric"
                      placeholder="YYYY"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                  
                  <View style={dynamicStyles.halfInput}>
                    <Text style={dynamicStyles.label}>Team Size</Text>
                    <TextInput
                      style={dynamicStyles.input}
                      value={formData.profile.company.consultancy?.teamSize || ''}
                      onChangeText={(text) => updateField('profile.company.consultancy', {
                        ...formData.profile.company.consultancy,
                        teamSize: text,
                      })}
                      keyboardType="numeric"
                      placeholder="Enter team size"
                      placeholderTextColor={colors.textLight}
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
                <Text style={dynamicStyles.sectionTitle}>Additional Company Information</Text>
                
                <View style={dynamicStyles.row}>
                  <View style={dynamicStyles.halfInput}>
                    <Text style={dynamicStyles.label}>Founded Year</Text>
                    <TextInput
                      style={dynamicStyles.input}
                      value={formData.profile.company.company?.foundedYear || ''}
                      onChangeText={(text) => updateField('profile.company.company', {
                        ...formData.profile.company.company,
                        foundedYear: text,
                      })}
                      keyboardType="numeric"
                      placeholder="YYYY"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                  
                  <View style={dynamicStyles.halfInput}>
                    <Text style={dynamicStyles.label}>Revenue</Text>
                    <TextInput
                      style={dynamicStyles.input}
                      value={formData.profile.company.company?.revenue || ''}
                      onChangeText={(text) => updateField('profile.company.company', {
                        ...formData.profile.company.company,
                        revenue: text,
                      })}
                      placeholder="Enter revenue"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                </View>
                
                <View style={dynamicStyles.fullInput}>
                  <Text style={dynamicStyles.label}>Employee Count</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={formData.profile.company.company?.employeeCount || ''}
                    onChangeText={(text) => updateField('profile.company.company', {
                      ...formData.profile.company.company,
                      employeeCount: text,
                    })}
                    keyboardType="numeric"
                    placeholder="Enter employee count"
                    placeholderTextColor={colors.textLight}
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
                
                <View style={dynamicStyles.fullInput}>
                  <Text style={dynamicStyles.label}>Company Culture</Text>
                  <TextInput
                    style={[dynamicStyles.input, dynamicStyles.textArea]}
                    value={formData.profile.company.company?.culture || ''}
                    onChangeText={(text) => updateField('profile.company.company', {
                      ...formData.profile.company.company,
                      culture: text,
                    })}
                    multiline
                    numberOfLines={3}
                    placeholder="Describe company culture..."
                    placeholderTextColor={colors.textLight}
                  />
                </View>
                
                <View style={dynamicStyles.fullInput}>
                  <Text style={dynamicStyles.label}>Work Environment</Text>
                  <TextInput
                    style={[dynamicStyles.input, dynamicStyles.textArea]}
                    value={formData.profile.company.company?.workEnvironment || ''}
                    onChangeText={(text) => updateField('profile.company.company', {
                      ...formData.profile.company.company,
                      workEnvironment: text,
                    })}
                    multiline
                    numberOfLines={3}
                    placeholder="Describe work environment..."
                    placeholderTextColor={colors.textLight}
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
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={dynamicStyles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {!isMobile && (
        <View style={[
          dynamicStyles.sidebarWrapper,
          isTabletDevice && dynamicStyles.sidebarWrapperTablet
        ]}>
          <EmployerSidebar
            permanent
            navigation={navigation}
            role={userRole}
            activeKey="orgProfile"
          />
        </View>
      )}
      {isMobile && (
        <EmployerSidebar
          visible={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navigation={navigation}
          role={userRole}
          activeKey="orgProfile"
        />
      )}
      {isMobile && (
        <TouchableOpacity
          style={dynamicStyles.menuButton}
          onPress={() => setSidebarOpen(true)}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <ScrollView
        style={[
          dynamicStyles.scrollView,
          isPhone && dynamicStyles.scrollViewMobile
        ]}
        contentContainerStyle={[
          dynamicStyles.content,
          isMobile && dynamicStyles.contentMobile,
          isTabletDevice && dynamicStyles.contentTablet
        ]}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Bar */}
        <View style={[
          dynamicStyles.headerBar,
          isMobile && dynamicStyles.headerBarMobile,
          isTabletDevice && dynamicStyles.headerBarTablet
        ]}>
          <Text style={[
            dynamicStyles.headerTitle,
            isMobile && dynamicStyles.headerTitleMobile
          ]}>
            {userRole === 'consultancy' ? 'Consultancy' : 'Company'} Profile
          </Text>
          <Text style={[
            dynamicStyles.headerSubtitle,
            isMobile && dynamicStyles.headerSubtitleMobile
          ]}>
            Manage your company profile information
          </Text>
        </View>

        {/* Section Navigation */}
        <View style={[
          dynamicStyles.sectionNavContainer,
          isMobile && dynamicStyles.sectionNavContainerMobile,
          isTabletDevice && dynamicStyles.sectionNavContainerTablet
        ]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={dynamicStyles.sectionNav}
            contentContainerStyle={isPhone ? { paddingHorizontal: spacing.xs } : {}}
          >
            {sections.map(section => (
              <TouchableOpacity
                key={section.id}
                style={[
                  dynamicStyles.sectionNavItem,
                  activeSection === section.id && dynamicStyles.sectionNavItemActive
                ]}
                onPress={() => setActiveSection(section.id)}
              >
                <Ionicons
                  name={section.icon}
                  size={20}
                  color={activeSection === section.id ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    dynamicStyles.sectionNavText,
                    activeSection === section.id && dynamicStyles.sectionNavTextActive
                  ]}
                  numberOfLines={1}
                >
                  {section.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Form Content */}
        <View style={dynamicStyles.formContainer}>
          {renderFormContent()}

          <Button
            title="Save Profile"
            onPress={handleSave}
            loading={saving}
            style={dynamicStyles.saveButton}
          />
        </View>
      </ScrollView>
      
      {/* Dropdown Overlay */}
      
      {/* Array Input Modal */}
      <Modal
        visible={showArrayModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowArrayModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>Add Item</Text>
            <View style={{ maxHeight: 200 }}>
              <ScrollView showsVerticalScrollIndicator={true}>
                {availableSubcategories.length > 0 && availableSubcategories.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={dynamicStyles.quickSelectItem}
                    onPress={() => {
                      addToArray(arrayFieldType, option);
                    }}
                  >
                    <Text style={dynamicStyles.quickSelectText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={dynamicStyles.modalDivider}>
              <Text style={dynamicStyles.dividerText}>OR</Text>
            </View>
            <TextInput
              style={dynamicStyles.modalInput}
              value={tempField}
              onChangeText={setTempField}
              placeholder="Type or add custom item"
              placeholderTextColor={colors.textLight}
              onSubmitEditing={() => addToArray(arrayFieldType, tempField)}
            />
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={dynamicStyles.modalButton}
                onPress={() => setShowArrayModal(false)}
              >
                <Text style={dynamicStyles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={() => addToArray(arrayFieldType, tempField)}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (responsive) => {
  const isWeb = getPlatform().OS === 'web';
  const {
    isMobile,
    isTabletDevice,
    isLaptopDevice,
    isDesktopDevice,
    isSmallLaptop,
    isLaptop,
    isDesktop,
    isLargeDesktop,
    width,
    getHorizontalPadding,
    getContainerMaxWidth,
  } = responsive;
  
  const isPhone = isMobile;
  const isTablet = isTabletDevice;
  const isLaptopOrAbove = isLaptopDevice || isDesktopDevice;
  
  // Responsive spacing values
  const hPadding = getHorizontalPadding();
  const maxContentWidth = getContainerMaxWidth();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.background,
      ...(isPhone && {
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }),
      ...(isWeb && isPhone && {
        overflowX: 'hidden',
      }),
    },
    sidebarWrapper: {
      width: isLaptopDevice ? 260 : isDesktopDevice ? 280 : 280,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background
    },
    loadingText: {
      ...typography.body1,
      color: colors.textSecondary,
      fontSize: isPhone ? 14 : 16,
    },
    scrollView: {
      flex: 1,
      ...(isWeb && isPhone && {
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      }),
    },
    scrollViewMobile: {
      width: '100%',
      maxWidth: '100%',
    },
    content: {
      flexGrow: 1,
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
      ...(isLaptopOrAbove && {
        paddingHorizontal: spacing.xl,
      }),
      ...(isPhone && {
        width: '100%',
        maxWidth: '100%',
      }),
      ...(isWeb && {
        maxWidth: '100%',
        boxSizing: 'border-box',
      }),
    },
    contentMobile: {
      padding: spacing.md,
      paddingTop: spacing.xl + 40,
      paddingBottom: spacing.xxl,
      width: '100%',
      maxWidth: '100%',
      ...(isWeb && {
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }),
    },
    contentTablet: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    headerBar: {
      backgroundColor: '#FFF',
      padding: isPhone ? spacing.md : isTablet ? spacing.lg : spacing.xl,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      marginBottom: isPhone ? spacing.md : isTablet ? spacing.lg : spacing.lg,
      width: '100%',
      maxWidth: '100%',
      ...(isPhone && {
        width: '100%',
        maxWidth: '100%',
      }),
      ...(isWeb && {
        boxSizing: 'border-box',
      }),
    },
    headerBarMobile: {
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    headerBarTablet: {
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    headerTitle: {
      fontSize: isPhone ? 18 : isTablet ? 20 : isLaptop ? 22 : isDesktop ? 24 : 26,
      fontWeight: '700',
      color: '#333',
      marginBottom: 4,
    },
    headerTitleMobile: {
      fontSize: 18,
    },
    headerSubtitle: {
      color: '#666',
      fontSize: isPhone ? 13 : isTablet ? 14 : 15,
    },
    headerSubtitleMobile: {
      fontSize: 13,
    },
    sectionNavContainer: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      marginBottom: isPhone ? spacing.md : isTablet ? spacing.lg : spacing.lg,
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100%',
      ...(isPhone && {
        width: '100%',
        maxWidth: '100%',
      }),
      ...(isWeb && {
        boxSizing: 'border-box',
      }),
    },
    sectionNavContainerMobile: {
      marginBottom: spacing.md,
    },
    sectionNavContainerTablet: {
      marginBottom: spacing.lg,
    },
    sectionNav: {
      paddingVertical: isPhone ? spacing.xs : isTablet ? spacing.sm : isLaptopOrAbove ? spacing.md : spacing.sm,
      ...(isPhone && {
        paddingHorizontal: spacing.xs,
      }),
    },
    sectionNavItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isPhone ? spacing.sm : isTablet ? spacing.md : isLaptopOrAbove ? spacing.xl : spacing.lg,
      paddingVertical: isPhone ? spacing.sm : isTablet ? spacing.md : isLaptopOrAbove ? spacing.md : spacing.md,
      marginHorizontal: isPhone ? spacing.xs : spacing.xs,
      borderRadius: borderRadius.md,
      gap: isPhone ? spacing.xs : isTablet ? spacing.xs : spacing.sm,
      minHeight: isPhone ? 44 : isTablet ? 48 : isLaptopOrAbove ? 52 : 48,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    sectionNavItemActive: {
      backgroundColor: colors.primary + '20'
    },
    sectionNavText: {
      ...typography.body2,
      color: colors.textSecondary,
      fontSize: isPhone ? 14 : isTablet ? 15 : isLaptopOrAbove ? 16 : 15,
      fontWeight: isPhone ? '500' : '400',
    },
    sectionNavTextActive: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: isPhone ? 14 : isTablet ? 15 : isLaptopOrAbove ? 16 : 15,
    },
    formContainer: {
      backgroundColor: '#FFF',
      padding: isPhone ? spacing.lg : isTablet ? spacing.lg : spacing.xl,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      marginBottom: spacing.lg,
      width: '100%',
      ...(isPhone && {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }),
      ...(isWeb && {
        boxSizing: 'border-box',
        maxWidth: '100%',
      }),
    },
    section: {
      marginBottom: isPhone ? spacing.xl : isTablet ? spacing.xl : isLaptopOrAbove ? spacing.xxl : spacing.xl,
      ...(isPhone && {
        width: '100%',
        maxWidth: '100%',
        marginTop: 0,
        paddingTop: 0,
      }),
    },
    sectionTitle: {
      ...typography.h5,
      fontWeight: '700',
      color: colors.text,
      marginBottom: isPhone ? spacing.lg : isTablet ? spacing.lg : isLaptopOrAbove ? spacing.lg : spacing.md,
      fontSize: isPhone ? 18 : isTablet ? 20 : isLaptop ? 22 : isDesktop ? 24 : 26,
      ...(isPhone && {
        marginTop: 0,
        marginBottom: spacing.lg,
        paddingBottom: 0,
        paddingTop: 0,
      }),
    },
    label: {
      ...typography.body2,
      fontWeight: '600',
      color: colors.text,
      marginBottom: isPhone ? 8 : isTablet ? spacing.sm : isLaptopOrAbove ? spacing.sm : spacing.xs,
      fontSize: isPhone ? 14 : isTablet ? 15 : isLaptopOrAbove ? 16 : 15,
      ...(isPhone && {
        marginTop: 0,
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: '100%',
        marginBottom: 8,
        marginTop: 0,
        lineHeight: 20,
        paddingBottom: 0,
        paddingTop: 0,
      }),
      ...(isWeb && isPhone && {
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        display: 'block',
        marginBottom: '8px',
      }),
    },
    required: {
      color: colors.error
    },
    row: {
      flexDirection: isPhone ? 'column' : isTablet ? 'row' : 'row',
      gap: isPhone ? 0 : isTablet ? spacing.md : isLaptopOrAbove ? spacing.lg : spacing.md,
      marginBottom: isPhone ? 0 : isTablet ? spacing.md : isLaptopOrAbove ? spacing.lg : spacing.md,
      ...(isPhone && {
        width: '100%',
        maxWidth: '100%',
        flexWrap: 'nowrap',
        marginTop: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }),
      ...(isLaptopOrAbove && {
        width: '100%',
      }),
      ...(isWeb && isPhone && {
        boxSizing: 'border-box',
      }),
    },
    halfInput: {
      flex: isPhone ? 0 : isTablet ? 1 : 1,
      width: isPhone ? '100%' : undefined,
      marginBottom: isPhone ? 20 : 0,
      ...(isPhone && {
        marginBottom: 20,
        width: '100%',
        maxWidth: '100%',
        marginTop: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }),
      ...(isLaptopOrAbove && {
        flex: 1,
      }),
      ...(isTablet && {
        flex: 1,
      }),
      ...(isWeb && isPhone && {
        boxSizing: 'border-box',
        display: 'block',
        marginBottom: '20px',
      }),
    },
    fullInput: {
      marginBottom: isPhone ? 20 : isTablet ? spacing.md : isLaptopOrAbove ? spacing.lg : spacing.md,
      ...(isPhone && {
        width: '100%',
        maxWidth: '100%',
        flex: 0,
        marginBottom: 20,
        marginTop: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }),
      ...(isLaptopOrAbove && {
        width: '100%',
      }),
      ...(isWeb && isPhone && {
        boxSizing: 'border-box',
        display: 'block',
        marginBottom: '20px',
      }),
    },
    input: {
      borderWidth: isPhone ? 1.5 : isTablet ? 1.5 : isLaptopOrAbove ? 2 : 2,
      borderColor: isPhone ? '#CBD5E0' : colors.border,
      borderRadius: borderRadius.md,
      fontSize: isPhone ? 16 : isTablet ? 16 : isLaptopOrAbove ? 16 : 16,
      color: isPhone ? '#0F172A' : colors.text,
      backgroundColor: '#FFFFFF',
      minHeight: isPhone ? 60 : isTablet ? 48 : isLaptopOrAbove ? 52 : 48,
      width: '100%',
      maxWidth: '100%',
      ...(isPhone && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderColor: '#CBD5E0',
        padding: 18,
        minHeight: 60,
        height: 60,
        width: '100%',
        maxWidth: '100%',
        ...(isWeb && {
          padding: '18px',
          minHeight: '60px',
          height: '60px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          lineHeight: '24px',
          verticalAlign: 'middle',
        }),
        ...(!isWeb && {
          textAlignVertical: 'center',
          includeFontPadding: false,
        }),
      }),
      ...(!isPhone && {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        textAlignVertical: 'center',
      }),
      ...(isWeb && {
        boxSizing: 'border-box',
      }),
      ...(isLaptopOrAbove && {
        fontSize: 16,
      }),
    },
    textArea: {
      minHeight: isPhone ? 120 : isTablet ? 100 : isLaptopOrAbove ? 120 : 80,
      textAlignVertical: 'top',
      paddingTop: isPhone ? 18 : spacing.md,
      paddingBottom: isPhone ? 18 : spacing.md,
      paddingHorizontal: isPhone ? spacing.md : spacing.md,
      width: '100%',
      maxWidth: '100%',
      ...(isPhone && {
        lineHeight: 24,
        paddingTop: 18,
        paddingBottom: 18,
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
        minHeight: 120,
        width: '100%',
        maxWidth: '100%',
        ...(isWeb && {
          paddingTop: '18px',
          paddingBottom: '18px',
          paddingLeft: '16px',
          paddingRight: '16px',
          minHeight: '120px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          lineHeight: '24px',
        }),
        ...(!isWeb && {
          includeFontPadding: false,
        }),
      }),
      ...(isWeb && {
        boxSizing: 'border-box',
      }),
    },
    errorText: {
      fontSize: isPhone ? 13 : 12,
      color: colors.error,
      marginTop: isPhone ? spacing.xs : 4,
      marginBottom: 0,
      ...(isPhone && {
        marginTop: spacing.xs,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        lineHeight: 18,
        width: '100%',
      }),
    },
    dropdownContainer: {
      position: 'relative',
      zIndex: 1000,
      ...(isPhone && {
        width: '100%',
        maxWidth: '100%',
        flex: 0,
      }),
      ...(isWeb && isPhone && {
        boxSizing: 'border-box',
      }),
    },
    dropdown: {
      borderWidth: isPhone ? 1.5 : isTablet ? 1.5 : isLaptopOrAbove ? 2 : 2,
      borderColor: isPhone ? '#CBD5E0' : colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      zIndex: 1,
      minHeight: isPhone ? 60 : isTablet ? 48 : isLaptopOrAbove ? 52 : 48,
      width: '100%',
      maxWidth: '100%',
      ...(isPhone && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderColor: '#CBD5E0',
        padding: 18,
        minHeight: 60,
        height: 60,
        width: '100%',
        maxWidth: '100%',
        ...(isWeb && {
          padding: '18px',
          minHeight: '60px',
          height: '60px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }),
      }),
      ...(!isPhone && {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
      }),
      ...(isWeb && {
        boxSizing: 'border-box',
      }),
    },
    dropdownText: {
      fontSize: isPhone ? 16 : isTablet ? 16 : isLaptopOrAbove ? 16 : 16,
      color: isPhone ? '#0F172A' : colors.text,
      flex: 1,
      ...(isPhone && {
        lineHeight: 24,
      }),
      ...(isWeb && isPhone && {
        lineHeight: '24px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }),
    },
    placeholder: {
      color: colors.textLight
    },
    dropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      width: '100%',
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      marginTop: 4,
      zIndex: 1001,
      maxHeight: isPhone ? 250 : isTablet ? 280 : isLaptopOrAbove ? 300 : 200,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      ...(isPhone && {
        maxHeight: 250,
      }),
    },
    dropdownItem: {
      padding: isPhone ? spacing.md : isTablet ? spacing.md : spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: isPhone ? 56 : isTablet ? 48 : isLaptopOrAbove ? 52 : 44,
      justifyContent: 'center',
      ...(isPhone && {
        paddingVertical: spacing.md,
        minHeight: 56,
      }),
    },
    dropdownItemText: {
      fontSize: isPhone ? 16 : isTablet ? 16 : isLaptopOrAbove ? 16 : 16,
      color: colors.text,
    },
    arrayContainer: {
      marginBottom: isPhone ? spacing.lg : isTablet ? spacing.lg : isLaptopOrAbove ? spacing.lg : spacing.md,
    },
    arrayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isPhone ? spacing.md : spacing.sm,
      ...(isPhone && {
        width: '100%',
        flexWrap: 'wrap',
      }),
    },
    arrayTitle: {
      ...typography.body2,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      fontSize: isPhone ? 14 : isTablet ? 15 : isLaptopOrAbove ? 16 : 15,
      ...(isPhone && {
        marginRight: spacing.sm,
        flexShrink: 1,
      }),
    },
    addButton: {
      backgroundColor: colors.primary,
      width: isPhone ? 36 : isTablet ? 32 : isLaptopOrAbove ? 32 : 28,
      height: isPhone ? 36 : isTablet ? 32 : isLaptopOrAbove ? 32 : 28,
      borderRadius: isPhone ? 18 : isTablet ? 16 : isLaptopOrAbove ? 16 : 14,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
      ...(isPhone && {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isPhone ? spacing.sm : spacing.sm,
      marginTop: isPhone ? spacing.xs : 0,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '20',
      paddingVertical: isPhone ? spacing.sm : spacing.xs,
      paddingHorizontal: isPhone ? spacing.sm : spacing.sm,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
      ...(isPhone && {
        minHeight: 36,
      }),
    },
    tagText: {
      ...typography.body2,
      color: colors.primary,
      fontWeight: '500',
      fontSize: isPhone ? 13 : isTablet ? 14 : isLaptopOrAbove ? 14 : 14,
      ...(isPhone && {
        fontSize: 13,
      }),
    },
    saveButton: {
      marginTop: isPhone ? spacing.xl : isTablet ? spacing.xl : isLaptopOrAbove ? spacing.xxl : spacing.xl,
      marginBottom: isPhone ? spacing.lg : isTablet ? spacing.xl : isLaptopOrAbove ? spacing.xxl : spacing.xl,
      ...(isPhone && {
        width: '100%',
      }),
      ...(isTablet && {
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
      }),
      ...(isLaptopOrAbove && {
        maxWidth: 400,
        alignSelf: 'center',
      }),
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end'
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      padding: isPhone ? spacing.lg : spacing.lg,
      paddingBottom: isPhone ? spacing.xl : spacing.lg,
      maxHeight: isPhone ? '90%' : '80%',
    },
    modalTitle: {
      ...typography.h5,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.md,
      fontSize: isPhone ? 16 : (isMobile ? 18 : 20),
    },
    quickSelectItem: {
      padding: spacing.md,
      backgroundColor: colors.border,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.xs,
    },
    quickSelectText: {
      ...typography.body2,
      color: colors.text,
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
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
      borderWidth: isPhone ? 1.5 : 2,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: isPhone ? spacing.md : spacing.md,
      fontSize: isPhone ? 16 : (isMobile ? 15 : 16),
      marginBottom: spacing.lg,
      minHeight: isPhone ? 50 : 44,
      color: colors.text,
      backgroundColor: '#FFFFFF',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: isPhone ? spacing.sm : spacing.md,
      justifyContent: 'flex-end',
      ...(isPhone && {
        marginTop: spacing.md,
      }),
    },
    modalButton: {
      paddingHorizontal: isPhone ? spacing.lg : spacing.lg,
      paddingVertical: isPhone ? spacing.md : spacing.sm,
      borderRadius: borderRadius.md,
      minHeight: isPhone ? 48 : undefined,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    modalButtonPrimary: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      ...typography.body2,
      fontWeight: '600',
      color: colors.textSecondary,
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
    },
    modalButtonTextPrimary: {
      color: colors.textWhite,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    }
  });
};

export default CompanyProfileScreen;

