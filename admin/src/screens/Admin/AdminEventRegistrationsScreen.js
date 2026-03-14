import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, borderRadius } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

const AdminEventRegistrationsScreen = ({ route, navigation }) => {
  const { eventId, eventTitle } = route.params;
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    loadRegistrations();
  }, [searchQuery, statusFilter, currentPage]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const filters = {
        page: currentPage,
        limit: 20,
        search: searchQuery,
      };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await api.getEventRegistrations(eventId, filters);
      if (response.success) {
        setRegistrations(response.data.registrations || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        
        // Calculate statistics
        const stats = {
          total: response.data.registrations?.length || 0,
          pending: response.data.registrations?.filter(r => r.status === 'pending').length || 0,
          confirmed: response.data.registrations?.filter(r => r.status === 'confirmed').length || 0,
          cancelled: response.data.registrations?.filter(r => r.status === 'cancelled').length || 0,
        };
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
      Alert.alert('Error', 'Failed to load registrations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRegistrations();
  };

  const handleUpdateStatus = async (registrationId, newStatus) => {
    try {
      await api.updateEventRegistrationStatus(eventId, registrationId, newStatus);
      Alert.alert('Success', 'Registration status updated');
      loadRegistrations();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDeleteRegistration = async (registrationId) => {
    Alert.alert(
      'Delete Registration',
      'Are you sure you want to delete this registration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteEventRegistration(eventId, registrationId);
              Alert.alert('Success', 'Registration deleted');
              loadRegistrations();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete registration');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'pending': return colors.warning;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  if (loading && !refreshing) {
    return (
      <AdminLayout
        title="Event Registrations"
        activeScreen="AdminJobEvents"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading registrations...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Event Registrations"
      activeScreen="AdminJobEvents"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <ScrollView
        style={dynamicStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity
            style={dynamicStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={dynamicStyles.pageTitle}>Event Registrations</Text>
            <Text style={dynamicStyles.pageSubtitle} numberOfLines={1}>
              {eventTitle}
            </Text>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.statsRow}>
            <TouchableOpacity
              style={[dynamicStyles.statCard, statusFilter === 'all' && dynamicStyles.statCardActive]}
              onPress={() => { setStatusFilter('all'); setCurrentPage(1); }}
            >
              <Ionicons name="people" size={32} color={colors.primary} />
              <Text style={dynamicStyles.statValue}>{statistics.total}</Text>
              <Text style={dynamicStyles.statLabel}>Total</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamicStyles.statCard, statusFilter === 'confirmed' && dynamicStyles.statCardActive]}
              onPress={() => { setStatusFilter('confirmed'); setCurrentPage(1); }}
            >
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
              <Text style={dynamicStyles.statValue}>{statistics.confirmed}</Text>
              <Text style={dynamicStyles.statLabel}>Confirmed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamicStyles.statCard, statusFilter === 'pending' && dynamicStyles.statCardActive]}
              onPress={() => { setStatusFilter('pending'); setCurrentPage(1); }}
            >
              <Ionicons name="time" size={32} color={colors.warning} />
              <Text style={dynamicStyles.statValue}>{statistics.pending}</Text>
              <Text style={dynamicStyles.statLabel}>Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamicStyles.statCard, statusFilter === 'cancelled' && dynamicStyles.statCardActive]}
              onPress={() => { setStatusFilter('cancelled'); setCurrentPage(1); }}
            >
              <Ionicons name="close-circle" size={32} color={colors.error} />
              <Text style={dynamicStyles.statValue}>{statistics.cancelled}</Text>
              <Text style={dynamicStyles.statLabel}>Cancelled</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={dynamicStyles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={dynamicStyles.searchIcon} />
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Registrations List */}
        <View style={dynamicStyles.registrationsSection}>
          <Text style={dynamicStyles.sectionTitle}>
            Registrations {statusFilter !== 'all' && `(${statusFilter})`}
          </Text>

          {registrations.length === 0 ? (
            <View style={dynamicStyles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.border} />
              <Text style={dynamicStyles.emptyText}>No registrations found</Text>
              <Text style={dynamicStyles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search' : 'No one has registered yet'}
              </Text>
            </View>
          ) : (
            registrations.map((registration) => (
              <View key={registration._id} style={dynamicStyles.registrationCard}>
                <View style={dynamicStyles.registrationHeader}>
                  <View style={dynamicStyles.registrationHeaderLeft}>
                    <Text style={dynamicStyles.registrationName}>{registration.name}</Text>
                    <View style={dynamicStyles.registrationMeta}>
                      <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                      <Text style={dynamicStyles.registrationMetaText}>{registration.email}</Text>
                    </View>
                    <View style={dynamicStyles.registrationMeta}>
                      <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                      <Text style={dynamicStyles.registrationMetaText}>{registration.phone}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      dynamicStyles.statusBadge,
                      { backgroundColor: getStatusColor(registration.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        dynamicStyles.statusBadgeText,
                        { color: getStatusColor(registration.status) },
                      ]}
                    >
                      {registration.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={dynamicStyles.registrationInfo}>
                  {registration.qualification && (
                    <View style={dynamicStyles.registrationInfoItem}>
                      <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
                      <Text style={dynamicStyles.registrationInfoText}>
                        {registration.qualification}
                      </Text>
                    </View>
                  )}
                  {registration.experience && (
                    <View style={dynamicStyles.registrationInfoItem}>
                      <Ionicons name="briefcase-outline" size={16} color={colors.textSecondary} />
                      <Text style={dynamicStyles.registrationInfoText}>
                        {registration.experience}
                      </Text>
                    </View>
                  )}
                  {registration.currentCompany && (
                    <View style={dynamicStyles.registrationInfoItem}>
                      <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                      <Text style={dynamicStyles.registrationInfoText}>
                        {registration.currentCompany}
                      </Text>
                    </View>
                  )}
                  <View style={dynamicStyles.registrationInfoItem}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={dynamicStyles.registrationInfoText}>
                      Registered: {formatDate(registration.createdAt)}
                    </Text>
                  </View>
                </View>

                {registration.message && (
                  <View style={dynamicStyles.messageContainer}>
                    <Text style={dynamicStyles.messageLabel}>Message:</Text>
                    <Text style={dynamicStyles.messageText}>{registration.message}</Text>
                  </View>
                )}

                <View style={dynamicStyles.registrationActions}>
                  {registration.status === 'pending' && (
                    <TouchableOpacity
                      style={[dynamicStyles.actionButton, dynamicStyles.confirmButton]}
                      onPress={() => handleUpdateStatus(registration._id, 'confirmed')}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                      <Text style={[dynamicStyles.actionButtonText, { color: colors.success }]}>
                        Confirm
                      </Text>
                    </TouchableOpacity>
                  )}
                  {registration.status !== 'cancelled' && (
                    <TouchableOpacity
                      style={[dynamicStyles.actionButton, dynamicStyles.cancelButton]}
                      onPress={() => handleUpdateStatus(registration._id, 'cancelled')}
                    >
                      <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                      <Text style={[dynamicStyles.actionButtonText, { color: colors.error }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={dynamicStyles.actionButton}
                    onPress={() => handleDeleteRegistration(registration._id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={[dynamicStyles.actionButtonText, { color: colors.error }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={dynamicStyles.pagination}>
              <TouchableOpacity
                style={[
                  dynamicStyles.paginationButton,
                  currentPage === 1 && dynamicStyles.paginationButtonDisabled,
                ]}
                onPress={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={currentPage === 1 ? colors.border : colors.primary}
                />
              </TouchableOpacity>

              <Text style={dynamicStyles.paginationText}>
                Page {currentPage} of {totalPages}
              </Text>

              <TouchableOpacity
                style={[
                  dynamicStyles.paginationButton,
                  currentPage === totalPages && dynamicStyles.paginationButtonDisabled,
                ]}
                onPress={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={currentPage === totalPages ? colors.border : colors.primary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    padding: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: isMobile ? '45%' : '22%',
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  statCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F9FF',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: colors.text,
  },
  registrationsSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  emptyContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  registrationCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  registrationHeaderLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  registrationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  registrationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  registrationMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  registrationInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  registrationInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: isMobile ? '100%' : '45%',
  },
  registrationInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  messageContainer: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  registrationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  confirmButton: {
    borderColor: colors.success + '40',
    backgroundColor: colors.success + '10',
  },
  cancelButton: {
    borderColor: colors.error + '40',
    backgroundColor: colors.error + '10',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  paginationButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
});

export default AdminEventRegistrationsScreen;
