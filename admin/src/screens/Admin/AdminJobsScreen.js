import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Platform, Modal } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import * as DocumentPicker from 'expo-document-picker';
import { useResponsive } from '../../utils/responsive';

const AdminJobsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    allJobs: 0,
    activeJobs: 0,
    adminReview: 0,
    draftJobs: 0,
    pendingJobs: 0,
    expiredJobs: 0,
    byCompanies: 0,
    byConsultancies: 0,
    excelImportedJobs: 0,
  });
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('ALL');
  const [customDateModalVisible, setCustomDateModalVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [assignApplicantsModalVisible, setAssignApplicantsModalVisible] = useState(false);
  const [assigningToJob, setAssigningToJob] = useState(null);
  const [availableApplicants, setAvailableApplicants] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [applicantSearchQuery, setApplicantSearchQuery] = useState('');
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  
  // Invite Candidates States
  const [inviteCandidatesModalVisible, setInviteCandidatesModalVisible] = useState(false);
  const [invitingToJob, setInvitingToJob] = useState(null);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState('');

  // Job Labels States
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [labelingJob, setLabelingJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, filterStatus, jobs, dateFilter, sortBy, customStartDate, customEndDate]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/jobs`, { headers });
      const data = await response.json();
      setJobs(data.jobs || []);
      calculateStats(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      Alert.alert('Error', 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (jobsData) => {
    const now = new Date();
    const newStats = {
      allJobs: jobsData.length,
      activeJobs: 0,
      adminReview: 0,
      draftJobs: 0,
      pendingJobs: 0,
      expiredJobs: 0,
      byCompanies: 0,
      byConsultancies: 0,
      excelImportedJobs: 0,
    };

    jobsData.forEach(job => {
      // Active Jobs
      if (job.status === 'active' || job.status === 'ACTIVE') {
        newStats.activeJobs++;
      }

      // Admin Review (jobs waiting for admin approval)
      if (job.status === 'review' || job.status === 'REVIEW' || job.adminReview === true || job.needsReview === true) {
        newStats.adminReview++;
      }

      // Draft Jobs
      if (job.status === 'draft' || job.status === 'DRAFT' || job.isDraft === true) {
        newStats.draftJobs++;
      }

      // Pending Jobs (inactive or pending status)
      if (job.status === 'pending' || job.status === 'PENDING' || job.status === 'inactive' || job.status === 'INACTIVE') {
        newStats.pendingJobs++;
      }

      // Expired Jobs (check if job has expired based on expiryDate or deadline)
      const expiryDate = job.expiryDate || job.deadline || job.validUntil;
      if (expiryDate) {
        const expiry = new Date(expiryDate);
        if (expiry < now) {
          newStats.expiredJobs++;
        }
      }

      // Jobs by Companies
      if (job.postedBy === 'company' || job.employerType === 'company' || (job.company && typeof job.company === 'object')) {
        newStats.byCompanies++;
      }

      // Jobs by Consultancies
      if (job.postedBy === 'consultancy' || job.employerType === 'consultancy' || job.isConsultancy === true) {
        newStats.byConsultancies++;
      }

      // Excel Imported Jobs
      if (job.importSource === 'excel' || job.isImported || job.source === 'bulk_import') {
        newStats.excelImportedJobs++;
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

  const filterJobs = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job => {
        const companyName = typeof job.company === 'object' ? job.company?.name : job.company;
        const locationStr = typeof job.location === 'object' 
          ? `${job.location?.city || ''} ${job.location?.state || ''}`.trim()
          : job.location;
        return job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          locationStr?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Date range filter
    if (dateFilter !== 'ALL') {
      const dateRange = getDateRangeFilter();
      if (dateRange) {
        filtered = filtered.filter(job => {
          const jobDate = new Date(job.createdAt);
          return jobDate >= dateRange.start && jobDate <= dateRange.end;
        });
      }
    }

    // Status filter
    const now = new Date();

    if (filterStatus === 'ACTIVE') {
      filtered = filtered.filter(job => job.status === 'active' || job.status === 'ACTIVE');
    } else if (filterStatus === 'ADMIN_REVIEW') {
      filtered = filtered.filter(job => job.status === 'review' || job.status === 'REVIEW' || job.adminReview === true || job.needsReview === true);
    } else if (filterStatus === 'DRAFT') {
      filtered = filtered.filter(job => job.status === 'draft' || job.status === 'DRAFT' || job.isDraft === true);
    } else if (filterStatus === 'INACTIVE') {
      filtered = filtered.filter(job => job.status !== 'active' && job.status !== 'ACTIVE');
    } else if (filterStatus === 'PENDING') {
      filtered = filtered.filter(job => job.status === 'pending' || job.status === 'PENDING' || job.status === 'inactive' || job.status === 'INACTIVE');
    } else if (filterStatus === 'EXPIRED') {
      filtered = filtered.filter(job => {
        const expiryDate = job.expiryDate || job.deadline || job.validUntil;
        if (expiryDate) {
          const expiry = new Date(expiryDate);
          return expiry < now;
        }
        return false;
      });
    } else if (filterStatus === 'EXCEL_IMPORTED') {
      filtered = filtered.filter(job => job.importSource === 'excel' || job.isImported || job.source === 'bulk_import');
    }

    // Sort By filter
    if (sortBy === 'COMPANIES') {
      filtered = filtered.filter(job => 
        job.postedBy === 'company' || 
        job.employerType === 'company' || 
        (job.company && typeof job.company === 'object')
      );
    } else if (sortBy === 'CONSULTANCIES') {
      filtered = filtered.filter(job => 
        job.postedBy === 'consultancy' || 
        job.employerType === 'consultancy' || 
        job.isConsultancy === true
      );
    } else if (sortBy === 'EXCEL_IMPORTED') {
      filtered = filtered.filter(job => 
        job.importSource === 'excel' || 
        job.isImported || 
        job.source === 'bulk_import'
      );
    }

    setFilteredJobs(filtered);
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

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const newStatus = (currentStatus === 'active' || currentStatus === 'ACTIVE') ? 'inactive' : 'active';
      
      const response = await fetch(`${API_URL}/admin/jobs/${jobId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      Alert.alert('Success', 'Job status updated successfully');
      fetchJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      Alert.alert('Error', 'Failed to update job status');
    }
  };

  const deleteJob = async (jobId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              await fetch(`${API_URL}/admin/jobs/${jobId}`, {
                method: 'DELETE',
                headers
              });
              Alert.alert('Success', 'Job deleted successfully');
              fetchJobs();
            } catch (error) {
              console.error('Error deleting job:', error);
              Alert.alert('Error', 'Failed to delete job');
            }
          }
        }
      ]
    );
  };

  const handleViewJob = (job) => {
    setViewingJob(job);
    setViewModalVisible(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setEditModalVisible(true);
  };

  const handleDuplicateJob = async (job) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const duplicateData = {
        ...job,
        title: `${job.title} (Copy)`,
        status: 'draft',
        _id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };

      const response = await fetch(`${API_URL}/admin/jobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(duplicateData)
      });

      if (response.ok) {
        Alert.alert('Success', 'Job duplicated successfully');
        fetchJobs();
      }
    } catch (error) {
      console.error('Error duplicating job:', error);
      Alert.alert('Error', 'Failed to duplicate job');
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      await fetch(`${API_URL}/admin/jobs/${jobId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'active', adminReview: false })
      });

      Alert.alert('Success', 'Job approved successfully');
      fetchJobs();
    } catch (error) {
      console.error('Error approving job:', error);
      Alert.alert('Error', 'Failed to approve job');
    }
  };

  const handleMoveToTrash = async (jobId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      await fetch(`${API_URL}/admin/jobs/${jobId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'trash', isDeleted: true })
      });

      Alert.alert('Success', 'Job moved to trash');
      fetchJobs();
    } catch (error) {
      console.error('Error moving to trash:', error);
      Alert.alert('Error', 'Failed to move job to trash');
    }
  };

  const handleAssignApplicants = async (job) => {
    setAssigningToJob(job);
    setAssignApplicantsModalVisible(true);
    await loadAvailableApplicants();
  };

  const loadAvailableApplicants = async () => {
    try {
      setLoadingApplicants(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fetch all users/job seekers
      const response = await fetch(`${API_URL}/admin/users?role=jobseeker&limit=500`, { headers });
      const data = await response.json();
      
      setAvailableApplicants(data.users || []);
    } catch (error) {
      console.error('Error loading applicants:', error);
      Alert.alert('Error', 'Failed to load applicants');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const toggleSelectApplicant = (applicantId) => {
    if (selectedApplicants.includes(applicantId)) {
      setSelectedApplicants(selectedApplicants.filter(id => id !== applicantId));
    } else {
      if (selectedApplicants.length >= 500) {
        Alert.alert('Limit Reached', 'You can assign up to 500 applicants at a time');
        return;
      }
      setSelectedApplicants([...selectedApplicants, applicantId]);
    }
  };

  const toggleSelectAllApplicants = () => {
    const filtered = getFilteredApplicants();
    if (selectedApplicants.length === filtered.length) {
      setSelectedApplicants([]);
    } else {
      const limitedSelection = filtered.slice(0, 500).map(app => app._id);
      setSelectedApplicants(limitedSelection);
    }
  };

  const getFilteredApplicants = () => {
    if (!applicantSearchQuery) return availableApplicants;
    
    return availableApplicants.filter(applicant => {
      const name = `${applicant.firstName || ''} ${applicant.lastName || ''}`.toLowerCase();
      const email = (applicant.email || '').toLowerCase();
      const phone = (applicant.phone || '').toLowerCase();
      const query = applicantSearchQuery.toLowerCase();
      
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  };

  const handleSubmitAssignment = async () => {
    if (selectedApplicants.length === 0) {
      Alert.alert('Error', 'Please select at least one applicant');
      return;
    }

    try {
      setLoadingApplicants(true);
      
      const response = await api.assignApplicantsToJob(assigningToJob._id, selectedApplicants);

      if (response) {
        Alert.alert(
          'Success', 
          `${response.assigned} applicant${response.assigned !== 1 ? 's' : ''} assigned successfully${response.skipped > 0 ? `\n${response.skipped} already applied` : ''}`
        );
        setAssignApplicantsModalVisible(false);
        setSelectedApplicants([]);
        setApplicantSearchQuery('');
      }
    } catch (error) {
      console.error('Error assigning applicants:', error);
      Alert.alert('Error', error.message || 'Failed to assign applicants');
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Invite Candidates Handlers
  const handleInviteCandidates = async (job) => {
    setInvitingToJob(job);
    setInviteCandidatesModalVisible(true);
    setInvitationMessage(`You are invited to apply for ${job.title}. We believe you would be a great fit for this position!`);
    await loadUninvitedCandidates(job._id);
  };

  const loadUninvitedCandidates = async (jobId) => {
    try {
      setLoadingCandidates(true);
      setAvailableCandidates([]); // Clear previous candidates
      setSelectedCandidates([]); // Clear previous selections
      
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      console.log('=== LOADING CANDIDATES ===');
      console.log('Job ID:', jobId);
      console.log('API URL:', `${API_URL}/admin/jobs/${jobId}/uninvited-candidates`);
      
      const response = await fetch(`${API_URL}/admin/jobs/${jobId}/uninvited-candidates?limit=10000`, { headers });
      
      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch candidates';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Error Response:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('=== API RESPONSE ===');
      console.log('Candidates Count:', data.candidates?.length || 0);
      console.log('Total Job Seekers:', data.totalJobSeekers);
      console.log('Already Invited:', data.alreadyInvited);
      console.log('Sample Candidate:', data.candidates?.[0]);
      
      // Set candidates even if empty (for proper UI state)
      setAvailableCandidates(data.candidates || []);
      
      // Show appropriate feedback based on the situation
      if (!data.candidates || data.candidates.length === 0) {
        if (data.totalJobSeekers === 0) {
          Alert.alert(
            '⚠️ No Job Seekers Found', 
            'There are no job seekers registered in the system yet.\n\n' +
            'To test this feature:\n' +
            '1. Register users with userType: "jobseeker"\n' +
            '2. Or run: cd server && node seed-jobseekers.js\n\n' +
            'Check server logs for more details.',
            [{ text: 'OK', style: 'default' }]
          );
        } else if (data.alreadyInvited === data.totalJobSeekers) {
          Alert.alert(
            '✅ All Candidates Invited', 
            `All ${data.totalJobSeekers} job seekers have already been invited to this job.\n\n` +
            'Try inviting candidates to a different job.',
            [{ text: 'OK', style: 'default' }]
          );
        } else {
          Alert.alert(
            'ℹ️ No Candidates Available', 
            `Total Job Seekers: ${data.totalJobSeekers}\n` +
            `Already Invited: ${data.alreadyInvited}\n` +
            `Available: ${data.candidates?.length || 0}\n\n` +
            'Check server logs for more details.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      } else {
        console.log(`✅ Successfully loaded ${data.candidates.length} candidates`);
      }
    } catch (error) {
      console.error('=== ERROR LOADING CANDIDATES ===');
      console.error('Error:', error);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      
      Alert.alert(
        '❌ Error Loading Candidates', 
        `${error.message}\n\n` +
        'Please check:\n' +
        '• Server is running (port 5000)\n' +
        '• You are logged in as admin\n' +
        '• Network connection is stable\n' +
        '• Browser console for more details',
        [{ text: 'OK', style: 'cancel' }]
      );
      setAvailableCandidates([]);
    } finally {
      setLoadingCandidates(false);
      console.log('=== LOADING COMPLETE ===');
    }
  };

  const toggleSelectCandidate = (candidateId) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    } else {
      if (selectedCandidates.length >= 10000) {
        Alert.alert('Limit Reached', 'You can invite up to 10,000 candidates at a time');
        return;
      }
      setSelectedCandidates([...selectedCandidates, candidateId]);
    }
  };

  const toggleSelectAllCandidates = () => {
    const filtered = getFilteredCandidates();
    if (selectedCandidates.length === filtered.length) {
      setSelectedCandidates([]);
    } else {
      const limitedSelection = filtered.slice(0, 10000).map(cand => cand._id);
      setSelectedCandidates(limitedSelection);
    }
  };

  const getFilteredCandidates = () => {
    if (!candidateSearchQuery) return availableCandidates;
    
    return availableCandidates.filter(candidate => {
      const name = `${candidate.firstName || ''} ${candidate.lastName || ''}`.toLowerCase();
      const email = (candidate.email || '').toLowerCase();
      const phone = (candidate.phone || '').toLowerCase();
      const query = candidateSearchQuery.toLowerCase();
      
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  };

  const handleSubmitInvitations = async () => {
    if (selectedCandidates.length === 0) {
      Alert.alert('Error', 'Please select at least one candidate');
      return;
    }

    try {
      setLoadingCandidates(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/admin/jobs/${invitingToJob._id}/invite-candidates`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          candidateIds: selectedCandidates,
          message: invitationMessage
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          `${data.invited} candidate${data.invited !== 1 ? 's' : ''} invited successfully${data.skipped > 0 ? `\n${data.skipped} already invited` : ''}`
        );
        setInviteCandidatesModalVisible(false);
        setSelectedCandidates([]);
        setCandidateSearchQuery('');
        setInvitationMessage('');
      } else {
        Alert.alert('Error', data.message || 'Failed to invite candidates');
      }
    } catch (error) {
      console.error('Error inviting candidates:', error);
      Alert.alert('Error', 'Failed to invite candidates');
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job._id));
    }
  };

  // Job Label Handlers
  const handleManageLabels = (job) => {
    setLabelingJob(job);
    setLabelModalVisible(true);
  };

  const handleToggleLabel = async (jobId, labelType, currentValue) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/admin/jobs/${jobId}/labels`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ [labelType]: !currentValue })
      });

      if (response.ok) {
        // Update local state
        setJobs(jobs.map(job => 
          job._id === jobId 
            ? { ...job, [labelType]: !currentValue }
            : job
        ));
        Alert.alert('Success', `Job ${!currentValue ? 'labeled' : 'unlabeled'} successfully`);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to update label');
      }
    } catch (error) {
      console.error('Error toggling label:', error);
      Alert.alert('Error', 'Failed to update label');
    }
  };

  const handleBulkUpdateLabels = async (labels) => {
    if (selectedJobs.length === 0) {
      Alert.alert('Error', 'Please select at least one job');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/admin/jobs/bulk/labels`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ jobIds: selectedJobs, labels })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message);
        fetchJobs(); // Refresh jobs
        setSelectedJobs([]);
        setBulkSelectMode(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to update labels');
      }
    } catch (error) {
      console.error('Error bulk updating labels:', error);
      Alert.alert('Error', 'Failed to update labels');
    }
  };

  const toggleSelectJob = (jobId) => {
    if (selectedJobs.includes(jobId)) {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    } else {
      setSelectedJobs([...selectedJobs, jobId]);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedJobs.length === 0) {
      Alert.alert('Error', 'Please select jobs to approve');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      await Promise.all(
        selectedJobs.map(jobId =>
          fetch(`${API_URL}/admin/jobs/${jobId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status: 'active', adminReview: false })
          })
        )
      );

      Alert.alert('Success', `${selectedJobs.length} jobs approved successfully`);
      setSelectedJobs([]);
      setBulkSelectMode(false);
      fetchJobs();
    } catch (error) {
      console.error('Error bulk approving:', error);
      Alert.alert('Error', 'Failed to approve jobs');
    }
  };

  const handleBulkUnapprove = async () => {
    if (selectedJobs.length === 0) {
      Alert.alert('Error', 'Please select jobs to unapprove');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      await Promise.all(
        selectedJobs.map(jobId =>
          fetch(`${API_URL}/admin/jobs/${jobId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status: 'pending', adminReview: true })
          })
        )
      );

      Alert.alert('Success', `${selectedJobs.length} jobs unapproved successfully`);
      setSelectedJobs([]);
      setBulkSelectMode(false);
      fetchJobs();
    } catch (error) {
      console.error('Error bulk unapproving:', error);
      Alert.alert('Error', 'Failed to unapprove jobs');
    }
  };

  const handleBulkTrash = async () => {
    if (selectedJobs.length === 0) {
      Alert.alert('Error', 'Please select jobs to trash');
      return;
    }

    Alert.alert(
      'Confirm Bulk Trash',
      `Are you sure you want to move ${selectedJobs.length} jobs to trash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              };

              await Promise.all(
                selectedJobs.map(jobId =>
                  fetch(`${API_URL}/admin/jobs/${jobId}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ status: 'trash', isDeleted: true })
                  })
                )
              );

              Alert.alert('Success', `${selectedJobs.length} jobs moved to trash`);
              setSelectedJobs([]);
              setBulkSelectMode(false);
              fetchJobs();
            } catch (error) {
              console.error('Error bulk trashing:', error);
              Alert.alert('Error', 'Failed to move jobs to trash');
            }
          }
        }
      ]
    );
  };

  const handleBulkExport = async () => {
    try {
      setLoading(true);
      
      // Create comprehensive CSV content
      const csvHeader = 'Job Title,Company,Location,Job Type,Experience,Salary Min,Salary Max,Description,Requirements,Status,Posted Date\n';
      const csvRows = jobs.map(job => {
        const title = (job.title || '').replace(/"/g, '""');
        const company = typeof job.company === 'object' ? (job.company?.name || '') : (job.company || '');
        const location = typeof job.location === 'object' 
          ? `${job.location?.city || ''} ${job.location?.state || ''}`.trim()
          : (job.location || '');
        const jobType = job.jobType || job.type || '';
        const experience = job.experience || '';
        const salaryMin = job.salary?.min || job.salaryMin || '';
        const salaryMax = job.salary?.max || job.salaryMax || '';
        const description = (job.description || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const requirements = (job.requirements || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const status = job.status || 'active';
        const postedDate = formatDate(job.createdAt);
        
        return `"${title}","${company}","${location}","${jobType}","${experience}","${salaryMin}","${salaryMax}","${description}","${requirements}","${status}","${postedDate}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `jobs_export_${Date.now()}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        }
        Alert.alert('Success', `Exported ${jobs.length} jobs successfully!`);
      } else {
        Alert.alert('Info', 'Export functionality is available on web platform');
      }
    } catch (error) {
      console.error('Error exporting jobs:', error);
      Alert.alert('Error', 'Failed to export jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    try {
      setLoading(true);
      
      if (Platform.OS === 'web') {
        // For web, use file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) {
            setLoading(false);
            return;
          }

          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const fileContent = event.target.result;
              await processJobsCSVImport(fileContent);
            } catch (error) {
              console.error('Error processing CSV:', error);
              Alert.alert('Error', 'Failed to process CSV file');
              setLoading(false);
            }
          };
          reader.readAsText(file);
        };
        input.click();
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'text/csv',
          copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
          setLoading(false);
          return;
        }

        // For mobile - would need FileSystem
        Alert.alert('Info', 'Bulk import is best supported on web platform');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error importing jobs:', error);
      Alert.alert('Error', 'Failed to import jobs');
      setLoading(false);
    }
  };

  const processJobsCSVImport = async (fileContent) => {
    try {
      const lines = fileContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        Alert.alert('Error', 'CSV file is empty or invalid');
        setLoading(false);
        return;
      }

      const jobsToImport = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));
          
          if (cleanValues.length >= 3) {
            const jobObj = {
              title: cleanValues[0],
              company: cleanValues[1],
              location: cleanValues[2],
              jobType: cleanValues[3] || 'Full-time',
              experience: cleanValues[4] || '',
              salaryMin: cleanValues[5] || '',
              salaryMax: cleanValues[6] || '',
              description: cleanValues[7] || '',
              requirements: cleanValues[8] || '',
              status: cleanValues[9] || 'active',
            };

            if (!jobObj.title || !jobObj.company) {
              errors.push(`Line ${i + 1}: Missing required fields`);
              continue;
            }

            jobsToImport.push(jobObj);
          } else {
            errors.push(`Line ${i + 1}: Insufficient data`);
          }
        } catch (lineError) {
          errors.push(`Line ${i + 1}: Parse error`);
        }
      }

      if (jobsToImport.length === 0) {
        Alert.alert('Error', `No valid jobs found in CSV file.\n\nErrors:\n${errors.slice(0, 5).join('\n')}`);
        setLoading(false);
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

      const response = await fetch(`${API_URL}/admin/jobs/bulk-import`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jobs: jobsToImport })
      });

      const data = await response.json();
      
      if (response.ok) {
        const successCount = data.imported || data.success || jobsToImport.length;
        const failedCount = data.failed || 0;
        let message = `Successfully imported ${successCount} jobs`;
        
        if (failedCount > 0) {
          message += `\nFailed: ${failedCount}`;
        }
        
        if (errors.length > 0) {
          message += `\n\nSkipped ${errors.length} invalid rows`;
        }

        Alert.alert('Import Complete', message);
        fetchJobs();
      } else {
        Alert.alert('Error', data.message || 'Failed to import jobs');
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      Alert.alert('Error', 'Failed to process CSV file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const sampleCSV = `Job Title,Company,Location,Job Type,Experience,Salary Min,Salary Max,Description,Requirements,Status
"Software Engineer","Tech Corp","Mumbai, Maharashtra","Full-time","2-5 years","600000","1200000","Develop and maintain software applications","Bachelor's degree in Computer Science, 2+ years experience","active"
"Marketing Manager","Marketing Inc","Delhi, Delhi","Full-time","5-8 years","800000","1500000","Lead marketing campaigns and strategies","MBA in Marketing, 5+ years experience","active"
"Data Analyst","Analytics Co","Bangalore, Karnataka","Full-time","1-3 years","400000","800000","Analyze data and create reports","Bachelor's degree, SQL and Python skills","active"`;

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'sample_jobs_import.csv';
          link.click();
          window.URL.revokeObjectURL(url);
        }
        Alert.alert('Success', 'Sample CSV downloaded successfully!');
      } else {
        Alert.alert(
          'Sample CSV Format',
          'CSV should have columns:\nJob Title, Company, Location, Job Type, Experience, Salary Min, Salary Max, Description, Requirements, Status',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error downloading sample:', error);
      Alert.alert('Error', 'Failed to download sample CSV');
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

  const dynamicStyles = getStyles(isMobile, isTablet);

  if (loading) {
    return (
      <AdminLayout
        title="Jobs"
        activeScreen="AdminJobs"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={dynamicStyles.loadingText}>Loading jobs...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Jobs"
      activeScreen="AdminJobs"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.container}>
          <View style={dynamicStyles.headerSection}>
            <Text style={dynamicStyles.pageTitle}>Job Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage all job postings</Text>
          </View>

          <View style={dynamicStyles.filterSection}>
            <View style={dynamicStyles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={dynamicStyles.searchIcon} />
              <TextInput
                style={dynamicStyles.searchInput}
                placeholder="Search by job title or company..."
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

            {/* Stats Cards */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={dynamicStyles.statsCardsContainer}
              contentContainerStyle={dynamicStyles.statsCardsContent}
            >
              <TouchableOpacity 
                style={[dynamicStyles.statCard, filterStatus === 'ALL' && dynamicStyles.statCardActive]}
                onPress={() => setFilterStatus('ALL')}
              >
                <Ionicons name="briefcase-outline" size={24} color="#3498DB" />
                <Text style={dynamicStyles.statCardValue}>{stats.allJobs}</Text>
                <Text style={dynamicStyles.statCardLabel}>All Jobs</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[dynamicStyles.statCard, filterStatus === 'ACTIVE' && dynamicStyles.statCardActive]}
                onPress={() => setFilterStatus('ACTIVE')}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color="#27AE60" />
                <Text style={dynamicStyles.statCardValue}>{stats.activeJobs}</Text>
                <Text style={dynamicStyles.statCardLabel}>Active Jobs</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[dynamicStyles.statCard, filterStatus === 'ADMIN_REVIEW' && dynamicStyles.statCardActive]}
                onPress={() => setFilterStatus('ADMIN_REVIEW')}
              >
                <Ionicons name="eye-outline" size={24} color="#E67E22" />
                <Text style={dynamicStyles.statCardValue}>{stats.adminReview}</Text>
                <Text style={dynamicStyles.statCardLabel}>Admin Review</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[dynamicStyles.statCard, filterStatus === 'DRAFT' && dynamicStyles.statCardActive]}
                onPress={() => setFilterStatus('DRAFT')}
              >
                <Ionicons name="document-outline" size={24} color="#95A5A6" />
                <Text style={dynamicStyles.statCardValue}>{stats.draftJobs}</Text>
                <Text style={dynamicStyles.statCardLabel}>Draft Jobs</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[dynamicStyles.statCard, filterStatus === 'PENDING' && dynamicStyles.statCardActive]}
                onPress={() => setFilterStatus('PENDING')}
              >
                <Ionicons name="time-outline" size={24} color="#F39C12" />
                <Text style={dynamicStyles.statCardValue}>{stats.pendingJobs}</Text>
                <Text style={dynamicStyles.statCardLabel}>Pending Jobs</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[dynamicStyles.statCard, filterStatus === 'EXPIRED' && dynamicStyles.statCardActive]}
                onPress={() => setFilterStatus('EXPIRED')}
              >
                <Ionicons name="calendar-outline" size={24} color="#E74C3C" />
                <Text style={dynamicStyles.statCardValue}>{stats.expiredJobs}</Text>
                <Text style={dynamicStyles.statCardLabel}>Expired Jobs</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[dynamicStyles.statCard, filterStatus === 'EXCEL_IMPORTED' && dynamicStyles.statCardActive]}
                onPress={() => setFilterStatus('EXCEL_IMPORTED')}
              >
                <Ionicons name="document-attach-outline" size={24} color="#9B59B6" />
                <Text style={dynamicStyles.statCardValue}>{stats.excelImportedJobs}</Text>
                <Text style={dynamicStyles.statCardLabel}>Excel Imported</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Sort By Section */}
            <View style={dynamicStyles.sortBySection}>
              <View style={dynamicStyles.sortByHeader}>
                <Ionicons name="funnel-outline" size={20} color="#4A90E2" />
                <Text style={dynamicStyles.sortByTitle}>Sort By</Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={dynamicStyles.sortByScroll}
                contentContainerStyle={dynamicStyles.sortByContent}
              >
                <TouchableOpacity
                  style={[dynamicStyles.sortByButton, sortBy === 'ALL' && dynamicStyles.sortByButtonActive]}
                  onPress={() => setSortBy('ALL')}
                >
                  <Text style={[dynamicStyles.sortByButtonText, sortBy === 'ALL' && dynamicStyles.sortByButtonTextActive]}>
                    All Jobs
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[dynamicStyles.sortByButton, sortBy === 'COMPANIES' && dynamicStyles.sortByButtonActive]}
                  onPress={() => setSortBy('COMPANIES')}
                >
                  <Ionicons name="business-outline" size={16} color={sortBy === 'COMPANIES' ? '#FFF' : '#4A90E2'} />
                  <Text style={[dynamicStyles.sortByButtonText, sortBy === 'COMPANIES' && dynamicStyles.sortByButtonTextActive]}>
                    By Companies ({stats.byCompanies})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[dynamicStyles.sortByButton, sortBy === 'CONSULTANCIES' && dynamicStyles.sortByButtonActive]}
                  onPress={() => setSortBy('CONSULTANCIES')}
                >
                  <Ionicons name="people-outline" size={16} color={sortBy === 'CONSULTANCIES' ? '#FFF' : '#4A90E2'} />
                  <Text style={[dynamicStyles.sortByButtonText, sortBy === 'CONSULTANCIES' && dynamicStyles.sortByButtonTextActive]}>
                    By Consultancies ({stats.byConsultancies})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[dynamicStyles.sortByButton, sortBy === 'EXCEL_IMPORTED' && dynamicStyles.sortByButtonActive]}
                  onPress={() => setSortBy('EXCEL_IMPORTED')}
                >
                  <Ionicons name="document-attach-outline" size={16} color={sortBy === 'EXCEL_IMPORTED' ? '#FFF' : '#4A90E2'} />
                  <Text style={[dynamicStyles.sortByButtonText, sortBy === 'EXCEL_IMPORTED' && dynamicStyles.sortByButtonTextActive]}>
                    Excel Imported ({stats.excelImportedJobs})
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View style={dynamicStyles.filterButtons}>
              <TouchableOpacity
                style={[dynamicStyles.filterButton, filterStatus === 'ALL' && dynamicStyles.activeFilter]}
                onPress={() => setFilterStatus('ALL')}
              >
                <Text style={[dynamicStyles.filterButtonText, filterStatus === 'ALL' && dynamicStyles.activeFilterText]}>
                  All Jobs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.filterButton, filterStatus === 'ACTIVE' && dynamicStyles.activeFilter]}
                onPress={() => setFilterStatus('ACTIVE')}
              >
                <Text style={[dynamicStyles.filterButtonText, filterStatus === 'ACTIVE' && dynamicStyles.activeFilterText]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.filterButton, filterStatus === 'INACTIVE' && dynamicStyles.activeFilter]}
                onPress={() => setFilterStatus('INACTIVE')}
              >
                <Text style={[dynamicStyles.filterButtonText, filterStatus === 'INACTIVE' && dynamicStyles.activeFilterText]}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamicStyles.bulkActionsBar}>
            <TouchableOpacity 
              style={[dynamicStyles.bulkActionButton, bulkSelectMode && dynamicStyles.bulkActionButtonActive]}
              onPress={() => {
                setBulkSelectMode(!bulkSelectMode);
                setSelectedJobs([]);
              }}
            >
              <Ionicons name={bulkSelectMode ? "checkbox-outline" : "square-outline"} size={18} color={bulkSelectMode ? "#10B981" : "#4A90E2"} />
              <Text style={dynamicStyles.bulkActionButtonText}>
                {bulkSelectMode ? 'Cancel Selection' : 'Bulk Select'}
              </Text>
            </TouchableOpacity>

            {bulkSelectMode && selectedJobs.length > 0 && (
              <>
                <TouchableOpacity style={dynamicStyles.bulkActionButton} onPress={handleBulkApprove}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                  <Text style={dynamicStyles.bulkActionButtonText}>Approve ({selectedJobs.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={dynamicStyles.bulkActionButton} onPress={handleBulkUnapprove}>
                  <Ionicons name="close-circle-outline" size={18} color="#F59E0B" />
                  <Text style={dynamicStyles.bulkActionButtonText}>Unapprove ({selectedJobs.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={dynamicStyles.bulkActionButton} 
                  onPress={() => {
                    Alert.alert(
                      'Bulk Label Jobs',
                      'Choose labels to apply to selected jobs',
                      [
                        { text: 'Premium', onPress: () => handleBulkUpdateLabels({ premium: true }) },
                        { text: 'Featured', onPress: () => handleBulkUpdateLabels({ featured: true }) },
                        { text: 'Starred', onPress: () => handleBulkUpdateLabels({ starred: true }) },
                        { text: 'Urgent', onPress: () => handleBulkUpdateLabels({ urgent: true }) },
                        { text: 'Actively Hiring', onPress: () => handleBulkUpdateLabels({ activelyHiring: true }) },
                        { text: 'Remove All Labels', onPress: () => handleBulkUpdateLabels({ premium: false, featured: false, starred: false, urgent: false, activelyHiring: false }), style: 'destructive' },
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  }}
                >
                  <Ionicons name="pricetag-outline" size={18} color="#8B5CF6" />
                  <Text style={dynamicStyles.bulkActionButtonText}>Label ({selectedJobs.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={dynamicStyles.bulkActionButton} onPress={handleBulkTrash}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={dynamicStyles.bulkActionButtonText}>Trash ({selectedJobs.length})</Text>
                </TouchableOpacity>
              </>
            )}

            {!bulkSelectMode && (
              <>
                <TouchableOpacity style={dynamicStyles.bulkActionButton} onPress={handleDownloadSample}>
                  <Ionicons name="document-text-outline" size={18} color="#4A90E2" />
                  <Text style={dynamicStyles.bulkActionButtonText}>Sample CSV</Text>
                </TouchableOpacity>
                <TouchableOpacity style={dynamicStyles.bulkActionButton} onPress={handleBulkImport}>
                  <Ionicons name="cloud-upload-outline" size={18} color="#10B981" />
                  <Text style={dynamicStyles.bulkActionButtonText}>Bulk Import</Text>
                </TouchableOpacity>
                <TouchableOpacity style={dynamicStyles.bulkActionButton} onPress={handleBulkExport}>
                  <Ionicons name="cloud-download-outline" size={18} color="#F59E0B" />
                  <Text style={dynamicStyles.bulkActionButtonText}>Export</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={dynamicStyles.statsBar}>
            <Text style={dynamicStyles.statsText}>Total Jobs: {filteredJobs.length}</Text>
          </View>

          <View style={dynamicStyles.tableContainer}>
            <View style={dynamicStyles.table}>
              <View style={dynamicStyles.tableHeader}>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.titleColumn]}>Job Title</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.companyColumn]}>Company</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.locationColumn]}>Location</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.statusColumn]}>Status</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.postedColumn]}>Posted</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.actionsColumn]}>Actions</Text>
              </View>

              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <View key={job._id || index} style={dynamicStyles.tableRow}>
                    {bulkSelectMode && (
                      <TouchableOpacity 
                        style={dynamicStyles.checkboxColumn}
                        onPress={() => toggleSelectJob(job._id)}
                      >
                        <Ionicons 
                          name={selectedJobs.includes(job._id) ? "checkbox" : "square-outline"} 
                          size={24} 
                          color={selectedJobs.includes(job._id) ? "#10B981" : "#94A3B8"} 
                        />
                      </TouchableOpacity>
                    )}
                    <Text style={[dynamicStyles.tableCellText, dynamicStyles.titleColumn, dynamicStyles.jobTitle]}>
                      {job.title || 'N/A'}
                      {/* Job Labels */}
                      {(job.premium || job.featured || job.starred || job.urgent || job.activelyHiring) && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                          {job.premium && (
                            <View style={{ backgroundColor: '#FFD700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4, marginBottom: 2 }}>
                              <Text style={{ fontSize: 10, fontWeight: '600', color: '#000' }}>PREMIUM</Text>
                            </View>
                          )}
                          {job.featured && (
                            <View style={{ backgroundColor: '#3B82F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4, marginBottom: 2 }}>
                              <Text style={{ fontSize: 10, fontWeight: '600', color: '#FFF' }}>FEATURED</Text>
                            </View>
                          )}
                          {job.starred && (
                            <View style={{ backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4, marginBottom: 2 }}>
                              <Text style={{ fontSize: 10, fontWeight: '600', color: '#FFF' }}>STARRED</Text>
                            </View>
                          )}
                          {job.urgent && (
                            <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4, marginBottom: 2 }}>
                              <Text style={{ fontSize: 10, fontWeight: '600', color: '#FFF' }}>URGENT</Text>
                            </View>
                          )}
                          {job.activelyHiring && (
                            <View style={{ backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4, marginBottom: 2 }}>
                              <Text style={{ fontSize: 10, fontWeight: '600', color: '#FFF' }}>ACTIVELY HIRING</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </Text>
                    <Text style={[dynamicStyles.tableCellText, dynamicStyles.companyColumn]}>
                      {typeof job.company === 'object' ? (job.company?.name || 'N/A') : (job.company || job.postedBy?.companyName || 'N/A')}
                    </Text>
                    <Text style={[dynamicStyles.tableCellText, dynamicStyles.locationColumn]}>
                      {typeof job.location === 'object' 
                        ? `${job.location?.city || ''}${job.location?.city && job.location?.state ? ', ' : ''}${job.location?.state || ''}`.trim() || 'N/A'
                        : (job.location || 'N/A')}
                    </Text>
                    <View style={dynamicStyles.statusColumn}>
                      <TouchableOpacity
                        style={[
                          dynamicStyles.statusBadge,
                          job.status === 'active' ? dynamicStyles.activeBadge : dynamicStyles.inactiveBadge,
                        ]}
                        onPress={() => toggleJobStatus(job._id, job.status)}
                      >
                        <Text style={dynamicStyles.statusBadgeText}>
                          {job.status === 'active' ? 'ACTIVE' : job.status?.toUpperCase() || 'INACTIVE'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={[dynamicStyles.tableCellText, dynamicStyles.postedColumn]}>
                      {formatDate(job.createdAt)}
                    </Text>
                    <View style={dynamicStyles.actionsColumn}>
                      <TouchableOpacity
                        style={dynamicStyles.actionButton}
                        onPress={() => handleViewJob(job)}
                      >
                        <Ionicons name="eye-outline" size={18} color="#4A90E2" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={dynamicStyles.actionButton}
                        onPress={() => handleEditJob(job)}
                      >
                        <Ionicons name="create-outline" size={18} color="#10B981" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={dynamicStyles.actionButton}
                        onPress={() => handleManageLabels(job)}
                        title="Manage Labels"
                      >
                        <Ionicons name="pricetag-outline" size={18} color="#F59E0B" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={dynamicStyles.actionButton}
                        onPress={() => handleAssignApplicants(job)}
                      >
                        <Ionicons name="person-add-outline" size={18} color="#8B5CF6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={dynamicStyles.actionButton}
                        onPress={() => handleInviteCandidates(job)}
                      >
                        <Ionicons name="mail-outline" size={18} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={dynamicStyles.actionButton}
                        onPress={() => handleDuplicateJob(job)}
                      >
                        <Ionicons name="copy-outline" size={18} color="#F59E0B" />
                      </TouchableOpacity>
                      {(job.status === 'pending' || job.adminReview) && (
                        <TouchableOpacity
                          style={dynamicStyles.actionButton}
                          onPress={() => handleApproveJob(job._id)}
                        >
                          <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={dynamicStyles.actionButton}
                        onPress={() => handleMoveToTrash(job._id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={dynamicStyles.emptyState}>
                  <Ionicons name="briefcase-outline" size={64} color="#CCC" />
                  <Text style={dynamicStyles.emptyStateText}>No jobs found</Text>
                </View>
              )}
            </View>
          </View>
        </View>

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

        {/* Assign Applicants Modal */}
        <Modal
          visible={assignApplicantsModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAssignApplicantsModalVisible(false)}
        >
          <View style={dynamicStyles.assignModalOverlay}>
            <View style={dynamicStyles.assignModalContainer}>
              {/* Enhanced Header */}
              <View style={dynamicStyles.assignModalHeader}>
                <View style={dynamicStyles.assignHeaderLeft}>
                  <View style={dynamicStyles.assignIconContainer}>
                    <Ionicons name="people" size={24} color="#8B5CF6" />
                  </View>
                  <View style={dynamicStyles.assignHeaderText}>
                    <Text style={dynamicStyles.assignModalTitle}>Assign Applicants</Text>
                    {assigningToJob && (
                      <Text style={dynamicStyles.assignJobTitle} numberOfLines={1}>
                        {assigningToJob.title}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setAssignApplicantsModalVisible(false);
                    setSelectedApplicants([]);
                    setApplicantSearchQuery('');
                  }}
                  style={dynamicStyles.assignCloseButton}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Search Bar with Enhanced Design */}
              <View style={dynamicStyles.assignSearchWrapper}>
                <View style={dynamicStyles.assignSearchContainer}>
                  <Ionicons name="search" size={20} color="#94A3B8" style={dynamicStyles.assignSearchIcon} />
                  <TextInput
                    style={dynamicStyles.assignSearchInput}
                    placeholder="Search by name, email, or phone..."
                    placeholderTextColor="#94A3B8"
                    value={applicantSearchQuery}
                    onChangeText={setApplicantSearchQuery}
                  />
                  {applicantSearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setApplicantSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Selection Info Bar */}
              <View style={dynamicStyles.assignSelectionBar}>
                <View style={dynamicStyles.assignSelectionLeft}>
                  <View style={dynamicStyles.assignCountBadge}>
                    <Text style={dynamicStyles.assignCountText}>{selectedApplicants.length}</Text>
                  </View>
                  <Text style={dynamicStyles.assignSelectionText}>
                    of {getFilteredApplicants().length} selected
                  </Text>
                  {selectedApplicants.length >= 500 && (
                    <View style={dynamicStyles.assignLimitBadge}>
                      <Text style={dynamicStyles.assignLimitText}>MAX</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={dynamicStyles.assignSelectAllBtn}
                  onPress={toggleSelectAllApplicants}
                >
                  <Ionicons 
                    name={selectedApplicants.length === getFilteredApplicants().length ? "checkbox" : "square-outline"} 
                    size={18} 
                    color="#8B5CF6" 
                  />
                  <Text style={dynamicStyles.assignSelectAllText}>
                    {selectedApplicants.length === getFilteredApplicants().length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Applicants List with Enhanced Cards */}
              {loadingApplicants ? (
                <View style={dynamicStyles.assignLoadingContainer}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <Text style={dynamicStyles.assignLoadingText}>Loading applicants...</Text>
                </View>
              ) : (
                <ScrollView 
                  style={dynamicStyles.assignApplicantsList}
                  showsVerticalScrollIndicator={false}
                >
                  {getFilteredApplicants().map((applicant, index) => (
                    <TouchableOpacity
                      key={applicant._id}
                      style={[
                        dynamicStyles.assignApplicantCard,
                        selectedApplicants.includes(applicant._id) && dynamicStyles.assignApplicantCardSelected,
                        index === 0 && { marginTop: 0 }
                      ]}
                      onPress={() => toggleSelectApplicant(applicant._id)}
                      activeOpacity={0.7}
                    >
                      <View style={dynamicStyles.assignApplicantLeft}>
                        <View style={[
                          dynamicStyles.assignCheckbox,
                          selectedApplicants.includes(applicant._id) && dynamicStyles.assignCheckboxSelected
                        ]}>
                          {selectedApplicants.includes(applicant._id) && (
                            <Ionicons name="checkmark" size={16} color="#FFF" />
                          )}
                        </View>
                        <View style={dynamicStyles.assignApplicantAvatar}>
                          <Text style={dynamicStyles.assignAvatarText}>
                            {(applicant.firstName?.[0] || '') + (applicant.lastName?.[0] || '')}
                          </Text>
                        </View>
                        <View style={dynamicStyles.assignApplicantDetails}>
                          <Text style={dynamicStyles.assignApplicantName}>
                            {applicant.firstName} {applicant.lastName}
                          </Text>
                          <View style={dynamicStyles.assignContactRow}>
                            <Ionicons name="mail-outline" size={12} color="#64748B" />
                            <Text style={dynamicStyles.assignApplicantEmail} numberOfLines={1}>
                              {applicant.email}
                            </Text>
                          </View>
                          {applicant.phone && (
                            <View style={dynamicStyles.assignContactRow}>
                              <Ionicons name="call-outline" size={12} color="#64748B" />
                              <Text style={dynamicStyles.assignApplicantPhone}>{applicant.phone}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {selectedApplicants.includes(applicant._id) && (
                        <View style={dynamicStyles.assignSelectedIndicator}>
                          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                  {getFilteredApplicants().length === 0 && (
                    <View style={dynamicStyles.assignEmptyState}>
                      <View style={dynamicStyles.assignEmptyIconContainer}>
                        <Ionicons name="people-outline" size={48} color="#CBD5E1" />
                      </View>
                      <Text style={dynamicStyles.assignEmptyTitle}>No applicants found</Text>
                      <Text style={dynamicStyles.assignEmptySubtitle}>
                        {applicantSearchQuery ? 'Try adjusting your search' : 'No job seekers available'}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}

              {/* Enhanced Footer */}
              <View style={dynamicStyles.assignModalFooter}>
                <TouchableOpacity
                  style={dynamicStyles.assignCancelButton}
                  onPress={() => {
                    setAssignApplicantsModalVisible(false);
                    setSelectedApplicants([]);
                    setApplicantSearchQuery('');
                  }}
                >
                  <Text style={dynamicStyles.assignCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    dynamicStyles.assignSubmitButton,
                    selectedApplicants.length === 0 && dynamicStyles.assignSubmitButtonDisabled
                  ]}
                  onPress={handleSubmitAssignment}
                  disabled={selectedApplicants.length === 0 || loadingApplicants}
                  activeOpacity={0.8}
                >
                  {loadingApplicants ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                      <Text style={dynamicStyles.assignSubmitButtonText}>
                        Assign {selectedApplicants.length > 0 ? `(${selectedApplicants.length})` : ''}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Invite Candidates Modal */}
        <Modal
          visible={inviteCandidatesModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setInviteCandidatesModalVisible(false)}
        >
          <View style={dynamicStyles.assignModalOverlay}>
            <View style={dynamicStyles.assignModalContainer}>
              {/* Enhanced Header */}
              <View style={dynamicStyles.assignModalHeader}>
                <View style={dynamicStyles.assignHeaderLeft}>
                  <View style={[dynamicStyles.assignIconContainer, { backgroundColor: '#DBEAFE' }]}>
                    <Ionicons name="mail" size={24} color="#3B82F6" />
                  </View>
                  <View style={dynamicStyles.assignHeaderText}>
                    <Text style={dynamicStyles.assignModalTitle}>Invite Candidates</Text>
                    {invitingToJob && (
                      <Text style={dynamicStyles.assignJobTitle} numberOfLines={1}>
                        {invitingToJob.title}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setInviteCandidatesModalVisible(false);
                    setSelectedCandidates([]);
                    setCandidateSearchQuery('');
                    setInvitationMessage('');
                  }}
                  style={dynamicStyles.assignCloseButton}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Invitation Message */}
              <View style={dynamicStyles.inviteMessageSection}>
                <Text style={dynamicStyles.inviteMessageLabel}>Invitation Message</Text>
                <TextInput
                  style={dynamicStyles.inviteMessageInput}
                  placeholder="Enter a personalized message for candidates..."
                  placeholderTextColor="#94A3B8"
                  value={invitationMessage}
                  onChangeText={setInvitationMessage}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Search Bar */}
              <View style={dynamicStyles.assignSearchWrapper}>
                <View style={dynamicStyles.assignSearchContainer}>
                  <Ionicons name="search" size={20} color="#94A3B8" style={dynamicStyles.assignSearchIcon} />
                  <TextInput
                    style={dynamicStyles.assignSearchInput}
                    placeholder="Search by name, email, or phone..."
                    placeholderTextColor="#94A3B8"
                    value={candidateSearchQuery}
                    onChangeText={setCandidateSearchQuery}
                  />
                  {candidateSearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setCandidateSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Selection Info Bar */}
              <View style={dynamicStyles.assignSelectionBar}>
                <View style={dynamicStyles.assignSelectionLeft}>
                  <View style={[dynamicStyles.assignCountBadge, { backgroundColor: '#3B82F6' }]}>
                    <Text style={dynamicStyles.assignCountText}>{selectedCandidates.length}</Text>
                  </View>
                  <Text style={dynamicStyles.assignSelectionText}>
                    of {getFilteredCandidates().length} selected
                  </Text>
                  {selectedCandidates.length >= 10000 && (
                    <View style={dynamicStyles.assignLimitBadge}>
                      <Text style={dynamicStyles.assignLimitText}>MAX</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={dynamicStyles.assignSelectAllBtn}
                  onPress={toggleSelectAllCandidates}
                >
                  <Ionicons 
                    name={selectedCandidates.length === getFilteredCandidates().length ? "checkbox" : "square-outline"} 
                    size={18} 
                    color="#3B82F6" 
                  />
                  <Text style={[dynamicStyles.assignSelectAllText, { color: '#3B82F6' }]}>
                    {selectedCandidates.length === getFilteredCandidates().length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Candidates List */}
              {loadingCandidates ? (
                <View style={dynamicStyles.assignLoadingContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={dynamicStyles.assignLoadingText}>Loading candidates...</Text>
                </View>
              ) : (
                <ScrollView 
                  style={dynamicStyles.assignApplicantsList}
                  showsVerticalScrollIndicator={false}
                >
                  {getFilteredCandidates().map((candidate, index) => (
                    <TouchableOpacity
                      key={candidate._id}
                      style={[
                        dynamicStyles.assignApplicantCard,
                        selectedCandidates.includes(candidate._id) && [dynamicStyles.assignApplicantCardSelected, { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' }],
                        index === 0 && { marginTop: 0 }
                      ]}
                      onPress={() => toggleSelectCandidate(candidate._id)}
                      activeOpacity={0.7}
                    >
                      <View style={dynamicStyles.assignApplicantLeft}>
                        <View style={[
                          dynamicStyles.assignCheckbox,
                          selectedCandidates.includes(candidate._id) && [dynamicStyles.assignCheckboxSelected, { backgroundColor: '#3B82F6', borderColor: '#3B82F6' }]
                        ]}>
                          {selectedCandidates.includes(candidate._id) && (
                            <Ionicons name="checkmark" size={16} color="#FFF" />
                          )}
                        </View>
                        <View style={dynamicStyles.assignApplicantAvatar}>
                          <Text style={dynamicStyles.assignAvatarText}>
                            {(candidate.firstName?.[0] || '') + (candidate.lastName?.[0] || '')}
                          </Text>
                        </View>
                        <View style={dynamicStyles.assignApplicantDetails}>
                          <Text style={dynamicStyles.assignApplicantName}>
                            {candidate.firstName} {candidate.lastName}
                          </Text>
                          <View style={dynamicStyles.assignContactRow}>
                            <Ionicons name="mail-outline" size={12} color="#64748B" />
                            <Text style={dynamicStyles.assignApplicantEmail} numberOfLines={1}>
                              {candidate.email}
                            </Text>
                          </View>
                          {candidate.phone && (
                            <View style={dynamicStyles.assignContactRow}>
                              <Ionicons name="call-outline" size={12} color="#64748B" />
                              <Text style={dynamicStyles.assignApplicantPhone}>{candidate.phone}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {selectedCandidates.includes(candidate._id) && (
                        <View style={dynamicStyles.assignSelectedIndicator}>
                          <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                  {getFilteredCandidates().length === 0 && (
                    <View style={dynamicStyles.assignEmptyState}>
                      <View style={dynamicStyles.assignEmptyIconContainer}>
                        <Ionicons 
                          name={availableCandidates.length === 0 ? "alert-circle-outline" : "search-outline"} 
                          size={48} 
                          color={availableCandidates.length === 0 ? "#F59E0B" : "#CBD5E1"} 
                        />
                      </View>
                      <Text style={dynamicStyles.assignEmptyTitle}>
                        {candidateSearchQuery 
                          ? 'No matching candidates' 
                          : availableCandidates.length === 0 
                            ? 'No candidates available' 
                            : 'No candidates found'}
                      </Text>
                      <Text style={dynamicStyles.assignEmptySubtitle}>
                        {candidateSearchQuery 
                          ? 'Try adjusting your search terms' 
                          : availableCandidates.length === 0 
                            ? 'No job seekers in database or all have been invited.\n\nTo add test candidates:\n1. Open terminal\n2. cd server\n3. node seed-jobseekers.js' 
                            : 'No candidates match the current filters'}
                      </Text>
                      {availableCandidates.length === 0 && !candidateSearchQuery && (
                        <View style={{ marginTop: 16, padding: 12, backgroundColor: '#FEF3C7', borderRadius: 8, borderWidth: 1, borderColor: '#FCD34D' }}>
                          <Text style={{ fontSize: 12, color: '#92400E', textAlign: 'center', lineHeight: 18 }}>
                            💡 Check browser console and server logs for detailed debugging information
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </ScrollView>
              )}

              {/* Enhanced Footer */}
              <View style={dynamicStyles.assignModalFooter}>
                <TouchableOpacity
                  style={dynamicStyles.assignCancelButton}
                  onPress={() => {
                    setInviteCandidatesModalVisible(false);
                    setSelectedCandidates([]);
                    setCandidateSearchQuery('');
                    setInvitationMessage('');
                  }}
                >
                  <Text style={dynamicStyles.assignCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    dynamicStyles.assignSubmitButton,
                    { backgroundColor: '#3B82F6' },
                    selectedCandidates.length === 0 && dynamicStyles.assignSubmitButtonDisabled
                  ]}
                  onPress={handleSubmitInvitations}
                  disabled={selectedCandidates.length === 0 || loadingCandidates}
                  activeOpacity={0.8}
                >
                  {loadingCandidates ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="mail" size={20} color="#FFF" />
                      <Text style={dynamicStyles.assignSubmitButtonText}>
                        Invite {selectedCandidates.length > 0 ? `(${selectedCandidates.length})` : ''}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Job Labels Modal */}
        <Modal
          visible={labelModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLabelModalVisible(false)}
        >
          <View style={dynamicStyles.assignModalOverlay}>
            <View style={[dynamicStyles.assignModalContainer, { maxWidth: 550, maxHeight: '90%' }]}>
              {/* Enhanced Header */}
              <View style={[dynamicStyles.assignModalHeader, { 
                backgroundColor: '#F59E0B', 
                paddingVertical: 20,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }]}>
                <View style={dynamicStyles.assignHeaderLeft}>
                  <View style={[dynamicStyles.assignIconContainer, { 
                    backgroundColor: '#FFF', 
                    width: 48, 
                    height: 48,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }]}>
                    <Ionicons name="pricetags" size={26} color="#F59E0B" />
                  </View>
                  <View style={dynamicStyles.assignHeaderText}>
                    <Text style={[dynamicStyles.assignModalTitle, { color: '#FFF', fontSize: 20 }]}>Manage Job Labels</Text>
                    {labelingJob && (
                      <Text style={[dynamicStyles.assignJobTitle, { color: '#FFF', opacity: 0.9, fontSize: 13 }]} numberOfLines={1}>
                        {labelingJob.title}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setLabelModalVisible(false)}
                  style={[dynamicStyles.assignCloseButton, { 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }]}
                >
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Labels List */}
              <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: '#64748B', 
                  marginBottom: 20,
                  lineHeight: 20,
                  textAlign: 'center',
                }}>
                  Toggle labels to highlight this job with special badges
                </Text>

                {/* Premium Job */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 18,
                    backgroundColor: labelingJob?.premium ? '#FFFBEB' : '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: labelingJob?.premium ? '#FFD700' : '#E2E8F0',
                    marginBottom: 14,
                    shadowColor: labelingJob?.premium ? '#FFD700' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: labelingJob?.premium ? 0.15 : 0.05,
                    shadowRadius: 8,
                    elevation: labelingJob?.premium ? 4 : 2,
                  }}
                  onPress={() => handleToggleLabel(labelingJob._id, 'premium', labelingJob.premium)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 24, 
                      backgroundColor: '#FFD700', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: 14,
                      shadowColor: '#FFD700',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }}>
                      <Ionicons name="diamond" size={24} color="#000" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 3 }}>Premium Job</Text>
                      <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 18 }}>Highlight as premium listing</Text>
                    </View>
                  </View>
                  <View style={{
                    width: 56,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: labelingJob?.premium ? '#FFD700' : '#CBD5E1',
                    padding: 3,
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}>
                    <View style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: '#FFF',
                      alignSelf: labelingJob?.premium ? 'flex-end' : 'flex-start',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                      elevation: 2,
                    }} />
                  </View>
                </TouchableOpacity>

                {/* Featured Job */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 18,
                    backgroundColor: labelingJob?.featured ? '#EFF6FF' : '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: labelingJob?.featured ? '#3B82F6' : '#E2E8F0',
                    marginBottom: 14,
                    shadowColor: labelingJob?.featured ? '#3B82F6' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: labelingJob?.featured ? 0.15 : 0.05,
                    shadowRadius: 8,
                    elevation: labelingJob?.featured ? 4 : 2,
                  }}
                  onPress={() => handleToggleLabel(labelingJob._id, 'featured', labelingJob.featured)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 24, 
                      backgroundColor: '#3B82F6', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: 14,
                      shadowColor: '#3B82F6',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }}>
                      <Ionicons name="star" size={24} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 3 }}>Featured Job</Text>
                      <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 18 }}>Show in featured section</Text>
                    </View>
                  </View>
                  <View style={{
                    width: 56,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: labelingJob?.featured ? '#3B82F6' : '#CBD5E1',
                    padding: 3,
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}>
                    <View style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: '#FFF',
                      alignSelf: labelingJob?.featured ? 'flex-end' : 'flex-start',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                      elevation: 2,
                    }} />
                  </View>
                </TouchableOpacity>

                {/* Starred Job */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 18,
                    backgroundColor: labelingJob?.starred ? '#FEF3C7' : '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: labelingJob?.starred ? '#F59E0B' : '#E2E8F0',
                    marginBottom: 14,
                    shadowColor: labelingJob?.starred ? '#F59E0B' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: labelingJob?.starred ? 0.15 : 0.05,
                    shadowRadius: 8,
                    elevation: labelingJob?.starred ? 4 : 2,
                  }}
                  onPress={() => handleToggleLabel(labelingJob._id, 'starred', labelingJob.starred)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 24, 
                      backgroundColor: '#F59E0B', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: 14,
                      shadowColor: '#F59E0B',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }}>
                      <Ionicons name="star-half" size={24} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 3 }}>Starred Job</Text>
                      <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 18 }}>Mark as important</Text>
                    </View>
                  </View>
                  <View style={{
                    width: 56,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: labelingJob?.starred ? '#F59E0B' : '#CBD5E1',
                    padding: 3,
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}>
                    <View style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: '#FFF',
                      alignSelf: labelingJob?.starred ? 'flex-end' : 'flex-start',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                      elevation: 2,
                    }} />
                  </View>
                </TouchableOpacity>

                {/* Urgent Job */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 18,
                    backgroundColor: labelingJob?.urgent ? '#FEE2E2' : '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: labelingJob?.urgent ? '#EF4444' : '#E2E8F0',
                    marginBottom: 14,
                    shadowColor: labelingJob?.urgent ? '#EF4444' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: labelingJob?.urgent ? 0.15 : 0.05,
                    shadowRadius: 8,
                    elevation: labelingJob?.urgent ? 4 : 2,
                  }}
                  onPress={() => handleToggleLabel(labelingJob._id, 'urgent', labelingJob.urgent)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 24, 
                      backgroundColor: '#EF4444', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: 14,
                      shadowColor: '#EF4444',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }}>
                      <Ionicons name="flash" size={24} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 3 }}>Urgent Job</Text>
                      <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 18 }}>Requires immediate attention</Text>
                    </View>
                  </View>
                  <View style={{
                    width: 56,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: labelingJob?.urgent ? '#EF4444' : '#CBD5E1',
                    padding: 3,
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}>
                    <View style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: '#FFF',
                      alignSelf: labelingJob?.urgent ? 'flex-end' : 'flex-start',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                      elevation: 2,
                    }} />
                  </View>
                </TouchableOpacity>

                {/* Actively Hiring */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 18,
                    backgroundColor: labelingJob?.activelyHiring ? '#D1FAE5' : '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: labelingJob?.activelyHiring ? '#10B981' : '#E2E8F0',
                    marginBottom: 14,
                    shadowColor: labelingJob?.activelyHiring ? '#10B981' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: labelingJob?.activelyHiring ? 0.15 : 0.05,
                    shadowRadius: 8,
                    elevation: labelingJob?.activelyHiring ? 4 : 2,
                  }}
                  onPress={() => handleToggleLabel(labelingJob._id, 'activelyHiring', labelingJob.activelyHiring)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 24, 
                      backgroundColor: '#10B981', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: 14,
                      shadowColor: '#10B981',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }}>
                      <Ionicons name="people" size={24} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 3 }}>Actively Hiring</Text>
                      <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 18 }}>Currently accepting applications</Text>
                    </View>
                  </View>
                  <View style={{
                    width: 56,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: labelingJob?.activelyHiring ? '#10B981' : '#CBD5E1',
                    padding: 3,
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}>
                    <View style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: '#FFF',
                      alignSelf: labelingJob?.activelyHiring ? 'flex-end' : 'flex-start',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                      elevation: 2,
                    }} />
                  </View>
                </TouchableOpacity>
              </ScrollView>

              {/* Enhanced Footer */}
              <View style={[dynamicStyles.assignModalFooter, { 
                borderTopWidth: 1, 
                borderTopColor: '#E2E8F0',
                paddingVertical: 16,
                paddingHorizontal: 24,
              }]}>
                <TouchableOpacity
                  style={[dynamicStyles.assignCancelButton, { 
                    flex: 1,
                    backgroundColor: '#F1F5F9',
                    paddingVertical: 14,
                    borderRadius: 12,
                  }]}
                  onPress={() => setLabelModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[dynamicStyles.assignCancelButtonText, { 
                    fontSize: 16, 
                    fontWeight: '600',
                    color: '#475569',
                  }]}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: isMobile ? 12 : isTablet ? 16 : 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    color: '#666',
  },
  headerSection: {
    marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      ':focus-within': {
        borderColor: '#3B82F6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
    } : {
      elevation: 1,
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
    outlineStyle: 'none',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
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
    borderRadius: 16,
    padding: 20,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      ':hover': {
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        borderColor: '#3B82F6',
      },
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    }),
  },
  statCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)',
    } : {
      elevation: 4,
    }),
  },
  statCardValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  statCardLabel: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
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
  // Sort By Styles
  sortBySection: {
    marginTop: 16,
    marginBottom: 16,
  },
  sortByHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sortByTitle: {
    fontSize: isMobile ? 14 : 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  sortByScroll: {
    marginBottom: 8,
  },
  sortByContent: {
    flexDirection: 'row',
    gap: 8,
  },
  sortByButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  sortByButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  sortByButtonText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '600',
    color: '#666',
  },
  sortByButtonTextActive: {
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: isMobile ? '100%' : isTablet ? '80%' : '500px',
    maxWidth: 500,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: isMobile ? 20 : 24,
    paddingVertical: isMobile ? 16 : 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#F3F4F6',
        transform: 'rotate(90deg)',
      },
    }),
  },
  modalBody: {
    padding: isMobile ? 20 : 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: isMobile ? 13 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minWidth: 100,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        borderColor: '#3B82F6',
        backgroundColor: '#F8FAFC',
      },
    } : {}),
  },
  activeFilter: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
    } : {
      elevation: 3,
    }),
  },
  filterButtonText: {
    fontSize: isMobile ? 13 : isTablet ? 14 : 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  bulkActionsBar: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    gap: isMobile ? 8 : 10,
    marginBottom: isMobile ? 12 : isTablet ? 14 : 15,
    ...(Platform.OS === 'web' && {
      flexWrap: isMobile ? 'wrap' : 'nowrap',
    }),
  },
  bulkActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    }),
  },
  bulkActionButtonText: {
    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
    fontWeight: '600',
    color: '#374151',
  },
  statsBar: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    elevation: 1,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tableContainer: {
    flex: 1,
    marginTop: 16,
  },
  table: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    } : {
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    }),
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: isMobile ? 12 : 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    display: isMobile ? 'none' : 'flex',
    ...(Platform.OS === 'web' && {
      display: isMobile ? 'none' : 'flex',
    }),
  },
  tableHeaderText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: isMobile ? 'column' : 'row',
    paddingVertical: isMobile ? 16 : 16,
    paddingHorizontal: isMobile ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? 0 : 0,
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#F8FAFC',
        transform: 'translateX(2px)',
      },
    }),
  },
  tableCellText: {
    fontSize: isMobile ? 13 : isTablet ? 14 : 14,
    color: '#1E293B',
    marginBottom: isMobile ? 8 : 0,
    fontWeight: '500',
    ...(Platform.OS === 'web' && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  },
  titleColumn: {
    flex: 2.5,
    paddingRight: 12,
  },
  companyColumn: {
    flex: 2,
    paddingRight: 12,
  },
  locationColumn: {
    flex: 1.5,
    paddingRight: 12,
  },
  statusColumn: {
    flex: 1.2,
    paddingRight: 12,
  },
  postedColumn: {
    flex: 1.5,
    paddingRight: 12,
  },
  actionsColumn: {
    flex: 2,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  jobTitle: {
    fontWeight: '600',
    color: '#3B82F6',
    fontSize: isMobile ? 14 : 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    minWidth: 80,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E2E8F0',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  deleteButton: {
    marginLeft: 4,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    color: '#999',
    marginTop: 15,
  },
  // Enhanced Assign Applicants Modal Styles
  assignModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? 16 : 24,
  },
  assignModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: isMobile ? '100%' : isTablet ? 600 : 700,
    maxHeight: isMobile ? '90%' : '85%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    } : {
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    }),
  },
  assignModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: isMobile ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  inviteMessageSection: {
    paddingHorizontal: isMobile ? 16 : 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  inviteMessageLabel: {
    fontSize: isMobile ? 13 : 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inviteMessageInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: isMobile ? 13 : 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 80,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  },
  assignHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  assignIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignHeaderText: {
    flex: 1,
  },
  assignModalTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  assignJobTitle: {
    fontSize: isMobile ? 13 : 14,
    color: '#64748B',
    fontWeight: '500',
  },
  assignCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#F1F5F9',
      },
    }),
  },
  assignSearchWrapper: {
    paddingHorizontal: isMobile ? 16 : 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  assignSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  assignSearchIcon: {
    marginRight: 4,
  },
  assignSearchInput: {
    flex: 1,
    fontSize: isMobile ? 14 : 15,
    color: '#1E293B',
    outlineStyle: 'none',
  },
  assignSelectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  assignSelectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignCountBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  assignCountText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 13 : 14,
    fontWeight: '700',
  },
  assignSelectionText: {
    fontSize: isMobile ? 13 : 14,
    color: '#64748B',
    fontWeight: '500',
  },
  assignLimitBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  assignLimitText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  assignSelectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#F8FAFC',
        borderColor: '#8B5CF6',
      },
    }),
  },
  assignSelectAllText: {
    fontSize: isMobile ? 12 : 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  assignLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  assignLoadingText: {
    marginTop: 16,
    fontSize: isMobile ? 14 : 15,
    color: '#64748B',
    fontWeight: '500',
  },
  assignApplicantsList: {
    flex: 1,
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: 16,
  },
  assignApplicantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isMobile ? 12 : 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        borderColor: '#CBD5E1',
        backgroundColor: '#F8FAFC',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    } : {
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    }),
  },
  assignApplicantCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FAF5FF',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
    } : {
      elevation: 2,
    }),
  },
  assignApplicantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  assignCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignCheckboxSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  assignApplicantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
  assignApplicantDetails: {
    flex: 1,
    gap: 4,
  },
  assignApplicantName: {
    fontSize: isMobile ? 14 : 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  assignContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignApplicantEmail: {
    fontSize: isMobile ? 12 : 13,
    color: '#64748B',
    flex: 1,
  },
  assignApplicantPhone: {
    fontSize: isMobile ? 12 : 13,
    color: '#64748B',
  },
  assignSelectedIndicator: {
    marginLeft: 8,
  },
  assignEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  assignEmptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  assignEmptyTitle: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  assignEmptySubtitle: {
    fontSize: isMobile ? 13 : 14,
    color: '#94A3B8',
  },
  assignModalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: isMobile ? 16 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  assignCancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#F8FAFC',
        borderColor: '#CBD5E1',
      },
    }),
  },
  assignCancelButtonText: {
    color: '#475569',
    fontSize: isMobile ? 14 : 15,
    fontWeight: '600',
  },
  assignSubmitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#8B5CF6',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)',
      ':hover': {
        backgroundColor: '#7C3AED',
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 8px -1px rgba(139, 92, 246, 0.4)',
      },
    } : {
      elevation: 3,
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    }),
  },
  assignSubmitButtonDisabled: {
    backgroundColor: '#CBD5E1',
    ...(Platform.OS === 'web' ? {
      cursor: 'not-allowed',
      boxShadow: 'none',
      ':hover': {
        backgroundColor: '#CBD5E1',
        transform: 'none',
      },
    } : {
      elevation: 0,
    }),
  },
  assignSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 14 : 15,
    fontWeight: '700',
  },
  checkboxColumn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkActionButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  modalSubtitle: {
    fontSize: isMobile ? 13 : 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

const styles = StyleSheet.create({});

export default AdminJobsScreen;

