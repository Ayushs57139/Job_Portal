import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const CompanyDashboardScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const { isMobile, isTablet, isTabletDevice, isLaptopDevice, isDesktopDevice, width } = responsive;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    pendingReviews: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    validateAndLoad();
  }, []);

  // Refresh user verification status when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshUserVerification = async () => {
        try {
          console.log('Refreshing user verification status...');
          const currentUser = await api.getCurrentUser();
          if (currentUser) {
            console.log('Updated user data:', {
              isVerified: currentUser.isVerified,
              isEmployerVerified: currentUser.isEmployerVerified,
              verificationStatus: currentUser.verificationStatus
            });
            setUser(prevUser => ({
              ...prevUser,
              ...currentUser,
              isVerified: currentUser.isVerified || currentUser.isEmployerVerified || false,
              isEmployerVerified: currentUser.isEmployerVerified || false,
              verifiedAt: currentUser.verifiedAt || null
            }));
          }
        } catch (error) {
          console.log('Could not refresh user verification status:', error.message);
        }
      };
      
      // Refresh immediately when screen comes into focus
      refreshUserVerification();
      
      // Also refresh every 10 seconds while screen is focused
      const interval = setInterval(refreshUserVerification, 10000);
      return () => clearInterval(interval);
    }, [])
  );

  const validateAndLoad = async () => {
    try {
      // ALWAYS fetch fresh user data from API first (not from cache)
      let currentUser = null;
      try {
        console.log('Fetching fresh user data from API...');
        currentUser = await api.getCurrentUser();
        console.log('Fetched user data:', {
          isVerified: currentUser?.isVerified,
          isEmployerVerified: currentUser?.isEmployerVerified,
          verificationStatus: currentUser?.verificationStatus
        });
      } catch (apiError) {
        console.log('API call failed, trying cached data:', apiError.message);
        // Fallback to cached data only if API fails
        const userData = await api.getCurrentUserFromStorage();
        if (!userData) {
          await handleUnauthorizedAccess('No user data found. Please login.');
          return;
        }
        currentUser = userData;
      }
      
      if (!currentUser) {
        await handleUnauthorizedAccess('No user data found. Please login.');
        return;
      }

      // STRICT VALIDATION: Only company accounts can access this dashboard
      // Check userType - must be 'company' (not 'admin', 'superadmin', 'jobseeker', or 'consultancy')
      // Explicitly reject admin, superadmin, jobseeker, and consultancy accounts
      if (currentUser.userType === 'admin' || currentUser.userType === 'superadmin') {
        await handleUnauthorizedAccess('Admin accounts cannot access company dashboard. Please use admin login.');
        return;
      }

      if (currentUser.userType === 'jobseeker') {
        await handleUnauthorizedAccess('Jobseeker accounts cannot access company dashboard. Please use jobseeker login.');
        return;
      }

      if (currentUser.userType === 'consultancy') {
        await handleUnauthorizedAccess('Consultancy accounts cannot access company dashboard. Please use consultancy login.');
        return;
      }

      // Check if user is employer with company type
      if (currentUser.userType !== 'employer' || currentUser.employerType !== 'company') {
        if (currentUser.userType !== 'company') {
          await handleUnauthorizedAccess(`Invalid account type: ${currentUser.userType}. Only company accounts can access this dashboard.`);
          return;
        }
      }

      // Set user with all verification fields
      setUser({ 
        ...currentUser, 
        userType: 'company',
        isVerified: currentUser.isVerified || currentUser.isEmployerVerified || false,
        isEmployerVerified: currentUser.isEmployerVerified || false,
        verifiedAt: currentUser.verifiedAt || null
      });
      
      // Load dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error in validateAndLoad:', error);
      await handleUnauthorizedAccess('Failed to validate access. Please login again.');
    }
  };

  const handleUnauthorizedAccess = async (message) => {
    Alert.alert(
      'Access Denied',
      message,
      [
        {
          text: 'OK',
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
    setLoading(false);
  };

  const loadDashboardData = async () => {
    try {

      // Fetch employer dashboard (dynamic)
      try {
        const dashboard = await api.getEmployerDashboard();
        const statusCounts = dashboard?.stats?.statusCounts || {};
          setStats({
          activeJobs: dashboard?.stats?.activeJobs || 0,
          totalApplications: dashboard?.stats?.totalApplications || 0,
          shortlistedCandidates: statusCounts.shortlisted || 0,
          pendingReviews: (statusCounts.applied || 0) + (statusCounts.viewed || 0),
        });
      } catch (statsError) {
        console.log('Could not load dashboard:', statsError.message);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh user data to get latest verification status
    try {
      const currentUser = await api.getCurrentUser();
      if (currentUser) {
        setUser(prevUser => ({
          ...prevUser,
          ...currentUser,
          isVerified: currentUser.isVerified || currentUser.isEmployerVerified || false,
          isEmployerVerified: currentUser.isEmployerVerified || false,
          verifiedAt: currentUser.verifiedAt || null
        }));
      }
    } catch (error) {
      console.log('Could not refresh user data on pull:', error.message);
    }
    loadDashboardData();
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

  const menuItems = [
    { title: 'Post New Job', icon: 'add-circle', screen: 'EmployerPostJob', color: colors.primary },
    { title: 'My Jobs', icon: 'briefcase', action: () => navigateToMyJobs(), color: colors.info },
    { title: 'Applications', icon: 'people', action: () => navigateToApplications(), color: colors.warning },
    { title: 'Company Profile', icon: 'business', screen: 'CompanyProfile', color: colors.success },
    { title: 'KYC Documents', icon: 'document-text', screen: 'KYCForm', color: colors.warning },
    { title: 'Create Post', icon: 'create', screen: 'CreateSocialPost', color: colors.primary },
    { title: 'Packages', icon: 'card', screen: 'Packages', color: colors.secondary },
    { title: 'Messages', icon: 'chatbubbles', screen: 'Chat', color: colors.primary },
  ];

  const navigateToMyJobs = () => {
    navigation.navigate('EmployerJobs');
  };

  const navigateToApplications = () => {
    navigation.navigate('EmployerJobs');
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
      {!isMobile && (
        <View style={[
          styles.sidebarWrapper, 
          isTabletDevice && styles.sidebarWrapperTablet,
          isLaptopDevice && styles.sidebarWrapperLaptop,
          isDesktopDevice && styles.sidebarWrapperDesktop
        ]}>
          <EmployerSidebar permanent navigation={navigation} role="company" activeKey="overview" />
        </View>
      )}
      {isMobile && (
        <EmployerSidebar 
          visible={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          navigation={navigation} 
          role="company" 
          activeKey="overview" 
        />
      )}
      {isMobile && (
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSidebarOpen(true)}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          isMobile && styles.scrollContentMobile, 
          isTabletDevice && styles.scrollContentTablet,
          isLaptopDevice && styles.scrollContentLaptop,
          isDesktopDevice && styles.scrollContentDesktop
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Section - Modern style */}
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.headerBar, 
            isMobile && styles.headerBarMobile, 
            isTabletDevice && styles.headerBarTablet,
            isLaptopDevice && styles.headerBarLaptop,
            isDesktopDevice && styles.headerBarDesktop
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.headerTitleContainer, isMobile && styles.headerTitleContainerMobile]}>
              <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>Company Dashboard</Text>
              <View style={styles.headerBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.headerBadgeText}>Active</Text>
              </View>
              <View style={[
                styles.headerBadge, 
                { 
                  backgroundColor: (user?.isVerified || user?.isEmployerVerified) ? '#D1FAE5' : '#FEF3C7',
                  marginLeft: 8
                }
              ]}>
                <Ionicons 
                  name={(user?.isVerified || user?.isEmployerVerified) ? "shield-checkmark" : "shield-outline"} 
                  size={14} 
                  color={(user?.isVerified || user?.isEmployerVerified) ? "#059669" : "#D97706"} 
                />
                <Text style={[
                  styles.headerBadgeText,
                  { color: (user?.isVerified || user?.isEmployerVerified) ? "#059669" : "#D97706" }
                ]}>
                  {(user?.isVerified || user?.isEmployerVerified) ? 'Verified' : 'Unverified'}
                </Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>
              Welcome back, <Text style={styles.headerName}>{user?.firstName || 'User'}</Text> 👋
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.headerLogoutButton, isMobile && styles.headerLogoutButtonMobile]} 
            onPress={() => {
              console.log('Logout button clicked');
              handleLogout();
            }}
            activeOpacity={0.8}
            disabled={false}
          >
            <Ionicons name="log-out-outline" size={isMobile ? 16 : 18} color={'#FFF'} />
            {!isMobile && <Text style={styles.headerLogoutText}>Logout</Text>}
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Cards - Modern Design */}
        <View style={[
          styles.statsContainer, 
          isMobile && styles.statsContainerMobile, 
          isTabletDevice && styles.statsContainerTablet,
          isLaptopDevice && styles.statsContainerLaptop,
          isDesktopDevice && styles.statsContainerDesktop
        ]}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, styles.statCardGradient, isMobile && styles.statCardMobile, isTabletDevice && styles.statCardTablet, isLaptopDevice && styles.statCardLaptop, isDesktopDevice && styles.statCardDesktop]}
          >
            <View style={[styles.statCardContent, isMobile && styles.statCardContentMobile, isTabletDevice && styles.statCardContentTablet, isLaptopDevice && styles.statCardContentLaptop, isDesktopDevice && styles.statCardContentDesktop]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }, isMobile && styles.statIconContainerMobile, isTabletDevice && styles.statIconContainerTablet, isLaptopDevice && styles.statIconContainerLaptop, isDesktopDevice && styles.statIconContainerDesktop]}>
                <Ionicons name="briefcase" size={isMobile ? 24 : isTabletDevice ? 26 : isLaptopDevice ? 27 : 28} color="#FFFFFF" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, isMobile && styles.statValueMobile, isTabletDevice && styles.statValueTablet, isLaptopDevice && styles.statValueLaptop, isDesktopDevice && styles.statValueDesktop]}>{stats.activeJobs}</Text>
                <Text style={[styles.statLabel, isMobile && styles.statLabelMobile, isTabletDevice && styles.statLabelTablet, isLaptopDevice && styles.statLabelLaptop, isDesktopDevice && styles.statLabelDesktop]}>Active Jobs</Text>
              </View>
            </View>
            <View style={styles.statCardDecoration} />
          </LinearGradient>

          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, styles.statCardGradient, isMobile && styles.statCardMobile, isTabletDevice && styles.statCardTablet, isLaptopDevice && styles.statCardLaptop, isDesktopDevice && styles.statCardDesktop]}
          >
            <View style={[styles.statCardContent, isMobile && styles.statCardContentMobile, isTabletDevice && styles.statCardContentTablet, isLaptopDevice && styles.statCardContentLaptop, isDesktopDevice && styles.statCardContentDesktop]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }, isMobile && styles.statIconContainerMobile, isTabletDevice && styles.statIconContainerTablet, isLaptopDevice && styles.statIconContainerLaptop, isDesktopDevice && styles.statIconContainerDesktop]}>
                <Ionicons name="people" size={isMobile ? 24 : isTabletDevice ? 26 : isLaptopDevice ? 27 : 28} color="#FFFFFF" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, isMobile && styles.statValueMobile, isTabletDevice && styles.statValueTablet, isLaptopDevice && styles.statValueLaptop, isDesktopDevice && styles.statValueDesktop]}>{stats.totalApplications}</Text>
                <Text style={[styles.statLabel, isMobile && styles.statLabelMobile, isTabletDevice && styles.statLabelTablet, isLaptopDevice && styles.statLabelLaptop, isDesktopDevice && styles.statLabelDesktop]}>Applications</Text>
              </View>
            </View>
            <View style={styles.statCardDecoration} />
          </LinearGradient>
        </View>

        <View style={[styles.statsContainer, isMobile && styles.statsContainerMobile, isTabletDevice && styles.statsContainerTablet, isLaptopDevice && styles.statsContainerLaptop, isDesktopDevice && styles.statsContainerDesktop]}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, styles.statCardGradient, isMobile && styles.statCardMobile, isTabletDevice && styles.statCardTablet, isLaptopDevice && styles.statCardLaptop, isDesktopDevice && styles.statCardDesktop]}
          >
            <View style={[styles.statCardContent, isMobile && styles.statCardContentMobile, isTabletDevice && styles.statCardContentTablet, isLaptopDevice && styles.statCardContentLaptop, isDesktopDevice && styles.statCardContentDesktop]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }, isMobile && styles.statIconContainerMobile, isTabletDevice && styles.statIconContainerTablet, isLaptopDevice && styles.statIconContainerLaptop, isDesktopDevice && styles.statIconContainerDesktop]}>
                <Ionicons name="checkmark-circle" size={isMobile ? 24 : isTabletDevice ? 26 : isLaptopDevice ? 27 : 28} color="#FFFFFF" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, isMobile && styles.statValueMobile, isTabletDevice && styles.statValueTablet, isLaptopDevice && styles.statValueLaptop, isDesktopDevice && styles.statValueDesktop]}>{stats.shortlistedCandidates}</Text>
                <Text style={[styles.statLabel, isMobile && styles.statLabelMobile, isTabletDevice && styles.statLabelTablet, isLaptopDevice && styles.statLabelLaptop, isDesktopDevice && styles.statLabelDesktop]}>Shortlisted</Text>
              </View>
            </View>
            <View style={styles.statCardDecoration} />
          </LinearGradient>

          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, styles.statCardGradient, isMobile && styles.statCardMobile, isTabletDevice && styles.statCardTablet, isLaptopDevice && styles.statCardLaptop, isDesktopDevice && styles.statCardDesktop]}
          >
            <View style={[styles.statCardContent, isMobile && styles.statCardContentMobile, isTabletDevice && styles.statCardContentTablet, isLaptopDevice && styles.statCardContentLaptop, isDesktopDevice && styles.statCardContentDesktop]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }, isMobile && styles.statIconContainerMobile, isTabletDevice && styles.statIconContainerTablet, isLaptopDevice && styles.statIconContainerLaptop, isDesktopDevice && styles.statIconContainerDesktop]}>
                <Ionicons name="time" size={isMobile ? 24 : isTabletDevice ? 26 : isLaptopDevice ? 27 : 28} color="#FFFFFF" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, isMobile && styles.statValueMobile, isTabletDevice && styles.statValueTablet, isLaptopDevice && styles.statValueLaptop, isDesktopDevice && styles.statValueDesktop]}>{stats.pendingReviews}</Text>
                <Text style={[styles.statLabel, isMobile && styles.statLabelMobile, isTabletDevice && styles.statLabelTablet, isLaptopDevice && styles.statLabelLaptop, isDesktopDevice && styles.statLabelDesktop]}>Pending Review</Text>
              </View>
            </View>
            <View style={styles.statCardDecoration} />
          </LinearGradient>
        </View>

        {/* Verification Status Card */}
        <View style={[
          styles.verificationCard, 
          isMobile && styles.verificationCardMobile, 
          isTabletDevice && styles.verificationCardTablet,
          isLaptopDevice && styles.verificationCardLaptop,
          isDesktopDevice && styles.verificationCardDesktop
        ]}>
          <LinearGradient
            colors={(user?.isVerified || user?.isEmployerVerified) ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.verificationCardGradient}
          >
            <View style={[
              styles.verificationCardContent,
              isMobile && styles.verificationCardContentMobile,
              isTabletDevice && styles.verificationCardContentTablet
            ]}>
              <View style={[
                styles.verificationIconContainer,
                isMobile && styles.verificationIconContainerMobile,
                isTabletDevice && styles.verificationIconContainerTablet
              ]}>
                <Ionicons 
                  name={(user?.isVerified || user?.isEmployerVerified) ? "shield-checkmark" : "shield-outline"} 
                  size={isMobile ? 32 : isTabletDevice ? 36 : isLaptopDevice ? 38 : 40} 
                  color="#FFFFFF" 
                />
              </View>
              <View style={styles.verificationTextContainer}>
                <Text style={[styles.verificationTitle, isMobile && styles.verificationTitleMobile]}>
                  {(user?.isVerified || user?.isEmployerVerified) ? 'Account Verified' : 'Account Not Verified'}
                </Text>
                <Text style={[styles.verificationSubtitle, isMobile && styles.verificationSubtitleMobile]}>
                  {(user?.isVerified || user?.isEmployerVerified) 
                    ? 'Your company account has been verified by our admin team. You have full access to all features.' 
                    : 'Your account is pending verification. Please wait for admin approval to access all features.'}
                </Text>
                {user?.verifiedAt && (
                  <Text style={[styles.verificationDate, isMobile && styles.verificationDateMobile]}>
                    Verified on: {new Date(user.verifiedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    flexDirection: 'row',
    backgroundColor: '#F1F5F9' 
  },
  sidebarWrapper: {
    width: 280,
  },
  sidebarWrapperTablet: {
    width: 240,
  },
  sidebarWrapperLaptop: {
    width: 260,
  },
  sidebarWrapperDesktop: {
    width: 280,
  },
  menuButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
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
  scrollContent: { 
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  scrollContentMobile: {
    padding: spacing.md,
    paddingTop: spacing.xl + 40,
  },
  scrollContentTablet: {
    padding: spacing.md,
  },
  scrollContentLaptop: {
    padding: spacing.lg,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContentDesktop: {
    padding: spacing.xl,
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  headerBar: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.md,
  },
  headerBarMobile: {
    padding: spacing.md,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerBarTablet: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerBarLaptop: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  headerBarDesktop: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  headerLeft: {
    gap: spacing.xs,
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  headerTitleContainerMobile: {
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerTitleMobile: {
    fontSize: 22,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    marginTop: spacing.xs,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  headerSubtitleMobile: {
    fontSize: 13,
  },
  headerName: {
    color: '#1E293B',
    fontWeight: '700',
  },
  headerLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  headerLogoutButtonMobile: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-end',
  },
  headerLogoutText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsContainerMobile: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  statsContainerTablet: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statsContainerLaptop: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsContainerDesktop: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  statCardMobile: {
    flex: 0,
    width: '100%',
  },
  statCardTablet: {
    flex: 1,
    minWidth: 0,
  },
  statCardLaptop: {
    flex: 1,
    minWidth: 0,
  },
  statCardDesktop: {
    flex: 1,
    minWidth: 0,
  },
  statCardGradient: {
    position: 'relative',
  },
  statCardContent: {
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  statCardContentMobile: {
    padding: spacing.md,
    gap: spacing.md,
  },
  statCardContentTablet: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  statCardContentLaptop: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  statCardContentDesktop: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  statIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconContainerMobile: {
    width: 48,
    height: 48,
  },
  statIconContainerTablet: {
    width: 52,
    height: 52,
  },
  statIconContainerLaptop: {
    width: 56,
    height: 56,
  },
  statIconContainerDesktop: {
    width: 64,
    height: 64,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  statValueMobile: {
    fontSize: 24,
  },
  statValueTablet: {
    fontSize: 26,
  },
  statValueLaptop: {
    fontSize: 28,
  },
  statValueDesktop: {
    fontSize: 32,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statLabelMobile: {
    fontSize: 12,
  },
  statLabelTablet: {
    fontSize: 11,
  },
  statLabelLaptop: {
    fontSize: 12,
  },
  statLabelDesktop: {
    fontSize: 14,
  },
  statCardDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  verificationCard: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  verificationCardMobile: {
    marginTop: spacing.md,
  },
  verificationCardTablet: {
    marginTop: spacing.md,
  },
  verificationCardLaptop: {
    marginTop: spacing.lg,
  },
  verificationCardDesktop: {
    marginTop: spacing.lg,
  },
  verificationCardGradient: {
    position: 'relative',
  },
  verificationCardContent: {
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  verificationCardContentMobile: {
    padding: spacing.md,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  verificationCardContentTablet: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  verificationIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationIconContainerMobile: {
    width: 60,
    height: 60,
  },
  verificationIconContainerTablet: {
    width: 70,
    height: 70,
  },
  verificationTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  verificationTitleMobile: {
    fontSize: 18,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  verificationSubtitleMobile: {
    fontSize: 12,
    lineHeight: 18,
  },
  verificationDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  verificationDateMobile: {
    fontSize: 11,
  },
});

export default CompanyDashboardScreen;

