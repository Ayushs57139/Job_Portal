import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal, Linking } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminKYCManagementScreen = ({ navigation }) => {
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
      <View style={styles.documentItem} key={docName}>
        <View style={styles.documentHeader}>
          <Ionicons name="document-text" size={20} color="#4A90E2" />
          <Text style={styles.documentName}>{docName}</Text>
        </View>
        {doc.idNumber && (
          <Text style={styles.documentId}>ID: {doc.idNumber}</Text>
        )}
        {doc.documentUrl ? (
          <TouchableOpacity
            style={styles.viewDocButton}
            onPress={() => handleOpenDocument(doc.documentUrl)}
          >
            <Ionicons name="eye" size={16} color="#4A90E2" />
            <Text style={styles.viewDocButtonText}>View Document</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noDocText}>No document uploaded</Text>
        )}
        {doc.uploadedAt && (
          <Text style={styles.uploadDate}>
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
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>KYC Management</Text>
            <Text style={styles.pageSubtitle}>Manage Know Your Customer documents and verifications</Text>
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="documents" size={24} color="#4A90E2" />
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total KYC</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#F39C12" />
              <Text style={styles.statNumber}>{stats.submitted + stats.under_review}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
              <Text style={styles.statNumber}>{stats.verified}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="close-circle" size={24} color="#E74C3C" />
              <Text style={styles.statNumber}>{stats.rejected}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
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

          {/* Filter Chips - Status */}
          <View style={styles.filtersSection}>
            <Text style={styles.filtersLabel}>Status:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
              {['all', 'submitted', 'under_review', 'verified', 'rejected'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[styles.filterChipText, selectedStatus === status && styles.filterChipTextActive]}>
                    {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filter Chips - User Type */}
          <View style={styles.filtersSection}>
            <Text style={styles.filtersLabel}>User Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
              {['all', 'company', 'consultancy', 'individual', 'freelancer'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterChip, selectedUserType === type && styles.filterChipActive]}
                  onPress={() => setSelectedUserType(type)}
                >
                  <Text style={[styles.filterChipText, selectedUserType === type && styles.filterChipTextActive]}>
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Results */}
          <View style={styles.resultsSection}>
            <Text style={styles.resultsText}>
              Showing {filteredKycs.length} {filteredKycs.length === 1 ? 'submission' : 'submissions'}
            </Text>
          </View>

          {/* KYC List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.loadingText}>Loading KYC submissions...</Text>
            </View>
          ) : filteredKycs.length > 0 ? (
            filteredKycs.map((kyc, index) => (
              <View key={kyc._id || index} style={styles.kycCard}>
                <View style={styles.kycHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {kyc.user?.firstName} {kyc.user?.lastName}
                    </Text>
                    <Text style={styles.userEmail}>{kyc.user?.email}</Text>
                    {kyc.user?.companyName && (
                      <Text style={styles.companyName}>
                        <Ionicons name="business" size={14} color="#666" /> {kyc.user?.companyName}
                      </Text>
                    )}
                  </View>
                  <View style={styles.badges}>
                    <View style={[styles.typeBadge]}>
                      <Text style={styles.typeBadgeText}>{kyc.userType}</Text>
                    </View>
                    <View style={[styles.statusBadge, styles[`${kyc.submissionStatus}Badge`]]}>
                      <Text style={styles.statusBadgeText}>{kyc.submissionStatus.replace('_', ' ')}</Text>
                    </View>
                  </View>
                </View>

                {kyc.companyType && (
                  <View style={styles.companyTypeSection}>
                    <Ionicons name="briefcase" size={16} color="#666" />
                    <Text style={styles.companyTypeText}>{kyc.companyType}</Text>
                  </View>
                )}

                <View style={styles.kycMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar" size={16} color="#999" />
                    <Text style={styles.metaText}>
                      Submitted: {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                  {kyc.reviewedAt && (
                    <View style={styles.metaItem}>
                      <Ionicons name="checkmark-done" size={16} color="#999" />
                      <Text style={styles.metaText}>
                        Reviewed: {new Date(kyc.reviewedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={() => handleViewDetails(kyc)}
                >
                  <Ionicons name="eye" size={20} color="#FFF" />
                  <Text style={styles.viewDetailsButtonText}>View Details & Documents</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>No KYC submissions found</Text>
              <Text style={styles.emptyStateSubtext}>
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
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>KYC Details</Text>
                <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>

              {selectedKyc && (
                <>
                  {/* User Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>User Information</Text>
                    <Text style={styles.sectionText}>
                      Name: {selectedKyc.user?.firstName} {selectedKyc.user?.lastName}
                    </Text>
                    <Text style={styles.sectionText}>Email: {selectedKyc.user?.email}</Text>
                    {selectedKyc.user?.companyName && (
                      <Text style={styles.sectionText}>Company: {selectedKyc.user?.companyName}</Text>
                    )}
                    <Text style={styles.sectionText}>Type: {selectedKyc.userType}</Text>
                    {selectedKyc.companyType && (
                      <Text style={styles.sectionText}>Company Type: {selectedKyc.companyType}</Text>
                    )}
                  </View>

                  {/* Documents */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Submitted Documents</Text>
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
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Admin Notes</Text>
                    <TextInput
                      style={styles.textArea}
                      value={adminNotes}
                      onChangeText={setAdminNotes}
                      placeholder="Add notes about this KYC submission..."
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  {/* Rejection Reason (if rejecting) */}
                  {selectedKyc.submissionStatus !== 'verified' && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Rejection Reason (if rejecting)</Text>
                      <TextInput
                        style={styles.textArea}
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
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.reviewButton]}
                        onPress={() => handleUpdateStatus('under_review')}
                      >
                        <Ionicons name="time" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Mark Under Review</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.verifyButton]}
                        onPress={() => handleUpdateStatus('verified')}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Verify KYC</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleUpdateStatus('rejected')}
                      >
                        <Ionicons name="close-circle" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Reject KYC</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 40,
    marginBottom: 40,
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
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

export default AdminKYCManagementScreen;

