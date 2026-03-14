import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  RefreshControl,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';
import DateTimePicker from '@react-native-community/datetimepicker';

const AdminSMTPSettingsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  const [settings, setSettings] = useState({
    provider: 'smtp',
    smtp: {
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
    },
    fromEmail: '',
    fromName: '',
    replyToEmail: '',
    enableEmailNotifications: true,
    dailyEmailLimit: 1000,
  });

  const [showPassword, setShowPassword] = useState(false);
  
  // Statistics state
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'statistics'
  const [statsLoading, setStatsLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    draft: 0,
    trash: 0,
  });
  const [emailLogs, setEmailLogs] = useState([]);
  const [statsFilter, setStatsFilter] = useState('all'); // all, sent, failed, draft, trash
  const [dateFilter, setDateFilter] = useState('last_24_hours');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start'); // 'start' or 'end'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    loadSettings();
    if (activeTab === 'statistics') {
      loadStatistics();
    }
  }, [activeTab, statsFilter, dateFilter, customDateRange, currentPage]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.getSMTPSettings();
      
      if (response.success && response.data.email) {
        setSettings({
          provider: response.data.email.provider || 'smtp',
          smtp: {
            host: response.data.email.smtp?.host || '',
            port: response.data.email.smtp?.port || 587,
            secure: response.data.email.smtp?.secure || false,
            username: response.data.email.smtp?.username || '',
            password: '', // Don't populate password for security
          },
          fromEmail: response.data.email.fromEmail || '',
          fromName: response.data.email.fromName || '',
          replyToEmail: response.data.email.replyToEmail || '',
          enableEmailNotifications: response.data.email.enableEmailNotifications !== false,
          dailyEmailLimit: response.data.email.dailyEmailLimit || 1000,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load SMTP settings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'settings') {
      loadSettings();
    } else {
      loadStatistics();
    }
  };

  const loadStatistics = async () => {
    try {
      setStatsLoading(true);
      
      // Calculate date range based on filter
      let startDate, endDate;
      endDate = new Date();
      
      switch (dateFilter) {
        case 'last_24_hours':
          startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case 'last_7_days':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last_14_days':
          startDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
          break;
        case 'last_30_days':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last_90_days':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'last_120_days':
          startDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
          break;
        case 'last_6_months':
          startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
          break;
        case 'last_9_months':
          startDate = new Date(Date.now() - 270 * 24 * 60 * 60 * 1000);
          break;
        case 'last_12_months':
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          startDate = customDateRange.startDate;
          endDate = customDateRange.endDate;
          break;
        default:
          startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }

      // Build filters
      const filters = {
        page: currentPage,
        limit: 20,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      if (statsFilter !== 'all') {
        filters.status = statsFilter;
      }

      // Fetch email logs and stats
      const [logsResponse, statsResponse] = await Promise.all([
        api.getEmailLogs(filters),
        api.getEmailLogStats(startDate.toISOString(), endDate.toISOString()),
      ]);

      if (logsResponse.success) {
        setEmailLogs(logsResponse.data.logs || []);
        setTotalPages(logsResponse.data.pagination?.totalPages || 1);
      }

      if (statsResponse.success) {
        setStatistics({
          total: statsResponse.data.total || 0,
          sent: statsResponse.data.sent || 0,
          failed: statsResponse.data.failed || 0,
          draft: statsResponse.data.draft || 0,
          trash: statsResponse.data.trash || 0,
        });
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      Alert.alert('Error', 'Failed to load email statistics');
    } finally {
      setStatsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRetryEmail = async (logId) => {
    try {
      Alert.alert(
        'Retry Email',
        'Are you sure you want to retry sending this email?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retry',
            onPress: async () => {
              const response = await api.retryEmailLog(logId);
              if (response.success) {
                Alert.alert('Success', 'Email queued for retry');
                loadStatistics();
              } else {
                Alert.alert('Error', response.message || 'Failed to retry email');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error retrying email:', error);
      Alert.alert('Error', error.message || 'Failed to retry email');
    }
  };

  const handleDatePickerChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      if (datePickerMode === 'start') {
        setCustomDateRange({ ...customDateRange, startDate: selectedDate });
      } else {
        setCustomDateRange({ ...customDateRange, endDate: selectedDate });
      }
    }
  };

  const openDatePicker = (mode) => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return colors.success;
      case 'failed':
        return colors.error;
      case 'draft':
        return colors.warning;
      case 'trash':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      case 'draft':
        return 'document-text';
      case 'trash':
        return 'trash';
      default:
        return 'mail';
    }
  };

  const handleSave = async () => {
    try {
      // Validation
      if (settings.provider === 'smtp') {
        if (!settings.smtp.host.trim()) {
          Alert.alert('Validation Error', 'Please enter SMTP host');
          return;
        }
        if (!settings.smtp.username.trim()) {
          Alert.alert('Validation Error', 'Please enter SMTP username');
          return;
        }
      }

      if (!settings.fromEmail.trim()) {
        Alert.alert('Validation Error', 'Please enter from email address');
        return;
      }

      if (!settings.fromName.trim()) {
        Alert.alert('Validation Error', 'Please enter from name');
        return;
      }

      setSaving(true);

      // Only include password if it's been changed
      const dataToSend = {
        provider: settings.provider,
        smtp: {
          host: settings.smtp.host.trim(),
          port: parseInt(settings.smtp.port) || 587,
          secure: settings.smtp.secure,
          username: settings.smtp.username.trim(),
        },
        fromEmail: settings.fromEmail.trim(),
        fromName: settings.fromName.trim(),
        replyToEmail: settings.replyToEmail.trim(),
        enableEmailNotifications: settings.enableEmailNotifications,
        dailyEmailLimit: parseInt(settings.dailyEmailLimit) || 1000,
      };

      // Only include password if it's been updated
      if (settings.smtp.password) {
        dataToSend.smtp.password = settings.smtp.password;
      }

      const response = await api.updateSMTPSettings(dataToSend);

      if (response.success) {
        Alert.alert('Success', 'SMTP settings updated successfully');
        loadSettings(); // Reload to clear password field
      } else {
        Alert.alert('Error', response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      if (!testEmail.trim()) {
        Alert.alert('Validation Error', 'Please enter a test email address');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(testEmail.trim())) {
        Alert.alert('Validation Error', 'Please enter a valid email address');
        return;
      }

      setTesting(true);

      const response = await api.testSMTPConnection(testEmail.trim());

      if (response.success) {
        Alert.alert(
          'Success',
          `Test email sent successfully to ${testEmail}. Please check your inbox.`
        );
        setTestEmail('');
      } else {
        Alert.alert('Error', response.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error testing email:', error);
      Alert.alert('Error', error.message || 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset SMTP settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              provider: 'smtp',
              smtp: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                username: '',
                password: '',
              },
              fromEmail: '',
              fromName: '',
              replyToEmail: '',
              enableEmailNotifications: true,
              dailyEmailLimit: 1000,
            });
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <AdminLayout
        title="SMTP Settings"
        activeScreen="AdminSMTPSettings"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading settings...</Text>
        </View>
      </AdminLayout>
    );
  }

  const renderStatisticsTab = () => (
    <View style={dynamicStyles.statisticsContainer}>
      {/* Statistics Cards */}
      <View style={dynamicStyles.statsCardsRow}>
        <TouchableOpacity
          style={[
            dynamicStyles.statCard,
            statsFilter === 'all' && dynamicStyles.statCardActive,
          ]}
          onPress={() => {
            setStatsFilter('all');
            setCurrentPage(1);
          }}
        >
          <Ionicons name="mail" size={32} color={colors.primary} />
          <Text style={dynamicStyles.statValue}>{statistics.total}</Text>
          <Text style={dynamicStyles.statLabel}>All Emails</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            dynamicStyles.statCard,
            statsFilter === 'sent' && dynamicStyles.statCardActive,
          ]}
          onPress={() => {
            setStatsFilter('sent');
            setCurrentPage(1);
          }}
        >
          <Ionicons name="checkmark-circle" size={32} color={colors.success} />
          <Text style={dynamicStyles.statValue}>{statistics.sent}</Text>
          <Text style={dynamicStyles.statLabel}>Sent Emails</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            dynamicStyles.statCard,
            statsFilter === 'failed' && dynamicStyles.statCardActive,
          ]}
          onPress={() => {
            setStatsFilter('failed');
            setCurrentPage(1);
          }}
        >
          <Ionicons name="close-circle" size={32} color={colors.error} />
          <Text style={dynamicStyles.statValue}>{statistics.failed}</Text>
          <Text style={dynamicStyles.statLabel}>Failed Emails</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            dynamicStyles.statCard,
            statsFilter === 'draft' && dynamicStyles.statCardActive,
          ]}
          onPress={() => {
            setStatsFilter('draft');
            setCurrentPage(1);
          }}
        >
          <Ionicons name="document-text" size={32} color={colors.warning} />
          <Text style={dynamicStyles.statValue}>{statistics.draft}</Text>
          <Text style={dynamicStyles.statLabel}>Draft Emails</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            dynamicStyles.statCard,
            statsFilter === 'trash' && dynamicStyles.statCardActive,
          ]}
          onPress={() => {
            setStatsFilter('trash');
            setCurrentPage(1);
          }}
        >
          <Ionicons name="trash" size={32} color={colors.textSecondary} />
          <Text style={dynamicStyles.statValue}>{statistics.trash}</Text>
          <Text style={dynamicStyles.statLabel}>Trash Emails</Text>
        </TouchableOpacity>
      </View>

      {/* Date Filter Section */}
      <View style={dynamicStyles.filterSection}>
        <Text style={dynamicStyles.filterTitle}>Time Period</Text>
        <View style={dynamicStyles.filterButtonsRow}>
          {[
            { label: 'Last 24 Hours', value: 'last_24_hours' },
            { label: 'Last 7 Days', value: 'last_7_days' },
            { label: 'Last 14 Days', value: 'last_14_days' },
            { label: 'Last 30 Days', value: 'last_30_days' },
            { label: 'Last 90 Days', value: 'last_90_days' },
            { label: 'Last 120 Days', value: 'last_120_days' },
            { label: 'Last 6 Months', value: 'last_6_months' },
            { label: 'Last 9 Months', value: 'last_9_months' },
            { label: 'Last 12 Months', value: 'last_12_months' },
            { label: 'Custom Date', value: 'custom' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                dynamicStyles.filterButton,
                dateFilter === filter.value && dynamicStyles.filterButtonActive,
              ]}
              onPress={() => {
                setDateFilter(filter.value);
                setCurrentPage(1);
              }}
            >
              <Text
                style={[
                  dynamicStyles.filterButtonText,
                  dateFilter === filter.value && dynamicStyles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Date Range Picker */}
        {dateFilter === 'custom' && (
          <View style={dynamicStyles.customDateContainer}>
            <View style={dynamicStyles.datePickerRow}>
              <View style={dynamicStyles.datePickerItem}>
                <Text style={dynamicStyles.dateLabel}>Start Date</Text>
                <TouchableOpacity
                  style={dynamicStyles.dateButton}
                  onPress={() => openDatePicker('start')}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <Text style={dynamicStyles.dateButtonText}>
                    {formatDate(customDateRange.startDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={dynamicStyles.datePickerItem}>
                <Text style={dynamicStyles.dateLabel}>End Date</Text>
                <TouchableOpacity
                  style={dynamicStyles.dateButton}
                  onPress={() => openDatePicker('end')}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <Text style={dynamicStyles.dateButtonText}>
                    {formatDate(customDateRange.endDate)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Email Logs List */}
      <View style={dynamicStyles.logsSection}>
        <View style={dynamicStyles.logsSectionHeader}>
          <Text style={dynamicStyles.logsSectionTitle}>
            Email Logs {statsFilter !== 'all' && `(${statsFilter})`}
          </Text>
          <TouchableOpacity
            style={dynamicStyles.refreshButton}
            onPress={loadStatistics}
            disabled={statsLoading}
          >
            {statsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="refresh" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {statsLoading ? (
          <View style={dynamicStyles.logsLoadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={dynamicStyles.loadingText}>Loading email logs...</Text>
          </View>
        ) : emailLogs.length === 0 ? (
          <View style={dynamicStyles.emptyLogsContainer}>
            <Ionicons name="mail-outline" size={64} color={colors.border} />
            <Text style={dynamicStyles.emptyLogsText}>No email logs found</Text>
            <Text style={dynamicStyles.emptyLogsSubtext}>
              Try adjusting your filters or date range
            </Text>
          </View>
        ) : (
          <>
            {emailLogs.map((log) => (
              <View key={log._id} style={dynamicStyles.logCard}>
                <View style={dynamicStyles.logHeader}>
                  <View style={dynamicStyles.logHeaderLeft}>
                    <Ionicons
                      name={getStatusIcon(log.status)}
                      size={24}
                      color={getStatusColor(log.status)}
                    />
                    <View style={dynamicStyles.logHeaderInfo}>
                      <Text style={dynamicStyles.logSubject} numberOfLines={1}>
                        {log.subject || 'No Subject'}
                      </Text>
                      <Text style={dynamicStyles.logDate}>
                        {formatDateTime(log.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      dynamicStyles.statusBadge,
                      { backgroundColor: getStatusColor(log.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        dynamicStyles.statusBadgeText,
                        { color: getStatusColor(log.status) },
                      ]}
                    >
                      {log.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={dynamicStyles.logBody}>
                  <View style={dynamicStyles.logRow}>
                    <Text style={dynamicStyles.logLabel}>To:</Text>
                    <Text style={dynamicStyles.logValue} numberOfLines={1}>
                      {log.to}
                    </Text>
                  </View>
                  <View style={dynamicStyles.logRow}>
                    <Text style={dynamicStyles.logLabel}>From:</Text>
                    <Text style={dynamicStyles.logValue} numberOfLines={1}>
                      {log.from}
                    </Text>
                  </View>
                  {log.error && (
                    <View style={dynamicStyles.logRow}>
                      <Text style={dynamicStyles.logLabel}>Error:</Text>
                      <Text style={[dynamicStyles.logValue, { color: colors.error }]} numberOfLines={2}>
                        {log.error}
                      </Text>
                    </View>
                  )}
                </View>

                {log.status === 'failed' && (
                  <View style={dynamicStyles.logActions}>
                    <TouchableOpacity
                      style={dynamicStyles.retryButton}
                      onPress={() => handleRetryEmail(log._id)}
                    >
                      <Ionicons name="refresh" size={16} color="#FFF" />
                      <Text style={dynamicStyles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={dynamicStyles.pagination}>
                <TouchableOpacity
                  style={[
                    dynamicStyles.paginationButton,
                    currentPage === 1 && dynamicStyles.paginationButtonDisabled,
                  ]}
                  onPress={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={currentPage === 1 ? colors.border : colors.primary}
                  />
                </TouchableOpacity>

                <Text style={dynamicStyles.paginationText}>
                  Page {currentPage} of {totalPages}
                </Text>

                <TouchableOpacity
                  style={[
                    dynamicStyles.paginationButton,
                    currentPage === totalPages && dynamicStyles.paginationButtonDisabled,
                  ]}
                  onPress={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={currentPage === totalPages ? colors.border : colors.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={dynamicStyles.datePickerModal}>
              <View style={dynamicStyles.datePickerModalContent}>
                <View style={dynamicStyles.datePickerModalHeader}>
                  <Text style={dynamicStyles.datePickerModalTitle}>
                    Select {datePickerMode === 'start' ? 'Start' : 'End'} Date
                  </Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={dynamicStyles.datePickerModalDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={datePickerMode === 'start' ? customDateRange.startDate : customDateRange.endDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDatePickerChange}
                  maximumDate={new Date()}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={datePickerMode === 'start' ? customDateRange.startDate : customDateRange.endDate}
            mode="date"
            display="default"
            onChange={handleDatePickerChange}
            maximumDate={new Date()}
          />
        )
      )}
    </View>
  );

  return (
    <AdminLayout
      title="SMTP Settings"
      activeScreen="AdminSMTPSettings"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <View style={dynamicStyles.container}>
        {/* Tab Navigation */}
        <View style={dynamicStyles.tabContainer}>
          <TouchableOpacity
            style={[
              dynamicStyles.tab,
              activeTab === 'settings' && dynamicStyles.tabActive,
            ]}
            onPress={() => setActiveTab('settings')}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={activeTab === 'settings' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                dynamicStyles.tabText,
                activeTab === 'settings' && dynamicStyles.tabTextActive,
              ]}
            >
              SMTP Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              dynamicStyles.tab,
              activeTab === 'statistics' && dynamicStyles.tabActive,
            ]}
            onPress={() => setActiveTab('statistics')}
          >
            <Ionicons
              name="stats-chart-outline"
              size={20}
              color={activeTab === 'statistics' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                dynamicStyles.tabText,
                activeTab === 'statistics' && dynamicStyles.tabTextActive,
              ]}
            >
              Email Statistics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'statistics' ? (
          <ScrollView
            style={dynamicStyles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {renderStatisticsTab()}
          </ScrollView>
        ) : (
          <ScrollView
            style={dynamicStyles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Header */}
            <View style={dynamicStyles.header}>
              <View>
                <Text style={dynamicStyles.pageTitle}>SMTP Settings</Text>
                <Text style={dynamicStyles.pageSubtitle}>
                  Configure email server settings for sending emails
                </Text>
              </View>
              <View style={dynamicStyles.headerActions}>
                <TouchableOpacity
                  style={dynamicStyles.secondaryButton}
                  onPress={handleResetSettings}
                >
                  <Ionicons name="refresh-outline" size={20} color={colors.error} />
                  <Text style={[dynamicStyles.secondaryButtonText, { color: colors.error }]}>
                    Reset
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={dynamicStyles.primaryButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color="#FFF" />
                      <Text style={dynamicStyles.primaryButtonText}>Save Settings</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

        <View style={dynamicStyles.content}>
          {/* Email Provider Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Email Provider</Text>
            <Text style={dynamicStyles.sectionSubtitle}>
              Select your email service provider
            </Text>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Provider</Text>
              <View style={dynamicStyles.picker}>
                <Picker
                  selectedValue={settings.provider}
                  onValueChange={(value) =>
                    setSettings({ ...settings, provider: value })
                  }
                  style={dynamicStyles.pickerInput}
                >
                  <Picker.Item label="SMTP" value="smtp" />
                  <Picker.Item label="SendGrid (Coming Soon)" value="sendgrid" enabled={false} />
                  <Picker.Item label="Mailgun (Coming Soon)" value="mailgun" enabled={false} />
                  <Picker.Item label="AWS SES (Coming Soon)" value="ses" enabled={false} />
                </Picker>
              </View>
            </View>
          </View>

          {/* SMTP Configuration */}
          {settings.provider === 'smtp' && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>SMTP Configuration</Text>
              <Text style={dynamicStyles.sectionSubtitle}>
                Enter your SMTP server details
              </Text>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>SMTP Host *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={settings.smtp.host}
                  onChangeText={(text) =>
                    setSettings({
                      ...settings,
                      smtp: { ...settings.smtp, host: text },
                    })
                  }
                  placeholder="smtp.gmail.com"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <Text style={dynamicStyles.hint}>
                  Common: Gmail (smtp.gmail.com), Outlook (smtp.office365.com)
                </Text>
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>SMTP Port *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={String(settings.smtp.port)}
                  onChangeText={(text) =>
                    setSettings({
                      ...settings,
                      smtp: { ...settings.smtp, port: parseInt(text) || 587 },
                    })
                  }
                  placeholder="587"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />
                <Text style={dynamicStyles.hint}>
                  Common ports: 587 (TLS), 465 (SSL), 25 (Non-secure)
                </Text>
              </View>

              <View style={dynamicStyles.switchRow}>
                <View style={dynamicStyles.switchLabelContainer}>
                  <Text style={dynamicStyles.switchLabel}>Use SSL/TLS</Text>
                  <Text style={dynamicStyles.switchHint}>
                    Enable secure connection (recommended)
                  </Text>
                </View>
                <Switch
                  value={settings.smtp.secure}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      smtp: { ...settings.smtp, secure: value },
                    })
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFF"
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>SMTP Username *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={settings.smtp.username}
                  onChangeText={(text) =>
                    setSettings({
                      ...settings,
                      smtp: { ...settings.smtp, username: text },
                    })
                  }
                  placeholder="your-email@domain.com"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>SMTP Password</Text>
                <View style={dynamicStyles.passwordContainer}>
                  <TextInput
                    style={[dynamicStyles.input, dynamicStyles.passwordInput]}
                    value={settings.smtp.password}
                    onChangeText={(text) =>
                      setSettings({
                        ...settings,
                        smtp: { ...settings.smtp, password: text },
                      })
                    }
                    placeholder="Enter password to update"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={dynamicStyles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={dynamicStyles.hint}>
                  For Gmail, use App Password instead of your regular password
                </Text>
              </View>
            </View>
          )}

          {/* Email Settings */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Email Settings</Text>
            <Text style={dynamicStyles.sectionSubtitle}>
              Configure sender information and limits
            </Text>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>From Email *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={settings.fromEmail}
                onChangeText={(text) =>
                  setSettings({ ...settings, fromEmail: text })
                }
                placeholder="noreply@jobwala.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text style={dynamicStyles.hint}>
                Email address that will appear as the sender
              </Text>
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>From Name *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={settings.fromName}
                onChangeText={(text) =>
                  setSettings({ ...settings, fromName: text })
                }
                placeholder="JobWala"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={dynamicStyles.hint}>
                Name that will appear as the sender
              </Text>
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Reply-To Email</Text>
              <TextInput
                style={dynamicStyles.input}
                value={settings.replyToEmail}
                onChangeText={(text) =>
                  setSettings({ ...settings, replyToEmail: text })
                }
                placeholder="support@jobwala.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text style={dynamicStyles.hint}>
                Email address for replies (optional)
              </Text>
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Daily Email Limit</Text>
              <TextInput
                style={dynamicStyles.input}
                value={String(settings.dailyEmailLimit)}
                onChangeText={(text) =>
                  setSettings({
                    ...settings,
                    dailyEmailLimit: parseInt(text) || 1000,
                  })
                }
                placeholder="1000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
              <Text style={dynamicStyles.hint}>
                Maximum number of emails to send per day
              </Text>
            </View>

            <View style={dynamicStyles.switchRow}>
              <View style={dynamicStyles.switchLabelContainer}>
                <Text style={dynamicStyles.switchLabel}>Enable Email Notifications</Text>
                <Text style={dynamicStyles.switchHint}>
                  Send automated email notifications to users
                </Text>
              </View>
              <Switch
                value={settings.enableEmailNotifications}
                onValueChange={(value) =>
                  setSettings({ ...settings, enableEmailNotifications: value })
                }
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>

          {/* Test Email Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Test Email Configuration</Text>
            <Text style={dynamicStyles.sectionSubtitle}>
              Send a test email to verify your SMTP settings
            </Text>

            <View style={dynamicStyles.testEmailContainer}>
              <TextInput
                style={[dynamicStyles.input, dynamicStyles.testEmailInput]}
                value={testEmail}
                onChangeText={setTestEmail}
                placeholder="Enter email address"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                style={dynamicStyles.testButton}
                onPress={handleTestEmail}
                disabled={testing || !testEmail.trim()}
              >
                {testing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={20} color="#FFF" />
                    <Text style={dynamicStyles.testButtonText}>Send Test</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={dynamicStyles.infoText}>
                Make sure to save your settings before sending a test email
              </Text>
            </View>
          </View>

          {/* Help Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Need Help?</Text>
            <View style={dynamicStyles.helpCard}>
              <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
              <View style={dynamicStyles.helpContent}>
                <Text style={dynamicStyles.helpTitle}>Gmail Setup Guide</Text>
                <Text style={dynamicStyles.helpText}>
                  1. Enable 2-Step Verification in your Google Account{'\n'}
                  2. Go to Security → App passwords{'\n'}
                  3. Generate an app password for "Mail"{'\n'}
                  4. Use the generated password in SMTP Password field
                </Text>
              </View>
            </View>

            <View style={dynamicStyles.helpCard}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.success} />
              <View style={dynamicStyles.helpContent}>
                <Text style={dynamicStyles.helpTitle}>Security Best Practices</Text>
                <Text style={dynamicStyles.helpText}>
                  • Always use SSL/TLS for secure connections{'\n'}
                  • Use app-specific passwords instead of account passwords{'\n'}
                  • Set appropriate daily email limits to prevent abuse{'\n'}
                  • Regularly test your email configuration
                </Text>
              </View>
            </View>
          </View>
        </View>
          </ScrollView>
        )}
      </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    minWidth: 140,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#FFF',
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  switchHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  testEmailContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  testEmailInput: {
    flex: 1,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    minWidth: 120,
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  helpText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  statisticsContainer: {
    padding: spacing.lg,
  },
  statsCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: isMobile ? '100%' : isTablet ? '45%' : '18%',
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
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
  statCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F9FF',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  filterSection: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  customDateContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
  },
  datePickerRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: spacing.md,
  },
  datePickerItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dateButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingBottom: spacing.xl,
  },
  datePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  datePickerModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  datePickerModalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  logsSection: {
    backgroundColor: '#FFF',
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
  logsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  refreshButton: {
    padding: spacing.sm,
  },
  logsLoadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyLogsContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyLogsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyLogsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  logCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.sm,
  },
  logHeaderInfo: {
    flex: 1,
  },
  logSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  logDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  logBody: {
    marginTop: spacing.sm,
  },
  logRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  logLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 60,
  },
  logValue: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  logActions: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  paginationButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({});

export default AdminSMTPSettingsScreen;
