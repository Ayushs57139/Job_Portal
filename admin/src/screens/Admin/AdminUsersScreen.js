import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal, Platform, Linking } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminUsersScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    allEmployers: 0,
    activeEmployers: 0,
    pendingEmployers: 0,
    directRegisteredEmployers: 0,
    jobPostRegisteredEmployers: 0,
    blockedEmployers: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    pendingCompanies: 0,
    blockedCompanies: 0,
    totalConsultancies: 0,
    activeConsultancies: 0,
    pendingConsultancies: 0,
    blockedConsultancies: 0,
    // Job Seekers Stats
    allCandidates: 0,
    activeCandidates: 0,
    pendingCandidates: 0,
    blockedCandidates: 0,
    excelImportedCandidates: 0,
    jobAppliedCandidates: 0,
    directRegisteredCandidates: 0,
    eventJobAppliedCandidates: 0,
  });
  const [dateFilter, setDateFilter] = useState('ALL');
  const [customDateModalVisible, setCustomDateModalVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, JOBSEEKERS, COMPANIES, CONSULTANCIES
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [importExportLoading, setImportExportLoading] = useState(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'JOBSEEKER',
    employerType: ''
  });
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [selectedUserForLabel, setSelectedUserForLabel] = useState(null);
  const [selectedLabels, setSelectedLabels] = useState([]);

  // Company/Consultancy Label Configuration
  const COMPANY_LABELS = [
    { id: 'premium', name: 'Premium Company', color: '#FFD700', icon: 'star', bgColor: '#FFF9E6' },
    { id: 'starred', name: 'Starred Company', color: '#FF6B6B', icon: 'star-outline', bgColor: '#FFE6E6' },
    { id: 'featured', name: 'Featured Company', color: '#4A90E2', icon: 'ribbon', bgColor: '#E6F2FF' },
    { id: 'actively_hiring', name: 'Actively Hiring', color: '#27AE60', icon: 'briefcase', bgColor: '#E6F7EE' },
    { id: 'urgent', name: 'Urgent Company', color: '#E74C3C', icon: 'alert-circle', bgColor: '#FFE6E6' },
    { id: 'verified_employer', name: 'Verified Employer', color: '#9B59B6', icon: 'checkmark-circle', bgColor: '#F3E6FF' },
    { id: 'top_rated', name: 'Top Rated', color: '#F39C12', icon: 'trophy', bgColor: '#FFF3E0' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterRole, users, dateFilter, customStartDate, customEndDate, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/users?limit=10000`, { headers });
      const data = await response.json();
      
      // Log resume data for debugging
      if (data.users && data.users.length > 0) {
        console.log('Fetched users with resume data:', data.users.map(u => ({
          name: u.name,
          email: u.email,
          resume: u.resume || 'No resume'
        })));
      }
      
      setUsers(data.users || []);
      calculateStats(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const newStats = {
      allEmployers: 0,
      activeEmployers: 0,
      pendingEmployers: 0,
      directRegisteredEmployers: 0,
      jobPostRegisteredEmployers: 0,
      blockedEmployers: 0,
      totalCompanies: 0,
      activeCompanies: 0,
      pendingCompanies: 0,
      blockedCompanies: 0,
      totalConsultancies: 0,
      activeConsultancies: 0,
      pendingConsultancies: 0,
      blockedConsultancies: 0,
      // Job Seekers Stats
      allCandidates: 0,
      activeCandidates: 0,
      pendingCandidates: 0,
      blockedCandidates: 0,
      excelImportedCandidates: 0,
      jobAppliedCandidates: 0,
      directRegisteredCandidates: 0,
      eventJobAppliedCandidates: 0,
    };

    usersData.forEach(user => {
      // Job Seekers / Candidates Stats
      if (user.role === 'JOBSEEKER') {
        newStats.allCandidates++;
        
        // Active/Pending/Blocked Candidates
        if (user.isActive && user.isVerified) {
          newStats.activeCandidates++;
        } else if (!user.isVerified) {
          newStats.pendingCandidates++;
        } else if (!user.isActive) {
          newStats.blockedCandidates++;
        }

        // Excel Imported Candidates
        if (user.importSource === 'excel' || user.isImported) {
          newStats.excelImportedCandidates++;
        }

        // Job Applied Candidates
        if (user.hasAppliedToJobs || (user.applicationCount && user.applicationCount > 0)) {
          newStats.jobAppliedCandidates++;
        }

        // Direct Registered Candidates
        if (user.registrationType === 'direct' || !user.registrationType) {
          newStats.directRegisteredCandidates++;
        }

        // Event Job Applied Candidates
        if (user.registrationType === 'event' || user.eventRegistration) {
          newStats.eventJobAppliedCandidates++;
        }
      }

      // All Employers
      if (user.role === 'EMPLOYER') {
        newStats.allEmployers++;
        
        // Active/Pending/Blocked Employers
        if (user.isActive && user.isVerified) {
          newStats.activeEmployers++;
        } else if (!user.isVerified) {
          newStats.pendingEmployers++;
        } else if (!user.isActive) {
          newStats.blockedEmployers++;
        }

        // Direct vs Job Post Registered
        if (user.registrationType === 'direct') {
          newStats.directRegisteredEmployers++;
        } else if (user.registrationType === 'jobpost') {
          newStats.jobPostRegisteredEmployers++;
        }

        // Companies
        if (user.employerType === 'company') {
          newStats.totalCompanies++;
          if (user.isActive && user.isVerified) {
            newStats.activeCompanies++;
          } else if (!user.isVerified) {
            newStats.pendingCompanies++;
          } else if (!user.isActive) {
            newStats.blockedCompanies++;
          }
        }

        // Consultancies
        if (user.employerType === 'consultancy') {
          newStats.totalConsultancies++;
          if (user.isActive && user.isVerified) {
            newStats.activeConsultancies++;
          } else if (!user.isVerified) {
            newStats.pendingConsultancies++;
          } else if (!user.isActive) {
            newStats.blockedConsultancies++;
          }
        }
      }
    });

    setStats(newStats);
  };

  const getDateRangeFilter = () => {
    const now = new Date();
    let startDate = null;

    switch (dateFilter) {
      case 'LAST_24_HOURS':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'LAST_7_DAYS':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_14_DAYS':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_30_DAYS':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_90_DAYS':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_120_DAYS':
        startDate = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_6_MONTHS':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'LAST_9_MONTHS':
        startDate = new Date(now.getFullYear(), now.getMonth() - 9, now.getDate());
        break;
      case 'LAST_12_MONTHS':
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
        break;
      case 'CUSTOM':
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate + 'T23:59:59')
          };
        }
        return null;
      default:
        return null;
    }

    return startDate ? { start: startDate, end: now } : null;
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Tab filter - Apply first to narrow down the dataset
    if (activeTab !== 'ALL') {
      switch (activeTab) {
        case 'JOBSEEKERS':
          filtered = filtered.filter(user => user.role === 'JOBSEEKER');
          break;
        case 'COMPANIES':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.employerType === 'company');
          break;
        case 'CONSULTANCIES':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.employerType === 'consultancy');
          break;
        default:
          break;
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range filter
    if (dateFilter !== 'ALL') {
      const dateRange = getDateRangeFilter();
      if (dateRange) {
        filtered = filtered.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate >= dateRange.start && userDate <= dateRange.end;
        });
      }
    }

    // Role filter (only if not already filtered by tab)
    if (filterRole !== 'ALL' && activeTab === 'ALL') {
      switch (filterRole) {
        case 'JOBSEEKER':
          filtered = filtered.filter(user => user.role === 'JOBSEEKER');
          break;
        case 'ALL_EMPLOYERS':
          filtered = filtered.filter(user => user.role === 'EMPLOYER');
          break;
        case 'ACTIVE_EMPLOYERS':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.isActive && user.isVerified);
          break;
        case 'PENDING_EMPLOYERS':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && !user.isVerified);
          break;
        case 'DIRECT_REGISTERED_EMPLOYERS':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.registrationType === 'direct');
          break;
        case 'JOBPOST_REGISTERED_EMPLOYERS':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.registrationType === 'jobpost');
          break;
        case 'BLOCKED_EMPLOYERS':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && !user.isActive);
          break;
        case 'TOTAL_COMPANIES':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.employerType === 'company');
          break;
        case 'ACTIVE_COMPANIES':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.employerType === 'company' && user.isActive && user.isVerified);
          break;
        case 'PENDING_COMPANIES':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.employerType === 'company' && !user.isVerified);
          break;
        case 'BLOCKED_COMPANIES':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.employerType === 'company' && !user.isActive);
          break;
        case 'TOTAL_CONSULTANCIES':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.employerType === 'consultancy');
          break;
        case 'ACTIVE_CONSULTANCIES':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.employerType === 'consultancy' && user.isActive && user.isVerified);
          break;
        case 'PENDING_CONSULTANCIES':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.employerType === 'consultancy' && !user.isVerified);
          break;
        case 'BLOCKED_CONSULTANCIES':
          filtered = filtered.filter(user => user.role === 'EMPLOYER' && user.employerType === 'consultancy' && !user.isActive);
          break;
        // Job Seeker specific filters
        case 'ALL_CANDIDATES':
          filtered = filtered.filter(user => user.role === 'JOBSEEKER');
          break;
        case 'ACTIVE_CANDIDATES':
          filtered = filtered.filter(user => user.role === 'JOBSEEKER' && user.isActive && user.isVerified);
          break;
        case 'PENDING_CANDIDATES':
          filtered = filtered.filter(user => user.role === 'JOBSEEKER' && !user.isVerified);
          break;
        case 'BLOCKED_CANDIDATES':
          filtered = filtered.filter(user => user.role === 'JOBSEEKER' && !user.isActive);
          break;
        case 'EXCEL_IMPORTED_CANDIDATES':
          filtered = filtered.filter(user => user.role === 'JOBSEEKER' && (user.importSource === 'excel' || user.isImported));
          break;
        case 'JOB_APPLIED_CANDIDATES':
          filtered = filtered.filter(user => user.role === 'JOBSEEKER' && (user.hasAppliedToJobs || (user.applicationCount && user.applicationCount > 0)));
          break;
        case 'DIRECT_REGISTERED_CANDIDATES':
          filtered = filtered.filter(user => user.role === 'JOBSEEKER' && (user.registrationType === 'direct' || !user.registrationType));
          break;
        case 'EVENT_JOB_APPLIED_CANDIDATES':
          filtered = filtered.filter(user => user.role === 'JOBSEEKER' && (user.registrationType === 'event' || user.eventRegistration));
          break;
        default:
          break;
      }
    }

    setFilteredUsers(filtered);
  };

  const applyCustomDateFilter = () => {
    if (!customStartDate || !customEndDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }

    const start = new Date(customStartDate);
    const end = new Date(customEndDate);

    if (start > end) {
      Alert.alert('Error', 'Start date must be before end date');
      return;
    }

    setDateFilter('CUSTOM');
    setCustomDateModalVisible(false);
  };

  const clearCustomDateFilter = () => {
    setCustomStartDate('');
    setCustomEndDate('');
    setDateFilter('ALL');
    setCustomDateModalVisible(false);
  };

  const renderStatsCards = () => {
    if (activeTab === 'JOBSEEKERS') {
      return (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={dynamicStyles.statsCardsContainer}
          contentContainerStyle={dynamicStyles.statsCardsContent}
        >
          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'ALL_CANDIDATES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('ALL_CANDIDATES')}
          >
            <Ionicons name="people-outline" size={24} color="#3498DB" />
            <Text style={dynamicStyles.statCardValue}>{stats.allCandidates}</Text>
            <Text style={dynamicStyles.statCardLabel}>All Candidates</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'ACTIVE_CANDIDATES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('ACTIVE_CANDIDATES')}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#27AE60" />
            <Text style={dynamicStyles.statCardValue}>{stats.activeCandidates}</Text>
            <Text style={dynamicStyles.statCardLabel}>Active Candidates</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'PENDING_CANDIDATES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('PENDING_CANDIDATES')}
          >
            <Ionicons name="time-outline" size={24} color="#F39C12" />
            <Text style={dynamicStyles.statCardValue}>{stats.pendingCandidates}</Text>
            <Text style={dynamicStyles.statCardLabel}>Pending Candidates</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'BLOCKED_CANDIDATES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('BLOCKED_CANDIDATES')}
          >
            <Ionicons name="ban-outline" size={24} color="#E74C3C" />
            <Text style={dynamicStyles.statCardValue}>{stats.blockedCandidates}</Text>
            <Text style={dynamicStyles.statCardLabel}>Blocked Candidates</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'EXCEL_IMPORTED_CANDIDATES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('EXCEL_IMPORTED_CANDIDATES')}
          >
            <Ionicons name="document-attach-outline" size={24} color="#16A085" />
            <Text style={dynamicStyles.statCardValue}>{stats.excelImportedCandidates}</Text>
            <Text style={dynamicStyles.statCardLabel}>Excel Imported</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'JOB_APPLIED_CANDIDATES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('JOB_APPLIED_CANDIDATES')}
          >
            <Ionicons name="briefcase-outline" size={24} color="#9B59B6" />
            <Text style={dynamicStyles.statCardValue}>{stats.jobAppliedCandidates}</Text>
            <Text style={dynamicStyles.statCardLabel}>Job Applied</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'DIRECT_REGISTERED_CANDIDATES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('DIRECT_REGISTERED_CANDIDATES')}
          >
            <Ionicons name="person-add-outline" size={24} color="#2C3E50" />
            <Text style={dynamicStyles.statCardValue}>{stats.directRegisteredCandidates}</Text>
            <Text style={dynamicStyles.statCardLabel}>Direct Registered</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'EVENT_JOB_APPLIED_CANDIDATES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('EVENT_JOB_APPLIED_CANDIDATES')}
          >
            <Ionicons name="calendar-outline" size={24} color="#E67E22" />
            <Text style={dynamicStyles.statCardValue}>{stats.eventJobAppliedCandidates}</Text>
            <Text style={dynamicStyles.statCardLabel}>Event Job Applied</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    } else if (activeTab === 'COMPANIES') {
      return (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={dynamicStyles.statsCardsContainer}
          contentContainerStyle={dynamicStyles.statsCardsContent}
        >
          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'TOTAL_COMPANIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('TOTAL_COMPANIES')}
          >
            <Ionicons name="business-outline" size={24} color="#2C3E50" />
            <Text style={dynamicStyles.statCardValue}>{stats.totalCompanies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Total Companies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'ACTIVE_COMPANIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('ACTIVE_COMPANIES')}
          >
            <Ionicons name="business" size={24} color="#27AE60" />
            <Text style={dynamicStyles.statCardValue}>{stats.activeCompanies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Active Companies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'PENDING_COMPANIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('PENDING_COMPANIES')}
          >
            <Ionicons name="hourglass-outline" size={24} color="#F39C12" />
            <Text style={dynamicStyles.statCardValue}>{stats.pendingCompanies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Pending Companies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'BLOCKED_COMPANIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('BLOCKED_COMPANIES')}
          >
            <Ionicons name="close-circle-outline" size={24} color="#E74C3C" />
            <Text style={dynamicStyles.statCardValue}>{stats.blockedCompanies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Blocked Companies</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    } else if (activeTab === 'CONSULTANCIES') {
      return (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={dynamicStyles.statsCardsContainer}
          contentContainerStyle={dynamicStyles.statsCardsContent}
        >
          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'TOTAL_CONSULTANCIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('TOTAL_CONSULTANCIES')}
          >
            <Ionicons name="people-outline" size={24} color="#8E44AD" />
            <Text style={dynamicStyles.statCardValue}>{stats.totalConsultancies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Total Consultancies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'ACTIVE_CONSULTANCIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('ACTIVE_CONSULTANCIES')}
          >
            <Ionicons name="people" size={24} color="#27AE60" />
            <Text style={dynamicStyles.statCardValue}>{stats.activeConsultancies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Active Consultancies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'PENDING_CONSULTANCIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('PENDING_CONSULTANCIES')}
          >
            <Ionicons name="timer-outline" size={24} color="#F39C12" />
            <Text style={dynamicStyles.statCardValue}>{stats.pendingConsultancies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Pending Consultancies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'BLOCKED_CONSULTANCIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('BLOCKED_CONSULTANCIES')}
          >
            <Ionicons name="remove-circle-outline" size={24} color="#E74C3C" />
            <Text style={dynamicStyles.statCardValue}>{stats.blockedConsultancies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Blocked Consultancies</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    } else {
      // ALL tab - show all employer stats
      return (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={dynamicStyles.statsCardsContainer}
          contentContainerStyle={dynamicStyles.statsCardsContent}
        >
          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'ALL_EMPLOYERS' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('ALL_EMPLOYERS')}
          >
            <Ionicons name="briefcase-outline" size={24} color="#3498DB" />
            <Text style={dynamicStyles.statCardValue}>{stats.allEmployers}</Text>
            <Text style={dynamicStyles.statCardLabel}>All Employers</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'ACTIVE_EMPLOYERS' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('ACTIVE_EMPLOYERS')}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#27AE60" />
            <Text style={dynamicStyles.statCardValue}>{stats.activeEmployers}</Text>
            <Text style={dynamicStyles.statCardLabel}>Active Employers</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'PENDING_EMPLOYERS' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('PENDING_EMPLOYERS')}
          >
            <Ionicons name="time-outline" size={24} color="#F39C12" />
            <Text style={dynamicStyles.statCardValue}>{stats.pendingEmployers}</Text>
            <Text style={dynamicStyles.statCardLabel}>Pending Employers</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'DIRECT_REGISTERED_EMPLOYERS' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('DIRECT_REGISTERED_EMPLOYERS')}
          >
            <Ionicons name="person-add-outline" size={24} color="#9B59B6" />
            <Text style={dynamicStyles.statCardValue}>{stats.directRegisteredEmployers}</Text>
            <Text style={dynamicStyles.statCardLabel}>Direct Registered</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'JOBPOST_REGISTERED_EMPLOYERS' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('JOBPOST_REGISTERED_EMPLOYERS')}
          >
            <Ionicons name="newspaper-outline" size={24} color="#16A085" />
            <Text style={dynamicStyles.statCardValue}>{stats.jobPostRegisteredEmployers}</Text>
            <Text style={dynamicStyles.statCardLabel}>Job Post Registered</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'BLOCKED_EMPLOYERS' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('BLOCKED_EMPLOYERS')}
          >
            <Ionicons name="ban-outline" size={24} color="#E74C3C" />
            <Text style={dynamicStyles.statCardValue}>{stats.blockedEmployers}</Text>
            <Text style={dynamicStyles.statCardLabel}>Blocked Employers</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'TOTAL_COMPANIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('TOTAL_COMPANIES')}
          >
            <Ionicons name="business-outline" size={24} color="#2C3E50" />
            <Text style={dynamicStyles.statCardValue}>{stats.totalCompanies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Total Companies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'ACTIVE_COMPANIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('ACTIVE_COMPANIES')}
          >
            <Ionicons name="business" size={24} color="#27AE60" />
            <Text style={dynamicStyles.statCardValue}>{stats.activeCompanies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Active Companies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'PENDING_COMPANIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('PENDING_COMPANIES')}
          >
            <Ionicons name="hourglass-outline" size={24} color="#F39C12" />
            <Text style={dynamicStyles.statCardValue}>{stats.pendingCompanies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Pending Companies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'BLOCKED_COMPANIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('BLOCKED_COMPANIES')}
          >
            <Ionicons name="close-circle-outline" size={24} color="#E74C3C" />
            <Text style={dynamicStyles.statCardValue}>{stats.blockedCompanies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Blocked Companies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'TOTAL_CONSULTANCIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('TOTAL_CONSULTANCIES')}
          >
            <Ionicons name="people-outline" size={24} color="#8E44AD" />
            <Text style={dynamicStyles.statCardValue}>{stats.totalConsultancies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Total Consultancies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'ACTIVE_CONSULTANCIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('ACTIVE_CONSULTANCIES')}
          >
            <Ionicons name="people" size={24} color="#27AE60" />
            <Text style={dynamicStyles.statCardValue}>{stats.activeConsultancies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Active Consultancies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'PENDING_CONSULTANCIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('PENDING_CONSULTANCIES')}
          >
            <Ionicons name="timer-outline" size={24} color="#F39C12" />
            <Text style={dynamicStyles.statCardValue}>{stats.pendingConsultancies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Pending Consultancies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterRole === 'BLOCKED_CONSULTANCIES' && dynamicStyles.statCardActive]}
            onPress={() => setFilterRole('BLOCKED_CONSULTANCIES')}
          >
            <Ionicons name="remove-circle-outline" size={24} color="#E74C3C" />
            <Text style={dynamicStyles.statCardValue}>{stats.blockedConsultancies}</Text>
            <Text style={dynamicStyles.statCardLabel}>Blocked Consultancies</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: !currentStatus })
      });
      Alert.alert('Success', 'User status updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    console.log('Delete user clicked:', userId);
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting user:', userId);
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers
              });

              const data = await response.json();
              console.log('Delete response:', data);

              if (response.ok) {
                Alert.alert('Success', 'User deleted successfully');
                fetchUsers();
              } else {
                Alert.alert('Error', data.message || 'Failed to delete user');
              }
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', `Failed to delete user: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleLoginAsUser = async (user) => {
    console.log('🔵 LOGIN BUTTON CLICKED!', user);
    
    const userTypeLabel = user.role === 'EMPLOYER' 
      ? (user.employerType === 'COMPANY' ? 'Company' : user.employerType === 'CONSULTANCY' ? 'Consultancy' : 'Employer')
      : user.role === 'JOBSEEKER' ? 'Job Seeker' : 'User';

    const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

    console.log('User Type:', userTypeLabel);
    console.log('User Name:', userName);

    Alert.alert(
      'Login as User',
      `Are you sure you want to login as this ${userTypeLabel}?\n\nName: ${userName}\nEmail: ${user.email}\nRole: ${user.role}${user.employerType ? `\nType: ${user.employerType}` : ''}\n\nYou will be logged out from admin panel.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Login',
          style: 'default',
          onPress: async () => {
            try {
              console.log('🟢 Attempting to login as user:', user._id);
              const adminToken = await AsyncStorage.getItem('token');
              console.log('Admin token:', adminToken ? 'Found' : 'Not found');
              
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (adminToken) {
                headers['Authorization'] = `Bearer ${adminToken}`;
              }

              const apiUrl = `${API_URL}/admin/login-as-user/${user._id}`;
              console.log('🔵 Making API call to:', apiUrl);
              
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers
              });

              console.log('Response status:', response.status);
              const data = await response.json();
              console.log('🟢 API Response:', data);

              if (response.ok && data.success) {
                // Store user token and data
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('token', data.token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                
                // Remove admin token
                await AsyncStorage.removeItem('adminToken');
                
                console.log('✅ Tokens stored successfully');
                
                // Determine the main app URL
                const mainAppUrl = 'http://localhost:8080';
                
                Alert.alert(
                  '✅ Success!', 
                  `You are now logged in as ${userName} (${userTypeLabel}).\n\n🎯 NEXT STEP:\n\nClick "Open Main App" below and you will be AUTOMATICALLY redirected to the ${userTypeLabel} dashboard.\n\nNo need to login again - just open the app!`,
                  [
                    {
                      text: 'Copy URL',
                      onPress: () => {
                        if (Platform.OS === 'web') {
                          navigator.clipboard.writeText(mainAppUrl);
                          Alert.alert('Copied!', 'Main app URL copied to clipboard');
                        }
                      }
                    },
                    {
                      text: 'Open Main App',
                      onPress: () => {
                        if (Platform.OS === 'web') {
                          // Open in new tab
                          const newWindow = window.open(mainAppUrl, '_blank');
                          if (newWindow) {
                            Alert.alert(
                              '🚀 Main App Opened',
                              `The main app is now opening in a new tab.\n\nYou will be automatically redirected to the ${userTypeLabel} dashboard.`,
                              [{ text: 'OK' }]
                            );
                          } else {
                            Alert.alert(
                              'Popup Blocked',
                              `Please allow popups or manually open:\n${mainAppUrl}\n\nYou will be automatically logged in and redirected to the dashboard.`,
                              [{ text: 'OK' }]
                            );
                          }
                        } else {
                          Linking.openURL(mainAppUrl);
                        }
                      }
                    }
                  ]
                );
              } else {
                console.error('❌ Login failed:', data);
                Alert.alert(
                  'Error', 
                  data.message || 'Failed to login as user.\n\nThe backend API endpoint may not be implemented yet.\n\nPlease implement: POST /api/admin/login-as-user/:userId'
                );
              }
            } catch (error) {
              console.error('❌ Login as user error:', error);
              Alert.alert('Error', `Failed to login as user:\n\n${error.message}\n\nPlease check:\n1. Backend server is running\n2. API endpoint exists\n3. Network connection`);
            }
          }
        }
      ]
    );
  };

  const verifyUser = async (userId) => {
    Alert.alert(
      'Verify User',
      'Are you sure you want to verify this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              const response = await fetch(`${API_URL}/admin/users/${userId}/verify`, {
                method: 'PATCH',
                headers
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Failed to verify user');
              }

              // Update the user in the local state immediately - this will trigger useEffect to update filteredUsers
              setUsers(prevUsers => {
                const updated = prevUsers.map(user => {
                  if (user._id === userId || user.id === userId) {
                    return { ...user, isVerified: true, verifiedAt: data.user?.verifiedAt || new Date() };
                  }
                  return user;
                });
                return updated;
              });

              // Also update filteredUsers directly to ensure immediate UI update
              setFilteredUsers(prevFiltered => {
                return prevFiltered.map(user => {
                  if (user._id === userId || user.id === userId) {
                    return { ...user, isVerified: true, verifiedAt: data.user?.verifiedAt || new Date() };
                  }
                  return user;
                });
              });

              Alert.alert('Success', 'User verified successfully');
              
              // Refresh to ensure data is in sync with backend (after a delay to let UI update first)
              setTimeout(() => {
                fetchUsers();
              }, 1000);
            } catch (error) {
              console.error('Error verifying user:', error);
              Alert.alert('Error', error.message || 'Failed to verify user');
            }
          }
        }
      ]
    );
  };

  // Label Management Functions
  const openLabelModal = (user) => {
    setSelectedUserForLabel(user);
    setSelectedLabels(user.labels || []);
    setLabelModalVisible(true);
  };

  const toggleLabel = (labelId) => {
    setSelectedLabels(prev => {
      if (prev.includes(labelId)) {
        return prev.filter(id => id !== labelId);
      } else {
        return [...prev, labelId];
      }
    });
  };

  const saveLabels = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/users/${selectedUserForLabel._id}/labels`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ labels: selectedLabels })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update labels');
      }

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === selectedUserForLabel._id
            ? { ...user, labels: selectedLabels }
            : user
        )
      );

      setFilteredUsers(prevFiltered =>
        prevFiltered.map(user =>
          user._id === selectedUserForLabel._id
            ? { ...user, labels: selectedLabels }
            : user
        )
      );

      Alert.alert('Success', 'Labels updated successfully');
      setLabelModalVisible(false);
      setSelectedUserForLabel(null);
      setSelectedLabels([]);
    } catch (error) {
      console.error('Error updating labels:', error);
      Alert.alert('Error', error.message || 'Failed to update labels');
    }
  };

  const renderLabelBadges = (labels) => {
    if (!labels || labels.length === 0) return null;

    return (
      <View style={dynamicStyles.labelBadgesContainer}>
        {labels.map(labelId => {
          const label = COMPANY_LABELS.find(l => l.id === labelId);
          if (!label) return null;
          
          return (
            <View 
              key={labelId} 
              style={[
                dynamicStyles.labelBadge,
                { backgroundColor: label.bgColor, borderColor: label.color }
              ]}
            >
              <Ionicons name={label.icon} size={12} color={label.color} />
              <Text style={[dynamicStyles.labelBadgeText, { color: label.color }]}>
                {label.name}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const viewUser = (user) => {
    setSelectedUser(user);
    setViewModalVisible(true);
  };

  const handleAddUser = async () => {
    try {
      // Validate required fields
      if (!newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.password || !newUserData.role) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Validate employerType if role is EMPLOYER
      if (newUserData.role === 'EMPLOYER' && !newUserData.employerType) {
        Alert.alert('Error', 'Please select Company or Consultancy for Employer role');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUserData.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      // Validate password length
      if (newUserData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/users/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newUserData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Create user error response:', data);
        throw new Error(data.message || data.error || 'Failed to create user');
      }

      Alert.alert('Success', 'User created successfully');
      setAddUserModalVisible(false);
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'JOBSEEKER',
        employerType: ''
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.message || 'Failed to create user';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleBulkExport = async () => {
    try {
      setImportExportLoading(true);
      
      // Create CSV content
      const csvHeader = 'Name,Email,Role,Status,Verified,Last Active,Last Modified,Joined Date\n';
      const csvRows = users.map(user => {
        const name = user.name || 'N/A';
        const email = user.email || '';
        const role = user.role || 'N/A';
        const status = user.isActive ? 'ACTIVE' : 'INACTIVE';
        const verified = user.isVerified ? 'Yes' : 'No';
        const lastActive = user.lastActive ? formatDate(user.lastActive) : 'N/A';
        const lastModified = user.lastModified ? formatDate(user.lastModified) : 'N/A';
        const joined = formatDate(user.createdAt);
        return `"${name}","${email}","${role}","${status}","${verified}","${lastActive}","${lastModified}","${joined}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      if (Platform.OS === 'web') {
        // For web, create download link
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `users_export_${Date.now()}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        }
        Alert.alert('Success', 'Users exported successfully');
      } else {
        // For mobile, save and share file
        const fileName = `users_export_${Date.now()}.csv`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(filePath, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath);
          Alert.alert('Success', 'Users exported successfully');
        } else {
          Alert.alert('Info', `File saved to: ${filePath}`);
        }
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      Alert.alert('Error', 'Failed to export users');
    } finally {
      setImportExportLoading(false);
    }
  };

  const handleBulkImport = async () => {
    try {
      setImportExportLoading(true);
      
      if (Platform.OS === 'web') {
        // For web, use file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) {
            setImportExportLoading(false);
            return;
          }

          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const fileContent = event.target.result;
              await processCSVImport(fileContent);
            } catch (error) {
              console.error('Error processing CSV:', error);
              Alert.alert('Error', 'Failed to process CSV file');
              setImportExportLoading(false);
            }
          };
          reader.readAsText(file);
        };
        input.click();
      } else {
        // For mobile
        const result = await DocumentPicker.getDocumentAsync({
          type: 'text/csv',
          copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
          setImportExportLoading(false);
          return;
        }

        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        await processCSVImport(fileContent);
      }
    } catch (error) {
      console.error('Error importing users:', error);
      Alert.alert('Error', 'Failed to import users. Please check file format.');
      setImportExportLoading(false);
    }
  };

  const processCSVImport = async (fileContent) => {
    try {
      // Parse CSV with better handling
      const lines = fileContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        Alert.alert('Error', 'CSV file is empty or invalid');
        setImportExportLoading(false);
        return;
      }

      const csvHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const usersToImport = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          // Better CSV parsing to handle quoted values
          const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));
          
          if (cleanValues.length >= 3) {
            const userObj = {
              name: cleanValues[0],
              email: cleanValues[1],
              role: cleanValues[2].toUpperCase(),
              password: cleanValues[3] || 'DefaultPassword123!',
            };

            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userObj.email)) {
              errors.push(`Line ${i + 1}: Invalid email - ${userObj.email}`);
              continue;
            }

            // Validate role
            if (!['JOBSEEKER', 'EMPLOYER', 'ADMIN'].includes(userObj.role)) {
              errors.push(`Line ${i + 1}: Invalid role - ${userObj.role}`);
              continue;
            }

            usersToImport.push(userObj);
          } else {
            errors.push(`Line ${i + 1}: Insufficient data`);
          }
        } catch (lineError) {
          errors.push(`Line ${i + 1}: Parse error`);
        }
      }

      if (usersToImport.length === 0) {
        Alert.alert('Error', `No valid users found in CSV file.\n\nErrors:\n${errors.slice(0, 5).join('\n')}`);
        setImportExportLoading(false);
        return;
      }

      // Send to backend
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/users/bulk-import`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ users: usersToImport })
      });

      const data = await response.json();
      
      if (response.ok) {
        const successCount = data.imported || data.success || usersToImport.length;
        const failedCount = data.failed || 0;
        let message = `Successfully imported ${successCount} users`;
        
        if (failedCount > 0) {
          message += `\nFailed: ${failedCount}`;
        }
        
        if (errors.length > 0) {
          message += `\n\nSkipped ${errors.length} invalid rows`;
        }

        Alert.alert('Import Complete', message);
        fetchUsers();
      } else {
        Alert.alert('Error', data.message || 'Failed to import users');
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      Alert.alert('Error', 'Failed to process CSV file');
    } finally {
      setImportExportLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleCSV = `Name,Email,Role,Password
John Doe,john@example.com,JOBSEEKER,Password123!
Jane Smith,jane@example.com,EMPLOYER,Password123!
Mike Johnson,mike@example.com,JOBSEEKER,Password123!`;
    
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blob = new Blob([sampleCSV], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample_users_import.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      }
      Alert.alert('Success', 'Sample CSV downloaded');
    } else {
      Alert.alert(
        'Sample CSV Format',
        'CSV should have columns: Name, Email, Role, Password\n\nRoles: JOBSEEKER, EMPLOYER\n\nExample:\nJohn Doe,john@example.com,JOBSEEKER,Pass123!',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDownloadResume = (resumePath) => {
    if (!resumePath) {
      Alert.alert('Error', 'Resume not available');
      return;
    }

    try {
      // Construct the full URL for the resume
      // API_URL is like 'http://localhost:5000/api', we need 'http://localhost:5000'
      let baseUrl = API_URL;
      if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.replace('/api', '');
      } else if (baseUrl.endsWith('/api/')) {
        baseUrl = baseUrl.replace('/api/', '');
      }
      
      // Ensure resumePath starts with /
      const normalizedPath = resumePath.startsWith('/') ? resumePath : `/${resumePath}`;
      const resumeUrl = `${baseUrl}${normalizedPath}`;
      
      if (Platform.OS === 'web') {
        // For web, open in new tab
        if (typeof window !== 'undefined') {
          window.open(resumeUrl, '_blank');
        }
      } else {
        // For mobile, use Linking to open the file
        Linking.openURL(resumeUrl).catch(err => {
          console.error('Error opening resume:', err);
          Alert.alert('Error', 'Could not open resume. Please check the file.');
        });
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      Alert.alert('Error', 'Failed to open resume');
    }
  };

  const dynamicStyles = getStyles(isMobile, isTablet);

  if (loading) {
    return (
      <AdminLayout
        title="Users"
        activeScreen="AdminUsers"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={dynamicStyles.loadingText}>Loading users...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Users"
      activeScreen="AdminUsers"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.headerSection}>
          <View>
            <Text style={dynamicStyles.pageTitle}>User Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage all registered users</Text>
          </View>
          <View style={dynamicStyles.bulkActionsContainer}>
            <TouchableOpacity
              style={dynamicStyles.addUserButton}
              onPress={() => setAddUserModalVisible(true)}
            >
              <Ionicons name="person-add-outline" size={18} color="#FFF" />
              <Text style={dynamicStyles.addUserButtonText}>Add User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.sampleButton}
              onPress={downloadSampleCSV}
              disabled={importExportLoading}
            >
              <Ionicons name="document-text-outline" size={18} color="#9B59B6" />
              <Text style={dynamicStyles.sampleButtonText}>Sample CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.importButton}
              onPress={handleBulkImport}
              disabled={importExportLoading}
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
              <Text style={dynamicStyles.importButtonText}>
                {importExportLoading ? 'Processing...' : 'Import CSV'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.exportButton}
              onPress={handleBulkExport}
              disabled={importExportLoading}
            >
              <Ionicons name="cloud-download-outline" size={18} color="#FFF" />
              <Text style={dynamicStyles.exportButtonText}>
                {importExportLoading ? 'Processing...' : 'Export CSV'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={dynamicStyles.tabNavigation}>
          <TouchableOpacity
            style={[dynamicStyles.tabButton, activeTab === 'ALL' && dynamicStyles.tabButtonActive]}
            onPress={() => {
              setActiveTab('ALL');
              setFilterRole('ALL');
            }}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={activeTab === 'ALL' ? '#FFF' : '#4A90E2'} 
            />
            <Text style={[dynamicStyles.tabButtonText, activeTab === 'ALL' && dynamicStyles.tabButtonTextActive]}>
              All Users
            </Text>
            <View style={[dynamicStyles.tabBadge, activeTab === 'ALL' && dynamicStyles.tabBadgeActive]}>
              <Text style={[dynamicStyles.tabBadgeText, activeTab === 'ALL' && dynamicStyles.tabBadgeTextActive]}>
                {users.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tabButton, activeTab === 'JOBSEEKERS' && dynamicStyles.tabButtonActive]}
            onPress={() => {
              setActiveTab('JOBSEEKERS');
              setFilterRole('ALL');
            }}
          >
            <Ionicons 
              name="person-outline" 
              size={20} 
              color={activeTab === 'JOBSEEKERS' ? '#FFF' : '#27AE60'} 
            />
            <Text style={[dynamicStyles.tabButtonText, activeTab === 'JOBSEEKERS' && dynamicStyles.tabButtonTextActive]}>
              Job Seekers
            </Text>
            <View style={[dynamicStyles.tabBadge, activeTab === 'JOBSEEKERS' && dynamicStyles.tabBadgeActive]}>
              <Text style={[dynamicStyles.tabBadgeText, activeTab === 'JOBSEEKERS' && dynamicStyles.tabBadgeTextActive]}>
                {stats.allCandidates}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tabButton, activeTab === 'COMPANIES' && dynamicStyles.tabButtonActive]}
            onPress={() => {
              setActiveTab('COMPANIES');
              setFilterRole('ALL');
            }}
          >
            <Ionicons 
              name="business-outline" 
              size={20} 
              color={activeTab === 'COMPANIES' ? '#FFF' : '#E67E22'} 
            />
            <Text style={[dynamicStyles.tabButtonText, activeTab === 'COMPANIES' && dynamicStyles.tabButtonTextActive]}>
              Companies
            </Text>
            <View style={[dynamicStyles.tabBadge, activeTab === 'COMPANIES' && dynamicStyles.tabBadgeActive]}>
              <Text style={[dynamicStyles.tabBadgeText, activeTab === 'COMPANIES' && dynamicStyles.tabBadgeTextActive]}>
                {stats.totalCompanies}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tabButton, activeTab === 'CONSULTANCIES' && dynamicStyles.tabButtonActive]}
            onPress={() => {
              setActiveTab('CONSULTANCIES');
              setFilterRole('ALL');
            }}
          >
            <Ionicons 
              name="people-outline" 
              size={20} 
              color={activeTab === 'CONSULTANCIES' ? '#FFF' : '#9B59B6'} 
            />
            <Text style={[dynamicStyles.tabButtonText, activeTab === 'CONSULTANCIES' && dynamicStyles.tabButtonTextActive]}>
              Consultancies
            </Text>
            <View style={[dynamicStyles.tabBadge, activeTab === 'CONSULTANCIES' && dynamicStyles.tabBadgeActive]}>
              <Text style={[dynamicStyles.tabBadgeText, activeTab === 'CONSULTANCIES' && dynamicStyles.tabBadgeTextActive]}>
                {stats.totalConsultancies}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.filterSection}>
          <View style={dynamicStyles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={dynamicStyles.searchIcon} />
            <TextInput
              style={dynamicStyles.searchInput}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Date Filter Section */}
          <View style={dynamicStyles.dateFilterSection}>
            <View style={dynamicStyles.dateFilterHeader}>
              <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
              <Text style={dynamicStyles.dateFilterTitle}>Date Range Filter</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={dynamicStyles.dateFilterScroll}
              contentContainerStyle={dynamicStyles.dateFilterContent}
            >
              <TouchableOpacity
                style={[dynamicStyles.dateFilterButton, dateFilter === 'ALL' && dynamicStyles.dateFilterButtonActive]}
                onPress={() => setDateFilter('ALL')}
              >
                <Text style={[dynamicStyles.dateFilterButtonText, dateFilter === 'ALL' && dynamicStyles.dateFilterButtonTextActive]}>
                  All Time
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.dateFilterButton, dateFilter === 'LAST_24_HOURS' && dynamicStyles.dateFilterButtonActive]}
                onPress={() => setDateFilter('LAST_24_HOURS')}
              >
                <Text style={[dynamicStyles.dateFilterButtonText, dateFilter === 'LAST_24_HOURS' && dynamicStyles.dateFilterButtonTextActive]}>
                  Last 24 Hours
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.dateFilterButton, dateFilter === 'LAST_7_DAYS' && dynamicStyles.dateFilterButtonActive]}
                onPress={() => setDateFilter('LAST_7_DAYS')}
              >
                <Text style={[dynamicStyles.dateFilterButtonText, dateFilter === 'LAST_7_DAYS' && dynamicStyles.dateFilterButtonTextActive]}>
                  Last 7 Days
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.dateFilterButton, dateFilter === 'LAST_14_DAYS' && dynamicStyles.dateFilterButtonActive]}
                onPress={() => setDateFilter('LAST_14_DAYS')}
              >
                <Text style={[dynamicStyles.dateFilterButtonText, dateFilter === 'LAST_14_DAYS' && dynamicStyles.dateFilterButtonTextActive]}>
                  Last 14 Days
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.dateFilterButton, dateFilter === 'LAST_30_DAYS' && dynamicStyles.dateFilterButtonActive]}
                onPress={() => setDateFilter('LAST_30_DAYS')}
              >
                <Text style={[dynamicStyles.dateFilterButtonText, dateFilter === 'LAST_30_DAYS' && dynamicStyles.dateFilterButtonTextActive]}>
                  Last 30 Days
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.dateFilterButton, dateFilter === 'LAST_90_DAYS' && dynamicStyles.dateFilterButtonActive]}
                onPress={() => setDateFilter('LAST_90_DAYS')}
              >
                <Text style={[dynamicStyles.dateFilterButtonText, dateFilter === 'LAST_90_DAYS' && dynamicStyles.dateFilterButtonTextActive]}>
                  Last 90 Days
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.dateFilterButton, dateFilter === 'LAST_120_DAYS' && dynamicStyles.dateFilterButtonActive]}
                onPress={() => setDateFilter('LAST_120_DAYS')}
              >
                <Text style={[dynamicStyles.dateFilterButtonText, dateFilter === 'LAST_120_DAYS' && dynamicStyles.dateFilterButtonTextActive]}>
                  Last 120 Days
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.dateFilterButton, dateFilter === 'LAST_6_MONTHS' && dynamicStyles.dateFilterButtonActive]}
                onPress={() => setDateFilter('LAST_6_MONTHS')}
              >
                <Text style={[dynamicStyles.dateFilterButtonText, dateFilter === 'LAST_6_MONTHS' && dynamicStyles.dateFilterButtonTextActive]}>
                  Last 6 Months
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.dateFilterButton, dateFilter === 'LAST_9_MONTHS' && dynamicStyles.dateFilterButtonActive]}
                onPress={() => setDateFilter('LAST_9_MONTHS')}
              >
                <Text style={[dynamicStyles.dateFilterButtonText, dateFilter === 'LAST_9_MONTHS' && dynamicStyles.dateFilterButtonTextActive]}>
                  Last 9 Months
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.dateFilterButton, dateFilter === 'LAST_12_MONTHS' && dynamicStyles.dateFilterButtonActive]}
                onPress={() => setDateFilter('LAST_12_MONTHS')}
              >
                <Text style={[dynamicStyles.dateFilterButtonText, dateFilter === 'LAST_12_MONTHS' && dynamicStyles.dateFilterButtonTextActive]}>
                  Last 12 Months
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.dateFilterButton, dynamicStyles.customDateButton, dateFilter === 'CUSTOM' && dynamicStyles.dateFilterButtonActive]}
                onPress={() => setCustomDateModalVisible(true)}
              >
                <Ionicons name="calendar" size={16} color={dateFilter === 'CUSTOM' ? '#FFF' : '#4A90E2'} />
                <Text style={[dynamicStyles.dateFilterButtonText, dateFilter === 'CUSTOM' && dynamicStyles.dateFilterButtonTextActive]}>
                  Custom Date
                </Text>
              </TouchableOpacity>
            </ScrollView>
            {dateFilter === 'CUSTOM' && customStartDate && customEndDate && (
              <View style={dynamicStyles.customDateDisplay}>
                <Text style={dynamicStyles.customDateText}>
                  {formatDate(customStartDate)} - {formatDate(customEndDate)}
                </Text>
                <TouchableOpacity onPress={clearCustomDateFilter}>
                  <Ionicons name="close-circle" size={20} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Stats Cards - Dynamic based on active tab */}
          {renderStatsCards()}

          <View style={dynamicStyles.filterButtons}>
            <TouchableOpacity
              style={[dynamicStyles.filterButton, filterRole === 'ALL' && dynamicStyles.activeFilter]}
              onPress={() => setFilterRole('ALL')}
            >
              <Text style={[dynamicStyles.filterButtonText, filterRole === 'ALL' && dynamicStyles.activeFilterText]}>
                All
              </Text>
            </TouchableOpacity>
            {activeTab === 'ALL' && (
              <>
                <TouchableOpacity
                  style={[dynamicStyles.filterButton, filterRole === 'JOBSEEKER' && dynamicStyles.activeFilter]}
                  onPress={() => setFilterRole('JOBSEEKER')}
                >
                  <Text style={[dynamicStyles.filterButtonText, filterRole === 'JOBSEEKER' && dynamicStyles.activeFilterText]}>
                    Job Seekers
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.filterButton, filterRole === 'ALL_EMPLOYERS' && dynamicStyles.activeFilter]}
                  onPress={() => setFilterRole('ALL_EMPLOYERS')}
                >
                  <Text style={[dynamicStyles.filterButtonText, filterRole === 'ALL_EMPLOYERS' && dynamicStyles.activeFilterText]}>
                    All Employers
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={dynamicStyles.statsBar}>
          <Text style={dynamicStyles.statsText}>Total Users: {filteredUsers.length}</Text>
        </View>

        <ScrollView style={dynamicStyles.tableContainer} showsVerticalScrollIndicator={false}>
          <View style={dynamicStyles.table}>
            {!isMobile && (
            <View style={dynamicStyles.tableHeader}>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.nameColumn]}>Name</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.emailColumn]}>Email</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.roleColumn]}>Role</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.verifiedColumn]}>Verified</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.statusColumn]}>Status</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.resumeColumn, { textAlign: 'center' }]}>Resume</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.lastActiveColumn]}>Last Active</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.joinedColumn]}>Joined</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.actionsColumn]}>Actions</Text>
            </View>
            )}

            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <View key={user._id || index} style={isMobile ? dynamicStyles.mobileCard : dynamicStyles.tableRow}>
                  <View style={dynamicStyles.nameColumn}>
                    <Text style={[dynamicStyles.tableCellText, dynamicStyles.nameText]}>
                      {user.name || 'N/A'}
                    </Text>
                    {/* Show labels for companies and consultancies */}
                    {user.role === 'EMPLOYER' && renderLabelBadges(user.labels)}
                  </View>
                  <Text style={[dynamicStyles.tableCellText, dynamicStyles.emailColumn]}>
                    {user.email || 'N/A'}
                  </Text>
                  <View style={dynamicStyles.roleColumn}>
                    <View style={[
                      dynamicStyles.roleBadge,
                      user.role === 'JOBSEEKER' && dynamicStyles.jobseekerBadge,
                      user.role === 'EMPLOYER' && dynamicStyles.employerBadge,
                    ]}>
                      <Text style={dynamicStyles.roleBadgeText}>{user.role || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={dynamicStyles.verifiedColumn}>
                    <View style={[
                      dynamicStyles.verifiedBadge,
                      user.isVerified ? dynamicStyles.verifiedYes : dynamicStyles.verifiedNo,
                    ]}>
                      <Ionicons 
                        name={user.isVerified ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={user.isVerified ? '#27AE60' : '#E74C3C'} 
                      />
                      <Text style={[
                        dynamicStyles.verifiedText,
                        user.isVerified ? dynamicStyles.verifiedYesText : dynamicStyles.verifiedNoText
                      ]}>
                        {user.isVerified ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  </View>
                  <View style={dynamicStyles.statusColumn}>
                    <TouchableOpacity
                      style={[
                        dynamicStyles.statusBadge,
                        user.isActive ? dynamicStyles.activeBadge : dynamicStyles.inactiveBadge,
                      ]}
                      onPress={() => toggleUserStatus(user._id, user.isActive)}
                    >
                      <Text style={dynamicStyles.statusBadgeText}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={dynamicStyles.resumeColumn}>
                    {user.resume && user.resume.trim() !== '' ? (
                      <TouchableOpacity
                        style={dynamicStyles.resumeButton}
                        onPress={() => handleDownloadResume(user.resume)}
                      >
                        <Ionicons name="document-text-outline" size={18} color="#4A90E2" />
                        <Text style={dynamicStyles.resumeButtonText}>View Resume</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={dynamicStyles.resumeNA}>
                        <Ionicons name="document-outline" size={16} color="#999" />
                        <Text style={dynamicStyles.resumeNAText}>No Resume</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[dynamicStyles.tableCellText, dynamicStyles.lastActiveColumn]}>
                    {user.lastActive ? formatDate(user.lastActive) : 'Never'}
                  </Text>
                  <Text style={[dynamicStyles.tableCellText, dynamicStyles.joinedColumn]}>
                    {formatDate(user.createdAt)}
                  </Text>
                  <View style={dynamicStyles.actionsColumn}>
                    <TouchableOpacity
                      style={dynamicStyles.actionButton}
                      onPress={() => viewUser(user)}
                    >
                      <Ionicons name="eye-outline" size={18} color="#4A90E2" />
                    </TouchableOpacity>
                    {/* Show Manage Labels button only for companies and consultancies */}
                    {user.role === 'EMPLOYER' && (
                      <TouchableOpacity
                        style={[dynamicStyles.actionButton, dynamicStyles.labelButton]}
                        onPress={() => openLabelModal(user)}
                      >
                        <Ionicons name="pricetag-outline" size={18} color="#F39C12" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[dynamicStyles.actionButton, dynamicStyles.loginAsUserButton]}
                      onPress={() => handleLoginAsUser(user)}
                    >
                      <Ionicons name="log-in-outline" size={18} color="#28a745" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[dynamicStyles.actionButton, dynamicStyles.deleteButton]}
                      onPress={() => deleteUser(user._id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={dynamicStyles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#CCC" />
                <Text style={dynamicStyles.emptyStateText}>No users found</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* View User Modal */}
        <Modal
          visible={viewModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setViewModalVisible(false)}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalOverlay}
            activeOpacity={1}
            onPress={() => setViewModalVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>User Details</Text>
                <TouchableOpacity
                  onPress={() => setViewModalVisible(false)}
                  style={dynamicStyles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              {selectedUser && (
                <ScrollView style={dynamicStyles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Name:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedUser.name || 'N/A'}</Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Email:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedUser.email || 'N/A'}</Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Phone:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedUser.phone || 'N/A'}</Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Role:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedUser.role || 'N/A'}</Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Verified:</Text>
                    <View style={{ flex: 2, alignItems: 'flex-end' }}>
                      <View style={[
                        dynamicStyles.verifiedBadge,
                        selectedUser.isVerified ? dynamicStyles.verifiedYes : dynamicStyles.verifiedNo,
                      ]}>
                        <Ionicons 
                          name={selectedUser.isVerified ? 'checkmark-circle' : 'close-circle'} 
                          size={16} 
                          color={selectedUser.isVerified ? '#27AE60' : '#E74C3C'} 
                        />
                        <Text style={[
                          dynamicStyles.verifiedText,
                          selectedUser.isVerified ? dynamicStyles.verifiedYesText : dynamicStyles.verifiedNoText
                        ]}>
                          {selectedUser.isVerified ? 'Yes' : 'No'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Status:</Text>
                    <View style={{ flex: 2, alignItems: 'flex-end' }}>
                      <View style={[
                        dynamicStyles.statusBadge,
                        selectedUser.isActive ? dynamicStyles.activeBadge : dynamicStyles.inactiveBadge,
                      ]}>
                        <Text style={dynamicStyles.statusBadgeText}>
                          {selectedUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Last Active:</Text>
                    <Text style={dynamicStyles.detailValue}>
                      {selectedUser.lastActive ? formatDate(selectedUser.lastActive) : 'Never'}
                    </Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Last Modified:</Text>
                    <Text style={dynamicStyles.detailValue}>
                      {selectedUser.lastModified ? formatDate(selectedUser.lastModified) : 'N/A'}
                    </Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Joined:</Text>
                    <Text style={dynamicStyles.detailValue}>{formatDate(selectedUser.createdAt)}</Text>
                  </View>
                  <View style={[dynamicStyles.detailRow, { marginTop: 8, marginBottom: 8 }]}>
                    <Text style={dynamicStyles.detailLabel}>Resume:</Text>
                    <View style={{ flex: 2, alignItems: 'flex-end' }}>
                      {selectedUser.resume && selectedUser.resume.trim() !== '' ? (
                        <TouchableOpacity
                          style={dynamicStyles.resumeDownloadButton}
                          onPress={() => handleDownloadResume(selectedUser.resume)}
                        >
                          <Ionicons name="download-outline" size={isMobile ? 18 : isTablet ? 20 : 22} color="#FFF" />
                          <Text style={dynamicStyles.resumeDownloadText}>Download Resume</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={dynamicStyles.resumeNAModal}>
                          <Ionicons name="document-outline" size={isMobile ? 16 : isTablet ? 18 : 20} color="#6B7280" />
                          <Text style={dynamicStyles.resumeNAModalText}>No resume uploaded</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Add User Modal */}
        <Modal
          visible={addUserModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAddUserModalVisible(false)}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalOverlay}
            activeOpacity={1}
            onPress={() => setAddUserModalVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Add New User</Text>
                <TouchableOpacity
                  onPress={() => setAddUserModalVisible(false)}
                  style={dynamicStyles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={dynamicStyles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>First Name *</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="Enter first name"
                    value={newUserData.firstName}
                    onChangeText={(text) => setNewUserData({...newUserData, firstName: text})}
                  />
                </View>

                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Last Name *</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="Enter last name"
                    value={newUserData.lastName}
                    onChangeText={(text) => setNewUserData({...newUserData, lastName: text})}
                  />
                </View>

                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Email *</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="Enter email address"
                    value={newUserData.email}
                    onChangeText={(text) => setNewUserData({...newUserData, email: text})}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Phone</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="Enter phone number"
                    value={newUserData.phone}
                    onChangeText={(text) => setNewUserData({...newUserData, phone: text})}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Password *</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="Enter password (min 6 characters)"
                    value={newUserData.password}
                    onChangeText={(text) => setNewUserData({...newUserData, password: text})}
                    secureTextEntry
                  />
                </View>

                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Role *</Text>
                  <View style={dynamicStyles.roleSelector}>
                    <TouchableOpacity
                      style={[
                        dynamicStyles.roleOption,
                        newUserData.role === 'JOBSEEKER' && dynamicStyles.roleOptionActive
                      ]}
                      onPress={() => setNewUserData({...newUserData, role: 'JOBSEEKER'})}
                    >
                      <Text style={[
                        dynamicStyles.roleOptionText,
                        newUserData.role === 'JOBSEEKER' && dynamicStyles.roleOptionTextActive
                      ]}>
                        Job Seeker
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        dynamicStyles.roleOption,
                        newUserData.role === 'EMPLOYER' && dynamicStyles.roleOptionActive
                      ]}
                      onPress={() => setNewUserData({...newUserData, role: 'EMPLOYER', employerType: newUserData.employerType || ''})}
                    >
                      <Text style={[
                        dynamicStyles.roleOptionText,
                        newUserData.role === 'EMPLOYER' && dynamicStyles.roleOptionTextActive
                      ]}>
                        Employer
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {newUserData.role === 'EMPLOYER' && (
                  <View style={dynamicStyles.formGroup}>
                    <Text style={dynamicStyles.formLabel}>Employer Type *</Text>
                    <View style={dynamicStyles.roleSelector}>
                      <TouchableOpacity
                        style={[
                          dynamicStyles.roleOption,
                          newUserData.employerType === 'company' && dynamicStyles.roleOptionActive
                        ]}
                        onPress={() => setNewUserData({...newUserData, employerType: 'company'})}
                      >
                        <Text style={[
                          dynamicStyles.roleOptionText,
                          newUserData.employerType === 'company' && dynamicStyles.roleOptionTextActive
                        ]}>
                          Company
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          dynamicStyles.roleOption,
                          newUserData.employerType === 'consultancy' && dynamicStyles.roleOptionActive
                        ]}
                        onPress={() => setNewUserData({...newUserData, employerType: 'consultancy'})}
                      >
                        <Text style={[
                          dynamicStyles.roleOptionText,
                          newUserData.employerType === 'consultancy' && dynamicStyles.roleOptionTextActive
                        ]}>
                          Consultancy
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={dynamicStyles.submitButton}
                  onPress={handleAddUser}
                >
                  <Ionicons name="person-add" size={20} color="#FFF" />
                  <Text style={dynamicStyles.submitButtonText}>Create User</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Custom Date Filter Modal */}
        <Modal
          visible={customDateModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCustomDateModalVisible(false)}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCustomDateModalVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
            <View style={[dynamicStyles.modalContent, { height: 'auto', maxHeight: isMobile ? '80%' : '60%' }]}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Custom Date Range</Text>
                <TouchableOpacity
                  onPress={() => setCustomDateModalVisible(false)}
                  style={dynamicStyles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <View style={dynamicStyles.modalBody}>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Start Date *</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="YYYY-MM-DD"
                    value={customStartDate}
                    onChangeText={setCustomStartDate}
                  />
                  <Text style={dynamicStyles.formHint}>Format: YYYY-MM-DD (e.g., 2024-01-01)</Text>
                </View>

                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>End Date *</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="YYYY-MM-DD"
                    value={customEndDate}
                    onChangeText={setCustomEndDate}
                  />
                  <Text style={dynamicStyles.formHint}>Format: YYYY-MM-DD (e.g., 2024-12-31)</Text>
                </View>

                <View style={dynamicStyles.customDateActions}>
                  <TouchableOpacity
                    style={dynamicStyles.clearButton}
                    onPress={clearCustomDateFilter}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#E74C3C" />
                    <Text style={dynamicStyles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={dynamicStyles.applyButton}
                    onPress={applyCustomDateFilter}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <Text style={dynamicStyles.applyButtonText}>Apply Filter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Label Management Modal */}
        <Modal
          visible={labelModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLabelModalVisible(false)}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalOverlay}
            activeOpacity={1}
            onPress={() => setLabelModalVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[dynamicStyles.modalContent, { maxHeight: isMobile ? '80%' : '70%' }]}>
                <View style={dynamicStyles.modalHeader}>
                  <Text style={dynamicStyles.modalTitle}>Manage Company Labels</Text>
                  <TouchableOpacity
                    onPress={() => setLabelModalVisible(false)}
                    style={dynamicStyles.modalCloseButton}
                  >
                    <Ionicons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={dynamicStyles.modalBody}>
                  {selectedUserForLabel && (
                    <View style={dynamicStyles.labelModalInfo}>
                      <Text style={dynamicStyles.labelModalCompanyName}>
                        {selectedUserForLabel.name || selectedUserForLabel.companyName}
                      </Text>
                      <Text style={dynamicStyles.labelModalCompanyType}>
                        {selectedUserForLabel.employerType === 'company' ? 'Company' : 'Consultancy'}
                      </Text>
                    </View>
                  )}

                  <Text style={dynamicStyles.labelSectionTitle}>Select Labels:</Text>
                  
                  <View style={dynamicStyles.labelOptionsContainer}>
                    {COMPANY_LABELS.map(label => (
                      <TouchableOpacity
                        key={label.id}
                        style={[
                          dynamicStyles.labelOption,
                          selectedLabels.includes(label.id) && dynamicStyles.labelOptionSelected,
                          { borderColor: label.color }
                        ]}
                        onPress={() => toggleLabel(label.id)}
                      >
                        <View style={dynamicStyles.labelOptionContent}>
                          <Ionicons 
                            name={selectedLabels.includes(label.id) ? label.icon : `${label.icon}-outline`} 
                            size={24} 
                            color={label.color} 
                          />
                          <View style={dynamicStyles.labelOptionText}>
                            <Text style={[dynamicStyles.labelOptionName, { color: label.color }]}>
                              {label.name}
                            </Text>
                          </View>
                        </View>
                        {selectedLabels.includes(label.id) && (
                          <Ionicons name="checkmark-circle" size={24} color={label.color} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={dynamicStyles.labelPreviewSection}>
                    <Text style={dynamicStyles.labelPreviewTitle}>Preview:</Text>
                    {selectedLabels.length > 0 ? (
                      <View style={dynamicStyles.labelPreviewContainer}>
                        {renderLabelBadges(selectedLabels)}
                      </View>
                    ) : (
                      <Text style={dynamicStyles.labelPreviewEmpty}>No labels selected</Text>
                    )}
                  </View>
                </ScrollView>

                <View style={dynamicStyles.modalFooter}>
                  <TouchableOpacity
                    style={dynamicStyles.modalCancelButton}
                    onPress={() => {
                      setLabelModalVisible(false);
                      setSelectedUserForLabel(null);
                      setSelectedLabels([]);
                    }}
                  >
                    <Text style={dynamicStyles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={dynamicStyles.modalSaveButton}
                    onPress={saveLabels}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <Text style={dynamicStyles.modalSaveButtonText}>Save Labels</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerSection: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
    gap: isMobile ? 12 : 0,
  },
  tabNavigation: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 8 : 12,
    marginBottom: 20,
    backgroundColor: '#FFF',
    padding: isMobile ? 12 : 16,
    borderRadius: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: isMobile ? 12 : 14,
    paddingHorizontal: isMobile ? 12 : 16,
    borderRadius: 10,
    backgroundColor: '#F5F6FA',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E8EAF0',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  tabButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
    } : {
      elevation: 4,
    }),
  },
  tabButtonText: {
    fontSize: isMobile ? 13 : isTablet ? 14 : 15,
    fontWeight: '600',
    color: '#4A90E2',
  },
  tabButtonTextActive: {
    color: '#FFF',
  },
  tabBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabBadgeText: {
    fontSize: isMobile ? 11 : 12,
    fontWeight: '700',
    color: '#4A90E2',
  },
  tabBadgeTextActive: {
    color: '#FFF',
  },
  pageTitle: {
    fontSize: isMobile ? 22 : isTablet ? 26 : 28,
    fontWeight: 'bold',
    color: '#333',
  },
  pageSubtitle: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#666',
    marginTop: 4,
  },
  bulkActionsContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 8 : 10,
    flexWrap: isMobile ? 'nowrap' : 'wrap',
    ...(Platform.OS === 'web' && {
      flexWrap: isMobile ? 'wrap' : 'nowrap',
    }),
  },
  addUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E67E22',
    paddingVertical: isMobile ? 8 : isTablet ? 9 : 10,
    paddingHorizontal: isMobile ? 12 : isTablet ? 14 : 15,
    borderRadius: 8,
    gap: 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#D35400',
        transform: 'translateY(-1px)',
      },
    }),
  },
  addUserButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '600',
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F4FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 6,
  },
  sampleButtonText: {
    color: '#9B59B6',
    fontSize: 14,
    fontWeight: '600',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 6,
  },
  importButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 6,
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 12 : isTablet ? 14 : 15,
    marginBottom: isMobile ? 12 : isTablet ? 14 : 15,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  statsCardsContainer: {
    marginVertical: 15,
  },
  statsCardsContent: {
    paddingRight: 15,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
        borderColor: '#4A90E2',
      },
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    }),
  },
  statCardActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF5FF',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 8px rgba(74, 144, 226, 0.2)',
    } : {
      elevation: 4,
    }),
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  dateFilterSection: {
    marginTop: 15,
    marginBottom: 10,
  },
  dateFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateFilterTitle: {
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: '600',
    color: '#333',
  },
  dateFilterScroll: {
    marginBottom: 10,
  },
  dateFilterContent: {
    paddingRight: 15,
    gap: 8,
  },
  dateFilterButton: {
    paddingVertical: isMobile ? 8 : 10,
    paddingHorizontal: isMobile ? 12 : 16,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E8EAF0',
        borderColor: '#4A90E2',
      },
    }),
  },
  dateFilterButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  dateFilterButtonText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '600',
    color: '#666',
  },
  dateFilterButtonTextActive: {
    color: '#FFF',
  },
  customDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customDateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBF5FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  customDateText: {
    fontSize: isMobile ? 12 : 13,
    fontWeight: '600',
    color: '#4A90E2',
  },
  formHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  customDateActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E74C3C',
    gap: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#FEF2F2',
      },
    }),
  },
  clearButtonText: {
    color: '#E74C3C',
    fontSize: isMobile ? 14 : 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#229954',
      },
    }),
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 14 : 15,
    fontWeight: '600',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: '#FFF',
  },
  statsBar: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    elevation: 1,
  },
  statsText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '600',
    color: '#333',
  },
  tableContainer: {
    flex: 1,
  },
  mobileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isMobile ? 14 : 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  mobileCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mobileCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mobileCardValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  table: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      overflowX: isMobile ? 'hidden' : 'auto',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    paddingBottom: isMobile ? 10 : isTablet ? 11 : 12,
    marginBottom: isMobile ? 10 : isTablet ? 11 : 12,
    display: isMobile ? 'none' : 'flex',
    ...(Platform.OS === 'web' && {
      display: isMobile ? 'none' : 'flex',
      minWidth: isTablet ? 700 : 900,
    }),
  },
  tableHeaderText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '600',
    color: '#666',
  },
  tableRow: {
    flexDirection: isMobile ? 'column' : 'row',
    paddingVertical: isMobile ? 16 : isTablet ? 14 : 12,
    paddingHorizontal: isMobile ? 12 : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? 12 : 0,
    borderRadius: isMobile ? 12 : 0,
    backgroundColor: isMobile ? '#FAFAFA' : 'transparent',
    ...(Platform.OS === 'web' && {
      minWidth: isTablet ? 700 : 900,
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: isMobile ? '#F5F5F5' : 'rgba(0, 0, 0, 0.02)',
      },
    }),
  },
  tableCellText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#333',
    marginBottom: isMobile ? 8 : 0,
    ...(Platform.OS === 'web' && {
      overflow: isMobile ? 'visible' : 'hidden',
      textOverflow: isMobile ? 'clip' : 'ellipsis',
      whiteSpace: isMobile ? 'normal' : 'nowrap',
    }),
  },
  nameColumn: {
    flex: 1.8,
  },
  emailColumn: {
    flex: 2.5,
  },
  roleColumn: {
    flex: 1.2,
  },
  verifiedColumn: {
    flex: 1,
  },
  statusColumn: {
    flex: 1.2,
  },
  resumeColumn: {
    flex: isMobile ? 1.2 : isTablet ? 1.3 : 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isMobile ? 4 : 8,
  },
  lastActiveColumn: {
    flex: 1.3,
  },
  joinedColumn: {
    flex: 1.3,
  },
  actionsColumn: {
    flex: 2,
    flexDirection: 'row',
    gap: 6,
  },
  nameText: {
    fontWeight: '500',
    color: '#C0392B',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  jobseekerBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  employerBadge: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3498DB',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E74C3C',
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F5F6FA',
  },
  loginAsUserButton: {
    marginLeft: 4,
  },
  deleteButton: {
    marginLeft: 4,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  verifiedYes: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  verifiedNo: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  verifiedYesText: {
    color: '#27AE60',
  },
  verifiedNoText: {
    color: '#E74C3C',
  },
  verifyButton: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? 4 : 6,
    paddingHorizontal: isMobile ? 8 : isTablet ? 10 : 12,
    paddingVertical: isMobile ? 5 : isTablet ? 6 : 7,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A90E2',
    minWidth: isMobile ? 'auto' : 100,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#BBDEFB',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 6px rgba(74, 144, 226, 0.25)',
        borderColor: '#357ABD',
      },
    }),
  },
  resumeButtonText: {
    fontSize: isMobile ? 11 : isTablet ? 12 : 13,
    fontWeight: '600',
    color: '#4A90E2',
    letterSpacing: 0.2,
  },
  resumeNA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  resumeNAText: {
    fontSize: isMobile ? 10 : isTablet ? 11 : 12,
    color: '#999',
    fontStyle: 'italic',
  },
  resumeDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: isMobile ? 14 : isTablet ? 16 : 20,
    paddingVertical: isMobile ? 9 : isTablet ? 10 : 12,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    minWidth: isMobile ? 'auto' : 180,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#357ABD',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(74, 144, 226, 0.3)',
      },
    }),
  },
  resumeDownloadText: {
    fontSize: isMobile ? 13 : isTablet ? 14 : 15,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  resumeNAModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resumeNAModalText: {
    fontSize: isMobile ? 13 : isTablet ? 14 : 15,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  verifyButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    padding: 0,
    width: isMobile ? '100%' : isTablet ? '90%' : '95%',
    height: isMobile ? '100%' : isTablet ? '90%' : '90%',
    maxWidth: '100%',
    maxHeight: '100%',
    borderWidth: 0,
    elevation: 25,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      width: isMobile ? '100%' : isTablet ? '90%' : '95%',
      height: isMobile ? '100%' : isTablet ? '90%' : '90%',
      boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 20px 60px rgba(0, 0, 0, 0.3)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: isMobile ? 20 : isTablet ? 32 : 40,
    paddingTop: isMobile ? 20 : isTablet ? 24 : 28,
    paddingBottom: isMobile ? 16 : isTablet ? 20 : 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: isMobile ? 20 : isTablet ? 22 : 26,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    width: isMobile ? 36 : 40,
    height: isMobile ? 36 : 40,
    borderRadius: isMobile ? 18 : 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#F3F4F6',
        transform: 'rotate(90deg)',
      },
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    }),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalBody: {
    padding: isMobile ? 20 : isTablet ? 32 : 40,
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'scroll',
    ...(Platform.OS === 'web' && {
      overflowY: 'auto',
      overflowX: 'hidden',
    }),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: isMobile ? 14 : isTablet ? 16 : 18,
    paddingHorizontal: isMobile ? 0 : isTablet ? 4 : 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 48,
  },
  detailLabel: {
    fontSize: isMobile ? 13 : isTablet ? 14 : 15,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
    marginRight: 16,
  },
  detailValue: {
    fontSize: isMobile ? 13 : isTablet ? 14 : 15,
    color: '#111827',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: isMobile ? 6 : isTablet ? 7 : 8,
  },
  formInput: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleOptionTextActive: {
    color: '#FFF',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E67E22',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: '600',
  },
  // Label Management Styles
  labelBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  labelBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  labelButton: {
    backgroundColor: '#FFF3E0',
  },
  labelModalInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  labelModalCompanyName: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  labelModalCompanyType: {
    fontSize: isMobile ? 13 : 14,
    color: '#7F8C8D',
    textTransform: 'capitalize',
  },
  labelSectionTitle: {
    fontSize: isMobile ? 15 : 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  labelOptionsContainer: {
    gap: 12,
  },
  labelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  labelOptionSelected: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
  },
  labelOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  labelOptionText: {
    flex: 1,
  },
  labelOptionName: {
    fontSize: isMobile ? 14 : 15,
    fontWeight: '600',
  },
  labelPreviewSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  labelPreviewTitle: {
    fontSize: isMobile ? 14 : 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  labelPreviewContainer: {
    minHeight: 40,
  },
  labelPreviewEmpty: {
    fontSize: isMobile ? 13 : 14,
    color: '#95A5A6',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  modalSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  modalSaveButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 14 : 15,
    fontWeight: '600',
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
  },
  modalCancelButtonText: {
    color: '#64748B',
    fontSize: isMobile ? 14 : 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({});

export default AdminUsersScreen;

