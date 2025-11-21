import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal, Linking, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

const AdminKYCManagementScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const [loading, setLoading] = useState(true);
  const [kycs, setKycs] = useState([]);
  const [filteredKycs, setFilteredKycs] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchKYCs();
  }, []);

  useEffect(() => {
    filterKYCs();
  }, [searchQuery, selectedStatus, selectedUserType, kycs]);

  const fetchKYCs = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/kyc`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch KYC submissions');
      }
      
      const data = await response.json();
      setKycs(data.kycs || []);
      setFilteredKycs(data.kycs || []);
    } catch (error) {
      console.error('Error fetching KYCs:', error);
      Alert.alert('Error', 'Failed to fetch KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const filterKYCs = () => {
    let filtered = [...kycs];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(kyc =>
        kyc.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kyc.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kyc.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kyc.user?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(kyc => kyc.submissionStatus === selectedStatus);
    }

    // Filter by user type
    if (selectedUserType !== 'all') {
      filtered = filtered.filter(kyc => kyc.userType === selectedUserType);
    }

    setFilteredKycs(filtered);
  };

  const getStatsCount = () => {
    return {
      total: kycs.length,
      submitted: kycs.filter(k => k.submissionStatus === 'submitted').length,
      under_review: kycs.filter(k => k.submissionStatus === 'under_review').length,
      verified: kycs.filter(k => k.submissionStatus === 'verified').length,
      rejected: kycs.filter(k => k.submissionStatus === 'rejected').length,
    };
  };

  const handleViewDetails = (kyc) => {
    setSelectedKyc(kyc);
    setAdminNotes(kyc.adminNotes || '');
    setRejectionReason(kyc.rejectionReason || '');
    setDetailsModalVisible(true);
  };

  const handleUpdateStatus = async (status) => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/kyc/${selectedKyc._id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status,
          adminNotes,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update KYC status');
      }

      Alert.alert('Success', `KYC ${status} successfully`);
      setDetailsModalVisible(false);
      fetchKYCs();
    } catch (error) {
      console.error('Error updating KYC status:', error);
      Alert.alert('Error', 'Failed to update KYC status');
    }
  };

  const handleOpenDocument = (url) => {
    if (url) {
      // Construct full URL
      const baseUrl = API_URL.replace('/api', '');
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      
      Linking.openURL(fullUrl).catch(err => {
        Alert.alert('Error', 'Could not open document');
      });
    } else {
      Alert.alert('Error', 'Document not uploaded');
    }
  };

  const renderDocument = (docName, doc) => {
    if (!doc || (!doc.idNumber && !doc.documentUrl)) {
      return null;
    }

    return (
      <View style={dynamicStyles.documentItem} key={docName}>
        <View style={dynamicStyles.documentHeader}>
          <Ionicons name="document-text" size={20} color="#4A90E2" />
          <Text style={dynamicStyles.documentName}>{docName}</Text>
        </View>
        {doc.idNumber && (
          <Text style={dynamicStyles.documentId}>ID: {doc.idNumber}</Text>
        )}
        {doc.documentUrl ? (
          <TouchableOpacity
            style={dynamicStyles.viewDocButton}
            onPress={() => handleOpenDocument(doc.documentUrl)}
          >
            <Ionicons name="eye" size={16} color="#4A90E2" />
            <Text style={dynamicStyles.viewDocButtonText}>View Document</Text>
          </TouchableOpacity>
        ) : (
          <Text style={dynamicStyles.noDocText}>No document uploaded</Text>
        )}
        {doc.uploadedAt && (
          <Text style={dynamicStyles.uploadDate}>
            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
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
      title="KYC Management"
      activeScreen="AdminKYC"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.container}>
          <View style={dynamicStyles.headerSection}>
            <Text style={dynamicStyles.pageTitle}>KYC Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage Know Your Customer documents and verifications</Text>
          </View>

          {/* Statistics Cards */}
          <View style={dynamicStyles.statsGrid}>
            <View style={dynamicStyles.statCard}>
              <Ionicons name="documents" size={24} color="#4A90E2" />
              <Text style={dynamicStyles.statNumber}>{stats.total}</Text>
              <Text style={dynamicStyles.statLabel}>Total KYC</Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Ionicons name="time" size={24} color="#F39C12" />
              <Text style={dynamicStyles.statNumber}>{stats.submitted + stats.under_review}</Text>
              <Text style={dynamicStyles.statLabel}>Pending</Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
              <Text style={dynamicStyles.statNumber}>{stats.verified}</Text>
              <Text style={dynamicStyles.statLabel}>Verified</Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Ionicons name="close-circle" size={24} color="#E74C3C" />
              <Text style={dynamicStyles.statNumber}>{stats.rejected}</Text>
              <Text style={dynamicStyles.statLabel}>Rejected</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={dynamicStyles.searchSection}>
            <View style={dynamicStyles.searchBar}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={dynamicStyles.searchInput}
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

          {/* Filter Chips - Status */}
          <View style={dynamicStyles.filtersSection}>
            <Text style={dynamicStyles.filtersLabel}>Status:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.filtersScroll}>
              {['all', 'submitted', 'under_review', 'verified', 'rejected'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[dynamicStyles.filterChip, selectedStatus === status && dynamicStyles.filterChipActive]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[dynamicStyles.filterChipText, selectedStatus === status && dynamicStyles.filterChipTextActive]}>
                    {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filter Chips - User Type */}
          <View style={dynamicStyles.filtersSection}>
            <Text style={dynamicStyles.filtersLabel}>User Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.filtersScroll}>
              {['all', 'company', 'consultancy', 'individual', 'freelancer'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[dynamicStyles.filterChip, selectedUserType === type && dynamicStyles.filterChipActive]}
                  onPress={() => setSelectedUserType(type)}
                >
                  <Text style={[dynamicStyles.filterChipText, selectedUserType === type && dynamicStyles.filterChipTextActive]}>
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Results */}
          <View style={dynamicStyles.resultsSection}>
            <Text style={dynamicStyles.resultsText}>
              Showing {filteredKycs.length} {filteredKycs.length === 1 ? 'submission' : 'submissions'}
            </Text>
          </View>

          {/* KYC List */}
          {loading ? (
            <View style={dynamicStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={dynamicStyles.loadingText}>Loading KYC submissions...</Text>
            </View>
          ) : filteredKycs.length > 0 ? (
            filteredKycs.map((kyc, index) => (
              <View key={kyc._id || index} style={dynamicStyles.kycCard}>
                <View style={dynamicStyles.kycHeader}>
                  <View style={dynamicStyles.userInfo}>
                    <Text style={dynamicStyles.userName}>
                      {kyc.user?.firstName} {kyc.user?.lastName}
                    </Text>
                    <Text style={dynamicStyles.userEmail}>{kyc.user?.email}</Text>
                    {kyc.user?.companyName && (
                      <Text style={dynamicStyles.companyName}>
                        <Ionicons name="business" size={14} color="#666" /> {kyc.user?.companyName}
                      </Text>
                    )}
                  </View>
                  <View style={dynamicStyles.badges}>
                    <View style={[dynamicStyles.typeBadge]}>
                      <Text style={dynamicStyles.typeBadgeText}>{kyc.userType}</Text>
                    </View>
                    <View style={[dynamicStyles.statusBadge, styles[`${kyc.submissionStatus}Badge`]]}>
                      <Text style={dynamicStyles.statusBadgeText}>{kyc.submissionStatus.replace('_', ' ')}</Text>
                    </View>
                  </View>
                </View>

                {kyc.companyType && (
                  <View style={dynamicStyles.companyTypeSection}>
                    <Ionicons name="briefcase" size={16} color="#666" />
                    <Text style={dynamicStyles.companyTypeText}>{kyc.companyType}</Text>
                  </View>
                )}

                <View style={dynamicStyles.kycMeta}>
                  <View style={dynamicStyles.metaItem}>
                    <Ionicons name="calendar" size={16} color="#999" />
                    <Text style={dynamicStyles.metaText}>
                      Submitted: {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                  {kyc.reviewedAt && (
                    <View style={dynamicStyles.metaItem}>
                      <Ionicons name="checkmark-done" size={16} color="#999" />
                      <Text style={dynamicStyles.metaText}>
                        Reviewed: {new Date(kyc.reviewedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={dynamicStyles.viewDetailsButton}
                  onPress={() => handleViewDetails(kyc)}
                >
                  <Ionicons name="eye" size={20} color="#FFF" />
                  <Text style={dynamicStyles.viewDetailsButtonText}>View Details & Documents</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="document-outline" size={64} color="#CCC" />
              <Text style={dynamicStyles.emptyStateText}>No KYC submissions found</Text>
              <Text style={dynamicStyles.emptyStateSubtext}>
                {searchQuery ? 'Try adjusting your search or filters' : 'KYC submissions will appear here'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDetailsModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>KYC Details</Text>
              <TouchableOpacity 
                onPress={() => setDetailsModalVisible(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.modalScrollView} showsVerticalScrollIndicator={false}>

              {selectedKyc && (
                <>
                  {/* User Info */}
                  <View style={dynamicStyles.modalSection}>
                    <Text style={dynamicStyles.sectionTitle}>User Information</Text>
                    <Text style={dynamicStyles.sectionText}>
                      Name: {selectedKyc.user?.firstName} {selectedKyc.user?.lastName}
                    </Text>
                    <Text style={dynamicStyles.sectionText}>Email: {selectedKyc.user?.email}</Text>
                    {selectedKyc.user?.companyName && (
                      <Text style={dynamicStyles.sectionText}>Company: {selectedKyc.user?.companyName}</Text>
                    )}
                    <Text style={dynamicStyles.sectionText}>Type: {selectedKyc.userType}</Text>
                    {selectedKyc.companyType && (
                      <Text style={dynamicStyles.sectionText}>Company Type: {selectedKyc.companyType}</Text>
                    )}
                  </View>

                  {/* Documents */}
                  <View style={dynamicStyles.modalSection}>
                    <Text style={dynamicStyles.sectionTitle}>Submitted Documents</Text>
                    {selectedKyc.documents?.gstCertificate && renderDocument('GST Certificate', selectedKyc.documents.gstCertificate)}
                    {selectedKyc.documents?.certificateOfIncorporation && renderDocument('Certificate Of Incorporation', selectedKyc.documents.certificateOfIncorporation)}
                    {selectedKyc.documents?.udyamMsmeCertificate && renderDocument('UDYAM / MSME Certificate', selectedKyc.documents.udyamMsmeCertificate)}
                    {selectedKyc.documents?.companyPanCard && renderDocument('Company PAN Card', selectedKyc.documents.companyPanCard)}
                    {selectedKyc.documents?.companyIdCard && renderDocument('Company ID Card', selectedKyc.documents.companyIdCard)}
                    {selectedKyc.documents?.aadharCard && renderDocument('Aadhar Card', selectedKyc.documents.aadharCard)}
                    {selectedKyc.documents?.panCard && renderDocument('PAN Card', selectedKyc.documents.panCard)}
                    {selectedKyc.documents?.voterId && renderDocument('Voter ID', selectedKyc.documents.voterId)}
                    {selectedKyc.documents?.otherDocument && renderDocument('Other Document', selectedKyc.documents.otherDocument)}
                    {selectedKyc.documents?.otherIdDocument && renderDocument('Other ID Document', selectedKyc.documents.otherIdDocument)}
                  </View>

                  {/* Admin Notes */}
                  <View style={dynamicStyles.modalSection}>
                    <Text style={dynamicStyles.sectionTitle}>Admin Notes</Text>
                    <TextInput
                      style={dynamicStyles.textArea}
                      value={adminNotes}
                      onChangeText={setAdminNotes}
                      placeholder="Add notes about this KYC submission..."
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  {/* Rejection Reason (if rejecting) */}
                  {selectedKyc.submissionStatus !== 'verified' && (
                    <View style={dynamicStyles.modalSection}>
                      <Text style={dynamicStyles.sectionTitle}>Rejection Reason (if rejecting)</Text>
                      <TextInput
                        style={dynamicStyles.textArea}
                        value={rejectionReason}
                        onChangeText={setRejectionReason}
                        placeholder="Provide reason if rejecting..."
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  )}

                  {/* Action Buttons */}
                  {selectedKyc.submissionStatus !== 'verified' && (
                    <View style={dynamicStyles.actionButtons}>
                      <TouchableOpacity
                        style={[dynamicStyles.actionButton, dynamicStyles.reviewButton]}
                        onPress={() => handleUpdateStatus('under_review')}
                      >
                        <Ionicons name="time" size={20} color="#FFF" />
                        <Text style={dynamicStyles.actionButtonText}>Mark Under Review</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[dynamicStyles.actionButton, dynamicStyles.verifyButton]}
                        onPress={() => handleUpdateStatus('verified')}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        <Text style={dynamicStyles.actionButtonText}>Verify KYC</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[dynamicStyles.actionButton, dynamicStyles.rejectButton]}
                        onPress={() => handleUpdateStatus('rejected')}
                      >
                        <Ionicons name="close-circle" size={20} color="#FFF" />
                        <Text style={dynamicStyles.actionButtonText}>Reject KYC</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    padding: isMobile ? 12 : isTablet ? 16 : 20,
  },
  headerSection: {
    marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
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
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 150,
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
  kycCard: {
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
  kycHeader: {
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
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A90E2',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  submittedBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  under_reviewBadge: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  rejectedBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  draftBadge: {
    backgroundColor: 'rgba(149, 165, 166, 0.1)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  companyTypeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  companyTypeText: {
    fontSize: 14,
    color: '#666',
  },
  kycMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 15,
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
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewDetailsButtonText: {
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
  modalTitle: {
    ...typography.h4,
    color: '#0F172A',
    marginBottom: 0,
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: -0.3,
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
  modalScrollView: {
    padding: spacing.xl + 20,
    maxHeight: '60vh',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      maxHeight: 'calc(85vh - 200px)',
    }),
  },
  modalSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  documentItem: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  documentId: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  viewDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
  },
  viewDocButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  noDocText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  uploadDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 5,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  actionButtons: {
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  reviewButton: {
    backgroundColor: '#F39C12',
  },
  verifyButton: {
    backgroundColor: '#27AE60',
  },
  rejectButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({});

export default AdminKYCManagementScreen;

