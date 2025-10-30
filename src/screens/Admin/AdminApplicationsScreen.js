import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminApplicationsScreen = ({ navigation }) => {
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

  if (loading) {
    return (
      <AdminLayout
        title="Applications"
        activeScreen="AdminApplications"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading applications...</Text>
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
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>Application Management</Text>
            <Text style={styles.pageSubtitle}>Manage all job applications</Text>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by candidate name or job title..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterButtons}>
                {['ALL', 'PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.filterButton, filterStatus === status && styles.activeFilter]}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text style={[styles.filterButtonText, filterStatus === status && styles.activeFilterText]}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.bulkActionsBar}>
            <TouchableOpacity style={styles.bulkActionButton} onPress={handleBulkExport}>
              <Ionicons name="cloud-download-outline" size={18} color="#10B981" />
              <Text style={styles.bulkActionButtonText}>Export All Applications</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsBar}>
            <Text style={styles.statsText}>Total Applications: {filteredApplications.length}</Text>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.candidateColumn]}>Candidate</Text>
                <Text style={[styles.tableHeaderText, styles.jobColumn]}>Job Title</Text>
                <Text style={[styles.tableHeaderText, styles.emailColumn]}>Email</Text>
                <Text style={[styles.tableHeaderText, styles.statusColumn]}>Status</Text>
                <Text style={[styles.tableHeaderText, styles.appliedColumn]}>Applied On</Text>
                <Text style={[styles.tableHeaderText, styles.actionsColumn]}>Actions</Text>
              </View>

              {filteredApplications.length > 0 ? (
                filteredApplications.map((application, index) => {
                  const statusColors = getStatusColor(application.status?.toUpperCase() || 'PENDING');
                  return (
                    <View key={application._id || index} style={styles.tableRow}>
                      <Text style={[styles.tableCellText, styles.candidateColumn, styles.candidateName]}>
                        {application.candidateName || application.candidate?.name || application.fullName || 'N/A'}
                      </Text>
                      <Text style={[styles.tableCellText, styles.jobColumn]}>
                        {application.jobTitle || application.job?.title || 'N/A'}
                      </Text>
                      <Text style={[styles.tableCellText, styles.emailColumn]}>
                        {application.email || application.candidate?.email || 'N/A'}
                      </Text>
                      <View style={styles.statusColumn}>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                            {application.status?.toLowerCase() || 'pending'}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.tableCellText, styles.appliedColumn]}>
                        {formatDate(application.createdAt || application.appliedAt)}
                      </Text>
                      <View style={styles.actionsColumn}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => navigation.navigate('AdminApplicationDetails', { applicationId: application._id })}
                        >
                          <Ionicons name="eye-outline" size={18} color="#4A90E2" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => deleteApplication(application._id)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={64} color="#CCC" />
                  <Text style={styles.emptyStateText}>No applications found</Text>
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
  },
  container: {
    padding: 20,
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
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  pageSubtitle: {
    fontSize: 14,
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
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: 'center',
  },
  tableCellText: {
    fontSize: 14,
    color: '#333',
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
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
});

export default AdminApplicationsScreen;

