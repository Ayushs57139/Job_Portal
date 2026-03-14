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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import UserSidebar from '../../components/UserSidebar';
import CandidateLabels from '../../components/CandidateLabels';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';

const REFRESH_INTERVAL = 15000; // 15 seconds for real-time updates

const UserDashboardScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop);
  
  const [user, setUser] = useState(null);
  const [userLabels, setUserLabels] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeApplications: 0,
    savedJobs: 0,
    profileViews: 0,
    appliedJobs: 0,
    assignedJobs: 0,
    jobInvitations: 0,
  });
  const [badges, setBadges] = useState({
    savedJobs: 0,
    activeApplications: 0,
    appliedJobs: 0,
    assignedJobs: 0,
    jobInvitations: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [jobInvitations, setJobInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      // Fetch from API to get latest verification status
      let currentUserData;
      try {
        currentUserData = await api.getCurrentUser();
        setUser({
          ...currentUserData,
          isVerified: currentUserData.isVerified || false,
          verifiedAt: currentUserData.verifiedAt || null
        });
      } catch (apiError) {
        // Fallback to stored data
        currentUserData = await api.getCurrentUserFromStorage();
        setUser({
          ...currentUserData,
          isVerified: currentUserData?.isVerified || false,
          verifiedAt: currentUserData?.verifiedAt || null
        });
      }
      
      // Load user labels if available
      if (currentUserData?.labels) {
        setUserLabels(currentUserData.labels || []);
      }
      
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
          assignedJobs: dashboardStats.assignedJobs || 0,
          jobInvitations: dashboardStats.jobInvitations || 0,
        });

        setBadges({
          savedJobs: dashboardStats.savedJobs || 0,
          activeApplications: dashboardStats.activeApplications || 0,
          appliedJobs: dashboardStats.statusCounts?.applied || 0,
          assignedJobs: dashboardStats.assignedJobs || 0,
          jobInvitations: dashboardStats.jobInvitations || 0,
        });

        // Set recent applications
        if (dashboardStats.recentApplications) {
          setRecentApplications(dashboardStats.recentApplications);
        }

        // Set assigned jobs
        if (dashboardStats.assignedJobsList) {
          setAssignedJobs(dashboardStats.assignedJobsList);
        }

        // Set job invitations
        if (dashboardStats.jobInvitationsList) {
          setJobInvitations(dashboardStats.jobInvitationsList);
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
    if (getPlatform().OS === 'web') {
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

  const handleAcceptInvitation = async (invitation) => {
    try {
      // Mark as viewed
      await api.markInvitationAsViewed(invitation._id);
      // Navigate to job details
      navigation.navigate('JobDetails', { jobId: invitation.job._id });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert('Error', 'Failed to process invitation');
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      await api.declineInvitation(invitationId);
      Alert.alert('Success', 'Invitation declined');
      loadUserData(true);
    } catch (error) {
      console.error('Error declining invitation:', error);
      Alert.alert('Error', 'Failed to decline invitation');
    }
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
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={dynamicStyles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Sidebar - Always visible on web desktop */}
      {isWeb && !isPhone ? (
        <UserSidebar
          navigation={navigation}
          activeKey="dashboard"
          onClose={null}
          badges={badges}
        />
      ) : sidebarOpen ? (
        <>
          {isPhone && (
            <TouchableOpacity
              style={dynamicStyles.backdrop}
              onPress={() => setSidebarOpen(false)}
              activeOpacity={1}
            />
          )}
          <UserSidebar
            navigation={navigation}
            activeKey="dashboard"
            onClose={isPhone ? () => setSidebarOpen(false) : (!isWeb ? () => setSidebarOpen(false) : null)}
            badges={badges}
          />
        </>
      ) : null}

      {/* Main Content */}
      <View style={dynamicStyles.mainContent}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          {(!isWeb || isPhone || (!isDesktop && !isTablet)) && (
            <TouchableOpacity 
              onPress={() => setSidebarOpen(!sidebarOpen)}
              style={dynamicStyles.menuButton}
            >
              <Ionicons name="menu" size={isPhone ? 20 : 24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <Text style={dynamicStyles.headerTitle}>Dashboard</Text>
          
          <View style={dynamicStyles.headerRight}>
            <View style={dynamicStyles.userInfo}>
              <View style={dynamicStyles.avatar}>
                <Text style={dynamicStyles.avatarText}>{getUserInitials()}</Text>
              </View>
              <View style={dynamicStyles.userNameContainer}>
                <Text style={dynamicStyles.userName}>{user?.firstName || 'User'}</Text>
                {userLabels.length > 0 && (
                  <CandidateLabels labels={userLabels} compact={true} style={dynamicStyles.userLabels} />
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={dynamicStyles.logoutButtonHeader} 
              onPress={() => {
                console.log('Logout button clicked');
                handleLogout();
              }}
              activeOpacity={0.7}
              disabled={false}
            >
              <Ionicons name="arrow-forward" size={isPhone ? 14 : 16} color="#FFFFFF" />
              <Text style={dynamicStyles.logoutTextHeader}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={dynamicStyles.scrollView}
          contentContainerStyle={dynamicStyles.scrollContent}
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
          <View style={dynamicStyles.welcomeHeader}>
            <Text style={dynamicStyles.welcomeMessage}>
              Welcome to your JobWala Dashboard
            </Text>
            <View style={dynamicStyles.liveIndicator}>
              <View style={dynamicStyles.liveDot} />
              <Text style={dynamicStyles.liveText}>Live</Text>
            </View>
          </View>

          {/* Stats Cards Grid */}
          <Animated.View style={[dynamicStyles.statsGrid, { opacity: fadeAnim }]}>
            {/* Total Applications - Pink */}
            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#FF69B4' }]}>
                <Ionicons name="document-text" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>{stats.totalApplications}</Text>
              <Text style={dynamicStyles.statLabel}>Total Applications</Text>
            </View>

            {/* Saved Jobs - Blue */}
            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#4A90E2' }]}>
                <Ionicons name="bookmark" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>{stats.savedJobs}</Text>
              <Text style={dynamicStyles.statLabel}>Saved Jobs</Text>
            </View>

            {/* Profile Views - Green */}
            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#10b981' }]}>
                <Ionicons name="eye" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>{stats.profileViews}</Text>
              <Text style={dynamicStyles.statLabel}>Profile Views</Text>
            </View>

            {/* Active Applications - Purple */}
            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="checkmark-circle" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>{stats.activeApplications}</Text>
              <Text style={dynamicStyles.statLabel}>Active Applications</Text>
            </View>
          </Animated.View>

          {/* Assigned Jobs Alert - Only show if there are assigned jobs */}
          {stats.assignedJobs > 0 && (
            <View style={dynamicStyles.assignedJobsAlert}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={dynamicStyles.assignedJobsAlertGradient}
              >
                <View style={dynamicStyles.assignedJobsAlertContent}>
                  <View style={dynamicStyles.assignedJobsIconContainer}>
                    <Ionicons name="briefcase" size={isPhone ? 28 : 32} color="#FFFFFF" />
                  </View>
                  <View style={dynamicStyles.assignedJobsTextContainer}>
                    <Text style={dynamicStyles.assignedJobsTitle}>
                      {stats.assignedJobs} Job{stats.assignedJobs !== 1 ? 's' : ''} Assigned to You!
                    </Text>
                    <Text style={dynamicStyles.assignedJobsSubtitle}>
                      Admin has assigned you to {stats.assignedJobs} job{stats.assignedJobs !== 1 ? 's' : ''}. Check them out below!
                    </Text>
                  </View>
                  <View style={dynamicStyles.assignedJobsBadge}>
                    <Text style={dynamicStyles.assignedJobsBadgeText}>{stats.assignedJobs}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Verification Status Card */}
          <View style={dynamicStyles.verificationCard}>
            <LinearGradient
              colors={user?.isVerified ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={dynamicStyles.verificationCardGradient}
            >
              <View style={dynamicStyles.verificationCardContent}>
                <View style={dynamicStyles.verificationIconContainer}>
                  <Ionicons 
                    name={user?.isVerified ? "shield-checkmark" : "shield-outline"} 
                    size={isPhone ? 32 : isMobile ? 36 : 40} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={dynamicStyles.verificationTextContainer}>
                  <Text style={dynamicStyles.verificationTitle}>
                    {user?.isVerified ? 'Account Verified' : 'Account Not Verified'}
                  </Text>
                  <Text style={dynamicStyles.verificationSubtitle}>
                    {user?.isVerified 
                      ? 'Your account has been verified by our admin team. You have full access to all features.' 
                      : 'Your account is pending verification. Please wait for admin approval to access all features.'}
                  </Text>
                  {user?.verifiedAt && (
                    <Text style={dynamicStyles.verificationDate}>
                      Verified on: {new Date(user.verifiedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Job Invitations Section */}
          {jobInvitations.length > 0 && (
            <>
              <View style={dynamicStyles.sectionHeader}>
                <Text style={dynamicStyles.sectionTitle}>Job Invitations</Text>
                <View style={[dynamicStyles.sectionBadge, { backgroundColor: '#3B82F6' }]}>
                  <Text style={dynamicStyles.sectionBadgeText}>{jobInvitations.length}</Text>
                </View>
              </View>
              <View style={dynamicStyles.invitationsContainer}>
                {jobInvitations.map((invitation) => (
                  <View
                    key={invitation._id}
                    style={dynamicStyles.invitationCard}
                  >
                    <View style={dynamicStyles.invitationHeader}>
                      <View style={dynamicStyles.invitationIconBadge}>
                        <Ionicons name="mail" size={16} color="#FFFFFF" />
                      </View>
                      <View style={dynamicStyles.invitationBadge}>
                        <Text style={dynamicStyles.invitationBadgeText}>INVITED</Text>
                      </View>
                    </View>
                    <View style={dynamicStyles.invitationContent}>
                      <Text style={dynamicStyles.invitationJobTitle}>
                        {invitation.job?.title || 'Job Title'}
                      </Text>
                      <View style={dynamicStyles.invitationCompanyRow}>
                        <Ionicons name="business-outline" size={14} color="#64748B" />
                        <Text style={dynamicStyles.invitationCompany}>
                          {typeof invitation.job?.company === 'string' 
                            ? invitation.job.company 
                            : (invitation.job?.company?.name || 'Company Name')}
                        </Text>
                      </View>
                      {invitation.job?.location && (
                        <View style={dynamicStyles.invitationLocationRow}>
                          <Ionicons name="location-outline" size={14} color="#64748B" />
                          <Text style={dynamicStyles.invitationLocation}>
                            {typeof invitation.job.location === 'string'
                              ? invitation.job.location
                              : `${invitation.job.location?.city || ''}${invitation.job.location?.city && invitation.job.location?.state ? ', ' : ''}${invitation.job.location?.state || ''}`}
                          </Text>
                        </View>
                      )}
                      {invitation.message && (
                        <View style={dynamicStyles.invitationMessageBox}>
                          <Ionicons name="chatbubble-outline" size={14} color="#3B82F6" />
                          <Text style={dynamicStyles.invitationMessage} numberOfLines={2}>
                            {invitation.message}
                          </Text>
                        </View>
                      )}
                      <View style={dynamicStyles.invitationFooter}>
                        <View style={dynamicStyles.invitationDateRow}>
                          <Ionicons name="calendar-outline" size={14} color="#3B82F6" />
                          <Text style={dynamicStyles.invitationDate}>
                            Invited: {new Date(invitation.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={dynamicStyles.invitationActions}>
                          <TouchableOpacity 
                            style={dynamicStyles.declineButton}
                            onPress={() => handleDeclineInvitation(invitation._id)}
                          >
                            <Ionicons name="close" size={14} color="#EF4444" />
                            <Text style={dynamicStyles.declineButtonText}>Decline</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={dynamicStyles.acceptButton}
                            onPress={() => handleAcceptInvitation(invitation)}
                          >
                            <Text style={dynamicStyles.acceptButtonText}>View & Apply</Text>
                            <Ionicons name="arrow-forward" size={14} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Assigned Jobs Section */}
          {assignedJobs.length > 0 && (
            <>
              <View style={dynamicStyles.sectionHeader}>
                <Text style={dynamicStyles.sectionTitle}>Jobs Assigned by Admin</Text>
                <View style={dynamicStyles.sectionBadge}>
                  <Text style={dynamicStyles.sectionBadgeText}>{assignedJobs.length}</Text>
                </View>
              </View>
              <View style={dynamicStyles.assignedJobsContainer}>
                {assignedJobs.map((application) => (
                  <TouchableOpacity
                    key={application._id || `assigned-${application.job?._id}`}
                    style={dynamicStyles.assignedJobCard}
                    onPress={() => navigation.navigate('JobDetails', { jobId: application.job?._id })}
                  >
                    <View style={dynamicStyles.assignedJobHeader}>
                      <View style={dynamicStyles.assignedJobIconBadge}>
                        <Ionicons name="star" size={16} color="#FFFFFF" />
                      </View>
                      <View style={dynamicStyles.assignedJobBadge}>
                        <Text style={dynamicStyles.assignedJobBadgeText}>ASSIGNED</Text>
                      </View>
                    </View>
                    <View style={dynamicStyles.assignedJobContent}>
                      <Text style={dynamicStyles.assignedJobTitle}>
                        {application.job?.title || 'Job Title'}
                      </Text>
                      <View style={dynamicStyles.assignedJobCompanyRow}>
                        <Ionicons name="business-outline" size={14} color="#64748B" />
                        <Text style={dynamicStyles.assignedJobCompany}>
                          {typeof application.job?.company === 'string' 
                            ? application.job.company 
                            : (application.job?.company?.name || 'Company Name')}
                        </Text>
                      </View>
                      {application.job?.location && (
                        <View style={dynamicStyles.assignedJobLocationRow}>
                          <Ionicons name="location-outline" size={14} color="#64748B" />
                          <Text style={dynamicStyles.assignedJobLocation}>
                            {typeof application.job.location === 'string'
                              ? application.job.location
                              : `${application.job.location?.city || ''}${application.job.location?.city && application.job.location?.state ? ', ' : ''}${application.job.location?.state || ''}`}
                          </Text>
                        </View>
                      )}
                      <View style={dynamicStyles.assignedJobFooter}>
                        <View style={dynamicStyles.assignedJobDateRow}>
                          <Ionicons name="calendar-outline" size={14} color="#8B5CF6" />
                          <Text style={dynamicStyles.assignedJobDate}>
                            Assigned: {new Date(application.assignedAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={dynamicStyles.viewJobButton}
                          onPress={() => navigation.navigate('JobDetails', { jobId: application.job?._id })}
                        >
                          <Text style={dynamicStyles.viewJobButtonText}>View Details</Text>
                          <Ionicons name="arrow-forward" size={14} color="#8B5CF6" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Recent Applications Section */}
          <Text style={dynamicStyles.sectionTitle}>Recent Applications</Text>
          {recentApplications.length > 0 ? (
            <View style={dynamicStyles.recentApplicationsContainer}>
              {recentApplications.map((application) => (
                <TouchableOpacity
                  key={application._id || application.id || `app-${application.job?._id}`}
                  style={dynamicStyles.applicationCard}
                  onPress={() => navigation.navigate('JobDetails', { jobId: application.job?._id })}
                >
                  <View style={dynamicStyles.applicationContent}>
                    <Text style={dynamicStyles.jobTitle}>
                      {application.job?.title || 'Job Title'}
                    </Text>
                    <Text style={dynamicStyles.companyName}>
                      {typeof application.job?.company === 'string' 
                        ? application.job.company 
                        : (application.job?.company?.name || 'Company Name')}
                    </Text>
                    <View style={dynamicStyles.applicationMeta}>
                      <Text style={dynamicStyles.applicationDate}>
                        Applied: {new Date(application.appliedAt).toLocaleDateString()}
                      </Text>
                      <View style={[
                        dynamicStyles.statusBadge,
                        { backgroundColor: getStatusColor(application.status) }
                      ]}>
                        <Text style={dynamicStyles.statusText}>{application.status}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="document-text-outline" size={isPhone ? 40 : 48} color={colors.textSecondary} />
              <Text style={dynamicStyles.emptyStateText}>No recent applications</Text>
              <TouchableOpacity 
                style={dynamicStyles.findJobsButton}
                onPress={() => navigation.navigate('Jobs')}
              >
                <Text style={dynamicStyles.findJobsButtonText}>Find Jobs</Text>
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

const getStyles = (isPhone, isMobile, isTablet, isDesktop) => {
  const isWeb = getPlatform().OS === 'web';
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: isPhone ? 'column' : 'row',
      backgroundColor: colors.background,
      ...(isWeb && !isPhone && {
        position: 'relative',
      }),
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
      fontSize: isPhone ? 14 : 16,
    },
    mainContent: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      ...(isWeb && !isPhone && {
        marginLeft: isDesktop ? 280 : (isTablet ? 260 : 240),
        width: `calc(100% - ${isDesktop ? 280 : (isTablet ? 260 : 240)}px)`,
      }),
      ...(isPhone && {
        width: '100%',
      }),
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
      paddingVertical: isPhone ? spacing.sm : spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: '#FFFFFF',
      ...(isPhone && {
        flexWrap: 'wrap',
      }),
    },
    menuButton: {
      marginRight: isPhone ? spacing.sm : spacing.md,
    },
    headerTitle: {
      ...typography.h4,
      color: colors.text,
      fontWeight: '700',
      flex: 1,
      fontSize: isPhone ? 18 : (isMobile ? 20 : (isTablet ? 22 : 24)),
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isPhone ? spacing.sm : spacing.md,
      ...(isPhone && {
        width: '100%',
        marginTop: spacing.sm,
        justifyContent: 'flex-end',
      }),
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isPhone ? spacing.xs : spacing.sm,
      ...(isPhone && {
        flex: 1,
      }),
    },
    avatar: {
      width: isPhone ? 32 : (isMobile ? 36 : 40),
      height: isPhone ? 32 : (isMobile ? 36 : 40),
      borderRadius: isPhone ? 16 : (isMobile ? 18 : 20),
      backgroundColor: '#4A90E2',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: isPhone ? 12 : (isMobile ? 14 : 16),
      fontWeight: '600',
    },
    userNameContainer: {
      flexDirection: 'column',
      gap: 4,
    },
    userName: {
      ...typography.body2,
      color: colors.text,
      fontWeight: '500',
      fontSize: isPhone ? 13 : (isMobile ? 14 : 16),
      ...(isPhone && {
        display: 'none',
      }),
    },
    userLabels: {
      marginTop: 2,
    },
    logoutButtonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ef4444',
      paddingHorizontal: isPhone ? spacing.sm : spacing.md,
      paddingVertical: isPhone ? spacing.xs : spacing.sm,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
      ...(isWeb && {
        cursor: 'pointer',
      }),
      zIndex: 10,
    },
    logoutTextHeader: {
      ...typography.body2,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: isPhone ? 12 : 14,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
      paddingBottom: isPhone ? spacing.xl : spacing.xxl,
    },
    welcomeHeader: {
      flexDirection: isPhone ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isPhone ? 'flex-start' : 'center',
      marginBottom: isPhone ? spacing.lg : spacing.xl,
      gap: isPhone ? spacing.sm : 0,
    },
    welcomeMessage: {
      ...typography.body1,
      color: colors.textSecondary,
      flex: 1,
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
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
      width: isPhone ? 6 : 8,
      height: isPhone ? 6 : 8,
      borderRadius: isPhone ? 3 : 4,
      backgroundColor: '#10b981',
    },
    liveText: {
      ...typography.caption,
      color: '#10b981',
      fontWeight: '600',
      fontSize: isPhone ? 10 : 11,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isPhone ? spacing.sm : spacing.md,
      marginBottom: isPhone ? spacing.lg : spacing.xl,
    },
    statCard: {
      width: isPhone ? '48%' : (isMobile ? '47%' : (isTablet ? '47%' : '23%')),
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
      alignItems: 'center',
      ...shadows.sm,
      ...(isWeb && {
        cursor: 'default',
      }),
    },
    statIconContainer: {
      width: isPhone ? 40 : (isMobile ? 44 : 48),
      height: isPhone ? 40 : (isMobile ? 44 : 48),
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
      fontSize: isPhone ? 20 : (isMobile ? 24 : (isTablet ? 28 : 32)),
    },
    statLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      fontSize: isPhone ? 11 : (isMobile ? 12 : 13),
    },
    sectionTitle: {
      ...typography.h5,
      color: colors.text,
      fontWeight: '700',
      marginBottom: spacing.md,
      fontSize: isPhone ? 16 : (isMobile ? 18 : (isTablet ? 20 : 22)),
    },
    recentApplicationsContainer: {
      gap: spacing.md,
    },
    applicationCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: isPhone ? spacing.sm : spacing.md,
      ...shadows.sm,
      marginBottom: spacing.sm,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    applicationContent: {
      gap: spacing.xs,
    },
    jobTitle: {
      ...typography.h6,
      color: colors.text,
      fontWeight: '600',
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
    },
    companyName: {
      ...typography.body2,
      color: colors.textSecondary,
      fontSize: isPhone ? 12 : (isMobile ? 13 : 14),
    },
    applicationMeta: {
      flexDirection: isPhone ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isPhone ? 'flex-start' : 'center',
      marginTop: spacing.xs,
      gap: isPhone ? spacing.xs : 0,
    },
    applicationDate: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: isPhone ? 10 : 11,
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
      fontSize: isPhone ? 10 : 11,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isPhone ? spacing.xl : spacing.xxl,
    },
    emptyStateText: {
      ...typography.body1,
      color: colors.textSecondary,
      marginTop: spacing.md,
      marginBottom: spacing.lg,
      fontSize: isPhone ? 14 : 16,
    },
    findJobsButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: isPhone ? spacing.md : spacing.lg,
      paddingVertical: isPhone ? spacing.sm : spacing.md,
      borderRadius: borderRadius.md,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    findJobsButtonText: {
      ...typography.button,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: isPhone ? 14 : 16,
    },
    verificationCard: {
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      ...shadows.lg,
    },
    verificationCardGradient: {
      position: 'relative',
    },
    verificationCardContent: {
      padding: isPhone ? spacing.md : spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    verificationIconContainer: {
      width: isPhone ? 60 : (isMobile ? 70 : 80),
      height: isPhone ? 60 : (isMobile ? 70 : 80),
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    verificationTextContainer: {
      flex: 1,
      gap: spacing.xs,
    },
    verificationTitle: {
      fontSize: isPhone ? 16 : (isMobile ? 18 : 20),
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },
    verificationSubtitle: {
      fontSize: isPhone ? 12 : (isMobile ? 13 : 14),
      color: 'rgba(255,255,255,0.9)',
      lineHeight: isPhone ? 18 : 20,
    },
    verificationDate: {
      fontSize: isPhone ? 10 : 12,
      color: 'rgba(255,255,255,0.8)',
      marginTop: spacing.xs,
      fontStyle: 'italic',
    },
    // Assigned Jobs Alert Styles
    assignedJobsAlert: {
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      ...shadows.lg,
    },
    assignedJobsAlertGradient: {
      position: 'relative',
    },
    assignedJobsAlertContent: {
      padding: isPhone ? spacing.md : spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    assignedJobsIconContainer: {
      width: isPhone ? 50 : 60,
      height: isPhone ? 50 : 60,
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    assignedJobsTextContainer: {
      flex: 1,
      gap: spacing.xs,
    },
    assignedJobsTitle: {
      fontSize: isPhone ? 15 : 17,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    assignedJobsSubtitle: {
      fontSize: isPhone ? 12 : 13,
      color: 'rgba(255,255,255,0.9)',
      lineHeight: isPhone ? 16 : 18,
    },
    assignedJobsBadge: {
      backgroundColor: 'rgba(255,255,255,0.3)',
      paddingHorizontal: isPhone ? 12 : 14,
      paddingVertical: isPhone ? 6 : 8,
      borderRadius: borderRadius.md,
      minWidth: isPhone ? 40 : 45,
      alignItems: 'center',
    },
    assignedJobsBadgeText: {
      fontSize: isPhone ? 16 : 18,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    // Assigned Jobs List Styles
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    sectionBadge: {
      backgroundColor: '#8B5CF6',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      minWidth: 28,
      alignItems: 'center',
    },
    sectionBadgeText: {
      fontSize: isPhone ? 12 : 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    assignedJobsContainer: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    assignedJobCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: borderRadius.lg,
      padding: isPhone ? spacing.md : spacing.lg,
      ...shadows.md,
      borderWidth: 2,
      borderColor: '#E9D5FF',
    },
    assignedJobHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    assignedJobIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#8B5CF6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    assignedJobBadge: {
      backgroundColor: '#F3E8FF',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    assignedJobBadgeText: {
      fontSize: isPhone ? 10 : 11,
      fontWeight: '700',
      color: '#8B5CF6',
      letterSpacing: 0.5,
    },
    assignedJobContent: {
      gap: spacing.xs,
    },
    assignedJobTitle: {
      fontSize: isPhone ? 16 : 18,
      fontWeight: '700',
      color: '#1E293B',
      marginBottom: spacing.xs,
    },
    assignedJobCompanyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    assignedJobCompany: {
      fontSize: isPhone ? 13 : 14,
      color: '#64748B',
      fontWeight: '500',
    },
    assignedJobLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    assignedJobLocation: {
      fontSize: isPhone ? 12 : 13,
      color: '#64748B',
    },
    assignedJobFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9',
    },
    assignedJobDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    assignedJobDate: {
      fontSize: isPhone ? 11 : 12,
      color: '#8B5CF6',
      fontWeight: '600',
    },
    viewJobButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: '#F3E8FF',
      borderRadius: borderRadius.sm,
    },
    viewJobButtonText: {
      fontSize: isPhone ? 12 : 13,
      color: '#8B5CF6',
      fontWeight: '600',
    },
    // Job Invitations Styles
    invitationsContainer: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    invitationCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: borderRadius.lg,
      padding: isPhone ? spacing.md : spacing.lg,
      ...shadows.md,
      borderWidth: 2,
      borderColor: '#DBEAFE',
    },
    invitationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    invitationIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#3B82F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    invitationBadge: {
      backgroundColor: '#EFF6FF',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    invitationBadgeText: {
      fontSize: isPhone ? 10 : 11,
      fontWeight: '700',
      color: '#3B82F6',
      letterSpacing: 0.5,
    },
    invitationContent: {
      gap: spacing.xs,
    },
    invitationJobTitle: {
      fontSize: isPhone ? 16 : 18,
      fontWeight: '700',
      color: '#1E293B',
      marginBottom: spacing.xs,
    },
    invitationCompanyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    invitationCompany: {
      fontSize: isPhone ? 13 : 14,
      color: '#64748B',
      fontWeight: '500',
    },
    invitationLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    invitationLocation: {
      fontSize: isPhone ? 12 : 13,
      color: '#64748B',
    },
    invitationMessageBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: '#F0F9FF',
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      marginTop: spacing.xs,
    },
    invitationMessage: {
      flex: 1,
      fontSize: isPhone ? 12 : 13,
      color: '#1E40AF',
      lineHeight: isPhone ? 16 : 18,
    },
    invitationFooter: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9',
      gap: spacing.sm,
    },
    invitationDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    invitationDate: {
      fontSize: isPhone ? 11 : 12,
      color: '#3B82F6',
      fontWeight: '600',
    },
    invitationActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    declineButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#FEF2F2',
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: '#FEE2E2',
    },
    declineButtonText: {
      fontSize: isPhone ? 12 : 13,
      color: '#EF4444',
      fontWeight: '600',
    },
    acceptButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#3B82F6',
      borderRadius: borderRadius.sm,
    },
    acceptButtonText: {
      fontSize: isPhone ? 12 : 13,
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });
};

export default UserDashboardScreen;

