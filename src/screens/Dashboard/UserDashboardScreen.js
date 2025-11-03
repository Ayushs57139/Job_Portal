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

const UserDashboardScreen = ({ navigation }) => {
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
  const [sidebarOpen, setSidebarOpen] = useState(isWeb);
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      {sidebarOpen && (
        <UserSidebar
          navigation={navigation}
          activeKey="dashboard"
          onClose={!isWeb ? () => setSidebarOpen(false) : null}
          badges={badges}
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
          
          <Text style={styles.headerTitle}>Dashboard</Text>
          
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
              Welcome to your JobWala Dashboard
            </Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          {/* Stats Cards Grid */}
          <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
            {/* Total Applications - Pink */}
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FF69B4' }]}>
                <Ionicons name="document-text" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{stats.totalApplications}</Text>
              <Text style={styles.statLabel}>Total Applications</Text>
            </View>

            {/* Saved Jobs - Blue */}
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#4A90E2' }]}>
                <Ionicons name="bookmark" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{stats.savedJobs}</Text>
              <Text style={styles.statLabel}>Saved Jobs</Text>
            </View>

            {/* Profile Views - Green */}
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#10b981' }]}>
                <Ionicons name="eye" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{stats.profileViews}</Text>
              <Text style={styles.statLabel}>Profile Views</Text>
            </View>

            {/* Active Applications - Purple */}
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{stats.activeApplications}</Text>
              <Text style={styles.statLabel}>Active Applications</Text>
            </View>
          </Animated.View>

          {/* Recent Applications Section */}
          <Text style={styles.sectionTitle}>Recent Applications</Text>
          {recentApplications.length > 0 ? (
            <View style={styles.recentApplicationsContainer}>
              {recentApplications.map((application) => (
                <TouchableOpacity
                  key={application._id || application.id || `app-${application.job?._id}`}
                  style={styles.applicationCard}
                  onPress={() => navigation.navigate('JobDetails', { jobId: application.job?._id })}
                >
                  <View style={styles.applicationContent}>
                    <Text style={styles.jobTitle}>
                      {application.job?.title || 'Job Title'}
                    </Text>
                    <Text style={styles.companyName}>
                      {application.job?.company || 'Company Name'}
                    </Text>
                    <View style={styles.applicationMeta}>
                      <Text style={styles.applicationDate}>
                        Applied: {new Date(application.appliedAt).toLocaleDateString()}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(application.status) }
                      ]}>
                        <Text style={styles.statusText}>{application.status}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No recent applications</Text>
              <TouchableOpacity 
                style={styles.findJobsButton}
                onPress={() => navigation.navigate('Jobs')}
              >
                <Text style={styles.findJobsButtonText}>Find Jobs</Text>
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
  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  recentApplicationsContainer: {
    gap: spacing.md,
  },
  applicationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
    marginBottom: spacing.sm,
  },
  applicationContent: {
    gap: spacing.xs,
  },
  jobTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '600',
  },
  companyName: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  applicationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  applicationDate: {
    ...typography.caption,
    color: colors.textSecondary,
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
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  findJobsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  findJobsButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default UserDashboardScreen;

