import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminAnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Fetching analytics from:', `${API_URL}/admin/analytics`);
      const response = await fetch(`${API_URL}/admin/analytics`, { headers });
      
      console.log('Analytics response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch analytics');
      }
      
      const data = await response.json();
      console.log('Analytics data received:', data);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message);
      // Set default empty analytics to prevent crashes
      setAnalytics({
        users: {
          total: 0, verified: 0, jobseekers: 0, companies: 0, consultancies: 0,
          newToday: 0, newThisWeek: 0, newThisMonth: 0, growthRate: 0
        },
        jobs: {
          total: 0, active: 0, inactive: 0, closed: 0,
          newToday: 0, newThisWeek: 0, newThisMonth: 0, growthRate: 0, avgPerCompany: 0
        },
        applications: {
          total: 0, pending: 0, shortlisted: 0, rejected: 0, accepted: 0,
          newToday: 0, newThisWeek: 0, newThisMonth: 0, avgPerJob: 0, conversionRate: 0
        },
        metrics: {
          jobFillRate: 0, verificationRate: 0
        },
        topLocations: [],
        topIndustries: [],
        chartData: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  if (loading) {
    return (
      <AdminLayout title="Analytics" activeScreen="AdminAnalytics" onNavigate={handleNavigate} onLogout={handleLogout}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout title="Analytics" activeScreen="AdminAnalytics" onNavigate={handleNavigate} onLogout={handleLogout}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={64} color="#E74C3C" />
          <Text style={styles.errorText}>Failed to load analytics</Text>
          {error && <Text style={styles.errorSubtext}>{error}</Text>}
          <TouchableOpacity style={styles.retryButton} onPress={fetchAnalytics}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics" activeScreen="AdminAnalytics" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A90E2']} />
        }
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Analytics Dashboard</Text>
              <Text style={styles.pageSubtitle}>Real-time platform statistics and insights</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'users' && styles.activeTab]}
              onPress={() => setActiveTab('users')}
            >
              <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
              onPress={() => setActiveTab('jobs')}
            >
              <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
              onPress={() => setActiveTab('applications')}
            >
              <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>Applications</Text>
            </TouchableOpacity>
          </View>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <View>
              {/* Key Metrics */}
              <View style={styles.metricsGrid}>
                <View style={[styles.metricCard, { backgroundColor: 'rgba(74, 144, 226, 0.1)' }]}>
                  <Ionicons name="people" size={32} color="#4A90E2" />
                  <Text style={styles.metricNumber}>{formatNumber(analytics?.users?.total || 0)}</Text>
                  <Text style={styles.metricLabel}>Total Users</Text>
                  <View style={styles.metricBadge}>
                    <Text style={styles.metricBadgeText}>+{analytics?.users?.newToday || 0} today</Text>
                  </View>
                </View>

                <View style={[styles.metricCard, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
                  <Ionicons name="briefcase" size={32} color="#27AE60" />
                  <Text style={styles.metricNumber}>{formatNumber(analytics?.jobs?.total || 0)}</Text>
                  <Text style={styles.metricLabel}>Total Jobs</Text>
                  <View style={styles.metricBadge}>
                    <Text style={styles.metricBadgeText}>+{analytics?.jobs?.newToday || 0} today</Text>
                  </View>
                </View>

                <View style={[styles.metricCard, { backgroundColor: 'rgba(243, 156, 18, 0.1)' }]}>
                  <Ionicons name="document-text" size={32} color="#F39C12" />
                  <Text style={styles.metricNumber}>{formatNumber(analytics?.applications?.total || 0)}</Text>
                  <Text style={styles.metricLabel}>Total Applications</Text>
                  <View style={styles.metricBadge}>
                    <Text style={styles.metricBadgeText}>+{analytics?.applications?.newToday || 0} today</Text>
                  </View>
                </View>

                <View style={[styles.metricCard, { backgroundColor: 'rgba(155, 89, 182, 0.1)' }]}>
                  <Ionicons name="checkmark-circle" size={32} color="#9B59B6" />
                  <Text style={styles.metricNumber}>{analytics?.jobs?.active || 0}</Text>
                  <Text style={styles.metricLabel}>Active Jobs</Text>
                  <View style={styles.metricBadge}>
                    <Text style={styles.metricBadgeText}>
                      {analytics?.jobs?.total > 0 ? ((analytics.jobs.active / analytics.jobs.total) * 100).toFixed(1) : 0}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* Growth Indicators */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Growth Trends</Text>
                <View style={styles.growthGrid}>
                  <View style={styles.growthCard}>
                    <View style={styles.growthHeader}>
                      <Ionicons name="trending-up" size={24} color="#27AE60" />
                      <Text style={[styles.growthRate, { color: (analytics?.users?.growthRate || 0) >= 0 ? '#27AE60' : '#E74C3C' }]}>
                        {(analytics?.users?.growthRate || 0) >= 0 ? '+' : ''}{analytics?.users?.growthRate || 0}%
                      </Text>
                    </View>
                    <Text style={styles.growthLabel}>User Growth</Text>
                    <Text style={styles.growthSubtext}>vs last month</Text>
                  </View>

                  <View style={styles.growthCard}>
                    <View style={styles.growthHeader}>
                      <Ionicons name="trending-up" size={24} color="#27AE60" />
                      <Text style={[styles.growthRate, { color: (analytics?.jobs?.growthRate || 0) >= 0 ? '#27AE60' : '#E74C3C' }]}>
                        {(analytics?.jobs?.growthRate || 0) >= 0 ? '+' : ''}{analytics?.jobs?.growthRate || 0}%
                      </Text>
                    </View>
                    <Text style={styles.growthLabel}>Job Growth</Text>
                    <Text style={styles.growthSubtext}>vs last month</Text>
                  </View>
                </View>
              </View>

              {/* Top Locations */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Job Locations</Text>
                {analytics.topLocations && analytics.topLocations.length > 0 ? (
                  analytics.topLocations.map((loc, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={styles.listItemLeft}>
                        <Ionicons name="location" size={20} color="#4A90E2" />
                        <Text style={styles.listItemText}>{loc._id || 'Unknown'}</Text>
                      </View>
                      <View style={styles.listItemBadge}>
                        <Text style={styles.listItemCount}>{loc.count}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No location data available</Text>
                )}
              </View>

              {/* Top Industries */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Industries</Text>
                {analytics.topIndustries && analytics.topIndustries.length > 0 ? (
                  analytics.topIndustries.map((ind, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={styles.listItemLeft}>
                        <Ionicons name="business" size={20} color="#9B59B6" />
                        <Text style={styles.listItemText}>{ind._id || 'Unknown'}</Text>
                      </View>
                      <View style={styles.listItemBadge}>
                        <Text style={styles.listItemCount}>{ind.count}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No industry data available</Text>
                )}
              </View>
            </View>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <View>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="people" size={40} color="#4A90E2" />
                  <Text style={styles.statNumber}>{formatNumber(analytics.users.total)}</Text>
                  <Text style={styles.statLabel}>Total Users</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="checkmark-done" size={40} color="#27AE60" />
                  <Text style={styles.statNumber}>{formatNumber(analytics.users.verified)}</Text>
                  <Text style={styles.statLabel}>Verified Users</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Distribution</Text>
                <View style={styles.distributionCard}>
                  <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                      <View style={[styles.distributionDot, { backgroundColor: '#4A90E2' }]} />
                      <Text style={styles.distributionLabel}>Job Seekers</Text>
                    </View>
                    <Text style={styles.distributionValue}>{formatNumber(analytics.users.jobseekers)}</Text>
                  </View>
                  <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                      <View style={[styles.distributionDot, { backgroundColor: '#27AE60' }]} />
                      <Text style={styles.distributionLabel}>Companies</Text>
                    </View>
                    <Text style={styles.distributionValue}>{formatNumber(analytics.users.companies)}</Text>
                  </View>
                  <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                      <View style={[styles.distributionDot, { backgroundColor: '#9B59B6' }]} />
                      <Text style={styles.distributionLabel}>Consultancies</Text>
                    </View>
                    <Text style={styles.distributionValue}>{formatNumber(analytics.users.consultancies)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityCard}>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityLabel}>New Today</Text>
                    <Text style={styles.activityValue}>{analytics.users.newToday}</Text>
                  </View>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityLabel}>This Week</Text>
                    <Text style={styles.activityValue}>{analytics.users.newThisWeek}</Text>
                  </View>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityLabel}>This Month</Text>
                    <Text style={styles.activityValue}>{analytics.users.newThisMonth}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Metrics</Text>
                <View style={styles.metricsCard}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricRowLabel}>Verification Rate</Text>
                    <Text style={styles.metricRowValue}>{analytics.metrics.verificationRate}%</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricRowLabel}>Growth Rate</Text>
                    <Text style={[styles.metricRowValue, { color: analytics.users.growthRate >= 0 ? '#27AE60' : '#E74C3C' }]}>
                      {analytics.users.growthRate >= 0 ? '+' : ''}{analytics.users.growthRate}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <View>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="briefcase" size={40} color="#4A90E2" />
                  <Text style={styles.statNumber}>{formatNumber(analytics.jobs.total)}</Text>
                  <Text style={styles.statLabel}>Total Jobs</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="checkmark-circle" size={40} color="#27AE60" />
                  <Text style={styles.statNumber}>{analytics.jobs.active}</Text>
                  <Text style={styles.statLabel}>Active Jobs</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Job Status Distribution</Text>
                <View style={styles.distributionCard}>
                  <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                      <View style={[styles.distributionDot, { backgroundColor: '#27AE60' }]} />
                      <Text style={styles.distributionLabel}>Active</Text>
                    </View>
                    <Text style={styles.distributionValue}>{analytics.jobs.active}</Text>
                  </View>
                  <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                      <View style={[styles.distributionDot, { backgroundColor: '#F39C12' }]} />
                      <Text style={styles.distributionLabel}>Inactive</Text>
                    </View>
                    <Text style={styles.distributionValue}>{analytics.jobs.inactive}</Text>
                  </View>
                  <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                      <View style={[styles.distributionDot, { backgroundColor: '#95A5A6' }]} />
                      <Text style={styles.distributionLabel}>Closed</Text>
                    </View>
                    <Text style={styles.distributionValue}>{analytics.jobs.closed}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityCard}>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityLabel}>Posted Today</Text>
                    <Text style={styles.activityValue}>{analytics.jobs.newToday}</Text>
                  </View>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityLabel}>This Week</Text>
                    <Text style={styles.activityValue}>{analytics.jobs.newThisWeek}</Text>
                  </View>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityLabel}>This Month</Text>
                    <Text style={styles.activityValue}>{analytics.jobs.newThisMonth}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Metrics</Text>
                <View style={styles.metricsCard}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricRowLabel}>Avg Jobs per Company</Text>
                    <Text style={styles.metricRowValue}>{analytics.jobs.avgPerCompany}</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricRowLabel}>Job Fill Rate</Text>
                    <Text style={styles.metricRowValue}>{analytics.metrics.jobFillRate}%</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricRowLabel}>Growth Rate</Text>
                    <Text style={[styles.metricRowValue, { color: analytics.jobs.growthRate >= 0 ? '#27AE60' : '#E74C3C' }]}>
                      {analytics.jobs.growthRate >= 0 ? '+' : ''}{analytics.jobs.growthRate}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <View>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="document-text" size={40} color="#4A90E2" />
                  <Text style={styles.statNumber}>{formatNumber(analytics.applications.total)}</Text>
                  <Text style={styles.statLabel}>Total Applications</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="hourglass" size={40} color="#F39C12" />
                  <Text style={styles.statNumber}>{analytics.applications.pending}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Application Status</Text>
                <View style={styles.distributionCard}>
                  <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                      <View style={[styles.distributionDot, { backgroundColor: '#F39C12' }]} />
                      <Text style={styles.distributionLabel}>Pending</Text>
                    </View>
                    <Text style={styles.distributionValue}>{formatNumber(analytics.applications.pending)}</Text>
                  </View>
                  <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                      <View style={[styles.distributionDot, { backgroundColor: '#3498DB' }]} />
                      <Text style={styles.distributionLabel}>Shortlisted</Text>
                    </View>
                    <Text style={styles.distributionValue}>{formatNumber(analytics.applications.shortlisted)}</Text>
                  </View>
                  <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                      <View style={[styles.distributionDot, { backgroundColor: '#27AE60' }]} />
                      <Text style={styles.distributionLabel}>Accepted</Text>
                    </View>
                    <Text style={styles.distributionValue}>{formatNumber(analytics.applications.accepted)}</Text>
                  </View>
                  <View style={styles.distributionItem}>
                    <View style={styles.distributionLeft}>
                      <View style={[styles.distributionDot, { backgroundColor: '#E74C3C' }]} />
                      <Text style={styles.distributionLabel}>Rejected</Text>
                    </View>
                    <Text style={styles.distributionValue}>{formatNumber(analytics.applications.rejected)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityCard}>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityLabel}>Received Today</Text>
                    <Text style={styles.activityValue}>{analytics.applications.newToday}</Text>
                  </View>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityLabel}>This Week</Text>
                    <Text style={styles.activityValue}>{analytics.applications.newThisWeek}</Text>
                  </View>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityLabel}>This Month</Text>
                    <Text style={styles.activityValue}>{analytics.applications.newThisMonth}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Metrics</Text>
                <View style={styles.metricsCard}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricRowLabel}>Avg Applications per Job</Text>
                    <Text style={styles.metricRowValue}>{analytics.applications.avgPerJob}</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricRowLabel}>Conversion Rate</Text>
                    <Text style={styles.metricRowValue}>{analytics.applications.conversionRate}%</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricRowLabel}>Success Rate</Text>
                    <Text style={styles.metricRowValue}>
                      {((analytics.applications.accepted / analytics.applications.total) * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    padding: 20,
  },
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
  errorText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 5,
    marginBottom: 20,
    gap: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#4A90E2',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  metricBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  metricBadgeText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  growthGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  growthCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  growthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  growthRate: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  growthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  growthSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  listItemBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  listItemCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  distributionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    gap: 15,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  distributionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  distributionLabel: {
    fontSize: 15,
    color: '#333',
  },
  distributionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activityCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    gap: 15,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLabel: {
    fontSize: 15,
    color: '#666',
  },
  activityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  metricsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    gap: 15,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricRowLabel: {
    fontSize: 15,
    color: '#666',
  },
  metricRowValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AdminAnalyticsScreen;
