import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminApplicationsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchQuery, filterStatus, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/applications`, { headers });
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      Alert.alert('Error', 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(app => app.status?.toUpperCase() === filterStatus);
    }

    setFilteredApplications(filtered);
  };

  const handleBulkExport = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(`${API_URL}/bulk/export/applications`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to export applications');
      }

      const csvData = await response.text();

      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'applications_export.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        Alert.alert('Success', 'Applications exported successfully!');
      } else {
        Alert.alert('Info', 'Export functionality is available on web platform');
      }
    } catch (error) {
      console.error('Error exporting applications:', error);
      Alert.alert('Error', 'Failed to export applications');
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      Alert.alert('Success', 'Application status updated successfully');
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      Alert.alert('Error', 'Failed to update application status');
    }
  };

  const deleteApplication = async (applicationId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this application?',
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

              await fetch(`${API_URL}/admin/applications/${applicationId}`, {
                method: 'DELETE',
                headers
              });
              Alert.alert('Success', 'Application deleted successfully');
              fetchApplications();
            } catch (error) {
              console.error('Error deleting application:', error);
              Alert.alert('Error', 'Failed to delete application');
            }
          }
        }
      ]
    );
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return { bg: 'rgba(243, 156, 18, 0.1)', text: '#F39C12' };
      case 'REVIEWED':
        return { bg: 'rgba(52, 152, 219, 0.1)', text: '#3498DB' };
      case 'SHORTLISTED':
        return { bg: 'rgba(155, 89, 182, 0.1)', text: '#9B59B6' };
      case 'REJECTED':
        return { bg: 'rgba(231, 76, 60, 0.1)', text: '#E74C3C' };
      case 'ACCEPTED':
        return { bg: 'rgba(39, 174, 96, 0.1)', text: '#27AE60' };
      default:
        return { bg: 'rgba(149, 165, 166, 0.1)', text: '#95A5A6' };
    }
  };

  const dynamicStyles = getStyles(isMobile, isTablet);

  if (loading) {
    return (
      <AdminLayout
        title="Applications"
        activeScreen="AdminApplications"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={dynamicStyles.loadingText}>Loading applications...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Applications"
      activeScreen="AdminApplications"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.container}>
          <View style={dynamicStyles.headerSection}>
            <Text style={dynamicStyles.pageTitle}>Application Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage all job applications</Text>
          </View>

          <View style={dynamicStyles.filterSection}>
            <View style={dynamicStyles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={dynamicStyles.searchIcon} />
              <TextInput
                style={dynamicStyles.searchInput}
                placeholder="Search by candidate name or job title..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={dynamicStyles.filterButtons}>
                {['ALL', 'PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[dynamicStyles.filterButton, filterStatus === status && dynamicStyles.activeFilter]}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text style={[dynamicStyles.filterButtonText, filterStatus === status && dynamicStyles.activeFilterText]}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={dynamicStyles.bulkActionsBar}>
            <TouchableOpacity style={dynamicStyles.bulkActionButton} onPress={handleBulkExport}>
              <Ionicons name="cloud-download-outline" size={18} color="#10B981" />
              <Text style={dynamicStyles.bulkActionButtonText}>Export All Applications</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.statsBar}>
            <Text style={dynamicStyles.statsText}>Total Applications: {filteredApplications.length}</Text>
          </View>

          <View style={dynamicStyles.tableContainer}>
            <View style={dynamicStyles.table}>
              <View style={dynamicStyles.tableHeader}>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.candidateColumn]}>Candidate</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.jobColumn]}>Job Title</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.emailColumn]}>Email</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.statusColumn]}>Status</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.appliedColumn]}>Applied On</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.actionsColumn]}>Actions</Text>
              </View>

              {filteredApplications.length > 0 ? (
                filteredApplications.map((application, index) => {
                  const statusColors = getStatusColor(application.status?.toUpperCase() || 'PENDING');
                  return (
                    <View key={application._id || index} style={dynamicStyles.tableRow}>
                      <Text style={[dynamicStyles.tableCellText, dynamicStyles.candidateColumn, dynamicStyles.candidateName]}>
                        {application.candidateName || application.candidate?.name || application.fullName || 'N/A'}
                      </Text>
                      <Text style={[dynamicStyles.tableCellText, dynamicStyles.jobColumn]}>
                        {application.jobTitle || application.job?.title || 'N/A'}
                      </Text>
                      <Text style={[dynamicStyles.tableCellText, dynamicStyles.emailColumn]}>
                        {application.email || application.candidate?.email || 'N/A'}
                      </Text>
                      <View style={dynamicStyles.statusColumn}>
                        <View style={[dynamicStyles.statusBadge, { backgroundColor: statusColors.bg }]}>
                          <Text style={[dynamicStyles.statusBadgeText, { color: statusColors.text }]}>
                            {application.status?.toLowerCase() || 'pending'}
                          </Text>
                        </View>
                      </View>
                      <Text style={[dynamicStyles.tableCellText, dynamicStyles.appliedColumn]}>
                        {formatDate(application.createdAt || application.appliedAt)}
                      </Text>
                      <View style={dynamicStyles.actionsColumn}>
                        <TouchableOpacity
                          style={dynamicStyles.actionButton}
                          onPress={() => navigation.navigate('AdminApplicationDetails', { applicationId: application._id })}
                        >
                          <Ionicons name="eye-outline" size={18} color="#4A90E2" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[dynamicStyles.actionButton, dynamicStyles.deleteButton]}
                          onPress={() => deleteApplication(application._id)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={dynamicStyles.emptyState}>
                  <Ionicons name="document-text-outline" size={64} color="#CCC" />
                  <Text style={dynamicStyles.emptyStateText}>No applications found</Text>
                </View>
              )}
            </View>
          </View>
        </View>
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
    padding: 15,
    marginBottom: 15,
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
  filterButton: {
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
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: '#FFF',
  },
  bulkActionsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    fontSize: 14,
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
  candidateColumn: {
    flex: 2,
  },
  jobColumn: {
    flex: 2.5,
  },
  emailColumn: {
    flex: 2.5,
  },
  statusColumn: {
    flex: 1.5,
  },
  appliedColumn: {
    flex: 1.5,
  },
  actionsColumn: {
    flex: 1.2,
    flexDirection: 'row',
    gap: 8,
  },
  candidateName: {
    fontWeight: '500',
    color: '#C0392B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
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
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    color: '#999',
    marginTop: 15,
  },
});

const styles = StyleSheet.create({});

export default AdminApplicationsScreen;

