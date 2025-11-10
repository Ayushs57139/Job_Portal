import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Platform, Dimensions } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

const AdminJobsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, filterStatus, jobs]);

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
    } catch (error) {
      console.error('Error fetching jobs:', error);
      Alert.alert('Error', 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

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

    if (filterStatus === 'ACTIVE') {
      filtered = filtered.filter(job => job.status === 'active' || job.status === 'ACTIVE');
    } else if (filterStatus === 'INACTIVE') {
      filtered = filtered.filter(job => job.status !== 'active' && job.status !== 'ACTIVE');
    }

    setFilteredJobs(filtered);
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

  const handleBulkExport = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(`${API_URL}/bulk/export/jobs`, { headers });
      const csvData = await response.text();

      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'jobs_export.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        Alert.alert('Success', 'Jobs exported successfully!');
      } else {
        Alert.alert('Success', 'Export functionality is available on web platform');
      }
    } catch (error) {
      console.error('Error exporting jobs:', error);
      Alert.alert('Error', 'Failed to export jobs');
    }
  };

  const handleBulkImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        formData.append('file', result.assets[0].file);
      } else {
        formData.append('file', {
          uri: result.assets[0].uri,
          type: 'text/csv',
          name: result.assets[0].name,
        });
      }

      const response = await fetch(`${API_URL}/bulk/import/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to import jobs');
      }

      Alert.alert(
        'Import Complete',
        `Total: ${data.results.total}\nSuccess: ${data.results.success}\nFailed: ${data.results.failed}${data.results.errors.length > 0 ? '\n\nErrors:\n' + data.results.errors.slice(0, 5).join('\n') : ''}`,
        [{ text: 'OK', onPress: fetchJobs }]
      );
    } catch (error) {
      console.error('Error importing jobs:', error);
      Alert.alert('Error', error.message || 'Failed to import jobs');
    }
  };

  const handleDownloadSample = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(`${API_URL}/bulk/sample/jobs`, { headers });
      const csvData = await response.text();

      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample_jobs_import.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        Alert.alert('Success', 'Sample CSV downloaded successfully!');
      } else {
        Alert.alert('Success', 'Download functionality is available on web platform');
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

  if (loading) {
    return (
      <AdminLayout
        title="Jobs"
        activeScreen="AdminJobs"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading jobs...</Text>
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
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>Job Management</Text>
            <Text style={styles.pageSubtitle}>Manage all job postings</Text>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, filterStatus === 'ALL' && styles.activeFilter]}
                onPress={() => setFilterStatus('ALL')}
              >
                <Text style={[styles.filterButtonText, filterStatus === 'ALL' && styles.activeFilterText]}>
                  All Jobs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterStatus === 'ACTIVE' && styles.activeFilter]}
                onPress={() => setFilterStatus('ACTIVE')}
              >
                <Text style={[styles.filterButtonText, filterStatus === 'ACTIVE' && styles.activeFilterText]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterStatus === 'INACTIVE' && styles.activeFilter]}
                onPress={() => setFilterStatus('INACTIVE')}
              >
                <Text style={[styles.filterButtonText, filterStatus === 'INACTIVE' && styles.activeFilterText]}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bulkActionsBar}>
            <TouchableOpacity style={styles.bulkActionButton} onPress={handleDownloadSample}>
              <Ionicons name="document-text-outline" size={18} color="#4A90E2" />
              <Text style={styles.bulkActionButtonText}>Sample CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkActionButton} onPress={handleBulkImport}>
              <Ionicons name="cloud-upload-outline" size={18} color="#10B981" />
              <Text style={styles.bulkActionButtonText}>Bulk Import</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkActionButton} onPress={handleBulkExport}>
              <Ionicons name="cloud-download-outline" size={18} color="#F59E0B" />
              <Text style={styles.bulkActionButtonText}>Bulk Export</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsBar}>
            <Text style={styles.statsText}>Total Jobs: {filteredJobs.length}</Text>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.table}>
              {!isMobile && (
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.titleColumn]}>Job Title</Text>
                  <Text style={[styles.tableHeaderText, styles.companyColumn]}>Company</Text>
                  <Text style={[styles.tableHeaderText, styles.locationColumn]}>Location</Text>
                  <Text style={[styles.tableHeaderText, styles.statusColumn]}>Status</Text>
                  <Text style={[styles.tableHeaderText, styles.postedColumn]}>Posted</Text>
                  <Text style={[styles.tableHeaderText, styles.actionsColumn]}>Actions</Text>
                </View>
              )}

              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <View key={job._id || index} style={styles.tableRow}>
                    {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4 }]}>Job Title:</Text>}
                    <Text style={[styles.tableCellText, styles.titleColumn, styles.jobTitle]}>
                      {job.title || 'N/A'}
                    </Text>
                    {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Company:</Text>}
                    <Text style={[styles.tableCellText, styles.companyColumn]}>
                      {typeof job.company === 'object' ? (job.company?.name || 'N/A') : (job.company || job.postedBy?.companyName || 'N/A')}
                    </Text>
                    {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Location:</Text>}
                    <Text style={[styles.tableCellText, styles.locationColumn]}>
                      {typeof job.location === 'object' 
                        ? `${job.location?.city || ''}${job.location?.city && job.location?.state ? ', ' : ''}${job.location?.state || ''}`.trim() || 'N/A'
                        : (job.location || 'N/A')}
                    </Text>
                    {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Status:</Text>}
                    <View style={styles.statusColumn}>
                      <TouchableOpacity
                        style={[
                          styles.statusBadge,
                          job.status === 'active' ? styles.activeBadge : styles.inactiveBadge,
                        ]}
                        onPress={() => toggleJobStatus(job._id, job.status)}
                      >
                        <Text style={styles.statusBadgeText}>
                          {job.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Posted:</Text>}
                    <Text style={[styles.tableCellText, styles.postedColumn]}>
                      {formatDate(job.createdAt)}
                    </Text>
                    {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Actions:</Text>}
                    <View style={styles.actionsColumn}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('AdminJobDetails', { jobId: job._id })}
                      >
                        <Ionicons name="eye-outline" size={isMobile ? 16 : 18} color="#4A90E2" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => deleteJob(job._id)}
                      >
                        <Ionicons name="trash-outline" size={isMobile ? 16 : 18} color="#E74C3C" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="briefcase-outline" size={isMobile ? 48 : 64} color="#CCC" />
                  <Text style={styles.emptyStateText}>No jobs found</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  container: {
    padding: isMobile ? 0 : isTablet ? 8 : 12,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: isMobile ? 14 : 16,
    color: '#666',
  },
  headerSection: {
    marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
  },
  pageTitle: {
    fontSize: isMobile ? 22 : isTablet ? 24 : 28,
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
    marginBottom: isMobile ? 12 : 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: isMobile ? 10 : 12,
    marginBottom: isMobile ? 12 : 15,
  },
  searchIcon: {
    marginRight: isMobile ? 6 : 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: isMobile ? 10 : 12,
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: isMobile ? 8 : 10,
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  },
  filterButton: {
    flex: isMobile ? 0 : 1,
    paddingVertical: isMobile ? 8 : 10,
    paddingHorizontal: isMobile ? 12 : 15,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    minWidth: isMobile ? '48%' : 'auto',
    marginBottom: isMobile ? 8 : 0,
  },
  activeFilter: {
    backgroundColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: '#FFF',
  },
  bulkActionsBar: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    gap: isMobile ? 8 : 10,
    marginBottom: isMobile ? 12 : 15,
  },
  bulkActionButton: {
    flex: isMobile ? 0 : 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: isMobile ? 10 : 12,
    paddingHorizontal: isMobile ? 12 : 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    width: isMobile ? '100%' : 'auto',
  },
  bulkActionButtonText: {
    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
    fontWeight: '600',
    color: '#374151',
  },
  statsBar: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: isMobile ? 10 : 12,
    marginBottom: isMobile ? 12 : 15,
    elevation: 1,
  },
  statsText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '600',
    color: '#333',
  },
  tableContainer: {
    flex: 1,
    width: '100%',
  },
  table: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  tableHeader: {
    flexDirection: isMobile ? 'column' : 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    paddingBottom: isMobile ? 8 : 12,
    marginBottom: isMobile ? 8 : 12,
  },
  tableHeaderText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '600',
    color: '#666',
  },
  tableRow: {
    flexDirection: isMobile ? 'column' : 'row',
    paddingVertical: isMobile ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? 12 : 0,
    backgroundColor: isMobile ? '#F9F9F9' : 'transparent',
    borderRadius: isMobile ? 8 : 0,
    padding: isMobile ? 12 : 0,
  },
  tableCellText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#333',
    marginBottom: isMobile ? 8 : 0,
  },
  titleColumn: {
    flex: isMobile ? 0 : 2.5,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  companyColumn: {
    flex: isMobile ? 0 : 2,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  locationColumn: {
    flex: isMobile ? 0 : 1.5,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  statusColumn: {
    flex: isMobile ? 0 : 1.2,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  postedColumn: {
    flex: isMobile ? 0 : 1.5,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  actionsColumn: {
    flex: isMobile ? 0 : 1.2,
    flexDirection: 'row',
    gap: 8,
    width: isMobile ? '100%' : 'auto',
    marginTop: isMobile ? 8 : 0,
  },
  jobTitle: {
    fontWeight: '500',
    color: '#2980B9',
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
    color: '#27AE60',
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F5F6FA',
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
});

export default AdminJobsScreen;

