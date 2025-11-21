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
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import UserSidebar from '../../components/UserSidebar';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const isWeb = Platform.OS === 'web';
const REFRESH_INTERVAL = 15000; // 15 seconds for real-time updates

const SavedJobsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(isWeb && !isPhone);
  const [user, setUser] = useState(null);
  const [unsavingJobId, setUnsavingJobId] = useState(null);
  const intervalRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Load saved jobs function
  const loadSavedJobs = useCallback(async (showLoading = false) => {
    if (showLoading) {
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
      ]).start();
    }

    try {
      const userData = await api.getCurrentUserFromStorage();
      setUser(userData);

      const response = await api.getSavedJobs();
      const jobs = response.savedJobs || [];
      setSavedJobs(jobs);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
      if (showLoading) {
        Alert.alert('Error', 'Failed to load saved jobs. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fadeAnim]);

  // Initial load
  useEffect(() => {
    loadSavedJobs(true);
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadSavedJobs(false); // Silent refresh
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadSavedJobs]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      loadSavedJobs(false); // Refresh when screen comes into focus
      
      // Restart interval when screen is focused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        loadSavedJobs(false);
      }, REFRESH_INTERVAL);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [loadSavedJobs])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadSavedJobs(true);
  };

  const handleUnsaveJob = async (jobId, event) => {
    event?.stopPropagation();
    
    Alert.alert(
      'Unsave Job',
      'Are you sure you want to remove this job from your saved jobs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUnsavingJobId(jobId);
              await api.unsaveJob(jobId);
              
              // Remove from local state
              setSavedJobs(prev => prev.filter(savedJob => savedJob.job?.id !== jobId && savedJob.job?._id !== jobId));
              
              Alert.alert('Success', 'Job removed from saved jobs');
            } catch (error) {
              console.error('Error unsaving job:', error);
              Alert.alert('Error', 'Failed to remove job. Please try again.');
            } finally {
              setUnsavingJobId(null);
            }
          },
        },
      ]
    );
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    if (typeof salary === 'object') {
      if (salary.min && salary.max) {
        return `₹${parseInt(salary.min).toLocaleString('en-IN')} - ₹${parseInt(salary.max).toLocaleString('en-IN')}`;
      }
      if (salary.min) {
        return `₹${parseInt(salary.min).toLocaleString('en-IN')}+`;
      }
      return 'Not specified';
    }
    return `₹${parseInt(salary).toLocaleString('en-IN')}`;
  };

  const getEmploymentTypeLabel = (type) => {
    const types = {
      'fulltime': 'Full Time',
      'parttime': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance',
    };
    return types[type] || type || 'Not specified';
  };

  if (loading && savedJobs.length === 0) {
    return (
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={dynamicStyles.loadingText}>Loading saved jobs...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Sidebar */}
      {/* Sidebar - Always visible on web desktop */}
      {isWeb && !isPhone ? (
        <UserSidebar
          navigation={navigation}
          activeKey="savedJobs"
          onClose={null}
          badges={{
            savedJobs: savedJobs.length,
          }}
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
            activeKey="savedJobs"
            onClose={isPhone ? () => setSidebarOpen(false) : (!isWeb ? () => setSidebarOpen(false) : null)}
            badges={{
              savedJobs: savedJobs.length,
            }}
          />
        </>
      ) : null}

      {/* Main Content */}
      <View style={dynamicStyles.mainContent}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          {(!isWeb || isPhone) && (
            <TouchableOpacity 
              onPress={() => setSidebarOpen(!sidebarOpen)}
              style={dynamicStyles.menuButton}
            >
              <Ionicons name="menu" size={isPhone ? 20 : 24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <Text style={dynamicStyles.headerTitle}>Saved Jobs</Text>
          
          <View style={dynamicStyles.headerRight}>
            <View style={dynamicStyles.userInfo}>
              <View style={dynamicStyles.avatar}>
                <Text style={dynamicStyles.avatarText}>{getUserInitials()}</Text>
              </View>
              <Text style={dynamicStyles.userName}>{user?.firstName || 'User'}</Text>
            </View>
            <TouchableOpacity style={dynamicStyles.logoutButtonHeader} onPress={handleLogout}>
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
              Your saved jobs
            </Text>
            <View style={dynamicStyles.liveIndicator}>
              <View style={dynamicStyles.liveDot} />
              <Text style={dynamicStyles.liveText}>Live</Text>
            </View>
          </View>

          {/* Stats Cards */}
          <Animated.View style={[dynamicStyles.statsGrid, { opacity: fadeAnim }]}>
            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#4A90E2' }]}>
                <Ionicons name="bookmark" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>{savedJobs.length}</Text>
              <Text style={dynamicStyles.statLabel}>Saved Jobs</Text>
            </View>

            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#10b981' }]}>
                <Ionicons name="briefcase" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>
                {savedJobs.filter(job => job.job?.employmentType === 'fulltime').length}
              </Text>
              <Text style={dynamicStyles.statLabel}>Full Time</Text>
            </View>

            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="time" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>
                {savedJobs.filter(job => job.job?.employmentType === 'parttime').length}
              </Text>
              <Text style={dynamicStyles.statLabel}>Part Time</Text>
            </View>

            <View style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="school" size={isPhone ? 20 : 24} color="#FFFFFF" />
              </View>
              <Text style={dynamicStyles.statValue}>
                {savedJobs.filter(job => job.job?.employmentType === 'internship').length}
              </Text>
              <Text style={dynamicStyles.statLabel}>Internships</Text>
            </View>
          </Animated.View>

          {/* Saved Jobs List */}
          {savedJobs.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
              <Ionicons name="bookmark-outline" size={isPhone ? 48 : (isMobile ? 56 : 64)} color={colors.textSecondary} />
            <Text style={dynamicStyles.emptyTitle}>No Saved Jobs</Text>
              <Text style={dynamicStyles.emptySubtitle}>
                Start saving jobs to view them here. You can save jobs from the job listings page.
            </Text>
            <TouchableOpacity
                style={dynamicStyles.browseJobsButton}
              onPress={() => navigation.navigate('Jobs')}
            >
                <Text style={dynamicStyles.browseJobsButtonText}>Browse Jobs</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={dynamicStyles.jobsList}>
              <Text style={dynamicStyles.sectionTitle}>Your Saved Jobs ({savedJobs.length})</Text>
              {savedJobs.map((savedJob) => {
                const job = savedJob.job || {};
                const jobId = job.id || job._id;
                const isUnsaving = unsavingJobId === jobId;

                if (!jobId) return null;

                return (
                  <TouchableOpacity
                    key={savedJob.id || savedJob._id || jobId}
                    style={dynamicStyles.jobCard}
                    onPress={() => navigation.navigate('JobDetails', { jobId })}
                    activeOpacity={0.7}
                    disabled={isUnsaving}
                  >
                    <View style={dynamicStyles.cardHeader}>
                      <View style={dynamicStyles.jobInfo}>
                        <Text style={dynamicStyles.jobTitle}>{job.title || 'Job Title'}</Text>
                        <Text style={dynamicStyles.companyName}>{job.company || 'Company Name'}</Text>
                        {job.location && (
                          <View style={dynamicStyles.locationRow}>
                            <Ionicons name="location-outline" size={isPhone ? 12 : 14} color={colors.textSecondary} />
                            <Text style={dynamicStyles.jobLocation}>{job.location}</Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        style={dynamicStyles.unsaveButton}
                        onPress={(e) => handleUnsaveJob(jobId, e)}
                        disabled={isUnsaving}
                      >
                        {isUnsaving ? (
                          <ActivityIndicator size="small" color={colors.error} />
                        ) : (
                          <Ionicons name="bookmark" size={isPhone ? 18 : 20} color={colors.error} />
                        )}
            </TouchableOpacity>
                    </View>

                    <View style={dynamicStyles.cardDetails}>
                      {job.employmentType && (
                        <View style={dynamicStyles.detailRow}>
                          <Ionicons name="briefcase-outline" size={isPhone ? 14 : 16} color={colors.textSecondary} />
                          <Text style={dynamicStyles.detailText}>
                            {getEmploymentTypeLabel(job.employmentType)}
                          </Text>
                        </View>
                      )}
                      {job.jobType && (
                        <View style={dynamicStyles.detailRow}>
                          <Ionicons name="time-outline" size={isPhone ? 14 : 16} color={colors.textSecondary} />
                          <Text style={dynamicStyles.detailText}>{job.jobType}</Text>
                        </View>
                      )}
                      <View style={dynamicStyles.detailRow}>
                        <Ionicons name="calendar-outline" size={isPhone ? 14 : 16} color={colors.textSecondary} />
                        <Text style={dynamicStyles.detailText}>
                          Posted {formatDate(job.createdAt)}
                        </Text>
                      </View>
                      <View style={dynamicStyles.detailRow}>
                        <Ionicons name="bookmark-outline" size={isPhone ? 14 : 16} color={colors.textSecondary} />
                        <Text style={dynamicStyles.detailText}>
                          Saved {formatDate(savedJob.savedAt)}
                        </Text>
                      </View>
                    </View>

                    {job.salary && (
                      <View style={dynamicStyles.salaryContainer}>
                        <Text style={dynamicStyles.salaryText}>{formatSalary(job.salary)}</Text>
                      </View>
                    )}

                    {savedJob.notes && (
                      <View style={dynamicStyles.notesContainer}>
                        <Text style={dynamicStyles.notesLabel}>Notes:</Text>
                        <Text style={dynamicStyles.notesText}>{savedJob.notes}</Text>
                      </View>
                    )}

                    {savedJob.tags && savedJob.tags.length > 0 && (
                      <View style={dynamicStyles.tagsContainer}>
                        {savedJob.tags.map((tag, index) => (
                          <View key={index} style={dynamicStyles.tag}>
                            <Text style={dynamicStyles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity
                      style={dynamicStyles.viewJobButton}
                      onPress={() => navigation.navigate('JobDetails', { jobId })}
                    >
                      <Text style={dynamicStyles.viewJobButtonText}>View Job Details</Text>
                      <Ionicons name="arrow-forward" size={isPhone ? 14 : 16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
          </View>
        )}
      </ScrollView>
      </View>
    </View>
  );
};

const getStyles = (isPhone, isMobile, isTablet, isDesktop) => {
  const isWeb = Platform.OS === 'web';
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: isPhone ? 'column' : 'row',
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
    userName: {
      ...typography.body2,
      color: colors.text,
      fontWeight: '500',
      fontSize: isPhone ? 13 : (isMobile ? 14 : 16),
      ...(isPhone && {
        display: 'none',
      }),
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
    jobsList: {
      gap: spacing.md,
    },
    jobCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: isPhone ? spacing.md : spacing.lg,
      ...shadows.sm,
      marginBottom: spacing.sm,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    cardHeader: {
      flexDirection: isPhone ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isPhone ? 'flex-start' : 'flex-start',
      marginBottom: spacing.md,
      gap: isPhone ? spacing.sm : 0,
    },
    jobInfo: {
      flex: 1,
      marginRight: isPhone ? 0 : spacing.md,
    },
    jobTitle: {
      ...typography.h6,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
    },
    companyName: {
      ...typography.body1,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      fontSize: isPhone ? 13 : (isMobile ? 14 : 15),
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    jobLocation: {
      ...typography.body2,
      color: colors.textSecondary,
      fontSize: isPhone ? 12 : (isMobile ? 13 : 14),
    },
    unsaveButton: {
      padding: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: `${colors.error}15`,
      marginTop: isPhone ? spacing.sm : 0,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    cardDetails: {
      marginBottom: spacing.md,
      gap: spacing.xs,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    detailText: {
      ...typography.body2,
      color: colors.textSecondary,
      fontSize: isPhone ? 12 : (isMobile ? 13 : 14),
    },
    salaryContainer: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: spacing.sm,
    },
    salaryText: {
      ...typography.body1,
      color: colors.primary,
      fontWeight: '600',
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
    },
    notesContainer: {
      marginBottom: spacing.sm,
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderRadius: borderRadius.sm,
    },
    notesLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: spacing.xs,
      fontSize: isPhone ? 11 : 12,
    },
    notesText: {
      ...typography.body2,
      color: colors.text,
      fontSize: isPhone ? 12 : (isMobile ? 13 : 14),
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    tag: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: isPhone ? spacing.xs : spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    tagText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '500',
      fontSize: isPhone ? 10 : 11,
    },
    viewJobButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: isPhone ? spacing.sm : spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
      marginTop: spacing.sm,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    viewJobButtonText: {
      ...typography.button,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: isPhone ? 14 : 16,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isPhone ? spacing.xl : spacing.xxl,
    },
    emptyTitle: {
      ...typography.h5,
      color: colors.text,
      fontWeight: '600',
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      fontSize: isPhone ? 16 : (isMobile ? 18 : 20),
    },
    emptySubtitle: {
      ...typography.body1,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
      fontSize: isPhone ? 14 : 16,
    },
    browseJobsButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: isPhone ? spacing.lg : spacing.xl,
      paddingVertical: isPhone ? spacing.sm : spacing.md,
      borderRadius: borderRadius.md,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    browseJobsButtonText: {
      ...typography.button,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: isPhone ? 14 : 16,
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
  });
};

export default SavedJobsScreen;
