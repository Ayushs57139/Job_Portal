import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { DropdownField, MultiSelectField, AutoCompleteField } from '../../components/FormFields';
import UserSidebar from '../../components/UserSidebar';
import api from '../../config/api';
import DateTimePicker from '@react-native-community/datetimepicker';
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

const UserProfileScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(isWeb && !isPhone);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      dateOfBirth: new Date('1990-01-01'),
      gender: '',
      maritalStatus: '',
    email: '',
    phone: '',
      whatsappNumber: '',
      whatsappUpdates: false,
      guardian: '',
      guardianName: '',
      category: '',
      disabilityStatus: '',
      disabilities: [],
      militaryExperience: '',
      bikeScootyAvailable: [],
      drivingLicense: [],
      assetRequirements: []
    },
    locationInfo: {
      currentState: '',
      currentCity: '',
      currentAddress: '',
      currentLocality: '',
      areaPincode: '',
      homeTownCity: '',
      homeTownState: '',
      homeTownLocality: '',
      homeTownPincode: '',
      preferredLanguage: [],
      englishFluencyLevel: '',
      preferredJobLocations: []
    },
    professional: {
      currentJobTitle: '',
      currentSalary: '',
      expectedSalary: '',
      expectedJobRoles: [],
      experienceLevel: '',
      totalExperience: '',
      jobStatus: '',
      jobTitle: '',
      keySkills: [],
      jobProfileDescription: '',
      jobRoles: [],
      departmentCategory: [],
      currentCompany: '',
      industries: [],
      companyType: '',
      employmentType: '',
      jobType: '',
      jobModeType: [],
      jobShiftType: [],
      currentlyWorking: false,
      workStartDate: '',
      workEndDate: '',
      workLocation: '',
      noticePeriod: '',
      skills: [],
      certifications: []
    },
    education: [],
    additionalInfo: {
      onlineSocialProfiles: {
        facebook: [],
        instagram: [],
        linkedin: [],
        twitter: [],
        telegram: [],
        whatsapp: [],
        youtube: []
      },
      portfolio: {
        names: [],
        links: []
      },
      projectPortfolio: [],
      bio: ''
    }
  });

  // Master Data Options
  const [masterData, setMasterData] = useState({
    genders: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' }
    ],
    maritalStatuses: [
      { value: 'Single', label: 'Single' },
      { value: 'Married', label: 'Married' },
      { value: 'Divorced', label: 'Divorced' },
      { value: 'Widowed', label: 'Widowed' }
    ],
    guardians: [
      { value: 'Father', label: 'Father' },
      { value: 'Mother', label: 'Mother' },
      { value: 'Brother', label: 'Brother' },
      { value: 'Sister', label: 'Sister' },
      { value: 'Husband', label: 'Husband' },
      { value: 'Wife', label: 'Wife' },
      { value: 'Guardian', label: 'Guardian' },
      { value: 'Uncle', label: 'Uncle' },
      { value: 'Aunt', label: 'Aunt' },
      { value: 'Other', label: 'Other' }
    ],
    categories: [
      { value: 'Scheduled Caste - SC', label: 'Scheduled Caste - SC' },
      { value: 'Scheduled Tribe - ST', label: 'Scheduled Tribe - ST' },
      { value: 'OBC - Creamy', label: 'OBC - Creamy' },
      { value: 'OBC – Non Creamy', label: 'OBC – Non Creamy' },
      { value: 'General', label: 'General' },
      { value: 'EWS', label: 'EWS' },
      { value: 'Other', label: 'Other' }
    ],
    disabilityStatuses: [
      { value: 'Have Disability', label: 'Have Disability' },
      { value: 'Don\'t Have Disability', label: 'Don\'t Have Disability' }
    ],
    disabilities: [
      { value: 'Blindness', label: 'Blindness' },
      { value: 'Low Vision', label: 'Low Vision' },
      { value: 'Physical Disability', label: 'Physical Disability' },
      { value: 'Locomotor Disability', label: 'Locomotor Disability' },
      { value: 'Hearing Impairment', label: 'Hearing Impairment' },
      { value: 'Speech and Language Disability', label: 'Speech and Language Disability' },
      { value: 'Other', label: 'Other' }
    ],
    militaryExperiences: [
      { value: 'Currently Serving', label: 'Currently Serving' },
      { value: 'Previously Served', label: 'Previously Served' },
      { value: 'Never Served', label: 'Never Served' }
    ],
    bikeOptions: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
      { value: 'I Can Arrange', label: 'I Can Arrange' },
      { value: 'Learning Available', label: 'Learning Available' },
      { value: 'I Can Apply', label: 'I Can Apply' }
    ],
    drivingLicenses: [
      { value: 'LMV License', label: 'LMV License' },
      { value: 'Heavy Driver License', label: 'Heavy Driver License' },
      { value: 'Crane Operator License', label: 'Crane Operator License' },
      { value: 'Electrical License', label: 'Electrical License' }
    ],
    experienceLevels: [
      { value: 'Fresher', label: 'Fresher' },
      { value: 'Experienced', label: 'Experienced' },
      { value: 'Internship', label: 'Internship' },
      { value: 'Apprenticeship', label: 'Apprenticeship' }
    ],
    totalExperiences: [
      { value: 'Fresher', label: 'Fresher' },
      { value: '1 Month', label: '1 Month' },
      { value: '2 Months', label: '2 Months' },
      { value: '3 Months', label: '3 Months' },
      { value: '6 Months', label: '6 Months' },
      { value: '9 Months', label: '9 Months' },
      { value: '1 Year', label: '1 Year' },
      { value: '1.5 Years', label: '1.5 Years' },
      { value: '2 Years', label: '2 Years' },
      { value: '2.5 Years', label: '2.5 Years' },
      { value: '3 Years', label: '3 Years' },
      { value: '3.5 Years', label: '3.5 Years' },
      { value: '4 Years', label: '4 Years' },
      { value: '4.5 Years', label: '4.5 Years' },
      { value: '5 Years', label: '5 Years' },
      { value: '5.5 Years', label: '5.5 Years' },
      { value: '6 Years', label: '6 Years' },
      { value: '6.5 Years', label: '6.5 Years' },
      { value: '7 Years', label: '7 Years' },
      { value: '7.5 Years', label: '7.5 Years' },
      { value: '8 Years', label: '8 Years' },
      { value: '8.5 Years', label: '8.5 Years' },
      { value: '9 Years', label: '9 Years' },
      { value: '9.5 Years', label: '9.5 Years' },
      { value: '10 Years', label: '10 Years' },
      { value: '15 Years', label: '15 Years' },
      { value: '20 Years', label: '20 Years' },
      { value: '36 Years Plus', label: '36 Years Plus' }
    ],
    jobStatuses: [
      { value: 'Working', label: 'Working' },
      { value: 'Not Working', label: 'Not Working' },
      { value: 'Internship', label: 'Internship' },
      { value: 'Apprenticeship', label: 'Apprenticeship' }
    ],
    companyTypes: [
      { value: 'Indian MNC', label: 'Indian MNC' },
      { value: 'Foreign MNC', label: 'Foreign MNC' },
      { value: 'Govt / PSU', label: 'Govt / PSU' },
      { value: 'Startup', label: 'Startup' },
      { value: 'Unicorn', label: 'Unicorn' },
      { value: 'Corporate', label: 'Corporate' },
      { value: 'Consultancy', label: 'Consultancy' }
    ],
    employmentTypes: [
      { value: 'Permanent', label: 'Permanent' },
      { value: 'Temporary/Contract Job', label: 'Temporary/Contract Job' },
      { value: 'Internship', label: 'Internship' },
      { value: 'Apprenticeship', label: 'Apprenticeship' },
      { value: 'NAPS', label: 'NAPS' },
      { value: 'Freelance', label: 'Freelance' },
      { value: 'Trainee', label: 'Trainee' },
      { value: 'Fresher', label: 'Fresher' }
    ],
    jobTypes: [
      { value: 'Full Time', label: 'Full Time' },
      { value: 'Part Time', label: 'Part Time' }
    ],
    jobModes: [
      { value: 'Work From Home', label: 'Work From Home' },
      { value: 'Work From Office', label: 'Work From Office' },
      { value: 'Work From Field', label: 'Work From Field' },
      { value: 'Hybrid', label: 'Hybrid' },
      { value: 'Remote', label: 'Remote' }
    ],
    jobShifts: [
      { value: 'Day Shift', label: 'Day Shift' },
      { value: 'Night Shift', label: 'Night Shift' },
      { value: 'Rotational Shift', label: 'Rotational Shift' },
      { value: 'Split Shift', label: 'Split Shift' }
    ],
    noticePeriods: [
      { value: 'Immediate Joining', label: 'Immediate Joining' },
      { value: '7 Days', label: '7 Days' },
      { value: '15 Days', label: '15 Days' },
      { value: '30 Days', label: '30 Days' },
      { value: '45 Days', label: '45 Days' },
      { value: '60 Days', label: '60 Days' },
      { value: '90 Days', label: '90 Days' },
      { value: '90 Days Plus', label: '90 Days Plus' },
      { value: 'Serving Notice Period', label: 'Serving Notice Period' }
    ],
    educationLevels: [
      { value: 'No Education', label: 'No Education' },
      { value: 'Below 10th', label: 'Below 10th' },
      { value: '10th Pass', label: '10th Pass' },
      { value: '12th Pass', label: '12th Pass' },
      { value: 'ITI', label: 'ITI' },
      { value: 'Diploma', label: 'Diploma' },
      { value: 'Graduate', label: 'Graduate' },
      { value: 'Post Graduate', label: 'Post Graduate' },
      { value: 'PPG', label: 'PPG' },
      { value: 'Doctorate', label: 'Doctorate' },
      { value: 'Other', label: 'Other' }
    ],
    educationStatuses: [
      { value: 'Pursuing / Running', label: 'Pursuing / Running' },
      { value: 'Pass Out / Completed', label: 'Pass Out / Completed' },
      { value: 'No Education', label: 'No Education' }
    ],
    educationTypes: [
      { value: 'Full Time', label: 'Full Time' },
      { value: 'Part Time', label: 'Part Time' },
      { value: 'Correspondence', label: 'Correspondence' }
    ],
    languages: [
      { value: 'Hindi', label: 'Hindi' },
      { value: 'English', label: 'English' },
      { value: 'Kannada', label: 'Kannada' },
      { value: 'Telugu', label: 'Telugu' },
      { value: 'Marathi', label: 'Marathi' },
      { value: 'Gujarati', label: 'Gujarati' },
      { value: 'Bengali', label: 'Bengali' },
      { value: 'Punjabi', label: 'Punjabi' },
      { value: 'Tamil', label: 'Tamil' },
      { value: 'Malayalam', label: 'Malayalam' }
    ],
    englishFluencyLevels: [
      { value: 'Fluent English', label: 'Fluent English' },
      { value: 'Good English', label: 'Good English' },
      { value: 'Basic English', label: 'Basic English' },
      { value: 'No English', label: 'No English' }
    ],
    industries: [],
    subIndustries: [],
    departments: [],
    subDepartments: [],
    jobTitles: [],
    jobRoles: [],
    skills: [],
    locations: []
  });

  // Selected master data for dynamic loading
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    loadCurrentUser();
    loadProfile();
    loadMasterData();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUserFromStorage();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const getUserInitials = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
    }
    if (currentUser?.firstName) {
      return currentUser.firstName[0].toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    if (getPlatform().OS === 'web') {
      // For web, use window.confirm
      if (window.confirm('Are you sure you want to logout?')) {
        try {
          await api.logout();
        } catch (error) {
          console.log('Logout error:', error);
        }
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } else {
      // For mobile, use Alert
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await api.logout();
              } catch (error) {
                console.log('Logout error:', error);
              } finally {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }
            },
          },
        ]
      );
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await api.getUserProfile();
      if (response.success && response.profile) {
        const profile = response.profile;
        
        // Transform profile data to form data
      setFormData({
          personalInfo: {
            fullName: profile.personalInfo?.fullName || '',
            dateOfBirth: profile.personalInfo?.dateOfBirth ? new Date(profile.personalInfo.dateOfBirth) : new Date('1990-01-01'),
            gender: profile.personalInfo?.gender || '',
            maritalStatus: profile.personalInfo?.maritalStatus || '',
            email: profile.personalInfo?.email || '',
            phone: profile.personalInfo?.phone || '',
            whatsappNumber: profile.personalInfo?.whatsappNumber || '',
            whatsappUpdates: profile.personalInfo?.whatsappUpdates || false,
            guardian: profile.personalInfo?.guardian || '',
            guardianName: profile.personalInfo?.guardianName || '',
            category: profile.personalInfo?.category || '',
            disabilityStatus: profile.personalInfo?.disabilityStatus || '',
            disabilities: profile.personalInfo?.disabilities?.map(d => ({ value: d, label: d })) || [],
            militaryExperience: profile.personalInfo?.militaryExperience || '',
            bikeScootyAvailable: profile.personalInfo?.bikeScootyAvailable?.map(b => ({ value: b, label: b })) || [],
            drivingLicense: profile.personalInfo?.drivingLicense?.map(d => ({ value: d, label: d })) || [],
            assetRequirements: profile.personalInfo?.assetRequirements?.map(a => ({ value: a, label: a })) || []
          },
          locationInfo: {
            currentState: profile.locationInfo?.currentState || '',
            currentCity: profile.locationInfo?.currentCity || '',
            currentAddress: profile.locationInfo?.currentAddress || '',
            currentLocality: profile.locationInfo?.currentLocality || '',
            areaPincode: profile.locationInfo?.areaPincode || '',
            homeTownCity: profile.locationInfo?.homeTownCity || '',
            homeTownState: profile.locationInfo?.homeTownState || '',
            homeTownLocality: profile.locationInfo?.homeTownLocality || '',
            homeTownPincode: profile.locationInfo?.homeTownPincode || '',
            preferredLanguage: profile.locationInfo?.preferredLanguage?.map(l => ({ value: l, label: l })) || [],
            englishFluencyLevel: profile.locationInfo?.englishFluencyLevel || '',
            preferredJobLocations: profile.locationInfo?.preferredJobLocations || []
          },
          professional: {
            currentJobTitle: profile.professional?.currentJobTitle || '',
            currentSalary: profile.professional?.currentSalary?.toString() || '',
            expectedSalary: profile.professional?.expectedSalary?.toString() || '',
            expectedJobRoles: profile.professional?.expectedJobRoles || [],
            experienceLevel: profile.professional?.experienceLevel || '',
            totalExperience: profile.professional?.totalExperience || '',
            jobStatus: profile.professional?.jobStatus || '',
            jobTitle: profile.professional?.jobTitle || '',
            keySkills: profile.professional?.keySkills || [],
            jobProfileDescription: profile.professional?.jobProfileDescription || '',
            jobRoles: profile.professional?.jobRoles || [],
            departmentCategory: profile.professional?.departmentCategory || [],
            currentCompany: profile.professional?.currentCompany || '',
            industries: profile.professional?.industries || [],
            companyType: profile.professional?.companyType || '',
            employmentType: profile.professional?.employmentType || '',
            jobType: profile.professional?.jobType || '',
            jobModeType: profile.professional?.jobModeType || [],
            jobShiftType: profile.professional?.jobShiftType || [],
            currentlyWorking: profile.professional?.currentlyWorking || false,
            workStartDate: profile.professional?.workStartDate || '',
            workEndDate: profile.professional?.workEndDate || '',
            workLocation: profile.professional?.workLocation || '',
            noticePeriod: profile.professional?.noticePeriod || '',
            skills: profile.professional?.skills || [],
            certifications: profile.professional?.certifications || []
          },
          education: profile.education && profile.education.length > 0 
            ? profile.education.map(edu => ({
                educationLevel: edu.educationLevel || '',
                degree: edu.degree || '',
                specialization: edu.specialization || '',
                institution: edu.institution || '',
                educationStatus: edu.educationStatus || '',
                startDate: edu.startDate || '',
                endDate: edu.endDate || '',
                educationType: edu.educationType || '',
                educationMedium: edu.educationMedium || '',
                marksType: edu.marksType || '',
                marksValue: edu.marksValue || '',
                isHighestEducation: edu.isHighestEducation || false
              }))
            : [{
                educationLevel: '',
                degree: '',
                specialization: '',
                institution: '',
                educationStatus: '',
                startDate: '',
                endDate: '',
                educationType: '',
                educationMedium: '',
                marksType: '',
                marksValue: '',
                isHighestEducation: false
              }],
          additionalInfo: {
            onlineSocialProfiles: {
              facebook: Array.isArray(profile.additionalInfo?.onlineSocialProfiles?.facebook) 
                ? profile.additionalInfo.onlineSocialProfiles.facebook 
                : profile.additionalInfo?.onlineSocialProfiles?.facebook ? [profile.additionalInfo.onlineSocialProfiles.facebook] : [],
              instagram: Array.isArray(profile.additionalInfo?.onlineSocialProfiles?.instagram) 
                ? profile.additionalInfo.onlineSocialProfiles.instagram 
                : profile.additionalInfo?.onlineSocialProfiles?.instagram ? [profile.additionalInfo.onlineSocialProfiles.instagram] : [],
              linkedin: Array.isArray(profile.additionalInfo?.onlineSocialProfiles?.linkedin) 
                ? profile.additionalInfo.onlineSocialProfiles.linkedin 
                : profile.additionalInfo?.onlineSocialProfiles?.linkedin ? [profile.additionalInfo.onlineSocialProfiles.linkedin] : [],
              twitter: Array.isArray(profile.additionalInfo?.onlineSocialProfiles?.twitter) 
                ? profile.additionalInfo.onlineSocialProfiles.twitter 
                : profile.additionalInfo?.onlineSocialProfiles?.twitter ? [profile.additionalInfo.onlineSocialProfiles.twitter] : [],
              telegram: Array.isArray(profile.additionalInfo?.onlineSocialProfiles?.telegram) 
                ? profile.additionalInfo.onlineSocialProfiles.telegram 
                : profile.additionalInfo?.onlineSocialProfiles?.telegram ? [profile.additionalInfo.onlineSocialProfiles.telegram] : [],
              whatsapp: Array.isArray(profile.additionalInfo?.onlineSocialProfiles?.whatsapp) 
                ? profile.additionalInfo.onlineSocialProfiles.whatsapp 
                : profile.additionalInfo?.onlineSocialProfiles?.whatsapp ? [profile.additionalInfo.onlineSocialProfiles.whatsapp] : [],
              youtube: Array.isArray(profile.additionalInfo?.onlineSocialProfiles?.youtube) 
                ? profile.additionalInfo.onlineSocialProfiles.youtube 
                : profile.additionalInfo?.onlineSocialProfiles?.youtube ? [profile.additionalInfo.onlineSocialProfiles.youtube] : []
            },
            portfolio: {
              names: Array.isArray(profile.additionalInfo?.portfolio?.names) 
                ? profile.additionalInfo.portfolio.names 
                : profile.additionalInfo?.portfolio?.name ? [profile.additionalInfo.portfolio.name] : [],
              links: Array.isArray(profile.additionalInfo?.portfolio?.links) 
                ? profile.additionalInfo.portfolio.links 
                : profile.additionalInfo?.portfolio?.link ? [profile.additionalInfo.portfolio.link] : []
            },
            projectPortfolio: profile.additionalInfo?.projectPortfolio || [],
            bio: profile.additionalInfo?.bio || ''
          }
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // If profile doesn't exist, start with empty form
      const user = await api.getCurrentUserFromStorage();
      if (user) {
        setFormData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            email: user.email || '',
            phone: user.phone || '',
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
          }
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMasterData = async () => {
    try {
      // Load Job Titles from master data
      try {
        const jobTitlesRes = await api.getJobTitles(50);
        if (jobTitlesRes && jobTitlesRes.success && jobTitlesRes.jobTitles) {
          setMasterData(prev => ({
            ...prev,
            jobTitles: jobTitlesRes.jobTitles.map(jt => ({ 
              value: jt.name || jt, 
              label: jt.name || jt 
            }))
          }));
        }
    } catch (error) {
        console.error('Error loading job titles:', error);
      }

      // Load Job Roles from master data
      try {
        const jobRolesRes = await api.getAllJobRoles();
        if (jobRolesRes && jobRolesRes.success && jobRolesRes.data) {
          setMasterData(prev => ({
            ...prev,
            jobRoles: jobRolesRes.data.map(jr => ({ 
              value: jr.name || jr, 
              label: jr.name || jr 
            }))
          }));
        }
      } catch (error) {
        console.error('Error loading job roles:', error);
      }

      // Load Industries from master data
      try {
        const industriesRes = await api.getAllIndustries();
        console.log('Industries response:', industriesRes);
        if (industriesRes && industriesRes.success && industriesRes.data) {
          const industriesList = Array.isArray(industriesRes.data) 
            ? industriesRes.data.map(ind => {
                const name = ind.name || ind;
                return { value: name, label: name };
              })
            : [];
          console.log('Setting industries:', industriesList);
          setMasterData(prev => ({
            ...prev,
            industries: industriesList
          }));
        } else {
          console.warn('Industries response missing success or data:', industriesRes);
        }
      } catch (error) {
        console.error('Error loading industries:', error);
      }

      // Load Departments from master data
      try {
        const deptsRes = await api.getAllDepartments();
        console.log('Departments response:', deptsRes);
        if (deptsRes && deptsRes.success && deptsRes.data) {
          const departmentsList = Array.isArray(deptsRes.data) 
            ? deptsRes.data.map(dept => {
                const name = dept.name || dept;
                return { value: name, label: name };
              })
            : [];
          console.log('Setting departments:', departmentsList);
          setMasterData(prev => ({
            ...prev,
            departments: departmentsList
          }));
        } else {
          console.warn('Departments response missing success or data:', deptsRes);
        }
      } catch (error) {
        console.error('Error loading departments:', error);
      }

      // Load Skills from master data
      try {
        const skillsRes = await api.getPopularSkills(50);
        if (skillsRes && skillsRes.success && skillsRes.skills) {
          setMasterData(prev => ({
            ...prev,
            skills: skillsRes.skills.map(skill => ({ 
              value: skill.name || skill, 
              label: skill.name || skill 
            }))
          }));
        }
      } catch (error) {
        console.error('Error loading skills:', error);
      }
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  // Load sub-industries when industry is selected
  const loadSubIndustries = async (industryName) => {
    if (!industryName) {
      setMasterData(prev => ({ ...prev, subIndustries: [] }));
      return;
    }
    try {
      const res = await api.getIndustrySubcategories(industryName);
      if (res.success) {
        setMasterData(prev => ({
          ...prev,
          subIndustries: res.data.map(sub => ({ value: sub, label: sub }))
        }));
      }
    } catch (error) {
      console.error('Error loading sub-industries:', error);
    }
  };

  // Load sub-departments when department is selected
  const loadSubDepartments = async (departmentName) => {
    if (!departmentName) {
      setMasterData(prev => ({ ...prev, subDepartments: [] }));
      return;
    }
    try {
      const res = await api.getDepartmentSubcategories(departmentName);
      if (res.success) {
        setMasterData(prev => ({
          ...prev,
          subDepartments: res.data.subcategories?.map(sub => ({ value: sub, label: sub })) || []
        }));
      }
    } catch (error) {
      console.error('Error loading sub-departments:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Transform form data for API
      const profileData = {
        personalInfo: {
          ...formData.personalInfo,
          dateOfBirth: formData.personalInfo.dateOfBirth.toISOString(),
          disabilities: formData.personalInfo.disabilities.map(d => d.value || d),
          bikeScootyAvailable: formData.personalInfo.bikeScootyAvailable.map(b => b.value || b),
          drivingLicense: formData.personalInfo.drivingLicense.map(d => d.value || d),
          assetRequirements: formData.personalInfo.assetRequirements.map(a => a.value || a)
        },
        locationInfo: {
          ...formData.locationInfo,
          preferredLanguage: formData.locationInfo.preferredLanguage.map(l => l.value || l)
        },
        professional: {
          ...formData.professional,
          currentSalary: formData.professional.currentSalary ? parseInt(formData.professional.currentSalary) : undefined,
          expectedSalary: formData.professional.expectedSalary ? parseInt(formData.professional.expectedSalary) : undefined,
          jobModeType: formData.professional.jobModeType.map(j => j.value || j),
          jobShiftType: formData.professional.jobShiftType.map(j => j.value || j)
        },
        education: formData.education,
        additionalInfo: formData.additionalInfo
      };

      await api.saveUserProfile(profileData);
      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
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

  const updateNestedField = (section, subSection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [field]: value
        }
      }
    }));
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const renderPersonalInfoSection = () => (
    <View style={dynamicStyles.section}>
      <Text style={dynamicStyles.sectionTitle}>Personal Information</Text>
      
        <Input
        label="Candidate Full Name"
        value={formData.personalInfo.fullName}
        onChangeText={(text) => updateField('personalInfo', 'fullName', text)}
        placeholder="Enter full name"
          icon="person-outline"
        required
        />

        <Input
        label="Mobile Number"
        value={formData.personalInfo.phone}
        onChangeText={(text) => updateField('personalInfo', 'phone', text)}
        placeholder="Enter mobile number"
        icon="call-outline"
        keyboardType="phone-pad"
        required
      />

        <Input
        label="Email ID"
        value={formData.personalInfo.email}
        onChangeText={(text) => updateField('personalInfo', 'email', text)}
        placeholder="Enter email"
          icon="mail-outline"
          keyboardType="email-address"
        required
        />

        <Input
        label="WhatsApp Number (For Job Updates)"
        value={formData.personalInfo.whatsappNumber}
        onChangeText={(text) => updateField('personalInfo', 'whatsappNumber', text)}
        placeholder="Enter WhatsApp number"
        icon="logo-whatsapp"
          keyboardType="phone-pad"
        />

      <TouchableOpacity
        style={dynamicStyles.datePickerButton}
        onPress={() => {
          setDatePickerMode('dateOfBirth');
          setShowDatePicker(true);
        }}
      >
        <Ionicons name="calendar-outline" size={isPhone ? 18 : 20} color={colors.textSecondary} style={dynamicStyles.icon} />
        <Text style={[dynamicStyles.datePickerText, !formData.personalInfo.dateOfBirth && dynamicStyles.placeholderText]}>
          {formData.personalInfo.dateOfBirth ? formatDate(formData.personalInfo.dateOfBirth) : 'Date Of Birth'}
        </Text>
      </TouchableOpacity>

      <DropdownField
        label="Gender"
        value={masterData.genders.find(g => g.value === formData.personalInfo.gender)}
        options={masterData.genders}
        onSelect={(option) => updateField('personalInfo', 'gender', option.value)}
        placeholder="Select Gender"
        required
      />

      <DropdownField
        label="Marital Status"
        value={masterData.maritalStatuses.find(m => m.value === formData.personalInfo.maritalStatus)}
        options={masterData.maritalStatuses}
        onSelect={(option) => updateField('personalInfo', 'maritalStatus', option.value)}
        placeholder="Select Marital Status"
      />

      <DropdownField
        label="Select Guardian"
        value={masterData.guardians.find(g => g.value === formData.personalInfo.guardian)}
        options={masterData.guardians}
        onSelect={(option) => updateField('personalInfo', 'guardian', option.value)}
        placeholder="Select Guardian"
      />

      <Input
        label="Name Of Guardian"
        value={formData.personalInfo.guardianName}
        onChangeText={(text) => updateField('personalInfo', 'guardianName', text)}
        placeholder="Enter guardian name"
        icon="person-outline"
      />

      <DropdownField
        label="Category"
        value={masterData.categories.find(c => c.value === formData.personalInfo.category)}
        options={masterData.categories}
        onSelect={(option) => updateField('personalInfo', 'category', option.value)}
        placeholder="Select Category"
      />

      <DropdownField
        label="Disability Status"
        value={masterData.disabilityStatuses.find(d => d.value === formData.personalInfo.disabilityStatus)}
        options={masterData.disabilityStatuses}
        onSelect={(option) => updateField('personalInfo', 'disabilityStatus', option.value)}
        placeholder="Select Disability Status"
      />

      {formData.personalInfo.disabilityStatus === 'Have Disability' && (
        <MultiSelectField
          label="Select Disability / Differently-abled"
          value={formData.personalInfo.disabilities}
          options={masterData.disabilities}
          onSelect={(selected) => updateField('personalInfo', 'disabilities', selected)}
          placeholder="Select disabilities"
        />
      )}

      <DropdownField
        label="Military Experience"
        value={masterData.militaryExperiences.find(m => m.value === formData.personalInfo.militaryExperience)}
        options={masterData.militaryExperiences}
        onSelect={(option) => updateField('personalInfo', 'militaryExperience', option.value)}
        placeholder="Select Military Experience"
      />

      <MultiSelectField
        label="Bike/Scooty Available"
        value={formData.personalInfo.bikeScootyAvailable}
        options={masterData.bikeOptions}
        onSelect={(selected) => updateField('personalInfo', 'bikeScootyAvailable', selected)}
        placeholder="Select options"
        maxSelections={10}
      />

      <MultiSelectField
        label="Driving License"
        value={formData.personalInfo.drivingLicense}
        options={masterData.drivingLicenses}
        onSelect={(selected) => updateField('personalInfo', 'drivingLicense', selected)}
        placeholder="Select driving licenses"
        maxSelections={10}
      />

      <MultiSelectField
        label="Asset Requirements/Availability"
        value={formData.personalInfo.assetRequirements}
        options={[
          { value: 'Laptop', label: 'Laptop' },
          { value: 'Android Smart Phone', label: 'Android Smart Phone' },
          { value: 'iOS Smart Phone', label: 'iOS Smart Phone' },
          { value: 'Camera', label: 'Camera' },
          { value: 'Two Wheeler', label: 'Two Wheeler' },
          { value: 'Bike', label: 'Bike' },
          { value: 'E-Bike', label: 'E-Bike' },
          { value: 'Auto', label: 'Auto' },
          { value: 'Four Wheeler', label: 'Four Wheeler' }
        ]}
        onSelect={(selected) => updateField('personalInfo', 'assetRequirements', selected)}
        placeholder="Select assets"
        maxSelections={10}
      />
    </View>
  );

  const renderProfessionalSection = () => (
    <View style={dynamicStyles.section}>
      <Text style={dynamicStyles.sectionTitle}>Professional Information</Text>
      
      <AutoCompleteField
        label="Current Job Title/Designation"
        value={formData.professional.currentJobTitle}
        onChangeText={async (text) => {
          updateField('professional', 'currentJobTitle', text);
          // Search job titles dynamically as user types
          if (text.length >= 2) {
            try {
              const searchRes = await api.searchJobTitles(text, 10);
              if (searchRes.success) {
                setMasterData(prev => ({
                  ...prev,
                  jobTitles: searchRes.jobTitles.map(jt => ({ value: jt.name, label: jt.name }))
                }));
              }
            } catch (error) {
              console.error('Error searching job titles:', error);
            }
          }
        }}
        suggestions={masterData.jobTitles}
        placeholder="Type or select job title"
        allowAddNew
        onAddNew={async (newTitle) => {
          try {
            await api.request('/job-titles', {
              method: 'POST',
              body: JSON.stringify({ name: newTitle })
            });
            // Reload job titles
            const jobTitlesRes = await api.getJobTitles(50);
            if (jobTitlesRes.success) {
              setMasterData(prev => ({
                ...prev,
                jobTitles: jobTitlesRes.jobTitles.map(jt => ({ value: jt.name, label: jt.name }))
              }));
            }
            updateField('professional', 'currentJobTitle', newTitle);
          } catch (error) {
            Alert.alert('Error', 'Failed to add new job title');
          }
        }}
      />

      <Input
        label="Current Annual Salary"
        value={formData.professional.currentSalary}
        onChangeText={(text) => updateField('professional', 'currentSalary', text)}
        placeholder="Enter current salary"
        icon="cash-outline"
        keyboardType="numeric"
      />

      <Input
        label="Expected Annual Salary"
        value={formData.professional.expectedSalary}
        onChangeText={(text) => updateField('professional', 'expectedSalary', text)}
        placeholder="Enter expected salary"
        icon="cash-outline"
        keyboardType="numeric"
      />

      <MultiSelectField
        label="Expected Job Roles (Up to 10)"
        value={formData.professional.expectedJobRoles.map(r => ({ value: r, label: r }))}
        options={masterData.jobRoles}
        onSelect={(selected) => updateField('professional', 'expectedJobRoles', selected.map(s => s.value || s.label))}
        placeholder="Select expected job roles"
        maxSelections={10}
        allowAddNew
        onSearch={async (query) => {
          try {
            const searchRes = await api.searchJobRoles(query, 10);
            if (searchRes.success) {
              const searchResults = searchRes.jobRoles.map(jr => ({ value: jr.name, label: jr.name }));
              setMasterData(prev => ({
                ...prev,
                jobRoles: searchResults
              }));
              return searchResults;
            }
          } catch (error) {
            console.error('Error searching job roles:', error);
          }
          return [];
        }}
        onAddNew={async (newRole) => {
          try {
            await api.request('/job-roles', {
              method: 'POST',
              body: JSON.stringify({ name: newRole })
            });
            // Reload job roles
            const jobRolesRes = await api.getAllJobRoles();
            if (jobRolesRes.success) {
              setMasterData(prev => ({
                ...prev,
                jobRoles: jobRolesRes.data.map(jr => ({ value: jr.name, label: jr.name }))
              }));
            }
            // Add to selected
            updateField('professional', 'expectedJobRoles', [...formData.professional.expectedJobRoles, newRole]);
          } catch (error) {
            Alert.alert('Error', 'Failed to add new job role');
          }
        }}
      />

      <DropdownField
        label="Present Job Status"
        value={masterData.jobStatuses.find(j => j.value === formData.professional.jobStatus)}
        options={masterData.jobStatuses}
        onSelect={(option) => updateField('professional', 'jobStatus', option.value)}
        placeholder="Select job status"
      />

      <DropdownField
        label="Experience Level"
        value={masterData.experienceLevels.find(e => e.value === formData.professional.experienceLevel)}
        options={masterData.experienceLevels}
        onSelect={(option) => updateField('professional', 'experienceLevel', option.value)}
        placeholder="Select experience level"
      />

      <DropdownField
        label="Total Experience"
        value={masterData.totalExperiences.find(t => t.value === formData.professional.totalExperience)}
        options={masterData.totalExperiences}
        onSelect={(option) => updateField('professional', 'totalExperience', option.value)}
        placeholder="Select total experience"
      />

      <AutoCompleteField
        label="Job Title / Designation"
        value={formData.professional.jobTitle}
        onChangeText={async (text) => {
          updateField('professional', 'jobTitle', text);
          // Search job titles dynamically as user types
          if (text.length >= 2) {
            try {
              const searchRes = await api.searchJobTitles(text, 10);
              if (searchRes.success) {
                setMasterData(prev => ({
                  ...prev,
                  jobTitles: searchRes.jobTitles.map(jt => ({ value: jt.name, label: jt.name }))
                }));
              }
            } catch (error) {
              console.error('Error searching job titles:', error);
            }
          }
        }}
        suggestions={masterData.jobTitles}
        placeholder="Type or select job title"
        allowAddNew
        onAddNew={async (newTitle) => {
          try {
            await api.request('/job-titles', {
              method: 'POST',
              body: JSON.stringify({ name: newTitle })
            });
            updateField('professional', 'jobTitle', newTitle);
          } catch (error) {
            Alert.alert('Error', 'Failed to add new job title');
          }
        }}
      />

      <MultiSelectField
        label="Key Skills Name (Up to 10-12)"
        value={formData.professional.keySkills.map(s => ({ value: s, label: s }))}
        options={masterData.skills}
        onSelect={(selected) => updateField('professional', 'keySkills', selected.map(s => s.value || s.label))}
        placeholder="Select key skills"
        maxSelections={12}
        allowAddNew
        onSearch={async (query) => {
          try {
            const searchRes = await api.searchSkills(query, 12);
            if (searchRes.success) {
              const searchResults = searchRes.skills.map(skill => ({ value: skill.name, label: skill.name }));
              setMasterData(prev => ({
                ...prev,
                skills: searchResults
              }));
              return searchResults;
            }
          } catch (error) {
            console.error('Error searching skills:', error);
          }
          return [];
        }}
        onAddNew={async (newSkill) => {
          try {
            await api.request('/skills', {
              method: 'POST',
              body: JSON.stringify({ name: newSkill })
            });
            // Reload skills
            const skillsRes = await api.getPopularSkills(50);
            if (skillsRes.success) {
              setMasterData(prev => ({
                ...prev,
                skills: skillsRes.skills.map(skill => ({ value: skill.name, label: skill.name }))
              }));
            }
            // Add to selected
            updateField('professional', 'keySkills', [...formData.professional.keySkills, newSkill]);
          } catch (error) {
            Alert.alert('Error', 'Failed to add new skill');
          }
        }}
      />

      <Input
        label="Job Profile Description"
        value={formData.professional.jobProfileDescription}
        onChangeText={(text) => updateField('professional', 'jobProfileDescription', text)}
        placeholder="Enter job profile description (up to 2000 words)"
        icon="document-text-outline"
        multiline
        numberOfLines={6}
      />

      <MultiSelectField
        label="Job Roles"
        value={formData.professional.jobRoles.map(r => ({ value: r, label: r }))}
        options={masterData.jobRoles}
        onSelect={(selected) => updateField('professional', 'jobRoles', selected.map(s => s.value || s.label))}
        placeholder="Select job roles"
        maxSelections={10}
        allowAddNew
        onSearch={async (query) => {
          try {
            const searchRes = await api.searchJobRoles(query, 10);
            if (searchRes.success) {
              const searchResults = searchRes.jobRoles.map(jr => ({ value: jr.name, label: jr.name }));
              setMasterData(prev => ({
                ...prev,
                jobRoles: searchResults
              }));
              return searchResults;
            }
          } catch (error) {
            console.error('Error searching job roles:', error);
          }
          return [];
        }}
        onAddNew={async (newRole) => {
          try {
            await api.request('/job-roles', {
              method: 'POST',
              body: JSON.stringify({ name: newRole })
            });
            // Reload job roles
            const jobRolesRes = await api.getAllJobRoles();
            if (jobRolesRes.success) {
              setMasterData(prev => ({
                ...prev,
                jobRoles: jobRolesRes.data.map(jr => ({ value: jr.name, label: jr.name }))
              }));
            }
            // Add to selected
            updateField('professional', 'jobRoles', [...formData.professional.jobRoles, newRole]);
          } catch (error) {
            Alert.alert('Error', 'Failed to add new job role');
          }
        }}
      />

      <MultiSelectField
        label="Department Category"
        value={formData.professional.departmentCategory.map(d => ({ value: d, label: d }))}
        options={masterData.departments}
        onSelect={async (selected) => {
          updateField('professional', 'departmentCategory', selected.map(s => s.value || s.label));
          // Load sub-departments for the first selected department
          if (selected.length > 0) {
            const firstDept = selected[0].value || selected[0].label;
            setSelectedDepartment(firstDept);
            await loadSubDepartments(firstDept);
          }
        }}
        placeholder="Select departments"
        maxSelections={5}
      />

      {masterData.subDepartments.length > 0 && (
        <MultiSelectField
          label="Sub-Department Category"
          value={formData.professional.departmentCategory.filter(d => 
            masterData.subDepartments.some(sd => sd.value === d || sd.label === d)
          ).map(d => ({ value: d, label: d }))}
          options={masterData.subDepartments}
          onSelect={(selected) => {
            // Merge with existing department categories
            const existing = formData.professional.departmentCategory.filter(d =>
              !masterData.subDepartments.some(sd => sd.value === d || sd.label === d)
            );
            updateField('professional', 'departmentCategory', [
              ...existing,
              ...selected.map(s => s.value || s.label)
            ]);
          }}
          placeholder="Select sub-departments"
          maxSelections={5}
        />
      )}

      <Input
        label="Current/Last Company Name"
        value={formData.professional.currentCompany}
        onChangeText={(text) => updateField('professional', 'currentCompany', text)}
        placeholder="Enter company name"
        icon="business-outline"
      />

      <MultiSelectField
        label="Industry / Sectors"
        value={formData.professional.industries.map(i => ({ value: i, label: i }))}
        options={masterData.industries}
        onSelect={async (selected) => {
          updateField('professional', 'industries', selected.map(s => s.value || s.label));
          // Load sub-industries for the first selected industry
          if (selected.length > 0) {
            const firstIndustry = selected[0].value || selected[0].label;
            setSelectedIndustry(firstIndustry);
            await loadSubIndustries(firstIndustry);
          }
        }}
        placeholder="Select industries"
        maxSelections={5}
      />

      {masterData.subIndustries.length > 0 && (
        <MultiSelectField
          label="Sub-Industry / Sub-Sectors"
          value={formData.professional.industries.filter(i => 
            masterData.subIndustries.some(si => si.value === i || si.label === i)
          ).map(i => ({ value: i, label: i }))}
          options={masterData.subIndustries}
          onSelect={(selected) => {
            // Merge with existing industries
            const existing = formData.professional.industries.filter(i =>
              !masterData.subIndustries.some(si => si.value === i || si.label === i)
            );
            updateField('professional', 'industries', [
              ...existing,
              ...selected.map(s => s.value || s.label)
            ]);
          }}
          placeholder="Select sub-industries"
          maxSelections={5}
        />
      )}

      <DropdownField
        label="Current Company Type"
        value={masterData.companyTypes.find(c => c.value === formData.professional.companyType)}
        options={masterData.companyTypes}
        onSelect={(option) => updateField('professional', 'companyType', option.value)}
        placeholder="Select company type"
      />

      <DropdownField
        label="Current/Last Employment Type"
        value={masterData.employmentTypes.find(e => e.value === formData.professional.employmentType)}
        options={masterData.employmentTypes}
        onSelect={(option) => updateField('professional', 'employmentType', option.value)}
        placeholder="Select employment type"
      />

      <DropdownField
        label="Job Type"
        value={masterData.jobTypes.find(j => j.value === formData.professional.jobType)}
        options={masterData.jobTypes}
        onSelect={(option) => updateField('professional', 'jobType', option.value)}
        placeholder="Select job type"
      />

      <MultiSelectField
        label="Job Mode Type"
        value={formData.professional.jobModeType.map(j => ({ value: j, label: j }))}
        options={masterData.jobModes}
        onSelect={(selected) => updateField('professional', 'jobModeType', selected)}
        placeholder="Select job modes"
        maxSelections={3}
      />

      <MultiSelectField
        label="Job Shift Type"
        value={formData.professional.jobShiftType.map(j => ({ value: j, label: j }))}
        options={masterData.jobShifts}
        onSelect={(selected) => updateField('professional', 'jobShiftType', selected)}
        placeholder="Select job shifts"
        maxSelections={3}
      />

      <View style={dynamicStyles.checkboxContainer}>
        <TouchableOpacity
          style={dynamicStyles.checkbox}
          onPress={() => updateField('professional', 'currentlyWorking', !formData.professional.currentlyWorking)}
        >
          <Ionicons
            name={formData.professional.currentlyWorking ? 'checkbox' : 'square-outline'}
            size={24}
            color={formData.professional.currentlyWorking ? colors.primary : colors.textSecondary}
          />
          <Text style={dynamicStyles.checkboxLabel}>Currently working in this company?</Text>
        </TouchableOpacity>
      </View>

      <Input
        label="Work Start Date (MM-YYYY)"
        value={formData.professional.workStartDate}
        onChangeText={(text) => updateField('professional', 'workStartDate', text)}
        placeholder="e.g., 06-2013"
        icon="calendar-outline"
      />

      <Input
        label="Work End Date (MM-YYYY)"
        value={formData.professional.workEndDate}
        onChangeText={(text) => updateField('professional', 'workEndDate', text)}
        placeholder="e.g., 07-2015"
        icon="calendar-outline"
      />

      <AutoCompleteField
        label="Work Office / City Location"
        value={formData.professional.workLocation}
        onChangeText={(text) => updateField('professional', 'workLocation', text)}
        suggestions={masterData.locations}
        placeholder="Type or select location"
        allowAddNew
      />

      <DropdownField
        label="Notice Period / Availability to Join"
        value={masterData.noticePeriods.find(n => n.value === formData.professional.noticePeriod)}
        options={masterData.noticePeriods}
        onSelect={(option) => updateField('professional', 'noticePeriod', option.value)}
        placeholder="Select notice period"
      />
    </View>
  );

  // Education constants - same as JobApplicationScreen
  const BASIC_EDUCATION_LEVELS = ['No Education', 'Below 10th', '10th Pass', '12th Pass'];
  
  const ITI_COURSE_OPTIONS = [
    'ITI', 'Other',
  ];

  const ITI_SPECIALIZATION_OPTIONS = [
    'Electrical', 'Electronics', 'Fitter', 'Wireman', 'Diesel Mechanic', 'Mechanical',
    'Electrician', 'Mechanic Motor Vehicle', 'Draughtsman (Mechanical)', 'Draughtsman (Civil)',
    'Tool & Die Maker', 'Mechanic Machine Tool Maintenance', 'Electronics Mechanic',
    'Mechanic (Refrigeration & Air-Conditioning)', 'Welder', 'COPA', 'Stenographer',
    'Hair & Skin Care', 'Secretarial Practice', 'Dress Making', 'Sewing Technology',
    'Plumber', 'Painter', 'Mechanic Two and Three Wheeler', 'Other',
  ];

  const DIPLOMA_COURSE_OPTIONS = [
    'Diploma', 'D.Pharma', 'Advanced Diploma', 'Other',
  ];

  const GRADUATE_COURSE_OPTIONS = [
    'B.A', 'B.Arch', 'B.A Hons.', 'B.Com', 'B.Com Hons.', 'B.Design', 'B.Ed', 'B.EI.Ed',
    'B.E/B.Tech', 'B.F Tech', 'B.Sc', 'B.Sc Hons.', 'B.P.Ed', 'B.U.M.S', 'B.Voc',
    'B.Pharma', 'B.Pharma Hons.', 'Bachelor', 'BASc', 'BAF', 'BAMS', 'BBA', 'BBA Hons.',
    'BBM', 'BBM Hons.', 'BBE', 'BCA', 'BDS', 'BFA', 'BHM', 'BHMS', 'BHMCT', 'BPA',
    'BMS', 'MBBS', 'LLB', 'LLB Hons.', 'Pharma.D', 'BS', 'BVSC',
    'Dual Degree (B.E/B.Tech + M.E/M.Tech)', 'Other',
  ];

  const POST_GRADUATE_COURSE_OPTIONS = [
    'M.A', 'M.Sc', 'M.Com', 'M.Tech/M.E', 'MBA', 'MCA', 'M.Pharm', 'M.Ed', 'M.Arch',
    'M.Des', 'M.Phil', 'MDS', 'MS', 'MD', 'PGDM', 'PGDCA', 'LLM', 'M.F.A', 'M.S.W',
    'M.P.Ed', 'M.V.Sc', 'M.Planning', 'M.Lib.Sc', 'M.J.M.C', 'M.H.M', 'Master',
    'Dual Degree (M.E/M.Tech + Ph.D)', 'Other',
  ];

  const DOCTORATE_COURSE_OPTIONS = [
    'Doctorate/PhD', 'M.Phil', 'Other',
  ];

  // Get courses based on education level
  const getCoursesForEducationLevel = (educationLevel) => {
    if (!educationLevel || BASIC_EDUCATION_LEVELS.includes(educationLevel)) {
      return [];
    }
    
    switch (educationLevel) {
      case 'ITI':
        return ITI_COURSE_OPTIONS.map(c => ({ value: c, label: c }));
      case 'Diploma':
        return DIPLOMA_COURSE_OPTIONS.map(c => ({ value: c, label: c }));
      case 'Graduate':
        return GRADUATE_COURSE_OPTIONS.map(c => ({ value: c, label: c }));
      case 'Post Graduate':
        return POST_GRADUATE_COURSE_OPTIONS.map(c => ({ value: c, label: c }));
      case 'Doctorate':
        return DOCTORATE_COURSE_OPTIONS.map(c => ({ value: c, label: c }));
      default:
        return [];
    }
  };

  // Graduate/Post Graduate Specialization options (comprehensive list)
  const GRADUATE_SPECIALIZATION_OPTIONS = [
    'Accounting', 'Accounting and Finance', 'Accounting And Taxation Of Management', 'Accounting & Commerce',
    'Accident and Emergency Care Technology', 'Accountancy', 'Acting', 'Actuarial Management', 'Actuarial Sciences',
    'Advanced Accountancy', 'Advertising and Brand Management', 'Aeronautical', 'Aeronautical Science', 'Aerospace',
    'Aerospace Engineering', 'Agri Business Management', 'Agribusiness / Marketing', 'Agricultural',
    'Agricultural Biotechnology', 'Agriculture', 'Agriculture Biotechnology', 'Agriculture Business Management',
    'Airlines & Airport Management', 'Airlines Tourism and Hospitality Management', 'Airport Management', 'Allopathy',
    'Alternative Medicine & Surgery', 'Anaesthesia Technology', 'Analytical Chemistry', 'Ancient History', 'Animation',
    'Animation and Multimedia', 'Animation Film Making', 'Anthropology', 'Applied Art', 'Applied Arts', 'Applied Economics',
    'Applied Sciences', 'Aquaculture', 'Arabic', 'Architecture', 'Arts & Humanities', 'Arts and Law', 'Artificial Intelligence',
    'Assamese', 'Ashtanga Yoga', 'Astrology', 'Audiology & Speech Language Pathology', 'Automobile', 'Automobile Engineering',
    'Automobiles Engineering', 'Automotive Parts Sales', 'Aviation', 'Avionics', 'Ayurveda', 'Ayurveda Medical and Surgery',
    'Ayurveda Pharmacy', 'Banking and Finance.', 'Banking and Insurance', 'Banking & Insurance', 'Banking Management',
    'Bank Management', 'Beauty Cosmetology', 'Bengali', 'Bharatanatyam', 'Biochemical', 'Biochemistry', 'Biofuels',
    'Bioinformatics', 'Biological Sciences', 'Biology', 'Biomedical', 'Biomedical Science', 'Biotechnology', 'Botany',
    'Botany, Chemistry, Zoology', 'Business Administration', 'Business Analytics', 'Business Economics', 'Business Law',
    'Business Management', 'Business Studies', 'Cardiac Care Technology', 'Cardiac Technology', 'Cardiology', 'Carnatic Music',
    'Catering Science and Hotel Management', 'Catering Technology and Culinary Arts', 'Ceramic', 'Chemical',
    'Chemical Engineering', 'Chemical Fertilizer', 'Chemistry', 'Chinese', 'Civil', 'Civil Engineering', 'Clinical Microbiology',
    'Clinical Nutrition', 'Clinical Research', 'Clothing and Textiles', 'Cloud Computing', 'Commerce',
    'Commerce and Legislative Law (LLB)', 'Communication Design', 'Company Law', 'Comparative Literature',
    'Computational Mathematics & Statistics', 'Computer', 'Computer Application', 'Computer Applications', 'Computer Engineering',
    'Computer Science', 'Computer Science & Engineering', 'Computer Science Statistics', 'Computer Technology', 'Co-Operation',
    'Corporate Economics', 'Corporate Secretaryship', 'Cosmetics Technology', 'Criminology and Police Administration',
    'Critical Care Technology', 'Culinary Arts', 'Cyber Security', 'Dairy Technology', 'Data Science',
    'Defence & Strategic Studies', 'Dental Surgery', 'Design', 'Dialysis Therapy', 'Digital Marketing', 'Divinity',
    'Drawing and Painting', 'E-Commerce', 'Economics', 'Education', 'Education (Special Education, Early Childhood)',
    'Electrical', 'Electrical and Electronics Engineering', 'Electrical Engineering', 'Electricals Product Sales',
    'Electro-homeopathy Medicine and Surgery', 'Electronics', 'Electronics and Communication',
    'Electronics & Communication Engineering', 'Electronics and Instrumentation', 'Electronics Engineering',
    'Elementary Education', 'Energy', 'Engineering', 'English', 'Environmental', 'Environmental Management',
    'Environmental Science', 'Environmental Science & Water Management', 'Environmental Science and Water Management',
    'Event Management', 'Fashion and Apparel Design', 'Fashion Design', 'Fashion Designing', 'Fashion Technology',
    'Film Technology', 'Finance', 'Financial Accounting', 'Financial Management', 'Financial Markets', 'Fine Arts',
    'Fine Arts in Graphics', 'Fire and Safety Management', 'Fire & Safety Engineering', 'Fire Tech and Safety', 'Fisheries',
    'Fisheries Science', 'Food Processing', 'Food Processing Technology', 'Food Processing and Preservation',
    'Food Science and Nutrition', 'Food Science and Technology', 'Food Sciences', 'Food Technology', 'Footwear Technology',
    'Foreign Trade', 'Foreign Trade Management', 'Forensic Science', 'Forest', 'Forestry', 'Formation Technology', 'French',
    'Game Designing and Development', 'Garment Manufacturing Technology', 'Genetic', 'Genetics', 'Geoinformatics',
    'Geographic Information Systems (GIS)', 'Geography', 'Geology', 'German', 'Graphic Design', 'Graphic Designing', 'Gujarati',
    'Harbour And Ocean', 'Healthcare Management', 'Hindi', 'History', 'Home Science', 'Homeopathic Medicine and Surgery',
    'Homeopathic Medicine & Surgery', 'Horticulture', 'Hospitality and Hotel Administration', 'Hospitality and Tourism',
    'Hospitality / Travel and Tourism', 'Hospitality Management', 'Hospitality Studies', 'Hospital Administration',
    'Hospital Management', 'Hotel and Hospitality Management', 'Hotel Management', 'Hotel Management & Catering Technology',
    'Hotel Management and Catering Technology', 'HP Operations Manager', 'HR Management', 'Human Development',
    'Human Nutrition and Dietician', 'Human Resource Management.', 'Human Resources', 'Humanities', 'Hydrology',
    'Imaging Technology', 'Immunology', 'Import / Export', 'Industrial', 'Industrial and Production', 'Industrial Chemistry',
    'Industrial Engineering', 'Industrial Management', 'Industrial Microbiology', 'Industrial Safety', 'Industrial Science',
    'Information Engineering', 'Information Management System', 'Information Science', 'Information Systems Management',
    'Information Technology', 'Information Technology (IT)', 'Information Technology - IT', 'Instrumentation',
    'Instrumentation and Control', 'Instrumentation Engineering', 'Intellectual Property Rights', 'Interior Design',
    'Interior Designing', 'International Business', 'International Finance', 'Islamic History', 'Islamic Theology', 'Italian',
    'IT Mobile Application and Information Security', 'IT Smart', 'Japanese', 'Journalism', 'Journalism and Mass Communication',
    'Journalism & Mass Communication', 'Kannada', 'Knitwear Design', 'Law', 'Leather Technology',
    'Library and Information Science', 'Library & Information Science', 'Library Science', 'Life Sciences', 'Literature',
    'Literature Tamil', 'Logistics and Supply Chain Management', 'Maithili', 'Malayalam', 'Management', 'Management Studies',
    'Manufacturing', 'Marathi', 'Marine', 'Marine Engineering', 'Marketing', 'Marketing and Finance', 'Mass Communication',
    'Mass Media', 'Material Science and Metallurgical', 'Materials Management', 'Mathematics',
    'Mathematics with Computer Applications', 'Mechanical', 'Mechanical Engineering', 'Mechatronics',
    'Media Animation & Design', 'Media Management', 'Media Science', 'Medical', 'Medical Biotechnology',
    'Medical Imaging Technology', 'Medical Lab Technology', 'Medical Laboratory Technology',
    'Medical Laboratory Technology (DMLT)', 'Medical Radiography and Imaging Technology', 'Medical Sociology',
    'Medicine and Bachelor of Surgery', 'Medicine and Surgery', 'Metallurgical', 'Metallurgical Engineering', 'Microbiology',
    'Military Studies', 'Mineral', 'Mining', 'Mining Engineering', 'MLT', 'Mobile Application and Web Technology', 'Multimedia',
    'Multimedia & Animation', 'Multimedia Communication', 'Multimedia Technology', 'Music', 'Music Vocal', 'Nagpuri',
    'Nanotechnology', 'Natural Science', 'Naturopathy and Yogic Sciences', 'Nautical Science', 'Networking Technologies',
    'Neurophysiology Technology', 'Non Medical', 'Nuclear Medicine Technology', 'Nursing', 'Nutrition',
    'Nutrition and Dietetics', 'Nutrition, Exercise and Health', 'Occupational Therapy', 'Office Management',
    'Operation Management', 'Operation Theatre Technology', 'Ophthalmic Technology', 'Optometry', 'Oriya', 'Painting',
    'Paint Technology', 'Paramedical Sciences', 'Paramedical Technology', 'Perfusion Technology', 'Performing Arts', 'Persian',
    'Petroleum', 'Petroleum Engineering', 'Pharmaceutical Chemistry', 'Pharmaceutics', 'Pharmacy', 'Pharma.D', 'Philosophy',
    'Photography', 'Physical Education', 'Physical Education and Sports', 'Physical Science', 'Physician Assistant', 'Physics',
    'Physics and Education', 'Physics, Chemistry, Mathematics', 'Physiology', 'Physiotherapy',
    'Plant Biology and Plant Biotechnology', 'Plastic', 'Plumber', 'Political Science', 'Polymer', 'Power',
    'Power Electronics', 'Prarmacy', 'Printing Technology', 'Production', 'Professional', 'Professional Accounting',
    'Prosthetic and Orthotics', 'Psychology', 'Psychology, Physical Education, Tourism, Travel Management',
    'Public Administration', 'Public Health', 'Punjabi', 'Radiology', 'Radiology & Imaging Technology', 'Radiography',
    'Radiotherapy', 'Radio Imaging Technology', 'Railway', 'Real Estate and Urban Infrastructure', 'Renal Dialysis Technology',
    'Renewable Energy', 'Renewable Energy Technology', 'Respiratory Therapy', 'Retail & Logistics Management',
    'Retail Management', 'Risk Management', 'Robotics and Automation', 'Rubber Technology', 'Rural Development',
    'Rural Studies', 'Sales and Marketing', 'Sanskrit', 'Science', 'Sculpture & Modelling', 'Seed Technology', 'Sericulture',
    'Shastri', 'Siddha Medicine and Surgery', 'Social Science', 'Social Sciences', 'Social Work', 'Sociology', 'Software',
    'Software Development', 'Special Education', 'Special Education Math', 'Sports Management', 'Statistics', 'Tamil',
    'Taxation', 'Taxation and Finance', 'Technology', 'Telecommunication', 'Telugu', 'Textile', 'Textile Design',
    'Textile Designing', 'Textile Engineering', 'Theology', 'Thermal', 'Tool', 'Tourism and Travel Management',
    'Tourism Management', 'Tourism Studies', 'Travel & Tourism Management', 'Travel and Tourism Management',
    'Transport Management', 'Transportation Technology', 'Unani', 'Unani Medicine & Surgery', 'Urdu', 'Urdu Literature',
    'Veterinary Science', 'Visual Arts', 'Visual Communication', 'Vocational', 'Vocational Education', 'Women\'s Studies',
    'Yoga', 'Yogashastra', 'Zoology', 'Other',
  ];

  const DIPLOMA_SPECIALIZATION_OPTIONS = [
    'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Computer Science & Engineering',
    'Electronics & Communication Engineering', 'Automobile Engineering', 'Information Technology (IT)', 'Mechatronics',
    'Aeronautical Engineering', 'Mining Engineering', 'Medical Laboratory Technology (DMLT)', 'Radiology & Imaging Technology',
    'Nursing', 'Pharmacy', 'Physiotherapy', 'Optometry', 'Veterinary Science', 'Ayurveda Pharmacy',
    'Accounting & Finance', 'Business Administration', 'Banking & Insurance', 'Digital Marketing', 'Retail Management',
    'Taxation', 'Financial Management', 'E-commerce', 'Office Management', 'Fashion Designing', 'Interior Designing',
    'Graphic Designing', 'Animation & Multimedia', 'Journalism & Mass Communication', 'Photography', 'Event Management',
    'Hotel Management', 'Fine Arts', 'Travel & Tourism', 'Biotechnology', 'Microbiology', 'Environmental Science',
    'Forensic Science', 'Food Technology', 'Clinical Research', 'Education (Special Education, Early Childhood)', 'Social Work',
    'Public Administration', 'Psychology', 'Library & Information Science', 'Dairy Technology', 'Food Processing',
    'Industrial Safety', 'Fire & Safety Engineering', 'Applied Art', 'Drawing & Painting', 'Sculpture & Modelling',
    'Textile Designing', 'Aerospace Engineering', 'Industrial Engineering', 'Information Engineering', 'Chemical Engineering',
    'Instrumentation Engineering', 'Marine Engineering', 'Computer Engineering', 'Petroleum Engineering', 'Electronics Engineering',
    'Textile Engineering', 'Geographic Information Systems (GIS)', 'Paint Technology', 'Elementary Education', 'Architecture',
    'Chemical Fertilizer', 'Metallurgical Engineering', 'IT Smart', 'Other',
  ];

  const DOCTORATE_SPECIALIZATION_OPTIONS = [
    'Accountancy', 'Accounting and Financial Management', 'Aeronautical and Automobile Engineering', 'Agriculture',
    'Ancient History', 'Animal Nutrition', 'Animal Science', 'Applied Sciences', 'Arts', 'Aviation Management', 'Ayurveda',
    'Basic and Applied Sciences', 'Biochemistry', 'Bioinformatics', 'Biology', 'Bioscience', 'Biotechnology', 'Botany',
    'Business Administration', 'Business Management', 'Ceramic Engineering', 'Chemical Engineering', 'Civil Engineering',
    'Clinical Research', 'Commerce', 'Commerce and Management', 'Computer Science Engineering', 'Constitutional Law',
    'Design', 'Economics', 'Economy', 'Education', 'Electrical Engineering', 'Electronics',
    'Electronics & Communication Engineering', 'Engineering', 'Engineering and Technology', 'English', 'English Literature',
    'Environmental Science and Engineering', 'Fashion Design', 'Fine Arts', 'Food and Nutrition', 'Genetic Engineering',
    'Geography', 'Geology', 'Hindi', 'History', 'Horticulture', 'Human Genetics', 'Humanities',
    'Humanities & Social Sciences', 'Human Resource Management', 'Information Technology', 'Jyotish', 'Law',
    'Law and Governance', 'Legal Studies', 'Library and Information Science', 'Life Sciences',
    'Logistics and Supply Chain Management', 'Management', 'Marine Biotechnology', 'Marketing',
    'Mathematical and Computational Sciences', 'Mathematics', 'Mechanical Engineering', 'Music', 'Nursing',
    'Organic Chemistry', 'Persian', 'Pharmaceutical Chemistry', 'Pharmacy', 'Philosophy', 'Physical Education',
    'Physics', 'Physiology', 'Planning', 'Production Engineering', 'Psychology', 'Public and Economic Policy',
    'Quantitative Techniques', 'Sanskrit', 'Social Science', 'Social Work', 'Sociology',
    'Soil Science and Agriculture Chemistry', 'Statistics', 'Structural Engineering', 'Telugu', 'Theology',
    'Urban Planning', 'Urdu', 'Women\'s Studies', 'Yoga', 'Zoology', 'Other',
  ];

  // Get specializations based on course and education level
  const getSpecializationsForCourse = (educationLevel, course) => {
    if (!course || !educationLevel) {
      return [];
    }

    if (educationLevel === 'ITI') {
      return ITI_SPECIALIZATION_OPTIONS.map(s => ({ value: s, label: s }));
    }

    if (educationLevel === 'Diploma') {
      return DIPLOMA_SPECIALIZATION_OPTIONS.map(s => ({ value: s, label: s }));
    }

    if (educationLevel === 'Graduate' || educationLevel === 'Post Graduate') {
      return GRADUATE_SPECIALIZATION_OPTIONS.map(s => ({ value: s, label: s }));
    }

    if (educationLevel === 'Doctorate') {
      return DOCTORATE_SPECIALIZATION_OPTIONS.map(s => ({ value: s, label: s }));
    }

    return [];
  };

  const renderEducationSection = () => (
    <View style={dynamicStyles.section}>
      <Text style={dynamicStyles.sectionTitle}>Education Information</Text>
      <Text style={dynamicStyles.sectionSubtitle}>Add your education details</Text>
      
      {formData.education.map((edu, index) => {
        const isBasicEducation = edu.educationLevel && BASIC_EDUCATION_LEVELS.includes(edu.educationLevel);
        const showCourseField = edu.educationLevel && !isBasicEducation;
        const showSpecializationField = showCourseField && edu.degree;
        const availableCourses = getCoursesForEducationLevel(edu.educationLevel);
        const availableSpecializations = getSpecializationsForCourse(edu.educationLevel, edu.degree);

        return (
          <View key={index} style={dynamicStyles.educationCard}>
            <Text style={dynamicStyles.cardTitle}>Education #{index + 1}</Text>
            
            <DropdownField
              label="Level of Education"
              value={masterData.educationLevels.find(e => e.value === edu.educationLevel)}
              options={masterData.educationLevels}
              onSelect={(option) => {
                const newEducation = [...formData.education];
                const isBasic = BASIC_EDUCATION_LEVELS.includes(option.value);
                newEducation[index] = { 
                  ...newEducation[index], 
                  educationLevel: option.value,
                  // Clear course and specialization if basic education or level changed
                  degree: isBasic ? '' : newEducation[index].degree,
                  specialization: isBasic ? '' : newEducation[index].specialization
                };
                setFormData(prev => ({ ...prev, education: newEducation }));
              }}
              placeholder="Select education level"
            />

            {showCourseField && (
              <DropdownField
                label="Degree/Course"
                value={availableCourses.find(c => c.value === edu.degree)}
                options={availableCourses}
                onSelect={(option) => {
                  const newEducation = [...formData.education];
                  newEducation[index] = { 
                    ...newEducation[index], 
                    degree: option.value,
                    // Clear specialization when course changes
                    specialization: ''
                  };
                  setFormData(prev => ({ ...prev, education: newEducation }));
                }}
                placeholder="Select course"
              />
            )}

            {showSpecializationField && (
              <DropdownField
                label="Specialization"
                value={availableSpecializations.find(s => s.value === edu.specialization)}
                options={availableSpecializations}
                onSelect={(option) => {
                  const newEducation = [...formData.education];
                  newEducation[index] = { ...newEducation[index], specialization: option.value };
                  setFormData(prev => ({ ...prev, education: newEducation }));
                }}
                placeholder="Select specialization"
              />
            )}

            <Input
              label="Institution Name"
              value={edu.institution || ''}
              onChangeText={(text) => {
                const newEducation = [...formData.education];
                newEducation[index] = { ...newEducation[index], institution: text };
                setFormData(prev => ({ ...prev, education: newEducation }));
              }}
              placeholder="Enter institution name"
              icon="school-outline"
            />

            <DropdownField
              label="Education Status"
              value={masterData.educationStatuses.find(e => e.value === edu.educationStatus)}
              options={masterData.educationStatuses}
              onSelect={(option) => {
                const newEducation = [...formData.education];
                newEducation[index] = { ...newEducation[index], educationStatus: option.value };
                setFormData(prev => ({ ...prev, education: newEducation }));
              }}
              placeholder="Select education status"
            />

            <Input
              label="Start Date (MM-YYYY)"
              value={edu.startDate || ''}
              onChangeText={(text) => {
                const newEducation = [...formData.education];
                newEducation[index] = { ...newEducation[index], startDate: text };
                setFormData(prev => ({ ...prev, education: newEducation }));
              }}
              placeholder="e.g., 06-2015"
              icon="calendar-outline"
            />

            <Input
              label="End Date (MM-YYYY)"
              value={edu.endDate || ''}
              onChangeText={(text) => {
                const newEducation = [...formData.education];
                newEducation[index] = { ...newEducation[index], endDate: text };
                setFormData(prev => ({ ...prev, education: newEducation }));
              }}
              placeholder="e.g., 06-2019"
              icon="calendar-outline"
            />

            {index > 0 && (
        <Button
                title="Remove Education"
                onPress={() => {
                  const newEducation = formData.education.filter((_, i) => i !== index);
                  setFormData(prev => ({ ...prev, education: newEducation }));
                }}
                variant="outline"
                style={dynamicStyles.removeButton}
              />
            )}
          </View>
        );
      })}

      <Button
        title="Add Education"
        onPress={() => {
          setFormData(prev => ({
            ...prev,
            education: [...prev.education, {
              educationLevel: '',
              degree: '',
              specialization: '',
              institution: '',
              educationStatus: '',
              startDate: '',
              endDate: '',
              educationType: '',
              educationMedium: '',
              marksType: '',
              marksValue: '',
              isHighestEducation: false
            }]
          }));
        }}
        variant="outline"
      />
    </View>
  );

  const renderLocationSection = () => (
    <View style={dynamicStyles.section}>
      <Text style={dynamicStyles.sectionTitle}>Location Information</Text>
      
      <Input
        label="Current State"
        value={formData.locationInfo.currentState}
        onChangeText={(text) => updateField('locationInfo', 'currentState', text)}
        placeholder="Enter current state"
        icon="location-outline"
      />

      <Input
        label="Current City/Region"
        value={formData.locationInfo.currentCity}
        onChangeText={(text) => updateField('locationInfo', 'currentCity', text)}
        placeholder="Enter current city"
        icon="location-outline"
      />

      <Input
        label="Current Locality/Address"
        value={formData.locationInfo.currentAddress}
        onChangeText={(text) => updateField('locationInfo', 'currentAddress', text)}
        placeholder="Enter address"
        icon="home-outline"
        multiline
      />

      <Input
        label="Area Pincode"
        value={formData.locationInfo.areaPincode}
        onChangeText={(text) => updateField('locationInfo', 'areaPincode', text)}
        placeholder="Enter pincode"
        icon="mail-outline"
        keyboardType="numeric"
      />

      <Input
        label="Home Town City/Region/Locality/State"
        value={formData.locationInfo.homeTownCity}
        onChangeText={(text) => updateField('locationInfo', 'homeTownCity', text)}
        placeholder="Enter home town"
        icon="location-outline"
      />

      <Input
        label="Home Town Pincode"
        value={formData.locationInfo.homeTownPincode}
        onChangeText={(text) => updateField('locationInfo', 'homeTownPincode', text)}
        placeholder="Enter home town pincode"
        icon="mail-outline"
        keyboardType="numeric"
      />

      <MultiSelectField
        label="Preferred Language"
        value={formData.locationInfo.preferredLanguage}
        options={masterData.languages}
        onSelect={(selected) => updateField('locationInfo', 'preferredLanguage', selected)}
        placeholder="Select preferred languages"
        maxSelections={10}
      />

      <DropdownField
        label="English Fluency Level"
        value={masterData.englishFluencyLevels.find(e => e.value === formData.locationInfo.englishFluencyLevel)}
        options={masterData.englishFluencyLevels}
        onSelect={(option) => updateField('locationInfo', 'englishFluencyLevel', option.value)}
        placeholder="Select English fluency level"
      />
    </View>
  );

  // Helper function to render multiple links for a social profile
  const renderMultipleLinksField = (label, icon, links, onUpdate, placeholder) => {
    const ensureArray = Array.isArray(links) ? links : links ? [links] : [];
    
    return (
      <View style={dynamicStyles.multiLinkContainer}>
        <Text style={dynamicStyles.multiLinkLabel}>{label}</Text>
        {ensureArray.map((link, index) => (
          <View key={index} style={dynamicStyles.linkItem}>
            <Input
              value={link}
              onChangeText={(text) => {
                const updatedLinks = [...ensureArray];
                updatedLinks[index] = text;
                onUpdate(updatedLinks);
              }}
              placeholder={placeholder}
              icon={icon}
              keyboardType="url"
              style={dynamicStyles.linkInput}
            />
            <TouchableOpacity
              onPress={() => {
                const updatedLinks = ensureArray.filter((_, i) => i !== index);
                onUpdate(updatedLinks);
              }}
              style={dynamicStyles.removeLinkButton}
            >
              <Ionicons name="close-circle" size={isPhone ? 20 : 24} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          onPress={() => {
            onUpdate([...ensureArray, '']);
          }}
          style={dynamicStyles.addLinkButton}
        >
          <Ionicons name="add-circle-outline" size={isPhone ? 18 : 20} color={colors.primary} />
          <Text style={dynamicStyles.addLinkText}>Add {label}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Helper function to render multiple portfolio entries
  const renderMultiplePortfolioField = () => {
    const names = Array.isArray(formData.additionalInfo.portfolio.names) 
      ? formData.additionalInfo.portfolio.names 
      : formData.additionalInfo.portfolio.names ? [formData.additionalInfo.portfolio.names] : [];
    const links = Array.isArray(formData.additionalInfo.portfolio.links) 
      ? formData.additionalInfo.portfolio.links 
      : formData.additionalInfo.portfolio.links ? [formData.additionalInfo.portfolio.links] : [];
    
    // Ensure both arrays have the same length
    const maxLength = Math.max(names.length, links.length);
    const normalizedNames = [...names];
    const normalizedLinks = [...links];
    while (normalizedNames.length < maxLength) normalizedNames.push('');
    while (normalizedLinks.length < maxLength) normalizedLinks.push('');
    
    return (
      <View style={dynamicStyles.multiLinkContainer}>
        <Text style={dynamicStyles.multiLinkLabel}>Projects / Portfolios</Text>
        {normalizedNames.map((name, index) => (
          <View key={index} style={dynamicStyles.portfolioItem}>
            <View style={dynamicStyles.portfolioHeader}>
              <Text style={dynamicStyles.portfolioItemTitle}>Project #{index + 1}</Text>
              <TouchableOpacity
                onPress={() => {
                  const updatedNames = names.filter((_, i) => i !== index);
                  const updatedLinks = links.filter((_, i) => i !== index);
                  // Sync arrays
                  while (updatedNames.length < updatedLinks.length) updatedNames.push('');
                  while (updatedLinks.length < updatedNames.length) updatedLinks.push('');
                  setFormData(prev => ({
                    ...prev,
                    additionalInfo: {
                      ...prev.additionalInfo,
                      portfolio: {
                        names: updatedNames,
                        links: updatedLinks
                      }
                    }
                  }));
                }}
                style={dynamicStyles.removeLinkButton}
              >
                <Ionicons name="close-circle" size={isPhone ? 20 : 24} color={colors.error} />
              </TouchableOpacity>
            </View>
            <Input
              value={name}
              onChangeText={(text) => {
                const updatedNames = [...names];
                updatedNames[index] = text;
                const updatedLinks = [...links];
                // Ensure links array matches names array length
                while (updatedLinks.length < updatedNames.length) updatedLinks.push('');
                setFormData(prev => ({
                  ...prev,
                  additionalInfo: {
                    ...prev.additionalInfo,
                    portfolio: {
                      ...prev.additionalInfo.portfolio,
                      names: updatedNames,
                      links: updatedLinks.slice(0, updatedNames.length)
                    }
                  }
                }));
              }}
              placeholder="Enter project/portfolio name"
              icon="briefcase-outline"
              style={dynamicStyles.portfolioInput}
            />
            <Input
              value={normalizedLinks[index] || ''}
              onChangeText={(text) => {
                const updatedLinks = [...links];
                updatedLinks[index] = text;
                const updatedNames = [...names];
                // Ensure names array matches links array length
                while (updatedNames.length < updatedLinks.length) updatedNames.push('');
                setFormData(prev => ({
                  ...prev,
                  additionalInfo: {
                    ...prev.additionalInfo,
                    portfolio: {
                      ...prev.additionalInfo.portfolio,
                      names: updatedNames.slice(0, updatedLinks.length),
                      links: updatedLinks
                    }
                  }
                }));
              }}
              placeholder="Enter project/portfolio link"
              icon="link-outline"
              keyboardType="url"
              style={dynamicStyles.portfolioInput}
            />
          </View>
        ))}
        <TouchableOpacity
          onPress={() => {
            const currentNames = Array.isArray(formData.additionalInfo.portfolio.names) 
              ? formData.additionalInfo.portfolio.names 
              : [];
            const currentLinks = Array.isArray(formData.additionalInfo.portfolio.links) 
              ? formData.additionalInfo.portfolio.links 
              : [];
            setFormData(prev => ({
              ...prev,
              additionalInfo: {
                ...prev.additionalInfo,
                portfolio: {
                  names: [...currentNames, ''],
                  links: [...currentLinks, '']
                }
              }
            }));
          }}
          style={dynamicStyles.addLinkButton}
        >
          <Ionicons name="add-circle-outline" size={isPhone ? 18 : 20} color={colors.primary} />
          <Text style={dynamicStyles.addLinkText}>Add Project/Portfolio</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAdditionalInfoSection = () => (
    <View style={dynamicStyles.section}>
      <Text style={dynamicStyles.sectionTitle}>Additional Information</Text>
      
      {renderMultipleLinksField(
        'Online Social Profile - Facebook',
        'logo-facebook',
        formData.additionalInfo.onlineSocialProfiles.facebook,
        (links) => {
          setFormData(prev => ({
            ...prev,
            additionalInfo: {
              ...prev.additionalInfo,
              onlineSocialProfiles: {
                ...prev.additionalInfo.onlineSocialProfiles,
                facebook: links
              }
            }
          }));
        },
        'Enter Facebook URL'
      )}

      {renderMultipleLinksField(
        'Online Social Profile - Instagram',
        'logo-instagram',
        formData.additionalInfo.onlineSocialProfiles.instagram,
        (links) => {
          setFormData(prev => ({
            ...prev,
            additionalInfo: {
              ...prev.additionalInfo,
              onlineSocialProfiles: {
                ...prev.additionalInfo.onlineSocialProfiles,
                instagram: links
              }
            }
          }));
        },
        'Enter Instagram URL'
      )}

      {renderMultipleLinksField(
        'Online Social Profile - LinkedIn',
        'logo-linkedin',
        formData.additionalInfo.onlineSocialProfiles.linkedin,
        (links) => {
          setFormData(prev => ({
            ...prev,
            additionalInfo: {
              ...prev.additionalInfo,
              onlineSocialProfiles: {
                ...prev.additionalInfo.onlineSocialProfiles,
                linkedin: links
              }
            }
          }));
        },
        'Enter LinkedIn URL'
      )}

      {renderMultipleLinksField(
        'Online Social Profile - Twitter',
        'logo-twitter',
        formData.additionalInfo.onlineSocialProfiles.twitter,
        (links) => {
          setFormData(prev => ({
            ...prev,
            additionalInfo: {
              ...prev.additionalInfo,
              onlineSocialProfiles: {
                ...prev.additionalInfo.onlineSocialProfiles,
                twitter: links
              }
            }
          }));
        },
        'Enter Twitter URL'
      )}

      {renderMultipleLinksField(
        'Online Social Profile - Telegram',
        'logo-telegram',
        formData.additionalInfo.onlineSocialProfiles.telegram,
        (links) => {
          setFormData(prev => ({
            ...prev,
            additionalInfo: {
              ...prev.additionalInfo,
              onlineSocialProfiles: {
                ...prev.additionalInfo.onlineSocialProfiles,
                telegram: links
              }
            }
          }));
        },
        'Enter Telegram URL'
      )}

      {renderMultipleLinksField(
        'Online Social Profile - WhatsApp',
        'logo-whatsapp',
        formData.additionalInfo.onlineSocialProfiles.whatsapp,
        (links) => {
          setFormData(prev => ({
            ...prev,
            additionalInfo: {
              ...prev.additionalInfo,
              onlineSocialProfiles: {
                ...prev.additionalInfo.onlineSocialProfiles,
                whatsapp: links
              }
            }
          }));
        },
        'Enter WhatsApp URL'
      )}

      {renderMultipleLinksField(
        'Online Social Profile - YouTube',
        'logo-youtube',
        formData.additionalInfo.onlineSocialProfiles.youtube,
        (links) => {
          setFormData(prev => ({
            ...prev,
            additionalInfo: {
              ...prev.additionalInfo,
              onlineSocialProfiles: {
                ...prev.additionalInfo.onlineSocialProfiles,
                youtube: links
              }
            }
          }));
        },
        'Enter YouTube URL'
      )}

      {renderMultiplePortfolioField()}

      <Input
        label="Bio / About Me (up to 2000 words)"
        value={formData.additionalInfo.bio}
        onChangeText={(text) => updateNestedField('additionalInfo', 'bio', 'bio', text)}
        placeholder="Enter bio"
        icon="document-text-outline"
        multiline
        numberOfLines={8}
      />
    </View>
  );

  const sections = [
    { id: 'personal', label: 'Personal', icon: 'person' },
    { id: 'professional', label: 'Professional', icon: 'briefcase' },
    { id: 'education', label: 'Education', icon: 'school' },
    { id: 'location', label: 'Location', icon: 'location' },
    { id: 'additional', label: 'Additional', icon: 'add-circle' }
  ];

  if (loading) {
    return (
      <View style={dynamicStyles.loadingContainer}>
        <Text style={dynamicStyles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Sidebar */}
      {/* Sidebar - Always visible on web desktop */}
      {isWeb && !isPhone ? (
        <UserSidebar
          navigation={navigation}
          activeKey="profile"
          onClose={null}
          badges={{}}
        />
      ) : sidebarOpen ? (
        <>
          {isPhone && (
            <TouchableOpacity
              style={dynamicStyles.backdrop}
              onPress={() => setSidebarOpen(false)}
              activeOpacity={1}
            />
          )}
          <UserSidebar
            navigation={navigation}
            activeKey="profile"
            onClose={isPhone ? () => setSidebarOpen(false) : (!isWeb ? () => setSidebarOpen(false) : null)}
            badges={{}}
          />
        </>
      ) : null}

      {/* Main Content */}
      <View style={dynamicStyles.mainContent}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          {(!isWeb || isPhone) && (
            <TouchableOpacity 
              onPress={() => setSidebarOpen(!sidebarOpen)}
              style={dynamicStyles.menuButton}
            >
              <Ionicons name="menu" size={isPhone ? 20 : 24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <Text style={dynamicStyles.headerTitle}>Profile</Text>
          
          <View style={dynamicStyles.headerRight}>
            <View style={dynamicStyles.userInfo}>
              <View style={dynamicStyles.avatar}>
                <Text style={dynamicStyles.avatarText}>{getUserInitials()}</Text>
              </View>
              <Text style={dynamicStyles.userName}>{currentUser?.firstName || 'User'}</Text>
            </View>
            <TouchableOpacity style={dynamicStyles.logoutButtonHeader} onPress={handleLogout}>
              <Ionicons name="arrow-forward" size={isPhone ? 14 : 16} color="#FFFFFF" />
              <Text style={dynamicStyles.logoutTextHeader}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Navigation */}
        <View style={dynamicStyles.sectionNavContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.sectionNav}>
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
                >
                  {section.label}
                </Text>
              </TouchableOpacity>
            ))}
      </ScrollView>
        </View>

        {/* Form Content */}
        <ScrollView style={dynamicStyles.content} contentContainerStyle={dynamicStyles.contentContainer}>
        {activeSection === 'personal' && renderPersonalInfoSection()}
        {activeSection === 'professional' && renderProfessionalSection()}
        {activeSection === 'education' && renderEducationSection()}
        {activeSection === 'location' && renderLocationSection()}
        {activeSection === 'additional' && renderAdditionalInfoSection()}

        <Button
          title="Save Profile"
          onPress={handleSave}
          loading={saving}
          style={dynamicStyles.saveButton}
        />
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal transparent visible={showDatePicker} animationType="slide">
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <DateTimePicker
                value={formData.personalInfo.dateOfBirth}
                mode="date"
                display={getPlatform().OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate && datePickerMode === 'dateOfBirth') {
                    updateField('personalInfo', 'dateOfBirth', selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
              {getPlatform().OS === 'ios' && (
                <Button title="Done" onPress={() => setShowDatePicker(false)} />
              )}
            </View>
          </View>
        </Modal>
      )}
      </View>
    </View>
  );
};

const getStyles = (isPhone, isMobile, isTablet, isDesktop) => {
  const isWeb = getPlatform().OS === 'web';
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: isPhone ? 'column' : 'row',
      backgroundColor: colors.background
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
    mainContent: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      ...(isWeb && !isPhone && {
        marginLeft: isDesktop ? 280 : (isTablet ? 260 : 240),
        width: `calc(100% - ${isDesktop ? 280 : (isTablet ? 260 : 240)}px)`,
      }),
      ...(isPhone && {
        width: '100%',
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
      paddingVertical: isPhone ? spacing.sm : spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: '#FFFFFF',
      ...(isPhone && {
        flexWrap: 'wrap',
      }),
    },
    menuButton: {
      marginRight: isPhone ? spacing.sm : spacing.md
    },
    headerTitle: {
      ...typography.h4,
      color: colors.text,
      fontWeight: '700',
      flex: 1,
      fontSize: isPhone ? 18 : (isMobile ? 20 : (isTablet ? 22 : 24)),
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isPhone ? spacing.sm : spacing.md,
      ...(isPhone && {
        width: '100%',
        marginTop: spacing.sm,
        justifyContent: 'flex-end',
      }),
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isPhone ? spacing.xs : spacing.sm,
      ...(isPhone && {
        flex: 1,
      }),
    },
    avatar: {
      width: isPhone ? 32 : (isMobile ? 36 : 40),
      height: isPhone ? 32 : (isMobile ? 36 : 40),
      borderRadius: isPhone ? 16 : (isMobile ? 18 : 20),
      backgroundColor: '#4A90E2',
      alignItems: 'center',
      justifyContent: 'center'
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: isPhone ? 12 : (isMobile ? 14 : 16),
      fontWeight: '600'
    },
    userName: {
      ...typography.body2,
      color: colors.text,
      fontWeight: '500',
      fontSize: isPhone ? 13 : (isMobile ? 14 : 16),
      ...(isPhone && {
        display: 'none',
      }),
    },
    logoutButtonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ef4444',
      paddingHorizontal: isPhone ? spacing.sm : spacing.md,
      paddingVertical: isPhone ? spacing.xs : spacing.sm,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    logoutTextHeader: {
      ...typography.body2,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: isPhone ? 12 : 14,
    },
    sectionNavContainer: {
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    sectionNav: {
      paddingVertical: spacing.sm
    },
    sectionNavItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isPhone ? spacing.md : spacing.lg,
      paddingVertical: isPhone ? spacing.sm : spacing.md,
      marginHorizontal: spacing.xs,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
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
      fontSize: isPhone ? 13 : (isMobile ? 14 : 15),
    },
    sectionNavTextActive: {
      color: colors.primary,
      fontWeight: '600'
    },
    content: {
      flex: 1
    },
    contentContainer: {
      padding: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl)
    },
    section: {
      marginBottom: isPhone ? spacing.lg : spacing.xl
    },
    sectionTitle: {
      ...typography.h5,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.md,
      fontSize: isPhone ? 16 : (isMobile ? 18 : (isTablet ? 20 : 22)),
    },
    sectionSubtitle: {
      ...typography.body2,
      color: colors.textSecondary,
      marginBottom: spacing.md,
      fontSize: isPhone ? 13 : (isMobile ? 14 : 15),
    },
    educationCard: {
      backgroundColor: colors.cardBackground,
      padding: isPhone ? spacing.md : spacing.lg,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border
    },
    cardTitle: {
      ...typography.h6,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
    },
    datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: isPhone ? spacing.sm : spacing.md,
      marginBottom: spacing.md,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    datePickerText: {
      flex: 1,
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
      color: colors.text
    },
    placeholderText: {
      color: colors.textLight
    },
    checkboxContainer: {
      marginBottom: spacing.md
    },
    checkbox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm
    },
    checkboxLabel: {
      ...typography.body2,
      color: colors.text,
      fontSize: isPhone ? 13 : (isMobile ? 14 : 15),
    },
    saveButton: {
      marginTop: isPhone ? spacing.lg : spacing.xl,
      marginBottom: isPhone ? spacing.lg : spacing.xl
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
      padding: isPhone ? spacing.md : spacing.lg
    },
    label: {
      ...typography.body2,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
      fontSize: isPhone ? 13 : (isMobile ? 14 : 15),
    },
    required: {
      color: colors.error
    },
    selectedSkillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: spacing.sm,
      gap: isPhone ? spacing.xs : spacing.sm
    },
    selectedSkill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '20',
      paddingVertical: spacing.xs,
      paddingHorizontal: isPhone ? spacing.xs : spacing.sm,
      borderRadius: borderRadius.sm,
      gap: spacing.xs
    },
    selectedSkillText: {
      ...typography.body2,
      color: colors.primary,
      fontWeight: '500',
      fontSize: isPhone ? 12 : (isMobile ? 13 : 14),
    },
    removeButton: {
      marginTop: spacing.md,
      backgroundColor: colors.error + '20',
      borderColor: colors.error,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    multiLinkContainer: {
      marginBottom: spacing.lg
    },
    multiLinkLabel: {
      ...typography.body2,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
      fontSize: isPhone ? 13 : (isMobile ? 14 : 15),
    },
    linkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.sm
    },
    linkInput: {
      flex: 1
    },
    removeLinkButton: {
      padding: spacing.xs,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    addLinkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isPhone ? spacing.sm : spacing.md,
      backgroundColor: colors.primary + '10',
      borderRadius: borderRadius.md,
      gap: spacing.sm,
      marginTop: spacing.xs,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    addLinkText: {
      ...typography.body2,
      color: colors.primary,
      fontWeight: '500',
      fontSize: isPhone ? 13 : (isMobile ? 14 : 15),
    },
    portfolioItem: {
      marginBottom: spacing.md,
      padding: isPhone ? spacing.sm : spacing.md,
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border
    },
    portfolioHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm
    },
    portfolioItemTitle: {
      ...typography.body2,
      fontWeight: '600',
      color: colors.text,
      fontSize: isPhone ? 13 : (isMobile ? 14 : 15),
    },
    portfolioInput: {
      marginBottom: spacing.sm
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

export default UserProfileScreen;