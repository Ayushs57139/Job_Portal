import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const ConsultancyDashboardScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const { isMobile, isTablet } = responsive;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    clientsServed: 0,
    pendingReviews: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current user
      const userData = await api.getCurrentUserFromStorage();
      setUser(userData);

      // Fetch employer dashboard (dynamic)
      try {
        const dashboard = await api.getEmployerDashboard();
        const statusCounts = dashboard?.stats?.statusCounts || {};
          setStats({
          activeJobs: dashboard?.stats?.activeJobs || 0,
          totalApplications: dashboard?.stats?.totalApplications || 0,
          clientsServed: 0,
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

  const handleRefresh = () => {
    setRefreshing(true);
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
    { title: 'Post New Job', icon: 'add-circle', screen: 'PostJob', color: colors.primary },
    { title: 'My Jobs', icon: 'briefcase', action: () => navigateToMyJobs(), color: colors.info },
    { title: 'Applications', icon: 'people', action: () => navigateToApplications(), color: colors.warning },
    { title: 'Consultancy Profile', icon: 'business', screen: 'CompanyProfile', color: colors.success },
    { title: 'KYC Documents', icon: 'document-text', screen: 'KYCForm', color: colors.warning },
    { title: 'Create Post', icon: 'create', screen: 'CreateSocialPost', color: colors.primary },
    { title: 'Candidates', icon: 'person-add', screen: 'Jobs', color: colors.secondary },
    { title: 'Packages', icon: 'card', screen: 'Packages', color: colors.primary },
    { title: 'Messages', icon: 'chatbubbles', screen: 'Chat', color: colors.info },
    { title: 'Analytics', icon: 'stats-chart', screen: 'Jobs', color: colors.warning },
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
        <View style={styles.sidebarWrapper}>
          <EmployerSidebar permanent navigation={navigation} role="consultancy" activeKey="overview" />
        </View>
      )}
      {isMobile && (
        <EmployerSidebar 
          visible={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          navigation={navigation} 
          role="consultancy" 
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
        contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}
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
          style={[styles.headerBar, isMobile && styles.headerBarMobile]}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.headerTitleContainer, isMobile && styles.headerTitleContainerMobile]}>
              <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>Consultancy Dashboard</Text>
              <View style={styles.headerBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.headerBadgeText}>Active</Text>
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
        <View style={[styles.statsContainer, isMobile && styles.statsContainerMobile]}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, styles.statCardGradient, isMobile && styles.statCardMobile]}
          >
            <View style={[styles.statCardContent, isMobile && styles.statCardContentMobile]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }, isMobile && styles.statIconContainerMobile]}>
                <Ionicons name="briefcase" size={isMobile ? 24 : 28} color="#FFFFFF" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, isMobile && styles.statValueMobile]}>{stats.activeJobs}</Text>
                <Text style={[styles.statLabel, isMobile && styles.statLabelMobile]}>Active Jobs</Text>
              </View>
            </View>
            <View style={styles.statCardDecoration} />
          </LinearGradient>

          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, styles.statCardGradient, isMobile && styles.statCardMobile]}
          >
            <View style={[styles.statCardContent, isMobile && styles.statCardContentMobile]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }, isMobile && styles.statIconContainerMobile]}>
                <Ionicons name="people" size={isMobile ? 24 : 28} color="#FFFFFF" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, isMobile && styles.statValueMobile]}>{stats.totalApplications}</Text>
                <Text style={[styles.statLabel, isMobile && styles.statLabelMobile]}>Applications</Text>
              </View>
            </View>
            <View style={styles.statCardDecoration} />
          </LinearGradient>
        </View>

        <View style={[styles.statsContainer, isMobile && styles.statsContainerMobile]}>
          <LinearGradient
            colors={['#EC4899', '#DB2777']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, styles.statCardGradient, isMobile && styles.statCardMobile]}
          >
            <View style={[styles.statCardContent, isMobile && styles.statCardContentMobile]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }, isMobile && styles.statIconContainerMobile]}>
                <Ionicons name="business" size={isMobile ? 24 : 28} color="#FFFFFF" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, isMobile && styles.statValueMobile]}>{stats.clientsServed}</Text>
                <Text style={[styles.statLabel, isMobile && styles.statLabelMobile]}>Clients Served</Text>
              </View>
            </View>
            <View style={styles.statCardDecoration} />
          </LinearGradient>

          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, styles.statCardGradient, isMobile && styles.statCardMobile]}
          >
            <View style={[styles.statCardContent, isMobile && styles.statCardContentMobile]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }, isMobile && styles.statIconContainerMobile]}>
                <Ionicons name="time" size={isMobile ? 24 : 28} color="#FFFFFF" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, isMobile && styles.statValueMobile]}>{stats.pendingReviews}</Text>
                <Text style={[styles.statLabel, isMobile && styles.statLabelMobile]}>Pending Review</Text>
              </View>
            </View>
            <View style={styles.statCardDecoration} />
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
  statCardDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default ConsultancyDashboardScreen;

