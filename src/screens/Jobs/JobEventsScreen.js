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

const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') return Platform;
  } catch (e) {}
  return { OS: 'android' };
};
const isWeb = getPlatform().OS === 'web';

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
      const filters = { page: currentPage, limit: 20, search: searchQuery };
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

  const onRefresh = () => { setRefreshing(true); loadEvents(); };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatDateLong = (date) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'closed': return '#EF4444';
      case 'cancelled': return '#94A3B8';
      case 'completed': return '#6366F1';
      default: return '#94A3B8';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active': return '#DCFCE7';
      case 'closed': return '#FEE2E2';
      case 'cancelled': return '#F1F5F9';
      case 'completed': return '#EEF2FF';
      default: return '#F1F5F9';
    }
  };

  const handleViewDetails = (event) => { setSelectedEvent(event); setShowDetailModal(true); };

  const handleRegister = async () => {
    if (!formData.name.trim()) { Alert.alert('Error', 'Please enter your name'); return; }
    if (!formData.email.trim()) { Alert.alert('Error', 'Please enter your email'); return; }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email.trim())) { Alert.alert('Error', 'Please enter a valid email address'); return; }
    if (!formData.phone.trim()) { Alert.alert('Error', 'Please enter your phone number'); return; }
    try {
      setSubmitting(true);
      const response = await fetch(`${api.baseURL}/job-events/${selectedEvent._id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: formData.email.trim().toLowerCase() }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Registration successful! You will receive a confirmation email shortly.');
        setShowRegistrationModal(false);
        setShowDetailModal(false);
        loadEvents();
        setFormData({ name: '', email: '', phone: '', qualification: '', experience: '', currentCompany: '', message: '' });
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register for event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <Header showBack={true} title="Job Events" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <Header showBack={true} title="Job Events" />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Job Events & Career Fairs</Text>
          <Text style={styles.heroSubtitle}>
            Discover job fairs, recruitment drives, and career workshops
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events by title, location, or organizer..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>
            {events.length} {events.length === 1 ? 'Event' : 'Events'} Found
          </Text>
        </View>

        {/* Events */}
        <View style={styles.eventsContainer}>
          {events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={48} color={colors.primary} />
              </View>
              <Text style={styles.emptyText}>No Events Found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? "Try adjusting your search"
                  : 'Check back soon for upcoming job events'}
              </Text>
            </View>
          ) : (
            events.map((event) => (
              <TouchableOpacity
                key={event._id}
                style={styles.eventCard}
                onPress={() => handleViewDetails(event)}
                activeOpacity={0.85}
              >
                {/* Card top row */}
                <View style={styles.cardTop}>
                  <View style={styles.eventIconBox}>
                    <Ionicons name="calendar" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.cardTopMeta}>
                    <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                    <Text style={styles.organizerText}>{event.organizerName}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: getStatusBg(event.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>

                {/* Meta chips */}
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Ionicons name="calendar-outline" size={13} color="#64748B" />
                    <Text style={styles.metaChipText}>{formatDate(event.startDate)}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="location-outline" size={13} color="#64748B" />
                    <Text style={styles.metaChipText} numberOfLines={1}>{event.city || 'TBA'}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={13} color="#64748B" />
                    <Text style={styles.metaChipText}>{event.startTime || '09:00 AM'}</Text>
                  </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.participantsRow}>
                    <Ionicons name="people-outline" size={14} color="#64748B" />
                    <Text style={styles.participantsText}>
                      {event.currentParticipants || 0}/{event.maxParticipants || '∞'} Registered
                    </Text>
                  </View>
                  <View style={styles.viewDetailsBtn}>
                    <Text style={styles.viewDetailsBtnText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                onPress={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Ionicons name="chevron-back" size={18} color={currentPage === 1 ? '#CBD5E1' : colors.primary} />
              </TouchableOpacity>
              <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
              <TouchableOpacity
                style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                onPress={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <Ionicons name="chevron-forward" size={18} color={currentPage === totalPages ? '#CBD5E1' : colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Modal visible={showDetailModal} animationType="slide" transparent onRequestClose={() => setShowDetailModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.detailModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle} numberOfLines={1}>{selectedEvent.title}</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color="#475569" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={[styles.statusPill, { backgroundColor: getStatusBg(selectedEvent.status), alignSelf: 'flex-start', marginBottom: 16 }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(selectedEvent.status) }]}>
                    {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                  </Text>
                </View>
                <Text style={styles.detailOrganizer}>Organized by {selectedEvent.organizerName}</Text>

                <View style={styles.detailGrid}>
                  {[
                    { icon: 'calendar-outline', label: 'Date', value: formatDateLong(selectedEvent.startDate) },
                    { icon: 'time-outline', label: 'Time', value: selectedEvent.startTime || '09:00 AM' },
                    { icon: 'location-outline', label: 'Location', value: selectedEvent.city },
                    { icon: 'people-outline', label: 'Participants', value: `${selectedEvent.currentParticipants || 0}/${selectedEvent.maxParticipants || '∞'}` },
                  ].map((item) => (
                    <View key={item.label} style={styles.detailGridItem}>
                      <Ionicons name={item.icon} size={16} color={colors.primary} />
                      <View>
                        <Text style={styles.detailGridLabel}>{item.label}</Text>
                        <Text style={styles.detailGridValue}>{item.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>About This Event</Text>
                  <Text style={styles.detailDescription}>{selectedEvent.description}</Text>
                </View>

                {(selectedEvent.venue || selectedEvent.contactEmail || selectedEvent.contactPhone) && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Event Details</Text>
                    {selectedEvent.venue && (
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={15} color="#64748B" />
                        <Text style={styles.detailRowText}>{selectedEvent.venue}</Text>
                      </View>
                    )}
                    {selectedEvent.contactEmail && (
                      <View style={styles.detailRow}>
                        <Ionicons name="mail-outline" size={15} color="#64748B" />
                        <Text style={styles.detailRowText}>{selectedEvent.contactEmail}</Text>
                      </View>
                    )}
                    {selectedEvent.contactPhone && (
                      <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={15} color="#64748B" />
                        <Text style={styles.detailRowText}>{selectedEvent.contactPhone}</Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
              <View style={styles.modalFooter}>
                {selectedEvent.status === 'active' &&
                  !(selectedEvent.maxParticipants > 0 && selectedEvent.currentParticipants >= selectedEvent.maxParticipants) ? (
                  <TouchableOpacity
                    style={styles.registerBtn}
                    onPress={() => { setShowDetailModal(false); setTimeout(() => setShowRegistrationModal(true), 300); }}
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                    <Text style={styles.registerBtnText}>Register for Event</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.disabledBtn}>
                    <Text style={styles.disabledBtnText}>
                      {selectedEvent.maxParticipants > 0 && selectedEvent.currentParticipants >= selectedEvent.maxParticipants
                        ? 'Event Full' : 'Registration Closed'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Registration Modal */}
      <Modal visible={showRegistrationModal} animationType="slide" transparent onRequestClose={() => setShowRegistrationModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Register for Event</Text>
              <TouchableOpacity onPress={() => setShowRegistrationModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {[
                { label: 'Full Name *', key: 'name', placeholder: 'Enter your full name' },
                { label: 'Email *', key: 'email', placeholder: 'your.email@example.com', keyboard: 'email-address' },
                { label: 'Phone Number *', key: 'phone', placeholder: 'Enter your phone number', keyboard: 'phone-pad' },
                { label: 'Qualification', key: 'qualification', placeholder: 'e.g., B.Tech, MBA' },
                { label: 'Experience', key: 'experience', placeholder: 'e.g., 2 Years, Fresher' },
                { label: 'Current Company', key: 'currentCompany', placeholder: 'Enter your current company' },
              ].map((field) => (
                <View key={field.key} style={styles.formGroup}>
                  <Text style={styles.formLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData[field.key]}
                    onChangeText={(text) => setFormData({ ...formData, [field.key]: text })}
                    placeholder={field.placeholder}
                    placeholderTextColor="#94A3B8"
                    keyboardType={field.keyboard || 'default'}
                    autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'sentences'}
                  />
                </View>
              ))}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Message (Optional)</Text>
                <TextInput
                  style={[styles.formInput, { height: 90, textAlignVertical: 'top', paddingTop: 10 }]}
                  value={formData.message}
                  onChangeText={(text) => setFormData({ ...formData, message: text })}
                  placeholder="Any additional information..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRegistrationModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.registerBtnText}>Submit Registration</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748B' },

  hero: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 },

  searchWrapper: {
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    ...(isWeb && { boxShadow: '0 2px 8px rgba(15,23,42,0.08)' }),
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionAccent: { width: 4, height: 20, backgroundColor: colors.primary, borderRadius: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },

  eventsContainer: { paddingHorizontal: 16, paddingBottom: 32 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: '#64748B', textAlign: 'center' },

  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    ...(isWeb && { boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }),
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  eventIconBox: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  cardTopMeta: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', lineHeight: 22, marginBottom: 2 },
  organizerText: { fontSize: 12, color: '#64748B' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600' },

  eventDescription: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 12 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  metaChipText: { fontSize: 12, color: '#475569', fontWeight: '500' },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  participantsRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  participantsText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  viewDetailsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6,
    borderWidth: 1, borderColor: colors.primary + '40', backgroundColor: '#EEF2FF',
  },
  viewDetailsBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20 },
  pageBtn: {
    width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0',
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageText: { fontSize: 14, color: '#475569', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  detailModal: {
    backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '90%', overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 12 },
  closeBtn: { padding: 4 },
  modalBody: { padding: 20 },
  modalFooter: {
    flexDirection: 'row', gap: 12, padding: 16,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },

  detailOrganizer: { fontSize: 13, color: '#64748B', marginBottom: 16 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  detailGridItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#F8FAFC', borderRadius: 8, padding: 12,
    width: '47%', borderWidth: 1, borderColor: '#E2E8F0',
  },
  detailGridLabel: { fontSize: 11, color: '#94A3B8', marginBottom: 2 },
  detailGridValue: { fontSize: 13, fontWeight: '600', color: '#0F172A' },

  detailSection: { marginBottom: 20 },
  detailSectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  detailDescription: { fontSize: 14, color: '#475569', lineHeight: 22 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  detailRowText: { fontSize: 14, color: '#475569' },

  registerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 10,
  },
  registerBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  disabledBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#94A3B8', paddingVertical: 14, borderRadius: 10,
  },
  disabledBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  cancelBtn: {
    flex: 0.4, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#475569' },

  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  formInput: {
    backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0',
  },
});

export default JobEventsScreen;
