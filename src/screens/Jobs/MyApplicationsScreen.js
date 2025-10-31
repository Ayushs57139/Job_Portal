import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import UserSidebar from '../../components/UserSidebar';
import api from '../../config/api';

const isWeb = Platform.OS === 'web';
const REFRESH_INTERVAL = 15000; // 15 seconds for real-time updates

const MyApplicationsScreen = ({ navigation, route }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(isWeb);
  const [selectedFilter, setSelectedFilter] = useState(route?.params?.filter || 'all');
  const [user, setUser] = useState(null);
  const intervalRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const statusConfig = {
    applied: { label: 'Applied', color: '#3b82f6', icon: 'paper-plane-outline' },
    pending: { label: 'Pending', color: '#f59e0b', icon: 'time-outline' },
    viewed: { label: 'Viewed', color: '#10b981', icon: 'eye-outline' },
    reviewed: { label: 'Under Review', color: '#3b82f6', icon: 'eye-outline' },
    shortlisted: { label: 'Shortlisted', color: '#8B5CF6', icon: 'checkmark-circle-outline' },
    interviewed: { label: 'Interviewed', color: '#f59e0b', icon: 'calendar-outline' },
    rejected: { label: 'Not Selected', color: '#ef4444', icon: 'close-circle-outline' },
    hired: { label: 'Hired', color: '#10b981', icon: 'trophy-outline' },
  };

  // Load applications function
  const loadApplications = useCallback(async (showLoading = false) => {
    if (showLoading) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    try {
      const userData = await api.getCurrentUserFromStorage();
      setUser(userData);

      const response = await api.getMyApplications();
      const apps = response.applications || [];
      setApplications(apps);
      
      // Apply filter
      applyFilter(selectedFilter, apps);
    } catch (error) {
      console.error('Error loading applications:', error);
      if (showLoading) {
      Alert.alert('Error', 'Failed to load applications. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter, fadeAnim]);

  // Apply filter function
  const applyFilter = useCallback((filter, apps = applications) => {
    let filtered = [...apps];
    
    if (filter === 'active') {
      filtered = apps.filter(app => 
        ['pending', 'reviewed', 'shortlisted', 'viewed', 'interviewed'].includes(app.status)
      );
    } else if (filter !== 'all') {
      filtered = apps.filter(app => app.status === filter);
    }
    
    setFilteredApplications(filtered);
  }, [applications]);

  // Initial load
  useEffect(() => {
    loadApplications(true);
  }, []);

  // Apply filter when selectedFilter changes
  useEffect(() => {
    applyFilter(selectedFilter, applications);
  }, [selectedFilter, applications]);

  // Auto-refresh interval
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadApplications(false); // Silent refresh
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadApplications]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      loadApplications(false); // Refresh when screen comes into focus
      
      // Restart interval when screen is focused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        loadApplications(false);
      }, REFRESH_INTERVAL);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [loadApplications])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadApplications(true);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await api.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
        },
      ]
    );
  };

  const getStatusConfig = (status) => {
    return statusConfig[status] || { 
      label: status || 'Unknown', 
      color: colors.textSecondary, 
      icon: 'help-outline' 
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    if (typeof salary === 'object') {
      if (salary.min && salary.max) {
        return `₹${parseInt(salary.min).toLocaleString('en-IN')} - ₹${parseInt(salary.max).toLocaleString('en-IN')}`;
      }
      if (salary.min) {
        return `₹${parseInt(salary.min).toLocaleString('en-IN')}+`;
      }
      return 'Not specified';
    }
    return `₹${parseInt(salary).toLocaleString('en-IN')}`;
  };

  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      active: 0,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
      viewed: 0,
      interviewed: 0,
    };

    applications.forEach(app => {
      const status = app.status?.toLowerCase();
      if (status) {
        counts[status] = (counts[status] || 0) + 1;
      }
      if (['pending', 'reviewed', 'shortlisted', 'viewed', 'interviewed'].includes(status)) {
        counts.active++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const filterOptions = [
    { key: 'all', label: 'All Applications', count: statusCounts.all },
    { key: 'active', label: 'Active', count: statusCounts.active },
    { key: 'pending', label: 'Pending', count: statusCounts.pending },
    { key: 'viewed', label: 'Viewed', count: statusCounts.viewed },
    { key: 'reviewed', label: 'Under Review', count: statusCounts.reviewed },
    { key: 'shortlisted', label: 'Shortlisted', count: statusCounts.shortlisted },
    { key: 'interviewed', label: 'Interviewed', count: statusCounts.interviewed },
    { key: 'hired', label: 'Hired', count: statusCounts.hired },
    { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
  ];

  const getFilterLabel = (key) => {
    const filter = filterOptions.find(f => f.key === key);
    return filter ? filter.label : key;
  };

  if (loading && applications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      {sidebarOpen && (
        <UserSidebar
          navigation={navigation}
          activeKey="applications"
          onClose={!isWeb ? () => setSidebarOpen(false) : null}
          badges={{
            activeApplications: statusCounts.active,
            appliedJobs: statusCounts.all,
          }}
        />
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setSidebarOpen(!sidebarOpen)}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>My Applications</Text>
          
          <View style={styles.headerRight}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </View>
              <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButtonHeader} onPress={handleLogout}>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              <Text style={styles.logoutTextHeader}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      
      <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
          {/* Welcome Message with Live Indicator */}
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeMessage}>
              Track your job applications
            </Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
            </View>

          {/* Status Overview Cards */}
          <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#3b82f6' }]}>
                <Ionicons name="document-text" size={24} color="#FFFFFF" />
            </View>
              <Text style={styles.statValue}>{statusCounts.all}</Text>
              <Text style={styles.statLabel}>Total Applications</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#10b981' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            </View>
              <Text style={styles.statValue}>{statusCounts.active}</Text>
              <Text style={styles.statLabel}>Active Applications</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="star" size={24} color="#FFFFFF" />
          </View>
              <Text style={styles.statValue}>{statusCounts.shortlisted}</Text>
              <Text style={styles.statLabel}>Shortlisted</Text>
        </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#ef4444' }]}>
                <Ionicons name="close-circle" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{statusCounts.rejected}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </Animated.View>

          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.key && styles.filterTabActive
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text style={[
                  styles.filterTabText,
                  selectedFilter === filter.key && styles.filterTabTextActive
                ]}>
                  {filter.label}
                </Text>
                {filter.count > 0 && (
                  <View style={[
                    styles.filterBadge,
                    selectedFilter === filter.key && styles.filterBadgeActive
                  ]}>
                    <Text style={[
                      styles.filterBadgeText,
                      selectedFilter === filter.key && styles.filterBadgeTextActive
                    ]}>
                      {filter.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

        {/* Applications List */}
          {filteredApplications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>
                {selectedFilter === 'all' 
                  ? 'No Applications Yet' 
                  : `No ${getFilterLabel(selectedFilter)} Applications`}
              </Text>
            <Text style={styles.emptySubtitle}>
                {selectedFilter === 'all'
                  ? 'Start applying to jobs to see your applications here'
                  : 'No applications match this filter'}
            </Text>
              {selectedFilter === 'all' && (
            <TouchableOpacity
              style={styles.browseJobsButton}
              onPress={() => navigation.navigate('Jobs')}
            >
              <Text style={styles.browseJobsButtonText}>Browse Jobs</Text>
            </TouchableOpacity>
              )}
          </View>
        ) : (
          <View style={styles.applicationsList}>
              <Text style={styles.sectionTitle}>
                {selectedFilter === 'all' 
                  ? 'Your Applications' 
                  : `${getFilterLabel(selectedFilter)} (${filteredApplications.length})`}
              </Text>
              {filteredApplications.map((application) => {
                const status = getStatusConfig(application.status);
                const job = application.job || {};
                
                return (
                  <TouchableOpacity
                    key={application.id || application._id || `app-${job._id}`}
                    style={styles.applicationCard}
                    onPress={() => {
                      if (job._id || job.id) {
                        navigation.navigate('JobDetails', { jobId: job._id || job.id });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.jobInfo}>
                        <Text style={styles.jobTitle}>{job.title || 'Job Title'}</Text>
                        <Text style={styles.companyName}>{job.company || 'Company Name'}</Text>
                        {job.location && (
                          <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.jobLocation}>{job.location}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.statusContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                          <Ionicons name={status.icon} size={16} color={status.color} />
                          <Text style={[styles.statusText, { color: status.color }]}>
                            {status.label}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.cardDetails}>
                      {application.currentJobTitle && (
                        <View style={styles.detailRow}>
                          <Ionicons name="briefcase-outline" size={16} color={colors.textSecondary} />
                          <Text style={styles.detailText}>{application.currentJobTitle}</Text>
                        </View>
                      )}
                      {application.experienceLevel && (
                        <View style={styles.detailRow}>
                          <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
                          <Text style={styles.detailText}>{application.experienceLevel}</Text>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.detailText}>
                          Applied {formatDate(application.appliedAt)}
                        </Text>
                      </View>
                    </View>

                    {job.salary && (
                      <View style={styles.salaryContainer}>
                        <Text style={styles.salaryText}>{formatSalary(job.salary)}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
          </View>
        )}
      </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  menuButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userName: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
  },
  logoutButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  logoutTextHeader: {
    ...typography.body2,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeMessage: {
    ...typography.body1,
    color: colors.textSecondary,
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98115',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveText: {
    ...typography.caption,
    color: '#10b981',
    fontWeight: '600',
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: spacing.lg,
  },
  filterContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 11,
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  applicationsList: {
    gap: spacing.md,
  },
  applicationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.sm,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  jobInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  jobTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  companyName: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jobLocation: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  statusContainer: {
    marginLeft: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  salaryContainer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  salaryText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  browseJobsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  browseJobsButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default MyApplicationsScreen;
