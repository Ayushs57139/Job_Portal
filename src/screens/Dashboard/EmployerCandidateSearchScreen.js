import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';
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

const EmployerCandidateSearchScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const { isMobile } = responsive;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchStats, setSearchStats] = useState({});

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  // Dropdown visibility states
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

  const [filters, setFilters] = useState({
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
    lastActiveCandidates: '',
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
      lastActiveCandidates: '',
    });
    setSearchInCompanyName('');
    setSearchInCompanyType([]);
    setInstitutionSuggestions([]);
  };

  const handleSearch = async (page = 1) => {
    try {
      setSearching(true);
      // Normalize filters to match backend expectations
      const payloadFilters = {
        ...filters,
        currentJobTitle: Array.isArray(filters.currentJobTitle) ? filters.currentJobTitle.join('|') : (filters.currentJobTitle || ''),
      };
      const data = await api.request('/candidates/advanced-search', {
        method: 'POST',
        body: JSON.stringify({ filters: payloadFilters, page, limit: 20, sortBy: 'updatedAt', sortOrder: 'desc', searchMode: 'and' }),
      });
      if (data && data.success) {
        setCandidates(data.candidates || []);
        setTotalCandidates(data.total || 0);
        setCurrentPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setSearchStats(data.searchStats || {});
      } else {
        Alert.alert('Error', data?.message || 'Failed to search candidates');
      }
    } catch (e) {
      console.error('Candidate search error:', e);
      Alert.alert('Error', 'Failed to search candidates');
    } finally {
      setSearching(false);
    }
  };

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
  const lastActiveOptions = ['1 Day', '2 Days', '4 Days', '7 Days', '10 Days', '15 Days', '30 Days', '60 Days', '90 Days', '180 Days', 'Any'];
  
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
      const data = await api.request(`/institutions/search?q=${encodeURIComponent(query)}&limit=10`);
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
      // Get industry labels from selected values (they're stored as label strings)
      const industryLabels = filters.industrySectors.map(selectedIndustry => {
        // Selected industry is stored as the label string
        const industryName = typeof selectedIndustry === 'string' ? selectedIndustry : selectedIndustry.label || selectedIndustry;
        
        // Find matching industry in INDUSTRIES_DATA
        const industry = INDUSTRIES_DATA.find(ind => 
          ind.industry === industryName || 
          normalizeValue(ind.industry) === normalizeValue(industryName)
        );
        
        return industry ? industry.industry : industryName;
      }).filter(Boolean);
      
      // Get sub-industries for selected industries
      const subIndustries = getSubIndustries(industryLabels);
      const subIndustriesOpts = subIndustries.map(subInd => ({
        value: normalizeValue(subInd),
        label: subInd,
      }));
      setSubIndustriesOptions(subIndustriesOpts);
      
      // Clear sub-industries if they're no longer valid
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
      // Get department labels from selected values (they're stored as label strings)
      const departmentLabels = filters.departmentCategory.map(selectedDepartment => {
        // Selected department is stored as the label string
        const departmentName = typeof selectedDepartment === 'string' ? selectedDepartment : selectedDepartment.label || selectedDepartment;
        
        // Find matching department in DEPARTMENTS_DATA
        const department = DEPARTMENTS_DATA.find(dept => 
          dept.department === departmentName || 
          normalizeValue(dept.department) === normalizeValue(departmentName)
        );
        
        return department ? department.department : departmentName;
      }).filter(Boolean);
      
      // Get sub-departments for selected departments
      const subDepartments = getSubDepartments(departmentLabels);
      const subDepartmentsOpts = subDepartments.map(subDept => ({
        value: normalizeValue(subDept),
        label: subDept,
      }));
      setSubDepartmentsOptions(subDepartmentsOpts);
      
      // Clear sub-departments if they're no longer valid
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

  const renderCandidateCard = (candidate) => (
    <View key={candidate._id} style={styles.candidateCard}>
      <View style={styles.candidateHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.candidateName}>{candidate.name}</Text>
          <Text style={styles.candidateRole}>{candidate.currentJobTitle || 'Not specified'}</Text>
          <Text style={styles.candidateCompany}>{candidate.currentCompany || 'Not specified'}</Text>
        </View>
        <View style={styles.matchScoreContainer}>
          <Text style={styles.matchScoreLabel}>Match</Text>
          <Text style={styles.matchScore}>{candidate.matchScore || 0}%</Text>
        </View>
      </View>
      <View style={styles.detailRow}><Ionicons name="location-outline" size={16} color={colors.textSecondary} /><Text style={styles.detailText}>{candidate.location || 'Not specified'}</Text></View>
      {candidate.keySkills && candidate.keySkills.length > 0 && (
        <View style={styles.skillsContainer}>
          {candidate.keySkills.slice(0,5).map((s, i) => (
            <View key={i} style={styles.skillTag}><Text style={styles.skillText}>{s}</Text></View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.page}>
      {!isMobile && (
        <View style={styles.sidebar}>
          <EmployerSidebar permanent navigation={navigation} role="company" activeKey="resume" />
        </View>
      )}
      {isMobile && (
        <EmployerSidebar 
          visible={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          navigation={navigation} 
          role="company" 
          activeKey="resume" 
        />
      )}
      {isMobile && (
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSidebarOpen(true)}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <View style={[styles.content, isMobile && styles.contentMobile]}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerBar, isMobile && styles.headerBarMobile]}
        >
          <View style={[styles.headerLeft, isMobile && styles.headerLeftMobile]}>
            <View style={[styles.headerIconContainer, isMobile && styles.headerIconContainerMobile]}>
              <Ionicons name="search" size={isMobile ? 24 : 28} color="#3B82F6" />
            </View>
            <View>
              <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>Candidate Search</Text>
              <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>Search and filter candidates dynamically</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.quickSearchContainer, isMobile && styles.quickSearchContainerMobile]}>
          <View style={[styles.searchRow, isMobile && styles.searchRowMobile]}>
            <View style={styles.searchInputWrap}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by keywords, skills, name, company..."
                value={filters.searchKeywords}
                onChangeText={(t) => updateFilter('searchKeywords', t)}
                onSubmitEditing={() => handleSearch(1)}
              />
              {filters.searchKeywords !== '' && (
                <TouchableOpacity onPress={() => updateFilter('searchKeywords', '')}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.filtersButton} onPress={() => setShowFiltersModal(true)}>
              <Ionicons name="filter" size={18} color="#fff" />
              <Text style={styles.filtersButtonText}>Advanced Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(1)} disabled={searching}>
              {searching ? <ActivityIndicator color="#fff" /> : (<><Ionicons name="search" size={18} color="#fff" /><Text style={styles.searchButtonText}>Search</Text></>)}
            </TouchableOpacity>
          </View>
        </View>

        {searchStats && Object.keys(searchStats).length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}><Text style={styles.statValue}>{searchStats.totalCandidates || 0}</Text><Text style={styles.statLabel}>Total</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{searchStats.activeCandidates || 0}</Text><Text style={styles.statLabel}>Active</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{searchStats.verifiedCandidates || 0}</Text><Text style={styles.statLabel}>Verified</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{searchStats.recentCandidates || 0}</Text><Text style={styles.statLabel}>Recent (30d)</Text></View>
          </View>
        )}

        <ScrollView style={{ flex: 1, padding: spacing.lg }}>
          {searching && candidates.length === 0 ? (
            <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.loadingText}>Searching candidates...</Text></View>
          ) : candidates.length > 0 ? (
            <View>
              <Text style={styles.resultsCount}>Found {totalCandidates} candidates</Text>
              <View style={{ marginTop: spacing.md }}>
                {candidates.map(renderCandidateCard)}
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No candidates yet. Try searching with filters.</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => handleSearch(1)}>
                <Text style={styles.emptyButtonText}>Search All Candidates</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Advanced Filters Modal - aligned with Admin filters */}
        <Modal visible={showFiltersModal} animationType="slide" onRequestClose={() => setShowFiltersModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Advanced Filters</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowFiltersModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {/* Basic Information */}
              <Text style={styles.sectionLabel}>Basic Information</Text>
              <TextInput style={styles.input} placeholder="Current/Last Company Name (In Case Of Consultancy)" value={filters.currentCompanyName} onChangeText={(t)=>updateFilter('currentCompanyName',t)} />
              
              <TextInput style={styles.input} placeholder="Search Keywords (Type/Add New or Select Existing Keywords)" value={filters.searchKeywords} onChangeText={(t)=>updateFilter('searchKeywords',t)} />
              
              {/* Key Skills */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Key Skills Name (Show 10 to 12 Suggestion Also) - Up to 10 Multiple Selection</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowKeySkillsDropdown(!showKeySkillsDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.keySkills.length>0?`${filters.keySkills.length} selected`:'Select Key Skills'}</Text>
                  <Ionicons name={showKeySkillsDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.keySkills.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.keySkills.map((skill, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{skill}</Text><TouchableOpacity onPress={()=>{updateFilter('keySkills', filters.keySkills.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showKeySkillsDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('keySkills', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {keySkillsOptions.map(option=>{
                      const isSelected = filters.keySkills.includes(option.label);
                      const isDisabled = !isSelected && filters.keySkills.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.keySkills.filter(s=>s!==option.label): [...filters.keySkills, option.label]; updateFilter('keySkills', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Experience Level */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Experience Level</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowExperienceDropdown(!showExperienceDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.experienceLevel || 'Select Experience Level'}</Text>
                  <Ionicons name={showExperienceDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showExperienceDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('experienceLevel','');setShowExperienceDropdown(false);}}>
                      <Text style={styles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {experienceLevels.map(level => (
                      <TouchableOpacity key={level} style={[styles.dropdownItem, filters.experienceLevel===level && styles.dropdownItemSelected ]} onPress={()=>{updateFilter('experienceLevel',level);setShowExperienceDropdown(false);}}>
                        <Text style={[styles.dropdownItemText, filters.experienceLevel===level && styles.dropdownItemTextSelected]}>{level}</Text>
                        {filters.experienceLevel===level && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Experience Range */}
              <View style={styles.rangeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Min Experience</Text>
                  <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowMinExpDropdown(!showMinExpDropdown)}>
                    <Text style={styles.dropdownButtonText}>{filters.minExperience || 'Select Min Experience'}</Text>
                    <Ionicons name={showMinExpDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {showMinExpDropdown && (
                    <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                      <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('minExperience','');setShowMinExpDropdown(false);}}>
                        <Text style={styles.dropdownItemText}>Clear Selection</Text>
                      </TouchableOpacity>
                      {experienceYears.map(exp => (
                        <TouchableOpacity key={exp} style={[styles.dropdownItem, filters.minExperience===exp && styles.dropdownItemSelected]} onPress={()=>{updateFilter('minExperience',exp);setShowMinExpDropdown(false);}}>
                          <Text style={[styles.dropdownItemText, filters.minExperience===exp && styles.dropdownItemTextSelected]}>{exp}</Text>
                          {filters.minExperience===exp && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
                <Text style={styles.rangeSeparator}>to</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Max Experience</Text>
                  <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowMaxExpDropdown(!showMaxExpDropdown)}>
                    <Text style={styles.dropdownButtonText}>{filters.maxExperience || 'Select Max Experience'}</Text>
                    <Ionicons name={showMaxExpDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {showMaxExpDropdown && (
                    <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                      <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('maxExperience','');setShowMaxExpDropdown(false);}}>
                        <Text style={styles.dropdownItemText}>Clear Selection</Text>
                      </TouchableOpacity>
                      {experienceYears.map(exp => (
                        <TouchableOpacity key={exp} style={[styles.dropdownItem, filters.maxExperience===exp && styles.dropdownItemSelected]} onPress={()=>{updateFilter('maxExperience',exp);setShowMaxExpDropdown(false);}}>
                          <Text style={[styles.dropdownItemText, filters.maxExperience===exp && styles.dropdownItemTextSelected]}>{exp}</Text>
                          {filters.maxExperience===exp && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              {/* Location */}
              <Text style={styles.sectionLabel}>Location</Text>
              <TextInput style={styles.input} placeholder="Current City/Region of Candidate (Type or Select Up to 10 Locations)" value={filters.currentCity.join(', ')} onChangeText={(t)=>updateFilter('currentCity', t.split(',').map(s=>s.trim()).filter(Boolean).slice(0, 10))} />
              <TextInput style={styles.input} placeholder="Job Locality Pincode (Optional) - Type or Select Up to 10 Pincodes" value={filters.jobLocalityPincode.join(', ')} onChangeText={(t)=>updateFilter('jobLocalityPincode', t.split(',').map(s=>s.trim()).filter(Boolean).slice(0, 10))} />
              <TouchableOpacity style={styles.checkboxRow} onPress={()=>updateFilter('includeWillingToRelocate', !filters.includeWillingToRelocate)}>
                <Ionicons name={filters.includeWillingToRelocate?'checkbox':'square-outline'} size={22} color={colors.primary} /><Text style={styles.checkboxLabel}>Include Willing To Relocate Candidates</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.checkboxRow} onPress={()=>updateFilter('excludeAnywhereInIndia', !filters.excludeAnywhereInIndia)}>
                <Ionicons name={filters.excludeAnywhereInIndia?'checkbox':'square-outline'} size={22} color={colors.primary} /><Text style={styles.checkboxLabel}>Exclude candidates who have mentioned Anywhere in India</Text>
              </TouchableOpacity>

              {/* Salary */}
              <Text style={styles.sectionLabel}>Salary</Text>
              <View style={styles.rangeRowInputs}>
                <TextInput style={[styles.input,{flex:1}]} placeholder="Min Salary (Lacs)" keyboardType="numeric" value={filters.minSalary} onChangeText={(t)=>updateFilter('minSalary',t)} />
                <Text style={styles.rangeSeparator}>to</Text>
                <TextInput style={[styles.input,{flex:1}]} placeholder="Max Salary (Lacs)" keyboardType="numeric" value={filters.maxSalary} onChangeText={(t)=>updateFilter('maxSalary',t)} />
              </View>
              <TouchableOpacity style={styles.checkboxRow} onPress={()=>updateFilter('includeNoSalaryCandidates', !filters.includeNoSalaryCandidates)}>
                <Ionicons name={filters.includeNoSalaryCandidates?'checkbox':'square-outline'} size={22} color={colors.primary} /><Text style={styles.checkboxLabel}>Include candidates with no salary mentioned</Text>
              </TouchableOpacity>

              {/* Professional Details */}
              <Text style={styles.sectionLabel}>Professional Details</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Job Title/Designation (Max 5)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowJobTitleDropdown(!showJobTitleDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.currentJobTitle.length>0?`${filters.currentJobTitle.length} selected`:'Select Job Titles'}</Text>
                  <Ionicons name={showJobTitleDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.currentJobTitle.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.currentJobTitle.map((title, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{title}</Text><TouchableOpacity onPress={()=>{updateFilter('currentJobTitle', filters.currentJobTitle.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showJobTitleDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('currentJobTitle', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {jobTitleOptions.map(option=>{
                      const isSelected = filters.currentJobTitle.includes(option.label);
                      const isDisabled = !isSelected && filters.currentJobTitle.length>=5;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.currentJobTitle.filter(t=>t!==option.label): [...filters.currentJobTitle, option.label]; updateFilter('currentJobTitle', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Company Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company Type</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowCompanyTypeDropdown(!showCompanyTypeDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.currentCompanyType || 'Select Company Type'}</Text>
                  <Ionicons name={showCompanyTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showCompanyTypeDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('currentCompanyType','');setShowCompanyTypeDropdown(false);}}>
                      <Text style={styles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {companyTypeOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[styles.dropdownItem, filters.currentCompanyType===option.label && styles.dropdownItemSelected]} onPress={()=>{updateFilter('currentCompanyType', option.label);setShowCompanyTypeDropdown(false);}}>
                        <Text style={[styles.dropdownItemText, filters.currentCompanyType===option.label && styles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.currentCompanyType===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Notice Period */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notice Period/Availability to Join</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowNoticePeriodDropdown(!showNoticePeriodDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.noticePeriod || 'Select Notice Period'}</Text>
                  <Ionicons name={showNoticePeriodDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showNoticePeriodDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('noticePeriod','');setShowNoticePeriodDropdown(false);}}>
                      <Text style={styles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {joiningPeriodOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[styles.dropdownItem, filters.noticePeriod===option.label && styles.dropdownItemSelected]} onPress={()=>{updateFilter('noticePeriod', option.label);setShowNoticePeriodDropdown(false);}}>
                        <Text style={[styles.dropdownItemText, filters.noticePeriod===option.label && styles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.noticePeriod===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Industry/Sectors */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Industry / Sectors (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowIndustryDropdown(!showIndustryDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.industrySectors.length>0?`${filters.industrySectors.length} selected`:'Select Industries'}</Text>
                  <Ionicons name={showIndustryDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.industrySectors.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.industrySectors.map((industry, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{industry}</Text><TouchableOpacity onPress={()=>{updateFilter('industrySectors', filters.industrySectors.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showIndustryDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('industrySectors', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {industryOptions.map(option=>{
                      const isSelected = filters.industrySectors.includes(option.label);
                      const isDisabled = !isSelected && filters.industrySectors.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.industrySectors.filter(i=>i!==option.label): [...filters.industrySectors, option.label]; updateFilter('industrySectors', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Sub-Industries - Only show when industries are selected */}
              {filters.industrySectors.length > 0 && subIndustriesOptions.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sub-Industries (Upto 10 Multiple Selection)</Text>
                  <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowSubIndustryDropdown(!showSubIndustryDropdown)}>
                    <Text style={styles.dropdownButtonText}>{filters.subIndustries.length>0?`${filters.subIndustries.length} selected`:'Select Sub-Industries'}</Text>
                    <Ionicons name={showSubIndustryDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {filters.subIndustries.length>0 && (
                    <View style={styles.selectedItemsContainer}>
                      {filters.subIndustries.map((subIndustry, idx)=> (
                        <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{subIndustry}</Text><TouchableOpacity onPress={()=>{updateFilter('subIndustries', filters.subIndustries.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                      ))}
                    </View>
                  )}
                  {showSubIndustryDropdown && (
                    <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                      <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('subIndustries', []);}}>
                        <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                      </TouchableOpacity>
                      {subIndustriesOptions.map(option=>{
                        const isSelected = filters.subIndustries.includes(option.label);
                        const isDisabled = !isSelected && filters.subIndustries.length>=10;
                        return (
                          <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.subIndustries.filter(si=>si!==option.label): [...filters.subIndustries, option.label]; updateFilter('subIndustries', next); }} disabled={isDisabled}>
                            <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                            {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              )}
              
              {/* Department Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department Category (Upto 5 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowDepartmentDropdown(!showDepartmentDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.departmentCategory.length>0?`${filters.departmentCategory.length} selected`:'Select Departments'}</Text>
                  <Ionicons name={showDepartmentDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.departmentCategory.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.departmentCategory.map((dept, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{dept}</Text><TouchableOpacity onPress={()=>{updateFilter('departmentCategory', filters.departmentCategory.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showDepartmentDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('departmentCategory', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {departmentOptions.map(option=>{
                      const isSelected = filters.departmentCategory.includes(option.label);
                      const isDisabled = !isSelected && filters.departmentCategory.length>=5;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.departmentCategory.filter(d=>d!==option.label): [...filters.departmentCategory, option.label]; updateFilter('departmentCategory', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Sub-Departments - Only show when departments are selected */}
              {filters.departmentCategory.length > 0 && subDepartmentsOptions.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sub-Departments (Upto 5 Multiple Selection)</Text>
                  <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowSubDepartmentDropdown(!showSubDepartmentDropdown)}>
                    <Text style={styles.dropdownButtonText}>{filters.subDepartments.length>0?`${filters.subDepartments.length} selected`:'Select Sub-Departments'}</Text>
                    <Ionicons name={showSubDepartmentDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {filters.subDepartments.length>0 && (
                    <View style={styles.selectedItemsContainer}>
                      {filters.subDepartments.map((subDept, idx)=> (
                        <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{subDept}</Text><TouchableOpacity onPress={()=>{updateFilter('subDepartments', filters.subDepartments.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                      ))}
                    </View>
                  )}
                  {showSubDepartmentDropdown && (
                    <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                      <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('subDepartments', []);}}>
                        <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                      </TouchableOpacity>
                      {subDepartmentsOptions.map(option=>{
                        const isSelected = filters.subDepartments.includes(option.label);
                        const isDisabled = !isSelected && filters.subDepartments.length>=5;
                        return (
                          <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.subDepartments.filter(sd=>sd!==option.label): [...filters.subDepartments, option.label]; updateFilter('subDepartments', next); }} disabled={isDisabled}>
                            <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                            {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              )}
              
              {/* Job Roles */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Job Roles (Show 10 to 12 Suggestion Also) - Upto 5 Multiple Selection</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowJobRolesDropdown(!showJobRolesDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.jobRoles.length>0?`${filters.jobRoles.length} selected`:'Select Job Roles'}</Text>
                  <Ionicons name={showJobRolesDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.jobRoles.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.jobRoles.map((role, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{role}</Text><TouchableOpacity onPress={()=>{updateFilter('jobRoles', filters.jobRoles.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showJobRolesDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('jobRoles', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {jobRolesOptions.slice(0, 12).map(option=>{
                      const isSelected = filters.jobRoles.includes(option.label);
                      const isDisabled = !isSelected && filters.jobRoles.length>=5;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.jobRoles.filter(r=>r!==option.label): [...filters.jobRoles, option.label]; updateFilter('jobRoles', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Search in Company Name */}
              <TextInput style={styles.input} placeholder="Search in Company Name (Type/Add New or Select Existing Keywords With 10 Multiple Selection)" value={searchInCompanyName} onChangeText={setSearchInCompanyName} />
              
              {/* Search in Company Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Search in Company Type (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowSearchInCompanyTypeDropdown(!showSearchInCompanyTypeDropdown)}>
                  <Text style={styles.dropdownButtonText}>{searchInCompanyType.length>0?`${searchInCompanyType.length} selected`:'Select Company Types'}</Text>
                  <Ionicons name={showSearchInCompanyTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {searchInCompanyType.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {searchInCompanyType.map((type, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{setSearchInCompanyType(searchInCompanyType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showSearchInCompanyTypeDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{setSearchInCompanyType([]);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {companyTypeOptions.map(option=>{
                      const isSelected = searchInCompanyType.includes(option.label);
                      const isDisabled = !isSelected && searchInCompanyType.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? searchInCompanyType.filter(t=>t!==option.label): [...searchInCompanyType, option.label]; setSearchInCompanyType(next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Demographics */}
              <Text style={styles.sectionLabel}>Demographics</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowGenderDropdown(!showGenderDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.gender[0] || 'Select Gender'}</Text>
                  <Ionicons name={showGenderDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showGenderDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('gender', []);setShowGenderDropdown(false);}}>
                      <Text style={styles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {genderOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[styles.dropdownItem, filters.gender[0]===option.label && styles.dropdownItemSelected]} onPress={()=>{updateFilter('gender', [option.label]);setShowGenderDropdown(false);}}>
                        <Text style={[styles.dropdownItemText, filters.gender[0]===option.label && styles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.gender[0]===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.rangeRowInputs}>
                <TextInput style={[styles.input,{flex:1}]} placeholder="Min Age" keyboardType="numeric" value={filters.minAge} onChangeText={(t)=>updateFilter('minAge',t)} />
                <Text style={styles.rangeSeparator}>to</Text>
                <TextInput style={[styles.input,{flex:1}]} placeholder="Max Age" keyboardType="numeric" value={filters.maxAge} onChangeText={(t)=>updateFilter('maxAge',t)} />
              </View>

              {/* Job Preferences */}
              <Text style={styles.sectionLabel}>Job Preferences</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Mode</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowJobModeDropdown(!showJobModeDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.jobModeType[0] || 'Select Job Mode'}</Text>
                  <Ionicons name={showJobModeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showJobModeDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('jobModeType', []);setShowJobModeDropdown(false);}}>
                      <Text style={styles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {jobModeOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[styles.dropdownItem, filters.jobModeType[0]===option.label && styles.dropdownItemSelected]} onPress={()=>{updateFilter('jobModeType', [option.label]);setShowJobModeDropdown(false);}}>
                        <Text style={[styles.dropdownItemText, filters.jobModeType[0]===option.label && styles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.jobModeType[0]===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Shift</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowJobShiftDropdown(!showJobShiftDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.jobShiftType[0] || 'Select Job Shift'}</Text>
                  <Ionicons name={showJobShiftDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showJobShiftDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('jobShiftType', []);setShowJobShiftDropdown(false);}}>
                      <Text style={styles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {jobShiftOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[styles.dropdownItem, filters.jobShiftType[0]===option.label && styles.dropdownItemSelected]} onPress={()=>{updateFilter('jobShiftType', [option.label]);setShowJobShiftDropdown(false);}}>
                        <Text style={[styles.dropdownItemText, filters.jobShiftType[0]===option.label && styles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.jobShiftType[0]===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>English Fluency</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowEnglishFluencyDropdown(!showEnglishFluencyDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.englishFluencyLevel[0] || 'Select English Fluency'}</Text>
                  <Ionicons name={showEnglishFluencyDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showEnglishFluencyDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('englishFluencyLevel', []);setShowEnglishFluencyDropdown(false);}}>
                      <Text style={styles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {englishFluencyLevels.map(level => (
                      <TouchableOpacity key={level} style={[styles.dropdownItem, filters.englishFluencyLevel[0]===level && styles.dropdownItemSelected]} onPress={()=>{updateFilter('englishFluencyLevel', [level]);setShowEnglishFluencyDropdown(false);}}>
                        <Text style={[styles.dropdownItemText, filters.englishFluencyLevel[0]===level && styles.dropdownItemTextSelected]}>{level}</Text>
                        {filters.englishFluencyLevel[0]===level && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Preferred Language */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Language (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowPreferredLanguageDropdown(!showPreferredLanguageDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.preferredLanguage.length>0?`${filters.preferredLanguage.length} selected`:'Select Languages'}</Text>
                  <Ionicons name={showPreferredLanguageDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.preferredLanguage.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.preferredLanguage.map((lang, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{lang}</Text><TouchableOpacity onPress={()=>{updateFilter('preferredLanguage', filters.preferredLanguage.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showPreferredLanguageDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('preferredLanguage', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {languageOptions.map(option=>{
                      const isSelected = filters.preferredLanguage.includes(option.label);
                      const isDisabled = !isSelected && filters.preferredLanguage.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.preferredLanguage.filter(l=>l!==option.label): [...filters.preferredLanguage, option.label]; updateFilter('preferredLanguage', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Asset Requirements */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Asset Requirements/Availability (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowAssetRequirementsDropdown(!showAssetRequirementsDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.assetRequirements.length>0?`${filters.assetRequirements.length} selected`:'Select Assets'}</Text>
                  <Ionicons name={showAssetRequirementsDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.assetRequirements.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.assetRequirements.map((asset, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{asset}</Text><TouchableOpacity onPress={()=>{updateFilter('assetRequirements', filters.assetRequirements.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showAssetRequirementsDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('assetRequirements', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {assetRequirementsOptions.map(option=>{
                      const isSelected = filters.assetRequirements.includes(option.label);
                      const isDisabled = !isSelected && filters.assetRequirements.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.assetRequirements.filter(a=>a!==option.label): [...filters.assetRequirements, option.label]; updateFilter('assetRequirements', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Education Section */}
              <Text style={styles.sectionLabel}>Education</Text>
              
              {/* Level of Education */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Level of Education (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowEducationLevelDropdown(!showEducationLevelDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.educationLevel.length>0?`${filters.educationLevel.length} selected`:'Select Education Level'}</Text>
                  <Ionicons name={showEducationLevelDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.educationLevel.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.educationLevel.map((level, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{level}</Text><TouchableOpacity onPress={()=>{updateFilter('educationLevel', filters.educationLevel.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showEducationLevelDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('educationLevel', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {educationLevelOptions.map(option=>{
                      const isSelected = filters.educationLevel.includes(option.label);
                      const isDisabled = !isSelected && filters.educationLevel.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.educationLevel.filter(l=>l!==option.label): [...filters.educationLevel, option.label]; updateFilter('educationLevel', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Degree/Course */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Degree/Course (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowDegreeCourseDropdown(!showDegreeCourseDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.degreeCourse.length>0?`${filters.degreeCourse.length} selected`:'Select Degree/Course'}</Text>
                  <Ionicons name={showDegreeCourseDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.degreeCourse.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.degreeCourse.map((course, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{course}</Text><TouchableOpacity onPress={()=>{updateFilter('degreeCourse', filters.degreeCourse.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showDegreeCourseDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('degreeCourse', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {getCoursesForEducationLevel(filters.educationLevel).map(option=>{
                      const isSelected = filters.degreeCourse.includes(option.label);
                      const isDisabled = !isSelected && filters.degreeCourse.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.degreeCourse.filter(c=>c!==option.label): [...filters.degreeCourse, option.label]; updateFilter('degreeCourse', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Specialisation */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Specialisation (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowSpecialisationDropdown(!showSpecialisationDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.specialisation.length>0?`${filters.specialisation.length} selected`:'Select Specialisation'}</Text>
                  <Ionicons name={showSpecialisationDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.specialisation.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.specialisation.map((spec, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{spec}</Text><TouchableOpacity onPress={()=>{updateFilter('specialisation', filters.specialisation.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showSpecialisationDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('specialisation', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {getSpecializationsForCourse(filters.degreeCourse).map(option=>{
                      const isSelected = filters.specialisation.includes(option.label);
                      const isDisabled = !isSelected && filters.specialisation.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.specialisation.filter(s=>s!==option.label): [...filters.specialisation, option.label]; updateFilter('specialisation', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Institution/College Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Institution/College Name (Type or Select Existing Suggestion)</Text>
                <TextInput 
                  style={styles.input} 
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
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    {institutionSuggestions.map(inst => (
                      <TouchableOpacity 
                        key={inst.value} 
                        style={styles.dropdownItem}
                        onPress={() => {
                          if (!filters.institutionNames.includes(inst.label)) {
                            updateFilter('institutionNames', [...filters.institutionNames, inst.label]);
                          }
                          setInstitutionSuggestions([]);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{inst.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                {filters.institutionNames.length > 0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.institutionNames.map((name, idx) => (
                      <View key={idx} style={styles.selectedItem}>
                        <Text style={styles.selectedItemText}>{name}</Text>
                        <TouchableOpacity onPress={() => {updateFilter('institutionNames', filters.institutionNames.filter((_, i) => i !== idx));}}>
                          <Ionicons name="close-circle" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Education Status */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Education Status (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowEducationStatusDropdown(!showEducationStatusDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.educationStatus.length>0?`${filters.educationStatus.length} selected`:'Select Education Status'}</Text>
                  <Ionicons name={showEducationStatusDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.educationStatus.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.educationStatus.map((status, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{status}</Text><TouchableOpacity onPress={()=>{updateFilter('educationStatus', filters.educationStatus.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showEducationStatusDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('educationStatus', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {educationStatusOptions.map(option=>{
                      const isSelected = filters.educationStatus.includes(option.label);
                      const isDisabled = !isSelected && filters.educationStatus.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.educationStatus.filter(s=>s!==option.label): [...filters.educationStatus, option.label]; updateFilter('educationStatus', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Education Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Education Type (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowEducationTypeDropdown(!showEducationTypeDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.educationType.length>0?`${filters.educationType.length} selected`:'Select Education Type'}</Text>
                  <Ionicons name={showEducationTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.educationType.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.educationType.map((type, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{updateFilter('educationType', filters.educationType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showEducationTypeDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('educationType', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {educationTypeOptions.map(option=>{
                      const isSelected = filters.educationType.includes(option.label);
                      const isDisabled = !isSelected && filters.educationType.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.educationType.filter(t=>t!==option.label): [...filters.educationType, option.label]; updateFilter('educationType', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Education Medium */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Education Medium (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowEducationMediumDropdown(!showEducationMediumDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.educationMedium.length>0?`${filters.educationMedium.length} selected`:'Select Education Medium'}</Text>
                  <Ionicons name={showEducationMediumDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.educationMedium.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.educationMedium.map((medium, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{medium}</Text><TouchableOpacity onPress={()=>{updateFilter('educationMedium', filters.educationMedium.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showEducationMediumDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('educationMedium', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {educationMediumOptions.map(option=>{
                      const isSelected = filters.educationMedium.includes(option.label);
                      const isDisabled = !isSelected && filters.educationMedium.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.educationMedium.filter(m=>m!==option.label): [...filters.educationMedium, option.label]; updateFilter('educationMedium', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Marks Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Marks Type (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowMarksTypeDropdown(!showMarksTypeDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.marksType.length>0?`${filters.marksType.length} selected`:'Select Marks Type'}</Text>
                  <Ionicons name={showMarksTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.marksType.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.marksType.map((type, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{updateFilter('marksType', filters.marksType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showMarksTypeDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('marksType', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {marksTypeOptions.map(option=>{
                      const isSelected = filters.marksType.includes(option.label);
                      const isDisabled = !isSelected && filters.marksType.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.marksType.filter(t=>t!==option.label): [...filters.marksType, option.label]; updateFilter('marksType', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Marks Percentage/Grade */}
              <TextInput style={styles.input} placeholder="Marks Percentage/Grade (e.g., 0% to 100%, A,B,C,D,E,F, 0 to 10 CGPA)" value={filters.marksPercentage} onChangeText={(t)=>updateFilter('marksPercentage',t)} />
              
              {/* Extra Certification Course Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Extra Certification Course Name (Show 5 to 10 Suggestion Also) - Upto 5 Multiple Selection</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowCertificationDropdown(!showCertificationDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.certificationCourses.length>0?`${filters.certificationCourses.length} selected`:'Select Certifications'}</Text>
                  <Ionicons name={showCertificationDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.certificationCourses.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.certificationCourses.map((cert, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{cert}</Text><TouchableOpacity onPress={()=>{updateFilter('certificationCourses', filters.certificationCourses.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showCertificationDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('certificationCourses', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {keySkillsOptions.slice(0, 10).map(option=>{
                      const isSelected = filters.certificationCourses.includes(option.label);
                      const isDisabled = !isSelected && filters.certificationCourses.length>=5;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.certificationCourses.filter(c=>c!==option.label): [...filters.certificationCourses, option.label]; updateFilter('certificationCourses', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Demographics - Additional Fields */}
              {/* Disability Status */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Disability Status</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowDisabilityStatusDropdown(!showDisabilityStatusDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.disabilityStatus[0] || 'Select Disability Status'}</Text>
                  <Ionicons name={showDisabilityStatusDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showDisabilityStatusDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('disabilityStatus', []);setShowDisabilityStatusDropdown(false);}}>
                      <Text style={styles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {disabilityStatusOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[styles.dropdownItem, filters.disabilityStatus[0]===option.label && styles.dropdownItemSelected]} onPress={()=>{updateFilter('disabilityStatus', [option.label]);setShowDisabilityStatusDropdown(false);}}>
                        <Text style={[styles.dropdownItemText, filters.disabilityStatus[0]===option.label && styles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.disabilityStatus[0]===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Any Disabilities/Differently-abled */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Any Disabilities/Differently-abled (Upto 5 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowAnyDisabilitiesDropdown(!showAnyDisabilitiesDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.anyDisabilities.length>0?`${filters.anyDisabilities.length} selected`:'Select Disabilities'}</Text>
                  <Ionicons name={showAnyDisabilitiesDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.anyDisabilities.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.anyDisabilities.map((disability, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{disability}</Text><TouchableOpacity onPress={()=>{updateFilter('anyDisabilities', filters.anyDisabilities.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showAnyDisabilitiesDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('anyDisabilities', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {disabilityTypeOptions.map(option=>{
                      const isSelected = filters.anyDisabilities.includes(option.label);
                      const isDisabled = !isSelected && filters.anyDisabilities.length>=5;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.anyDisabilities.filter(d=>d!==option.label): [...filters.anyDisabilities, option.label]; updateFilter('anyDisabilities', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Diversity Hiring */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Diversity Hiring</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowDiversityHiringDropdown(!showDiversityHiringDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.diversityHiring[0] || 'Select Diversity Hiring'}</Text>
                  <Ionicons name={showDiversityHiringDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showDiversityHiringDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('diversityHiring', []);setShowDiversityHiringDropdown(false);}}>
                      <Text style={styles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {diversityHiringOptions.map(option => (
                      <TouchableOpacity key={option.value} style={[styles.dropdownItem, filters.diversityHiring[0]===option.label && styles.dropdownItemSelected]} onPress={()=>{updateFilter('diversityHiring', [option.label]);setShowDiversityHiringDropdown(false);}}>
                        <Text style={[styles.dropdownItemText, filters.diversityHiring[0]===option.label && styles.dropdownItemTextSelected]}>{option.label}</Text>
                        {filters.diversityHiring[0]===option.label && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowCategoryDropdown(!showCategoryDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.category.length>0?`${filters.category.length} selected`:'Select Category'}</Text>
                  <Ionicons name={showCategoryDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.category.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.category.map((cat, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{cat}</Text><TouchableOpacity onPress={()=>{updateFilter('category', filters.category.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showCategoryDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('category', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {categoryOptions.map(option=>{
                      const isSelected = filters.category.includes(option.label);
                      const isDisabled = !isSelected && filters.category.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.category.filter(c=>c!==option.label): [...filters.category, option.label]; updateFilter('category', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Employment Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Employment Type (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowEmploymentTypeDropdown(!showEmploymentTypeDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.employmentType.length>0?`${filters.employmentType.length} selected`:'Select Employment Type'}</Text>
                  <Ionicons name={showEmploymentTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.employmentType.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.employmentType.map((type, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{updateFilter('employmentType', filters.employmentType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showEmploymentTypeDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('employmentType', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {employmentTypeOptions.map(option=>{
                      const isSelected = filters.employmentType.includes(option.label);
                      const isDisabled = !isSelected && filters.employmentType.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.employmentType.filter(t=>t!==option.label): [...filters.employmentType, option.label]; updateFilter('employmentType', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Job Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Type (Upto 3 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowJobTypeDropdown(!showJobTypeDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.jobType.length>0?`${filters.jobType.length} selected`:'Select Job Type'}</Text>
                  <Ionicons name={showJobTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.jobType.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.jobType.map((type, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{updateFilter('jobType', filters.jobType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showJobTypeDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('jobType', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {jobTypeOptions.map(option=>{
                      const isSelected = filters.jobType.includes(option.label);
                      const isDisabled = !isSelected && filters.jobType.length>=3;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.jobType.filter(t=>t!==option.label): [...filters.jobType, option.label]; updateFilter('jobType', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Candidate Status */}
              <Text style={styles.sectionLabel}>Candidate Status</Text>
              
              {/* Candidates Show Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Candidates Show Type (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowCandidatesShowTypeDropdown(!showCandidatesShowTypeDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.candidatesShowType.length>0?`${filters.candidatesShowType.length} selected`:'Select Show Type'}</Text>
                  <Ionicons name={showCandidatesShowTypeDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.candidatesShowType.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.candidatesShowType.map((type, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{type}</Text><TouchableOpacity onPress={()=>{updateFilter('candidatesShowType', filters.candidatesShowType.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showCandidatesShowTypeDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('candidatesShowType', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {candidatesShowTypeOptions.map(option=>{
                      const isSelected = filters.candidatesShowType.includes(option.label);
                      const isDisabled = !isSelected && filters.candidatesShowType.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.candidatesShowType.filter(t=>t!==option.label): [...filters.candidatesShowType, option.label]; updateFilter('candidatesShowType', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Show Candidates with */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Show Candidates with (Upto 10 Multiple Selection)</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowShowCandidatesWithDropdown(!showShowCandidatesWithDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.showCandidatesWith.length>0?`${filters.showCandidatesWith.length} selected`:'Select Options'}</Text>
                  <Ionicons name={showShowCandidatesWithDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {filters.showCandidatesWith.length>0 && (
                  <View style={styles.selectedItemsContainer}>
                    {filters.showCandidatesWith.map((option, idx)=> (
                      <View key={idx} style={styles.selectedItem}><Text style={styles.selectedItemText}>{option}</Text><TouchableOpacity onPress={()=>{updateFilter('showCandidatesWith', filters.showCandidatesWith.filter((_,i)=>i!==idx));}}><Ionicons name="close-circle" size={18} color={colors.error} /></TouchableOpacity></View>
                    ))}
                  </View>
                )}
                {showShowCandidatesWithDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    <TouchableOpacity style={[styles.dropdownItem, styles.dropdownClearItem]} onPress={()=>{updateFilter('showCandidatesWith', []);}}>
                      <Text style={[styles.dropdownItemText, styles.dropdownClearItemText]}>Clear All</Text>
                    </TouchableOpacity>
                    {showCandidatesWithOptions.map(option=>{
                      const isSelected = filters.showCandidatesWith.includes(option.label);
                      const isDisabled = !isSelected && filters.showCandidatesWith.length>=10;
                      return (
                        <TouchableOpacity key={option.value} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, isDisabled && styles.dropdownItemDisabled]} onPress={()=>{ if(isDisabled) return; const next = isSelected? filters.showCandidatesWith.filter(o=>o!==option.label): [...filters.showCandidatesWith, option.label]; updateFilter('showCandidatesWith', next); }} disabled={isDisabled}>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected, isDisabled && styles.dropdownItemTextDisabled]}>{option.label}</Text>
                          {isSelected && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Active</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={()=>setShowLastActiveDropdown(!showLastActiveDropdown)}>
                  <Text style={styles.dropdownButtonText}>{filters.lastActiveCandidates || 'Select Last Active Period'}</Text>
                  <Ionicons name={showLastActiveDropdown?'chevron-up':'chevron-down'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showLastActiveDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('lastActiveCandidates','');setShowLastActiveDropdown(false);}}>
                      <Text style={styles.dropdownItemText}>Clear Selection</Text>
                    </TouchableOpacity>
                    {lastActiveOptions.map(option => (
                      <TouchableOpacity key={option} style={[styles.dropdownItem, filters.lastActiveCandidates===option && styles.dropdownItemSelected]} onPress={()=>{updateFilter('lastActiveCandidates', option);setShowLastActiveDropdown(false);}}>
                        <Text style={[styles.dropdownItemText, filters.lastActiveCandidates===option && styles.dropdownItemTextSelected]}>{option}</Text>
                        {filters.lastActiveCandidates===option && (<Ionicons name="checkmark" size={18} color={colors.primary} />)}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Exclude Keywords */}
              <TextInput style={styles.input} placeholder="Exclude Keywords (Add Excluded Keywords)" value={filters.excludeKeywords} onChangeText={(t)=>updateFilter('excludeKeywords',t)} />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}><Text style={styles.clearButtonText}>Clear All</Text></TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={()=>{setShowFiltersModal(false);handleSearch(1);}}><Text style={styles.applyButtonText}>Apply Filters</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, flexDirection: 'row', backgroundColor: '#F1F5F9' },
  sidebar: { width: 280, backgroundColor: colors.sidebarBackground },
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
  content: { flex: 1 },
  contentMobile: {
    paddingTop: spacing.xl + 40,
  },
  headerBar: { 
    padding: spacing.xl, 
    ...shadows.md,
  },
  headerBarMobile: {
    padding: spacing.md,
    paddingTop: spacing.xl + 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerLeftMobile: {
    gap: spacing.sm,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainerMobile: {
    width: 48,
    height: 48,
  },
  headerTitle: { 
    fontSize: 28,
    fontWeight: '800', 
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerTitleMobile: {
    fontSize: 22,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  headerSubtitleMobile: {
    fontSize: 12,
  },
  quickSearchContainer: { 
    padding: spacing.lg, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border, 
    backgroundColor: colors.cardBackground,
    ...shadows.xs
  },
  quickSearchContainerMobile: {
    padding: spacing.md,
  },
  searchRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.md 
  },
  searchRowMobile: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  searchInputWrap: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.sm, 
    backgroundColor: colors.white, 
    borderRadius: borderRadius.lg, 
    paddingHorizontal: spacing.lg, 
    paddingVertical: spacing.md, 
    borderWidth: 1.5, 
    borderColor: colors.border,
    ...shadows.sm
  },
  searchInput: { 
    flex: 1, 
    ...typography.body1, 
    color: colors.text,
    fontSize: 15
  },
  filtersButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.xs, 
    backgroundColor: colors.secondary, 
    paddingHorizontal: spacing.lg, 
    paddingVertical: spacing.md, 
    borderRadius: borderRadius.lg,
    ...shadows.md
  },
  filtersButtonText: { 
    ...typography.button, 
    color: colors.white, 
    fontWeight: '600',
    fontSize: 15
  },
  searchButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.xs, 
    backgroundColor: colors.primary, 
    paddingHorizontal: spacing.lg, 
    paddingVertical: spacing.md, 
    borderRadius: borderRadius.lg,
    ...shadows.md
  },
  searchButtonText: { 
    ...typography.button, 
    color: colors.white, 
    fontWeight: '600',
    fontSize: 15
  },
  statsRow: { 
    flexDirection: 'row', 
    gap: spacing.md, 
    padding: spacing.lg,
    paddingTop: spacing.xl
  },
  statCard: { 
    flex: 1, 
    backgroundColor: colors.cardBackground, 
    borderRadius: borderRadius.lg, 
    padding: spacing.lg, 
    alignItems: 'center', 
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  statValue: { 
    ...typography.h4, 
    color: colors.primary, 
    fontWeight: '700',
    fontSize: 22,
    marginBottom: spacing.xs
  },
  statLabel: { 
    ...typography.caption, 
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  resultsCount: { 
    ...typography.body1, 
    color: colors.text, 
    fontWeight: '600',
    fontSize: 15,
    marginBottom: spacing.sm
  },
  candidateCard: { 
    backgroundColor: colors.cardBackground, 
    borderRadius: borderRadius.lg, 
    padding: spacing.lg, 
    marginBottom: spacing.md, 
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  candidateHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: spacing.md,
    alignItems: 'flex-start'
  },
  candidateName: { 
    ...typography.h5, 
    color: colors.text, 
    fontWeight: '700',
    fontSize: 18,
    marginBottom: spacing.xs
  },
  candidateRole: { 
    ...typography.body2, 
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xs
  },
  candidateCompany: { 
    ...typography.body2, 
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'
  },
  matchScoreContainer: { 
    backgroundColor: colors.primaryLight, 
    borderRadius: borderRadius.lg, 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '20',
    minWidth: 70
  },
  matchScoreLabel: { 
    ...typography.caption, 
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: 2
  },
  matchScore: { 
    ...typography.h5, 
    color: colors.primary, 
    fontWeight: '700',
    fontSize: 18
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.sm, 
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs
  },
  detailText: { 
    ...typography.body2, 
    color: colors.textSecondary,
    fontSize: 14
  },
  skillsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: spacing.sm, 
    marginTop: spacing.md
  },
  skillTag: { 
    backgroundColor: colors.primaryLight, 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.xs + 2, 
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '20'
  },
  skillText: { 
    ...typography.caption, 
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600'
  },
  loadingContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: spacing.xl 
  },
  loadingText: { 
    ...typography.body1, 
    color: colors.textSecondary, 
    marginTop: spacing.md,
    fontSize: 15
  },
  emptyContainer: { 
    alignItems: 'center', 
    padding: spacing.xl,
    paddingTop: spacing.xxl
  },
  emptyText: { 
    ...typography.body1, 
    color: colors.textSecondary, 
    marginTop: spacing.md, 
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22
  },
  emptyButton: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: spacing.xl, 
    paddingVertical: spacing.md, 
    borderRadius: borderRadius.lg, 
    marginTop: spacing.lg,
    ...shadows.md
  },
  emptyButtonText: { 
    ...typography.button, 
    color: colors.white, 
    fontWeight: '600',
    fontSize: 15
  },
  modalContainer: { 
    flex: 1, 
    backgroundColor: '#F8FAFC'
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: spacing.lg, 
    borderBottomWidth: 1.5, 
    borderBottomColor: colors.border, 
    backgroundColor: colors.cardBackground,
    ...shadows.sm
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  modalTitle: { 
    ...typography.h5, 
    color: colors.text, 
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: -0.2
  },
  modalContent: { 
    flex: 1, 
    padding: spacing.lg,
    paddingTop: spacing.md
  },
  input: { 
    backgroundColor: colors.white, 
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: borderRadius.md, 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm + 2, 
    ...typography.body1, 
    color: colors.text, 
    marginBottom: spacing.md,
    fontSize: 14,
    ...shadows.sm,
    ...(Platform.OS === 'web' ? {} : {
      shadowOpacity: 0.03
    })
  },
  modalFooter: { 
    flexDirection: 'row', 
    padding: spacing.lg, 
    borderTopWidth: 1.5, 
    borderTopColor: colors.border, 
    gap: spacing.md, 
    backgroundColor: colors.cardBackground,
    ...shadows.sm
  },
  clearButton: { 
    flex: 1, 
    backgroundColor: colors.white, 
    paddingVertical: spacing.sm + 4, 
    borderRadius: borderRadius.md, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs
  },
  clearButtonText: { 
    ...typography.button, 
    color: colors.textSecondary, 
    fontWeight: '500',
    fontSize: 14
  },
  applyButton: { 
    flex: 1, 
    backgroundColor: colors.primary, 
    paddingVertical: spacing.sm + 4, 
    borderRadius: borderRadius.md, 
    alignItems: 'center',
    ...shadows.sm
  },
  applyButtonText: { 
    ...typography.button, 
    color: colors.white, 
    fontWeight: '500',
    fontSize: 14
  },
  sectionLabel: { 
    ...typography.body1, 
    color: colors.text, 
    fontWeight: '500', 
    marginTop: spacing.lg, 
    marginBottom: spacing.sm,
    fontSize: 15,
    letterSpacing: 0,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  inputGroup: { 
    marginBottom: spacing.md
  },
  inputLabel: { 
    ...typography.caption, 
    color: colors.textSecondary, 
    marginBottom: spacing.xs, 
    fontWeight: '500',
    fontSize: 12,
    letterSpacing: 0
  },
  dropdownButton: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: colors.white, 
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: borderRadius.md, 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm + 2, 
    ...shadows.sm,
    minHeight: 40,
    ...(Platform.OS === 'web' ? {} : {
      shadowOpacity: 0.03,
    })
  },
  dropdownButtonText: { 
    ...typography.body1, 
    color: colors.text,
    fontSize: 14,
    flex: 1
  },
  dropdownList: { 
    backgroundColor: colors.white, 
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: borderRadius.md, 
    marginTop: spacing.xs, 
    maxHeight: 280, 
    ...shadows.md,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    } : {
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    })
  },
  dropdownItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm + 2, 
    borderBottomWidth: 0.5, 
    borderBottomColor: colors.borderLight,
    minHeight: 38
  },
  dropdownItemSelected: { 
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.md - 3
  },
  dropdownItemDisabled: { 
    opacity: 0.35, 
    backgroundColor: colors.background,
    borderLeftWidth: 0
  },
  dropdownItemText: { 
    ...typography.body1, 
    color: colors.text,
    fontSize: 14,
    flex: 1
  },
  dropdownItemTextSelected: { 
    color: colors.primary, 
    fontWeight: '600',
    fontSize: 14
  },
  dropdownItemTextDisabled: { 
    color: colors.textSecondary,
    fontSize: 13
  },
  dropdownClearItem: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs
  },
  dropdownClearItemText: {
    color: colors.error,
    fontWeight: '500',
    fontSize: 13
  },
  checkboxRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.sm, 
    marginBottom: spacing.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  checkboxLabel: { 
    ...typography.body2, 
    color: colors.text,
    fontSize: 13,
    fontWeight: '400'
  },
  rangeRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: spacing.md, 
    marginBottom: spacing.md
  },
  rangeRowInputs: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.md, 
    marginBottom: spacing.md
  },
  rangeSeparator: {
    ...typography.body1,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: spacing.md + 2,
    fontSize: 14
  },
  selectedItemsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: spacing.xs, 
    marginTop: spacing.sm,
    marginBottom: spacing.xs
  },
  selectedItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.primaryLight, 
    borderRadius: borderRadius.sm, 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs + 2, 
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    ...shadows.xs
  },
  selectedItemText: { 
    ...typography.caption, 
    color: colors.primary,
    fontSize: 11,
    fontWeight: '500'
  },
});

export default EmployerCandidateSearchScreen;


