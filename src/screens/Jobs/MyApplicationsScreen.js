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
import { useResponsive } from '../../utils/responsive';

const isWeb = Platform.OS === 'web';
const REFRESH_INTERVAL = 15000; // 15 seconds for real-time updates

const MyApplicationsScreen = ({ navigation, route }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(isWeb && !isPhone);
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
    if (Platform.OS === 'web') {
      // For web, use window.confirm
      if (window.confirm('Are you sure you want to logout?')) {
        try {
          await api.logout();
        } catch (error) {
          console.log('Logout error:', error);
        }
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } else {
      // For mobile, use Alert
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await api.logout();
              } catch (error) {
                console.log('Logout error:', error);
              } finally {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }
            },
          },
        ]
      );
    }
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
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={dynamicStyles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Sidebar */}
      {/* Sidebar - Always visible on web desktop */}
      {isWeb && !isPhone ? (
        <UserSidebar
          navigation={navigation}
          activeKey="applications"
          onClose={null}
          badges={{
            activeApplications: statusCounts.active,
            appliedJobs: statusCounts.all,
          }}
        />
      ) : sidebarOpen ? (
        <>
          {isPhone && (
            <TouchableOpacity
              style={dynamicStyles.backdrop}
              onPress={() => setSidebarOpen(false)}
              activeOpacity={1}
            />
          )}
          <UserSidebar
            navigation={navigation}
            activeKey="applications"
            onClose={isPhone ? () => setSidebarOpen(false) : (!isWeb ? () => setSidebarOpen(false) : null)}
            badges={{
              activeApplications: statusCounts.active,
              appliedJobs: statusCounts.all,
            }}
          />
        </>
      ) : null}

      {/* Main Content */}
      <View style={dynamicStyles.mainContent}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          {(!isWeb || isPhone) && (
            <TouchableOpacity 
              onPress={() => setSidebarOpen(!sidebarOpen)}
              style={dynamicStyles.menuButton}
            >
              <Ionicons name="menu" size={isPhone ? 20 : 24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <Text style={dynamicStyles.headerTitle}>My Applications</Text>
          
          <View style={dynamicStyles.headerRight}>
            <View style={dynamicStyles.userInfo}>
              <View style={dynamicStyles.avatar}>
                <Text style={dynamicStyles.avatarText}>{getUserInitials()}</Text>
              </View>
              <Text style={dynamicStyles.userName}>{user?.firstName || 'User'}</Text>
            </View>
            <TouchableOpacity style={dynamicStyles.logoutButtonHeader} onPress={handleLogout}>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              <Text style={dynamicStyles.logoutTextHeader}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      
      <ScrollView
          style={dynamicStyles.scrollView}
          contentContainerStyle={dynamicStyles.scrollContent}
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
          <View style={dynamicStyles.welcomeHeader}>
            <Text style={dynamicStyles.welcomeMessage}>
              Track your job applications
            </Text>
            <View style={dynamicStyles.liveIndicator}>
              <View style={dynamicStyles.liveDot} />
              <Text style={dynamicStyles.liveText}>Live</Text>
            </View>
            </View>

          {/* Status Overview Cards */}
          <Animated.View style={[dynamicStyles.statsGrid, { opacity: fadeAnim }]}>
            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#3b82f6' }]}>
                <Ionicons name="document-text" size={24} color="#FFFFFF" />
            </View>
              <Text style={dynamicStyles.statValue}>{statusCounts.all}</Text>
              <Text style={dynamicStyles.statLabel}>Total Applications</Text>
            </View>

            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#10b981' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            </View>
              <Text style={dynamicStyles.statValue}>{statusCounts.active}</Text>
              <Text style={dynamicStyles.statLabel}>Active Applications</Text>
            </View>

            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="star" size={24} color="#FFFFFF" />
          </View>
              <Text style={dynamicStyles.statValue}>{statusCounts.shortlisted}</Text>
              <Text style={dynamicStyles.statLabel}>Shortlisted</Text>
        </View>

            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#ef4444' }]}>
                <Ionicons name="close-circle" size={24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>{statusCounts.rejected}</Text>
              <Text style={dynamicStyles.statLabel}>Rejected</Text>
            </View>
          </Animated.View>

          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={dynamicStyles.filterContainer}
            contentContainerStyle={dynamicStyles.filterContent}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  dynamicStyles.filterTab,
                  selectedFilter === filter.key && dynamicStyles.filterTabActive
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text style={[
                  dynamicStyles.filterTabText,
                  selectedFilter === filter.key && dynamicStyles.filterTabTextActive
                ]}>
                  {filter.label}
                </Text>
                {filter.count > 0 && (
                  <View style={[
                    dynamicStyles.filterBadge,
                    selectedFilter === filter.key && dynamicStyles.filterBadgeActive
                  ]}>
                    <Text style={[
                      dynamicStyles.filterBadgeText,
                      selectedFilter === filter.key && dynamicStyles.filterBadgeTextActive
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
          <View style={dynamicStyles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
              <Text style={dynamicStyles.emptyTitle}>
                {selectedFilter === 'all' 
                  ? 'No Applications Yet' 
                  : `No ${getFilterLabel(selectedFilter)} Applications`}
              </Text>
            <Text style={dynamicStyles.emptySubtitle}>
                {selectedFilter === 'all'
                  ? 'Start applying to jobs to see your applications here'
                  : 'No applications match this filter'}
            </Text>
              {selectedFilter === 'all' && (
            <TouchableOpacity
              style={dynamicStyles.browseJobsButton}
              onPress={() => navigation.navigate('Jobs')}
            >
              <Text style={dynamicStyles.browseJobsButtonText}>Browse Jobs</Text>
            </TouchableOpacity>
              )}
          </View>
        ) : (
          <View style={dynamicStyles.applicationsList}>
              <Text style={dynamicStyles.sectionTitle}>
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
                    style={dynamicStyles.applicationCard}
                    onPress={() => {
                      if (job._id || job.id) {
                        navigation.navigate('JobDetails', { jobId: job._id || job.id });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={dynamicStyles.cardHeader}>
                      <View style={dynamicStyles.jobInfo}>
                        <Text style={dynamicStyles.jobTitle}>{job.title || 'Job Title'}</Text>
                        <Text style={dynamicStyles.companyName}>{job.company || 'Company Name'}</Text>
                        {job.location && (
                          <View style={dynamicStyles.locationRow}>
                            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                            <Text style={dynamicStyles.jobLocation}>{job.location}</Text>
                          </View>
                        )}
                      </View>
                      <View style={dynamicStyles.statusContainer}>
                        <View style={[dynamicStyles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                          <Ionicons name={status.icon} size={16} color={status.color} />
                          <Text style={[dynamicStyles.statusText, { color: status.color }]}>
                            {status.label}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={dynamicStyles.cardDetails}>
                      {application.currentJobTitle && (
                        <View style={dynamicStyles.detailRow}>
                          <Ionicons name="briefcase-outline" size={16} color={colors.textSecondary} />
                          <Text style={dynamicStyles.detailText}>{application.currentJobTitle}</Text>
                        </View>
                      )}
                      {application.experienceLevel && (
                        <View style={dynamicStyles.detailRow}>
                          <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
                          <Text style={dynamicStyles.detailText}>{application.experienceLevel}</Text>
                        </View>
                      )}
                      <View style={dynamicStyles.detailRow}>
                        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                        <Text style={dynamicStyles.detailText}>
                          Applied {formatDate(application.appliedAt)}
                        </Text>
                      </View>
                    </View>

                    {job.salary && (
                      <View style={dynamicStyles.salaryContainer}>
                        <Text style={dynamicStyles.salaryText}>{formatSalary(job.salary)}</Text>
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

const getStyles = (isPhone, isMobile, isTablet, isDesktop) => {
  const isWeb = Platform.OS === 'web';
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: isPhone ? 'column' : 'row',
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
      fontSize: isPhone ? 14 : 16,
    },
    mainContent: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      ...(isWeb && !isPhone && {
        marginLeft: isDesktop ? 280 : (isTablet ? 260 : 240),
        width: `calc(100% - ${isDesktop ? 280 : (isTablet ? 260 : 240)}px)`,
      }),
      ...(isPhone && {
        width: '100%',
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
      paddingVertical: isPhone ? spacing.sm : spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: '#FFFFFF',
      ...(isPhone && {
        flexWrap: 'wrap',
      }),
    },
    menuButton: {
      marginRight: isPhone ? spacing.sm : spacing.md,
    },
    headerTitle: {
      ...typography.h4,
      color: colors.text,
      fontWeight: '700',
      flex: 1,
      fontSize: isPhone ? 18 : (isMobile ? 20 : (isTablet ? 22 : 24)),
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isPhone ? spacing.sm : spacing.md,
      ...(isPhone && {
        width: '100%',
        marginTop: spacing.sm,
        justifyContent: 'flex-end',
      }),
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isPhone ? spacing.xs : spacing.sm,
      ...(isPhone && {
        flex: 1,
      }),
    },
    avatar: {
      width: isPhone ? 32 : (isMobile ? 36 : 40),
      height: isPhone ? 32 : (isMobile ? 36 : 40),
      borderRadius: isPhone ? 16 : (isMobile ? 18 : 20),
      backgroundColor: '#4A90E2',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: isPhone ? 12 : (isMobile ? 14 : 16),
      fontWeight: '600',
    },
    userName: {
      ...typography.body2,
      color: colors.text,
      fontWeight: '500',
      fontSize: isPhone ? 13 : (isMobile ? 14 : 16),
      ...(isPhone && {
        display: 'none',
      }),
    },
    logoutButtonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ef4444',
      paddingHorizontal: isPhone ? spacing.sm : spacing.md,
      paddingVertical: isPhone ? spacing.xs : spacing.sm,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    logoutTextHeader: {
      ...typography.body2,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: isPhone ? 12 : 14,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
      paddingBottom: isPhone ? spacing.xl : spacing.xxl,
    },
    welcomeHeader: {
      flexDirection: isPhone ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isPhone ? 'flex-start' : 'center',
      marginBottom: isPhone ? spacing.lg : spacing.xl,
      gap: isPhone ? spacing.sm : 0,
    },
    welcomeMessage: {
      ...typography.body1,
      color: colors.textSecondary,
      flex: 1,
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
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
      width: isPhone ? 6 : 8,
      height: isPhone ? 6 : 8,
      borderRadius: isPhone ? 3 : 4,
      backgroundColor: '#10b981',
    },
    liveText: {
      ...typography.caption,
      color: '#10b981',
      fontWeight: '600',
      fontSize: isPhone ? 10 : 11,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isPhone ? spacing.sm : spacing.md,
      marginBottom: isPhone ? spacing.lg : spacing.xl,
    },
    statCard: {
      width: isPhone ? '48%' : (isMobile ? '47%' : (isTablet ? '47%' : '23%')),
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
      alignItems: 'center',
      ...shadows.sm,
    },
    statIconContainer: {
      width: isPhone ? 40 : (isMobile ? 44 : 48),
      height: isPhone ? 40 : (isMobile ? 44 : 48),
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
      fontSize: isPhone ? 20 : (isMobile ? 24 : (isTablet ? 28 : 32)),
    },
    statLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      fontSize: isPhone ? 11 : (isMobile ? 12 : 13),
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
      paddingHorizontal: isPhone ? spacing.sm : spacing.md,
      paddingVertical: isPhone ? spacing.xs : spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
      gap: spacing.xs,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    filterTabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterTabText: {
      ...typography.body2,
      color: colors.text,
      fontWeight: '500',
      fontSize: isPhone ? 12 : (isMobile ? 13 : 14),
    },
    filterTabTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    filterBadge: {
      backgroundColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: isPhone ? 4 : 6,
      paddingVertical: 2,
      minWidth: isPhone ? 18 : 20,
      alignItems: 'center',
    },
    filterBadgeActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    filterBadgeText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: isPhone ? 10 : 11,
    },
    filterBadgeTextActive: {
      color: '#FFFFFF',
    },
    sectionTitle: {
      ...typography.h5,
      color: colors.text,
      fontWeight: '700',
      marginBottom: spacing.md,
      fontSize: isPhone ? 16 : (isMobile ? 18 : (isTablet ? 20 : 22)),
    },
    applicationsList: {
      gap: spacing.md,
    },
    applicationCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: isPhone ? spacing.md : spacing.lg,
      ...shadows.sm,
      marginBottom: spacing.sm,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    cardHeader: {
      flexDirection: isPhone ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isPhone ? 'flex-start' : 'flex-start',
      marginBottom: spacing.md,
      gap: isPhone ? spacing.sm : 0,
    },
    jobInfo: {
      flex: 1,
      marginRight: isPhone ? 0 : spacing.md,
    },
    jobTitle: {
      ...typography.h6,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
    },
    companyName: {
      ...typography.body1,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      fontSize: isPhone ? 13 : (isMobile ? 14 : 15),
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    jobLocation: {
      ...typography.body2,
      color: colors.textSecondary,
      fontSize: isPhone ? 12 : (isMobile ? 13 : 14),
    },
    statusContainer: {
      marginLeft: isPhone ? 0 : spacing.md,
      marginTop: isPhone ? spacing.sm : 0,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isPhone ? spacing.xs : spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      gap: spacing.xs,
    },
    statusText: {
      ...typography.caption,
      fontWeight: '600',
      fontSize: isPhone ? 10 : 11,
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
      fontSize: isPhone ? 12 : (isMobile ? 13 : 14),
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
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isPhone ? spacing.xl : spacing.xxl,
    },
    emptyTitle: {
      ...typography.h5,
      fontSize: isPhone ? 16 : (isMobile ? 18 : 20),
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
      fontSize: isPhone ? 14 : 16,
    },
    browseJobsButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: isPhone ? spacing.lg : spacing.xl,
      paddingVertical: isPhone ? spacing.sm : spacing.md,
      borderRadius: borderRadius.md,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    browseJobsButtonText: {
      ...typography.button,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: isPhone ? 14 : 16,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    },
  });
};

export default MyApplicationsScreen;
