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
  Modal,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

const AdminEmailLogsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    overall: {
      total: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      pending: 0,
    },
    today: { total: 0 },
    week: { total: 0 },
    month: { total: 0 },
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    templateType: '',
    search: '',
    startDate: '',
    endDate: '',
  });

  // Detail Modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    loadData();
  }, [filters.page, filters.status, filters.templateType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsResponse, statsResponse] = await Promise.all([
        api.getEmailLogs(filters),
        api.getEmailLogStats(),
      ]);

      if (logsResponse.success) {
        setLogs(logsResponse.data);
        setPagination(logsResponse.pagination);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      Alert.alert('Error', 'Failed to load email logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    loadData();
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      status: '',
      templateType: '',
      search: '',
      startDate: '',
      endDate: '',
    });
    loadData();
  };

  const handleViewDetails = async (log) => {
    try {
      const response = await api.getEmailLog(log._id);
      if (response.success) {
        setSelectedLog(response.data);
        setDetailModalVisible(true);
      } else {
        Alert.alert('Error', 'Failed to load email details');
      }
    } catch (error) {
      console.error('Error loading log details:', error);
      Alert.alert('Error', 'Failed to load email details');
    }
  };

  const handleRetry = (log) => {
    Alert.alert(
      'Retry Email',
      `Are you sure you want to retry sending this email to ${log.to}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: async () => {
            try {
              const response = await api.retryEmailLog(log._id);
              if (response.success) {
                Alert.alert('Success', 'Email retry initiated');
                loadData();
              } else {
                Alert.alert('Error', response.message || 'Failed to retry email');
              }
            } catch (error) {
              console.error('Error retrying email:', error);
              Alert.alert('Error', 'Failed to retry email');
            }
          },
        },
      ]
    );
  };

  const handleCleanupOldLogs = () => {
    Alert.prompt(
      'Cleanup Old Logs',
      'Enter number of days (logs older than this will be deleted):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async (days) => {
            if (!days || isNaN(days) || parseInt(days) <= 0) {
              Alert.alert('Error', 'Please enter a valid number of days');
              return;
            }

            try {
              const response = await api.deleteOldEmailLogs(parseInt(days));
              if (response.success) {
                Alert.alert(
                  'Success',
                  `Deleted ${response.deletedCount} old email logs`
                );
                loadData();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete logs');
              }
            } catch (error) {
              console.error('Error deleting logs:', error);
              Alert.alert('Error', 'Failed to delete logs');
            }
          },
        },
      ],
      'plain-text',
      '30'
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      sent: '#10B981',
      delivered: '#059669',
      failed: '#EF4444',
      pending: '#F59E0B',
      bounced: '#DC2626',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      sent: 'checkmark-circle',
      delivered: 'checkmark-done-circle',
      failed: 'close-circle',
      pending: 'time',
      bounced: 'alert-circle',
    };
    return icons[status] || 'help-circle';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTemplateTypeLabel = (type) => {
    const labels = {
      job_apply_invite: 'Job Apply',
      employer_confirmation: 'Employer Confirm',
      employer_welcome: 'Employer Welcome',
      jobseeker_welcome: 'Jobseeker Welcome',
      company_welcome: 'Company Welcome',
      consultancy_welcome: 'Consultancy Welcome',
      custom: 'Custom',
      system: 'System',
    };
    return labels[type] || type;
  };

  const renderStatCard = (title, value, icon, color, subtitle = null) => (
    <View style={[dynamicStyles.statCard, { borderLeftColor: color }]}>
      <View style={dynamicStyles.statIconContainer}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={dynamicStyles.statContent}>
        <Text style={dynamicStyles.statValue}>{value}</Text>
        <Text style={dynamicStyles.statTitle}>{title}</Text>
        {subtitle && <Text style={dynamicStyles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const renderLogCard = (log) => (
    <View key={log._id} style={dynamicStyles.logCard}>
      <View style={dynamicStyles.logHeader}>
        <View style={dynamicStyles.logStatusContainer}>
          <Ionicons
            name={getStatusIcon(log.status)}
            size={20}
            color={getStatusColor(log.status)}
          />
          <Text style={[dynamicStyles.logStatus, { color: getStatusColor(log.status) }]}>
            {log.status.toUpperCase()}
          </Text>
        </View>
        <Text style={dynamicStyles.logDate}>{formatDate(log.createdAt)}</Text>
      </View>

      <View style={dynamicStyles.logBody}>
        <View style={dynamicStyles.logRow}>
          <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
          <Text style={dynamicStyles.logRowLabel}>To:</Text>
          <Text style={dynamicStyles.logRowValue} numberOfLines={1}>
            {log.to}
          </Text>
        </View>

        <View style={dynamicStyles.logRow}>
          <Ionicons name="text-outline" size={16} color={colors.textSecondary} />
          <Text style={dynamicStyles.logRowLabel}>Subject:</Text>
          <Text style={dynamicStyles.logRowValue} numberOfLines={1}>
            {log.subject}
          </Text>
        </View>

        {log.templateName && (
          <View style={dynamicStyles.logRow}>
            <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
            <Text style={dynamicStyles.logRowLabel}>Template:</Text>
            <Text style={dynamicStyles.logRowValue} numberOfLines={1}>
              {log.templateName}
            </Text>
          </View>
        )}

        <View style={dynamicStyles.logRow}>
          <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
          <Text style={dynamicStyles.logRowLabel}>Type:</Text>
          <View style={dynamicStyles.typeBadge}>
            <Text style={dynamicStyles.typeBadgeText}>
              {getTemplateTypeLabel(log.templateType)}
            </Text>
          </View>
        </View>

        {log.error && log.error.message && (
          <View style={dynamicStyles.errorContainer}>
            <Ionicons name="warning-outline" size={16} color={colors.error} />
            <Text style={dynamicStyles.errorText} numberOfLines={2}>
              {log.error.message}
            </Text>
          </View>
        )}

        {log.opens > 0 || log.clicks > 0 ? (
          <View style={dynamicStyles.statsRow}>
            {log.opens > 0 && (
              <View style={dynamicStyles.statBadge}>
                <Ionicons name="eye-outline" size={14} color={colors.primary} />
                <Text style={dynamicStyles.statBadgeText}>{log.opens} opens</Text>
              </View>
            )}
            {log.clicks > 0 && (
              <View style={dynamicStyles.statBadge}>
                <Ionicons name="hand-left-outline" size={14} color={colors.primary} />
                <Text style={dynamicStyles.statBadgeText}>{log.clicks} clicks</Text>
              </View>
            )}
          </View>
        ) : null}
      </View>

      <View style={dynamicStyles.logActions}>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={() => handleViewDetails(log)}
        >
          <Ionicons name="eye-outline" size={18} color={colors.primary} />
          <Text style={dynamicStyles.actionButtonText}>View Details</Text>
        </TouchableOpacity>

        {log.status === 'failed' && (
          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={() => handleRetry(log)}
          >
            <Ionicons name="refresh-outline" size={18} color={colors.success} />
            <Text style={dynamicStyles.actionButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <AdminLayout
        title="Email Logs"
        activeScreen="AdminEmailLogs"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading email logs...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Email Logs"
      activeScreen="AdminEmailLogs"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <ScrollView
        style={dynamicStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.pageTitle}>Email Logs</Text>
            <Text style={dynamicStyles.pageSubtitle}>
              View email sending history and performance metrics
            </Text>
          </View>
          <TouchableOpacity
            style={dynamicStyles.cleanupButton}
            onPress={handleCleanupOldLogs}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={[dynamicStyles.secondaryButtonText, { color: colors.error }]}>
              Cleanup Old Logs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={dynamicStyles.statsGrid}>
          <View style={dynamicStyles.statsRow}>
            {renderStatCard(
              'Total Emails',
              stats.overall.total || 0,
              'mail-outline',
              colors.primary
            )}
            {renderStatCard(
              'Delivered',
              stats.overall.delivered || 0,
              'checkmark-done-circle-outline',
              colors.success
            )}
          </View>
          <View style={dynamicStyles.statsRow}>
            {renderStatCard(
              'Failed',
              stats.overall.failed || 0,
              'close-circle-outline',
              colors.error
            )}
            {renderStatCard(
              'Pending',
              stats.overall.pending || 0,
              'time-outline',
              '#F59E0B'
            )}
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={dynamicStyles.metricsContainer}>
          <Text style={dynamicStyles.metricsTitle}>Performance Metrics</Text>
          <View style={dynamicStyles.metricsGrid}>
            <View style={dynamicStyles.metricCard}>
              <Text style={dynamicStyles.metricValue}>{stats.deliveryRate}%</Text>
              <Text style={dynamicStyles.metricLabel}>Delivery Rate</Text>
            </View>
            <View style={dynamicStyles.metricCard}>
              <Text style={dynamicStyles.metricValue}>{stats.openRate}%</Text>
              <Text style={dynamicStyles.metricLabel}>Open Rate</Text>
            </View>
            <View style={dynamicStyles.metricCard}>
              <Text style={dynamicStyles.metricValue}>{stats.clickRate}%</Text>
              <Text style={dynamicStyles.metricLabel}>Click Rate</Text>
            </View>
          </View>
        </View>

        {/* Period Stats */}
        <View style={dynamicStyles.periodStatsContainer}>
          <View style={dynamicStyles.periodStat}>
            <Text style={dynamicStyles.periodValue}>{stats.today.total || 0}</Text>
            <Text style={dynamicStyles.periodLabel}>Today</Text>
          </View>
          <View style={dynamicStyles.periodStat}>
            <Text style={dynamicStyles.periodValue}>{stats.week.total || 0}</Text>
            <Text style={dynamicStyles.periodLabel}>This Week</Text>
          </View>
          <View style={dynamicStyles.periodStat}>
            <Text style={dynamicStyles.periodValue}>{stats.month.total || 0}</Text>
            <Text style={dynamicStyles.periodLabel}>This Month</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={dynamicStyles.filtersContainer}>
          <Text style={dynamicStyles.filtersTitle}>Filters</Text>
          
          <View style={dynamicStyles.filterRow}>
            <View style={dynamicStyles.filterItem}>
              <Text style={dynamicStyles.filterLabel}>Search</Text>
              <TextInput
                style={dynamicStyles.searchInput}
                value={filters.search}
                onChangeText={(text) => setFilters({ ...filters, search: text })}
                placeholder="Search by email or subject..."
                placeholderTextColor={colors.textSecondary}
                onSubmitEditing={handleSearch}
              />
            </View>
          </View>

          <View style={dynamicStyles.filterRow}>
            <View style={dynamicStyles.filterItem}>
              <Text style={dynamicStyles.filterLabel}>Status</Text>
              <View style={dynamicStyles.picker}>
                <Picker
                  selectedValue={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value, page: 1 })
                  }
                  style={dynamicStyles.pickerInput}
                >
                  <Picker.Item label="All Statuses" value="" />
                  <Picker.Item label="Sent" value="sent" />
                  <Picker.Item label="Delivered" value="delivered" />
                  <Picker.Item label="Failed" value="failed" />
                  <Picker.Item label="Pending" value="pending" />
                  <Picker.Item label="Bounced" value="bounced" />
                </Picker>
              </View>
            </View>

            <View style={dynamicStyles.filterItem}>
              <Text style={dynamicStyles.filterLabel}>Template Type</Text>
              <View style={dynamicStyles.picker}>
                <Picker
                  selectedValue={filters.templateType}
                  onValueChange={(value) =>
                    setFilters({ ...filters, templateType: value, page: 1 })
                  }
                  style={dynamicStyles.pickerInput}
                >
                  <Picker.Item label="All Types" value="" />
                  <Picker.Item label="Jobseeker Welcome" value="jobseeker_welcome" />
                  <Picker.Item label="Employer Welcome" value="employer_welcome" />
                  <Picker.Item label="Company Welcome" value="company_welcome" />
                  <Picker.Item label="Consultancy Welcome" value="consultancy_welcome" />
                  <Picker.Item label="Job Apply Invite" value="job_apply_invite" />
                  <Picker.Item label="Employer Confirmation" value="employer_confirmation" />
                  <Picker.Item label="Custom" value="custom" />
                  <Picker.Item label="System" value="system" />
                </Picker>
              </View>
            </View>
          </View>

          <View style={dynamicStyles.filterActions}>
            <TouchableOpacity style={dynamicStyles.clearButton} onPress={handleClearFilters}>
              <Text style={dynamicStyles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.applyButton} onPress={handleSearch}>
              <Text style={dynamicStyles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logs List */}
        <View style={dynamicStyles.logsContainer}>
          <Text style={dynamicStyles.logsTitle}>
            Email Logs ({pagination.total} total)
          </Text>
          {logs.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="mail-unread-outline" size={64} color={colors.border} />
              <Text style={dynamicStyles.emptyStateTitle}>No email logs found</Text>
              <Text style={dynamicStyles.emptyStateText}>
                Email logs will appear here once emails are sent
              </Text>
            </View>
          ) : (
            logs.map((log) => renderLogCard(log))
          )}
        </View>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <View style={dynamicStyles.paginationContainer}>
            <TouchableOpacity
              style={[
                dynamicStyles.paginationButton,
                filters.page === 1 && dynamicStyles.paginationButtonDisabled,
              ]}
              onPress={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={filters.page === 1 ? colors.border : colors.primary}
              />
            </TouchableOpacity>
            <Text style={dynamicStyles.paginationText}>
              Page {pagination.current} of {pagination.pages}
            </Text>
            <TouchableOpacity
              style={[
                dynamicStyles.paginationButton,
                filters.page === pagination.pages && dynamicStyles.paginationButtonDisabled,
              ]}
              onPress={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.pages}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={
                  filters.page === pagination.pages ? colors.border : colors.primary
                }
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDetailModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Email Details</Text>
              <TouchableOpacity 
                onPress={() => setDetailModalVisible(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

          {selectedLog && (
            <ScrollView style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.detailSection}>
                <Text style={dynamicStyles.detailSectionTitle}>Email Information</Text>
                
                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>Status:</Text>
                  <View style={dynamicStyles.detailStatusBadge}>
                    <Ionicons
                      name={getStatusIcon(selectedLog.status)}
                      size={16}
                      color={getStatusColor(selectedLog.status)}
                    />
                    <Text
                      style={[
                        dynamicStyles.detailStatusText,
                        { color: getStatusColor(selectedLog.status) },
                      ]}
                    >
                      {selectedLog.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>To:</Text>
                  <Text style={dynamicStyles.detailValue}>{selectedLog.to}</Text>
                </View>

                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>From:</Text>
                  <Text style={dynamicStyles.detailValue}>{selectedLog.from}</Text>
                </View>

                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>Subject:</Text>
                  <Text style={dynamicStyles.detailValue}>{selectedLog.subject}</Text>
                </View>

                {selectedLog.templateName && (
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Template:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedLog.templateName}</Text>
                  </View>
                )}

                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>Type:</Text>
                  <Text style={dynamicStyles.detailValue}>
                    {getTemplateTypeLabel(selectedLog.templateType)}
                  </Text>
                </View>
              </View>

              <View style={dynamicStyles.detailSection}>
                <Text style={dynamicStyles.detailSectionTitle}>Delivery Information</Text>
                
                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>Created:</Text>
                  <Text style={dynamicStyles.detailValue}>
                    {formatDate(selectedLog.createdAt)}
                  </Text>
                </View>

                {selectedLog.sentAt && (
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Sent:</Text>
                    <Text style={dynamicStyles.detailValue}>
                      {formatDate(selectedLog.sentAt)}
                    </Text>
                  </View>
                )}

                {selectedLog.deliveredAt && (
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Delivered:</Text>
                    <Text style={dynamicStyles.detailValue}>
                      {formatDate(selectedLog.deliveredAt)}
                    </Text>
                  </View>
                )}

                {selectedLog.openedAt && (
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>First Opened:</Text>
                    <Text style={dynamicStyles.detailValue}>
                      {formatDate(selectedLog.openedAt)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={dynamicStyles.detailSection}>
                <Text style={dynamicStyles.detailSectionTitle}>Engagement Stats</Text>
                
                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>Opens:</Text>
                  <Text style={dynamicStyles.detailValue}>{selectedLog.opens || 0}</Text>
                </View>

                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>Clicks:</Text>
                  <Text style={dynamicStyles.detailValue}>{selectedLog.clicks || 0}</Text>
                </View>
              </View>

              {selectedLog.error && selectedLog.error.message && (
                <View style={dynamicStyles.detailSection}>
                  <Text style={[dynamicStyles.detailSectionTitle, { color: colors.error }]}>
                    Error Information
                  </Text>
                  
                  <View style={dynamicStyles.errorDetailBox}>
                    <Text style={dynamicStyles.errorDetailText}>
                      {selectedLog.error.message}
                    </Text>
                    {selectedLog.error.code && (
                      <Text style={dynamicStyles.errorCode}>Code: {selectedLog.error.code}</Text>
                    )}
                  </View>
                </View>
              )}

              {selectedLog.htmlContent && (
                <View style={dynamicStyles.detailSection}>
                  <Text style={dynamicStyles.detailSectionTitle}>Email Content (Preview)</Text>
                  <View style={dynamicStyles.contentPreview}>
                    <Text style={dynamicStyles.contentPreviewText} numberOfLines={10}>
                      {selectedLog.htmlContent.replace(/<[^>]*>/g, '')}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
          </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cleanupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    gap: spacing.xs,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }),
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricsContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }),
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  periodStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }),
  },
  periodStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  periodValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  periodLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }),
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  picker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFF',
  },
  pickerInput: {
    height: 48,
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  clearButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  applyButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  logsContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  logCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }),
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  logBody: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logRowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  logRowValue: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  typeBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: colors.error,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  statBadgeText: {
    fontSize: 11,
    color: colors.primary,
  },
  logActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  paginationButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  paginationButtonDisabled: {
    borderColor: colors.border,
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    color: colors.text,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg + 8,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl + 16,
    padding: 0,
    width: '100%',
    maxWidth: 680,
    maxHeight: '90%',
    ...shadows.lg,
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
    borderTopLeftRadius: borderRadius.xl + 16,
    borderTopRightRadius: borderRadius.xl + 16,
    paddingHorizontal: spacing.xl + 20,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.lg + 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    ...typography.h4,
    color: '#0F172A',
    marginBottom: 0,
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalContent: {
    padding: spacing.xl + 20,
    maxHeight: '60vh',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      maxHeight: 'calc(85vh - 200px)',
    }),
  },
  detailSection: {
    marginBottom: spacing.xl,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 120,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  detailStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorDetailBox: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorDetailText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorCode: {
    fontSize: 12,
    color: colors.error,
    fontStyle: 'italic',
  },
  contentPreview: {
    backgroundColor: '#F9FAFB',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentPreviewText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
});

export default AdminEmailLogsScreen;
