import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import JobCard from '../../components/JobCard';
import AdvertisementWidget from '../../components/AdvertisementWidget';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const isWeb = Platform.OS === 'web';

const getStyles = (isPhone, isMobile, isTablet, isDesktop, width) => {
  const isWeb = Platform.OS === 'web';
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    ...(isWeb && {
      overflow: 'visible',
    }),
  },
  hero: {
    paddingVertical: isMobile ? spacing.xl : spacing.xxl,
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...(isWeb && {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    }),
  },
  searchContainerGradient: {
    marginHorizontal: isPhone ? spacing.sm : spacing.lg,
    marginTop: -spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    padding: 1,
  },
  heroTitle: {
    fontSize: isMobile ? 26 : (isTablet ? 32 : 42),
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: isMobile ? spacing.md : 0,
  },
  heroSubtitle: {
    fontSize: isWeb ? 18 : 16,
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  clearFilterText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  heroStatsRow: {
    flexDirection: isPhone ? 'column' : 'row',
    gap: spacing.md,
    width: '100%',
    maxWidth: 900,
    marginBottom: spacing.lg,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  heroStatLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  searchContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: isPhone ? spacing.sm : (isMobile ? spacing.md : isTablet ? spacing.lg : spacing.xl),
    gap: isPhone ? spacing.sm : spacing.md,
    maxWidth: isDesktop ? 1400 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  searchRow: {
    flexDirection: isPhone ? 'column' : (isMobile ? 'column' : 'row'),
    gap: isPhone ? spacing.xs : (isMobile ? spacing.sm : spacing.md),
    alignItems: isPhone ? 'stretch' : (isMobile ? 'stretch' : 'center'),
    position: 'relative',
    zIndex: 1,
    overflow: 'visible',
    ...(isWeb && {
      overflow: 'visible',
    }),
  },
  searchInputWrapper: {
    flex: isPhone ? 1 : (isMobile ? 1 : isDesktop ? 2 : 1.5),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : isTablet ? spacing.md : spacing.lg),
    borderWidth: 1,
    borderColor: colors.border,
    gap: isPhone ? spacing.xs : spacing.sm,
    height: isPhone ? 44 : (isMobile ? 46 : (isTablet ? 48 : 50)),
    minWidth: isPhone ? '100%' : (isMobile ? '100%' : (isTablet ? 150 : 180)),
  },
  searchInput: {
    flex: 1,
    paddingVertical: isPhone ? spacing.xs : spacing.sm,
    ...typography.body1,
    fontSize: isPhone ? 14 : (isMobile ? 15 : (isTablet ? 16 : 16)),
    color: colors.text,
    minWidth: 0,
  },
  experienceDropdownWrapper: {
    flex: isPhone ? 1 : (isMobile ? 1 : isDesktop ? 1.5 : 1.2),
    position: 'relative',
    zIndex: 99999,
    elevation: 15,
    minWidth: isPhone ? '100%' : (isMobile ? '100%' : (isTablet ? 140 : 160)),
    overflow: 'visible',
    ...(isWeb && {
      overflow: 'visible',
    }),
  },
  experienceDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : isTablet ? spacing.md : spacing.lg),
    paddingVertical: isPhone ? spacing.sm : (isMobile ? spacing.sm : spacing.md),
    borderWidth: 1,
    borderColor: colors.border,
    height: isPhone ? 44 : (isMobile ? 46 : (isTablet ? 48 : 50)),
    minWidth: 0,
  },
  experienceText: {
    ...typography.body1,
    fontSize: isPhone ? 14 : (isMobile ? 15 : (isTablet ? 15 : 16)),
    color: colors.text,
    flex: 1,
    marginRight: spacing.xs,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 99998,
    elevation: 14,
    ...(isWeb && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
    }),
  },
  experienceMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    ...shadows.lg,
    zIndex: 99999,
    elevation: 15,
    maxHeight: isTablet ? 300 : 320,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...(isWeb && {
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      position: 'absolute',
    }),
  },
  experienceMenuScroll: {
    maxHeight: isTablet ? 300 : 320,
  },
  experienceOption: {
    paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.md : spacing.lg),
    paddingVertical: isPhone ? spacing.md : (isMobile ? spacing.md : spacing.lg),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: colors.cardBackground,
    minHeight: isPhone ? 48 : (isMobile ? 50 : 54),
    justifyContent: 'center',
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    }),
  },
  experienceOptionLast: {
    borderBottomWidth: 0,
  },
  experienceOptionActive: {
    backgroundColor: '#F0F4FF',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  experienceOptionText: {
    ...typography.body1,
    fontSize: isPhone ? 15 : (isMobile ? 15 : (isTablet ? 16 : 16)),
    color: '#2D3748',
    fontWeight: '500',
    lineHeight: isPhone ? 20 : 22,
  },
  experienceOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : isTablet ? spacing.lg : spacing.xl),
    gap: isPhone ? spacing.xs : spacing.xs,
    minWidth: isPhone ? '100%' : (isMobile ? '100%' : (isDesktop ? 120 : 100)),
    width: isPhone ? '100%' : (isMobile ? '100%' : undefined),
    height: isPhone ? 44 : (isMobile ? 46 : (isTablet ? 48 : 50)),
    zIndex: 1,
    elevation: 1,
  },
  searchButtonText: {
    ...typography.button,
    fontSize: isPhone ? 14 : (isMobile ? 15 : (isTablet ? 16 : 16)),
    color: colors.textWhite,
    fontWeight: '600',
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  quickFilterText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  contentContainer: {
    flexDirection: isWeb && width > 768 ? 'row' : 'column',
    paddingVertical: spacing.lg,
    paddingHorizontal: 0,
    gap: 0,
    alignItems: 'flex-start',
    zIndex: 1,
    position: 'relative',
  },
  sidebarWrapper: {
    width: isWeb && width > 768 ? 300 : '100%',
    marginRight: isWeb && width > 768 ? spacing.lg : 0,
    ...(isWeb && width > 768 && {
      position: 'sticky',
      top: spacing.xl,
      alignSelf: 'flex-start',
    }),
  },
  sidebar: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
    gap: spacing.lg,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterTitle: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text,
  },
  clearAllText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  filterSearchInput: {
    flex: 1,
    ...typography.body2,
    fontSize: isPhone ? 13 : (isMobile ? 14 : 14),
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  filterOptionsContainer: {
    maxHeight: isPhone ? 200 : (isMobile ? 250 : 300),
  },
  filterSectionTitle: {
    ...typography.body1,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    ...typography.body2,
    color: colors.text,
  },
  salaryLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  salaryDisplay: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  salaryValue: {
    ...typography.h6,
    fontWeight: '700',
    color: colors.primary,
  },
  salaryMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  salaryMarkerText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontSize: 12,
  },
  salaryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  salaryButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  salaryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  salaryButtonText: {
    ...typography.body2,
    color: colors.text,
    fontSize: 11,
  },
  salaryButtonTextActive: {
    color: colors.textWhite,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    ...typography.body2,
    color: colors.text,
  },
  jobsWrapper: {
    flex: 1,
  },
  jobsListContainer: {
    flex: 1,
    paddingLeft: isWeb && width > 768 ? spacing.lg : spacing.md,
    paddingRight: isWeb && width > 768 ? spacing.lg : spacing.md,
    gap: spacing.md,
    ...(isWeb && {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }),
  },
  jobCardWrapper: {
    width: '100%',
    maxWidth: 900,
  },
  resultsCount: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  mobileFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    paddingHorizontal: isPhone ? spacing.md : spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
    zIndex: 1,
    elevation: 1,
  },
  mobileFilterText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalApplyButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalApplyText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '600',
  },
  experienceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isPhone ? spacing.md : spacing.lg,
  },
  experienceModalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: isPhone ? '100%' : 400,
    maxHeight: '80%',
    ...shadows.lg,
  },
  experienceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isPhone ? spacing.md : spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  experienceModalTitle: {
    fontSize: isPhone ? 18 : (isMobile ? 20 : 22),
    fontWeight: '700',
    color: colors.text,
  },
  experienceModalScroll: {
    maxHeight: isPhone ? 400 : 450,
  },
  experienceModalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isPhone ? spacing.md : spacing.lg,
    paddingVertical: isPhone ? spacing.md : spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    minHeight: isPhone ? 52 : 56,
  },
  experienceModalOptionLast: {
    borderBottomWidth: 0,
  },
  experienceModalOptionActive: {
    backgroundColor: '#F0F4FF',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  experienceModalOptionText: {
    ...typography.body1,
    fontSize: isPhone ? 15 : (isMobile ? 16 : 16),
    color: '#2D3748',
    fontWeight: '500',
    flex: 1,
  },
  experienceModalOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  adContainer: {
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  });
};

const JobsScreen = ({ route }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  
  const mainStyles = useMemo(() => {
    return getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);
  }, [isPhone, isMobile, isTablet, isDesktop, responsive.width]);
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(route?.params?.search || '');
  const [locationQuery, setLocationQuery] = useState(route?.params?.location || '');
  const [selectedExperience, setSelectedExperience] = useState(
    route?.params?.experience || 'All Experience'
  );
  const [showExperienceMenu, setShowExperienceMenu] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Active filter from navigation
  const [activeFilter, setActiveFilter] = useState(route?.params?.filterLabel || null);
  const filterType = route?.params?.filterType;
  const filterValue = route?.params?.filterValue;

  // Filter states - Initialize from route params if available
  const [datePosted, setDatePosted] = useState('all');
  const [minSalary, setMinSalary] = useState(0);
  const [workMode, setWorkMode] = useState(route?.params?.workMode ? [route.params.workMode] : []);
  const [workType, setWorkType] = useState(route?.params?.jobType ? [route.params.jobType] : []);
  const [workShift, setWorkShift] = useState([]);
  const [sortBy, setSortBy] = useState('relevant');
  
  // Industries and Departments filters
  const [industries, setIndustries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [industrySearchQuery, setIndustrySearchQuery] = useState('');
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState('');

  const experienceOptions = [
    'All Experience',
    'Fresher (0-1 year)',
    '1-3 years',
    '3-5 years',
    '5-10 years',
    '10+ years',
  ];

  const datePostedOptions = [
    { id: 'all', label: 'All' },
    { id: '24h', label: 'Last 24 hours' },
    { id: '3d', label: 'Last 3 days' },
    { id: '7d', label: 'Last 7 days' },
  ];

  const workModeOptions = [
    { id: 'wfh', label: 'Work from home', icon: 'home-outline' },
    { id: 'office', label: 'Work from office', icon: 'business-outline' },
    { id: 'field', label: 'Work from field', icon: 'location-outline' },
  ];

  const workTypeOptions = [
    { id: 'fulltime', label: 'Full time', icon: 'briefcase-outline' },
    { id: 'parttime', label: 'Part time', icon: 'time-outline' },
    { id: 'internship', label: 'Internship', icon: 'school-outline' },
  ];

  const workShiftOptions = [
    { id: 'day', label: 'Day shift', icon: 'sunny-outline' },
    { id: 'night', label: 'Night shift', icon: 'moon-outline' },
  ];

  const sortByOptions = [
    { id: 'relevant', label: 'Relevant' },
    { id: 'salary-high', label: 'Salary - High to low' },
    { id: 'date-new', label: 'Date posted - New to old' },
  ];

  useEffect(() => {
    // Apply filters from route params
    if (filterType && filterValue) {
      applyRouteFilter();
    }
    loadMasterData();
    loadJobs();
  }, []);

  useEffect(() => {
    // Reload jobs when filters change
    loadJobs();
  }, [selectedIndustries, selectedDepartments, datePosted, minSalary, workMode, workType, workShift, sortBy, searchQuery, locationQuery, selectedExperience]);

  useEffect(() => {
    // Reload when route params change
    if (route?.params?.filterType) {
      setActiveFilter(route.params.filterLabel || null);
      applyRouteFilter();
      loadJobs();
    }
  }, [route?.params]);

  const loadMasterData = async () => {
    try {
      // Load industries
      const industriesRes = await api.getAllIndustries();
      if (industriesRes && industriesRes.success && industriesRes.data) {
        setIndustries(industriesRes.data);
      }
      
      // Load departments
      const departmentsRes = await api.getAllDepartments();
      if (departmentsRes && departmentsRes.success && departmentsRes.data) {
        setDepartments(departmentsRes.data);
      }
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const applyRouteFilter = () => {
    if (!filterType || !filterValue) return;

    switch (filterType) {
      case 'workMode':
        setWorkMode([filterValue]);
        break;
      case 'workType':
        setWorkType([filterValue]);
        break;
      case 'workShift':
        setWorkShift([filterValue]);
        break;
      case 'experience':
        if (filterValue === 'fresher') {
          setSelectedExperience('Fresher (0-1 year)');
        }
        break;
      default:
        break;
    }
  };

  const loadJobs = async () => {
    try {
      const employerView = route?.params?.employerView;
      const employerStatus = route?.params?.status;

      if (employerView) {
        const params = {};
        if (employerStatus) params.status = employerStatus;
        const response = await api.getMyJobs(params);
        const myJobs = response.jobs || [];
        setJobs(myJobs);
      } else {
        const filters = {};
        if (searchQuery) filters.search = searchQuery;
        if (locationQuery) filters.location = locationQuery;

        // Apply active filters
        if (workMode.length > 0) filters.workMode = workMode.join(',');
        if (workType.length > 0) filters.workType = workType.join(',');
        if (workShift.length > 0) filters.workShift = workShift.join(',');
        if (selectedExperience !== 'All Experience') filters.experience = selectedExperience;
        if (selectedIndustries.length > 0) filters.industries = selectedIndustries.join(',');
        if (selectedDepartments.length > 0) filters.departments = selectedDepartments.join(',');

        const response = await api.getJobs(filters);
        
        // Apply client-side filtering based on route params
        let filteredJobs = response.jobs || [];
      
        // Apply industries filter
        if (selectedIndustries.length > 0) {
          filteredJobs = filteredJobs.filter(job => {
            const jobIndustries = [];
            // Check company.industry
            if (job.company?.industry) {
              jobIndustries.push(job.company.industry);
            }
            // Check industries array
            if (job.industries && Array.isArray(job.industries)) {
              jobIndustries.push(...job.industries.map(ind => ind.name || ind));
            }
            // Check industry field (if exists)
            if (job.industry) {
              if (Array.isArray(job.industry)) {
                jobIndustries.push(...job.industry);
              } else {
                jobIndustries.push(job.industry);
              }
            }
            
            return selectedIndustries.some(selectedIndustry => 
              jobIndustries.some(jobIndustry => {
                const jobInd = (jobIndustry?.name || jobIndustry || '').toString().toLowerCase();
                const selectedInd = selectedIndustry.toLowerCase();
                return jobInd.includes(selectedInd) || selectedInd.includes(jobInd);
              })
            );
          });
        }
        
        // Apply departments filter
        if (selectedDepartments.length > 0) {
          filteredJobs = filteredJobs.filter(job => {
            const jobDepartments = [];
            // Check departments array
            if (job.departments && Array.isArray(job.departments)) {
              jobDepartments.push(...job.departments.map(dept => dept.name || dept));
            }
            // Check department field (if exists)
            if (job.department) {
              if (Array.isArray(job.department)) {
                jobDepartments.push(...job.department);
              } else {
                jobDepartments.push(job.department);
              }
            }
            
            return selectedDepartments.some(selectedDepartment => 
              jobDepartments.some(jobDepartment => {
                const jobDept = (jobDepartment?.name || jobDepartment || '').toString().toLowerCase();
                const selectedDept = selectedDepartment.toLowerCase();
                return jobDept.includes(selectedDept) || selectedDept.includes(jobDept);
              })
            );
          });
        }
      
        if (filterType && filterValue) {
          filteredJobs = filteredJobs.filter(job => {
            switch (filterType) {
              case 'workMode':
                return job.workMode?.toLowerCase() === filterValue;
              case 'workType':
                return job.jobType?.toLowerCase().includes(filterValue) || 
                       job.workType?.toLowerCase() === filterValue;
              case 'workShift':
                return job.workShift?.toLowerCase() === filterValue;
              case 'experience':
                if (filterValue === 'fresher') {
                  return job.experienceRequired === '0-1 year' || 
                         job.experienceRequired?.toLowerCase().includes('fresher');
                }
                return true;
              case 'gender':
                return job.preferredGender?.toLowerCase() === filterValue || 
                       !job.preferredGender;
              default:
                return true;
            }
          });
        }

        setJobs(filteredJobs);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const handleSearch = () => {
    setLoading(true);
    loadJobs();
  };

  const toggleWorkMode = (mode) => {
    if (workMode.includes(mode)) {
      setWorkMode(workMode.filter(m => m !== mode));
    } else {
      setWorkMode([...workMode, mode]);
    }
  };

  const toggleWorkType = (type) => {
    if (workType.includes(type)) {
      setWorkType(workType.filter(t => t !== type));
    } else {
      setWorkType([...workType, type]);
    }
  };

  const toggleWorkShift = (shift) => {
    if (workShift.includes(shift)) {
      setWorkShift(workShift.filter(s => s !== shift));
    } else {
      setWorkShift([...workShift, shift]);
    }
  };

  const toggleIndustry = (industryName) => {
    if (selectedIndustries.includes(industryName)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industryName));
    } else {
      setSelectedIndustries([...selectedIndustries, industryName]);
    }
  };

  const toggleDepartment = (departmentName) => {
    if (selectedDepartments.includes(departmentName)) {
      setSelectedDepartments(selectedDepartments.filter(d => d !== departmentName));
    } else {
      setSelectedDepartments([...selectedDepartments, departmentName]);
    }
  };

  const clearAllFilters = () => {
    setDatePosted('all');
    setMinSalary(0);
    setWorkMode([]);
    setWorkType([]);
    setWorkShift([]);
    setSortBy('relevant');
    setSearchQuery('');
    setLocationQuery('');
    setSelectedExperience('All Experience');
    setSelectedIndustries([]);
    setSelectedDepartments([]);
    setIndustrySearchQuery('');
    setDepartmentSearchQuery('');
    setActiveFilter(null);
    loadJobs();
  };

  const renderHeroSection = () => {
    const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);
    return (
    <View style={dynamicStyles.hero}>
      <Text style={dynamicStyles.heroTitle}>{activeFilter || 'All Jobs'}</Text>
      <Text style={dynamicStyles.heroSubtitle}>
        {activeFilter 
          ? `Showing ${jobs.length} job${jobs.length !== 1 ? 's' : ''} matching your criteria`
          : 'Discover opportunities from top companies and consultancies'}
      </Text>
      <View style={dynamicStyles.heroStatsRow}>
        <View style={dynamicStyles.heroStatCard}>
          <Text style={dynamicStyles.heroStatValue}>{jobs.length}</Text>
          <Text style={dynamicStyles.heroStatLabel}>Open roles</Text>
        </View>
        <View style={dynamicStyles.heroStatCard}>
          <Text style={dynamicStyles.heroStatValue}>
            {jobs.filter(job => job.workMode?.toLowerCase() === 'wfh').length}
          </Text>
          <Text style={dynamicStyles.heroStatLabel}>Remote friendly</Text>
        </View>
        <View style={dynamicStyles.heroStatCard}>
          <Text style={dynamicStyles.heroStatValue}>
            {jobs.filter(job => job.jobType?.toLowerCase().includes('intern')).length}
          </Text>
          <Text style={dynamicStyles.heroStatLabel}>Internships</Text>
        </View>
      </View>
      {activeFilter && (
        <TouchableOpacity 
          style={dynamicStyles.clearFilterButton}
          onPress={clearAllFilters}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle" size={isPhone ? 18 : 20} color={colors.text} />
          <Text style={dynamicStyles.clearFilterText}>Clear Filter</Text>
        </TouchableOpacity>
      )}
    </View>
    );
  };

  const renderSearchBar = () => {
    const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);
    return (
      <View style={dynamicStyles.searchContainerGradient}>
      <View style={dynamicStyles.searchContainer}>
      <View style={dynamicStyles.searchRow}>
        <View style={dynamicStyles.searchInputWrapper}>
          <Ionicons name="search-outline" size={isPhone ? 18 : (isMobile ? 18 : (isTablet ? 20 : 22))} color={colors.textSecondary} />
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder={isPhone ? "Search jobs..." : "Search jobs by title, company..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={dynamicStyles.experienceDropdownWrapper}>
          <TouchableOpacity
            style={dynamicStyles.experienceDropdown}
            onPress={() => setShowExperienceMenu(!showExperienceMenu)}
          >
            <Text style={dynamicStyles.experienceText} numberOfLines={1} ellipsizeMode="tail">{selectedExperience}</Text>
            <Ionicons name="chevron-down" size={isPhone ? 18 : (isMobile ? 18 : (isTablet ? 20 : 22))} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {showExperienceMenu && !isPhone && !isMobile && (
            <>
              <TouchableOpacity
                style={dynamicStyles.dropdownBackdrop}
                activeOpacity={1}
                onPress={() => setShowExperienceMenu(false)}
              />
              <View style={dynamicStyles.experienceMenu}>
                <ScrollView
                  style={dynamicStyles.experienceMenuScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                >
                  {experienceOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        dynamicStyles.experienceOption,
                        index === experienceOptions.length - 1 && dynamicStyles.experienceOptionLast,
                        selectedExperience === option && dynamicStyles.experienceOptionActive,
                      ]}
                      onPress={() => {
                        setSelectedExperience(option);
                        setShowExperienceMenu(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        dynamicStyles.experienceOptionText,
                        selectedExperience === option && dynamicStyles.experienceOptionTextActive,
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          )}
        </View>

        <View style={dynamicStyles.searchInputWrapper}>
          <Ionicons name="location-outline" size={isPhone ? 18 : (isMobile ? 18 : (isTablet ? 20 : 22))} color={colors.textSecondary} />
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Enter location"
            value={locationQuery}
            onChangeText={setLocationQuery}
            placeholderTextColor={colors.textLight}
          />
        </View>

        <TouchableOpacity style={dynamicStyles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={isPhone ? 18 : (isMobile ? 18 : (isTablet ? 20 : 22))} color={colors.textWhite} />
          <Text style={dynamicStyles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
        <View style={dynamicStyles.quickFilters}>
          {[
            { id: 'all', label: 'Trending roles', icon: 'flame' },
            { id: 'remote', label: 'Remote friendly', icon: 'home' },
            { id: 'freshers', label: 'Freshers', icon: 'sparkles' },
            { id: 'highPay', label: 'High paying', icon: 'cash' },
          ].map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={dynamicStyles.quickFilterChip}
              onPress={() => {
                if (filter.id === 'remote') {
                  setWorkMode(['wfh']);
                } else if (filter.id === 'freshers') {
                  setSelectedExperience('Fresher (0-1 year)');
                } else if (filter.id === 'highPay') {
                  setSortBy('salary-high');
                }
                handleSearch();
              }}
            >
              <Ionicons
                name={filter.icon}
                size={isPhone ? 12 : 14}
                color="#4338CA"
              />
              <Text style={dynamicStyles.quickFilterText}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
  };

  const renderSidebarFilters = () => {
    const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);
    return (
    <View style={dynamicStyles.sidebar}>
      <View style={dynamicStyles.filterHeader}>
        <Text style={dynamicStyles.filterTitle}>Filters</Text>
          <TouchableOpacity onPress={clearAllFilters}>
          <Text style={dynamicStyles.clearAllText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {/* Date Posted Filter */}
      <View style={dynamicStyles.filterSection}>
        <Text style={dynamicStyles.filterSectionTitle}>Date posted</Text>
        {datePostedOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={dynamicStyles.radioOption}
            onPress={() => setDatePosted(option.id)}
          >
            <View style={dynamicStyles.radioButton}>
              {datePosted === option.id && <View style={dynamicStyles.radioButtonSelected} />}
            </View>
            <Text style={dynamicStyles.radioLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Industries Filter */}
      <View style={dynamicStyles.filterSection}>
        <Text style={dynamicStyles.filterSectionTitle}>Industries</Text>
        <View style={dynamicStyles.searchInputContainer}>
          <Ionicons name="search-outline" size={isPhone ? 14 : 16} color={colors.textSecondary} />
          <TextInput
            style={dynamicStyles.filterSearchInput}
            placeholder="Search industries..."
            value={industrySearchQuery}
            onChangeText={setIndustrySearchQuery}
            placeholderTextColor={colors.textLight}
          />
        </View>
        <ScrollView 
          style={dynamicStyles.filterOptionsContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {industries
            .filter(industry => {
              const name = industry.name || industry;
              return name.toLowerCase().includes(industrySearchQuery.toLowerCase());
            })
            .map((industry, index) => {
              const industryName = industry.name || industry;
              const isSelected = selectedIndustries.includes(industryName);
              return (
                <TouchableOpacity
                  key={index}
                  style={dynamicStyles.checkboxOption}
                  onPress={() => toggleIndustry(industryName)}
                >
                  <View style={dynamicStyles.checkbox}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={isPhone ? 14 : 16} color={colors.primary} />
                    )}
                  </View>
                  <Text style={dynamicStyles.checkboxLabel}>{industryName}</Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      {/* Departments Filter */}
      <View style={dynamicStyles.filterSection}>
        <Text style={dynamicStyles.filterSectionTitle}>Departments</Text>
        <View style={dynamicStyles.searchInputContainer}>
          <Ionicons name="search-outline" size={isPhone ? 14 : 16} color={colors.textSecondary} />
          <TextInput
            style={dynamicStyles.filterSearchInput}
            placeholder="Search departments..."
            value={departmentSearchQuery}
            onChangeText={setDepartmentSearchQuery}
            placeholderTextColor={colors.textLight}
          />
        </View>
        <ScrollView 
          style={dynamicStyles.filterOptionsContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {departments
            .filter(department => {
              const name = department.name || department;
              return name.toLowerCase().includes(departmentSearchQuery.toLowerCase());
            })
            .map((department, index) => {
              const departmentName = department.name || department;
              const isSelected = selectedDepartments.includes(departmentName);
              return (
                <TouchableOpacity
                  key={index}
                  style={dynamicStyles.checkboxOption}
                  onPress={() => toggleDepartment(departmentName)}
                >
                  <View style={dynamicStyles.checkbox}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={isPhone ? 14 : 16} color={colors.primary} />
                    )}
                  </View>
                  <Text style={dynamicStyles.checkboxLabel}>{departmentName}</Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      {/* Salary Filter */}
      <View style={dynamicStyles.filterSection}>
        <Text style={dynamicStyles.filterSectionTitle}>Salary</Text>
        <Text style={dynamicStyles.salaryLabel}>Minimum monthly salary</Text>
        <View style={dynamicStyles.salaryDisplay}>
          <Text style={dynamicStyles.salaryValue}>₹{minSalary.toLocaleString()}</Text>
        </View>
        <View style={dynamicStyles.salaryMarkers}>
          <Text style={dynamicStyles.salaryMarkerText}>0</Text>
          <Text style={dynamicStyles.salaryMarkerText}>15 Lakhs</Text>
        </View>
        <View style={dynamicStyles.salaryButtons}>
          {[0, 20000, 40000, 60000, 80000, 100000].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                dynamicStyles.salaryButton,
                minSalary === value && dynamicStyles.salaryButtonActive,
              ]}
              onPress={() => setMinSalary(value)}
            >
              <Text
                style={[
                  dynamicStyles.salaryButtonText,
                  minSalary === value && dynamicStyles.salaryButtonTextActive,
                ]}
              >
                ₹{value / 1000}K
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Work Mode Filter */}
      <View style={dynamicStyles.filterSection}>
        <Text style={dynamicStyles.filterSectionTitle}>Work Mode</Text>
        {workModeOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={dynamicStyles.checkboxOption}
            onPress={() => toggleWorkMode(option.id)}
          >
            <View style={dynamicStyles.checkbox}>
              {workMode.includes(option.id) && (
                <Ionicons name="checkmark" size={isPhone ? 14 : 16} color={colors.primary} />
              )}
            </View>
            <Ionicons name={option.icon} size={isPhone ? 16 : 18} color={colors.textSecondary} />
            <Text style={dynamicStyles.checkboxLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Work Type Filter */}
      <View style={dynamicStyles.filterSection}>
        <Text style={dynamicStyles.filterSectionTitle}>Work Type</Text>
        {workTypeOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={dynamicStyles.checkboxOption}
            onPress={() => toggleWorkType(option.id)}
          >
            <View style={dynamicStyles.checkbox}>
              {workType.includes(option.id) && (
                <Ionicons name="checkmark" size={isPhone ? 14 : 16} color={colors.primary} />
              )}
            </View>
            <Ionicons name={option.icon} size={isPhone ? 16 : 18} color={colors.textSecondary} />
            <Text style={dynamicStyles.checkboxLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Work Shift Filter */}
      <View style={dynamicStyles.filterSection}>
        <Text style={dynamicStyles.filterSectionTitle}>Work Shift</Text>
        {workShiftOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={dynamicStyles.checkboxOption}
            onPress={() => toggleWorkShift(option.id)}
          >
            <View style={dynamicStyles.checkbox}>
              {workShift.includes(option.id) && (
                <Ionicons name="checkmark" size={isPhone ? 14 : 16} color={colors.primary} />
              )}
            </View>
            <Ionicons name={option.icon} size={isPhone ? 16 : 18} color={colors.textSecondary} />
            <Text style={dynamicStyles.checkboxLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort By Filter */}
      <View style={dynamicStyles.filterSection}>
        <Text style={dynamicStyles.filterSectionTitle}>Sort By</Text>
        {sortByOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={dynamicStyles.radioOption}
            onPress={() => setSortBy(option.id)}
          >
            <View style={dynamicStyles.radioButton}>
              {sortBy === option.id && <View style={dynamicStyles.radioButtonSelected} />}
            </View>
            <Text style={dynamicStyles.radioLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
    );
  };

  const renderJobsList = () => {
    const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);
    return (
    <View style={dynamicStyles.jobsListContainer}>
      {loading ? (
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading jobs...</Text>
        </View>
      ) : jobs.length > 0 ? (
        <>
          <Text style={dynamicStyles.resultsCount}>{jobs.length} jobs found</Text>
          
          {/* Advertisement - Top of job listings */}
          <AdvertisementWidget 
            position="content-top" 
            page="jobs"
            containerStyle={dynamicStyles.adContainer}
          />
          
          {jobs.map((job, index) => (
            <React.Fragment key={job._id}>
              <View style={dynamicStyles.jobCardWrapper}>
                <JobCard job={job} />
              </View>
              {/* Show ad after every 5 jobs */}
              {(index + 1) % 5 === 0 && index < jobs.length - 1 && (
                <AdvertisementWidget 
                  position="content-middle" 
                  page="jobs"
                  containerStyle={dynamicStyles.adContainer}
                />
              )}
            </React.Fragment>
          ))}
          
          {/* Advertisement - Bottom of job listings */}
          {jobs.length > 3 && (
            <AdvertisementWidget 
              position="content-bottom" 
              page="jobs"
              containerStyle={dynamicStyles.adContainer}
            />
          )}
        </>
      ) : (
        <View style={dynamicStyles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={isPhone ? 48 : (isMobile ? 56 : 64)} color={colors.textLight} />
          <Text style={dynamicStyles.emptyText}>No jobs found</Text>
          <Text style={dynamicStyles.emptySubtext}>Try adjusting your search filters</Text>
        </View>
      )}
    </View>
    );
  };

  const renderFilterModal = () => {
    const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);
    return (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={dynamicStyles.modalOverlay}>
        <View style={dynamicStyles.modalContent}>
          <View style={dynamicStyles.modalHeader}>
            <Text style={dynamicStyles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={isPhone ? 20 : 24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={dynamicStyles.modalScroll}>
            {renderSidebarFilters()}
          </ScrollView>
          <View style={dynamicStyles.modalFooter}>
            <TouchableOpacity style={dynamicStyles.modalApplyButton} onPress={() => setShowFilterModal(false)}>
              <Text style={dynamicStyles.modalApplyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    );
  };

  return (
    <View style={mainStyles.container}>
      <Header />
      
      <ScrollView
        style={mainStyles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderHeroSection()}
        {renderSearchBar()}

        <View style={mainStyles.contentContainer}>
          {isWeb && responsive.width > 768 ? (
            <>
              <View style={mainStyles.sidebarWrapper}>
                {renderSidebarFilters()}
              </View>
              <View style={mainStyles.jobsWrapper}>
                {renderJobsList()}
              </View>
            </>
          ) : (
            <>
              {!isWeb && (
                <TouchableOpacity
                  style={mainStyles.mobileFilterButton}
                  onPress={() => setShowFilterModal(true)}
                >
                  <Ionicons name="filter" size={isPhone ? 18 : 20} color={colors.textWhite} />
                  <Text style={mainStyles.mobileFilterText}>Filters</Text>
                </TouchableOpacity>
              )}
              {renderJobsList()}
            </>
          )}
        </View>
      </ScrollView>

      {renderFilterModal()}
      
      {/* Experience Dropdown Modal for Mobile */}
      <Modal
        visible={showExperienceMenu && (isPhone || isMobile)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExperienceMenu(false)}
      >
        <TouchableOpacity
          style={mainStyles.experienceModalOverlay}
          activeOpacity={1}
          onPress={() => setShowExperienceMenu(false)}
        >
          <View style={mainStyles.experienceModalContent}>
            <View style={mainStyles.experienceModalHeader}>
              <Text style={mainStyles.experienceModalTitle}>Select Experience</Text>
              <TouchableOpacity onPress={() => setShowExperienceMenu(false)}>
                <Ionicons name="close" size={isPhone ? 20 : 24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={mainStyles.experienceModalScroll}
              showsVerticalScrollIndicator={false}
            >
              {experienceOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    mainStyles.experienceModalOption,
                    index === experienceOptions.length - 1 && mainStyles.experienceModalOptionLast,
                    selectedExperience === option && mainStyles.experienceModalOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedExperience(option);
                    setShowExperienceMenu(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    mainStyles.experienceModalOptionText,
                    selectedExperience === option && mainStyles.experienceModalOptionTextActive,
                  ]}>
                    {option}
                  </Text>
                  {selectedExperience === option && (
                    <Ionicons name="checkmark" size={isPhone ? 18 : 20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default JobsScreen;
