import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import StatCard from '../../components/Admin/StatCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminDashboardScreen = ({ navigation, route }) => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
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
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const width = dimensions?.width || Dimensions.get('window').width;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const styles = getStyles(isMobile, isTablet);

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>Welcome to JobWala Admin Panel</Text>
        </View>

        <View style={styles.statsContainer}>
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
          <View style={styles.statsContainer}>
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

        <View style={styles.recentUsersSection}>
          <Text style={styles.sectionTitle}>Recent Users</Text>
          {isMobile ? (
            // Mobile: Card-based layout
            <View style={styles.mobileCardContainer}>
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <View key={user._id || index} style={styles.mobileCard}>
                    <View style={styles.mobileCardHeader}>
                      <Text style={styles.mobileCardName}>{user.name || 'N/A'}</Text>
                      <View style={[
                        styles.mobileStatusBadge,
                        user.isActive ? styles.activeBadge : styles.inactiveBadge,
                      ]}>
                        <Text style={styles.mobileStatusBadgeText}>
                          {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.mobileCardEmail}>{user.email || 'N/A'}</Text>
                    <View style={styles.mobileCardFooter}>
                      <View style={[
                        styles.mobileTypeBadge,
                        user.role === 'JOBSEEKER' && styles.jobseekerBadge,
                        user.role === 'EMPLOYER' && styles.employerBadge,
                      ]}>
                        <Text style={styles.mobileTypeBadgeText}>
                          {user.role || 'N/A'}
                        </Text>
                      </View>
                      <Text style={styles.mobileCardDate}>
                        {formatDate(user.createdAt)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No recent users found</Text>
                </View>
              )}
            </View>
          ) : (
            // Desktop/Tablet: Table layout
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.nameColumn]}>Name</Text>
                <Text style={[styles.tableHeaderText, styles.emailColumn]}>Email</Text>
                <Text style={[styles.tableHeaderText, styles.typeColumn]}>Type</Text>
                <Text style={[styles.tableHeaderText, styles.statusColumn]}>Status</Text>
                <Text style={[styles.tableHeaderText, styles.joinedColumn]}>Joined</Text>
              </View>
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <View key={user._id || index} style={styles.tableRow}>
                    <Text style={[styles.tableCellText, styles.nameColumn, styles.nameText]} numberOfLines={1}>
                      {user.name || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCellText, styles.emailColumn, styles.emailText]} numberOfLines={1}>
                      {user.email || 'N/A'}
                    </Text>
                    <View style={[styles.typeColumn]}>
                      <View style={[
                        styles.typeBadge,
                        user.role === 'JOBSEEKER' && styles.jobseekerBadge,
                        user.role === 'EMPLOYER' && styles.employerBadge,
                      ]}>
                        <Text style={styles.typeBadgeText}>
                          {user.role || 'N/A'}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusColumn]}>
                      <View style={[
                        styles.statusBadge,
                        user.isActive ? styles.activeBadge : styles.inactiveBadge,
                      ]}>
                        <Text style={styles.statusBadgeText}>
                          {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.tableCellText, styles.joinedColumn]}>
                      {formatDate(user.createdAt)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No recent users found</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  welcomeSection: {
    marginBottom: isMobile ? 16 : 20,
  },
  welcomeTitle: {
    fontSize: isMobile ? 22 : isTablet ? 24 : 28,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeSubtitle: {
    fontSize: isMobile ? 12 : 14,
    color: '#666',
    marginTop: 4,
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
    marginTop: isMobile ? 16 : 20,
  },
  sectionTitle: {
    fontSize: isMobile ? 18 : isTablet ? 19 : 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: isMobile ? 12 : 15,
  },
  tableContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS === 'web' && {
      overflowX: 'auto',
    }),
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: isMobile ? 10 : 12,
    marginBottom: isMobile ? 10 : 12,
    ...(Platform.OS === 'web' && {
      minWidth: isTablet ? 600 : 800,
    }),
  },
  tableHeaderText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '600',
    color: '#666',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: isMobile ? 10 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      minWidth: isTablet ? 600 : 800,
    }),
  },
  tableCellText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#333',
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
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 14 : 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E74C3C',
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

export default AdminDashboardScreen;

