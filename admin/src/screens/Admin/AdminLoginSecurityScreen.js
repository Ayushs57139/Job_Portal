import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  RefreshControl,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';
import DateTimePicker from '@react-native-community/datetimepicker';

const AdminLoginSecurityScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('statistics'); // 'statistics' or 'settings'

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalAttempts: 0,
    adminAttempts: 0,
    candidateAttempts: 0,
    companyAttempts: 0,
    consultancyAttempts: 0,
    successfulLogins: 0,
    failedLogins: 0,
    wrongUsername: 0,
    wrongPassword: 0,
  });

  const [loginLogs, setLoginLogs] = useState([]);
  const [ipsList, setIpsList] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [wrongUsernamesList, setWrongUsernamesList] = useState([]);
  const [blockedIpsList, setBlockedIpsList] = useState([]);
  const [blockedUsernamesList, setBlockedUsernamesList] = useState([]);

  // Filters
  const [dateFilter, setDateFilter] = useState('last_24_hours');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    enableIpBlocking: false,
    enableUsernameBlocking: false,
    enableCountryBlocking: false,
    maxFailedAttempts: 5,
    blockDuration: 30, // minutes
    allowedCountries: [],
    blockedCountries: [],
  });

  // Modal states
  const [showBlockIpModal, setShowBlockIpModal] = useState(false);
  const [showBlockUsernameModal, setShowBlockUsernameModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [newBlockIp, setNewBlockIp] = useState('');
  const [newBlockUsername, setNewBlockUsername] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    loadData();
  }, [activeTab, dateFilter, customDateRange, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'statistics') {
        await loadStatistics();
      } else {
        await loadSecuritySettings();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStatistics = async () => {
    try {
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

      const filters = {
        page: currentPage,
        limit: 20,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const [statsResponse, logsResponse, ipsResponse, countriesResponse, wrongUsernamesResponse, blockedIpsResponse, blockedUsernamesResponse] = await Promise.all([
        api.getLoginStatistics(filters),
        api.getLoginLogs(filters),
        api.getLoginIpsList(filters),
        api.getLoginCountriesList(filters),
        api.getWrongUsernamesList(filters),
        api.getBlockedIpsList(),
        api.getBlockedUsernamesList(),
      ]);

      if (statsResponse.success) {
        setStatistics(statsResponse.data);
      }

      if (logsResponse.success) {
        setLoginLogs(logsResponse.data.logs || []);
        setTotalPages(logsResponse.data.pagination?.totalPages || 1);
      }

      if (ipsResponse.success) {
        setIpsList(ipsResponse.data || []);
      }

      if (countriesResponse.success) {
        setCountriesList(countriesResponse.data || []);
      }

      if (wrongUsernamesResponse.success) {
        setWrongUsernamesList(wrongUsernamesResponse.data || []);
      }

      if (blockedIpsResponse.success) {
        setBlockedIpsList(blockedIpsResponse.data || []);
      }

      if (blockedUsernamesResponse.success) {
        setBlockedUsernamesList(blockedUsernamesResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      throw error;
    }
  };

  const loadSecuritySettings = async () => {
    try {
      const response = await api.getLoginSecuritySettings();
      if (response.success) {
        setSecuritySettings(response.data);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
      throw error;
    }
  };

  const handleSaveSecuritySettings = async () => {
    try {
      const response = await api.updateLoginSecuritySettings(securitySettings);
      if (response.success) {
        Alert.alert('Success', 'Security settings updated successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', error.message || 'Failed to save settings');
    }
  };

  const handleBlockIp = async () => {
    if (!newBlockIp.trim()) {
      Alert.alert('Validation Error', 'Please enter an IP address');
      return;
    }

    try {
      const response = await api.blockIpAddress(newBlockIp.trim(), blockReason.trim());
      if (response.success) {
        Alert.alert('Success', 'IP address blocked successfully');
        setShowBlockIpModal(false);
        setNewBlockIp('');
        setBlockReason('');
        loadStatistics();
      } else {
        Alert.alert('Error', response.message || 'Failed to block IP');
      }
    } catch (error) {
      console.error('Error blocking IP:', error);
      Alert.alert('Error', error.message || 'Failed to block IP');
    }
  };

  const handleUnblockIp = async (ip) => {
    Alert.alert(
      'Unblock IP',
      `Are you sure you want to unblock ${ip}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              const response = await api.unblockIpAddress(ip);
              if (response.success) {
                Alert.alert('Success', 'IP address unblocked successfully');
                loadStatistics();
              } else {
                Alert.alert('Error', response.message || 'Failed to unblock IP');
              }
            } catch (error) {
              console.error('Error unblocking IP:', error);
              Alert.alert('Error', error.message || 'Failed to unblock IP');
            }
          },
        },
      ]
    );
  };

  const handleBlockUsername = async () => {
    if (!newBlockUsername.trim()) {
      Alert.alert('Validation Error', 'Please enter a username');
      return;
    }

    try {
      const response = await api.blockUsername(newBlockUsername.trim(), blockReason.trim());
      if (response.success) {
        Alert.alert('Success', 'Username blocked successfully');
        setShowBlockUsernameModal(false);
        setNewBlockUsername('');
        setBlockReason('');
        loadStatistics();
      } else {
        Alert.alert('Error', response.message || 'Failed to block username');
      }
    } catch (error) {
      console.error('Error blocking username:', error);
      Alert.alert('Error', error.message || 'Failed to block username');
    }
  };

  const handleUnblockUsername = async (username) => {
    Alert.alert(
      'Unblock Username',
      `Are you sure you want to unblock ${username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              const response = await api.unblockUsername(username);
              if (response.success) {
                Alert.alert('Success', 'Username unblocked successfully');
                loadStatistics();
              } else {
                Alert.alert('Error', response.message || 'Failed to unblock username');
              }
            } catch (error) {
              console.error('Error unblocking username:', error);
              Alert.alert('Error', error.message || 'Failed to unblock username');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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

  const renderStatisticsCards = () => (
    <View style={dynamicStyles.statsCardsContainer}>
      <View style={dynamicStyles.statsRow}>
        <View style={dynamicStyles.statCard}>
          <Ionicons name="log-in" size={32} color={colors.primary} />
          <Text style={dynamicStyles.statValue}>{statistics.totalAttempts}</Text>
          <Text style={dynamicStyles.statLabel}>Total Login Attempts</Text>
        </View>

        <View style={dynamicStyles.statCard}>
          <Ionicons name="shield-checkmark" size={32} color="#9333EA" />
          <Text style={dynamicStyles.statValue}>{statistics.adminAttempts}</Text>
          <Text style={dynamicStyles.statLabel}>Admin Logins</Text>
        </View>

        <View style={dynamicStyles.statCard}>
          <Ionicons name="person" size={32} color="#3B82F6" />
          <Text style={dynamicStyles.statValue}>{statistics.candidateAttempts}</Text>
          <Text style={dynamicStyles.statLabel}>Candidate Logins</Text>
        </View>

        <View style={dynamicStyles.statCard}>
          <Ionicons name="business" size={32} color="#F59E0B" />
          <Text style={dynamicStyles.statValue}>{statistics.companyAttempts}</Text>
          <Text style={dynamicStyles.statLabel}>Company Logins</Text>
        </View>

        <View style={dynamicStyles.statCard}>
          <Ionicons name="briefcase" size={32} color="#10B981" />
          <Text style={dynamicStyles.statValue}>{statistics.consultancyAttempts}</Text>
          <Text style={dynamicStyles.statLabel}>Consultancy Logins</Text>
        </View>
      </View>

      <View style={dynamicStyles.statsRow}>
        <View style={[dynamicStyles.statCard, { borderColor: colors.success, borderWidth: 2 }]}>
          <Ionicons name="checkmark-circle" size={32} color={colors.success} />
          <Text style={dynamicStyles.statValue}>{statistics.successfulLogins}</Text>
          <Text style={dynamicStyles.statLabel}>Successful Logins</Text>
        </View>

        <View style={[dynamicStyles.statCard, { borderColor: colors.error, borderWidth: 2 }]}>
          <Ionicons name="close-circle" size={32} color={colors.error} />
          <Text style={dynamicStyles.statValue}>{statistics.failedLogins}</Text>
          <Text style={dynamicStyles.statLabel}>Failed Logins</Text>
        </View>

        <View style={dynamicStyles.statCard}>
          <Ionicons name="person-remove" size={32} color="#EF4444" />
          <Text style={dynamicStyles.statValue}>{statistics.wrongUsername}</Text>
          <Text style={dynamicStyles.statLabel}>Wrong Username</Text>
        </View>

        <View style={dynamicStyles.statCard}>
          <Ionicons name="key" size={32} color="#F97316" />
          <Text style={dynamicStyles.statValue}>{statistics.wrongPassword}</Text>
          <Text style={dynamicStyles.statLabel}>Wrong Password</Text>
        </View>
      </View>
    </View>
  );

  const renderDateFilters = () => (
    <View style={dynamicStyles.filterSection}>
      <Text style={dynamicStyles.filterTitle}>Select Timespan</Text>
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
  );

  const renderListSection = (title, icon, data, emptyMessage, renderItem) => (
    <View style={dynamicStyles.listSection}>
      <View style={dynamicStyles.listHeader}>
        <View style={dynamicStyles.listHeaderLeft}>
          <Ionicons name={icon} size={24} color={colors.primary} />
          <Text style={dynamicStyles.listTitle}>{title}</Text>
        </View>
        <Text style={dynamicStyles.listCount}>{data.length} items</Text>
      </View>

      {data.length === 0 ? (
        <View style={dynamicStyles.emptyList}>
          <Ionicons name="information-circle-outline" size={48} color={colors.border} />
          <Text style={dynamicStyles.emptyListText}>{emptyMessage}</Text>
        </View>
      ) : (
        <View style={dynamicStyles.listContent}>
          {data.map((item, index) => renderItem(item, index))}
        </View>
      )}
    </View>
  );

  const renderStatisticsTab = () => (
    <ScrollView
      style={dynamicStyles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={dynamicStyles.container}>
        {renderStatisticsCards()}
        {renderDateFilters()}

        {renderListSection(
          'Login IPs List',
          'globe-outline',
          ipsList,
          'No IP addresses recorded',
          (item, index) => (
            <View key={index} style={dynamicStyles.listItem}>
              <View style={dynamicStyles.listItemLeft}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <View style={dynamicStyles.listItemInfo}>
                  <Text style={dynamicStyles.listItemTitle}>{item.ip}</Text>
                  <Text style={dynamicStyles.listItemSubtitle}>
                    {item.count} attempts • Last: {formatDateTime(item.lastAttempt)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={dynamicStyles.blockButton}
                onPress={() => {
                  setNewBlockIp(item.ip);
                  setShowBlockIpModal(true);
                }}
              >
                <Ionicons name="ban" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          )
        )}

        {renderListSection(
          'Login Countries List',
          'flag-outline',
          countriesList,
          'No countries recorded',
          (item, index) => (
            <View key={index} style={dynamicStyles.listItem}>
              <View style={dynamicStyles.listItemLeft}>
                <Ionicons name="flag" size={20} color={colors.success} />
                <View style={dynamicStyles.listItemInfo}>
                  <Text style={dynamicStyles.listItemTitle}>{item.country || 'Unknown'}</Text>
                  <Text style={dynamicStyles.listItemSubtitle}>{item.count} attempts</Text>
                </View>
              </View>
            </View>
          )
        )}

        {renderListSection(
          'Wrong Usernames List',
          'person-remove-outline',
          wrongUsernamesList,
          'No wrong usernames recorded',
          (item, index) => (
            <View key={index} style={dynamicStyles.listItem}>
              <View style={dynamicStyles.listItemLeft}>
                <Ionicons name="alert-circle" size={20} color={colors.warning} />
                <View style={dynamicStyles.listItemInfo}>
                  <Text style={dynamicStyles.listItemTitle}>{item.username}</Text>
                  <Text style={dynamicStyles.listItemSubtitle}>
                    {item.count} attempts • Last: {formatDateTime(item.lastAttempt)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={dynamicStyles.blockButton}
                onPress={() => {
                  setNewBlockUsername(item.username);
                  setShowBlockUsernameModal(true);
                }}
              >
                <Ionicons name="ban" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          )
        )}

        {renderListSection(
          'Blocked IPs List',
          'ban-outline',
          blockedIpsList,
          'No blocked IPs',
          (item, index) => (
            <View key={index} style={dynamicStyles.listItem}>
              <View style={dynamicStyles.listItemLeft}>
                <Ionicons name="ban" size={20} color={colors.error} />
                <View style={dynamicStyles.listItemInfo}>
                  <Text style={dynamicStyles.listItemTitle}>{item.ip}</Text>
                  <Text style={dynamicStyles.listItemSubtitle}>
                    Reason: {item.reason || 'No reason provided'} • Blocked: {formatDateTime(item.blockedAt)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={dynamicStyles.unblockButton}
                onPress={() => handleUnblockIp(item.ip)}
              >
                <Text style={dynamicStyles.unblockButtonText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        {renderListSection(
          'Blocked Usernames List',
          'person-remove-outline',
          blockedUsernamesList,
          'No blocked usernames',
          (item, index) => (
            <View key={index} style={dynamicStyles.listItem}>
              <View style={dynamicStyles.listItemLeft}>
                <Ionicons name="person-remove" size={20} color={colors.error} />
                <View style={dynamicStyles.listItemInfo}>
                  <Text style={dynamicStyles.listItemTitle}>{item.username}</Text>
                  <Text style={dynamicStyles.listItemSubtitle}>
                    Reason: {item.reason || 'No reason provided'} • Blocked: {formatDateTime(item.blockedAt)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={dynamicStyles.unblockButton}
                onPress={() => handleUnblockUsername(item.username)}
              >
                <Text style={dynamicStyles.unblockButtonText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        <View style={dynamicStyles.actionButtonsContainer}>
          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={() => setShowBlockIpModal(true)}
          >
            <Ionicons name="add-circle" size={20} color="#FFF" />
            <Text style={dynamicStyles.actionButtonText}>Block IP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={() => setShowBlockUsernameModal(true)}
          >
            <Ionicons name="add-circle" size={20} color="#FFF" />
            <Text style={dynamicStyles.actionButtonText}>Block Username</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView
      style={dynamicStyles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Security Settings</Text>
          <Text style={dynamicStyles.sectionSubtitle}>
            Configure login security and blocking options
          </Text>

          <View style={dynamicStyles.switchRow}>
            <View style={dynamicStyles.switchLabelContainer}>
              <Text style={dynamicStyles.switchLabel}>Enable IP Blocking</Text>
              <Text style={dynamicStyles.switchHint}>
                Block login attempts from specific IP addresses
              </Text>
            </View>
            <Switch
              value={securitySettings.enableIpBlocking}
              onValueChange={(value) =>
                setSecuritySettings({ ...securitySettings, enableIpBlocking: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={dynamicStyles.switchRow}>
            <View style={dynamicStyles.switchLabelContainer}>
              <Text style={dynamicStyles.switchLabel}>Enable Username Blocking</Text>
              <Text style={dynamicStyles.switchHint}>
                Block login attempts for specific usernames
              </Text>
            </View>
            <Switch
              value={securitySettings.enableUsernameBlocking}
              onValueChange={(value) =>
                setSecuritySettings({ ...securitySettings, enableUsernameBlocking: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={dynamicStyles.switchRow}>
            <View style={dynamicStyles.switchLabelContainer}>
              <Text style={dynamicStyles.switchLabel}>Enable Country Blocking</Text>
              <Text style={dynamicStyles.switchHint}>
                Block or allow login attempts from specific countries
              </Text>
            </View>
            <Switch
              value={securitySettings.enableCountryBlocking}
              onValueChange={(value) =>
                setSecuritySettings({ ...securitySettings, enableCountryBlocking: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Max Failed Attempts</Text>
            <TextInput
              style={dynamicStyles.input}
              value={String(securitySettings.maxFailedAttempts)}
              onChangeText={(text) =>
                setSecuritySettings({
                  ...securitySettings,
                  maxFailedAttempts: parseInt(text) || 5,
                })
              }
              placeholder="5"
              keyboardType="number-pad"
            />
            <Text style={dynamicStyles.hint}>
              Number of failed attempts before blocking
            </Text>
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Block Duration (minutes)</Text>
            <TextInput
              style={dynamicStyles.input}
              value={String(securitySettings.blockDuration)}
              onChangeText={(text) =>
                setSecuritySettings({
                  ...securitySettings,
                  blockDuration: parseInt(text) || 30,
                })
              }
              placeholder="30"
              keyboardType="number-pad"
            />
            <Text style={dynamicStyles.hint}>
              How long to block after max failed attempts
            </Text>
          </View>

          <TouchableOpacity
            style={dynamicStyles.saveButton}
            onPress={handleSaveSecuritySettings}
          >
            <Ionicons name="save-outline" size={20} color="#FFF" />
            <Text style={dynamicStyles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  if (loading && !refreshing) {
    return (
      <AdminLayout
        title="Login Security"
        activeScreen="AdminLoginSecurity"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Login Security"
      activeScreen="AdminLoginSecurity"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <View style={dynamicStyles.mainContainer}>
        <View style={dynamicStyles.tabContainer}>
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
              Statistics & Logs
            </Text>
          </TouchableOpacity>

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
              Security Settings
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'statistics' ? renderStatisticsTab() : renderSettingsTab()}

        {/* Block IP Modal */}
        <Modal
          visible={showBlockIpModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBlockIpModal(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Block IP Address</Text>
                <TouchableOpacity onPress={() => setShowBlockIpModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={dynamicStyles.modalBody}>
                <View style={dynamicStyles.inputGroup}>
                  <Text style={dynamicStyles.label}>IP Address *</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={newBlockIp}
                    onChangeText={setNewBlockIp}
                    placeholder="192.168.1.1"
                    keyboardType="numeric"
                  />
                </View>

                <View style={dynamicStyles.inputGroup}>
                  <Text style={dynamicStyles.label}>Reason (Optional)</Text>
                  <TextInput
                    style={[dynamicStyles.input, dynamicStyles.textArea]}
                    value={blockReason}
                    onChangeText={setBlockReason}
                    placeholder="Enter reason for blocking"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  style={dynamicStyles.modalButton}
                  onPress={handleBlockIp}
                >
                  <Text style={dynamicStyles.modalButtonText}>Block IP</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Block Username Modal */}
        <Modal
          visible={showBlockUsernameModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBlockUsernameModal(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Block Username</Text>
                <TouchableOpacity onPress={() => setShowBlockUsernameModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={dynamicStyles.modalBody}>
                <View style={dynamicStyles.inputGroup}>
                  <Text style={dynamicStyles.label}>Username *</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={newBlockUsername}
                    onChangeText={setNewBlockUsername}
                    placeholder="username"
                    autoCapitalize="none"
                  />
                </View>

                <View style={dynamicStyles.inputGroup}>
                  <Text style={dynamicStyles.label}>Reason (Optional)</Text>
                  <TextInput
                    style={[dynamicStyles.input, dynamicStyles.textArea]}
                    value={blockReason}
                    onChangeText={setBlockReason}
                    placeholder="Enter reason for blocking"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  style={dynamicStyles.modalButton}
                  onPress={handleBlockUsername}
                >
                  <Text style={dynamicStyles.modalButtonText}>Block Username</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker */}
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
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  mainContainer: {
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
  scrollView: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
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
  statsCardsContainer: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: isMobile ? '100%' : isTablet ? '45%' : '18%',
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
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
  listSection: {
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  listCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  listContent: {
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  blockButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error + '20',
  },
  unblockButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.success,
  },
  unblockButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyList: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
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
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 500,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    }),
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
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
});

export default AdminLoginSecurityScreen;
