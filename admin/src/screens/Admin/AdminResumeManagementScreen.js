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
  Linking,
  Platform as RNPlatform
} from 'react-native';

// Safely assign Platform with fallback to prevent runtime errors
let Platform;
try {
  Platform = (typeof RNPlatform !== 'undefined' && RNPlatform && typeof RNPlatform.OS !== 'undefined') 
    ? RNPlatform 
    : { OS: 'android' };
} catch (e) {
  Platform = { OS: 'android' };
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';
import { handleApiError, showError, safeAsyncStorage } from '../../utils/errorHandler';

const AdminResumeManagementScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  
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

      const token = await safeAsyncStorage.getItem('adminToken');
      if (!token) {
        showError('Please login again', 'Authentication Required');
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

      // Add timeout and error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(`${API_URL}/bulk-import-export/resumes?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }

          // Handle authentication errors
          if (response.status === 401 || response.status === 403) {
            await safeAsyncStorage.removeItem('adminToken');
            showError('Session expired. Please login again.', 'Authentication Required');
            navigation.replace('AdminLogin');
            return;
          }

          throw new Error(errorData.message || `Failed to fetch resumes: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setResumes(data.data?.profiles || []);
          setPagination(data.data?.pagination || { current: 1, pages: 1, total: 0, limit: 10 });
          setStats(data.data?.stats || { total: 0, complete: 0, verified: 0, recent: 0 });
        } else {
          throw new Error(data.message || 'Failed to fetch resumes');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout. Please check your connection and try again.');
        }
        throw fetchError;
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'fetchResumes');
      showError(errorMessage, 'Error Loading Resumes');
      
      // Set empty state on error
      setResumes([]);
      setStats({ total: 0, complete: 0, verified: 0, recent: 0 });
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
      const token = await safeAsyncStorage.getItem('adminToken');
      if (!token) {
        showError('Please login again', 'Authentication Required');
        navigation.replace('AdminLogin');
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
            onPress: async () => {
              try {
                const canOpen = await Linking.canOpenURL(exportUrl);
                if (canOpen) {
                  await Linking.openURL(exportUrl);
                } else {
                  showError('Cannot open export URL. Please check your browser settings.', 'Export Error');
                }
              } catch (linkError) {
                handleApiError(linkError, 'handleExport');
                showError('Failed to open export URL. Please try again.', 'Export Error');
              }
            }
          }
        ]
      );
    } catch (error) {
      const errorMessage = handleApiError(error, 'handleExport');
      showError(errorMessage, 'Export Error');
    }
  };

  const handleContactCandidate = async (profile, type) => {
    try {
      const email = profile.personalInfo?.email || profile.userId?.email;
      const phone = profile.personalInfo?.mobileNumber || profile.personalInfo?.phone;

      if (type === 'email' && email) {
        const mailtoUrl = `mailto:${email}`;
        const canOpen = await Linking.canOpenURL(mailtoUrl);
        if (canOpen) {
          await Linking.openURL(mailtoUrl);
        } else {
          showError('Cannot open email client. Please check your device settings.', 'Contact Error');
        }
      } else if (type === 'phone' && phone) {
        const telUrl = `tel:${phone}`;
        const canOpen = await Linking.canOpenURL(telUrl);
        if (canOpen) {
          await Linking.openURL(telUrl);
        } else {
          showError('Cannot make phone call. Please check your device settings.', 'Contact Error');
        }
      } else if (type === 'whatsapp' && phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}`;
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          showError('WhatsApp is not installed or cannot be opened.', 'Contact Error');
        }
      } else {
        showError(`${type} not available for this candidate`, 'Contact Error');
      }
    } catch (error) {
      handleApiError(error, 'handleContactCandidate');
      showError('Failed to open contact method. Please try again.', 'Contact Error');
    }
  };

  const renderStatCard = (title, value, icon, color) => (
    <View style={[dynamicStyles.statCard, { borderLeftColor: color }]}>
      <View style={[dynamicStyles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={dynamicStyles.statContent}>
        <Text style={dynamicStyles.statValue}>{value}</Text>
        <Text style={dynamicStyles.statTitle}>{title}</Text>
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
      <View key={profile._id} style={dynamicStyles.resumeCard}>
        {/* Header */}
        <View style={dynamicStyles.resumeHeader}>
          <View style={dynamicStyles.resumeHeaderLeft}>
            <View style={dynamicStyles.avatarContainer}>
              <Text style={dynamicStyles.avatarText}>
                {fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={dynamicStyles.resumeHeaderInfo}>
              <Text style={dynamicStyles.resumeName}>{fullName}</Text>
              <Text style={dynamicStyles.resumeJobTitle}>{currentJobTitle}</Text>
            </View>
          </View>
          <View style={dynamicStyles.statusBadges}>
            {isVerified && (
              <View style={[dynamicStyles.badge, dynamicStyles.verifiedBadge]}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                <Text style={dynamicStyles.verifiedBadgeText}>Verified</Text>
              </View>
            )}
            {isComplete && (
              <View style={[dynamicStyles.badge, dynamicStyles.completeBadge]}>
                <Ionicons name="checkmark-done" size={12} color="#3B82F6" />
                <Text style={dynamicStyles.completeBadgeText}>Complete</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Info */}
        <View style={dynamicStyles.resumeSection}>
          <View style={dynamicStyles.infoRow}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={dynamicStyles.infoText}>{email}</Text>
          </View>
          <View style={dynamicStyles.infoRow}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={dynamicStyles.infoText}>{phone}</Text>
          </View>
          <View style={dynamicStyles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={dynamicStyles.infoText}>{location}</Text>
          </View>
        </View>

        {/* Professional Info */}
        <View style={dynamicStyles.resumeSection}>
          <View style={dynamicStyles.infoRow}>
            <Ionicons name="briefcase-outline" size={16} color="#666" />
            <Text style={dynamicStyles.infoText}>{currentCompany}</Text>
          </View>
          <View style={dynamicStyles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={dynamicStyles.infoText}>Experience: {experience}</Text>
          </View>
        </View>

        {/* Skills */}
        {skills.length > 0 && (
          <View style={dynamicStyles.skillsSection}>
            <Text style={dynamicStyles.skillsLabel}>Skills:</Text>
            <View style={dynamicStyles.skillsContainer}>
              {skills.slice(0, 5).map((skill, index) => (
                <View key={index} style={dynamicStyles.skillTag}>
                  <Text style={dynamicStyles.skillText}>{skill}</Text>
                </View>
              ))}
              {skills.length > 5 && (
                <View style={dynamicStyles.skillTag}>
                  <Text style={dynamicStyles.skillText}>+{skills.length - 5} more</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={dynamicStyles.resumeActions}>
          <TouchableOpacity 
            style={dynamicStyles.actionButton}
            onPress={() => handleViewDetails(profile)}
          >
            <Ionicons name="eye-outline" size={18} color="#3B82F6" />
            <Text style={dynamicStyles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={dynamicStyles.actionButton}
            onPress={() => handleContactCandidate(profile, 'email')}
          >
            <Ionicons name="mail-outline" size={18} color="#10B981" />
            <Text style={dynamicStyles.actionButtonText}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={dynamicStyles.actionButton}
            onPress={() => handleContactCandidate(profile, 'phone')}
          >
            <Ionicons name="call-outline" size={18} color="#F59E0B" />
            <Text style={dynamicStyles.actionButtonText}>Call</Text>
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
            dynamicStyles.pageButton,
            pagination.current === i && dynamicStyles.pageButtonActive
          ]}
          onPress={() => handlePageChange(i)}
        >
          <Text style={[
            dynamicStyles.pageButtonText,
            pagination.current === i && dynamicStyles.pageButtonTextActive
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={dynamicStyles.paginationContainer}>
        <TouchableOpacity
          style={[dynamicStyles.pageButton, pagination.current === 1 && dynamicStyles.pageButtonDisabled]}
          onPress={() => handlePageChange(pagination.current - 1)}
          disabled={pagination.current === 1}
        >
          <Ionicons name="chevron-back" size={20} color={pagination.current === 1 ? '#ccc' : '#333'} />
        </TouchableOpacity>

        {startPage > 1 && (
          <>
            <TouchableOpacity style={dynamicStyles.pageButton} onPress={() => handlePageChange(1)}>
              <Text style={dynamicStyles.pageButtonText}>1</Text>
            </TouchableOpacity>
            {startPage > 2 && <Text style={dynamicStyles.ellipsis}>...</Text>}
          </>
        )}

        {pages}

        {endPage < pagination.pages && (
          <>
            {endPage < pagination.pages - 1 && <Text style={dynamicStyles.ellipsis}>...</Text>}
            <TouchableOpacity style={dynamicStyles.pageButton} onPress={() => handlePageChange(pagination.pages)}>
              <Text style={dynamicStyles.pageButtonText}>{pagination.pages}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[dynamicStyles.pageButton, pagination.current === pagination.pages && dynamicStyles.pageButtonDisabled]}
          onPress={() => handlePageChange(pagination.current + 1)}
          disabled={pagination.current === pagination.pages}
        >
          <Ionicons name="chevron-forward" size={20} color={pagination.current === pagination.pages ? '#ccc' : '#333'} />
        </TouchableOpacity>

        <Text style={dynamicStyles.paginationInfo}>
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
      <View style={dynamicStyles.modalOverlay}>
        <View style={dynamicStyles.modalContent}>
          <View style={dynamicStyles.modalHeader}>
            <Text style={dynamicStyles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={dynamicStyles.modalBody}>
            {/* Status Filter */}
            <View style={dynamicStyles.filterSection}>
              <Text style={dynamicStyles.filterLabel}>Profile Status</Text>
              <View style={dynamicStyles.filterOptions}>
                {['all', 'complete', 'incomplete', 'verified', 'unverified'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      dynamicStyles.filterOption,
                      statusFilter === status && dynamicStyles.filterOptionActive
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text style={[
                      dynamicStyles.filterOptionText,
                      statusFilter === status && dynamicStyles.filterOptionTextActive
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience Filter */}
            <View style={dynamicStyles.filterSection}>
              <Text style={dynamicStyles.filterLabel}>Experience Level</Text>
              <View style={dynamicStyles.filterOptions}>
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
                      dynamicStyles.filterOption,
                      experienceFilter === exp.value && dynamicStyles.filterOptionActive
                    ]}
                    onPress={() => setExperienceFilter(exp.value)}
                  >
                    <Text style={[
                      dynamicStyles.filterOptionText,
                      experienceFilter === exp.value && dynamicStyles.filterOptionTextActive
                    ]}>
                      {exp.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={dynamicStyles.modalFooter}>
            <TouchableOpacity
              style={dynamicStyles.resetButton}
              onPress={() => {
                setStatusFilter('all');
                setExperienceFilter('all');
                setSearchQuery('');
              }}
            >
              <Text style={dynamicStyles.resetButtonText}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.applyButton}
              onPress={() => {
                setShowFilters(false);
                setPagination(prev => ({ ...prev, current: 1 }));
                fetchResumes();
              }}
            >
              <Text style={dynamicStyles.applyButtonText}>Apply Filters</Text>
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
        style={dynamicStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.pageTitle}>Resume Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage and view all candidate resumes</Text>
          </View>
          <TouchableOpacity style={dynamicStyles.exportButton} onPress={handleExport}>
            <Ionicons name="download-outline" size={20} color="#FFF" />
            <Text style={dynamicStyles.exportButtonText}>Export CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={dynamicStyles.statsContainer}>
          {renderStatCard('Total Resumes', stats.total, 'documents-outline', '#3B82F6')}
          {renderStatCard('Complete Profiles', stats.complete, 'checkmark-done-outline', '#10B981')}
          {renderStatCard('Verified', stats.verified, 'shield-checkmark-outline', '#8B5CF6')}
          {renderStatCard('Recent (7 days)', stats.recent, 'time-outline', '#F59E0B')}
        </View>

        {/* Search and Filters */}
        <View style={dynamicStyles.searchContainer}>
          <View style={dynamicStyles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={dynamicStyles.searchIcon} />
            <TextInput
              style={dynamicStyles.searchInput}
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
          
          <TouchableOpacity style={dynamicStyles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              dynamicStyles.filterButton,
              (statusFilter !== 'all' || experienceFilter !== 'all') && dynamicStyles.filterButtonActive
            ]} 
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {(statusFilter !== 'all' || experienceFilter !== 'all') && (
          <View style={dynamicStyles.activeFilters}>
            <Text style={dynamicStyles.activeFiltersLabel}>Active Filters:</Text>
            {statusFilter !== 'all' && (
              <View style={dynamicStyles.activeFilterTag}>
                <Text style={dynamicStyles.activeFilterText}>
                  Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Text>
                <TouchableOpacity onPress={() => setStatusFilter('all')}>
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            {experienceFilter !== 'all' && (
              <View style={dynamicStyles.activeFilterTag}>
                <Text style={dynamicStyles.activeFilterText}>Experience: {experienceFilter}</Text>
                <TouchableOpacity onPress={() => setExperienceFilter('all')}>
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Loading State */}
        {loading && !refreshing ? (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={dynamicStyles.loadingText}>Loading resumes...</Text>
          </View>
        ) : (
          <>
            {/* Resume List */}
            {resumes.length > 0 ? (
              <>
                <View style={dynamicStyles.resultsHeader}>
                  <Text style={dynamicStyles.resultsCount}>
                    {pagination.total} resume{pagination.total !== 1 ? 's' : ''} found
                  </Text>
                </View>
                {resumes.map(renderResumeCard)}
                
                {/* Pagination */}
                {pagination.pages > 1 && renderPagination()}
              </>
            ) : (
              <View style={dynamicStyles.emptyContainer}>
                <Ionicons name="document-outline" size={64} color="#ccc" />
                <Text style={dynamicStyles.emptyTitle}>No Resumes Found</Text>
                <Text style={dynamicStyles.emptyText}>
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

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    padding: isMobile ? 12 : isTablet ? 16 : 20,
  },
  header: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'flex-start',
    marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
    gap: isMobile ? 12 : 0,
  },
  pageTitle: {
    fontSize: isMobile ? 22 : isTablet ? 26 : 28,
    fontWeight: 'bold',
    color: '#333',
  },
  pageSubtitle: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#666',
    marginTop: 4,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: isMobile ? 12 : isTablet ? 14 : 16,
    paddingVertical: isMobile ? 8 : isTablet ? 9 : 10,
    borderRadius: 8,
    gap: isMobile ? 6 : 8,
    alignSelf: isMobile ? 'stretch' : 'auto',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#059669',
        transform: 'translateY(-1px)',
      },
    }),
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '600',
  },

  // Statistics Cards
  statsContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    gap: isMobile ? 10 : 12,
    marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
  },
  statCard: {
    flex: isMobile ? 1 : 1,
    minWidth: isMobile ? '100%' : 200,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 12 : isTablet ? 14 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }),
  },
  statIconContainer: {
    width: isMobile ? 40 : isTablet ? 44 : 48,
    height: isMobile ? 40 : isTablet ? 44 : 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isMobile ? 10 : 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: isMobile ? 20 : isTablet ? 22 : 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: isMobile ? 11 : isTablet ? 11.5 : 12,
    color: '#666',
    marginTop: 2,
  },

  // Search and Filters
  searchContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 8 : 12,
    marginBottom: isMobile ? 12 : isTablet ? 14 : 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: isMobile ? 10 : 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: isMobile ? 6 : 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: isMobile ? 10 : 12,
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#333',
    ...(Platform.OS === 'web' && {
      outline: 'none',
    }),
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: isMobile ? 12 : isTablet ? 14 : 16,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#2563EB',
      },
    }),
  },
  filterButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: isMobile ? 12 : isTablet ? 14 : 16,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#4B5563',
      },
    }),
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
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 5 : 6,
    borderRadius: 16,
    gap: isMobile ? 5 : 6,
  },
  activeFilterText: {
    fontSize: isMobile ? 11 : isTablet ? 11.5 : 12,
    color: '#3B82F6',
    fontWeight: '500',
  },

  // Resume Cards
  resultsHeader: {
    marginBottom: isMobile ? 10 : 12,
  },
  resultsCount: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#666',
    fontWeight: '500',
  },
  resumeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 12 : isTablet ? 14 : 16,
    marginBottom: isMobile ? 10 : 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }),
  },
  resumeHeader: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'flex-start',
    marginBottom: isMobile ? 10 : 12,
    gap: isMobile ? 10 : 0,
  },
  resumeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    width: isMobile ? '100%' : 'auto',
  },
  avatarContainer: {
    width: isMobile ? 40 : isTablet ? 44 : 48,
    height: isMobile ? 40 : isTablet ? 44 : 48,
    borderRadius: isMobile ? 20 : isTablet ? 22 : 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isMobile ? 10 : 12,
  },
  avatarText: {
    fontSize: isMobile ? 18 : isTablet ? 19 : 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  resumeHeaderInfo: {
    flex: 1,
  },
  resumeName: {
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resumeJobTitle: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
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
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#666',
    flex: 1,
  },
  skillsSection: {
    marginBottom: isMobile ? 10 : 12,
  },
  skillsLabel: {
    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: isMobile ? 6 : 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isMobile ? 5 : 6,
  },
  skillTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: isMobile ? 8 : 10,
    paddingVertical: isMobile ? 4 : 5,
    borderRadius: 12,
  },
  skillText: {
    fontSize: isMobile ? 11 : isTablet ? 11.5 : 12,
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
    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
    fontWeight: '600',
    color: '#374151',
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: isMobile ? 6 : 8,
    marginTop: isMobile ? 16 : isTablet ? 18 : 20,
    marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
    paddingHorizontal: isMobile ? 12 : 16,
  },
  pageButton: {
    paddingHorizontal: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 6 : 8,
    borderRadius: 6,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: isMobile ? 36 : 40,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#F9FAFB',
      },
    }),
  },
  pageButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#333',
    fontWeight: '500',
  },
  pageButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  ellipsis: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#666',
    paddingHorizontal: 4,
  },
  paginationInfo: {
    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
    color: '#666',
    marginLeft: isMobile ? 8 : 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    ...(Platform.OS === 'web' && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    }),
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: isMobile ? '85%' : '80%',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.2)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? 16 : isTablet ? 18 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: isMobile ? 18 : isTablet ? 19 : 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: isMobile ? 16 : isTablet ? 18 : 20,
  },
  filterSection: {
    marginBottom: isMobile ? 20 : isTablet ? 22 : 24,
  },
  filterLabel: {
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: isMobile ? 10 : 12,
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
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#666',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: isMobile ? 8 : 12,
    padding: isMobile ? 16 : isTablet ? 18 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  resetButton: {
    flex: 1,
    paddingVertical: isMobile ? 12 : isTablet ? 13 : 14,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E5E7EB',
      },
    }),
  },
  resetButtonText: {
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: isMobile ? 12 : isTablet ? 13 : 14,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#2563EB',
        transform: 'translateY(-1px)',
      },
    }),
  },
  applyButtonText: {
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isMobile ? 40 : isTablet ? 50 : 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isMobile ? 40 : isTablet ? 50 : 60,
  },
  emptyTitle: {
    fontSize: isMobile ? 16 : isTablet ? 17 : 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({});

export default AdminResumeManagementScreen;

