import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import StatCard from '../../components/Admin/StatCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

// Define getStyles before the component
const getStyles = (isMobile, isTablet) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  welcomeSection: {
    marginBottom: isMobile ? 20 : 24,
    paddingBottom: isMobile ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  welcomeTitle: {
    fontSize: isMobile ? 28 : isTablet ? 32 : 36,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: isMobile ? 14 : 16,
    color: '#718096',
    marginTop: 4,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    marginHorizontal: isMobile ? -4 : -8,
    marginBottom: isMobile ? 12 : 0,
    ...(Platform.OS === 'web' && {
      display: 'flex',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
    }),
  },
  recentUsersSection: {
    marginTop: isMobile ? 24 : 28,
  },
  sectionTitle: {
    fontSize: isMobile ? 20 : isTablet ? 22 : 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: isMobile ? 16 : 20,
    letterSpacing: -0.3,
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: isMobile ? 16 : isTablet ? 20 : 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    ...(Platform.OS === 'web' ? {
      overflowX: 'auto',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    } : {
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    }),
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
    paddingBottom: isMobile ? 14 : 16,
    marginBottom: isMobile ? 14 : 16,
    ...(Platform.OS === 'web' && {
      minWidth: isTablet ? 600 : 800,
    }),
  },
  tableHeaderText: {
    fontSize: isMobile ? 13 : isTablet ? 14 : 15,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: isMobile ? 14 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      minWidth: isTablet ? 600 : 800,
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
      },
    }),
  },
  tableCellText: {
    fontSize: isMobile ? 13 : isTablet ? 14 : 15,
    color: '#2D3748',
    fontWeight: '500',
    ...(Platform.OS === 'web' && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  },
  nameColumn: {
    flex: isTablet ? 1.8 : 2,
    ...(Platform.OS === 'web' && {
      minWidth: isTablet ? 120 : 150,
    }),
  },
  emailColumn: {
    flex: isTablet ? 2.5 : 3,
    ...(Platform.OS === 'web' && {
      minWidth: isTablet ? 150 : 200,
    }),
  },
  typeColumn: {
    flex: isTablet ? 1.3 : 1.5,
    ...(Platform.OS === 'web' && {
      minWidth: isTablet ? 80 : 100,
    }),
  },
  statusColumn: {
    flex: isTablet ? 1.3 : 1.5,
    ...(Platform.OS === 'web' && {
      minWidth: isTablet ? 80 : 100,
    }),
  },
  joinedColumn: {
    flex: isTablet ? 1.3 : 1.5,
    ...(Platform.OS === 'web' && {
      minWidth: isTablet ? 100 : 120,
    }),
  },
  // Mobile Card Styles
  mobileCardContainer: {
    gap: 12,
  },
  mobileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: isMobile ? 16 : 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
      },
    } : {
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    }),
  },
  mobileCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mobileCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C0392B',
    flex: 1,
  },
  mobileStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mobileStatusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E74C3C',
  },
  mobileCardEmail: {
    fontSize: 13,
    color: '#555',
    marginBottom: 10,
  },
  mobileCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mobileTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3498DB',
  },
  mobileCardDate: {
    fontSize: 12,
    color: '#666',
  },
  nameText: {
    fontWeight: '500',
    color: '#C0392B',
  },
  emailText: {
    color: '#555',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  jobseekerBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  employerBadge: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3498DB',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22C55E',
    letterSpacing: 0.5,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
});

const AdminDashboardScreen = ({ navigation, route }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    applications: 0,
    activeJobs: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const dynamicStyles = getStyles(isMobile, isTablet);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get auth token
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch stats
      const [usersRes, jobsRes, applicationsRes] = await Promise.all([
        fetch(`${API_URL}/admin/users/count`, { headers }),
        fetch(`${API_URL}/admin/jobs/count`, { headers }),
        fetch(`${API_URL}/admin/applications/count`, { headers }),
      ]);

      const usersData = await usersRes.json();
      const jobsData = await jobsRes.json();
      const applicationsData = await applicationsRes.json();

      setStats({
        totalUsers: usersData.count || 0,
        totalJobs: jobsData.total || 0,
        applications: applicationsData.count || 0,
        activeJobs: jobsData.active || 0,
      });

      // Fetch recent users
      const recentUsersRes = await fetch(`${API_URL}/admin/users/recent`, { headers });
      const recentUsersData = await recentUsersRes.json();
      setRecentUsers(recentUsersData.users || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please check your connection.');
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalJobs: 0,
        applications: 0,
        activeJobs: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear admin token and navigate to login
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <AdminLayout
        title="Dashboard"
        activeScreen="AdminDashboard"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={dynamicStyles.loadingText}>Loading dashboard...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Dashboard"
      activeScreen="AdminDashboard"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.welcomeSection}>
          <Text style={dynamicStyles.welcomeTitle}>Dashboard</Text>
          <Text style={dynamicStyles.welcomeSubtitle}>Welcome to JobWala Admin Panel</Text>
        </View>

        <View style={dynamicStyles.statsContainer}>
          <StatCard
            icon="people"
            iconColor="#3498DB"
            iconBg="rgba(52, 152, 219, 0.1)"
            count={stats.totalUsers}
            label="Total Users"
          />
          <StatCard
            icon="briefcase"
            iconColor="#27AE60"
            iconBg="rgba(39, 174, 96, 0.1)"
            count={stats.totalJobs}
            label="Total Jobs"
          />
          {!isMobile && (
            <>
              <StatCard
                icon="document-text"
                iconColor="#F39C12"
                iconBg="rgba(243, 156, 18, 0.1)"
                count={stats.applications}
                label="Applications"
              />
              <StatCard
                icon="checkmark-circle"
                iconColor="#E74C3C"
                iconBg="rgba(231, 76, 60, 0.1)"
                count={stats.activeJobs}
                label="Active Jobs"
              />
            </>
          )}
        </View>

        {isMobile && (
          <View style={dynamicStyles.statsContainer}>
            <StatCard
              icon="document-text"
              iconColor="#F39C12"
              iconBg="rgba(243, 156, 18, 0.1)"
              count={stats.applications}
              label="Applications"
            />
            <StatCard
              icon="checkmark-circle"
              iconColor="#E74C3C"
              iconBg="rgba(231, 76, 60, 0.1)"
              count={stats.activeJobs}
              label="Active Jobs"
            />
          </View>
        )}

        <View style={dynamicStyles.recentUsersSection}>
          <Text style={dynamicStyles.sectionTitle}>Recent Users</Text>
          {isMobile ? (
            // Mobile: Card-based layout
            <View style={dynamicStyles.mobileCardContainer}>
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <View key={user._id || index} style={dynamicStyles.mobileCard}>
                    <View style={dynamicStyles.mobileCardHeader}>
                      <Text style={dynamicStyles.mobileCardName}>{user.name || 'N/A'}</Text>
                      <View style={[
                        dynamicStyles.mobileStatusBadge,
                        user.isActive ? dynamicStyles.activeBadge : dynamicStyles.inactiveBadge,
                      ]}>
                        <Text style={dynamicStyles.mobileStatusBadgeText}>
                          {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
                      </View>
                    </View>
                    <Text style={dynamicStyles.mobileCardEmail}>{user.email || 'N/A'}</Text>
                    <View style={dynamicStyles.mobileCardFooter}>
                      <View style={[
                        dynamicStyles.mobileTypeBadge,
                        user.role === 'JOBSEEKER' && dynamicStyles.jobseekerBadge,
                        user.role === 'EMPLOYER' && dynamicStyles.employerBadge,
                      ]}>
                        <Text style={dynamicStyles.mobileTypeBadgeText}>
                          {user.role || 'N/A'}
                        </Text>
                      </View>
                      <Text style={dynamicStyles.mobileCardDate}>
                        {formatDate(user.createdAt)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={dynamicStyles.emptyState}>
                  <Text style={dynamicStyles.emptyStateText}>No recent users found</Text>
                </View>
              )}
            </View>
          ) : (
            // Desktop/Tablet: Table layout
            <View style={dynamicStyles.tableContainer}>
              <View style={dynamicStyles.tableHeader}>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.nameColumn]}>Name</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.emailColumn]}>Email</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.typeColumn]}>Type</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.statusColumn]}>Status</Text>
                <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.joinedColumn]}>Joined</Text>
              </View>
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <View key={user._id || index} style={dynamicStyles.tableRow}>
                    <Text style={[dynamicStyles.tableCellText, dynamicStyles.nameColumn, dynamicStyles.nameText]} numberOfLines={1}>
                      {user.name || 'N/A'}
                    </Text>
                    <Text style={[dynamicStyles.tableCellText, dynamicStyles.emailColumn, dynamicStyles.emailText]} numberOfLines={1}>
                      {user.email || 'N/A'}
                    </Text>
                    <View style={[dynamicStyles.typeColumn]}>
                      <View style={[
                        dynamicStyles.typeBadge,
                        user.role === 'JOBSEEKER' && dynamicStyles.jobseekerBadge,
                        user.role === 'EMPLOYER' && dynamicStyles.employerBadge,
                      ]}>
                        <Text style={dynamicStyles.typeBadgeText}>
                          {user.role || 'N/A'}
                        </Text>
                      </View>
                    </View>
                    <View style={[dynamicStyles.statusColumn]}>
                      <View style={[
                        dynamicStyles.statusBadge,
                        user.isActive ? dynamicStyles.activeBadge : dynamicStyles.inactiveBadge,
                      ]}>
                        <Text style={[
                          user.isActive ? dynamicStyles.statusBadgeText : dynamicStyles.inactiveBadgeText
                        ]}>
                          {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[dynamicStyles.tableCellText, dynamicStyles.joinedColumn]}>
                      {formatDate(user.createdAt)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={dynamicStyles.emptyState}>
                  <Text style={dynamicStyles.emptyStateText}>No recent users found</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

export default AdminDashboardScreen;

