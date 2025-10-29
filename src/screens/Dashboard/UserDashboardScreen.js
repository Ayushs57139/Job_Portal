import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

const UserDashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    applications: 0,
    savedJobs: 0,
    profileViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await api.getCurrentUserFromStorage();
      setUser(userData);
      
      // Load user stats (applications, saved jobs, etc.)
      try {
        const applications = await api.getMyApplications();
        const savedJobs = await api.getSavedJobs();
        
        setStats({
          applications: applications.applications?.length || 0,
          savedJobs: savedJobs.savedJobs?.length || 0,
          profileViews: 0, // This would come from backend if implemented
        });
      } catch (statsError) {
        console.log('Could not load stats:', statsError.message);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserData();
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
    { title: 'Browse Jobs', icon: 'briefcase', screen: 'Jobs', color: colors.primary },
    { title: 'My Applications', icon: 'document-text', action: () => navigation.navigate('Jobs', { showMyApplications: true }), color: colors.info },
    { title: 'Saved Jobs', icon: 'bookmark', screen: 'SavedJobs', color: colors.warning },
    { title: 'My Profile', icon: 'person', screen: 'UserProfile', color: colors.success },
    { title: 'Resume Builder', icon: 'document', screen: 'ResumeBuilder', color: colors.secondary },
    { title: 'Job Alerts', icon: 'notifications', action: () => Alert.alert('Coming Soon', 'Job alerts feature is under development'), color: colors.primary },
    { title: 'Messages', icon: 'chatbubbles', screen: 'Chat', color: colors.info },
    { title: 'Companies', icon: 'business', screen: 'Companies', color: colors.warning },
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
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.firstName || 'User'}!</Text>
          <Text style={styles.userSubtitle}>Ready to find your dream job?</Text>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.applications}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.warning}15` }]}>
              <Ionicons name="bookmark" size={24} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats.savedJobs}</Text>
            <Text style={styles.statLabel}>Saved Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${colors.info}15` }]}>
              <Ionicons name="eye" size={24} color={colors.info} />
            </View>
            <Text style={styles.statValue}>{stats.profileViews}</Text>
            <Text style={styles.statLabel}>Profile Views</Text>
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  welcomeCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  welcomeText: {
    ...typography.body1,
    color: colors.textWhite,
    opacity: 0.9,
  },
  userName: {
    ...typography.h2,
    color: colors.textWhite,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  userSubtitle: {
    ...typography.body2,
    color: colors.textWhite,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
    ...shadows.md,
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  menuTitle: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
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

export default UserDashboardScreen;

