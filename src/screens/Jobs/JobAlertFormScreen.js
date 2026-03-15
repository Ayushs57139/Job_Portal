import React, { useState, useEffect, useRef } from 'react';
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
  Modal as RNModal,
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

const JobAlertFormScreen = ({ navigation, isModal = false }) => {
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

  // Floating dropdown portal state
  const [activeDropdown, setActiveDropdown] = useState(null); // { field, options, anchor, isMulti, maxLength, isAutoComplete }
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRefs = useRef({});

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
        // Handle file upload for both web and native
        if (Platform.OS === 'web') {
          // On web, expo-document-picker returns a File object
          if (resumeFile instanceof File) {
            submitData.append('resumeFile', resumeFile);
          } else if (resumeFile.file) {
            // Sometimes it's wrapped in a file property
            submitData.append('resumeFile', resumeFile.file);
          } else if (resumeFile.uri) {
            // Fallback: try to fetch and convert
            try {
              const response = await fetch(resumeFile.uri);
              const blob = await response.blob();
              const file = new File([blob], resumeFile.name || 'resume.pdf', {
                type: resumeFile.mimeType || 'application/pdf',
              });
              submitData.append('resumeFile', file);
            } catch (error) {
              console.error('Error converting file for web:', error);
            }
          }
        } else {
          // On native (React Native), use the object format
          submitData.append('resumeFile', {
            uri: resumeFile.uri,
            name: resumeFile.name,
            type: resumeFile.mimeType || 'application/pdf',
          });
        }
      }

      const response = await api.createJobAlert(submitData);

      if (response.success) {
        // Show success message - use web alert for immediate feedback on web
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const confirmed = window.confirm(
            `✅ Job Alert Created Successfully!\n\n${response.message || 'Your job alert has been created successfully! You will receive notifications when matching jobs are posted.'}\n\nClick OK to continue.`
          );
          if (confirmed) {
            navigation.goBack();
          }
        } else {
          // For mobile, use React Native Alert
          Alert.alert(
            '✅ Success',
            response.message || 'Job alert created successfully! You will receive notifications when matching jobs are posted.',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ],
            { cancelable: false }
          );
        }
      } else {
        throw new Error(response.message || 'Failed to create job alert');
      }
    } catch (error) {
      console.error('Error creating job alert:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to create job alert. Please check all fields and try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Open a floating dropdown by measuring the trigger button position
  const openFloatingDropdown = (field, options, isMulti = false, maxLength = 1, isAutoComplete = false) => {
    const ref = triggerRefs.current[field];
    if (ref && ref.measure) {
      ref.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPos({ top: pageY + height + 4, left: pageX, width });
        setActiveDropdown({ field, options, isMulti, maxLength, isAutoComplete });
      });
    } else {
      setActiveDropdown({ field, options, isMulti, maxLength, isAutoComplete });
    }
  };

  const closeFloatingDropdown = () => setActiveDropdown(null);

  // Floating dropdown modal — renders above everything, no clipping issues
  const renderFloatingDropdown = () => {
    if (!activeDropdown) return null;
    const { field, options, isMulti, maxLength, isAutoComplete } = activeDropdown;
    return (
      <RNModal transparent visible animationType="none" onRequestClose={closeFloatingDropdown}>
        <TouchableOpacity style={DD.overlay} activeOpacity={1} onPress={closeFloatingDropdown} />
        <View style={[DD.panel, Platform.OS === 'web' && { position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }]}>
          <View style={DD.panelHeader}>
            <Text style={DD.panelTitle}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</Text>
            <TouchableOpacity onPress={closeFloatingDropdown} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView style={DD.list} showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {options.map((opt, i) => {
              const val = isAutoComplete ? opt.value : opt;
              const label = isAutoComplete ? opt.label : opt;
              const isSel = isMulti
                ? formData[field]?.includes(val)
                : formData[field] === val;
              const isDisabled = isMulti && formData[field]?.length >= maxLength && !isSel;
              return (
                <TouchableOpacity
                  key={i}
                  style={[DD.item, isSel && DD.itemActive, isDisabled && DD.itemDisabled]}
                  disabled={isDisabled}
                  onPress={() => {
                    if (isMulti) {
                      handleMultiSelectToggle(field, val, maxLength);
                    } else {
                      handleInputChange(field, val);
                      closeFloatingDropdown();
                    }
                  }}
                >
                  <Text style={[DD.itemText, isSel && DD.itemTextActive, isDisabled && DD.itemTextDisabled]}>{label}</Text>
                  {isSel && (
                    <View style={DD.check}>
                      <Ionicons name="checkmark" size={11} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {isMulti && (
            <TouchableOpacity style={DD.doneBtn} onPress={closeFloatingDropdown}>
              <Text style={DD.doneBtnText}>Done ({formData[field]?.length || 0} selected)</Text>
            </TouchableOpacity>
          )}
        </View>
      </RNModal>
    );
  };

  const renderDropdown = (field, options, label, isRequired = true) => (
    <View style={S.field}>
      <Text style={S.label}>{label}{isRequired && <Text style={S.req}> *</Text>}</Text>
      <TouchableOpacity
        ref={r => { triggerRefs.current[field] = r; }}
        style={[S.select, activeDropdown?.field === field && S.selectOpen]}
        onPress={() => activeDropdown?.field === field ? closeFloatingDropdown() : openFloatingDropdown(field, options)}
      >
        <Text style={[S.selectText, !formData[field] && S.placeholder]}>
          {formData[field] || `Select ${label}`}
        </Text>
        <Ionicons name={activeDropdown?.field === field ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  const renderTextInput = (field, label, keyboardType = 'default', isRequired = true) => (
    <View style={S.field}>
      <Text style={S.label}>{label}{isRequired && <Text style={S.req}> *</Text>}</Text>
      <TextInput
        style={S.input}
        placeholder={`Enter ${label}`}
        value={formData[field]}
        onChangeText={v => handleInputChange(field, v)}
        keyboardType={keyboardType}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  const renderAutoCompleteDropdown = (field, label, options, maxLength = 1, isRequired = true) => (
    <View style={S.field}>
      <View style={S.labelRow}>
        <Text style={S.label}>{label}{isRequired && <Text style={S.req}> *</Text>}</Text>
        {maxLength > 1 && <Text style={S.maxTag}>max {maxLength}</Text>}
      </View>

      {maxLength > 1 && formData[field]?.length > 0 && (
        <View style={S.chips}>
          {formData[field].map((val, i) => {
            const opt = options.find(o => o.value === val);
            return (
              <View key={i} style={S.chip}>
                <Text style={S.chipText}>{opt ? opt.label : val}</Text>
                <TouchableOpacity onPress={() => removeMultiSelectItem(field, val)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                  <Ionicons name="close" size={12} color="#4F46E5" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        ref={r => { triggerRefs.current[field] = r; }}
        style={[S.select, activeDropdown?.field === field && S.selectOpen]}
        onPress={() => activeDropdown?.field === field ? closeFloatingDropdown() : openFloatingDropdown(field, options, maxLength > 1, maxLength, true)}
      >
        <Text style={[S.selectText, (!formData[field] || (Array.isArray(formData[field]) && !formData[field].length)) && S.placeholder]}>
          {maxLength === 1
            ? (formData[field] ? (options.find(o => o.value === formData[field])?.label || formData[field]) : `Select ${label}`)
            : `Select ${label}`}
        </Text>
        <Ionicons name={activeDropdown?.field === field ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={S.root}>
      {!isModal && <Header />}
      {renderFloatingDropdown()}
      <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={Platform.OS === 'web'}>

        {/* Hero - only shown when not in modal (modal has its own header) */}
        {!isModal && (
          <View style={S.hero}>
            <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={18} color="#4F46E5" />
            </TouchableOpacity>
            <View style={S.heroCenter}>
              <View style={S.heroIcon}>
                <Ionicons name="notifications" size={22} color="#4F46E5" />
              </View>
              <Text style={S.heroTitle}>Create Job Alert</Text>
              <Text style={S.heroSub}>Set up your preferences and get notified when matching jobs are posted</Text>
            </View>
          </View>
        )}

        <View style={S.body}>

          {/* Section: Job Preferences */}
          <View style={S.section}>
            <View style={S.sectionHead}>
              <View style={S.sectionDot} />
              <Text style={S.sectionTitle}>Job Preferences</Text>
            </View>
            <View style={S.card}>
              {renderAutoCompleteDropdown('jobTitle', 'Job Title / Designation', jobTitleOptions, 1, true)}
              {renderTextInput('expectedSalary', 'Expected Annual Salary', 'numeric')}
              {renderDropdown('presentJobStatus', presentJobStatusOptions, 'Present Job Status')}
              {renderDropdown('experienceLevel', experienceLevelOptions, 'Experience Level')}
              {renderDropdown('totalExperience', totalExperienceOptions, 'Total Experience')}
              {renderTextInput('workOfficeLocation', 'Work Location / City', 'default')}
            </View>
          </View>

          {/* Section: Industry & Department */}
          <View style={S.section}>
            <View style={S.sectionHead}>
              <View style={S.sectionDot} />
              <Text style={S.sectionTitle}>Industry & Department</Text>
            </View>
            <View style={S.card}>
              {renderAutoCompleteDropdown('industries', 'Industry / Sectors', industriesOptions, 10, true)}
              {renderAutoCompleteDropdown('subIndustries', 'Sub Industry', subIndustriesOptions, 10, false)}
              {renderAutoCompleteDropdown('departments', 'Department', departmentsOptions, 10, true)}
              {renderAutoCompleteDropdown('subDepartments', 'Sub-Departments', subDepartmentsOptions, 10, false)}
              {renderAutoCompleteDropdown('jobRoles', 'Job Roles', jobRolesOptions, 10, true)}
              {renderAutoCompleteDropdown('keySkills', 'Key Skills', keySkillsOptions, 10, true)}
            </View>
          </View>

          {/* Section: Contact & Alert */}
          <View style={S.section}>
            <View style={S.sectionHead}>
              <View style={S.sectionDot} />
              <Text style={S.sectionTitle}>Contact & Alert Settings</Text>
            </View>
            <View style={S.card}>
              {renderTextInput('email', 'Email Address', 'email-address')}
              {renderTextInput('mobile', 'Mobile Number', 'phone-pad')}
              {renderDropdown('alertFrequency', alertFrequencyOptions, 'Alert Frequency')}
              {renderTextInput('alertName', 'Alert Name', 'default')}

              {/* Resume Upload */}
              <View style={S.field}>
                <Text style={S.label}>Upload Resume <Text style={S.optional}>(Optional)</Text></Text>
                <TouchableOpacity style={S.uploadBox} onPress={pickDocument}>
                  <Ionicons name="cloud-upload-outline" size={22} color="#9CA3AF" />
                  <View>
                    <Text style={S.uploadText}>{resumeFile ? resumeFile.name : 'Click to upload resume'}</Text>
                    <Text style={S.uploadSub}>PDF, DOC, DOCX supported</Text>
                  </View>
                </TouchableOpacity>
                {resumeFile && (
                  <View style={S.fileRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                    <Text style={S.fileName}>{resumeFile.name} ({Math.round(resumeFile.size / 1024)} KB)</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[S.submitBtn, loading && S.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="notifications" size={17} color="#fff" />
                  <Text style={S.submitText}>Create Job Alert</Text>
                </>
            }
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // Hero
  hero: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  heroCenter: { alignItems: 'center' },
  heroIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 6 },
  heroSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, maxWidth: 420 },

  // Body
  body: { maxWidth: 760, width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingTop: 24 },

  // Section
  section: { marginBottom: 20 },
  sectionHead: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
    paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  sectionDot: { width: 4, height: 20, borderRadius: 2, backgroundColor: '#4F46E5' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', letterSpacing: 0.3, textTransform: 'uppercase' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    padding: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Field
  field: { marginBottom: 16, position: 'relative' },
  fieldActive: { zIndex: 100 },
  backdrop: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'transparent', zIndex: 99,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6, letterSpacing: 0.2, textTransform: 'uppercase' },
  req: { color: '#EF4444' },
  optional: { fontSize: 11, color: '#94A3B8', fontWeight: '400', textTransform: 'none' },
  maxTag: {
    fontSize: 11, color: '#6B7280', backgroundColor: '#F3F4F6',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4,
  },

  // Text input
  input: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#0F172A', backgroundColor: '#FAFBFF',
    outlineStyle: 'none',
  },

  // Select / dropdown trigger
  select: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    backgroundColor: '#FAFBFF', minHeight: 44,
  },
  selectOpen: { borderColor: '#4F46E5', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  selectText: { fontSize: 14, color: '#0F172A', flex: 1 },
  placeholder: { color: '#94A3B8' },

  // Dropdown menu
  menu: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    backgroundColor: '#fff',
    borderWidth: 1.5, borderTopWidth: 0, borderColor: '#4F46E5',
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    maxHeight: 240, zIndex: 200,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 8,
    overflow: 'hidden',
  },
  menuScroll: { maxHeight: 240 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  menuItemActive: { backgroundColor: '#EEF2FF' },
  menuItemText: { fontSize: 14, color: '#374151', flex: 1 },
  menuItemTextActive: { color: '#4F46E5', fontWeight: '600' },
  checkDot: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#4F46E5',
    justifyContent: 'center', alignItems: 'center',
  },

  // Chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: '#C7D2FE',
  },
  chipText: { fontSize: 12, color: '#4338CA', fontWeight: '600' },

  // Upload
  uploadBox: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderColor: '#CBD5E1', borderStyle: 'dashed',
    borderRadius: 10, padding: 18, backgroundColor: '#F8FAFC',
  },
  uploadText: { fontSize: 13, color: '#334155', fontWeight: '600' },
  uploadSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  fileName: { fontSize: 12, color: '#10B981', flex: 1 },

  // Submit
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#4F46E5', borderRadius: 12,
    paddingVertical: 15, paddingHorizontal: 32,
    marginTop: 8, marginBottom: 32,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
});

// Floating dropdown panel styles
const DD = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'transparent',
  },
  panel: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 16,
    overflow: 'hidden',
    // fallback center for non-web
    alignSelf: 'center',
    width: '88%',
    maxWidth: 520,
    top: '20%',
    maxHeight: 380,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFBFF',
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  list: { maxHeight: 280 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  itemActive: { backgroundColor: '#EEF2FF' },
  itemDisabled: { opacity: 0.4 },
  itemText: { fontSize: 14, color: '#334155', flex: 1 },
  itemTextActive: { color: '#4F46E5', fontWeight: '600' },
  itemTextDisabled: { color: '#94A3B8' },
  check: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#4F46E5',
    justifyContent: 'center', alignItems: 'center',
  },
  doneBtn: {
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#4F46E5',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
});

export default JobAlertFormScreen;
