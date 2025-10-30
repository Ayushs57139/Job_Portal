import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

const AdminDashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeCompanies: 0,
    activeConsultancies: 0,
    pendingJobs: 0,
    todayApplications: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Check if user is logged in and is admin
      const userData = await api.getCurrentUserFromStorage();
      
      if (!userData) {
        // Not logged in, redirect to admin login
        Alert.alert(
          'Authentication Required',
          'Please login to access the admin dashboard.',
          [{ text: 'OK', onPress: () => navigation.replace('AdminLogin') }]
        );
        return;
      }

      // Check if user is admin or superadmin
      if (userData.userType !== 'admin' && userData.userType !== 'superadmin') {
        // Not an admin, show error and redirect
        Alert.alert(
          'Access Denied',
          'You do not have permission to access the admin dashboard.',
          [{ text: 'OK', onPress: () => navigation.replace('Home') }]
        );
        return;
      }

      // User is authorized, load dashboard data
      setUser(userData);
      await loadDashboardData();
    } catch (error) {
      console.error('Error checking authentication:', error);
      Alert.alert(
        'Error',
        'Failed to verify authentication. Please login again.',
        [{ text: 'OK', onPress: () => navigation.replace('AdminLogin') }]
      );
    }
  };

  const loadDashboardData = async () => {
    try {

      // Fetch admin dashboard stats
      try {
        const dashboardData = await api.getAdminDashboardData();
        if (dashboardData && dashboardData.stats) {
          setStats({
            totalUsers: dashboardData.stats.totalUsers || 0,
            totalJobs: dashboardData.stats.totalJobs || 0,
            totalApplications: dashboardData.stats.totalApplications || 0,
            activeCompanies: dashboardData.stats.activeCompanies || 0,
            activeConsultancies: dashboardData.stats.activeConsultancies || 0,
            pendingJobs: dashboardData.stats.pendingJobs || 0,
            todayApplications: dashboardData.stats.todayApplications || 0,
            monthlyRevenue: dashboardData.stats.monthlyRevenue || 0,
          });
        }
      } catch (statsError) {
        console.log('Could not load stats:', statsError.message);
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

  const menuItems = [
    { title: 'Manage Users', icon: 'people', action: () => navigation.navigate('Jobs', { adminView: 'users' }), color: colors.primary },
    { title: 'Manage Jobs', icon: 'briefcase', action: () => navigation.navigate('Jobs', { adminView: 'jobs' }), color: colors.info },
    { title: 'All Applications', icon: 'document-text', action: () => navigation.navigate('Jobs', { adminView: 'applications' }), color: colors.warning },
    { title: 'Companies', icon: 'business', screen: 'Companies', color: colors.success },
    { title: 'Consultancies', icon: 'people-circle', action: () => navigation.navigate('Companies', { type: 'consultancy' }), color: colors.secondary },
    { title: 'Live Chat Support', icon: 'chatbubbles', screen: 'AdminLiveChatSupport', color: colors.info },
    { title: 'Create Post', icon: 'create', screen: 'CreateSocialPost', color: colors.primary },
    { title: 'Analytics', icon: 'stats-chart', action: () => Alert.alert('Coming Soon', 'Analytics dashboard is under development'), color: colors.primary },
    { title: 'Packages', icon: 'card', screen: 'Packages', color: colors.info },
    { title: 'Settings', icon: 'settings', action: () => Alert.alert('Coming Soon', 'Settings page is under development'), color: colors.warning },
  ];

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
        {/* Welcome Section */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.welcomeCard}
        >
          <Ionicons name="shield-checkmark" size={48} color={colors.textWhite} style={styles.adminIcon} />
          <Text style={styles.welcomeText}>Welcome back, Admin</Text>
          <Text style={styles.adminName}>
            {user?.firstName + ' ' + user?.lastName || 'Administrator'}
          </Text>
          <Text style={styles.userType}>System Dashboard</Text>
        </LinearGradient>

        {/* Main Stats Cards */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="people" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('AdminJobs')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.info}15` }]}>
              <Ionicons name="briefcase" size={24} color={colors.info} />
            </View>
            <Text style={styles.statValue}>{stats.totalJobs}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('AdminApplications')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.warning}15` }]}>
              <Ionicons name="document-text" size={24} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats.totalApplications}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('AdminCompanies', { type: 'company' })}
          >
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.success}15` }]}>
              <Ionicons name="business" size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.activeCompanies}</Text>
            <Text style={styles.statLabel}>Companies</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('AdminCompanies', { type: 'consultancy' })}
          >
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.secondary}15` }]}>
              <Ionicons name="people-circle" size={24} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{stats.activeConsultancies}</Text>
            <Text style={styles.statLabel}>Consultancies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('AdminJobs', { showPending: true })}
          >
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.warning}15` }]}>
              <Ionicons name="time" size={24} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats.pendingJobs}</Text>
            <Text style={styles.statLabel}>Pending Jobs</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Admin Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => item.action ? item.action() : navigation.navigate(item.screen)}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
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
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  welcomeCard: { 
    borderRadius: borderRadius.lg, 
    padding: spacing.xl, 
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  adminIcon: {
    marginBottom: spacing.md,
  },
  welcomeText: { 
    ...typography.body1, 
    color: colors.textWhite, 
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  adminName: {
    ...typography.h2,
    color: colors.textWhite,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  userType: {
    ...typography.body2,
    color: colors.textWhite,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
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
  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  menuGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  menuItem: { 
    width: '47%', 
    backgroundColor: colors.cardBackground, 
    borderRadius: borderRadius.lg, 
    padding: spacing.lg, 
    alignItems: 'center', 
    ...shadows.md 
  },
  menuIcon: { 
    width: 60, 
    height: 60, 
    borderRadius: borderRadius.md, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: spacing.sm 
  },
  menuTitle: { 
    ...typography.body2, 
    color: colors.text, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    gap: spacing.xs,
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;

