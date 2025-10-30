import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminVerificationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedUserType, selectedStatus, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch all users for verification
      const response = await fetch(`${API_URL}/admin/users?limit=1000`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by user type
    if (selectedUserType !== 'all') {
      filtered = filtered.filter(u => u.userType === selectedUserType);
    }

    // Filter by verification status
    if (selectedStatus === 'verified') {
      filtered = filtered.filter(u => u.isVerified === true);
    } else if (selectedStatus === 'unverified') {
      filtered = filtered.filter(u => !u.isVerified);
    }

    setFilteredUsers(filtered);
  };

  const handleVerify = async (userId, userName) => {
    Alert.alert(
      'Verify User',
      `Are you sure you want to verify ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              const response = await fetch(`${API_URL}/admin/users/${userId}/verify`, {
                method: 'PATCH',
                headers
              });

              if (!response.ok) {
                throw new Error('Failed to verify user');
              }

              Alert.alert('Success', 'User verified successfully');
              fetchUsers();
            } catch (error) {
              console.error('Error verifying user:', error);
              Alert.alert('Error', 'Failed to verify user');
            }
          }
        }
      ]
    );
  };

  const handleUnverify = async (userId, userName) => {
    Alert.alert(
      'Unverify User',
      `Are you sure you want to unverify ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unverify',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              const response = await fetch(`${API_URL}/admin/users/${userId}/unverify`, {
                method: 'PATCH',
                headers
              });

              if (!response.ok) {
                throw new Error('Failed to unverify user');
              }

              Alert.alert('Success', 'User unverified successfully');
              fetchUsers();
            } catch (error) {
              console.error('Error unverifying user:', error);
              Alert.alert('Error', 'Failed to unverify user');
            }
          }
        }
      ]
    );
  };

  const getStatsCount = () => {
    return {
      total: users.length,
      verified: users.filter(u => u.isVerified).length,
      unverified: users.filter(u => !u.isVerified).length,
      jobseekers: users.filter(u => u.userType === 'jobseeker').length,
      companies: users.filter(u => u.userType === 'company').length,
      consultancies: users.filter(u => u.userType === 'consultancy').length,
    };
  };

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const stats = getStatsCount();

  return (
    <AdminLayout
      title="Verification"
      activeScreen="AdminVerification"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>User Verification Management</Text>
            <Text style={styles.pageSubtitle}>Verify users to allow them to access the platform</Text>
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#4A90E2" />
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
              <Text style={styles.statNumber}>{stats.verified}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="alert-circle" size={24} color="#F39C12" />
              <Text style={styles.statNumber}>{stats.unverified}</Text>
              <Text style={styles.statLabel}>Unverified</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filtersSection}>
            <Text style={styles.filtersLabel}>User Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedUserType === 'all' && styles.filterChipActive]}
                onPress={() => setSelectedUserType('all')}
              >
                <Text style={[styles.filterChipText, selectedUserType === 'all' && styles.filterChipTextActive]}>
                  All ({stats.total})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, selectedUserType === 'jobseeker' && styles.filterChipActive]}
                onPress={() => setSelectedUserType('jobseeker')}
              >
                <Text style={[styles.filterChipText, selectedUserType === 'jobseeker' && styles.filterChipTextActive]}>
                  Job Seekers ({stats.jobseekers})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, selectedUserType === 'company' && styles.filterChipActive]}
                onPress={() => setSelectedUserType('company')}
              >
                <Text style={[styles.filterChipText, selectedUserType === 'company' && styles.filterChipTextActive]}>
                  Companies ({stats.companies})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, selectedUserType === 'consultancy' && styles.filterChipActive]}
                onPress={() => setSelectedUserType('consultancy')}
              >
                <Text style={[styles.filterChipText, selectedUserType === 'consultancy' && styles.filterChipTextActive]}>
                  Consultancies ({stats.consultancies})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.filtersSection}>
            <Text style={styles.filtersLabel}>Verification Status:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedStatus === 'all' && styles.filterChipActive]}
                onPress={() => setSelectedStatus('all')}
              >
                <Text style={[styles.filterChipText, selectedStatus === 'all' && styles.filterChipTextActive]}>
                  All ({stats.total})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, selectedStatus === 'verified' && styles.filterChipActive]}
                onPress={() => setSelectedStatus('verified')}
              >
                <Text style={[styles.filterChipText, selectedStatus === 'verified' && styles.filterChipTextActive]}>
                  Verified ({stats.verified})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, selectedStatus === 'unverified' && styles.filterChipActive]}
                onPress={() => setSelectedStatus('unverified')}
              >
                <Text style={[styles.filterChipText, selectedStatus === 'unverified' && styles.filterChipTextActive]}>
                  Unverified ({stats.unverified})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Users List */}
          <View style={styles.resultsSection}>
            <Text style={styles.resultsText}>
              Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((u, index) => (
              <View key={u._id || index} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {u.firstName} {u.lastName}
                    </Text>
                    <Text style={styles.userEmail}>{u.email}</Text>
                    {u.companyName && (
                      <Text style={styles.companyName}>
                        <Ionicons name="business" size={14} color="#666" /> {u.companyName}
                      </Text>
                    )}
                  </View>
                  <View style={styles.badges}>
                    <View style={[styles.typeBadge, styles[`${u.userType}Badge`]]}>
                      <Text style={styles.typeBadgeText}>
                        {u.userType === 'jobseeker' ? 'Job Seeker' : u.userType === 'company' ? 'Company' : 'Consultancy'}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      u.isVerified ? styles.verifiedBadge : styles.unverifiedBadge
                    ]}>
                      <Ionicons 
                        name={u.isVerified ? "checkmark-circle" : "alert-circle"} 
                        size={16} 
                        color={u.isVerified ? "#27AE60" : "#F39C12"} 
                      />
                      <Text style={styles.statusText}>{u.isVerified ? 'Verified' : 'Unverified'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.userMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar" size={16} color="#999" />
                    <Text style={styles.metaText}>
                      Joined: {new Date(u.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {u.verifiedAt && (
                    <View style={styles.metaItem}>
                      <Ionicons name="checkmark-done" size={16} color="#999" />
                      <Text style={styles.metaText}>
                        Verified: {new Date(u.verifiedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.actions}>
                  {u.isVerified ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.unverifyButton]}
                      onPress={() => handleUnverify(u._id, `${u.firstName} ${u.lastName}`)}
                    >
                      <Ionicons name="close-circle" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Unverify</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.verifyButton]}
                      onPress={() => handleVerify(u._id, `${u.firstName} ${u.lastName}`)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Verify User</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>No users found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try adjusting your search or filters' : 'No users to display'}
              </Text>
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
  headerSection: {
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
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filtersSection: {
    marginBottom: 15,
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filtersScroll: {
    marginBottom: 5,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  resultsSection: {
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  companyName: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  badges: {
    alignItems: 'flex-end',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  jobseekerBadge: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  companyBadge: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
  },
  consultancyBadge: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A90E2',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  unverifiedBadge: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  userMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  verifyButton: {
    backgroundColor: '#27AE60',
  },
  unverifyButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});

export default AdminVerificationScreen;

