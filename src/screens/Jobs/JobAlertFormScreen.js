import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';
import { 
  jobTitleOptions, 
  keySkillsOptions, 
  jobRolesOptions 
} from '../../data/jobPostFormConfig';
import { INDUSTRIES_DATA, getIndustries, getSubIndustries } from '../../data/industriesData';
import { DEPARTMENTS_DATA, getDepartments, getSubDepartments } from '../../data/departmentsData';

const JobAlertFormScreen = ({ navigation }) => {
  // Form state
  const [formData, setFormData] = useState({
    jobTitle: '',
    expectedSalary: '',
    presentJobStatus: '',
    experienceLevel: '',
    totalExperience: '',
    workOfficeLocation: '',
    industries: [],
    subIndustries: [],
    departments: [],
    subDepartments: [],
    jobRoles: [],
    keySkills: [],
    email: '',
    mobile: '',
    alertName: '',
    alertFrequency: '',
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Options data - converted from config
  const [industriesOptions, setIndustriesOptions] = useState([]);
  const [subIndustriesOptions, setSubIndustriesOptions] = useState([]);
  const [departmentsOptions, setDepartmentsOptions] = useState([]);
  const [subDepartmentsOptions, setSubDepartmentsOptions] = useState([]);

  // Dropdowns state
  const [showDropdown, setShowDropdown] = useState({
    presentJobStatus: false,
    experienceLevel: false,
    totalExperience: false,
    alertFrequency: false,
    jobTitle: false,
    industries: false,
    subIndustries: false,
    departments: false,
    subDepartments: false,
    location: false,
    jobRoles: false,
    keySkills: false,
  });

  // Dropdown options
  const presentJobStatusOptions = ['Working', 'Not Working', 'Internship', 'Apprenticeship'];
  const experienceLevelOptions = ['Fresher', 'Experienced'];
  const alertFrequencyOptions = ['Daily', 'Weekly', 'Monthly'];
  const totalExperienceOptions = [
    'Fresher', '1 Month', '2 Months', '3 Months', '6 Months', '9 Months',
    '1 Year', '1.5 Years', '2 Years', '2.5 Years', '3 Years', '3.5 Years',
    '4 Years', '4.5 Years', '5 Years', '5.5 Years', '6 Years', '6.5 Years',
    '7 Years', '7.5 Years', '8 Years', '8.5 Years', '9 Years', '9.5 Years',
    '10 Years', '10.5 Years', '11 Years', '11.5 Years', '12 Years', '12.5 Years',
    '13 Years', '13.5 Years', '14 Years', '14.5 Years', '15 Years', '15.5 Years',
    '16 Years', '16.5 Years', '17 Years', '17.5 Years', '18 Years', '18.5 Years',
    '19 Years', '19.5 Years', '20 Years', '20.5 Years', '21 Years', '21.5 Years',
    '22 Years', '22.5 Years', '23 Years', '23.5 Years', '24 Years', '24.5 Years',
    '25 Years', '25.5 Years', '26 Years', '26.5 Years', '27 Years', '27.5 Years',
    '28 Years', '28.5 Years', '29 Years', '29.5 Years', '30 Years', '30.5 Years',
    '31 Years', '31.5 Years', '32 Years', '32.5 Years', '33 Years', '33.5 Years',
    '34 Years', '34.5 Years', '35 Years', '35.5 Years', '36 Years', '36 Years Plus',
  ];

  // Helper function to normalize strings for value conversion
  const normalizeValue = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/\//g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    // Load industries from static data
    const industries = getIndustries().map(industry => ({
      value: normalizeValue(industry),
      label: industry,
    }));
    setIndustriesOptions(industries);

    // Load departments from static data
    const departments = getDepartments().map(department => ({
      value: normalizeValue(department),
      label: department,
    }));
    setDepartmentsOptions(departments);
  };

  // Update sub-industries when industries change
  useEffect(() => {
    if (formData.industries.length > 0) {
      // Get industry labels from values
      const industryLabels = formData.industries.map(value => {
        const industry = INDUSTRIES_DATA.find(ind => normalizeValue(ind.industry) === value);
        return industry ? industry.industry : null;
      }).filter(Boolean);

      // Get sub-industries for selected industries
      const subIndustries = getSubIndustries(industryLabels);
      const subIndustriesOpts = subIndustries.map(subInd => ({
        value: normalizeValue(subInd),
        label: subInd,
      }));
      setSubIndustriesOptions(subIndustriesOpts);
    } else {
      setSubIndustriesOptions([]);
      setFormData(prev => ({ ...prev, subIndustries: [] }));
    }
  }, [formData.industries]);

  // Update sub-departments when departments change
  useEffect(() => {
    if (formData.departments.length > 0) {
      // Get department labels from values
      const departmentLabels = formData.departments.map(value => {
        const department = DEPARTMENTS_DATA.find(dept => normalizeValue(dept.department) === value);
        return department ? department.department : null;
      }).filter(Boolean);

      // Get sub-departments for selected departments
      const subDepartments = getSubDepartments(departmentLabels);
      const subDepartmentsOpts = subDepartments.map(subDept => ({
        value: normalizeValue(subDept),
        label: subDept,
      }));
      setSubDepartmentsOptions(subDepartmentsOpts);
    } else {
      setSubDepartmentsOptions([]);
      setFormData(prev => ({ ...prev, subDepartments: [] }));
    }
  }, [formData.departments]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleMultiSelectToggle = (field, value, maxLength) => {
    const currentValues = formData[field];
    
    if (currentValues.includes(value)) {
      // Remove if already selected
      setFormData({
        ...formData,
        [field]: currentValues.filter(item => item !== value),
      });
    } else if (currentValues.length < maxLength) {
      // Add if not at max
      setFormData({
        ...formData,
        [field]: [...currentValues, value],
      });
    } else {
      Alert.alert(
        'Maximum Reached',
        `You can select up to ${maxLength} items`
      );
    }
  };

  const removeMultiSelectItem = (field, value) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter(item => item !== value),
    });
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setResumeFile(result);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const validateForm = () => {
    const required = [
      { field: 'jobTitle', label: 'Job Title' },
      { field: 'expectedSalary', label: 'Expected Salary' },
      { field: 'presentJobStatus', label: 'Present Job Status' },
      { field: 'experienceLevel', label: 'Experience Level' },
      { field: 'totalExperience', label: 'Total Experience' },
      { field: 'workOfficeLocation', label: 'Location' },
      { field: 'email', label: 'Email' },
      { field: 'mobile', label: 'Mobile Number' },
      { field: 'alertName', label: 'Alert Name' },
      { field: 'alertFrequency', label: 'Alert Frequency' },
    ];

    for (const { field, label } of required) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        Alert.alert('Required Field', `${label} is required`);
        return false;
      }
    }

    if (formData.industries.length === 0) {
      Alert.alert('Required Field', 'Please select at least one industry');
      return false;
    }

    if (formData.departments.length === 0) {
      Alert.alert('Required Field', 'Please select at least one department');
      return false;
    }

    if (formData.jobRoles.length === 0) {
      Alert.alert('Required Field', 'Please select at least one job role');
      return false;
    }

    if (formData.keySkills.length === 0) {
      Alert.alert('Required Field', 'Please select at least one key skill');
      return false;
    }

    // Validate email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    // Validate mobile
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare form data for API
      const submitData = new FormData();
      
      // Convert experience options to backend format
      const statusMap = {
        'Working': 'working',
        'Not Working': 'not-working',
        'Internship': 'internship',
        'Apprenticeship': 'apprenticeship',
      };

      const levelMap = {
        'Fresher': 'fresher',
        'Experienced': 'experienced',
      };

      const frequencyMap = {
        'Daily': 'daily',
        'Weekly': 'weekly',
        'Monthly': 'monthly',
      };

      const experienceMap = {
        'Fresher': 'fresher',
        '1 Month': '1-month',
        '2 Months': '2-months',
        '3 Months': '3-months',
        '6 Months': '6-months',
        '9 Months': '9-months',
        '1 Year': '1-year',
        '1.5 Years': '1.5-years',
        '2 Years': '2-years',
        '2.5 Years': '2.5-years',
        '3 Years': '3-years',
        '3.5 Years': '3.5-years',
        '4 Years': '4-years',
        '4.5 Years': '4.5-years',
        '5 Years': '5-years',
        '5.5 Years': '5.5-years',
        '6 Years': '6-years',
        '6.5 Years': '6.5-years',
        '7 Years': '7-years',
        '7.5 Years': '7.5-years',
        '8 Years': '8-years',
        '8.5 Years': '8.5-years',
        '9 Years': '9-years',
        '9.5 Years': '9.5-years',
        '10 Years': '10-years',
        '10.5 Years': '10.5-years',
        '11 Years': '11-years',
        '11.5 Years': '11.5-years',
        '12 Years': '12-years',
        '12.5 Years': '12.5-years',
        '13 Years': '13-years',
        '13.5 Years': '13.5-years',
        '14 Years': '14-years',
        '14.5 Years': '14.5-years',
        '15 Years': '15-years',
        '15.5 Years': '15.5-years',
        '16 Years': '16-years',
        '16.5 Years': '16.5-years',
        '17 Years': '17-years',
        '17.5 Years': '17.5-years',
        '18 Years': '18-years',
        '18.5 Years': '18.5-years',
        '19 Years': '19-years',
        '19.5 Years': '19.5-years',
        '20 Years': '20-years',
        '20.5 Years': '20.5-years',
        '21 Years': '21-years',
        '21.5 Years': '21.5-years',
        '22 Years': '22-years',
        '22.5 Years': '22.5-years',
        '23 Years': '23-years',
        '23.5 Years': '23.5-years',
        '24 Years': '24-years',
        '24.5 Years': '24.5-years',
        '25 Years': '25-years',
        '25.5 Years': '25.5-years',
        '26 Years': '26-years',
        '26.5 Years': '26.5-years',
        '27 Years': '27-years',
        '27.5 Years': '27.5-years',
        '28 Years': '28-years',
        '28.5 Years': '28.5-years',
        '29 Years': '29-years',
        '29.5 Years': '29.5-years',
        '30 Years': '30-years',
        '30.5 Years': '30.5-years',
        '31 Years': '31-years',
        '31.5 Years': '31.5-years',
        '32 Years': '32-years',
        '32.5 Years': '32.5-years',
        '33 Years': '33-years',
        '33.5 Years': '33.5-years',
        '34 Years': '34-years',
        '34.5 Years': '34.5-years',
        '35 Years': '35-years',
        '35.5 Years': '35.5-years',
        '36 Years': '36-years',
        '36 Years Plus': '36-years-plus',
      };

      // Get first industry and department as main (required by backend)
      const primaryIndustry = industriesOptions.find(ind => ind.value === formData.industries[0]);
      const primarySubIndustry = subIndustriesOptions.find(sub => sub.value === formData.subIndustries[0]) || primaryIndustry;
      const primaryDepartment = departmentsOptions.find(dept => dept.value === formData.departments[0]);
      
      submitData.append('jobTitle', formData.jobTitle);
      submitData.append('expectedSalary', formData.expectedSalary);
      submitData.append('presentJobStatus', statusMap[formData.presentJobStatus]);
      submitData.append('experienceLevel', levelMap[formData.experienceLevel]);
      submitData.append('totalExperience', experienceMap[formData.totalExperience]);
      submitData.append('workOfficeLocation', formData.workOfficeLocation);
      submitData.append('industry', primaryIndustry ? primaryIndustry.label : formData.industries[0]);
      submitData.append('subIndustry', primarySubIndustry ? primarySubIndustry.label : primaryIndustry.label);
      submitData.append('department', primaryDepartment ? primaryDepartment.label : formData.departments[0]);
      
      // Convert jobRoles array
      const rolesLabels = formData.jobRoles.map(value => {
        const role = jobRolesOptions.find(r => r.value === value);
        return role ? role.label : value;
      });
      submitData.append('jobRoles', JSON.stringify(rolesLabels));
      
      // Convert keySkills array
      const skillsLabels = formData.keySkills.map(value => {
        const skill = keySkillsOptions.find(s => s.value === value);
        return skill ? skill.label : value;
      });
      submitData.append('keySkills', JSON.stringify(skillsLabels));
      
      submitData.append('email', formData.email);
      submitData.append('mobile', formData.mobile);
      submitData.append('alertName', formData.alertName);
      submitData.append('alertFrequency', frequencyMap[formData.alertFrequency]);

      if (resumeFile) {
        submitData.append('resumeFile', {
          uri: resumeFile.uri,
          name: resumeFile.name,
          type: resumeFile.mimeType || 'application/pdf',
        });
      }

      const response = await api.createJobAlert(submitData);

      Alert.alert(
        'Success',
        'Job alert created successfully! You will receive notifications when matching jobs are posted.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating job alert:', error);
      Alert.alert('Error', error.message || 'Failed to create job alert');
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (field, options, placeholder) => (
    <>
      {showDropdown[field] && (
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setShowDropdown({ ...showDropdown, [field]: false })}
        />
      )}
      <View style={[styles.fieldContainer, showDropdown[field] && styles.fieldContainerActive]}>
        <Text style={styles.label}>
          {placeholder} <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDropdown({ ...showDropdown, [field]: !showDropdown[field] })}
        >
          <Text style={[styles.dropdownText, !formData[field] && styles.placeholderText]}>
            {formData[field] || `Select ${placeholder}`}
          </Text>
          <Ionicons
            name={showDropdown[field] ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {showDropdown[field] && (
          <View style={styles.dropdownMenu}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => {
                    handleInputChange(field, option);
                    setShowDropdown({ ...showDropdown, [field]: false });
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </>
  );

  const renderTextInput = (field, placeholder, keyboardType = 'default') => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {placeholder} <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.textInput}
        placeholder={`Enter ${placeholder}`}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textLight}
      />
    </View>
  );

  const renderAutoCompleteDropdown = (field, placeholder, options, maxLength = 1, required = true) => (
    <>
      {showDropdown[field] && (
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setShowDropdown({ ...showDropdown, [field]: false })}
        />
      )}
      <View style={[styles.fieldContainer, showDropdown[field] && styles.fieldContainerActive]}>
        <Text style={styles.label}>
          {placeholder} {required && <Text style={styles.required}>*</Text>}
          {maxLength > 1 && <Text style={styles.maxItems}> (Max {maxLength})</Text>}
        </Text>
        
        {/* Selected Items */}
        {maxLength > 1 && formData[field] && formData[field].length > 0 && (
          <View style={styles.selectedItemsContainer}>
            {formData[field].map((value, index) => {
              const option = options.find(opt => opt.value === value);
              return (
                <View key={index} style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>{option ? option.label : value}</Text>
                  <TouchableOpacity onPress={() => removeMultiSelectItem(field, value)}>
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDropdown({ ...showDropdown, [field]: !showDropdown[field] })}
        >
          <Text style={[styles.dropdownText, (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) && styles.placeholderText]}>
            {maxLength === 1 
              ? (formData[field] ? (options.find(opt => opt.value === formData[field])?.label || formData[field]) : `Type or Select ${placeholder}`)
              : `Type or Select ${placeholder}`
            }
          </Text>
          <Ionicons
            name={showDropdown[field] ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        
        {showDropdown[field] && (
          <View style={styles.dropdownMenu}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {options.map((option, index) => {
                const isSelected = maxLength === 1 
                  ? formData[field] === option.value
                  : formData[field].includes(option.value);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                    onPress={() => {
                      if (maxLength === 1) {
                        handleInputChange(field, option.value);
                        setShowDropdown({ ...showDropdown, [field]: false });
                      } else {
                        handleMultiSelectToggle(field, option.value, maxLength);
                      }
                    }}
                    disabled={maxLength > 1 && formData[field].length >= maxLength && !isSelected}
                  >
                    <Text style={[styles.dropdownOptionText, isSelected && styles.dropdownOptionTextSelected]}>
                      {option.label}
                    </Text>
                    {maxLength > 1 && isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Job Alert</Text>
          <Text style={styles.subtitle}>
            Set up your job preferences and get notified when matching jobs are posted
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Job Preferences Section */}
          <Text style={styles.sectionTitle}>Job Preferences</Text>

          {renderAutoCompleteDropdown('jobTitle', 'Job Title / Designation', jobTitleOptions, 1, true)}
          {renderTextInput('expectedSalary', 'Expected Annual Salary', 'numeric')}
          {renderDropdown('presentJobStatus', presentJobStatusOptions, 'Present Job Status')}
          {renderDropdown('experienceLevel', experienceLevelOptions, 'Experience Level')}
          {renderDropdown('totalExperience', totalExperienceOptions, 'Total Experience')}
          {renderTextInput('workOfficeLocation', 'Work Office / City Location', 'default')}

          {/* Industry & Department Section */}
          <Text style={styles.sectionTitle}>Industry & Department</Text>

          {renderAutoCompleteDropdown('industries', 'Industry / Sectors', industriesOptions, 10, true)}
          {renderAutoCompleteDropdown('subIndustries', 'Sub Industry / Sectors', subIndustriesOptions, 10, false)}
          {renderAutoCompleteDropdown('departments', 'Department / Role Category', departmentsOptions, 10, true)}
          {renderAutoCompleteDropdown('subDepartments', 'Sub-Departments', subDepartmentsOptions, 10, false)}
          {renderAutoCompleteDropdown('jobRoles', 'Job Roles', jobRolesOptions, 10, true)}
          {renderAutoCompleteDropdown('keySkills', 'Key Skills (Show 10-12 Suggestions)', keySkillsOptions, 10, true)}

          {/* Contact Information Section */}
          <Text style={styles.sectionTitle}>Contact Information</Text>

          {renderTextInput('email', 'Email ID', 'email-address')}
          {renderTextInput('mobile', 'Mobile Number', 'phone-pad')}
          {renderDropdown('alertFrequency', alertFrequencyOptions, 'Receive Job Alerts')}

          {/* Resume Upload */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Upload Resume (Optional)</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
              <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
              <Text style={styles.uploadButtonText}>
                {resumeFile ? resumeFile.name : 'Choose File'}
              </Text>
            </TouchableOpacity>
            {resumeFile && (
              <Text style={styles.fileInfo}>
                {resumeFile.name} ({Math.round(resumeFile.size / 1024)} KB)
              </Text>
            )}
          </View>

          {renderTextInput('alertName', 'Job Alert Name', 'default')}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <>
                <Ionicons name="notifications" size={20} color={colors.textWhite} />
                <Text style={styles.submitButtonText}>Create Job Alert</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerSection: {
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  formContainer: {
    padding: spacing.lg,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    ...typography.h5,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
    position: 'relative',
  },
  fieldContainerActive: {
    zIndex: 2000,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  label: {
    ...typography.body1,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  maxItems: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  textInput: {
    ...typography.body1,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    outlineStyle: 'none',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    minHeight: 52,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    ...typography.body1,
    color: '#111827',
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#6B7280',
    fontWeight: '400',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginTop: 8,
    zIndex: 1000,
    borderWidth: 3,
    borderColor: '#2563EB',
    maxHeight: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 350,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    minHeight: 56,
  },
  dropdownOptionSelected: {
    backgroundColor: '#3B82F6',
    borderLeftWidth: 6,
    borderLeftColor: '#1E40AF',
    borderBottomColor: '#2563EB',
  },
  dropdownOptionText: {
    ...typography.body1,
    color: '#111827',
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  dropdownOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  selectedItemText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  uploadButtonText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  fileInfo: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
    ...shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
});

export default JobAlertFormScreen;
