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
import { 
  jobTitleOptions, 
  companyTypeOptions, 
  genderOptions,
  jobModeOptions,
  jobShiftOptions,
  joiningPeriodOptions
} from '../../data/jobPostFormConfig';

const AdminCandidateSearchScreen = ({ navigation }) => {
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
    departmentCategory: [],
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
  const [showNoticePeriodDropdown, setShowNoticePeriodDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showJobModeDropdown, setShowJobModeDropdown] = useState(false);
  const [showJobShiftDropdown, setShowJobShiftDropdown] = useState(false);
  const [showEnglishFluencyDropdown, setShowEnglishFluencyDropdown] = useState(false);
  const [showLastActiveDropdown, setShowLastActiveDropdown] = useState(false);

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
      currentJobTitle: '',
      excludeKeywords: '',
      industrySectors: [],
      departmentCategory: [],
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
      style={styles.candidateCard}
      onPress={() => viewCandidateDetails(candidate)}
    >
      <View style={styles.candidateHeader}>
        <View style={styles.candidateInfo}>
          <Text style={styles.candidateName}>{candidate.name}</Text>
          <Text style={styles.candidateRole}>{candidate.currentJobTitle || 'Not specified'}</Text>
          <Text style={styles.candidateCompany}>{candidate.currentCompany || 'Not specified'}</Text>
        </View>
        <View style={styles.matchScoreContainer}>
          <Text style={styles.matchScoreLabel}>Match</Text>
          <Text style={styles.matchScore}>{candidate.matchScore}%</Text>
        </View>
      </View>
      
      <View style={styles.candidateDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {candidate.totalExperience || 0} years experience
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{candidate.location || 'Not specified'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{candidate.availability || 'Not specified'}</Text>
        </View>
        
        {candidate.expectedSalary && (
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Expected: ₹{candidate.expectedSalary.toLocaleString()}
            </Text>
          </View>
        )}
      </View>
      
      {candidate.keySkills && candidate.keySkills.length > 0 && (
        <View style={styles.skillsContainer}>
          {candidate.keySkills.slice(0, 5).map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {candidate.keySkills.length > 5 && (
            <View style={styles.skillTag}>
              <Text style={styles.skillText}>+{candidate.keySkills.length - 5}</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.candidateFooter}>
        <View style={styles.statusBadges}>
          {candidate.hasResume && (
            <View style={styles.badge}>
              <Ionicons name="document-text" size={12} color="#28a745" />
              <Text style={styles.badgeText}>Resume</Text>
            </View>
          )}
          {candidate.emailVerified && (
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={12} color="#007bff" />
              <Text style={styles.badgeText}>Verified</Text>
            </View>
          )}
          {candidate.whatsappAvailable && (
            <View style={styles.badge}>
              <Ionicons name="logo-whatsapp" size={12} color="#25D366" />
              <Text style={styles.badgeText}>WhatsApp</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.profileCompletion}>
          {candidate.profileCompletion}% Complete
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render filter section
  const renderFilterSection = (title, children) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <AdminLayout title="Candidate Search (Fastdex/Freedex)" activeScreen="AdminCandidateSearch" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={styles.container}>
        {/* Quick Search Bar */}
        <View style={styles.quickSearchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.quickSearchInput}
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
          
          <View style={styles.searchButtons}>
            <TouchableOpacity
              style={styles.filtersButton}
              onPress={() => setShowFiltersModal(true)}
            >
              <Ionicons name="filter" size={20} color="#fff" />
              <Text style={styles.filtersButtonText}>Advanced Filters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => handleSearch(1)}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={styles.searchButtonText}>Search</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Stats */}
        {searchStats && Object.keys(searchStats).length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{searchStats.totalCandidates || 0}</Text>
              <Text style={styles.statLabel}>Total Candidates</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{searchStats.activeCandidates || 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{searchStats.verifiedCandidates || 0}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{searchStats.recentCandidates || 0}</Text>
              <Text style={styles.statLabel}>Recent (30d)</Text>
            </View>
          </View>
        )}

        {/* Results Header */}
        {candidates.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              Found {totalCandidates} candidates
            </Text>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearAllFilters}
            >
              <Ionicons name="close-circle" size={16} color="#dc3545" />
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Candidate Results */}
        <View style={styles.resultsContainer}>
          {searching && candidates.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Searching candidates...</Text>
            </View>
          ) : candidates.length > 0 ? (
            <>
              {candidates.map(renderCandidateCard)}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                    onPress={() => handleSearch(currentPage - 1)}
                    disabled={currentPage === 1 || searching}
                  >
                    <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? '#ccc' : '#007bff'} />
                  </TouchableOpacity>
                  
                  <Text style={styles.paginationText}>
                    Page {currentPage} of {totalPages}
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                    onPress={() => handleSearch(currentPage + 1)}
                    disabled={currentPage === totalPages || searching}
                  >
                    <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? '#ccc' : '#007bff'} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {searching ? 'Searching...' : 'No candidates found. Try adjusting your filters.'}
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => handleSearch(1)}
              >
                <Text style={styles.emptyButtonText}>Search All Candidates</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Advanced Filters Modal */}
        <Modal
          visible={showFiltersModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowFiltersModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Advanced Filters</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {/* Basic Information Filters */}
              {renderFilterSection('Basic Information', (
                <>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Current/Last Company Name"
                    value={filters.currentCompanyName}
                    onChangeText={(text) => updateFilter('currentCompanyName', text)}
                  />
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Experience Level</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowExperienceDropdown(!showExperienceDropdown)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {filters.experienceLevel || 'Select Experience Level'}
                      </Text>
                      <Ionicons 
                        name={showExperienceDropdown ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    {showExperienceDropdown && (
                      <View style={styles.dropdownList}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            updateFilter('experienceLevel', '');
                            setShowExperienceDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>Clear Selection</Text>
                        </TouchableOpacity>
                        {experienceLevels.map((level) => (
                          <TouchableOpacity
                            key={level}
                            style={[
                              styles.dropdownItem,
                              filters.experienceLevel === level && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              updateFilter('experienceLevel', level);
                              setShowExperienceDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              filters.experienceLevel === level && styles.dropdownItemTextSelected
                            ]}>
                              {level}
                            </Text>
                            {filters.experienceLevel === level && (
                              <Ionicons name="checkmark" size={20} color="#007bff" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.experienceRangeContainer}>
                    <View style={styles.experienceDropdownWrapper}>
                      <Text style={styles.inputLabel}>Min Experience</Text>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setShowMinExpDropdown(!showMinExpDropdown)}
                      >
                        <Text style={styles.dropdownButtonText}>
                          {filters.minExperience || 'Select Min Experience'}
                        </Text>
                        <Ionicons 
                          name={showMinExpDropdown ? 'chevron-up' : 'chevron-down'} 
                          size={20} 
                          color="#666" 
                        />
                      </TouchableOpacity>
                      {showMinExpDropdown && (
                        <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                              updateFilter('minExperience', '');
                              setShowMinExpDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>Clear Selection</Text>
                          </TouchableOpacity>
                          {experienceYears.map((exp) => (
                            <TouchableOpacity
                              key={exp}
                              style={[
                                styles.dropdownItem,
                                filters.minExperience === exp && styles.dropdownItemSelected
                              ]}
                              onPress={() => {
                                updateFilter('minExperience', exp);
                                setShowMinExpDropdown(false);
                              }}
                            >
                              <Text style={[
                                styles.dropdownItemText,
                                filters.minExperience === exp && styles.dropdownItemTextSelected
                              ]}>
                                {exp}
                              </Text>
                              {filters.minExperience === exp && (
                                <Ionicons name="checkmark" size={20} color="#007bff" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                    
                    <Text style={styles.rangeSeparatorVertical}>to</Text>
                    
                    <View style={styles.experienceDropdownWrapper}>
                      <Text style={styles.inputLabel}>Max Experience</Text>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setShowMaxExpDropdown(!showMaxExpDropdown)}
                      >
                        <Text style={styles.dropdownButtonText}>
                          {filters.maxExperience || 'Select Max Experience'}
                        </Text>
                        <Ionicons 
                          name={showMaxExpDropdown ? 'chevron-up' : 'chevron-down'} 
                          size={20} 
                          color="#666" 
                        />
                      </TouchableOpacity>
                      {showMaxExpDropdown && (
                        <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                              updateFilter('maxExperience', '');
                              setShowMaxExpDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>Clear Selection</Text>
                          </TouchableOpacity>
                          {experienceYears.map((exp) => (
                            <TouchableOpacity
                              key={exp}
                              style={[
                                styles.dropdownItem,
                                filters.maxExperience === exp && styles.dropdownItemSelected
                              ]}
                              onPress={() => {
                                updateFilter('maxExperience', exp);
                                setShowMaxExpDropdown(false);
                              }}
                            >
                              <Text style={[
                                styles.dropdownItemText,
                                filters.maxExperience === exp && styles.dropdownItemTextSelected
                              ]}>
                                {exp}
                              </Text>
                              {filters.maxExperience === exp && (
                                <Ionicons name="checkmark" size={20} color="#007bff" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  </View>
                </>
              ))}

              {/* Location Filters */}
              {renderFilterSection('Location', (
                <>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Current City (comma separated)"
                    value={filters.currentCity.join(', ')}
                    onChangeText={(text) => updateFilter('currentCity', text.split(',').map(s => s.trim()))}
                  />
                  
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => updateFilter('includeWillingToRelocate', !filters.includeWillingToRelocate)}
                  >
                    <Ionicons
                      name={filters.includeWillingToRelocate ? 'checkbox' : 'square-outline'}
                      size={24}
                      color="#007bff"
                    />
                    <Text style={styles.checkboxLabel}>Include Willing To Relocate Candidates</Text>
                  </TouchableOpacity>
                </>
              ))}

              {/* Salary Filters */}
              {renderFilterSection('Salary', (
                <>
                  <View style={styles.rangeInputContainer}>
                    <TextInput
                      style={[styles.filterInput, styles.rangeInput]}
                      placeholder="Min Salary (Lacs)"
                      value={filters.minSalary}
                      onChangeText={(text) => updateFilter('minSalary', text)}
                      keyboardType="numeric"
                    />
                    <Text style={styles.rangeSeparator}>to</Text>
                    <TextInput
                      style={[styles.filterInput, styles.rangeInput]}
                      placeholder="Max Salary (Lacs)"
                      value={filters.maxSalary}
                      onChangeText={(text) => updateFilter('maxSalary', text)}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => updateFilter('includeNoSalaryCandidates', !filters.includeNoSalaryCandidates)}
                  >
                    <Ionicons
                      name={filters.includeNoSalaryCandidates ? 'checkbox' : 'square-outline'}
                      size={24}
                      color="#007bff"
                    />
                    <Text style={styles.checkboxLabel}>Include candidates who did not mention salary</Text>
                  </TouchableOpacity>
                </>
              ))}

              {/* Professional Details */}
              {renderFilterSection('Professional Details', (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Current Job Title/Designation (Max 5)</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowJobTitleDropdown(!showJobTitleDropdown)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {filters.currentJobTitle.length > 0 
                          ? `${filters.currentJobTitle.length} selected` 
                          : 'Select Job Titles'}
                      </Text>
                      <Ionicons 
                        name={showJobTitleDropdown ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    {filters.currentJobTitle.length > 0 && (
                      <View style={styles.selectedItemsContainer}>
                        {filters.currentJobTitle.map((title, index) => (
                          <View key={index} style={styles.selectedItem}>
                            <Text style={styles.selectedItemText}>{title}</Text>
                            <TouchableOpacity
                              onPress={() => {
                                const newTitles = filters.currentJobTitle.filter((_, i) => i !== index);
                                updateFilter('currentJobTitle', newTitles);
                              }}
                            >
                              <Ionicons name="close-circle" size={18} color="#dc3545" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                    {showJobTitleDropdown && (
                      <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            updateFilter('currentJobTitle', []);
                            setShowJobTitleDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>Clear All</Text>
                        </TouchableOpacity>
                        {jobTitleOptions.map((option) => {
                          const isSelected = filters.currentJobTitle.includes(option.label);
                          const isDisabled = !isSelected && filters.currentJobTitle.length >= 5;
                          
                          return (
                            <TouchableOpacity
                              key={option.value}
                              style={[
                                styles.dropdownItem,
                                isSelected && styles.dropdownItemSelected,
                                isDisabled && styles.dropdownItemDisabled
                              ]}
                              onPress={() => {
                                if (isDisabled) return;
                                
                                let newTitles;
                                if (isSelected) {
                                  newTitles = filters.currentJobTitle.filter(t => t !== option.label);
                                } else {
                                  newTitles = [...filters.currentJobTitle, option.label];
                                }
                                updateFilter('currentJobTitle', newTitles);
                              }}
                              disabled={isDisabled}
                            >
                              <Text style={[
                                styles.dropdownItemText,
                                isSelected && styles.dropdownItemTextSelected,
                                isDisabled && styles.dropdownItemTextDisabled
                              ]}>
                                {option.label}
                              </Text>
                              {isSelected && (
                                <Ionicons name="checkmark" size={20} color="#007bff" />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Company Type</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowCompanyTypeDropdown(!showCompanyTypeDropdown)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {filters.currentCompanyType || 'Select Company Type'}
                      </Text>
                      <Ionicons 
                        name={showCompanyTypeDropdown ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    {showCompanyTypeDropdown && (
                      <View style={styles.dropdownList}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            updateFilter('currentCompanyType', '');
                            setShowCompanyTypeDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>Clear Selection</Text>
                        </TouchableOpacity>
                        {companyTypeOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.dropdownItem,
                              filters.currentCompanyType === option.label && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              updateFilter('currentCompanyType', option.label);
                              setShowCompanyTypeDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              filters.currentCompanyType === option.label && styles.dropdownItemTextSelected
                            ]}>
                              {option.label}
                            </Text>
                            {filters.currentCompanyType === option.label && (
                              <Ionicons name="checkmark" size={20} color="#007bff" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Notice Period</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowNoticePeriodDropdown(!showNoticePeriodDropdown)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {filters.noticePeriod || 'Select Notice Period'}
                      </Text>
                      <Ionicons 
                        name={showNoticePeriodDropdown ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    {showNoticePeriodDropdown && (
                      <View style={styles.dropdownList}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            updateFilter('noticePeriod', '');
                            setShowNoticePeriodDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>Clear Selection</Text>
                        </TouchableOpacity>
                        {joiningPeriodOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.dropdownItem,
                              filters.noticePeriod === option.label && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              updateFilter('noticePeriod', option.label);
                              setShowNoticePeriodDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              filters.noticePeriod === option.label && styles.dropdownItemTextSelected
                            ]}>
                              {option.label}
                            </Text>
                            {filters.noticePeriod === option.label && (
                              <Ionicons name="checkmark" size={20} color="#007bff" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </>
              ))}

              {/* Demographics */}
              {renderFilterSection('Demographics', (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {filters.gender[0] || 'Select Gender'}
                      </Text>
                      <Ionicons 
                        name={showGenderDropdown ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    {showGenderDropdown && (
                      <View style={styles.dropdownList}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            updateFilter('gender', []);
                            setShowGenderDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>Clear Selection</Text>
                        </TouchableOpacity>
                        {genderOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.dropdownItem,
                              filters.gender[0] === option.label && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              updateFilter('gender', [option.label]);
                              setShowGenderDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              filters.gender[0] === option.label && styles.dropdownItemTextSelected
                            ]}>
                              {option.label}
                            </Text>
                            {filters.gender[0] === option.label && (
                              <Ionicons name="checkmark" size={20} color="#007bff" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.rangeInputContainer}>
                    <TextInput
                      style={[styles.filterInput, styles.rangeInput]}
                      placeholder="Min Age"
                      value={filters.minAge}
                      onChangeText={(text) => updateFilter('minAge', text)}
                      keyboardType="numeric"
                    />
                    <Text style={styles.rangeSeparator}>to</Text>
                    <TextInput
                      style={[styles.filterInput, styles.rangeInput]}
                      placeholder="Max Age"
                      value={filters.maxAge}
                      onChangeText={(text) => updateFilter('maxAge', text)}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              ))}

              {/* Job Preferences */}
              {renderFilterSection('Job Preferences', (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Job Mode</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowJobModeDropdown(!showJobModeDropdown)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {filters.jobModeType[0] || 'Select Job Mode'}
                      </Text>
                      <Ionicons 
                        name={showJobModeDropdown ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    {showJobModeDropdown && (
                      <View style={styles.dropdownList}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            updateFilter('jobModeType', []);
                            setShowJobModeDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>Clear Selection</Text>
                        </TouchableOpacity>
                        {jobModeOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.dropdownItem,
                              filters.jobModeType[0] === option.label && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              updateFilter('jobModeType', [option.label]);
                              setShowJobModeDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              filters.jobModeType[0] === option.label && styles.dropdownItemTextSelected
                            ]}>
                              {option.label}
                            </Text>
                            {filters.jobModeType[0] === option.label && (
                              <Ionicons name="checkmark" size={20} color="#007bff" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Job Shift</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowJobShiftDropdown(!showJobShiftDropdown)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {filters.jobShiftType[0] || 'Select Job Shift'}
                      </Text>
                      <Ionicons 
                        name={showJobShiftDropdown ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    {showJobShiftDropdown && (
                      <View style={styles.dropdownList}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            updateFilter('jobShiftType', []);
                            setShowJobShiftDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>Clear Selection</Text>
                        </TouchableOpacity>
                        {jobShiftOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.dropdownItem,
                              filters.jobShiftType[0] === option.label && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              updateFilter('jobShiftType', [option.label]);
                              setShowJobShiftDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              filters.jobShiftType[0] === option.label && styles.dropdownItemTextSelected
                            ]}>
                              {option.label}
                            </Text>
                            {filters.jobShiftType[0] === option.label && (
                              <Ionicons name="checkmark" size={20} color="#007bff" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>English Fluency</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowEnglishFluencyDropdown(!showEnglishFluencyDropdown)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {filters.englishFluencyLevel[0] || 'Select English Fluency'}
                      </Text>
                      <Ionicons 
                        name={showEnglishFluencyDropdown ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    {showEnglishFluencyDropdown && (
                      <View style={styles.dropdownList}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            updateFilter('englishFluencyLevel', []);
                            setShowEnglishFluencyDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>Clear Selection</Text>
                        </TouchableOpacity>
                        {englishFluencyLevels.map((level) => (
                          <TouchableOpacity
                            key={level}
                            style={[
                              styles.dropdownItem,
                              filters.englishFluencyLevel[0] === level && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              updateFilter('englishFluencyLevel', [level]);
                              setShowEnglishFluencyDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              filters.englishFluencyLevel[0] === level && styles.dropdownItemTextSelected
                            ]}>
                              {level}
                            </Text>
                            {filters.englishFluencyLevel[0] === level && (
                              <Ionicons name="checkmark" size={20} color="#007bff" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </>
              ))}

              {/* Candidate Status */}
              {renderFilterSection('Candidate Status', (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Last Active</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowLastActiveDropdown(!showLastActiveDropdown)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {filters.lastActiveCandidates || 'Select Last Active Period'}
                      </Text>
                      <Ionicons 
                        name={showLastActiveDropdown ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    {showLastActiveDropdown && (
                      <View style={styles.dropdownList}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            updateFilter('lastActiveCandidates', '');
                            setShowLastActiveDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>Clear Selection</Text>
                        </TouchableOpacity>
                        {lastActiveOptions.map((option) => (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.dropdownItem,
                              filters.lastActiveCandidates === option && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              updateFilter('lastActiveCandidates', option);
                              setShowLastActiveDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              filters.lastActiveCandidates === option && styles.dropdownItemTextSelected
                            ]}>
                              {option}
                            </Text>
                            {filters.lastActiveCandidates === option && (
                              <Ionicons name="checkmark" size={20} color="#007bff" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setShowFiltersModal(false);
                  handleSearch(1);
                }}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
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

