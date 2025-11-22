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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import UserSidebar from '../../components/UserSidebar';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';

const REFRESH_INTERVAL = 15000; // 15 seconds for real-time updates

const UserDashboardScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop);
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeApplications: 0,
    savedJobs: 0,
    profileViews: 0,
    appliedJobs: 0,
  });
  const [badges, setBadges] = useState({
    savedJobs: 0,
    activeApplications: 0,
    appliedJobs: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const intervalRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Load data function
  const loadUserData = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsUpdating(true);
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
      ]).start(() => setIsUpdating(false));
    }

    try {
      const userData = await api.getCurrentUserFromStorage();
      setUser(userData);
      
      // Load dashboard stats from backend
      try {
        const dashboardData = await api.getUserDashboardStats();
        const dashboardStats = dashboardData.stats || {};
        
        // Smoothly update stats
        setStats({
          totalApplications: dashboardStats.totalApplications || 0,
          activeApplications: dashboardStats.activeApplications || 0,
          savedJobs: dashboardStats.savedJobs || 0,
          profileViews: dashboardStats.profileViews || 0,
          appliedJobs: dashboardStats.statusCounts?.applied || 0,
        });

        setBadges({
          savedJobs: dashboardStats.savedJobs || 0,
          activeApplications: dashboardStats.activeApplications || 0,
          appliedJobs: dashboardStats.statusCounts?.applied || 0,
        });

        // Set recent applications
        if (dashboardStats.recentApplications) {
          setRecentApplications(dashboardStats.recentApplications);
        }
      } catch (statsError) {
        console.log('Could not load dashboard stats:', statsError.message);
        // Fallback to individual API calls
        try {
          const applications = await api.getMyApplications();
          const savedJobs = await api.getSavedJobs();
          
          setStats({
            totalApplications: applications.applications?.length || 0,
            activeApplications: applications.applications?.filter(app => 
              ['pending', 'reviewed', 'shortlisted'].includes(app.status)
            ).length || 0,
            savedJobs: savedJobs.savedJobs?.length || 0,
            profileViews: 0,
            appliedJobs: applications.applications?.length || 0,
          });

          setBadges({
            savedJobs: savedJobs.savedJobs?.length || 0,
            activeApplications: applications.applications?.filter(app => 
              ['pending', 'reviewed', 'shortlisted'].includes(app.status)
            ).length || 0,
            appliedJobs: applications.applications?.length || 0,
          });
        } catch (fallbackError) {
          console.log('Fallback stats loading failed:', fallbackError.message);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      if (showLoading) {
        Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fadeAnim]);

  // Initial load
  useEffect(() => {
    loadUserData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    // Start auto-refresh interval
    intervalRef.current = setInterval(() => {
      loadUserData(false); // Silent refresh
    }, REFRESH_INTERVAL);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadUserData]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      loadUserData(false); // Refresh when screen comes into focus
      
      // Restart interval when screen is focused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        loadUserData(false);
      }, REFRESH_INTERVAL);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [loadUserData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserData(true);
  };

  const handleLogout = async () => {
    if (getPlatform().OS === 'web') {
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

  if (loading) {
    return (
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={dynamicStyles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Sidebar - Always visible on web desktop */}
      {isWeb && !isPhone ? (
        <UserSidebar
          navigation={navigation}
          activeKey="dashboard"
          onClose={null}
          badges={badges}
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
            activeKey="dashboard"
            onClose={isPhone ? () => setSidebarOpen(false) : (!isWeb ? () => setSidebarOpen(false) : null)}
            badges={badges}
          />
        </>
      ) : null}

      {/* Main Content */}
      <View style={dynamicStyles.mainContent}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          {(!isWeb || isPhone || (!isDesktop && !isTablet)) && (
            <TouchableOpacity 
              onPress={() => setSidebarOpen(!sidebarOpen)}
              style={dynamicStyles.menuButton}
            >
              <Ionicons name="menu" size={isPhone ? 20 : 24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <Text style={dynamicStyles.headerTitle}>Dashboard</Text>
          
          <View style={dynamicStyles.headerRight}>
            <View style={dynamicStyles.userInfo}>
              <View style={dynamicStyles.avatar}>
                <Text style={dynamicStyles.avatarText}>{getUserInitials()}</Text>
              </View>
              <Text style={dynamicStyles.userName}>{user?.firstName || 'User'}</Text>
            </View>
            <TouchableOpacity 
              style={dynamicStyles.logoutButtonHeader} 
              onPress={() => {
                console.log('Logout button clicked');
                handleLogout();
              }}
              activeOpacity={0.7}
              disabled={false}
            >
              <Ionicons name="arrow-forward" size={isPhone ? 14 : 16} color="#FFFFFF" />
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
              Welcome to your JobWala Dashboard
            </Text>
            <View style={dynamicStyles.liveIndicator}>
              <View style={dynamicStyles.liveDot} />
              <Text style={dynamicStyles.liveText}>Live</Text>
            </View>
          </View>

          {/* Stats Cards Grid */}
          <Animated.View style={[dynamicStyles.statsGrid, { opacity: fadeAnim }]}>
            {/* Total Applications - Pink */}
            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#FF69B4' }]}>
                <Ionicons name="document-text" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>{stats.totalApplications}</Text>
              <Text style={dynamicStyles.statLabel}>Total Applications</Text>
            </View>

            {/* Saved Jobs - Blue */}
            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#4A90E2' }]}>
                <Ionicons name="bookmark" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>{stats.savedJobs}</Text>
              <Text style={dynamicStyles.statLabel}>Saved Jobs</Text>
            </View>

            {/* Profile Views - Green */}
            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#10b981' }]}>
                <Ionicons name="eye" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>{stats.profileViews}</Text>
              <Text style={dynamicStyles.statLabel}>Profile Views</Text>
            </View>

            {/* Active Applications - Purple */}
            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="checkmark-circle" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>{stats.activeApplications}</Text>
              <Text style={dynamicStyles.statLabel}>Active Applications</Text>
            </View>
          </Animated.View>

          {/* Recent Applications Section */}
          <Text style={dynamicStyles.sectionTitle}>Recent Applications</Text>
          {recentApplications.length > 0 ? (
            <View style={dynamicStyles.recentApplicationsContainer}>
              {recentApplications.map((application) => (
                <TouchableOpacity
                  key={application._id || application.id || `app-${application.job?._id}`}
                  style={dynamicStyles.applicationCard}
                  onPress={() => navigation.navigate('JobDetails', { jobId: application.job?._id })}
                >
                  <View style={dynamicStyles.applicationContent}>
                    <Text style={dynamicStyles.jobTitle}>
                      {application.job?.title || 'Job Title'}
                    </Text>
                    <Text style={dynamicStyles.companyName}>
                      {application.job?.company || 'Company Name'}
                    </Text>
                    <View style={dynamicStyles.applicationMeta}>
                      <Text style={dynamicStyles.applicationDate}>
                        Applied: {new Date(application.appliedAt).toLocaleDateString()}
                      </Text>
                      <View style={[
                        dynamicStyles.statusBadge,
                        { backgroundColor: getStatusColor(application.status) }
                      ]}>
                        <Text style={dynamicStyles.statusText}>{application.status}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="document-text-outline" size={isPhone ? 40 : 48} color={colors.textSecondary} />
              <Text style={dynamicStyles.emptyStateText}>No recent applications</Text>
              <TouchableOpacity 
                style={dynamicStyles.findJobsButton}
                onPress={() => navigation.navigate('Jobs')}
              >
                <Text style={dynamicStyles.findJobsButtonText}>Find Jobs</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'applied':
      return '#3b82f6';
    case 'viewed':
      return '#10b981';
    case 'shortlisted':
      return '#8B5CF6';
    case 'rejected':
      return '#ef4444';
    case 'interviewed':
      return '#f59e0b';
    case 'hired':
      return '#10b981';
    default:
      return '#718096';
  }
};

const getStyles = (isPhone, isMobile, isTablet, isDesktop) => {
  const isWeb = getPlatform().OS === 'web';
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: isPhone ? 'column' : 'row',
      backgroundColor: colors.background,
      ...(isWeb && !isPhone && {
        position: 'relative',
      }),
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
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
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
      zIndex: 10,
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
      ...(isWeb && {
        cursor: 'default',
      }),
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
    sectionTitle: {
      ...typography.h5,
      color: colors.text,
      fontWeight: '700',
      marginBottom: spacing.md,
      fontSize: isPhone ? 16 : (isMobile ? 18 : (isTablet ? 20 : 22)),
    },
    recentApplicationsContainer: {
      gap: spacing.md,
    },
    applicationCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: isPhone ? spacing.sm : spacing.md,
      ...shadows.sm,
      marginBottom: spacing.sm,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    applicationContent: {
      gap: spacing.xs,
    },
    jobTitle: {
      ...typography.h6,
      color: colors.text,
      fontWeight: '600',
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
    },
    companyName: {
      ...typography.body2,
      color: colors.textSecondary,
      fontSize: isPhone ? 12 : (isMobile ? 13 : 14),
    },
    applicationMeta: {
      flexDirection: isPhone ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isPhone ? 'flex-start' : 'center',
      marginTop: spacing.xs,
      gap: isPhone ? spacing.xs : 0,
    },
    applicationDate: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: isPhone ? 10 : 11,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    statusText: {
      ...typography.caption,
      color: '#FFFFFF',
      fontWeight: '600',
      textTransform: 'capitalize',
      fontSize: isPhone ? 10 : 11,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isPhone ? spacing.xl : spacing.xxl,
    },
    emptyStateText: {
      ...typography.body1,
      color: colors.textSecondary,
      marginTop: spacing.md,
      marginBottom: spacing.lg,
      fontSize: isPhone ? 14 : 16,
    },
    findJobsButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: isPhone ? spacing.md : spacing.lg,
      paddingVertical: isPhone ? spacing.sm : spacing.md,
      borderRadius: borderRadius.md,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    findJobsButtonText: {
      ...typography.button,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: isPhone ? 14 : 16,
    },
  });
};

export default UserDashboardScreen;

