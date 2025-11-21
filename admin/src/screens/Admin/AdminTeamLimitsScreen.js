import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, TextInput, Modal, Platform, RefreshControl } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

const AdminTeamLimitsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employers, setEmployers] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [newTeamLimit, setNewTeamLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalEmployers: 0,
    totalTeamMembers: 0,
    companies: 0,
    consultancies: 0,
  });

  useEffect(() => {
    fetchEmployers();
    fetchUser();
  }, []);

  useEffect(() => {
    filterEmployers();
  }, [searchQuery, employers]);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user || data);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/users?userType=employer&limit=1000`, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch employers');
      }
      
      const data = await response.json();
      const employersList = data.users || data.data || [];
      
      // Process employers to extract team limit info
      const processedEmployers = employersList.map(emp => ({
        ...emp,
        teamLimit: emp.teamMemberLimits?.maxTeamMembers || emp.teamLimit || 0,
        currentTeamMembers: emp.teamMemberLimits?.currentTeamMembers || emp.currentTeamMembers || 0,
      }));
      
      setEmployers(processedEmployers);
      setFilteredEmployers(processedEmployers);
      
      // Calculate stats
      const totalTeamMembers = processedEmployers.reduce((sum, emp) => sum + (emp.currentTeamMembers || 0), 0);
      const companies = processedEmployers.filter(emp => 
        emp.employerType === 'company' || (emp.userType === 'company') || (emp.userType === 'employer' && emp.employerType === 'company')
      ).length;
      const consultancies = processedEmployers.filter(emp => 
        emp.employerType === 'consultancy' || (emp.userType === 'consultancy') || (emp.userType === 'employer' && emp.employerType === 'consultancy')
      ).length;
      
      setStats({
        totalEmployers: processedEmployers.length,
        totalTeamMembers,
        companies,
        consultancies,
      });
    } catch (error) {
      console.error('Error fetching employers:', error);
      Alert.alert('Error', 'Failed to fetch employers: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployers();
  };

  const filterEmployers = () => {
    if (!searchQuery) {
      setFilteredEmployers(employers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = employers.filter(emp =>
      emp.firstName?.toLowerCase().includes(query) ||
      emp.lastName?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.companyName?.toLowerCase().includes(query) ||
      (emp.profile?.company?.name || '').toLowerCase().includes(query)
    );
    setFilteredEmployers(filtered);
  };

  const handleEditLimit = (employer) => {
    setSelectedEmployer(employer);
    setNewTeamLimit((employer.teamLimit || 0).toString());
    setEditModalVisible(true);
  };

  const handleUpdateLimit = async () => {
    if (!newTeamLimit || isNaN(newTeamLimit) || parseInt(newTeamLimit) < 0) {
      Alert.alert('Error', 'Please enter a valid team limit (0 or greater)');
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/users/${selectedEmployer._id}/team-limit`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ teamLimit: parseInt(newTeamLimit) })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update team limit');
      }

      Alert.alert('Success', 'Team limit updated successfully');
      setEditModalVisible(false);
      setSelectedEmployer(null);
      setNewTeamLimit('');
      fetchEmployers();
    } catch (error) {
      console.error('Error updating team limit:', error);
      Alert.alert('Error', error.message || 'Failed to update team limit');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <AdminLayout
      title="Team Limits"
      activeScreen="AdminTeamLimits"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.headerSection}>
          <View>
            <Text style={dynamicStyles.pageTitle}>Team Limits Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage team size limits for employers</Text>
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={dynamicStyles.loadingText}>Loading employers...</Text>
          </View>
        ) : (
          <>
            <View style={dynamicStyles.statsGrid}>
              <View style={dynamicStyles.statCard}>
                <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="business-outline" size={28} color={colors.primary} />
                </View>
                <Text style={dynamicStyles.statNumber}>{stats.totalEmployers}</Text>
                <Text style={dynamicStyles.statLabel}>Total Employers</Text>
              </View>
              <View style={dynamicStyles.statCard}>
                <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="people-outline" size={28} color={colors.success} />
                </View>
                <Text style={dynamicStyles.statNumber}>{stats.totalTeamMembers}</Text>
                <Text style={dynamicStyles.statLabel}>Total Team Members</Text>
              </View>
              <View style={dynamicStyles.statCard}>
                <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="briefcase-outline" size={28} color="#F59E0B" />
                </View>
                <Text style={dynamicStyles.statNumber}>{stats.companies}</Text>
                <Text style={dynamicStyles.statLabel}>Companies</Text>
              </View>
              <View style={dynamicStyles.statCard}>
                <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="people-circle-outline" size={28} color="#9B59B6" />
                </View>
                <Text style={dynamicStyles.statNumber}>{stats.consultancies}</Text>
                <Text style={dynamicStyles.statLabel}>Consultancies</Text>
              </View>
            </View>

            <View style={dynamicStyles.searchContainer}>
              <Ionicons name="search" size={20} color="#94A3B8" style={dynamicStyles.searchIcon} />
              <TextInput
                style={dynamicStyles.searchInput}
                placeholder="Search by name, email, or company..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={dynamicStyles.clearButton}>
                  <Ionicons name="close-circle" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView 
              style={dynamicStyles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            >
              {filteredEmployers.length === 0 ? (
                <View style={dynamicStyles.emptyState}>
                  <View style={dynamicStyles.emptyStateIconContainer}>
                    <Ionicons name="business-outline" size={64} color={colors.textLight} />
                  </View>
                  <Text style={dynamicStyles.emptyStateText}>No employers found</Text>
                  <Text style={dynamicStyles.emptyStateSubtext}>
                    {searchQuery ? 'Try adjusting your search criteria' : 'Employers will appear here when they register'}
                  </Text>
                </View>
              ) : (
                <View style={dynamicStyles.listWrapper}>
                  {filteredEmployers.map((employer, index) => (
                    <View key={employer._id || employer.id || index} style={dynamicStyles.listItem}>
                      <View style={dynamicStyles.itemContent}>
                        <View style={dynamicStyles.itemHeader}>
                          <View style={dynamicStyles.employerAvatar}>
                            <Ionicons 
                              name={(employer.employerType === 'company' || employer.userType === 'company') ? 'business' : 'people'} 
                              size={24} 
                              color={(employer.employerType === 'company' || employer.userType === 'company') ? colors.primary : '#9B59B6'} 
                            />
                          </View>
                          <View style={dynamicStyles.employerInfo}>
                            <Text style={dynamicStyles.employerName}>
                              {employer.firstName} {employer.lastName}
                            </Text>
                            <Text style={dynamicStyles.employerEmail}>{employer.email}</Text>
                            {employer.companyName && (
                              <Text style={dynamicStyles.employerCompany}>{employer.companyName}</Text>
                            )}
                            {employer.profile?.company?.name && !employer.companyName && (
                              <Text style={dynamicStyles.employerCompany}>{employer.profile.company.name}</Text>
                            )}
                          </View>
                        </View>
                        <View style={dynamicStyles.itemDetails}>
                          <View style={dynamicStyles.detailBadge}>
                            <View style={[
                              dynamicStyles.typeBadge,
                              (employer.employerType === 'company' || employer.userType === 'company') ? dynamicStyles.companyBadge : dynamicStyles.consultancyBadge
                            ]}>
                              <Ionicons 
                                name={(employer.employerType === 'company' || employer.userType === 'company') ? 'briefcase' : 'people-circle'} 
                                size={14} 
                                color={(employer.employerType === 'company' || employer.userType === 'company') ? colors.primary : '#9B59B6'} 
                              />
                              <Text style={[
                                dynamicStyles.typeBadgeText,
                                (employer.employerType === 'consultancy' || employer.userType === 'consultancy') && dynamicStyles.consultancyBadgeText
                              ]}>
                                {(employer.employerType === 'company' || employer.userType === 'company') ? 'Company' : 'Consultancy'}
                              </Text>
                            </View>
                          </View>
                          <View style={dynamicStyles.limitInfo}>
                            <View style={dynamicStyles.limitItem}>
                              <Text style={dynamicStyles.limitLabel}>Limit</Text>
                              <Text style={dynamicStyles.limitNumber}>
                                {employer.teamLimit !== undefined ? employer.teamLimit : 0}
                              </Text>
                            </View>
                            <View style={dynamicStyles.limitDivider} />
                            <View style={dynamicStyles.limitItem}>
                              <Text style={dynamicStyles.limitLabel}>Current</Text>
                              <Text style={[
                                dynamicStyles.currentNumber,
                                (employer.currentTeamMembers || 0) >= (employer.teamLimit || 0) && dynamicStyles.currentNumberWarning
                              ]}>
                                {employer.currentTeamMembers || 0}
                              </Text>
                            </View>
                            {(employer.teamLimit || 0) > 0 && (
                              <>
                                <View style={dynamicStyles.limitDivider} />
                                <View style={dynamicStyles.limitItem}>
                                  <Text style={dynamicStyles.limitLabel}>Remaining</Text>
                                  <Text style={[
                                    dynamicStyles.remainingNumber,
                                    ((employer.teamLimit || 0) - (employer.currentTeamMembers || 0)) <= 0 && dynamicStyles.remainingNumberWarning
                                  ]}>
                                    {(employer.teamLimit || 0) - (employer.currentTeamMembers || 0)}
                                  </Text>
                                </View>
                              </>
                            )}
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={dynamicStyles.editButton}
                        onPress={() => handleEditLimit(employer)}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.white} />
                        <Text style={dynamicStyles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </>
        )}
      </View>

      {/* Edit Team Limit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setEditModalVisible(false);
          setSelectedEmployer(null);
          setNewTeamLimit('');
        }}
      >
        <TouchableOpacity
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setEditModalVisible(false);
            setSelectedEmployer(null);
            setNewTeamLimit('');
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Edit Team Limit</Text>
                <TouchableOpacity
                  style={dynamicStyles.modalCloseButton}
                  onPress={() => {
                    setEditModalVisible(false);
                    setSelectedEmployer(null);
                    setNewTeamLimit('');
                  }}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {selectedEmployer && (
                <View style={dynamicStyles.modalBody}>
                  <View style={dynamicStyles.employerInfoCard}>
                    <View style={dynamicStyles.employerInfoHeader}>
                      <View style={[dynamicStyles.employerAvatarLarge, { backgroundColor: (selectedEmployer.employerType === 'company' || selectedEmployer.userType === 'company') ? '#EFF6FF' : '#F3E8FF' }]}>
                        <Ionicons 
                          name={(selectedEmployer.employerType === 'company' || selectedEmployer.userType === 'company') ? 'business' : 'people'} 
                          size={32} 
                          color={(selectedEmployer.employerType === 'company' || selectedEmployer.userType === 'company') ? colors.primary : '#9B59B6'} 
                        />
                      </View>
                      <View style={dynamicStyles.employerInfoText}>
                        <Text style={dynamicStyles.employerInfoName}>
                          {selectedEmployer.firstName} {selectedEmployer.lastName}
                        </Text>
                        <Text style={dynamicStyles.employerInfoEmail}>{selectedEmployer.email}</Text>
                        {selectedEmployer.companyName && (
                          <Text style={dynamicStyles.employerInfoCompany}>{selectedEmployer.companyName}</Text>
                        )}
                        {selectedEmployer.profile?.company?.name && !selectedEmployer.companyName && (
                          <Text style={dynamicStyles.employerInfoCompany}>{selectedEmployer.profile.company.name}</Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={dynamicStyles.currentInfoBox}>
                    <View style={dynamicStyles.currentInfoItem}>
                      <View style={dynamicStyles.currentInfoIconContainer}>
                        <Ionicons name="shield-outline" size={20} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={dynamicStyles.currentInfoLabel}>Current Limit</Text>
                        <Text style={dynamicStyles.currentInfoValue}>
                          {selectedEmployer.teamLimit !== undefined ? selectedEmployer.teamLimit : 0}
                        </Text>
                      </View>
                    </View>
                    <View style={dynamicStyles.currentInfoDivider} />
                    <View style={dynamicStyles.currentInfoItem}>
                      <View style={[dynamicStyles.currentInfoIconContainer, { backgroundColor: '#ECFDF5' }]}>
                        <Ionicons name="people-outline" size={20} color={colors.success} />
                      </View>
                      <View>
                        <Text style={dynamicStyles.currentInfoLabel}>Active Members</Text>
                        <Text style={[dynamicStyles.currentInfoValue, { color: colors.success }]}>
                          {selectedEmployer.currentTeamMembers || 0}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputLabel}>
                      New Team Limit <Text style={dynamicStyles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={dynamicStyles.input}
                      value={newTeamLimit}
                      onChangeText={setNewTeamLimit}
                      keyboardType="numeric"
                      placeholder="Enter team limit"
                      placeholderTextColor="#94A3B8"
                    />
                    <Text style={dynamicStyles.inputHint}>
                      Set how many team members this employer can have (0 = unlimited)
                    </Text>
                  </View>

                  <View style={dynamicStyles.modalActions}>
                    <TouchableOpacity
                      style={[dynamicStyles.modalButton, dynamicStyles.cancelButton]}
                      onPress={() => {
                        setEditModalVisible(false);
                        setSelectedEmployer(null);
                        setNewTeamLimit('');
                      }}
                    >
                      <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[dynamicStyles.modalButton, dynamicStyles.saveButton]}
                      onPress={handleUpdateLimit}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Text style={dynamicStyles.saveButtonText}>Update Limit</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: isMobile ? 12 : isTablet ? 16 : 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? spacing.md : spacing.xl,
    minHeight: 400,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: isMobile ? 13 : isTablet ? 14 : 15,
  },
  headerSection: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'flex-start',
    marginBottom: isMobile ? spacing.lg : spacing.xl,
    paddingBottom: isMobile ? spacing.md : spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    gap: isMobile ? spacing.md : 0,
  },
  pageTitle: {
    ...typography.h3,
    color: '#1A202C',
    marginBottom: spacing.xs,
    fontWeight: '700',
    fontSize: isMobile ? 22 : isTablet ? 26 : 28,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    ...typography.body2,
    color: '#64748B',
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md + 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statNumber: {
    ...typography.h4,
    color: '#1A202C',
    fontWeight: '800',
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.body2,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg + 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...shadows.sm,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing.md,
    color: '#94A3B8',
    fontSize: 22,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    ...typography.body1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '400',
  },
  clearButton: {
    padding: spacing.xs,
  },
  listContainer: {
    flex: 1,
  },
  listWrapper: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg + 2,
    padding: spacing.md,
    borderWidth: 0,
    ...shadows.md,
    elevation: 3,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.xs,
    elevation: 1,
  },
  itemContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  employerAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md + 4,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  employerInfo: {
    flex: 1,
  },
  employerName: {
    ...typography.body1,
    color: '#1A202C',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: spacing.xs - 2,
    letterSpacing: -0.2,
  },
  employerEmail: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 13,
    marginBottom: spacing.xs - 2,
  },
  employerCompany: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  detailBadge: {
    marginRight: spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.sm + 2,
    gap: spacing.xs,
    borderWidth: 1.5,
  },
  companyBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  consultancyBadge: {
    backgroundColor: '#F3E8FF',
    borderColor: '#E9D5FF',
  },
  typeBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  consultancyBadgeText: {
    color: '#9B59B6',
  },
  limitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  limitItem: {
    alignItems: 'center',
  },
  limitLabel: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs - 2,
  },
  limitNumber: {
    ...typography.body1,
    color: '#1A202C',
    fontWeight: '800',
    fontSize: 18,
  },
  currentNumber: {
    ...typography.body1,
    color: colors.success,
    fontWeight: '800',
    fontSize: 18,
  },
  currentNumberWarning: {
    color: colors.error,
  },
  remainingNumber: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  remainingNumberWarning: {
    color: colors.error,
  },
  limitDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md + 4,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    ...shadows.sm,
    elevation: 2,
  },
  editButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyState: {
    paddingVertical: spacing.xxl * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg + 2,
    ...shadows.md,
    elevation: 3,
  },
  emptyStateIconContainer: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.full,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    ...typography.h5,
    color: '#1A202C',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontWeight: '700',
    fontSize: 20,
  },
  emptyStateSubtext: {
    ...typography.body2,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg + 8,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl + 16,
    padding: 0,
    width: '100%',
    maxWidth: 680,
    maxHeight: '90%',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 25,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl + 16,
    borderTopRightRadius: borderRadius.xl + 16,
    paddingHorizontal: spacing.xl + 20,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.lg + 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalTitle: {
    ...typography.h4,
    color: '#0F172A',
    marginBottom: 0,
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: -0.3,
  },
  modalBody: {
    padding: spacing.xl + 20,
    maxHeight: '60vh',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      maxHeight: 'calc(85vh - 200px)',
    }),
  },
  employerInfoCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  employerInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employerAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md + 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  employerInfoText: {
    flex: 1,
  },
  employerInfoName: {
    ...typography.h5,
    color: '#1A202C',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  employerInfoEmail: {
    ...typography.body2,
    color: '#64748B',
    fontSize: 14,
    marginBottom: spacing.xs - 2,
  },
  employerInfoCompany: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 13,
    fontStyle: 'italic',
  },
  currentInfoBox: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...shadows.sm,
    elevation: 2,
  },
  currentInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currentInfoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentInfoDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#E2E8F0',
  },
  currentInfoLabel: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs - 2,
  },
  currentInfoValue: {
    ...typography.h5,
    color: colors.primary,
    fontWeight: '800',
    fontSize: 24,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.body2,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: spacing.md,
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  requiredStar: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 14,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.md + 4,
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.lg + 4,
    ...typography.body1,
    color: '#0F172A',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
    elevation: 2,
    fontWeight: '500',
  },
  inputHint: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 12,
    marginTop: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md + 6,
    borderRadius: borderRadius.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  cancelButtonText: {
    ...typography.button,
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  saveButton: {
    backgroundColor: colors.primary,
    ...shadows.md,
    elevation: 4,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default AdminTeamLimitsScreen;
