import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current user
      const userData = await api.getCurrentUserFromStorage();
      setUser(userData);

      // Fetch employer stats
      try {
        const employerData = await api.getEmployerStats();
        if (employerData && employerData.stats) {
          setStats({
            activeJobs: employerData.stats.activeJobs || 0,
            totalApplications: employerData.stats.totalApplications || 0,
            clientsServed: employerData.stats.clientsServed || 0,
            pendingReviews: employerData.stats.pendingApplications || 0,
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
    { title: 'Post New Job', icon: 'add-circle', screen: 'PostJob', color: colors.primary },
    { title: 'My Jobs', icon: 'briefcase', action: () => navigateToMyJobs(), color: colors.info },
    { title: 'Applications', icon: 'people', action: () => navigateToApplications(), color: colors.warning },
    { title: 'Consultancy Profile', icon: 'business', screen: 'CompanyProfile', color: colors.success },
    { title: 'Create Post', icon: 'create', screen: 'CreateSocialPost', color: colors.primary },
    { title: 'Candidates', icon: 'person-add', screen: 'Jobs', color: colors.secondary },
    { title: 'Packages', icon: 'card', screen: 'Packages', color: colors.primary },
    { title: 'Messages', icon: 'chatbubbles', screen: 'Chat', color: colors.info },
    { title: 'Analytics', icon: 'stats-chart', screen: 'Jobs', color: colors.warning },
  ];

  const navigateToMyJobs = () => {
    navigation.navigate('Jobs', { employerView: true });
  };

  const navigateToApplications = () => {
    navigation.navigate('Jobs', { showApplications: true });
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
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.consultancyName}>
            {user?.profile?.company?.name || user?.firstName + ' ' + user?.lastName || 'Consultancy'}
          </Text>
          <Text style={styles.userType}>Consultancy Dashboard</Text>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="briefcase" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.activeJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.info}15` }]}>
              <Ionicons name="people" size={24} color={colors.info} />
            </View>
            <Text style={styles.statValue}>{stats.totalApplications}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.success}15` }]}>
              <Ionicons name="business" size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.clientsServed}</Text>
            <Text style={styles.statLabel}>Clients Served</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.warning}15` }]}>
              <Ionicons name="time" size={24} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats.pendingReviews}</Text>
            <Text style={styles.statLabel}>Pending Review</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
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
    marginBottom: spacing.lg 
  },
  welcomeText: { 
    ...typography.body1, 
    color: colors.textWhite, 
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  consultancyName: {
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

export default ConsultancyDashboardScreen;

