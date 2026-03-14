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
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, borderRadius } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

const AdminJobEventsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    ongoing: 0,
    active: 0,
    closed: 0,
    byCompanies: 0,
    byConsultancies: 0,
  });
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Create/Edit form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'job_fair',
    startDate: new Date(),
    endDate: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    venue: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    organizerType: 'company',
    organizerName: '',
    contactEmail: '',
    contactPhone: '',
    registrationRequired: true,
    maxParticipants: 0,
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    loadData();
  }, [statusFilter, searchQuery, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStatistics(), loadEvents()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await api.getJobEventStats();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const filters = {
        page: currentPage,
        limit: 20,
        search: searchQuery,
      };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await api.getJobEvents(filters);
      if (response.success) {
        setEvents(response.data.events || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load job events');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDeleteEvent = async (eventId) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteJobEvent(eventId);
              Alert.alert('Success', 'Event deleted successfully');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      eventType: 'job_fair',
      startDate: new Date(),
      endDate: new Date(),
      startTime: '09:00',
      endTime: '17:00',
      venue: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      organizerType: 'company',
      organizerName: '',
      contactEmail: '',
      contactPhone: '',
      registrationRequired: true,
      maxParticipants: 0,
      status: 'active',
    });
    setShowCreateModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '17:00',
      venue: event.venue || '',
      address: event.address || '',
      city: event.city || '',
      state: event.state || '',
      country: event.country || 'India',
      organizerType: event.organizerType,
      organizerName: event.organizerName,
      contactEmail: event.contactEmail,
      contactPhone: event.contactPhone || '',
      registrationRequired: event.registrationRequired,
      maxParticipants: event.maxParticipants || 0,
      status: event.status,
    });
    setShowCreateModal(true);
  };

  const handleSaveEvent = async () => {
    try {
      // Validation
      if (!formData.title.trim()) {
        Alert.alert('Error', 'Please enter event title');
        return;
      }
      if (!formData.description.trim()) {
        Alert.alert('Error', 'Please enter event description');
        return;
      }
      if (!formData.organizerName.trim()) {
        Alert.alert('Error', 'Please enter organizer name');
        return;
      }
      if (!formData.contactEmail.trim()) {
        Alert.alert('Error', 'Please enter contact email');
        return;
      }
      
      // Validate email format
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(formData.contactEmail.trim())) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      setSaving(true);

      const eventData = {
        ...formData,
        contactEmail: formData.contactEmail.trim().toLowerCase(),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      };

      console.log('Sending event data:', eventData);

      if (editingEvent) {
        const response = await api.updateJobEvent(editingEvent._id, eventData);
        console.log('Update response:', response);
        Alert.alert('Success', 'Event updated successfully');
      } else {
        const response = await api.createJobEvent(eventData);
        console.log('Create response:', response);
        Alert.alert('Success', 'Event created successfully');
      }

      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving event:', error);
      console.error('Error details:', error.response || error);
      Alert.alert('Error', error.message || error.toString() || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.success;
      case 'closed': return colors.error;
      case 'cancelled': return colors.textSecondary;
      case 'completed': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  if (loading && !refreshing) {
    return (
      <AdminLayout
        title="Job Events"
        activeScreen="AdminJobEvents"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading events...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Job Events Management"
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
          <View>
            <Text style={dynamicStyles.pageTitle}>Job Events</Text>
            <Text style={dynamicStyles.pageSubtitle}>
              Manage job fairs, recruitment drives, and career events
            </Text>
          </View>
          <TouchableOpacity
            style={dynamicStyles.createButton}
            onPress={handleCreateEvent}
          >
            <Ionicons name="add-circle" size={20} color="#FFF" />
            <Text style={dynamicStyles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.statsRow}>
            <TouchableOpacity
              style={[dynamicStyles.statCard, statusFilter === 'all' && dynamicStyles.statCardActive]}
              onPress={() => { setStatusFilter('all'); setCurrentPage(1); }}
            >
              <Ionicons name="calendar" size={32} color={colors.primary} />
              <Text style={dynamicStyles.statValue}>{statistics.total}</Text>
              <Text style={dynamicStyles.statLabel}>All Events</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamicStyles.statCard, statusFilter === 'upcoming' && dynamicStyles.statCardActive]}
              onPress={() => { setStatusFilter('upcoming'); setCurrentPage(1); }}
            >
              <Ionicons name="time" size={32} color={colors.warning} />
              <Text style={dynamicStyles.statValue}>{statistics.upcoming}</Text>
              <Text style={dynamicStyles.statLabel}>Upcoming</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamicStyles.statCard, statusFilter === 'ongoing' && dynamicStyles.statCardActive]}
              onPress={() => { setStatusFilter('ongoing'); setCurrentPage(1); }}
            >
              <Ionicons name="play-circle" size={32} color={colors.success} />
              <Text style={dynamicStyles.statValue}>{statistics.ongoing}</Text>
              <Text style={dynamicStyles.statLabel}>Ongoing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamicStyles.statCard, statusFilter === 'completed' && dynamicStyles.statCardActive]}
              onPress={() => { setStatusFilter('completed'); setCurrentPage(1); }}
            >
              <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
              <Text style={dynamicStyles.statValue}>{statistics.completed}</Text>
              <Text style={dynamicStyles.statLabel}>Completed</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.statsRow}>
            <TouchableOpacity
              style={[dynamicStyles.statCard, statusFilter === 'active' && dynamicStyles.statCardActive]}
              onPress={() => { setStatusFilter('active'); setCurrentPage(1); }}
            >
              <Ionicons name="flash" size={32} color={colors.success} />
              <Text style={dynamicStyles.statValue}>{statistics.active}</Text>
              <Text style={dynamicStyles.statLabel}>Active</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamicStyles.statCard, statusFilter === 'closed' && dynamicStyles.statCardActive]}
              onPress={() => { setStatusFilter('closed'); setCurrentPage(1); }}
            >
              <Ionicons name="close-circle" size={32} color={colors.error} />
              <Text style={dynamicStyles.statValue}>{statistics.closed}</Text>
              <Text style={dynamicStyles.statLabel}>Closed</Text>
            </TouchableOpacity>

            <TouchableOpacity style={dynamicStyles.statCard}>
              <Ionicons name="business" size={32} color={colors.primary} />
              <Text style={dynamicStyles.statValue}>{statistics.byCompanies}</Text>
              <Text style={dynamicStyles.statLabel}>By Companies</Text>
            </TouchableOpacity>

            <TouchableOpacity style={dynamicStyles.statCard}>
              <Ionicons name="people" size={32} color={colors.primary} />
              <Text style={dynamicStyles.statValue}>{statistics.byConsultancies}</Text>
              <Text style={dynamicStyles.statLabel}>By Consultancies</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={dynamicStyles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={dynamicStyles.searchIcon} />
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Events List */}
        <View style={dynamicStyles.eventsSection}>
          <Text style={dynamicStyles.sectionTitle}>
            Events {statusFilter !== 'all' && `(${statusFilter})`}
          </Text>

          {events.length === 0 ? (
            <View style={dynamicStyles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={colors.border} />
              <Text style={dynamicStyles.emptyText}>No events found</Text>
              <Text style={dynamicStyles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Create your first event'}
              </Text>
            </View>
          ) : (
            events.map((event) => (
              <View key={event._id} style={dynamicStyles.eventCard}>
                <View style={dynamicStyles.eventHeader}>
                  <View style={dynamicStyles.eventHeaderLeft}>
                    <Text style={dynamicStyles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <View style={dynamicStyles.eventMeta}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <Text style={dynamicStyles.eventMetaText}>
                        {formatDate(event.startDate)}
                      </Text>
                      <Ionicons name="location-outline" size={14} color={colors.textSecondary} style={{ marginLeft: 12 }} />
                      <Text style={dynamicStyles.eventMetaText}>
                        {event.city || 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      dynamicStyles.statusBadge,
                      { backgroundColor: getStatusColor(event.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        dynamicStyles.statusBadgeText,
                        { color: getStatusColor(event.status) },
                      ]}
                    >
                      {event.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={dynamicStyles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Text>

                <View style={dynamicStyles.eventInfo}>
                  <View style={dynamicStyles.eventInfoItem}>
                    <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                    <Text style={dynamicStyles.eventInfoText}>{event.organizerName}</Text>
                  </View>
                  <View style={dynamicStyles.eventInfoItem}>
                    <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                    <Text style={dynamicStyles.eventInfoText}>
                      {event.currentParticipants}/{event.maxParticipants || '∞'} Registered
                    </Text>
                  </View>
                  <View style={dynamicStyles.eventInfoItem}>
                    <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
                    <Text style={dynamicStyles.eventInfoText}>{event.views} Views</Text>
                  </View>
                </View>

                <View style={dynamicStyles.eventActions}>
                  <TouchableOpacity
                    style={dynamicStyles.actionButton}
                    onPress={() => navigation.navigate('AdminEventRegistrations', { 
                      eventId: event._id,
                      eventTitle: event.title 
                    })}
                  >
                    <Ionicons name="people-outline" size={18} color={colors.primary} />
                    <Text style={dynamicStyles.actionButtonText}>Registrations</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={dynamicStyles.actionButton}
                    onPress={() => Alert.alert('View', `View details for ${event.title}`)}
                  >
                    <Ionicons name="eye-outline" size={18} color={colors.primary} />
                    <Text style={dynamicStyles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={dynamicStyles.actionButton}
                    onPress={() => handleEditEvent(event)}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                    <Text style={dynamicStyles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={dynamicStyles.actionButton}
                    onPress={() => handleDeleteEvent(event._id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={[dynamicStyles.actionButtonText, { color: colors.error }]}>Delete</Text>
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

      {/* Create/Edit Modal */}
      <Modal
        visible={showCreateModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </Text>
                <TouchableOpacity 
                  style={dynamicStyles.modalCloseButton}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={dynamicStyles.modalScrollContent}>
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Event Title *</Text>
                <TextInput
                  style={dynamicStyles.formInput}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Enter event title"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Description *</Text>
                <TextInput
                  style={[dynamicStyles.formInput, dynamicStyles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Enter event description"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Event Type</Text>
                <View style={dynamicStyles.picker}>
                  <Picker
                    selectedValue={formData.eventType}
                    onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                  >
                    <Picker.Item label="Job Fair" value="job_fair" />
                    <Picker.Item label="Recruitment Drive" value="recruitment_drive" />
                    <Picker.Item label="Career Workshop" value="career_workshop" />
                    <Picker.Item label="Networking Event" value="networking_event" />
                    <Picker.Item label="Campus Placement" value="campus_placement" />
                    <Picker.Item label="Webinar" value="webinar" />
                    <Picker.Item label="Other" value="other" />
                  </Picker>
                </View>
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Venue</Text>
                <TextInput
                  style={dynamicStyles.formInput}
                  value={formData.venue}
                  onChangeText={(text) => setFormData({ ...formData, venue: text })}
                  placeholder="Enter venue name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>City *</Text>
                <TextInput
                  style={dynamicStyles.formInput}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="Enter city"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>State</Text>
                <TextInput
                  style={dynamicStyles.formInput}
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                  placeholder="Enter state"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Organizer Type</Text>
                <View style={dynamicStyles.picker}>
                  <Picker
                    selectedValue={formData.organizerType}
                    onValueChange={(value) => setFormData({ ...formData, organizerType: value })}
                  >
                    <Picker.Item label="Company" value="company" />
                    <Picker.Item label="Consultancy" value="consultancy" />
                    <Picker.Item label="Admin" value="admin" />
                  </Picker>
                </View>
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Organizer Name *</Text>
                <TextInput
                  style={dynamicStyles.formInput}
                  value={formData.organizerName}
                  onChangeText={(text) => setFormData({ ...formData, organizerName: text })}
                  placeholder="Enter organizer name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Contact Email *</Text>
                <TextInput
                  style={dynamicStyles.formInput}
                  value={formData.contactEmail}
                  onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
                  placeholder="example@company.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Contact Phone</Text>
                <TextInput
                  style={dynamicStyles.formInput}
                  value={formData.contactPhone}
                  onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
                  placeholder="Enter contact phone"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Max Participants (0 = unlimited)</Text>
                <TextInput
                  style={dynamicStyles.formInput}
                  value={String(formData.maxParticipants)}
                  onChangeText={(text) => setFormData({ ...formData, maxParticipants: parseInt(text) || 0 })}
                  placeholder="Enter max participants"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Status</Text>
                <View style={dynamicStyles.picker}>
                  <Picker
                    selectedValue={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <Picker.Item label="Active" value="active" />
                    <Picker.Item label="Closed" value="closed" />
                    <Picker.Item label="Cancelled" value="cancelled" />
                  </Picker>
                </View>
              </View>
              </ScrollView>

              <View style={dynamicStyles.modalFooter}>
                <TouchableOpacity
                  style={dynamicStyles.cancelButton}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={dynamicStyles.saveButton}
                  onPress={handleSaveEvent}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={dynamicStyles.saveButtonText}>
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: isMobile ? '45%' : isTablet ? '22%' : '22%',
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
    textAlign: 'center',
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
  eventsSection: {
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
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  eventHeaderLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
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
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  eventInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  eventActions: {
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
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: isMobile ? 0 : borderRadius.xl,
    padding: 0,
    width: isMobile ? '100%' : isTablet ? '85%' : '70%',
    height: isMobile ? '100%' : 'auto',
    maxWidth: isMobile ? '100%' : 700,
    maxHeight: isMobile ? '100%' : '90%',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      },
      default: {
        elevation: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 20 : isTablet ? 28 : 32,
    paddingTop: isMobile ? 20 : isTablet ? 24 : 28,
    paddingBottom: isMobile ? 16 : isTablet ? 20 : 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
  },
  modalTitle: {
    fontSize: isMobile ? 20 : isTablet ? 22 : 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    width: isMobile ? 36 : 40,
    height: isMobile ? 36 : 40,
    borderRadius: isMobile ? 18 : 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  modalScrollContent: {
    padding: isMobile ? 20 : isTablet ? 28 : 32,
  },
  formGroup: {
    marginBottom: isMobile ? 20 : 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: borderRadius.md,
    padding: isMobile ? 12 : 14,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFF',
    minHeight: 48,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: isMobile ? 12 : 14,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: borderRadius.md,
    backgroundColor: '#FFF',
    minHeight: 48,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: isMobile ? 12 : 16,
    paddingHorizontal: isMobile ? 20 : isTablet ? 28 : 32,
    paddingVertical: isMobile ? 16 : isTablet ? 20 : 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
  },
  cancelButton: {
    paddingHorizontal: isMobile ? 20 : 24,
    paddingVertical: isMobile ? 12 : 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    paddingHorizontal: isMobile ? 24 : 32,
    paddingVertical: isMobile ? 12 : 14,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    minWidth: isMobile ? 120 : 150,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default AdminJobEventsScreen;
