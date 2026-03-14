import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import api from '../../config/api';
import { colors, spacing, borderRadius } from '../../styles/theme';

const JobEventsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
    currentCompany: '',
    message: '',
  });

  useEffect(() => {
    loadEvents();
  }, [searchQuery, currentPage]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const filters = {
        page: currentPage,
        limit: 20,
        search: searchQuery,
      };

      // Use public endpoint for main website
      const response = await fetch(`${api.baseURL}/job-events/public?${new URLSearchParams(filters)}`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data.events || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateLong = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
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

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const handleRegister = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${api.baseURL}/job-events/${selectedEvent._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Registration successful! You will receive a confirmation email shortly.');
        setShowRegistrationModal(false);
        setShowDetailModal(false);
        loadEvents();
        setFormData({
          name: '',
          email: '',
          phone: '',
          qualification: '',
          experience: '',
          currentCompany: '',
          message: '',
        });
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering:', error);
      Alert.alert('Error', 'Failed to register for event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1 }}>
        <Header showBack={true} title="Job Events" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header showBack={true} title="Job Events" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Job Events</Text>
          <Text style={styles.headerSubtitle}>
            Discover job fairs, recruitment drives, and career workshops
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color={colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events by title, location, or organizer..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          {events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={56} color={colors.primary} />
              </View>
              <Text style={styles.emptyText}>No Events Found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery 
                  ? 'Try adjusting your search to find what you\'re looking for' 
                  : 'Check back soon for upcoming job events and career opportunities'}
              </Text>
            </View>
          ) : (
            events.map((event) => (
              <TouchableOpacity
                key={event._id}
                style={styles.eventCard}
                onPress={() => handleViewDetails(event)}
                activeOpacity={0.7}
              >
                <View style={styles.eventCardHeader}>
                  <View style={styles.eventHeaderRow}>
                    <View style={styles.eventIconContainer}>
                      <Ionicons name="calendar" size={28} color={colors.primary} />
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{event.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>

                  <Text style={styles.eventDescription} numberOfLines={3}>
                    {event.description}
                  </Text>
                </View>

                <View style={styles.eventMetaContainer}>
                  <View style={styles.eventMetaRow}>
                    <View style={styles.infoItem}>
                      <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                      <Text style={styles.infoText}>
                        {formatDate(event.startDate)}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="location-outline" size={18} color={colors.primary} />
                      <Text style={styles.infoText} numberOfLines={1}>
                        {event.city || 'Location TBA'}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="business-outline" size={18} color={colors.primary} />
                      <Text style={styles.infoText} numberOfLines={1}>
                        {event.organizerName}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="time-outline" size={18} color={colors.primary} />
                      <Text style={styles.infoText}>
                        {event.startTime || '09:00 AM'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.eventFooter}>
                  <View style={styles.participantsContainer}>
                    <Ionicons name="people" size={20} color="#64748B" />
                    <Text style={styles.participantsText}>
                      {event.currentParticipants || 0}/{event.maxParticipants || '∞'} Registered
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.registerButton}>
                    <Text style={styles.registerButtonText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? colors.border : colors.primary} />
            </TouchableOpacity>

            <Text style={styles.paginationText}>
              Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
              style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? colors.border : colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>

    {/* Event Detail Modal */}
    {selectedEvent && (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <ScrollView>
              {/* Modal Header */}
              <View style={styles.detailModalHeader}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowDetailModal(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Event Hero */}
              <View style={styles.detailHero}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="calendar" size={40} color={colors.primary} />
                </View>
                <View
                  style={[
                    styles.detailStatusBadge,
                    { backgroundColor: getStatusColor(selectedEvent.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.detailStatusText,
                      { color: getStatusColor(selectedEvent.status) },
                    ]}
                  >
                    {selectedEvent.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.detailTitle}>{selectedEvent.title}</Text>

              <View style={styles.detailOrganizer}>
                <Ionicons name="business" size={16} color={colors.textSecondary} />
                <Text style={styles.detailOrganizerText}>
                  Organized by {selectedEvent.organizerName}
                </Text>
              </View>

              {/* Quick Info */}
              <View style={styles.detailQuickInfo}>
                <View style={styles.detailInfoItem}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <View>
                    <Text style={styles.detailInfoLabel}>Date</Text>
                    <Text style={styles.detailInfoValue}>{formatDateLong(selectedEvent.startDate)}</Text>
                  </View>
                </View>
                <View style={styles.detailInfoItem}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <View>
                    <Text style={styles.detailInfoLabel}>Time</Text>
                    <Text style={styles.detailInfoValue}>{selectedEvent.startTime || '09:00 AM'}</Text>
                  </View>
                </View>
                <View style={styles.detailInfoItem}>
                  <Ionicons name="location-outline" size={20} color={colors.primary} />
                  <View>
                    <Text style={styles.detailInfoLabel}>Location</Text>
                    <Text style={styles.detailInfoValue}>{selectedEvent.city}</Text>
                  </View>
                </View>
                <View style={styles.detailInfoItem}>
                  <Ionicons name="people-outline" size={20} color={colors.primary} />
                  <View>
                    <Text style={styles.detailInfoLabel}>Participants</Text>
                    <Text style={styles.detailInfoValue}>
                      {selectedEvent.currentParticipants || 0}/{selectedEvent.maxParticipants || '∞'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>About This Event</Text>
                <Text style={styles.detailDescription}>{selectedEvent.description}</Text>
              </View>

              {/* Event Details */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Event Details</Text>
                
                {selectedEvent.venue && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                    <View style={styles.detailRowContent}>
                      <Text style={styles.detailRowLabel}>Venue</Text>
                      <Text style={styles.detailRowValue}>{selectedEvent.venue}</Text>
                    </View>
                  </View>
                )}

                {selectedEvent.contactEmail && (
                  <View style={styles.detailRow}>
                    <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                    <View style={styles.detailRowContent}>
                      <Text style={styles.detailRowLabel}>Contact Email</Text>
                      <Text style={styles.detailRowValue}>{selectedEvent.contactEmail}</Text>
                    </View>
                  </View>
                )}

                {selectedEvent.contactPhone && (
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                    <View style={styles.detailRowContent}>
                      <Text style={styles.detailRowLabel}>Contact Phone</Text>
                      <Text style={styles.detailRowValue}>{selectedEvent.contactPhone}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Register Button */}
              <View style={styles.detailActions}>
                {selectedEvent.status === 'active' && 
                 !(selectedEvent.maxParticipants > 0 && selectedEvent.currentParticipants >= selectedEvent.maxParticipants) ? (
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => {
                      setShowDetailModal(false);
                      setTimeout(() => setShowRegistrationModal(true), 300);
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.registerButtonText}>Register for Event</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.disabledButton}>
                    <Ionicons name="close-circle" size={20} color="#FFF" />
                    <Text style={styles.disabledButtonText}>
                      {selectedEvent.maxParticipants > 0 && selectedEvent.currentParticipants >= selectedEvent.maxParticipants
                        ? 'Event Full'
                        : 'Registration Closed'}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    )}

    {/* Registration Modal */}
    <Modal
      visible={showRegistrationModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowRegistrationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.registrationModalContent}>
          <View style={styles.registrationModalHeader}>
            <Text style={styles.registrationModalTitle}>Register for Event</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowRegistrationModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.registrationForm}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Qualification</Text>
              <TextInput
                style={styles.formInput}
                value={formData.qualification}
                onChangeText={(text) => setFormData({ ...formData, qualification: text })}
                placeholder="e.g., B.Tech, MBA, etc."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Experience</Text>
              <TextInput
                style={styles.formInput}
                value={formData.experience}
                onChangeText={(text) => setFormData({ ...formData, experience: text })}
                placeholder="e.g., 2 Years, Fresher, etc."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Current Company</Text>
              <TextInput
                style={styles.formInput}
                value={formData.currentCompany}
                onChangeText={(text) => setFormData({ ...formData, currentCompany: text })}
                placeholder="Enter your current company"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Message (Optional)</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
                placeholder="Any additional information..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.registrationModalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowRegistrationModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRegister}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Registration</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl * 1.5,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    fontWeight: '400',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: spacing.lg,
    marginTop: -28,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    height: 52,
    marginLeft: spacing.sm,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  eventsContainer: {
    padding: spacing.lg,
  },
  emptyContainer: {
    paddingVertical: spacing.xl * 3,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  eventCardHeader: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  eventIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  eventDescription: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  eventMetaContainer: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  eventMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    minWidth: '45%',
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantsText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  paginationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
    backgroundColor: '#F8FAFC',
  },
  paginationText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContent: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.xl,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  detailHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  detailIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailStatusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  detailStatusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    lineHeight: 32,
  },
  detailOrganizer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  detailOrganizerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailQuickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  detailInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: '45%',
  },
  detailInfoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailInfoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  detailSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: spacing.md,
  },
  detailDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailRowContent: {
    flex: 1,
  },
  detailRowLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailRowValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  detailActions: {
    padding: spacing.xl,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  disabledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.textSecondary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    opacity: 0.6,
  },
  disabledButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  registrationModalContent: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.xl,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  registrationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  registrationModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  registrationForm: {
    padding: spacing.xl,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  registrationModalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default JobEventsScreen;
