import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import api from '../../config/api';

const AdminCompaniesScreen = ({ navigation, route }) => {
  const { type = 'all' } = route.params || {}; // 'all', 'company', 'consultancy'
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState(type);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, [filterType]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterType === 'company') {
        filters.userType = 'company';
      } else if (filterType === 'consultancy') {
        filters.userType = 'consultancy';
      }
      
      // Get all users and filter by employer types
      const response = await api.getUsersForAdmin(filters);
      const allUsers = response.users || response || [];
      
      // Filter to show only companies and consultancies
      const employerUsers = allUsers.filter(user => 
        user.userType === 'company' || user.userType === 'consultancy'
      );
      
      setCompanies(employerUsers);
    } catch (error) {
      console.error('Error loading companies:', error);
      Alert.alert('Error', 'Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCompanies();
  };

  const filteredCompanies = companies.filter(company => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      company.firstName?.toLowerCase().includes(query) ||
      company.lastName?.toLowerCase().includes(query) ||
      company.email?.toLowerCase().includes(query) ||
      company.companyName?.toLowerCase().includes(query) ||
      company.phone?.includes(query)
    );
  });

  const handleCompanyPress = (company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  const handleToggleStatus = async (companyId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    Alert.alert(
      'Confirm Status Change',
      `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this ${filterType === 'consultancy' ? 'consultancy' : 'company'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await api.updateUserStatus(companyId, newStatus);
              Alert.alert('Success', 'Status updated successfully');
              loadCompanies();
              setShowDetailsModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to update status');
            }
          },
        },
      ]
    );
  };

  const handleDeleteCompany = async (companyId) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this ${selectedCompany?.userType}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteUser(companyId);
              Alert.alert('Success', 'Deleted successfully');
              loadCompanies();
              setShowDetailsModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const getTypeIcon = (userType) => {
    return userType === 'consultancy' ? 'people-circle' : 'business';
  };

  const getTypeColor = (userType) => {
    return userType === 'consultancy' ? colors.secondary : colors.success;
  };

  const renderCompanyCard = (company) => (
    <TouchableOpacity
      key={company._id}
      style={styles.companyCard}
      onPress={() => handleCompanyPress(company)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.companyIcon, { backgroundColor: `${getTypeColor(company.userType)}15` }]}>
          <Ionicons name={getTypeIcon(company.userType)} size={24} color={getTypeColor(company.userType)} />
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>
            {company.companyName || `${company.firstName} ${company.lastName}`}
          </Text>
          <Text style={styles.companyEmail}>{company.email}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {company.userType === 'consultancy' ? 'Consultancy' : 'Company'}
            </Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: company.isActive ? colors.success : colors.error }
        ]}>
          <Text style={styles.statusText}>
            {company.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>{company.phone || 'N/A'}</Text>
        </View>
        
        {company.website && (
          <View style={styles.infoRow}>
            <Ionicons name="globe" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>{company.website}</Text>
          </View>
        )}
        
        {company.location && (
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>{company.location}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Registered: {api.formatIndianDate(company.createdAt)}
          </Text>
        </View>

        {company.jobsPosted !== undefined && (
          <View style={styles.infoRow}>
            <Ionicons name="briefcase" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {company.jobsPosted || 0} Job{company.jobsPosted !== 1 ? 's' : ''} Posted
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedCompany?.userType === 'consultancy' ? 'Consultancy' : 'Company'} Details
            </Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedCompany && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>
                  {selectedCompany.userType === 'consultancy' ? 'Consultancy' : 'Company'} Name
                </Text>
                <Text style={styles.detailValue}>
                  {selectedCompany.companyName || `${selectedCompany.firstName} ${selectedCompany.lastName}`}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Contact Person</Text>
                <Text style={styles.detailValue}>
                  {selectedCompany.firstName} {selectedCompany.lastName}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{selectedCompany.email}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{selectedCompany.phone || 'N/A'}</Text>
              </View>

              {selectedCompany.website && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Website</Text>
                  <Text style={styles.detailValue}>{selectedCompany.website}</Text>
                </View>
              )}

              {selectedCompany.location && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{selectedCompany.location}</Text>
                </View>
              )}

              {selectedCompany.industry && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Industry</Text>
                  <Text style={styles.detailValue}>{selectedCompany.industry}</Text>
                </View>
              )}

              {selectedCompany.companySize && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Company Size</Text>
                  <Text style={styles.detailValue}>{selectedCompany.companySize}</Text>
                </View>
              )}

              {selectedCompany.description && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{selectedCompany.description}</Text>
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>
                  {selectedCompany.userType === 'consultancy' ? 'Consultancy' : 'Company'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[
                  styles.detailValue,
                  { color: selectedCompany.isActive ? colors.success : colors.error }
                ]}>
                  {selectedCompany.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Email Verified</Text>
                <Text style={[
                  styles.detailValue,
                  { color: selectedCompany.emailVerified ? colors.success : colors.warning }
                ]}>
                  {selectedCompany.emailVerified ? 'Verified' : 'Not Verified'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Registered On</Text>
                <Text style={styles.detailValue}>
                  {api.formatIndianDateTime(selectedCompany.createdAt)}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Last Updated</Text>
                <Text style={styles.detailValue}>
                  {api.formatIndianDateTime(selectedCompany.updatedAt)}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.viewButton]}
                  onPress={() => {
                    setShowDetailsModal(false);
                    navigation.navigate('CompanyProfile', { companyId: selectedCompany._id });
                  }}
                >
                  <Ionicons name="eye" size={20} color={colors.textWhite} />
                  <Text style={styles.actionButtonText}>View Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.toggleButton]}
                  onPress={() => handleToggleStatus(selectedCompany._id, selectedCompany.isActive ? 'active' : 'inactive')}
                >
                  <Ionicons
                    name={selectedCompany.isActive ? 'ban' : 'checkmark-circle'}
                    size={20}
                    color={colors.textWhite}
                  />
                  <Text style={styles.actionButtonText}>
                    {selectedCompany.isActive ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteCompany(selectedCompany._id)}
                >
                  <Ionicons name="trash" size={20} color={colors.textWhite} />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {filterType === 'consultancy' ? 'Consultancies' : filterType === 'company' ? 'Companies' : 'Companies & Consultancies'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'company', 'consultancy'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterTab, filterType === type && styles.filterTabActive]}
            onPress={() => setFilterType(type)}
          >
            <Text style={[styles.filterTabText, filterType === type && styles.filterTabTextActive]}>
              {type === 'all' ? 'All' : type === 'consultancy' ? 'Consultancies' : 'Companies'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Companies List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={styles.resultCount}>
          {filteredCompanies.length} {filterType === 'consultancy' ? 'consultancy' : filterType === 'company' ? 'company' : 'employer'}
          {filteredCompanies.length !== 1 && filterType !== 'company' ? (filterType === 'consultancy' ? 'ies' : 's') : filteredCompanies.length !== 1 && filterType === 'company' ? 'ies' : ''} found
        </Text>

        {filteredCompanies.map(renderCompanyCard)}

        {filteredCompanies.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        )}
      </ScrollView>

      {renderDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body1,
    color: colors.text,
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.textWhite,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  resultCount: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  companyCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  companyName: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '600',
  },
  companyEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.info}15`,
    marginTop: spacing.xs,
  },
  typeText: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  infoText: {
    ...typography.body2,
    color: colors.text,
    marginLeft: spacing.xs,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  modalBody: {
    padding: spacing.md,
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
  },
  modalActions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  viewButton: {
    backgroundColor: colors.info,
  },
  toggleButton: {
    backgroundColor: colors.warning,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '600',
  },
});

export default AdminCompaniesScreen;

