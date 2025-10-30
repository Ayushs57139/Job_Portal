import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import { API_URL } from '../../config/api';

const AdminResumeManagementScreen = ({ navigation }) => {
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  // State management
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState({ total: 0, complete: 0, verified: 0, recent: 0 });
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: 10 });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, complete, incomplete, verified, unverified
  const [experienceFilter, setExperienceFilter] = useState('all'); // all, fresher, 0-2, 2-5, 5-10, 10+
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, [pagination.current, statusFilter, experienceFilter]);

  const fetchResumes = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('adminToken');
      if (!token) {
        Alert.alert('Error', 'Please login again');
        navigation.replace('AdminLogin');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (experienceFilter !== 'all') {
        params.append('experience', experienceFilter);
      }

      const response = await fetch(`${API_URL}/bulk-import-export/resumes?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResumes(data.data.profiles || []);
        setPagination(data.data.pagination || { current: 1, pages: 1, total: 0, limit: 10 });
        setStats(data.data.stats || { total: 0, complete: 0, verified: 0, recent: 0 });
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch resumes');
      }
    } catch (error) {
      console.error('Fetch resumes error:', error);
      Alert.alert('Error', 'Failed to fetch resumes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchResumes();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchResumes();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      setPagination(prev => ({ ...prev, current: page }));
    }
  };

  const handleViewDetails = (profile) => {
    if (profile.userId && profile.userId._id) {
      navigation.navigate('AdminCandidateDetails', { candidateId: profile._id });
    } else {
      Alert.alert('Error', 'User details not available');
    }
  };

  const handleExport = async () => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      if (!token) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      // Build query parameters with current filters
      const params = new URLSearchParams();
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (experienceFilter !== 'all') {
        params.append('experience', experienceFilter);
      }

      const exportUrl = `${API_URL}/bulk-import-export/export-resumes?${params.toString()}`;
      
      Alert.alert(
        'Export Resumes',
        'This will download all resumes matching your current filters as a CSV file.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Export',
            onPress: () => {
              Linking.openURL(exportUrl).catch(() => {
                Alert.alert('Error', 'Failed to open export URL');
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export resumes');
    }
  };

  const handleContactCandidate = (profile, type) => {
    const email = profile.personalInfo?.email || profile.userId?.email;
    const phone = profile.personalInfo?.mobileNumber || profile.personalInfo?.phone;

    if (type === 'email' && email) {
      Linking.openURL(`mailto:${email}`);
    } else if (type === 'phone' && phone) {
      Linking.openURL(`tel:${phone}`);
    } else if (type === 'whatsapp' && phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/${cleanPhone}`);
    } else {
      Alert.alert('Error', `${type} not available for this candidate`);
    }
  };

  const renderStatCard = (title, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderResumeCard = (profile) => {
    const fullName = profile.personalInfo?.fullName || 
                     `${profile.userId?.firstName || ''} ${profile.userId?.lastName || ''}`.trim() ||
                     'N/A';
    const email = profile.personalInfo?.email || profile.userId?.email || 'N/A';
    const phone = profile.personalInfo?.mobileNumber || profile.personalInfo?.phone || 'N/A';
    const experience = profile.professional?.experience || 'Not specified';
    const skills = profile.professional?.skills || [];
    const location = profile.personalInfo?.currentCity || 
                     profile.personalInfo?.city || 
                     'Not specified';
    const isComplete = profile.profileStatus?.isComplete;
    const isVerified = profile.profileStatus?.isVerified;
    const currentJobTitle = profile.professional?.currentJobTitle || 'Not specified';
    const currentCompany = profile.professional?.currentCompanyName || 'Not specified';

    return (
      <View key={profile._id} style={styles.resumeCard}>
        {/* Header */}
        <View style={styles.resumeHeader}>
          <View style={styles.resumeHeaderLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.resumeHeaderInfo}>
              <Text style={styles.resumeName}>{fullName}</Text>
              <Text style={styles.resumeJobTitle}>{currentJobTitle}</Text>
            </View>
          </View>
          <View style={styles.statusBadges}>
            {isVerified && (
              <View style={[styles.badge, styles.verifiedBadge]}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            )}
            {isComplete && (
              <View style={[styles.badge, styles.completeBadge]}>
                <Ionicons name="checkmark-done" size={12} color="#3B82F6" />
                <Text style={styles.completeBadgeText}>Complete</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.resumeSection}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{location}</Text>
          </View>
        </View>

        {/* Professional Info */}
        <View style={styles.resumeSection}>
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{currentCompany}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>Experience: {experience}</Text>
          </View>
        </View>

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.skillsLabel}>Skills:</Text>
            <View style={styles.skillsContainer}>
              {skills.slice(0, 5).map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
              {skills.length > 5 && (
                <View style={styles.skillTag}>
                  <Text style={styles.skillText}>+{skills.length - 5} more</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.resumeActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewDetails(profile)}
          >
            <Ionicons name="eye-outline" size={18} color="#3B82F6" />
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleContactCandidate(profile, 'email')}
          >
            <Ionicons name="mail-outline" size={18} color="#10B981" />
            <Text style={styles.actionButtonText}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleContactCandidate(profile, 'phone')}
          >
            <Ionicons name="call-outline" size={18} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, pagination.current - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.pages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.pageButton,
            pagination.current === i && styles.pageButtonActive
          ]}
          onPress={() => handlePageChange(i)}
        >
          <Text style={[
            styles.pageButtonText,
            pagination.current === i && styles.pageButtonTextActive
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.pageButton, pagination.current === 1 && styles.pageButtonDisabled]}
          onPress={() => handlePageChange(pagination.current - 1)}
          disabled={pagination.current === 1}
        >
          <Ionicons name="chevron-back" size={20} color={pagination.current === 1 ? '#ccc' : '#333'} />
        </TouchableOpacity>

        {startPage > 1 && (
          <>
            <TouchableOpacity style={styles.pageButton} onPress={() => handlePageChange(1)}>
              <Text style={styles.pageButtonText}>1</Text>
            </TouchableOpacity>
            {startPage > 2 && <Text style={styles.ellipsis}>...</Text>}
          </>
        )}

        {pages}

        {endPage < pagination.pages && (
          <>
            {endPage < pagination.pages - 1 && <Text style={styles.ellipsis}>...</Text>}
            <TouchableOpacity style={styles.pageButton} onPress={() => handlePageChange(pagination.pages)}>
              <Text style={styles.pageButtonText}>{pagination.pages}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.pageButton, pagination.current === pagination.pages && styles.pageButtonDisabled]}
          onPress={() => handlePageChange(pagination.current + 1)}
          disabled={pagination.current === pagination.pages}
        >
          <Ionicons name="chevron-forward" size={20} color={pagination.current === pagination.pages ? '#ccc' : '#333'} />
        </TouchableOpacity>

        <Text style={styles.paginationInfo}>
          Page {pagination.current} of {pagination.pages} ({pagination.total} total)
        </Text>
      </View>
    );
  };

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Profile Status</Text>
              <View style={styles.filterOptions}>
                {['all', 'complete', 'incomplete', 'verified', 'unverified'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      statusFilter === status && styles.filterOptionActive
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      statusFilter === status && styles.filterOptionTextActive
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Experience Level</Text>
              <View style={styles.filterOptions}>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'fresher', label: 'Fresher' },
                  { value: '0-2', label: '0-2 Years' },
                  { value: '2-5', label: '2-5 Years' },
                  { value: '5-10', label: '5-10 Years' },
                  { value: '10+', label: '10+ Years' }
                ].map((exp) => (
                  <TouchableOpacity
                    key={exp.value}
                    style={[
                      styles.filterOption,
                      experienceFilter === exp.value && styles.filterOptionActive
                    ]}
                    onPress={() => setExperienceFilter(exp.value)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      experienceFilter === exp.value && styles.filterOptionTextActive
                    ]}>
                      {exp.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setStatusFilter('all');
                setExperienceFilter('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetButtonText}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setShowFilters(false);
                setPagination(prev => ({ ...prev, current: 1 }));
                fetchResumes();
              }}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <AdminLayout 
      title="Resume Management" 
      activeScreen="AdminResumeManagement" 
      onNavigate={handleNavigate} 
      onLogout={handleLogout}
    >
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Resume Management</Text>
            <Text style={styles.pageSubtitle}>Manage and view all candidate resumes</Text>
          </View>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Ionicons name="download-outline" size={20} color="#FFF" />
            <Text style={styles.exportButtonText}>Export CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          {renderStatCard('Total Resumes', stats.total, 'documents-outline', '#3B82F6')}
          {renderStatCard('Complete Profiles', stats.complete, 'checkmark-done-outline', '#10B981')}
          {renderStatCard('Verified', stats.verified, 'shield-checkmark-outline', '#8B5CF6')}
          {renderStatCard('Recent (7 days)', stats.recent, 'time-outline', '#F59E0B')}
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, or skills..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                handleSearch();
              }}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterButton,
              (statusFilter !== 'all' || experienceFilter !== 'all') && styles.filterButtonActive
            ]} 
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {(statusFilter !== 'all' || experienceFilter !== 'all') && (
          <View style={styles.activeFilters}>
            <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
            {statusFilter !== 'all' && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>
                  Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Text>
                <TouchableOpacity onPress={() => setStatusFilter('all')}>
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            {experienceFilter !== 'all' && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>Experience: {experienceFilter}</Text>
                <TouchableOpacity onPress={() => setExperienceFilter('all')}>
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Loading State */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading resumes...</Text>
          </View>
        ) : (
          <>
            {/* Resume List */}
            {resumes.length > 0 ? (
              <>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsCount}>
                    {pagination.total} resume{pagination.total !== 1 ? 's' : ''} found
                  </Text>
                </View>
                {resumes.map(renderResumeCard)}
                
                {/* Pagination */}
                {pagination.pages > 1 && renderPagination()}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No Resumes Found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery || statusFilter !== 'all' || experienceFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No resumes have been uploaded yet'}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Filters Modal */}
      {renderFiltersModal()}
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Statistics Cards
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Search and Filters
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#F59E0B',
  },

  // Active Filters
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  activeFiltersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },

  // Resume Cards
  resultsHeader: {
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  resumeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resumeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  resumeHeaderInfo: {
    flex: 1,
  },
  resumeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resumeJobTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadges: {
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
  },
  verifiedBadgeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  completeBadge: {
    backgroundColor: '#DBEAFE',
  },
  completeBadgeText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  resumeSection: {
    marginBottom: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  skillsSection: {
    marginBottom: 12,
  },
  skillsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#374151',
  },
  resumeActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 40,
    alignItems: 'center',
  },
  pageButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  pageButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  ellipsis: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 4,
  },
  paginationInfo: {
    fontSize: 13,
    color: '#666',
    marginLeft: 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AdminResumeManagementScreen;

