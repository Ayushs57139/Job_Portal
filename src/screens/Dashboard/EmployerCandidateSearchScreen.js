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
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';
import {
  jobTitleOptions,
  companyTypeOptions,
  genderOptions,
  jobModeOptions,
  jobShiftOptions,
  joiningPeriodOptions,
} from '../../data/jobPostFormConfig';

const EmployerCandidateSearchScreen = ({ navigation }) => {
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchStats, setSearchStats] = useState({});

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  // Dropdown visibility states (matching admin)
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
      lastActiveCandidates: '',
    });
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
      <View style={styles.sidebar}><EmployerSidebar permanent navigation={navigation} role="company" activeKey="resume" /></View>
      <View style={styles.content}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Candidate Search</Text>
          <Text style={styles.headerSubtitle}>Search and filter candidates dynamically</Text>
        </View>

        <View style={styles.quickSearchContainer}>
          <View style={styles.searchRow}>
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
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {/* Basic Information */}
              <Text style={styles.sectionLabel}>Basic Information</Text>
              <TextInput style={styles.input} placeholder="Current/Last Company Name" value={filters.currentCompanyName} onChangeText={(t)=>updateFilter('currentCompanyName',t)} />

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
              <TextInput style={styles.input} placeholder="Current City (comma separated)" value={filters.currentCity.join(', ')} onChangeText={(t)=>updateFilter('currentCity', t.split(',').map(s=>s.trim()).filter(Boolean))} />
              <TouchableOpacity style={styles.checkboxRow} onPress={()=>updateFilter('includeWillingToRelocate', !filters.includeWillingToRelocate)}>
                <Ionicons name={filters.includeWillingToRelocate?'checkbox':'square-outline'} size={22} color={colors.primary} /><Text style={styles.checkboxLabel}>Include Willing To Relocate</Text>
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
                    <TouchableOpacity style={styles.dropdownItem} onPress={()=>{updateFilter('currentJobTitle', []);}}>
                      <Text style={styles.dropdownItemText}>Clear All</Text>
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
                <Text style={styles.inputLabel}>Notice Period</Text>
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

              {/* Candidate Status */}
              <Text style={styles.sectionLabel}>Candidate Status</Text>
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
              <TextInput style={styles.input} placeholder="Exclude Keywords" value={filters.excludeKeywords} onChangeText={(t)=>updateFilter('excludeKeywords',t)} />
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
  page: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  sidebar: { width: 280, backgroundColor: colors.sidebarBackground },
  content: { flex: 1 },
  headerBar: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { ...typography.h3, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  headerSubtitle: { ...typography.body2, color: colors.textSecondary },
  quickSearchContainer: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.cardBackground },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, ...typography.body1, color: colors.text },
  filtersButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.secondary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  filtersButtonText: { ...typography.button, color: colors.white, fontWeight: '600' },
  searchButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  searchButtonText: { ...typography.button, color: colors.white, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.cardBackground, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  statValue: { ...typography.h4, color: colors.primary, fontWeight: '700' },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  resultsCount: { ...typography.body1, color: colors.text, fontWeight: '600' },
  candidateCard: { backgroundColor: colors.cardBackground, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  candidateHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  candidateName: { ...typography.h5, color: colors.text, fontWeight: '700' },
  candidateRole: { ...typography.body2, color: colors.textSecondary },
  candidateCompany: { ...typography.body2, color: colors.primary },
  matchScoreContainer: { backgroundColor: colors.gradientStart + '20', borderRadius: borderRadius.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, alignItems: 'center' },
  matchScoreLabel: { ...typography.caption, color: colors.textSecondary },
  matchScore: { ...typography.h5, color: colors.primary, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  detailText: { ...typography.body2, color: colors.textSecondary },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  skillTag: { backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  skillText: { ...typography.caption, color: colors.primary },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingText: { ...typography.body1, color: colors.textSecondary, marginTop: spacing.sm },
  emptyContainer: { alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.body1, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
  emptyButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.md },
  emptyButtonText: { ...typography.button, color: colors.white, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#f6f8fb' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.cardBackground },
  modalTitle: { ...typography.h4, color: colors.text, fontWeight: '800' },
  modalContent: { flex: 1, padding: spacing.lg },
  input: { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, ...typography.body1, color: colors.text, marginBottom: spacing.md, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  modalFooter: { flexDirection: 'row', padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.md, backgroundColor: colors.cardBackground },
  clearButton: { flex: 1, backgroundColor: colors.textSecondary + '20', paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  clearButtonText: { ...typography.button, color: colors.textSecondary, fontWeight: '600' },
  applyButton: { flex: 1, backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  applyButtonText: { ...typography.button, color: colors.white, fontWeight: '600' },
  sectionLabel: { ...typography.h5, color: colors.text, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm },
  inputGroup: { marginBottom: spacing.md },
  inputLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '600' },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  dropdownButtonText: { ...typography.body1, color: colors.text },
  dropdownList: { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginTop: spacing.xs, maxHeight: 260, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownItemSelected: { backgroundColor: colors.primary + '10' },
  dropdownItemDisabled: { opacity: 0.5, backgroundColor: colors.background },
  dropdownItemText: { ...typography.body1, color: colors.text },
  dropdownItemTextSelected: { color: colors.primary, fontWeight: '600' },
  dropdownItemTextDisabled: { color: colors.textSecondary },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  checkboxLabel: { ...typography.body2, color: colors.text },
  rangeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  rangeRowInputs: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  selectedItemsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  selectedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', borderRadius: 16, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, gap: 6 },
  selectedItemText: { ...typography.caption, color: colors.primary },
});

export default EmployerCandidateSearchScreen;


