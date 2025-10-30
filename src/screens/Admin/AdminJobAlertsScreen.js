import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';

const AdminJobAlertsScreen = ({ navigation }) => {
  const [jobAlerts, setJobAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recent: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load job alerts
      const alertsParams = {
        page: filters.page,
        limit: 10,
      };

      if (filters.search) {
        alertsParams.email = filters.search;
      }

      if (filters.status !== 'all') {
        alertsParams.isActive = filters.status === 'active';
      }

      const [alertsResponse, statsResponse] = await Promise.all([
        api.getJobAlerts(alertsParams),
        api.getJobAlertStats(),
      ]);

      if (alertsResponse.success) {
        setJobAlerts(alertsResponse.data);
        setPagination(alertsResponse.pagination);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading job alerts:', error);
      Alert.alert('Error', 'Failed to load job alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (alertId) => {
    try {
      const response = await api.toggleJobAlertStatus(alertId);
      if (response.success) {
        Alert.alert('Success', response.message);
        loadData();
      }
    } catch (error) {
      console.error('Error toggling alert status:', error);
      Alert.alert('Error', 'Failed to toggle alert status');
    }
  };

  const handleDelete = async (alertId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this job alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.deleteJobAlert(alertId);
              if (response.success) {
                Alert.alert('Success', 'Job alert deleted successfully');
                loadData();
              }
            } catch (error) {
              console.error('Error deleting alert:', error);
              Alert.alert('Error', 'Failed to delete job alert');
            }
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      Alert.alert('Info', 'CSV export functionality coming soon');
      // const blob = await api.exportJobAlerts();
      // Handle blob download in web
    } catch (error) {
      console.error('Error exporting alerts:', error);
      Alert.alert('Error', 'Failed to export job alerts');
    }
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons name="notifications" size={24} color="#3B82F6" />
        <Text style={styles.statValue}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total Alerts</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        <Text style={styles.statValue}>{stats.active}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="close-circle" size={24} color="#EF4444" />
        <Text style={styles.statValue}>{stats.inactive}</Text>
        <Text style={styles.statLabel}>Inactive</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="time" size={24} color="#F59E0B" />
        <Text style={styles.statValue}>{stats.recent}</Text>
        <Text style={styles.statLabel}>Last 30 Days</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by email..."
          value={filters.search}
          onChangeText={(text) => setFilters({ ...filters, search: text, page: 1 })}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.filterButtons}>
        {['all', 'active', 'inactive'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filters.status === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilters({ ...filters, status, page: 1 })}
          >
            <Text
              style={[
                styles.filterButtonText,
                filters.status === status && styles.filterButtonTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <Ionicons name="download" size={20} color="#FFF" />
        <Text style={styles.exportButtonText}>Export CSV</Text>
      </TouchableOpacity>
    </View>
  );

  const renderJobAlert = (alert) => (
    <View key={alert._id} style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.alertHeaderLeft}>
          <Text style={styles.alertName}>{alert.alertName}</Text>
          <View
            style={[
              styles.statusBadge,
              alert.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                alert.isActive ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive,
              ]}
            >
              {alert.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <View style={styles.alertActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleStatus(alert._id)}
          >
            <Ionicons
              name={alert.isActive ? 'pause-circle' : 'play-circle'}
              size={24}
              color={alert.isActive ? '#F59E0B' : '#10B981'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(alert._id)}
          >
            <Ionicons name="trash" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.alertContent}>
        <View style={styles.alertRow}>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Job Title:</Text>
            <Text style={styles.alertFieldValue}>{alert.jobTitle}</Text>
          </View>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Expected Salary:</Text>
            <Text style={styles.alertFieldValue}>₹{alert.expectedSalary?.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.alertRow}>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Experience:</Text>
            <Text style={styles.alertFieldValue}>
              {alert.experienceLevel} - {alert.totalExperience}
            </Text>
          </View>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Job Status:</Text>
            <Text style={styles.alertFieldValue}>{alert.presentJobStatus}</Text>
          </View>
        </View>

        <View style={styles.alertRow}>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Location:</Text>
            <Text style={styles.alertFieldValue}>{alert.workOfficeLocation}</Text>
          </View>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Industry:</Text>
            <Text style={styles.alertFieldValue}>{alert.industry}</Text>
          </View>
        </View>

        <View style={styles.alertRow}>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Department:</Text>
            <Text style={styles.alertFieldValue}>{alert.department}</Text>
          </View>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Sub Industry:</Text>
            <Text style={styles.alertFieldValue}>{alert.subIndustry}</Text>
          </View>
        </View>

        <View style={styles.alertFullRow}>
          <Text style={styles.alertFieldLabel}>Job Roles:</Text>
          <View style={styles.tagsContainer}>
            {alert.jobRoles?.map((role, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{role}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.alertFullRow}>
          <Text style={styles.alertFieldLabel}>Key Skills:</Text>
          <View style={styles.tagsContainer}>
            {alert.keySkills?.map((skill, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.alertRow}>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Email:</Text>
            <Text style={styles.alertFieldValue}>{alert.email}</Text>
          </View>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Mobile:</Text>
            <Text style={styles.alertFieldValue}>{alert.mobile}</Text>
          </View>
        </View>

        <View style={styles.alertRow}>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Alert Frequency:</Text>
            <View style={styles.frequencyBadge}>
              <Ionicons 
                name={alert.alertFrequency === 'daily' ? 'calendar' : alert.alertFrequency === 'weekly' ? 'calendar-outline' : 'calendar-number'} 
                size={16} 
                color="#6366F1" 
              />
              <Text style={styles.frequencyText}>
                {alert.alertFrequency ? alert.alertFrequency.charAt(0).toUpperCase() + alert.alertFrequency.slice(1) : 'Daily'}
              </Text>
            </View>
          </View>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Notifications Sent:</Text>
            <Text style={styles.alertFieldValue}>{alert.notificationCount || 0}</Text>
          </View>
        </View>

        <View style={styles.alertRow}>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Created:</Text>
            <Text style={styles.alertFieldValue}>
              {new Date(alert.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.alertField}>
            <Text style={styles.alertFieldLabel}>Last Notified:</Text>
            <Text style={styles.alertFieldValue}>
              {alert.lastNotified ? new Date(alert.lastNotified).toLocaleDateString() : 'Never'}
            </Text>
          </View>
        </View>

        {alert.userId && (
          <View style={styles.userInfo}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.userInfoText}>
              User ID: {alert.userId._id} | {alert.userId.name || 'N/A'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, filters.page === 1 && styles.paginationButtonDisabled]}
        onPress={() => setFilters({ ...filters, page: filters.page - 1 })}
        disabled={filters.page === 1}
      >
        <Ionicons name="chevron-back" size={20} color={filters.page === 1 ? '#CCC' : '#3B82F6'} />
        <Text style={[styles.paginationButtonText, filters.page === 1 && styles.paginationButtonTextDisabled]}>
          Previous
        </Text>
      </TouchableOpacity>

      <Text style={styles.paginationInfo}>
        Page {pagination.current} of {pagination.pages} ({pagination.total} total)
      </Text>

      <TouchableOpacity
        style={[
          styles.paginationButton,
          filters.page === pagination.pages && styles.paginationButtonDisabled,
        ]}
        onPress={() => setFilters({ ...filters, page: filters.page + 1 })}
        disabled={filters.page === pagination.pages}
      >
        <Text
          style={[
            styles.paginationButtonText,
            filters.page === pagination.pages && styles.paginationButtonTextDisabled,
          ]}
        >
          Next
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={filters.page === pagination.pages ? '#CCC' : '#3B82F6'}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <AdminLayout
      title="Job Alerts"
      activeScreen="AdminJobAlerts"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Job Alerts Management</Text>
            <Text style={styles.pageSubtitle}>
              Manage and monitor all job alert subscriptions
            </Text>
          </View>
        </View>

        {renderStats()}
        {renderFilters()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading job alerts...</Text>
          </View>
        ) : jobAlerts.length > 0 ? (
          <ScrollView
            style={styles.alertsList}
            contentContainerStyle={styles.alertsListContent}
            showsVerticalScrollIndicator={Platform.OS === 'web'}
          >
            {jobAlerts.map(renderJobAlert)}
            {renderPagination()}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No job alerts found</Text>
            <Text style={styles.emptySubtext}>
              {filters.search || filters.status !== 'all'
                ? 'Try adjusting your filters'
                : 'Job alerts will appear here once users create them'}
            </Text>
          </View>
        )}
      </View>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
    outlineStyle: 'none',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  exportButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  alertsList: {
    flex: 1,
  },
  alertsListContent: {
    padding: 20,
    gap: 16,
  },
  alertCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  alertName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeTextActive: {
    color: '#065F46',
  },
  statusBadgeTextInactive: {
    color: '#991B1B',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  alertContent: {
    gap: 12,
  },
  alertRow: {
    flexDirection: 'row',
    gap: 16,
  },
  alertField: {
    flex: 1,
  },
  alertFullRow: {
    width: '100%',
  },
  alertFieldLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  alertFieldValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  userInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  frequencyText: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  paginationButtonTextDisabled: {
    color: '#9CA3AF',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AdminJobAlertsScreen;
