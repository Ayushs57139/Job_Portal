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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminJobAlertsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
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
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

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
      if (Platform.OS === 'web') {
        const blob = await api.exportJobAlerts();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `job-alerts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        Alert.alert('Success', 'Job alerts exported successfully');
      } else {
        Alert.alert('Info', 'CSV export is available on web platform');
      }
    } catch (error) {
      console.error('Error exporting alerts:', error);
      Alert.alert('Error', 'Failed to export job alerts');
    }
  };

  const handleSelectFile = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, use input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,text/csv';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            setSelectedFile({
              name: file.name,
              uri: URL.createObjectURL(file),
              size: file.size,
              type: file.type,
              file: file, // Store the actual File object for web
            });
          }
        };
        input.click();
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'text/csv',
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setSelectedFile(result.assets[0]);
        }
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const handleBulkImport = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a CSV file');
      return;
    }

    try {
      setImporting(true);
      setImportResults(null);

      // For web, use the File object directly
      let fileToUpload = selectedFile;
      if (Platform.OS === 'web') {
        if (selectedFile.file) {
          fileToUpload = selectedFile.file;
        } else {
          // Fallback: fetch and create File object
          const response = await fetch(selectedFile.uri);
          const blob = await response.blob();
          fileToUpload = new File([blob], selectedFile.name, { type: 'text/csv' });
        }
      }

      const response = await api.bulkImportJobAlertCandidates(fileToUpload);

      if (response.success) {
        setImportResults(response.results);
        Alert.alert(
          'Import Completed',
          `Success: ${response.results.success}\nFailed: ${response.results.failed}\nSkipped: ${response.results.skipped}`
        );
        loadData();
      } else {
        Alert.alert('Error', response.message || 'Import failed');
      }
    } catch (error) {
      console.error('Error importing candidates:', error);
      Alert.alert('Error', error.message || 'Failed to import candidates');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      if (Platform.OS === 'web') {
        await api.downloadJobAlertCandidatesSampleCSV();
        Alert.alert('Success', 'Sample CSV downloaded successfully');
      } else {
        Alert.alert('Info', 'Sample CSV download is available on web platform');
      }
    } catch (error) {
      console.error('Error downloading sample:', error);
      Alert.alert('Error', 'Failed to download sample CSV');
    }
  };

  const closeBulkImportModal = () => {
    setShowBulkImportModal(false);
    setSelectedFile(null);
    setImportResults(null);
  };

  const renderStats = () => (
    <View style={dynamicStyles.statsContainer}>
      <View style={dynamicStyles.statCard}>
        <Ionicons name="notifications" size={24} color="#3B82F6" />
        <Text style={dynamicStyles.statValue}>{stats.total}</Text>
        <Text style={dynamicStyles.statLabel}>Total Alerts</Text>
      </View>
      <View style={dynamicStyles.statCard}>
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        <Text style={dynamicStyles.statValue}>{stats.active}</Text>
        <Text style={dynamicStyles.statLabel}>Active</Text>
      </View>
      <View style={dynamicStyles.statCard}>
        <Ionicons name="close-circle" size={24} color="#EF4444" />
        <Text style={dynamicStyles.statValue}>{stats.inactive}</Text>
        <Text style={dynamicStyles.statLabel}>Inactive</Text>
      </View>
      <View style={dynamicStyles.statCard}>
        <Ionicons name="time" size={24} color="#F59E0B" />
        <Text style={dynamicStyles.statValue}>{stats.recent}</Text>
        <Text style={dynamicStyles.statLabel}>Last 30 Days</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={dynamicStyles.filtersContainer}>
      <View style={dynamicStyles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={dynamicStyles.searchInput}
          placeholder="Search by email..."
          value={filters.search}
          onChangeText={(text) => setFilters({ ...filters, search: text, page: 1 })}
          placeholderTextColor="#999"
        />
      </View>

      <View style={dynamicStyles.filterButtons}>
        {['all', 'active', 'inactive'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              dynamicStyles.filterButton,
              filters.status === status && dynamicStyles.filterButtonActive,
            ]}
            onPress={() => setFilters({ ...filters, status, page: 1 })}
          >
            <Text
              style={[
                dynamicStyles.filterButtonText,
                filters.status === status && dynamicStyles.filterButtonTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={dynamicStyles.exportButton} onPress={handleExport}>
        <Ionicons name="download" size={20} color="#FFF" />
        <Text style={dynamicStyles.exportButtonText}>Export CSV</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={dynamicStyles.bulkImportButton} 
        onPress={() => setShowBulkImportModal(true)}
      >
        <Ionicons name="people" size={20} color="#FFF" />
        <Text style={dynamicStyles.bulkImportButtonText}>Bulk Import Candidates</Text>
      </TouchableOpacity>
    </View>
  );

  const renderJobAlert = (alert) => (
    <View key={alert._id} style={dynamicStyles.alertCard}>
      <View style={dynamicStyles.alertHeader}>
        <View style={dynamicStyles.alertHeaderLeft}>
          <Text style={dynamicStyles.alertName}>{alert.alertName}</Text>
          <View
            style={[
              dynamicStyles.statusBadge,
              alert.isActive ? dynamicStyles.statusBadgeActive : dynamicStyles.statusBadgeInactive,
            ]}
          >
            <Text
              style={[
                dynamicStyles.statusBadgeText,
                alert.isActive ? dynamicStyles.statusBadgeTextActive : dynamicStyles.statusBadgeTextInactive,
              ]}
            >
              {alert.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <View style={dynamicStyles.alertActions}>
          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={() => handleToggleStatus(alert._id)}
          >
            <Ionicons
              name={alert.isActive ? 'pause-circle' : 'play-circle'}
              size={24}
              color={alert.isActive ? '#F59E0B' : '#10B981'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={() => handleDelete(alert._id)}
          >
            <Ionicons name="trash" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={dynamicStyles.alertContent}>
        <View style={dynamicStyles.alertRow}>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Job Title:</Text>
            <Text style={dynamicStyles.alertFieldValue}>{alert.jobTitle}</Text>
          </View>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Expected Salary:</Text>
            <Text style={dynamicStyles.alertFieldValue}>₹{alert.expectedSalary?.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={dynamicStyles.alertRow}>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Experience:</Text>
            <Text style={dynamicStyles.alertFieldValue}>
              {alert.experienceLevel} - {alert.totalExperience}
            </Text>
          </View>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Job Status:</Text>
            <Text style={dynamicStyles.alertFieldValue}>{alert.presentJobStatus}</Text>
          </View>
        </View>

        <View style={dynamicStyles.alertRow}>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Location:</Text>
            <Text style={dynamicStyles.alertFieldValue}>{alert.workOfficeLocation}</Text>
          </View>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Industry:</Text>
            <Text style={dynamicStyles.alertFieldValue}>{alert.industry}</Text>
          </View>
        </View>

        <View style={dynamicStyles.alertRow}>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Department:</Text>
            <Text style={dynamicStyles.alertFieldValue}>{alert.department}</Text>
          </View>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Sub Industry:</Text>
            <Text style={dynamicStyles.alertFieldValue}>{alert.subIndustry}</Text>
          </View>
        </View>

        <View style={dynamicStyles.alertFullRow}>
          <Text style={dynamicStyles.alertFieldLabel}>Job Roles:</Text>
          <View style={dynamicStyles.tagsContainer}>
            {alert.jobRoles?.map((role, index) => (
              <View key={index} style={dynamicStyles.tag}>
                <Text style={dynamicStyles.tagText}>{role}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={dynamicStyles.alertFullRow}>
          <Text style={dynamicStyles.alertFieldLabel}>Key Skills:</Text>
          <View style={dynamicStyles.tagsContainer}>
            {alert.keySkills?.map((skill, index) => (
              <View key={index} style={dynamicStyles.tag}>
                <Text style={dynamicStyles.tagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={dynamicStyles.alertRow}>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Email:</Text>
            <Text style={dynamicStyles.alertFieldValue}>{alert.email}</Text>
          </View>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Mobile:</Text>
            <Text style={dynamicStyles.alertFieldValue}>{alert.mobile}</Text>
          </View>
        </View>

        <View style={dynamicStyles.alertRow}>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Alert Frequency:</Text>
            <View style={dynamicStyles.frequencyBadge}>
              <Ionicons 
                name={alert.alertFrequency === 'daily' ? 'calendar' : alert.alertFrequency === 'weekly' ? 'calendar-outline' : 'calendar-number'} 
                size={16} 
                color="#6366F1" 
              />
              <Text style={dynamicStyles.frequencyText}>
                {alert.alertFrequency ? alert.alertFrequency.charAt(0).toUpperCase() + alert.alertFrequency.slice(1) : 'Daily'}
              </Text>
            </View>
          </View>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Notifications Sent:</Text>
            <Text style={dynamicStyles.alertFieldValue}>{alert.notificationCount || 0}</Text>
          </View>
        </View>

        <View style={dynamicStyles.alertRow}>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Created:</Text>
            <Text style={dynamicStyles.alertFieldValue}>
              {new Date(alert.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={dynamicStyles.alertField}>
            <Text style={dynamicStyles.alertFieldLabel}>Last Notified:</Text>
            <Text style={dynamicStyles.alertFieldValue}>
              {alert.lastNotified ? new Date(alert.lastNotified).toLocaleDateString() : 'Never'}
            </Text>
          </View>
        </View>

        {alert.userId && (
          <View style={dynamicStyles.userInfo}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={dynamicStyles.userInfoText}>
              User ID: {alert.userId._id} | {alert.userId.name || 'N/A'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={dynamicStyles.paginationContainer}>
      <TouchableOpacity
        style={[dynamicStyles.paginationButton, filters.page === 1 && dynamicStyles.paginationButtonDisabled]}
        onPress={() => setFilters({ ...filters, page: filters.page - 1 })}
        disabled={filters.page === 1}
      >
        <Ionicons name="chevron-back" size={20} color={filters.page === 1 ? '#CCC' : '#3B82F6'} />
        <Text style={[dynamicStyles.paginationButtonText, filters.page === 1 && dynamicStyles.paginationButtonTextDisabled]}>
          Previous
        </Text>
      </TouchableOpacity>

      <Text style={dynamicStyles.paginationInfo}>
        Page {pagination.current} of {pagination.pages} ({pagination.total} total)
      </Text>

      <TouchableOpacity
        style={[
          dynamicStyles.paginationButton,
          filters.page === pagination.pages && dynamicStyles.paginationButtonDisabled,
        ]}
        onPress={() => setFilters({ ...filters, page: filters.page + 1 })}
        disabled={filters.page === pagination.pages}
      >
        <Text
          style={[
            dynamicStyles.paginationButtonText,
            filters.page === pagination.pages && dynamicStyles.paginationButtonTextDisabled,
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
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.pageTitle}>Job Alerts Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>
              Manage and monitor all job alert subscriptions
            </Text>
          </View>
        </View>

        {renderStats()}
        {renderFilters()}

        {loading ? (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={dynamicStyles.loadingText}>Loading job alerts...</Text>
          </View>
        ) : jobAlerts.length > 0 ? (
          <ScrollView
            style={dynamicStyles.alertsList}
            contentContainerStyle={dynamicStyles.alertsListContent}
            showsVerticalScrollIndicator={Platform.OS === 'web'}
          >
            {jobAlerts.map(renderJobAlert)}
            {renderPagination()}
          </ScrollView>
        ) : (
          <View style={dynamicStyles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#CCC" />
            <Text style={dynamicStyles.emptyText}>No job alerts found</Text>
            <Text style={dynamicStyles.emptySubtext}>
              {filters.search || filters.status !== 'all'
                ? 'Try adjusting your filters'
                : 'Job alerts will appear here once users create them'}
            </Text>
          </View>
        )}

        {/* Bulk Import Modal */}
        <Modal
          visible={showBulkImportModal}
          animationType="fade"
          transparent={true}
          onRequestClose={closeBulkImportModal}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalOverlay}
            activeOpacity={1}
            onPress={closeBulkImportModal}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Bulk Import Candidates</Text>
                <TouchableOpacity 
                  onPress={closeBulkImportModal}
                  style={dynamicStyles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={dynamicStyles.modalBody}>
                <Text style={dynamicStyles.modalDescription}>
                  Import multiple candidates as job alerts from a CSV file. Download the sample CSV template to see the required format.
                </Text>

                <TouchableOpacity 
                  style={dynamicStyles.downloadSampleButton}
                  onPress={handleDownloadSample}
                >
                  <Ionicons name="download-outline" size={20} color="#3B82F6" />
                  <Text style={dynamicStyles.downloadSampleText}>Download Sample CSV</Text>
                </TouchableOpacity>

                <View style={dynamicStyles.fileSelectorContainer}>
                  <TouchableOpacity 
                    style={dynamicStyles.fileSelectorButton}
                    onPress={handleSelectFile}
                    disabled={importing}
                  >
                    <Ionicons name="document-attach" size={24} color="#3B82F6" />
                    <Text style={dynamicStyles.fileSelectorText}>
                      {selectedFile ? selectedFile.name : 'Select CSV File'}
                    </Text>
                  </TouchableOpacity>
                  {selectedFile && (
                    <TouchableOpacity 
                      style={dynamicStyles.removeFileButton}
                      onPress={() => setSelectedFile(null)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>

                {importResults && (
                  <View style={dynamicStyles.importResultsContainer}>
                    <Text style={dynamicStyles.importResultsTitle}>Import Results</Text>
                    <View style={dynamicStyles.resultsStats}>
                      <View style={dynamicStyles.resultStatItem}>
                        <Text style={dynamicStyles.resultStatValue}>{importResults.success}</Text>
                        <Text style={dynamicStyles.resultStatLabel}>Success</Text>
                      </View>
                      <View style={dynamicStyles.resultStatItem}>
                        <Text style={[dynamicStyles.resultStatValue, { color: '#EF4444' }]}>
                          {importResults.failed}
                        </Text>
                        <Text style={dynamicStyles.resultStatLabel}>Failed</Text>
                      </View>
                      <View style={dynamicStyles.resultStatItem}>
                        <Text style={[dynamicStyles.resultStatValue, { color: '#F59E0B' }]}>
                          {importResults.skipped || 0}
                        </Text>
                        <Text style={dynamicStyles.resultStatLabel}>Skipped</Text>
                      </View>
                    </View>

                    {importResults.errors && importResults.errors.length > 0 && (
                      <View style={dynamicStyles.errorsContainer}>
                        <Text style={dynamicStyles.errorsTitle}>Errors ({importResults.errors.length})</Text>
                        <ScrollView style={dynamicStyles.errorsList} nestedScrollEnabled>
                          {importResults.errors.slice(0, 10).map((error, index) => (
                            <Text key={index} style={dynamicStyles.errorText}>
                              {error}
                            </Text>
                          ))}
                          {importResults.errors.length > 10 && (
                            <Text style={dynamicStyles.moreErrorsText}>
                              ... and {importResults.errors.length - 10} more errors
                            </Text>
                          )}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    dynamicStyles.importButton,
                    (!selectedFile || importing) && dynamicStyles.importButtonDisabled
                  ]}
                  onPress={handleBulkImport}
                  disabled={!selectedFile || importing}
                >
                  {importing ? (
                    <>
                      <ActivityIndicator size="small" color="#FFF" />
                      <Text style={dynamicStyles.importButtonText}>Importing...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload" size={20} color="#FFF" />
                      <Text style={dynamicStyles.importButtonText}>Import Candidates</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
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
    backgroundColor: '#F9FAFB',
    padding: isMobile ? 12 : isTablet ? 16 : 20,
  },
  header: {
    backgroundColor: '#FFF',
    padding: isMobile ? 14 : isTablet ? 17 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pageTitle: {
    fontSize: isMobile ? 22 : isTablet ? 26 : 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
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
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    }),
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
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    }),
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
  bulkImportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  bulkImportButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 0,
    width: '100%',
    maxWidth: 680,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 25,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 44,
    paddingTop: 44,
    paddingBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }),
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalBody: {
    padding: 44,
    maxHeight: '60vh',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      maxHeight: 'calc(85vh - 200px)',
    }),
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  downloadSampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    marginBottom: 20,
  },
  downloadSampleText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  fileSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  fileSelectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  fileSelectorText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  removeFileButton: {
    padding: 8,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#10B981',
    borderRadius: 8,
    marginTop: 10,
  },
  importButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  importButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  importResultsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 20,
  },
  importResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  resultsStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  resultStatItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  resultStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  resultStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorsContainer: {
    marginTop: 12,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorsList: {
    maxHeight: 200,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    marginBottom: 4,
    lineHeight: 16,
  },
  moreErrorsText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

const styles = StyleSheet.create({});

export default AdminJobAlertsScreen;
