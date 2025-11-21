import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';
import { 
  jobTitleOptions, 
  companyTypeOptions, 
  genderOptions,
  jobModeOptions,
  jobShiftOptions,
  joiningPeriodOptions,
  industryOptions,
  departmentOptions,
  jobRolesOptions,
  keySkillsOptions,
  employmentTypeOptions,
  jobTypeOptions,
  languageOptions,
  diversityHiringOptions,
  disabilityStatusOptions,
  disabilityTypeOptions,
} from '../../data/jobPostFormConfig';
import { INDUSTRIES_DATA, getSubIndustries } from '../../data/industriesData';
import { DEPARTMENTS_DATA, getSubDepartments } from '../../data/departmentsData';
import {
  EDUCATION_LEVEL_OPTIONS,
  BASIC_EDUCATION_LEVELS,
  ITI_COURSE_OPTIONS,
  ITI_SPECIALIZATION_OPTIONS,
  DIPLOMA_COURSE_OPTIONS,
  DIPLOMA_SPECIALIZATION_OPTIONS,
  GRADUATE_COURSE_OPTIONS,
  GRADUATE_SPECIALIZATION_OPTIONS,
  POST_GRADUATE_COURSE_OPTIONS,
  POST_GRADUATE_SPECIALIZATION_OPTIONS,
  DOCTORATE_COURSE_OPTIONS,
  DOCTORATE_SPECIALIZATION_OPTIONS,
} from '../../data/educationData';
import { colors } from '../../styles/theme';

const AdminCandidateSearchScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);
  
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchStats, setSearchStats] = useState({});
  
  // Filter states
  const [filters, setFilters] = useState({
    // Basic Information
    currentCompanyName: '',
    searchKeywords: '',
    keySkills: [],
    experienceLevel: '',
    minExperience: '',
    maxExperience: '',
    
    // Location
    currentCity: [],
    jobLocalityPincode: [],
    includeWillingToRelocate: false,
    excludeAnywhereInIndia: false,
    
    // Salary
    minSalary: '',
    maxSalary: '',
    includeNoSalaryCandidates: false,
    
    // Job Details
    currentJobTitle: [],
    excludeKeywords: '',
    industrySectors: [],
    subIndustries: [],
    departmentCategory: [],
    subDepartments: [],
    jobRoles: [],
    currentCompanyType: '',
    
    // Notice Period
    noticePeriod: '',
    
    // Education
    educationLevel: [],
    degreeCourse: [],
    specialisation: [],
    institutionNames: [],
    educationStatus: [],
    educationType: [],
    educationMedium: [],
    marksType: [],
    marksPercentage: '',
    certificationCourses: [],
    
    // Demographics
    gender: [],
    disabilityStatus: [],
    anyDisabilities: [],
    diversityHiring: [],
    category: [],
    minAge: '',
    maxAge: '',
    
    // Job Preferences
    employmentType: [],
    jobType: [],
    jobModeType: [],
    jobShiftType: [],
    preferredLanguage: [],
    englishFluencyLevel: [],
    assetRequirements: [],
    
    // Candidate Status
    candidatesShowType: [],
    showCandidatesWith: [],
    lastActiveCandidates: ''
  });

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [showMinExpDropdown, setShowMinExpDropdown] = useState(false);
  const [showMaxExpDropdown, setShowMaxExpDropdown] = useState(false);
  const [showJobTitleDropdown, setShowJobTitleDropdown] = useState(false);
  const [showCompanyTypeDropdown, setShowCompanyTypeDropdown] = useState(false);
  const [showSearchInCompanyTypeDropdown, setShowSearchInCompanyTypeDropdown] = useState(false);
  const [showNoticePeriodDropdown, setShowNoticePeriodDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showJobModeDropdown, setShowJobModeDropdown] = useState(false);
  const [showJobShiftDropdown, setShowJobShiftDropdown] = useState(false);
  const [showEnglishFluencyDropdown, setShowEnglishFluencyDropdown] = useState(false);
  const [showLastActiveDropdown, setShowLastActiveDropdown] = useState(false);
  const [showKeySkillsDropdown, setShowKeySkillsDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showSubIndustryDropdown, setShowSubIndustryDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showSubDepartmentDropdown, setShowSubDepartmentDropdown] = useState(false);
  const [subIndustriesOptions, setSubIndustriesOptions] = useState([]);
  const [subDepartmentsOptions, setSubDepartmentsOptions] = useState([]);
  const [showJobRolesDropdown, setShowJobRolesDropdown] = useState(false);
  const [showEducationLevelDropdown, setShowEducationLevelDropdown] = useState(false);
  const [showDegreeCourseDropdown, setShowDegreeCourseDropdown] = useState(false);
  const [showSpecialisationDropdown, setShowSpecialisationDropdown] = useState(false);
  const [showEducationStatusDropdown, setShowEducationStatusDropdown] = useState(false);
  const [showEducationTypeDropdown, setShowEducationTypeDropdown] = useState(false);
  const [showEducationMediumDropdown, setShowEducationMediumDropdown] = useState(false);
  const [showMarksTypeDropdown, setShowMarksTypeDropdown] = useState(false);
  const [showCertificationDropdown, setShowCertificationDropdown] = useState(false);
  const [showDisabilityStatusDropdown, setShowDisabilityStatusDropdown] = useState(false);
  const [showAnyDisabilitiesDropdown, setShowAnyDisabilitiesDropdown] = useState(false);
  const [showDiversityHiringDropdown, setShowDiversityHiringDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showEmploymentTypeDropdown, setShowEmploymentTypeDropdown] = useState(false);
  const [showJobTypeDropdown, setShowJobTypeDropdown] = useState(false);
  const [showPreferredLanguageDropdown, setShowPreferredLanguageDropdown] = useState(false);
  const [showAssetRequirementsDropdown, setShowAssetRequirementsDropdown] = useState(false);
  const [showCandidatesShowTypeDropdown, setShowCandidatesShowTypeDropdown] = useState(false);
  const [showShowCandidatesWithDropdown, setShowShowCandidatesWithDropdown] = useState(false);
  const [institutionSuggestions, setInstitutionSuggestions] = useState([]);
  const [searchInCompanyName, setSearchInCompanyName] = useState('');
  const [searchInCompanyType, setSearchInCompanyType] = useState([]);

  // Options for dropdowns (based on your spreadsheet)
  const experienceLevels = ['Fresher', 'Experienced', 'Internship', 'Apprenticeship', 'Any'];
  
  const experienceYears = [
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
    '34 Years', '34.5 Years', '35 Years', '35.5 Years', '36 Years', '36 Years Plus'
  ];

  const englishFluencyLevels = ['Fluent English', 'Good English', 'Basic English', 'No English', 'Any'];
  
  const lastActiveOptions = [
    '1 Day', '2 Days', '4 Days', '7 Days', '10 Days', '15 Days', 
    '30 Days', '60 Days', '90 Days', '180 Days', 'Any'
  ];
  
  const companyTypes = [
    'Indian MNC', 'Foreign MNC', 'Govt/PSU', 'Startup', 'Unicorn', 
    'Corporate', 'Consultancy', 'Any'
  ];
  
  const noticePeriods = [
    'Immediate Joining', '7 Days', '15 Days', '30 Days', '45 Days', 
    '60 Days', '90 Days', '90 Days Plus', 'Serving Notice Period', 'Any'
  ];
  
  const educationLevels = [
    'No Education', 'Below 10th', '10th Pass', '12th Pass', 'ITI', 
    'Diploma', 'Graduate', 'Post Graduate', 'PPG', 'Doctorate', 'Other'
  ];
  
  const genders = ['Male', 'Female', 'Other', 'Any'];
  
  const disabilityStatuses = ['Have Disability', 'Don\'t Have Disability', 'Any'];
  
  const disabilities = [
    'Blindness', 'Low Vision', 'Physical Disability', 'Locomotor Disability', 
    'Hearing Impairment', 'Speech and Language Disability', 'Any'
  ];
  
  const diversityCategories = [
    'Man', 'Man Returning to work', 'Woman', 'Woman Returning to work', 
    'Ex-Army Personal', 'Differently-abled', 'Any'
  ];
  
  const socialCategories = [
    'Scheduled Caste - SC', 'Scheduled Tribe - ST', 'OBC - Creamy', 
    'OBC – Non Creamy', 'General', 'EWS', 'Other', 'Any'
  ];
  
  const employmentTypes = ['Permanent', 'Temporary/Contract Job', 'Internship', 'Apprenticeship', 'NAPS', 'Freelance', 'Trainee', 'Fresher', 'Any'];
  
  const jobTypes = ['Full Time', 'Part Time', 'Any'];
  
  const jobModeTypes = ['Work From Home', 'Work From Office', 'Work From Field', 'Hybrid', 'Remote', 'Any'];
  
  const jobShiftTypes = ['Day Shift', 'Night Shift', 'Rotational Shift', 'Split Shift', 'Any'];
  
  const languages = [
    'Hindi', 'English', 'Kannada', 'Telugu', 'Marathi', 'Gujarati', 
    'Bengali', 'Punjabi', 'Tamil', 'Kashmiri', 'Maithili', 'Nepali', 
    'Bhojpuri', 'Assamese', 'Malayalam', 'Urdu', 'Sanskrit', 
    'Meitei (Manipuri)', 'Santali', 'Odia'
  ];
  
  const assetOptions = [
    'LMV License', 'Heavy Driver License', 'Crane Operator License', 
    'Electrical License', 'Laptop', 'Android Smart Phone', 'iOS Smart Phone', 
    'Camera', 'Two Wheeler', 'Bike', 'E-Bike', 'Auto', 'E-Rikshaw', 
    'Three Wheeler', 'Four Wheeler', 'Tempo', 'Traveller/Van', 'Truck', 
    'Crane', 'Bus', 'Tractor'
  ];
  
  const candidateShowTypes = [
    'New Registered', 'New Modified', 'Actively Applying', 
    'Trending Profile', 'Featured Candidate', 'Any'
  ];
  
  const candidateWithOptions = [
    'Verified Mobile Number', 'Available On WhatsApp', 'Verified Email ID', 
    'Attached Resume', 'Any'
  ];
  
  const lastActivePeriods = [
    '1 Day', '2 Days', '4 Days', '7 Days', '10 Days', '15 Days', 
    '30 Days', '60 Days', '90 Days', '180 Days', 'Any'
  ];

  // Education options
  const educationLevelOptions = EDUCATION_LEVEL_OPTIONS.map(level => ({ value: level.toLowerCase().replace(/\s+/g, '_'), label: level }));
  const educationStatusOptions = [
    { value: 'pursuing', label: 'Pursuing / Running' },
    { value: 'completed', label: 'Pass Out / Completed' },
    { value: 'no_education', label: 'No Education' },
  ];
  const educationTypeOptions = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'any', label: 'Any' },
  ];
  const educationMediumOptions = languageOptions;
  const marksTypeOptions = [
    { value: 'percentage', label: 'Percentage' },
    { value: 'grade', label: 'Grade' },
    { value: 'cgpa', label: 'CGPA' },
    { value: 'division', label: 'Division' },
    { value: 'any', label: 'Any' },
  ];
  const categoryOptions = [
    { value: 'sc', label: 'Scheduled Caste - SC' },
    { value: 'st', label: 'Scheduled Tribe - ST' },
    { value: 'obc_creamy', label: 'OBC - Creamy' },
    { value: 'obc_non_creamy', label: 'OBC – Non Creamy' },
    { value: 'ews', label: 'EWS' },
    { value: 'general', label: 'General' },
    { value: 'other', label: 'Other' },
  ];
  const candidatesShowTypeOptions = [
    { value: 'new_registered', label: 'New Registered' },
    { value: 'new_modified', label: 'New Modified' },
    { value: 'actively_applying', label: 'Actively Applying' },
    { value: 'trending_profile', label: 'Trending Profile' },
    { value: 'featured_candidate', label: 'Featured Candidate' },
    { value: 'any', label: 'Any' },
  ];
  const showCandidatesWithOptions = [
    { value: 'verified_mobile', label: 'Verified Mobile Number' },
    { value: 'verified_email', label: 'Verified Email ID' },
    { value: 'attached_resume', label: 'Attached Resume' },
    { value: 'available_whatsapp', label: 'Available On WhatsApp' },
    { value: 'any', label: 'Any' },
  ];
  const assetRequirementsOptions = [
    { value: 'laptop', label: 'Laptop' },
    { value: 'android_smartphone', label: 'Android Smart Phone' },
    { value: 'ios_smartphone', label: 'iOS Smart Phone' },
    { value: 'camera', label: 'Camera' },
    { value: 'two_wheeler', label: 'Two Wheeler' },
    { value: 'bike', label: 'Bike' },
    { value: 'e_bike', label: 'E-Bike' },
    { value: 'auto', label: 'Auto' },
    { value: 'e_rikshaw', label: 'E-Rikshaw' },
    { value: 'three_wheeler', label: 'Three Wheeler' },
    { value: 'four_wheeler', label: 'Four Wheeler' },
    { value: 'tempo', label: 'Tempo' },
    { value: 'traveller_van', label: 'Traveller/Van' },
    { value: 'truck', label: 'Truck' },
    { value: 'crane', label: 'Crane' },
    { value: 'bus', label: 'Bus' },
    { value: 'tractor', label: 'Tractor' },
    { value: 'lmv_license', label: 'LMV License' },
    { value: 'heavy_driver_license', label: 'Heavy Driver License' },
    { value: 'crane_operator_license', label: 'Crane Operator License' },
    { value: 'electrical_license', label: 'Electrical License' },
  ];
  
  // Helper function to get courses based on education level
  const getCoursesForEducationLevel = (selectedLevels) => {
    if (!selectedLevels || selectedLevels.length === 0) return [];
    const courses = [];
    selectedLevels.forEach(level => {
      const levelStr = typeof level === 'string' ? level : level.value || level.label || '';
      if (levelStr.toLowerCase().includes('iti')) {
        courses.push(...ITI_COURSE_OPTIONS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '_'), label: c })));
      } else if (levelStr.toLowerCase().includes('diploma')) {
        courses.push(...DIPLOMA_COURSE_OPTIONS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '_'), label: c })));
      } else if (levelStr.toLowerCase().includes('graduate')) {
        courses.push(...GRADUATE_COURSE_OPTIONS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '_').replace(/\./g, ''), label: c })));
      } else if (levelStr.toLowerCase().includes('post') || levelStr.toLowerCase().includes('pg')) {
        courses.push(...POST_GRADUATE_COURSE_OPTIONS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '_').replace(/\./g, ''), label: c })));
      } else if (levelStr.toLowerCase().includes('doctorate') || levelStr.toLowerCase().includes('phd')) {
        courses.push(...DOCTORATE_COURSE_OPTIONS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '_'), label: c })));
      }
    });
    return [...new Map(courses.map(c => [c.value, c])).values()];
  };
  
  // Helper function to get specializations based on course
  const getSpecializationsForCourse = (selectedCourses) => {
    if (!selectedCourses || selectedCourses.length === 0) return [];
    const specializations = [];
    selectedCourses.forEach(course => {
      const courseStr = typeof course === 'string' ? course : course.value || course.label || '';
      if (courseStr.toLowerCase().includes('iti')) {
        specializations.push(...ITI_SPECIALIZATION_OPTIONS.map(s => ({ value: s.toLowerCase().replace(/\s+/g, '_'), label: s })));
      } else if (courseStr.toLowerCase().includes('diploma')) {
        specializations.push(...DIPLOMA_SPECIALIZATION_OPTIONS.map(s => ({ value: s.toLowerCase().replace(/\s+/g, '_'), label: s })));
      } else if (courseStr.toLowerCase().includes('graduate') || courseStr.toLowerCase().includes('b.')) {
        specializations.push(...GRADUATE_SPECIALIZATION_OPTIONS.map(s => ({ value: s.toLowerCase().replace(/\s+/g, '_'), label: s })));
      } else if (courseStr.toLowerCase().includes('post') || courseStr.toLowerCase().includes('m.')) {
        specializations.push(...POST_GRADUATE_SPECIALIZATION_OPTIONS.map(s => ({ value: s.toLowerCase().replace(/\s+/g, '_'), label: s })));
      } else if (courseStr.toLowerCase().includes('doctorate') || courseStr.toLowerCase().includes('phd')) {
        specializations.push(...DOCTORATE_SPECIALIZATION_OPTIONS.map(s => ({ value: s.toLowerCase().replace(/\s+/g, '_'), label: s })));
      }
    });
    return [...new Map(specializations.map(s => [s.value, s])).values()];
  };
  
  // Search institutions
  const searchInstitutions = async (query) => {
    if (query.length < 2) {
      setInstitutionSuggestions([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/institutions/search?q=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data && data.success) {
        setInstitutionSuggestions(data.institutions.map(inst => ({ value: inst.id, label: inst.name })));
      }
    } catch (e) {
      console.error('Institution search error:', e);
    }
  };
  
  // Helper function to normalize values for comparison
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
  
  // Update sub-industries when industries change
  useEffect(() => {
    if (filters.industrySectors && filters.industrySectors.length > 0) {
      const industryLabels = filters.industrySectors.map(selectedIndustry => {
        const industryName = typeof selectedIndustry === 'string' ? selectedIndustry : selectedIndustry.label || selectedIndustry;
        const industry = INDUSTRIES_DATA.find(ind => 
          ind.industry === industryName || 
          normalizeValue(ind.industry) === normalizeValue(industryName)
        );
        return industry ? industry.industry : industryName;
      }).filter(Boolean);
      
      const subIndustries = getSubIndustries(industryLabels);
      const subIndustriesOpts = subIndustries.map(subInd => ({
        value: normalizeValue(subInd),
        label: subInd,
      }));
      setSubIndustriesOptions(subIndustriesOpts);
      
      if (filters.subIndustries && filters.subIndustries.length > 0) {
        const validSubIndustries = filters.subIndustries.filter(subInd => {
          const subIndLabel = typeof subInd === 'string' ? subInd : subInd.label || subInd;
          return subIndustriesOpts.some(opt => opt.label === subIndLabel);
        });
        if (validSubIndustries.length !== filters.subIndustries.length) {
          updateFilter('subIndustries', validSubIndustries);
        }
      }
    } else {
      setSubIndustriesOptions([]);
      updateFilter('subIndustries', []);
    }
  }, [filters.industrySectors]);
  
  // Update sub-departments when departments change
  useEffect(() => {
    if (filters.departmentCategory && filters.departmentCategory.length > 0) {
      const departmentLabels = filters.departmentCategory.map(selectedDepartment => {
        const departmentName = typeof selectedDepartment === 'string' ? selectedDepartment : selectedDepartment.label || selectedDepartment;
        const department = DEPARTMENTS_DATA.find(dept => 
          dept.department === departmentName || 
          normalizeValue(dept.department) === normalizeValue(departmentName)
        );
        return department ? department.department : departmentName;
      }).filter(Boolean);
      
      const subDepartments = getSubDepartments(departmentLabels);
      const subDepartmentsOpts = subDepartments.map(subDept => ({
        value: normalizeValue(subDept),
        label: subDept,
      }));
      setSubDepartmentsOptions(subDepartmentsOpts);
      
      if (filters.subDepartments && filters.subDepartments.length > 0) {
        const validSubDepartments = filters.subDepartments.filter(subDept => {
          const subDeptLabel = typeof subDept === 'string' ? subDept : subDept.label || subDept;
          return subDepartmentsOpts.some(opt => opt.label === subDeptLabel);
        });
        if (validSubDepartments.length !== filters.subDepartments.length) {
          updateFilter('subDepartments', validSubDepartments);
        }
      }
    } else {
      setSubDepartmentsOptions([]);
      updateFilter('subDepartments', []);
    }
  }, [filters.departmentCategory]);

  // Search candidates
  const handleSearch = async (page = 1) => {
    try {
      setSearching(true);
      
      const token = await AsyncStorage.getItem('adminToken');
      if (!token) {
        Alert.alert('Error', 'Please login again');
        navigation.replace('AdminLogin');
        return;
      }

      const response = await fetch(`${API_URL}/candidates/admin-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          filters,
          page,
          limit: 20,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
          searchMode: 'and'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCandidates(data.candidates);
        setTotalCandidates(data.total);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setSearchStats(data.searchStats);
      } else {
        Alert.alert('Error', data.message || 'Failed to search candidates');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search candidates');
    } finally {
      setSearching(false);
    }
  };

  // Update filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      currentCompanyName: '',
      searchKeywords: '',
      keySkills: [],
      experienceLevel: '',
      minExperience: '',
      maxExperience: '',
      currentCity: [],
      jobLocalityPincode: [],
      includeWillingToRelocate: false,
      excludeAnywhereInIndia: false,
      minSalary: '',
      maxSalary: '',
      includeNoSalaryCandidates: false,
      currentJobTitle: [],
      excludeKeywords: '',
      industrySectors: [],
      subIndustries: [],
      departmentCategory: [],
      subDepartments: [],
      jobRoles: [],
      currentCompanyType: '',
      noticePeriod: '',
      educationLevel: [],
      degreeCourse: [],
      specialisation: [],
      institutionNames: [],
      educationStatus: [],
      educationType: [],
      educationMedium: [],
      marksType: [],
      marksPercentage: '',
      certificationCourses: [],
      gender: [],
      disabilityStatus: [],
      anyDisabilities: [],
      diversityHiring: [],
      category: [],
      minAge: '',
      maxAge: '',
      employmentType: [],
      jobType: [],
      jobModeType: [],
      jobShiftType: [],
      preferredLanguage: [],
      englishFluencyLevel: [],
      assetRequirements: [],
      candidatesShowType: [],
      showCandidatesWith: [],
      lastActiveCandidates: ''
    });
    setSearchInCompanyName('');
    setSearchInCompanyType([]);
    setInstitutionSuggestions([]);
  };

  // View candidate details
  const viewCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    // Navigate to candidate details screen or show modal
    navigation.navigate('AdminCandidateDetails', { candidateId: candidate._id });
  };

  // Render candidate card
  const renderCandidateCard = (candidate) => (
    <TouchableOpacity
      key={candidate._id}
      style={dynamicStyles.candidateCard}
      onPress={() => viewCandidateDetails(candidate)}
    >
      <View style={dynamicStyles.candidateHeader}>
        <View style={dynamicStyles.candidateInfo}>
          <Text style={dynamicStyles.candidateName}>{candidate.name}</Text>
          <Text style={dynamicStyles.candidateRole}>{candidate.currentJobTitle || 'Not specified'}</Text>
          <Text style={dynamicStyles.candidateCompany}>{candidate.currentCompany || 'Not specified'}</Text>
        </View>
        <View style={dynamicStyles.matchScoreContainer}>
          <Text style={dynamicStyles.matchScoreLabel}>Match</Text>
          <Text style={dynamicStyles.matchScore}>{candidate.matchScore}%</Text>
        </View>
      </View>
      
      <View style={dynamicStyles.candidateDetails}>
        <View style={dynamicStyles.detailRow}>
          <Ionicons name="briefcase-outline" size={16} color="#666" />
          <Text style={dynamicStyles.detailText}>
            {candidate.totalExperience || 0} years experience
          </Text>
        </View>
        
        <View style={dynamicStyles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={dynamicStyles.detailText}>{candidate.location || 'Not specified'}</Text>
        </View>
        
        <View style={dynamicStyles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={dynamicStyles.detailText}>{candidate.availability || 'Not specified'}</Text>
        </View>
        
        {candidate.expectedSalary && (
          <View style={dynamicStyles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={dynamicStyles.detailText}>
              Expected: ₹{candidate.expectedSalary.toLocaleString()}
            </Text>
          </View>
        )}
      </View>
      
      {candidate.keySkills && candidate.keySkills.length > 0 && (
        <View style={dynamicStyles.skillsContainer}>
          {candidate.keySkills.slice(0, 5).map((skill, index) => (
            <View key={index} style={dynamicStyles.skillTag}>
              <Text style={dynamicStyles.skillText}>{skill}</Text>
            </View>
          ))}
          {candidate.keySkills.length > 5 && (
            <View style={dynamicStyles.skillTag}>
              <Text style={dynamicStyles.skillText}>+{candidate.keySkills.length - 5}</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={dynamicStyles.candidateFooter}>
        <View style={dynamicStyles.statusBadges}>
          {candidate.hasResume && (
            <View style={dynamicStyles.badge}>
              <Ionicons name="document-text" size={12} color="#28a745" />
              <Text style={dynamicStyles.badgeText}>Resume</Text>
            </View>
          )}
          {candidate.emailVerified && (
            <View style={dynamicStyles.badge}>
              <Ionicons name="checkmark-circle" size={12} color="#007bff" />
              <Text style={dynamicStyles.badgeText}>Verified</Text>
            </View>
          )}
          {candidate.whatsappAvailable && (
            <View style={dynamicStyles.badge}>
              <Ionicons name="logo-whatsapp" size={12} color="#25D366" />
              <Text style={dynamicStyles.badgeText}>WhatsApp</Text>
            </View>
          )}
        </View>
        
        <Text style={dynamicStyles.profileCompletion}>
          {candidate.profileCompletion}% Complete
        </Text>
      </View>
    </TouchableOpacity>
  );


  return (
    <AdminLayout title="Candidate Search (Fastdex/Freedex)" activeScreen="AdminCandidateSearch" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={dynamicStyles.container}>
        {/* Quick Search Bar */}
        <View style={dynamicStyles.quickSearchContainer}>
          <View style={dynamicStyles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={dynamicStyles.searchIcon} />
            <TextInput
              style={dynamicStyles.quickSearchInput}
              placeholder="Search by keywords, skills, name, company..."
              value={filters.searchKeywords}
              onChangeText={(text) => updateFilter('searchKeywords', text)}
              onSubmitEditing={() => handleSearch(1)}
            />
            {filters.searchKeywords !== '' && (
              <TouchableOpacity onPress={() => updateFilter('searchKeywords', '')}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={dynamicStyles.searchButtons}>
            <TouchableOpacity
              style={dynamicStyles.filtersButton}
              onPress={() => setShowFiltersModal(true)}
            >
              <Ionicons name="filter" size={20} color="#fff" />
              <Text style={dynamicStyles.filtersButtonText}>Advanced Filters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={dynamicStyles.searchButton}
              onPress={() => handleSearch(1)}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={dynamicStyles.searchButtonText}>Search</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Stats */}
        {searchStats && Object.keys(searchStats).length > 0 && (
          <View style={dynamicStyles.statsContainer}>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statValue}>{searchStats.totalCandidates || 0}</Text>
              <Text style={dynamicStyles.statLabel}>Total Candidates</Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statValue}>{searchStats.activeCandidates || 0}</Text>
              <Text style={dynamicStyles.statLabel}>Active</Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statValue}>{searchStats.verifiedCandidates || 0}</Text>
              <Text style={dynamicStyles.statLabel}>Verified</Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statValue}>{searchStats.recentCandidates || 0}</Text>
              <Text style={dynamicStyles.statLabel}>Recent (30d)</Text>
            </View>
          </View>
        )}

        {/* Results Header */}
        {candidates.length > 0 && (
          <View style={dynamicStyles.resultsHeader}>
            <Text style={dynamicStyles.resultsCount}>
              Found {totalCandidates} candidates
            </Text>
            <TouchableOpacity
              style={dynamicStyles.clearFiltersButton}
              onPress={clearAllFilters}
            >
              <Ionicons name="close-circle" size={16} color="#dc3545" />
              <Text style={dynamicStyles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Candidate Results */}
        <View style={dynamicStyles.resultsContainer}>
          {searching && candidates.length === 0 ? (
            <View style={dynamicStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={dynamicStyles.loadingText}>Searching candidates...</Text>
            </View>
          ) : candidates.length > 0 ? (
            <>
              {candidates.map(renderCandidateCard)}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <View style={dynamicStyles.paginationContainer}>
                  <TouchableOpacity
                    style={[dynamicStyles.paginationButton, currentPage === 1 && dynamicStyles.paginationButtonDisabled]}
                    onPress={() => handleSearch(currentPage - 1)}
                    disabled={currentPage === 1 || searching}
                  >
                    <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? '#ccc' : '#007bff'} />
                  </TouchableOpacity>
                  
                  <Text style={dynamicStyles.paginationText}>
                    Page {currentPage} of {totalPages}
                  </Text>
                  
                  <TouchableOpacity
                    style={[dynamicStyles.paginationButton, currentPage === totalPages && dynamicStyles.paginationButtonDisabled]}
                    onPress={() => handleSearch(currentPage + 1)}
                    disabled={currentPage === totalPages || searching}
                  >
                    <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? '#ccc' : '#007bff'} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={dynamicStyles.emptyContainer}>
              <Ionicons name="search" size={64} color="#ccc" />
              <Text style={dynamicStyles.emptyText}>
                {searching ? 'Searching...' : 'No candidates found. Try adjusting your filters.'}
              </Text>
              <TouchableOpacity
                style={dynamicStyles.emptyButton}
                onPress={() => handleSearch(1)}
              >
                <Text style={dynamicStyles.emptyButtonText}>Search All Candidates</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Advanced Filters Modal */}
        <Modal
          visible={showFiltersModal}
          animationType="slide"
          onRequestClose={() => setShowFiltersModal(false)}
        >
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Advanced Filters</Text>
              <TouchableOpacity 
                style={dynamicStyles.closeButton} 
                onPress={() => setShowFiltersModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={dynamicStyles.modalContent}>
              {/* Basic Information */}
              <Text style={dynamicStyles.sectionLabel}>Basic Information</Text>
              <TextInput style={dynamicStyles.input} placeholder="Current/Last Company Name (In Case Of Consultancy)" value={filters.currentCompanyName} onChangeText={(t)=>updateFilter('currentCompanyName',t)} />
              
              <TextInput style={dynamicStyles.input} placeholder="Search Keywords (Type/Add New or Select Existing Keywords)" value={filters.searchKeywords} onChangeText={(t)=>updateFilter('searchKeywords',t)} />
              
              {/* Key Skills */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Key Skills Name (Show 10 to 12 Suggestion Also) - Up to 10 Multiple Selection</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowKeySkillsDropdown(!showKeySkillsDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.keySkills.length>0?`${filters.keySkills.length} selected`:'Select Key Skills'}</Text>
                  <Ionicons name={showKeySkillsDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.keySkills.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.keySkills.map((skill, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{skill}</Text><TouchableOpacity onPress={()=>{updateFilter('keySkills', filters.keySkills.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showKeySkillsDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('keySkills', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {keySkillsOptions.map(option=>{
                      const isSelected = filters.keySkills.includes(option.label);
                      const isDisabled = !isSelected && filters.keySkills.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.keySkills.filter(s=>s!==option.label): [...filters.keySkills, option.label]; updateFilter('keySkills', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Experience Level */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Experience Level</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowExperienceDropdown(!showExperienceDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.experienceLevel || 'Select Experience Level'}</Text>
                  <Ionicons name={showExperienceDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showExperienceDropdown && (
                  <View style={dynamicStyles.dropdownList}>
                    <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('experienceLevel','');setShowExperienceDropdown(false);}}>
                      <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {experienceLevels.map(level => (
                      <TouchableOpacity key={level} style={[dynamicStyles.dropdownItem, filters.experienceLevel===level && dynamicStyles.dropdownItemSelected ]} onPress={()=>{updateFilter('experienceLevel',level);setShowExperienceDropdown(false);}}>
                        <Text style={[dynamicStyles.dropdownItemText, filters.experienceLevel===level && dynamicStyles.dropdownItemTextSelected]}>{level}</Text>
                        {filters.experienceLevel===level && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Experience Range */}
              <View style={dynamicStyles.rangeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={dynamicStyles.inputLabel}>Min Experience</Text>
                  <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowMinExpDropdown(!showMinExpDropdown)}>
                    <Text style={dynamicStyles.dropdownButtonText}>{filters.minExperience || 'Select Min Experience'}</Text>
                    <Ionicons name={showMinExpDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {showMinExpDropdown && (
                    <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                      <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('minExperience','');setShowMinExpDropdown(false);}}>
                        <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                      </TouchableOpacity>
                      {experienceYears.map(exp => (
                        <TouchableOpacity key={exp} style={[dynamicStyles.dropdownItem, filters.minExperience===exp && dynamicStyles.dropdownItemSelected]} onPress={()=>{updateFilter('minExperience',exp);setShowMinExpDropdown(false);}}>
                          <Text style={[dynamicStyles.dropdownItemText, filters.minExperience===exp && dynamicStyles.dropdownItemTextSelected]}>{exp}</Text>
                          {filters.minExperience===exp && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
                <Text style={dynamicStyles.rangeSeparator}>to</Text>
                <View style={{ flex: 1 }}>
                  <Text style={dynamicStyles.inputLabel}>Max Experience</Text>
                  <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowMaxExpDropdown(!showMaxExpDropdown)}>
                    <Text style={dynamicStyles.dropdownButtonText}>{filters.maxExperience || 'Select Max Experience'}</Text>
                    <Ionicons name={showMaxExpDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {showMaxExpDropdown && (
                    <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                      <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('maxExperience','');setShowMaxExpDropdown(false);}}>
                        <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                      </TouchableOpacity>
                      {experienceYears.map(exp => (
                        <TouchableOpacity key={exp} style={[dynamicStyles.dropdownItem, filters.maxExperience===exp && dynamicStyles.dropdownItemSelected]} onPress={()=>{updateFilter('maxExperience',exp);setShowMaxExpDropdown(false);}}>
                          <Text style={[dynamicStyles.dropdownItemText, filters.maxExperience===exp && dynamicStyles.dropdownItemTextSelected]}>{exp}</Text>
                          {filters.maxExperience===exp && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              {/* Location */}
              <Text style={dynamicStyles.sectionLabel}>Location</Text>
              <TextInput style={dynamicStyles.input} placeholder="Current City/Region of Candidate (Type or Select Up to 10 Locations)" value={filters.currentCity.join(', ')} onChangeText={(t)=>updateFilter('currentCity', t.split(',').map(s=>s.trim()).filter(Boolean).slice(0, 10))} />
              <TextInput style={dynamicStyles.input} placeholder="Job Locality Pincode (Optional) - Type or Select Up to 10 Pincodes" value={filters.jobLocalityPincode.join(', ')} onChangeText={(t)=>updateFilter('jobLocalityPincode', t.split(',').map(s=>s.trim()).filter(Boolean).slice(0, 10))} />
              <TouchableOpacity style={dynamicStyles.checkboxRow} onPress={()=>updateFilter('includeWillingToRelocate', !filters.includeWillingToRelocate)}>
                <Ionicons name={filters.includeWillingToRelocate?'checkbox':'square-outline'} size={22} color={colors.primary} /><Text style={dynamicStyles.checkboxLabel}>Include Willing To Relocate Candidates</Text>
              </TouchableOpacity>
              <TouchableOpacity style={dynamicStyles.checkboxRow} onPress={()=>updateFilter('excludeAnywhereInIndia', !filters.excludeAnywhereInIndia)}>
                <Ionicons name={filters.excludeAnywhereInIndia?'checkbox':'square-outline'} size={22} color={colors.primary} /><Text style={dynamicStyles.checkboxLabel}>Exclude candidates who have mentioned Anywhere in India</Text>
              </TouchableOpacity>

              {/* Salary */}
              <Text style={dynamicStyles.sectionLabel}>Salary</Text>
              <View style={dynamicStyles.rangeRowInputs}>
                <TextInput style={[dynamicStyles.input,{flex:1}]} placeholder="Min Salary (Lacs)" keyboardType="numeric" value={filters.minSalary} onChangeText={(t)=>updateFilter('minSalary',t)} />
                <Text style={dynamicStyles.rangeSeparator}>to</Text>
                <TextInput style={[dynamicStyles.input,{flex:1}]} placeholder="Max Salary (Lacs)" keyboardType="numeric" value={filters.maxSalary} onChangeText={(t)=>updateFilter('maxSalary',t)} />
              </View>
              <TouchableOpacity style={dynamicStyles.checkboxRow} onPress={()=>updateFilter('includeNoSalaryCandidates', !filters.includeNoSalaryCandidates)}>
                <Ionicons name={filters.includeNoSalaryCandidates?'checkbox':'square-outline'} size={22} color={colors.primary} /><Text style={dynamicStyles.checkboxLabel}>Include candidates with no salary mentioned</Text>
              </TouchableOpacity>

              {/* Professional Details */}
              <Text style={dynamicStyles.sectionLabel}>Professional Details</Text>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Current Job Title/Designation (Max 5)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowJobTitleDropdown(!showJobTitleDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.currentJobTitle.length>0?`${filters.currentJobTitle.length} selected`:'Select Job Titles'}</Text>
                  <Ionicons name={showJobTitleDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.currentJobTitle.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.currentJobTitle.map((title, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{title}</Text><TouchableOpacity onPress={()=>{updateFilter('currentJobTitle', filters.currentJobTitle.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showJobTitleDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('currentJobTitle', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {jobTitleOptions.map(option=>{
                      const isSelected = filters.currentJobTitle.includes(option.label);
                      const isDisabled = !isSelected && filters.currentJobTitle.length>=5;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.currentJobTitle.filter(t=>t!==option.label): [...filters.currentJobTitle, option.label]; updateFilter('currentJobTitle', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Company Type */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Company Type</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowCompanyTypeDropdown(!showCompanyTypeDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.currentCompanyType || 'Select Company Type'}</Text>
                  <Ionicons name={showCompanyTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showCompanyTypeDropdown && (
                  <View style={dynamicStyles.dropdownList}>
                    <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('currentCompanyType','');setShowCompanyTypeDropdown(false);}}>
                      <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {companyTypeOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, filters.currentCompanyType===option.label && dynamicStyles.dropdownItemSelected]} onPress={()=>{updateFilter('currentCompanyType', option.label);setShowCompanyTypeDropdown(false);}}>
                        <Text style={[dynamicStyles.dropdownItemText, filters.currentCompanyType===option.label && dynamicStyles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.currentCompanyType===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Notice Period */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Notice Period/Availability to Join</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowNoticePeriodDropdown(!showNoticePeriodDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.noticePeriod || 'Select Notice Period'}</Text>
                  <Ionicons name={showNoticePeriodDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showNoticePeriodDropdown && (
                  <View style={dynamicStyles.dropdownList}>
                    <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('noticePeriod','');setShowNoticePeriodDropdown(false);}}>
                      <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {joiningPeriodOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, filters.noticePeriod===option.label && dynamicStyles.dropdownItemSelected]} onPress={()=>{updateFilter('noticePeriod', option.label);setShowNoticePeriodDropdown(false);}}>
                        <Text style={[dynamicStyles.dropdownItemText, filters.noticePeriod===option.label && dynamicStyles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.noticePeriod===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Industry/Sectors */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Industry / Sectors (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowIndustryDropdown(!showIndustryDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.industrySectors.length>0?`${filters.industrySectors.length} selected`:'Select Industries'}</Text>
                  <Ionicons name={showIndustryDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.industrySectors.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.industrySectors.map((industry, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{industry}</Text><TouchableOpacity onPress={()=>{updateFilter('industrySectors', filters.industrySectors.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showIndustryDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('industrySectors', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {industryOptions.map(option=>{
                      const isSelected = filters.industrySectors.includes(option.label);
                      const isDisabled = !isSelected && filters.industrySectors.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.industrySectors.filter(i=>i!==option.label): [...filters.industrySectors, option.label]; updateFilter('industrySectors', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Sub-Industries - Only show when industries are selected */}
              {filters.industrySectors.length > 0 && subIndustriesOptions.length > 0 && (
                <View style={dynamicStyles.inputGroup}>
                  <Text style={dynamicStyles.inputLabel}>Sub-Industries (Upto 10 Multiple Selection)</Text>
                  <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowSubIndustryDropdown(!showSubIndustryDropdown)}>
                    <Text style={dynamicStyles.dropdownButtonText}>{filters.subIndustries.length>0?`${filters.subIndustries.length} selected`:'Select Sub-Industries'}</Text>
                    <Ionicons name={showSubIndustryDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {filters.subIndustries.length>0 && (
                    <View style={dynamicStyles.selectedItemsContainer}>
                      {filters.subIndustries.map((subIndustry, idx)=> (
                        <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{subIndustry}</Text><TouchableOpacity onPress={()=>{updateFilter('subIndustries', filters.subIndustries.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                      ))}
                    </View>
                  )}
                  {showSubIndustryDropdown && (
                    <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                      <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('subIndustries', []);}}>
                        <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                      </TouchableOpacity>
                      {subIndustriesOptions.map(option=>{
                        const isSelected = filters.subIndustries.includes(option.label);
                        const isDisabled = !isSelected && filters.subIndustries.length>=10;
                        return (
                          <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.subIndustries.filter(si=>si!==option.label): [...filters.subIndustries, option.label]; updateFilter('subIndustries', next); }} disabled={isDisabled}>
                            <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                            {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              )}
              
              {/* Department Category */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Department Category (Upto 5 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowDepartmentDropdown(!showDepartmentDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.departmentCategory.length>0?`${filters.departmentCategory.length} selected`:'Select Departments'}</Text>
                  <Ionicons name={showDepartmentDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.departmentCategory.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.departmentCategory.map((dept, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{dept}</Text><TouchableOpacity onPress={()=>{updateFilter('departmentCategory', filters.departmentCategory.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showDepartmentDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('departmentCategory', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {departmentOptions.map(option=>{
                      const isSelected = filters.departmentCategory.includes(option.label);
                      const isDisabled = !isSelected && filters.departmentCategory.length>=5;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.departmentCategory.filter(d=>d!==option.label): [...filters.departmentCategory, option.label]; updateFilter('departmentCategory', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Sub-Departments - Only show when departments are selected */}
              {filters.departmentCategory.length > 0 && subDepartmentsOptions.length > 0 && (
                <View style={dynamicStyles.inputGroup}>
                  <Text style={dynamicStyles.inputLabel}>Sub-Departments (Upto 5 Multiple Selection)</Text>
                  <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowSubDepartmentDropdown(!showSubDepartmentDropdown)}>
                    <Text style={dynamicStyles.dropdownButtonText}>{filters.subDepartments.length>0?`${filters.subDepartments.length} selected`:'Select Sub-Departments'}</Text>
                    <Ionicons name={showSubDepartmentDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {filters.subDepartments.length>0 && (
                    <View style={dynamicStyles.selectedItemsContainer}>
                      {filters.subDepartments.map((subDept, idx)=> (
                        <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{subDept}</Text><TouchableOpacity onPress={()=>{updateFilter('subDepartments', filters.subDepartments.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                      ))}
                    </View>
                  )}
                  {showSubDepartmentDropdown && (
                    <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                      <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('subDepartments', []);}}>
                        <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                      </TouchableOpacity>
                      {subDepartmentsOptions.map(option=>{
                        const isSelected = filters.subDepartments.includes(option.label);
                        const isDisabled = !isSelected && filters.subDepartments.length>=5;
                        return (
                          <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.subDepartments.filter(sd=>sd!==option.label): [...filters.subDepartments, option.label]; updateFilter('subDepartments', next); }} disabled={isDisabled}>
                            <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                            {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              )}
              
              {/* Job Roles */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Select Job Roles (Show 10 to 12 Suggestion Also) - Upto 5 Multiple Selection</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowJobRolesDropdown(!showJobRolesDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.jobRoles.length>0?`${filters.jobRoles.length} selected`:'Select Job Roles'}</Text>
                  <Ionicons name={showJobRolesDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.jobRoles.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.jobRoles.map((role, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{role}</Text><TouchableOpacity onPress={()=>{updateFilter('jobRoles', filters.jobRoles.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showJobRolesDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('jobRoles', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {jobRolesOptions.slice(0, 12).map(option=>{
                      const isSelected = filters.jobRoles.includes(option.label);
                      const isDisabled = !isSelected && filters.jobRoles.length>=5;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.jobRoles.filter(r=>r!==option.label): [...filters.jobRoles, option.label]; updateFilter('jobRoles', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Search in Company Name */}
              <TextInput style={dynamicStyles.input} placeholder="Search in Company Name (Type/Add New or Select Existing Keywords With 10 Multiple Selection)" value={searchInCompanyName} onChangeText={setSearchInCompanyName} />
              
              {/* Search in Company Type */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Search in Company Type (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowSearchInCompanyTypeDropdown(!showSearchInCompanyTypeDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{searchInCompanyType.length>0?`${searchInCompanyType.length} selected`:'Select Company Types'}</Text>
                  <Ionicons name={showSearchInCompanyTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {searchInCompanyType.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {searchInCompanyType.map((type, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{setSearchInCompanyType(searchInCompanyType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showSearchInCompanyTypeDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{setSearchInCompanyType([]);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {companyTypeOptions.map(option=>{
                      const isSelected = searchInCompanyType.includes(option.label);
                      const isDisabled = !isSelected && searchInCompanyType.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? searchInCompanyType.filter(t=>t!==option.label): [...searchInCompanyType, option.label]; setSearchInCompanyType(next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Demographics */}
              <Text style={dynamicStyles.sectionLabel}>Demographics</Text>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Gender</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowGenderDropdown(!showGenderDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.gender[0] || 'Select Gender'}</Text>
                  <Ionicons name={showGenderDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showGenderDropdown && (
                  <View style={dynamicStyles.dropdownList}>
                    <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('gender', []);setShowGenderDropdown(false);}}>
                      <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {genderOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, filters.gender[0]===option.label && dynamicStyles.dropdownItemSelected]} onPress={()=>{updateFilter('gender', [option.label]);setShowGenderDropdown(false);}}>
                        <Text style={[dynamicStyles.dropdownItemText, filters.gender[0]===option.label && dynamicStyles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.gender[0]===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={dynamicStyles.rangeRowInputs}>
                <TextInput style={[dynamicStyles.input,{flex:1}]} placeholder="Min Age" keyboardType="numeric" value={filters.minAge} onChangeText={(t)=>updateFilter('minAge',t)} />
                <Text style={dynamicStyles.rangeSeparator}>to</Text>
                <TextInput style={[dynamicStyles.input,{flex:1}]} placeholder="Max Age" keyboardType="numeric" value={filters.maxAge} onChangeText={(t)=>updateFilter('maxAge',t)} />
              </View>

              {/* Job Preferences */}
              <Text style={dynamicStyles.sectionLabel}>Job Preferences</Text>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Job Mode</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowJobModeDropdown(!showJobModeDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.jobModeType[0] || 'Select Job Mode'}</Text>
                  <Ionicons name={showJobModeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showJobModeDropdown && (
                  <View style={dynamicStyles.dropdownList}>
                    <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('jobModeType', []);setShowJobModeDropdown(false);}}>
                      <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {jobModeOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, filters.jobModeType[0]===option.label && dynamicStyles.dropdownItemSelected]} onPress={()=>{updateFilter('jobModeType', [option.label]);setShowJobModeDropdown(false);}}>
                        <Text style={[dynamicStyles.dropdownItemText, filters.jobModeType[0]===option.label && dynamicStyles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.jobModeType[0]===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Job Shift</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowJobShiftDropdown(!showJobShiftDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.jobShiftType[0] || 'Select Job Shift'}</Text>
                  <Ionicons name={showJobShiftDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showJobShiftDropdown && (
                  <View style={dynamicStyles.dropdownList}>
                    <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('jobShiftType', []);setShowJobShiftDropdown(false);}}>
                      <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {jobShiftOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, filters.jobShiftType[0]===option.label && dynamicStyles.dropdownItemSelected]} onPress={()=>{updateFilter('jobShiftType', [option.label]);setShowJobShiftDropdown(false);}}>
                        <Text style={[dynamicStyles.dropdownItemText, filters.jobShiftType[0]===option.label && dynamicStyles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.jobShiftType[0]===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>English Fluency</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowEnglishFluencyDropdown(!showEnglishFluencyDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.englishFluencyLevel[0] || 'Select English Fluency'}</Text>
                  <Ionicons name={showEnglishFluencyDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showEnglishFluencyDropdown && (
                  <View style={dynamicStyles.dropdownList}>
                    <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('englishFluencyLevel', []);setShowEnglishFluencyDropdown(false);}}>
                      <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {englishFluencyLevels.map(level => (
                      <TouchableOpacity key={level} style={[dynamicStyles.dropdownItem, filters.englishFluencyLevel[0]===level && dynamicStyles.dropdownItemSelected]} onPress={()=>{updateFilter('englishFluencyLevel', [level]);setShowEnglishFluencyDropdown(false);}}>
                        <Text style={[dynamicStyles.dropdownItemText, filters.englishFluencyLevel[0]===level && dynamicStyles.dropdownItemTextSelected]}>{level}</Text>
                        {filters.englishFluencyLevel[0]===level && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Preferred Language */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Preferred Language (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowPreferredLanguageDropdown(!showPreferredLanguageDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.preferredLanguage.length>0?`${filters.preferredLanguage.length} selected`:'Select Languages'}</Text>
                  <Ionicons name={showPreferredLanguageDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.preferredLanguage.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.preferredLanguage.map((lang, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{lang}</Text><TouchableOpacity onPress={()=>{updateFilter('preferredLanguage', filters.preferredLanguage.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showPreferredLanguageDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('preferredLanguage', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {languageOptions.map(option=>{
                      const isSelected = filters.preferredLanguage.includes(option.label);
                      const isDisabled = !isSelected && filters.preferredLanguage.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.preferredLanguage.filter(l=>l!==option.label): [...filters.preferredLanguage, option.label]; updateFilter('preferredLanguage', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Asset Requirements */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Asset Requirements/Availability (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowAssetRequirementsDropdown(!showAssetRequirementsDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.assetRequirements.length>0?`${filters.assetRequirements.length} selected`:'Select Assets'}</Text>
                  <Ionicons name={showAssetRequirementsDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.assetRequirements.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.assetRequirements.map((asset, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{asset}</Text><TouchableOpacity onPress={()=>{updateFilter('assetRequirements', filters.assetRequirements.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showAssetRequirementsDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('assetRequirements', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {assetRequirementsOptions.map(option=>{
                      const isSelected = filters.assetRequirements.includes(option.label);
                      const isDisabled = !isSelected && filters.assetRequirements.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.assetRequirements.filter(a=>a!==option.label): [...filters.assetRequirements, option.label]; updateFilter('assetRequirements', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Education Section */}
              <Text style={dynamicStyles.sectionLabel}>Education</Text>
              
              {/* Level of Education */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Level of Education (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowEducationLevelDropdown(!showEducationLevelDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.educationLevel.length>0?`${filters.educationLevel.length} selected`:'Select Education Level'}</Text>
                  <Ionicons name={showEducationLevelDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.educationLevel.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.educationLevel.map((level, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{level}</Text><TouchableOpacity onPress={()=>{updateFilter('educationLevel', filters.educationLevel.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showEducationLevelDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('educationLevel', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {educationLevelOptions.map(option=>{
                      const isSelected = filters.educationLevel.includes(option.label);
                      const isDisabled = !isSelected && filters.educationLevel.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.educationLevel.filter(l=>l!==option.label): [...filters.educationLevel, option.label]; updateFilter('educationLevel', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Degree/Course */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Degree/Course (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowDegreeCourseDropdown(!showDegreeCourseDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.degreeCourse.length>0?`${filters.degreeCourse.length} selected`:'Select Degree/Course'}</Text>
                  <Ionicons name={showDegreeCourseDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.degreeCourse.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.degreeCourse.map((course, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{course}</Text><TouchableOpacity onPress={()=>{updateFilter('degreeCourse', filters.degreeCourse.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showDegreeCourseDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('degreeCourse', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {getCoursesForEducationLevel(filters.educationLevel).map(option=>{
                      const isSelected = filters.degreeCourse.includes(option.label);
                      const isDisabled = !isSelected && filters.degreeCourse.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.degreeCourse.filter(c=>c!==option.label): [...filters.degreeCourse, option.label]; updateFilter('degreeCourse', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Specialisation */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Specialisation (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowSpecialisationDropdown(!showSpecialisationDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.specialisation.length>0?`${filters.specialisation.length} selected`:'Select Specialisation'}</Text>
                  <Ionicons name={showSpecialisationDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.specialisation.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.specialisation.map((spec, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{spec}</Text><TouchableOpacity onPress={()=>{updateFilter('specialisation', filters.specialisation.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showSpecialisationDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('specialisation', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {getSpecializationsForCourse(filters.degreeCourse).map(option=>{
                      const isSelected = filters.specialisation.includes(option.label);
                      const isDisabled = !isSelected && filters.specialisation.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.specialisation.filter(s=>s!==option.label): [...filters.specialisation, option.label]; updateFilter('specialisation', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Institution/College Name */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Institution/College Name (Type or Select Existing Suggestion)</Text>
                <TextInput 
                  style={dynamicStyles.input} 
                  placeholder="Type institution name..." 
                  value={filters.institutionNames.join(', ')} 
                  onChangeText={(t)=>{
                    const names = t.split(',').map(s=>s.trim()).filter(Boolean);
                    updateFilter('institutionNames', names);
                    if (t.length >= 2) {
                      searchInstitutions(t);
                    }
                  }}
                />
                {institutionSuggestions.length > 0 && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    {institutionSuggestions.map(inst => (
                      <TouchableOpacity 
                        key={inst.value} 
                        style={dynamicStyles.dropdownItem}
                        onPress={() => {
                          if (!filters.institutionNames.includes(inst.label)) {
                            updateFilter('institutionNames', [...filters.institutionNames, inst.label]);
                          }
                          setInstitutionSuggestions([]);
                        }}
                      >
                        <Text style={dynamicStyles.dropdownItemText}>{inst.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                {filters.institutionNames.length > 0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.institutionNames.map((name, idx) => (
                      <View key={idx} style={dynamicStyles.selectedItem}>
                        <Text style={dynamicStyles.selectedItemText}>{name}</Text>
                        <TouchableOpacity onPress={() => {updateFilter('institutionNames', filters.institutionNames.filter((_, i) => i !== idx));}}>
                          <Ionicons name="close-circle" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Education Status */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Education Status (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowEducationStatusDropdown(!showEducationStatusDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.educationStatus.length>0?`${filters.educationStatus.length} selected`:'Select Education Status'}</Text>
                  <Ionicons name={showEducationStatusDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.educationStatus.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.educationStatus.map((status, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{status}</Text><TouchableOpacity onPress={()=>{updateFilter('educationStatus', filters.educationStatus.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showEducationStatusDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('educationStatus', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {educationStatusOptions.map(option=>{
                      const isSelected = filters.educationStatus.includes(option.label);
                      const isDisabled = !isSelected && filters.educationStatus.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.educationStatus.filter(s=>s!==option.label): [...filters.educationStatus, option.label]; updateFilter('educationStatus', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Education Type */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Education Type (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowEducationTypeDropdown(!showEducationTypeDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.educationType.length>0?`${filters.educationType.length} selected`:'Select Education Type'}</Text>
                  <Ionicons name={showEducationTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.educationType.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.educationType.map((type, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{updateFilter('educationType', filters.educationType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showEducationTypeDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('educationType', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {educationTypeOptions.map(option=>{
                      const isSelected = filters.educationType.includes(option.label);
                      const isDisabled = !isSelected && filters.educationType.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.educationType.filter(t=>t!==option.label): [...filters.educationType, option.label]; updateFilter('educationType', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Education Medium */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Education Medium (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowEducationMediumDropdown(!showEducationMediumDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.educationMedium.length>0?`${filters.educationMedium.length} selected`:'Select Education Medium'}</Text>
                  <Ionicons name={showEducationMediumDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.educationMedium.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.educationMedium.map((medium, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{medium}</Text><TouchableOpacity onPress={()=>{updateFilter('educationMedium', filters.educationMedium.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showEducationMediumDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('educationMedium', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {educationMediumOptions.map(option=>{
                      const isSelected = filters.educationMedium.includes(option.label);
                      const isDisabled = !isSelected && filters.educationMedium.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.educationMedium.filter(m=>m!==option.label): [...filters.educationMedium, option.label]; updateFilter('educationMedium', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Marks Type */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Marks Type (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowMarksTypeDropdown(!showMarksTypeDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.marksType.length>0?`${filters.marksType.length} selected`:'Select Marks Type'}</Text>
                  <Ionicons name={showMarksTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.marksType.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.marksType.map((type, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{updateFilter('marksType', filters.marksType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showMarksTypeDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('marksType', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {marksTypeOptions.map(option=>{
                      const isSelected = filters.marksType.includes(option.label);
                      const isDisabled = !isSelected && filters.marksType.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.marksType.filter(t=>t!==option.label): [...filters.marksType, option.label]; updateFilter('marksType', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Marks Percentage/Grade */}
              <TextInput style={dynamicStyles.input} placeholder="Marks Percentage/Grade (e.g., 0% to 100%, A,B,C,D,E,F, 0 to 10 CGPA)" value={filters.marksPercentage} onChangeText={(t)=>updateFilter('marksPercentage',t)} />
              
              {/* Extra Certification Course Name */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Extra Certification Course Name (Show 5 to 10 Suggestion Also) - Upto 5 Multiple Selection</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowCertificationDropdown(!showCertificationDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.certificationCourses.length>0?`${filters.certificationCourses.length} selected`:'Select Certifications'}</Text>
                  <Ionicons name={showCertificationDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.certificationCourses.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.certificationCourses.map((cert, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{cert}</Text><TouchableOpacity onPress={()=>{updateFilter('certificationCourses', filters.certificationCourses.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showCertificationDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('certificationCourses', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {keySkillsOptions.slice(0, 10).map(option=>{
                      const isSelected = filters.certificationCourses.includes(option.label);
                      const isDisabled = !isSelected && filters.certificationCourses.length>=5;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.certificationCourses.filter(c=>c!==option.label): [...filters.certificationCourses, option.label]; updateFilter('certificationCourses', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Demographics - Additional Fields */}
              {/* Disability Status */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Disability Status</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowDisabilityStatusDropdown(!showDisabilityStatusDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.disabilityStatus[0] || 'Select Disability Status'}</Text>
                  <Ionicons name={showDisabilityStatusDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showDisabilityStatusDropdown && (
                  <View style={dynamicStyles.dropdownList}>
                    <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('disabilityStatus', []);setShowDisabilityStatusDropdown(false);}}>
                      <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {disabilityStatusOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, filters.disabilityStatus[0]===option.label && dynamicStyles.dropdownItemSelected]} onPress={()=>{updateFilter('disabilityStatus', [option.label]);setShowDisabilityStatusDropdown(false);}}>
                        <Text style={[dynamicStyles.dropdownItemText, filters.disabilityStatus[0]===option.label && dynamicStyles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.disabilityStatus[0]===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Any Disabilities/Differently-abled */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Any Disabilities/Differently-abled (Upto 5 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowAnyDisabilitiesDropdown(!showAnyDisabilitiesDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.anyDisabilities.length>0?`${filters.anyDisabilities.length} selected`:'Select Disabilities'}</Text>
                  <Ionicons name={showAnyDisabilitiesDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.anyDisabilities.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.anyDisabilities.map((disability, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{disability}</Text><TouchableOpacity onPress={()=>{updateFilter('anyDisabilities', filters.anyDisabilities.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showAnyDisabilitiesDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('anyDisabilities', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {disabilityTypeOptions.map(option=>{
                      const isSelected = filters.anyDisabilities.includes(option.label);
                      const isDisabled = !isSelected && filters.anyDisabilities.length>=5;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.anyDisabilities.filter(d=>d!==option.label): [...filters.anyDisabilities, option.label]; updateFilter('anyDisabilities', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Diversity Hiring */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Diversity Hiring</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowDiversityHiringDropdown(!showDiversityHiringDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.diversityHiring[0] || 'Select Diversity Hiring'}</Text>
                  <Ionicons name={showDiversityHiringDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showDiversityHiringDropdown && (
                  <View style={dynamicStyles.dropdownList}>
                    <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('diversityHiring', []);setShowDiversityHiringDropdown(false);}}>
                      <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {diversityHiringOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, filters.diversityHiring[0]===option.label && dynamicStyles.dropdownItemSelected]} onPress={()=>{updateFilter('diversityHiring', [option.label]);setShowDiversityHiringDropdown(false);}}>
                        <Text style={[dynamicStyles.dropdownItemText, filters.diversityHiring[0]===option.label && dynamicStyles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.diversityHiring[0]===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Category */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Category (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowCategoryDropdown(!showCategoryDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.category.length>0?`${filters.category.length} selected`:'Select Category'}</Text>
                  <Ionicons name={showCategoryDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.category.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.category.map((cat, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{cat}</Text><TouchableOpacity onPress={()=>{updateFilter('category', filters.category.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showCategoryDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('category', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {categoryOptions.map(option=>{
                      const isSelected = filters.category.includes(option.label);
                      const isDisabled = !isSelected && filters.category.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.category.filter(c=>c!==option.label): [...filters.category, option.label]; updateFilter('category', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Employment Type */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Employment Type (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowEmploymentTypeDropdown(!showEmploymentTypeDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.employmentType.length>0?`${filters.employmentType.length} selected`:'Select Employment Type'}</Text>
                  <Ionicons name={showEmploymentTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.employmentType.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.employmentType.map((type, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{updateFilter('employmentType', filters.employmentType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showEmploymentTypeDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('employmentType', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {employmentTypeOptions.map(option=>{
                      const isSelected = filters.employmentType.includes(option.label);
                      const isDisabled = !isSelected && filters.employmentType.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.employmentType.filter(t=>t!==option.label): [...filters.employmentType, option.label]; updateFilter('employmentType', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Job Type */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Job Type (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowJobTypeDropdown(!showJobTypeDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.jobType.length>0?`${filters.jobType.length} selected`:'Select Job Type'}</Text>
                  <Ionicons name={showJobTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.jobType.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.jobType.map((type, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{updateFilter('jobType', filters.jobType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showJobTypeDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('jobType', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {jobTypeOptions.map(option=>{
                      const isSelected = filters.jobType.includes(option.label);
                      const isDisabled = !isSelected && filters.jobType.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.jobType.filter(t=>t!==option.label): [...filters.jobType, option.label]; updateFilter('jobType', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Candidate Status */}
              <Text style={dynamicStyles.sectionLabel}>Candidate Status</Text>
              
              {/* Candidates Show Type */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Candidates Show Type (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowCandidatesShowTypeDropdown(!showCandidatesShowTypeDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.candidatesShowType.length>0?`${filters.candidatesShowType.length} selected`:'Select Show Type'}</Text>
                  <Ionicons name={showCandidatesShowTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.candidatesShowType.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.candidatesShowType.map((type, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{updateFilter('candidatesShowType', filters.candidatesShowType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showCandidatesShowTypeDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('candidatesShowType', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {candidatesShowTypeOptions.map(option=>{
                      const isSelected = filters.candidatesShowType.includes(option.label);
                      const isDisabled = !isSelected && filters.candidatesShowType.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.candidatesShowType.filter(t=>t!==option.label): [...filters.candidatesShowType, option.label]; updateFilter('candidatesShowType', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Show Candidates with */}
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Show Candidates with (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowShowCandidatesWithDropdown(!showShowCandidatesWithDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.showCandidatesWith.length>0?`${filters.showCandidatesWith.length} selected`:'Select Options'}</Text>
                  <Ionicons name={showShowCandidatesWithDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.showCandidatesWith.length>0 && (
                  <View style={dynamicStyles.selectedItemsContainer}>
                    {filters.showCandidatesWith.map((option, idx)=> (
                      <View key={idx} style={dynamicStyles.selectedItem}><Text style={dynamicStyles.selectedItemText}>{option}</Text><TouchableOpacity onPress={()=>{updateFilter('showCandidatesWith', filters.showCandidatesWith.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showShowCandidatesWithDropdown && (
                  <ScrollView style={dynamicStyles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[dynamicStyles.dropdownItem, dynamicStyles.dropdownClearItem]} onPress={()=>{updateFilter('showCandidatesWith', []);}}>
                      <Text style={[dynamicStyles.dropdownItemText, dynamicStyles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {showCandidatesWithOptions.map(option=>{
                      const isSelected = filters.showCandidatesWith.includes(option.label);
                      const isDisabled = !isSelected && filters.showCandidatesWith.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[dynamicStyles.dropdownItem, isSelected && dynamicStyles.dropdownItemSelected, isDisabled && dynamicStyles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.showCandidatesWith.filter(o=>o!==option.label): [...filters.showCandidatesWith, option.label]; updateFilter('showCandidatesWith', next); }} disabled={isDisabled}>
                          <Text style={[dynamicStyles.dropdownItemText, isSelected && dynamicStyles.dropdownItemTextSelected, isDisabled && dynamicStyles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Last Active</Text>
                <TouchableOpacity style={dynamicStyles.dropdownButton} onPress={()=>setShowLastActiveDropdown(!showLastActiveDropdown)}>
                  <Text style={dynamicStyles.dropdownButtonText}>{filters.lastActiveCandidates || 'Select Last Active Period'}</Text>
                  <Ionicons name={showLastActiveDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showLastActiveDropdown && (
                  <View style={dynamicStyles.dropdownList}>
                    <TouchableOpacity style={dynamicStyles.dropdownItem} onPress={()=>{updateFilter('lastActiveCandidates','');setShowLastActiveDropdown(false);}}>
                      <Text style={dynamicStyles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {lastActiveOptions.map(option => (
                      <TouchableOpacity key={option} style={[dynamicStyles.dropdownItem, filters.lastActiveCandidates===option && dynamicStyles.dropdownItemSelected]} onPress={()=>{updateFilter('lastActiveCandidates', option);setShowLastActiveDropdown(false);}}>
                        <Text style={[dynamicStyles.dropdownItemText, filters.lastActiveCandidates===option && dynamicStyles.dropdownItemTextSelected]}>{option}</Text>
                        {filters.lastActiveCandidates===option && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Exclude Keywords */}
              <TextInput style={dynamicStyles.input} placeholder="Exclude Keywords (Add Excluded Keywords)" value={filters.excludeKeywords} onChangeText={(t)=>updateFilter('excludeKeywords',t)} />
            </ScrollView>
            <View style={dynamicStyles.modalFooter}>
              <TouchableOpacity style={dynamicStyles.clearButton} onPress={clearAllFilters}><Text style={dynamicStyles.clearButtonText}>Clear All</Text></TouchableOpacity>
              <TouchableOpacity style={dynamicStyles.applyButton} onPress={()=>{setShowFiltersModal(false);handleSearch(1);}}><Text style={dynamicStyles.applyButtonText}>Apply Filters</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  quickSearchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12
  },
  searchIcon: {
    marginRight: 8
  },
  quickSearchInput: {
    flex: 1,
    height: 48,
    fontSize: 16
  },
  searchButtons: {
    flexDirection: 'row',
    gap: 12
  },
  filtersButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8
  },
  filtersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  searchButton: {
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
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  clearFiltersText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500'
  },
  resultsContainer: {
    padding: 16
  },
  candidateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  candidateInfo: {
    flex: 1
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  candidateRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  candidateCompany: {
    fontSize: 14,
    color: '#007bff'
  },
  matchScoreContainer: {
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60
  },
  matchScoreLabel: {
    fontSize: 10,
    color: '#666'
  },
  matchScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff'
  },
  candidateDetails: {
    marginBottom: 12
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8
  },
  detailText: {
    fontSize: 14,
    color: '#666'
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
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
  candidateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    fontSize: 10,
    color: '#666'
  },
  profileCompletion: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 20
  },
  paginationButton: {
    padding: 8
  },
  paginationButtonDisabled: {
    opacity: 0.5
  },
  paginationText: {
    fontSize: 16,
    color: '#333'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  modalContent: {
    flex: 1,
    padding: 16
  },
  filterSection: {
    marginBottom: 24
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  filterInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  inputGroup: {
    marginBottom: 12
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12
  },
  rangeRowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  dropdownClearItem: {
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    marginBottom: 4
  },
  dropdownClearItemText: {
    color: '#dc3545',
    fontWeight: '500',
    fontSize: 13
  },
  inputContainer: {
    marginBottom: 12,
    zIndex: 1
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333'
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  dropdownItemSelected: {
    backgroundColor: '#e7f3ff'
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333'
  },
  dropdownItemTextSelected: {
    color: '#007bff',
    fontWeight: '600'
  },
  dropdownItemDisabled: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5'
  },
  dropdownItemTextDisabled: {
    color: '#999'
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6
  },
  selectedItemText: {
    fontSize: 14,
    color: '#007bff'
  },
  experienceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12
  },
  experienceDropdownWrapper: {
    flex: 1
  },
  rangeSeparatorVertical: {
    fontSize: 14,
    color: '#666',
    marginTop: 32
  },
  rangeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  rangeInput: {
    flex: 1
  },
  rangeSeparator: {
    fontSize: 14,
    color: '#666'
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333'
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default AdminCandidateSearchScreen;

