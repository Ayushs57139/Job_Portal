import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';

const ConsultancyDashboardScreen = ({ navigation }) => {
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
      <View style={styles.sidebarWrapper}>
        <EmployerSidebar permanent navigation={navigation} role="consultancy" activeKey="overview" />
      </View>
      <ScrollView 
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
        {/* Header Section - Admin style */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Consultancy Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Welcome, {user?.firstName || 'User'}
          </Text>
          </View>
          <TouchableOpacity 
            style={styles.headerLogoutButton} 
            onPress={() => {
              console.log('Logout button clicked');
              handleLogout();
            }}
            activeOpacity={0.7}
            disabled={false}
          >
            <Ionicons name="log-out-outline" size={18} color={'#FFF'} />
            <Text style={styles.headerLogoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(74,144,226,0.15)' }]}>
              <Ionicons name="briefcase" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.statValue}>{stats.activeJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(46,204,113,0.15)' }]}>
              <Ionicons name="people" size={24} color="#2ECC71" />
            </View>
            <Text style={styles.statValue}>{stats.totalApplications}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(52,152,219,0.15)' }]}>
              <Ionicons name="business" size={24} color="#3498DB" />
            </View>
            <Text style={styles.statValue}>{stats.clientsServed}</Text>
            <Text style={styles.statLabel}>Clients Served</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(241,196,15,0.15)' }]}>
              <Ionicons name="time" size={24} color="#F1C40F" />
            </View>
            <Text style={styles.statValue}>{stats.pendingReviews}</Text>
            <Text style={styles.statLabel}>Pending Review</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    flexDirection: 'row',
    backgroundColor: '#F5F6FA' 
  },
  sidebarWrapper: {
    width: 260,
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
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerBar: {
    backgroundColor: '#FFF',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    marginTop: 4,
    color: '#666',
  },
  headerLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: 6,
    cursor: 'pointer',
    zIndex: 10,
  },
  headerLogoutText: {
    color: '#FFF',
    fontWeight: '700'
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ConsultancyDashboardScreen;

