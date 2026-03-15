import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Switch, Platform, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AD_TYPES = ['banner', 'sidebar', 'footer', 'popup', 'inline', 'adsense', 'admob'];
const AD_POSITIONS = ['header', 'sidebar-left', 'sidebar-right', 'footer', 'content-top', 'content-bottom', 'content-middle', 'popup', 'mobile-banner', 'mobile-interstitial'];
const AD_STATUSES = ['draft', 'active', 'paused', 'inactive'];
const TARGET_PAGES = ['all', 'home', 'jobs', 'companies', 'login', 'register', 'dashboard', 'profile'];
const TARGET_USERS = ['all', 'jobseeker', 'employer', 'consultancy'];
const TARGET_DEVICES = ['all', 'desktop', 'mobile', 'tablet'];
const ADSENSE_FORMATS = ['auto', 'rectangle', 'vertical', 'horizontal'];
const ADMOB_SIZES = ['banner', 'large-banner', 'medium-rectangle', 'full-banner', 'leaderboard', 'smart-banner'];

const EMPTY_FORM = {
  title: '', description: '', type: 'banner', position: 'header',
  status: 'draft', priority: 5, isActive: true,
  content: { html: '', imageUrl: '', imageAlt: '', text: '', linkUrl: '', linkText: '' },
  adsense: { adClient: '', adSlot: '', adFormat: 'auto', adStyle: '' },
  admob: { adUnitId: '', adSize: 'banner' },
  displaySettings: { width: 728, height: 90, backgroundColor: '#ffffff', borderColor: '#cccccc', borderRadius: 0 },
  targeting: { pages: ['all'], userTypes: ['all'], devices: ['all'], locations: [], industries: [] },
  schedule: { startDate: new Date().toISOString().split('T')[0], endDate: '', timezone: 'UTC' }
};

const STATUS_COLORS = { active: '#10B981', inactive: '#6B7280', paused: '#F59E0B', draft: '#3B82F6' };
const STATUS_ICONS = { active: 'checkmark-circle', inactive: 'close-circle', paused: 'pause-circle', draft: 'document-text' };
const TYPE_ICONS = { banner: 'image', sidebar: 'albums', footer: 'footer', popup: 'browsers', inline: 'code-slash', adsense: 'logo-google', admob: 'phone-portrait' };

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? 16 : 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerLeft: { flex: 1 },
  pageTitle: { fontSize: isMobile ? 20 : 24, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  pageSubtitle: { fontSize: isMobile ? 12 : 14, color: '#6B7280' },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: isMobile ? 12 : 16, paddingVertical: isMobile ? 8 : 10, borderRadius: 8, gap: 6 },
  addButtonText: { color: '#fff', fontSize: isMobile ? 13 : 15, fontWeight: '600' },
  refreshButton: { padding: 10, borderRadius: 8, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  statsContainer: { flexDirection: 'row', padding: isMobile ? 12 : 16, gap: 10, backgroundColor: '#fff', flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  statCard: { flex: 1, backgroundColor: '#F9FAFB', padding: isMobile ? 10 : 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', minWidth: isMobile ? 80 : 110 },
  statValue: { fontSize: isMobile ? 18 : 22, fontWeight: 'bold', color: '#111827', marginTop: 6 },
  statLabel: { fontSize: isMobile ? 10 : 11, color: '#6B7280', marginTop: 2, textAlign: 'center' },
  filtersContainer: { padding: isMobile ? 12 : 16, gap: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#111827' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  filterChipActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  adsList: { flex: 1 },
  adsListContent: { padding: isMobile ? 12 : 16, gap: 12 },
  adCard: { backgroundColor: '#fff', borderRadius: 12, padding: isMobile ? 12 : 16, borderWidth: 1, borderColor: '#E5E7EB' },
  adCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  adCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  typeIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  adCardTitle: { fontSize: isMobile ? 15 : 17, fontWeight: '600', color: '#111827', flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  adCardActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 7, borderRadius: 6, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' },
  adCardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#6B7280' },
  perfRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6', marginVertical: 8 },
  perfItem: { alignItems: 'center' },
  perfValue: { fontSize: isMobile ? 16 : 18, fontWeight: 'bold', color: '#111827' },
  perfLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  adCardFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  footerBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, gap: 5 },
  activateBtn: { backgroundColor: '#10B981' },
  pauseBtn: { backgroundColor: '#F59E0B' },
  draftBtn: { backgroundColor: '#3B82F6' },
  footerBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  duplicateBtn: { backgroundColor: '#8B5CF6' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', alignItems: 'center', padding: isMobile ? 8 : 24 },
  modalContainer: {
    backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 680,
    ...(Platform.OS === 'web' ? { maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)' } : { maxHeight: '90%', elevation: 24 }),
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: isMobile ? 16 : 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: isMobile ? 16 : 18, fontWeight: '700', color: '#0F172A', letterSpacing: -0.2 },
  modalSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingHorizontal: isMobile ? 12 : 20 },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: 'transparent', marginRight: 2 },
  tabBtnActive: { borderBottomColor: '#3B82F6' },
  tabBtnText: { fontSize: 13, fontWeight: '500', color: '#94A3B8' },
  tabBtnTextActive: { color: '#3B82F6', fontWeight: '600' },
  modalBody: { ...(Platform.OS === 'web' ? { flex: 1, overflowY: 'auto' } : { flex: 1 }), padding: isMobile ? 14 : 20 },
  formGroup: { marginBottom: 14 },
  formRow: { flexDirection: isMobile ? 'column' : 'row', gap: 12, marginBottom: 14 },
  formHalf: { flex: 1 },
  sectionDivider: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 5 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    paddingHorizontal: 11, paddingVertical: isMobile ? 8 : 9, fontSize: 13, color: '#0F172A',
  },
  inputFocused: { borderColor: '#3B82F6', backgroundColor: '#fff' },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  codeArea: { minHeight: 88, textAlignVertical: 'top', fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier', fontSize: 12, lineHeight: 18 },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 6, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  chipSelected: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  chipText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  chipTextSelected: { color: '#3B82F6', fontWeight: '600' },
  chipStatusActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  chipStatusPaused: { backgroundColor: '#FFFBEB', borderColor: '#F59E0B' },
  chipStatusInactive: { backgroundColor: '#F9FAFB', borderColor: '#9CA3AF' },
  chipStatusDraft: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  helpText: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  perfGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  perfCard: { flex: 1, minWidth: isMobile ? '45%' : 120, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  perfCardValue: { fontSize: isMobile ? 20 : 24, fontWeight: '700', color: '#0F172A', marginTop: 8 },
  perfCardLabel: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  resetStatsBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', alignSelf: 'flex-start', marginTop: 14 },
  resetStatsBtnText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
  modalFooter: {
    flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8,
    paddingHorizontal: isMobile ? 14 : 20, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, backgroundColor: '#3B82F6' },
  saveBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  savingBtn: { backgroundColor: '#93C5FD' },
  previewBox: { backgroundColor: '#0F172A', borderRadius: 8, padding: 12, marginTop: 8 },
  previewLabel: { fontSize: 10, color: '#64748B', marginBottom: 6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  codePreview: { fontSize: 11, color: '#7DD3FC', fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier', lineHeight: 17 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#F0F9FF', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#BAE6FD', marginBottom: 12 },
  infoBoxText: { fontSize: 12, color: '#0369A1', flex: 1, lineHeight: 17 },
  priorityRow: { flexDirection: 'row', gap: 6 },
  priorityBtn: { flex: 1, paddingVertical: 7, borderRadius: 6, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  priorityBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  priorityBtnText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  priorityBtnTextActive: { color: '#fff' },
});

const AdminAdvertisementManagementScreen = ({ navigation }) => {
  const { isMobile, isTablet } = useResponsive();
  const styles = getStyles(isMobile, isTablet);

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [advertisements, setAdvertisements] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stats, setStats] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const getToken = async () => AsyncStorage.getItem('token');

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const token = await getToken();
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      const [adsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/advertisements/admin/list?limit=200`, { headers }),
        fetch(`${API_URL}/advertisements/admin/stats`, { headers })
      ]);
      const [adsData, statsData] = await Promise.all([adsRes.json(), statsRes.json()]);
      if (adsData.success) { setAdvertisements(adsData.data); setFilteredAds(adsData.data); }
      if (statsData.success) setStats(statsData.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load advertisements. Check server connection.');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    let filtered = [...advertisements];
    if (searchQuery) filtered = filtered.filter(ad => ad.title.toLowerCase().includes(searchQuery.toLowerCase()) || (ad.description || '').toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedType !== 'all') filtered = filtered.filter(ad => ad.type === selectedType);
    if (selectedStatus !== 'all') filtered = filtered.filter(ad => ad.status === selectedStatus);
    setFilteredAds(filtered);
  }, [searchQuery, selectedType, selectedStatus, advertisements]);

  const apiCall = async (url, method, body) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}${url}`, {
      method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    return res.json();
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { Alert.alert('Validation', 'Title is required'); return; }
    setSaving(true);
    try {
      const url = editMode ? `/advertisements/admin/${currentAd._id}` : '/advertisements/admin/create';
      const method = editMode ? 'PUT' : 'POST';
      const data = await apiCall(url, method, formData);
      if (data.success) {
        Alert.alert('Success', editMode ? 'Advertisement updated!' : 'Advertisement created!');
        closeModal(); fetchAll();
      } else {
        Alert.alert('Error', data.message || 'Operation failed');
      }
    } catch (e) { Alert.alert('Error', 'Failed to save advertisement'); }
    finally { setSaving(false); }
  };

  const handleDelete = (ad) => {
    Alert.alert('Delete Advertisement', `Delete "${ad.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const data = await apiCall(`/advertisements/admin/${ad._id}`, 'DELETE');
        if (data.success) { Alert.alert('Deleted', 'Advertisement removed'); fetchAll(); }
        else Alert.alert('Error', data.message || 'Failed to delete');
      }}
    ]);
  };

  const handleStatusChange = async (ad, newStatus) => {
    const data = await apiCall(`/advertisements/admin/${ad._id}/status`, 'PUT', { status: newStatus });
    if (data.success) fetchAll();
    else Alert.alert('Error', data.message || 'Failed to update status');
  };

  const handleDuplicate = async (ad) => {
    const dupData = {
      title: `${ad.title} (Copy)`, description: ad.description, type: ad.type,
      position: ad.position, status: 'draft', priority: ad.priority, isActive: false,
      content: ad.content, adsense: ad.adsense, admob: ad.admob,
      displaySettings: ad.displaySettings, targeting: ad.targeting,
      schedule: { startDate: new Date().toISOString().split('T')[0], endDate: '', timezone: 'UTC' }
    };
    const data = await apiCall('/advertisements/admin/create', 'POST', dupData);
    if (data.success) { Alert.alert('Duplicated', 'Ad duplicated as draft'); fetchAll(); }
    else Alert.alert('Error', data.message || 'Failed to duplicate');
  };

  const handleResetStats = (ad) => {
    Alert.alert('Reset Stats', `Reset performance stats for "${ad.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        const data = await apiCall(`/advertisements/admin/${ad._id}`, 'PUT', {
          ...formData, performance: { impressions: 0, clicks: 0, ctr: 0, revenue: 0 }
        });
        if (data.success) { fetchAll(); setCurrentAd(data.data); Alert.alert('Done', 'Stats reset'); }
      }}
    ]);
  };

  const openAdd = () => { setFormData({ ...EMPTY_FORM, schedule: { startDate: new Date().toISOString().split('T')[0], endDate: '', timezone: 'UTC' } }); setEditMode(false); setCurrentAd(null); setActiveTab('basic'); setModalVisible(true); };

  const openEdit = (ad) => {
    setCurrentAd(ad);
    setFormData({
      title: ad.title || '', description: ad.description || '',
      type: ad.type || 'banner', position: ad.position || 'header',
      status: ad.status || 'draft', priority: ad.priority || 5, isActive: ad.isActive !== false,
      content: ad.content || EMPTY_FORM.content,
      adsense: ad.adsense || EMPTY_FORM.adsense,
      admob: ad.admob || EMPTY_FORM.admob,
      displaySettings: ad.displaySettings || EMPTY_FORM.displaySettings,
      targeting: ad.targeting || EMPTY_FORM.targeting,
      schedule: {
        startDate: ad.schedule?.startDate ? new Date(ad.schedule.startDate).toISOString().split('T')[0] : '',
        endDate: ad.schedule?.endDate ? new Date(ad.schedule.endDate).toISOString().split('T')[0] : '',
        timezone: ad.schedule?.timezone || 'UTC'
      }
    });
    setEditMode(true); setActiveTab('basic'); setModalVisible(true);
  };

  const closeModal = () => { setModalVisible(false); setEditMode(false); setCurrentAd(null); };

  const set = (field, value) => setFormData(p => ({ ...p, [field]: value }));
  const setNested = (parent, field, value) => setFormData(p => ({ ...p, [parent]: { ...p[parent], [field]: value } }));
  const toggleArray = (parent, field, val) => {
    const arr = formData[parent][field] || [];
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
    setNested(parent, field, next.length ? next : [val]);
  };

  const generateAdSenseCode = () => {
    const { adClient, adSlot, adFormat } = formData.adsense;
    if (!adClient || !adSlot) return '<!-- Fill in AdSense Client ID and Slot ID above -->';
    return `<ins class="adsbygoogle"\n  style="display:block"\n  data-ad-client="${adClient}"\n  data-ad-slot="${adSlot}"\n  data-ad-format="${adFormat}"\n  data-full-width-responsive="true">\n</ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`;
  };

  // ─── RENDER HELPERS ──────────────────────────────────────────────────────────

  const renderStats = () => {
    if (!stats) return null;
    const items = [
      { icon: 'megaphone', color: '#3B82F6', value: stats.overview?.total || 0, label: 'Total' },
      { icon: 'checkmark-circle', color: '#10B981', value: stats.overview?.active || 0, label: 'Active' },
      { icon: 'pause-circle', color: '#F59E0B', value: stats.overview?.paused || 0, label: 'Paused' },
      { icon: 'document-text', color: '#8B5CF6', value: stats.overview?.draft || 0, label: 'Draft' },
      { icon: 'eye', color: '#06B6D4', value: stats.performance?.totalImpressions || 0, label: 'Impressions' },
      { icon: 'hand-left', color: '#F97316', value: stats.performance?.totalClicks || 0, label: 'Clicks' },
    ];
    return (
      <View style={styles.statsContainer}>
        {items.map(({ icon, color, value, label }) => (
          <View key={label} style={styles.statCard}>
            <Ionicons name={icon} size={20} color={color} />
            <Text style={styles.statValue}>{value.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput style={styles.searchInput} placeholder="Search ads..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#9CA3AF" />
        {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color="#9CA3AF" /></TouchableOpacity> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {['all', ...AD_TYPES].map(t => (
            <TouchableOpacity key={t} style={[styles.filterChip, selectedType === t && styles.filterChipActive]} onPress={() => setSelectedType(t)}>
              <Text style={[styles.filterChipText, selectedType === t && styles.filterChipTextActive]}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {['all', ...AD_STATUSES].map(s => (
            <TouchableOpacity key={s} style={[styles.filterChip, selectedStatus === s && styles.filterChipActive]} onPress={() => setSelectedStatus(s)}>
              <Text style={[styles.filterChipText, selectedStatus === s && styles.filterChipTextActive]}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderAdCard = (ad) => {
    const ctr = ad.performance?.impressions > 0 ? ((ad.performance.clicks / ad.performance.impressions) * 100).toFixed(2) : '0.00';
    const nextStatus = ad.status === 'active' ? 'paused' : 'active';
    return (
      <View key={ad._id} style={styles.adCard}>
        <View style={styles.adCardHeader}>
          <View style={styles.adCardLeft}>
            <View style={styles.typeIcon}><Ionicons name={TYPE_ICONS[ad.type] || 'image'} size={18} color="#3B82F6" /></View>
            <Text style={styles.adCardTitle} numberOfLines={1}>{ad.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[ad.status] }]}>
              <Ionicons name={STATUS_ICONS[ad.status]} size={12} color="#fff" />
              <Text style={styles.statusBadgeText}>{ad.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.adCardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(ad)}><Ionicons name="create-outline" size={17} color="#3B82F6" /></TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDuplicate(ad)}><Ionicons name="copy-outline" size={17} color="#8B5CF6" /></TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(ad)}><Ionicons name="trash-outline" size={17} color="#EF4444" /></TouchableOpacity>
          </View>
        </View>

        {ad.description ? <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }} numberOfLines={2}>{ad.description}</Text> : null}

        <View style={styles.adCardMeta}>
          <View style={styles.metaItem}><Ionicons name="pricetag-outline" size={14} color="#9CA3AF" /><Text style={styles.metaText}>{ad.type}</Text></View>
          <View style={styles.metaItem}><Ionicons name="location-outline" size={14} color="#9CA3AF" /><Text style={styles.metaText}>{ad.position}</Text></View>
          <View style={styles.metaItem}><Ionicons name="star-outline" size={14} color="#9CA3AF" /><Text style={styles.metaText}>P{ad.priority}</Text></View>
          {ad.displaySettings?.width ? <View style={styles.metaItem}><Ionicons name="resize-outline" size={14} color="#9CA3AF" /><Text style={styles.metaText}>{ad.displaySettings.width}×{ad.displaySettings.height}</Text></View> : null}
        </View>

        <View style={styles.perfRow}>
          <View style={styles.perfItem}><Text style={styles.perfValue}>{(ad.performance?.impressions || 0).toLocaleString()}</Text><Text style={styles.perfLabel}>Impressions</Text></View>
          <View style={styles.perfItem}><Text style={styles.perfValue}>{(ad.performance?.clicks || 0).toLocaleString()}</Text><Text style={styles.perfLabel}>Clicks</Text></View>
          <View style={styles.perfItem}><Text style={styles.perfValue}>{ctr}%</Text><Text style={styles.perfLabel}>CTR</Text></View>
          <View style={styles.perfItem}><Text style={styles.perfValue}>${(ad.performance?.revenue || 0).toFixed(2)}</Text><Text style={styles.perfLabel}>Revenue</Text></View>
        </View>

        <View style={styles.adCardFooter}>
          <TouchableOpacity style={[styles.footerBtn, nextStatus === 'active' ? styles.activateBtn : styles.pauseBtn]} onPress={() => handleStatusChange(ad, nextStatus)}>
            <Ionicons name={nextStatus === 'active' ? 'play' : 'pause'} size={14} color="#fff" />
            <Text style={styles.footerBtnText}>{nextStatus === 'active' ? 'Activate' : 'Pause'}</Text>
          </TouchableOpacity>
          {ad.status !== 'draft' && (
            <TouchableOpacity style={[styles.footerBtn, styles.draftBtn]} onPress={() => handleStatusChange(ad, 'draft')}>
              <Ionicons name="document-text" size={14} color="#fff" />
              <Text style={styles.footerBtnText}>Draft</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ─── MODAL TABS ──────────────────────────────────────────────────────────────

  const getStatusChipStyle = (s) => {
    if (formData.status !== s) return styles.chip;
    const map = { active: styles.chipStatusActive, paused: styles.chipStatusPaused, inactive: styles.chipStatusInactive, draft: styles.chipStatusDraft };
    return [styles.chip, map[s]];
  };
  const getStatusChipTextStyle = (s) => {
    if (formData.status !== s) return styles.chipText;
    const colors = { active: '#059669', paused: '#D97706', inactive: '#6B7280', draft: '#3B82F6' };
    return [styles.chipText, { color: colors[s], fontWeight: '600' }];
  };

  const renderBasicTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Title & Description */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} placeholder="e.g. Homepage Banner" value={formData.title} onChangeText={v => set('title', v)} placeholderTextColor="#CBD5E1" />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Optional notes about this ad" value={formData.description} onChangeText={v => set('description', v)} multiline numberOfLines={2} placeholderTextColor="#CBD5E1" />
      </View>

      {/* Type */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionDivider}>Ad Type</Text>
        <View style={styles.chipGroup}>
          {AD_TYPES.map(t => (
            <TouchableOpacity key={t} style={[styles.chip, formData.type === t && styles.chipSelected]} onPress={() => set('type', t)}>
              <Text style={[styles.chipText, formData.type === t && styles.chipTextSelected]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Position */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionDivider}>Position</Text>
        <View style={styles.chipGroup}>
          {AD_POSITIONS.map(p => (
            <TouchableOpacity key={p} style={[styles.chip, formData.position === p && styles.chipSelected]} onPress={() => set('position', p)}>
              <Text style={[styles.chipText, formData.position === p && styles.chipTextSelected]}>{p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Status + Priority + Active in one row area */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionDivider}>Status</Text>
        <View style={styles.chipGroup}>
          {AD_STATUSES.map(s => (
            <TouchableOpacity key={s} style={getStatusChipStyle(s)} onPress={() => set('status', s)}>
              <Text style={getStatusChipTextStyle(s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityRow}>
            {[1,3,5,7,10].map(n => (
              <TouchableOpacity key={n} style={[styles.priorityBtn, formData.priority === n && styles.priorityBtnActive]} onPress={() => set('priority', n)}>
                <Text style={[styles.priorityBtnText, formData.priority === n && styles.priorityBtnTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helpText}>1 = low · 10 = high</Text>
        </View>
        <View style={[styles.formHalf, { justifyContent: 'flex-end' }]}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Active</Text>
              <Text style={styles.helpText}>Show this ad</Text>
            </View>
            <Switch value={formData.isActive} onValueChange={v => set('isActive', v)} trackColor={{ false: '#E2E8F0', true: '#3B82F6' }} thumbColor="#fff" />
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderContentTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {formData.type === 'adsense' ? (
        <>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color="#0369A1" />
            <Text style={styles.infoBoxText}>Enter your AdSense publisher ID and slot ID. The embed code is auto-generated below.</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Publisher Client ID</Text>
            <TextInput style={styles.input} placeholder="ca-pub-XXXXXXXXXXXXXXXX" value={formData.adsense.adClient} onChangeText={v => setNested('adsense', 'adClient', v)} placeholderTextColor="#CBD5E1" autoCapitalize="none" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ad Slot ID</Text>
            <TextInput style={styles.input} placeholder="1234567890" value={formData.adsense.adSlot} onChangeText={v => setNested('adsense', 'adSlot', v)} placeholderTextColor="#CBD5E1" keyboardType="numeric" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ad Format</Text>
            <View style={styles.chipGroup}>
              {ADSENSE_FORMATS.map(f => (
                <TouchableOpacity key={f} style={[styles.chip, formData.adsense.adFormat === f && styles.chipSelected]} onPress={() => setNested('adsense', 'adFormat', f)}>
                  <Text style={[styles.chipText, formData.adsense.adFormat === f && styles.chipTextSelected]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Generated Embed Code</Text>
            <Text style={styles.codePreview} selectable>{generateAdSenseCode()}</Text>
          </View>
        </>
      ) : formData.type === 'admob' ? (
        <>
          <View style={styles.infoBox}>
            <Ionicons name="phone-portrait" size={16} color="#0369A1" />
            <Text style={styles.infoBoxText}>AdMob ads render natively in the mobile app using the Ad Unit ID below.</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ad Unit ID</Text>
            <TextInput style={styles.input} placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX" value={formData.admob.adUnitId} onChangeText={v => setNested('admob', 'adUnitId', v)} placeholderTextColor="#CBD5E1" autoCapitalize="none" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ad Size</Text>
            <View style={styles.chipGroup}>
              {ADMOB_SIZES.map(s => (
                <TouchableOpacity key={s} style={[styles.chip, formData.admob.adSize === s && styles.chipSelected]} onPress={() => setNested('admob', 'adSize', s)}>
                  <Text style={[styles.chipText, formData.admob.adSize === s && styles.chipTextSelected]}>{s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>HTML Content</Text>
            <TextInput style={[styles.input, styles.codeArea]} placeholder="<div>Your ad HTML here...</div>" value={formData.content.html} onChangeText={v => setNested('content', 'html', v)} multiline numberOfLines={4} placeholderTextColor="#CBD5E1" autoCapitalize="none" />
          </View>
          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput style={styles.input} placeholder="https://example.com/banner.jpg" value={formData.content.imageUrl} onChangeText={v => setNested('content', 'imageUrl', v)} placeholderTextColor="#CBD5E1" autoCapitalize="none" />
            </View>
            <View style={styles.formHalf}>
              <Text style={styles.label}>Image Alt Text</Text>
              <TextInput style={styles.input} placeholder="Advertisement" value={formData.content.imageAlt} onChangeText={v => setNested('content', 'imageAlt', v)} placeholderTextColor="#CBD5E1" />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Text style={styles.label}>Click URL</Text>
              <TextInput style={styles.input} placeholder="https://example.com" value={formData.content.linkUrl} onChangeText={v => setNested('content', 'linkUrl', v)} placeholderTextColor="#CBD5E1" autoCapitalize="none" />
            </View>
            <View style={styles.formHalf}>
              <Text style={styles.label}>CTA Text</Text>
              <TextInput style={styles.input} placeholder="Learn More" value={formData.content.linkText} onChangeText={v => setNested('content', 'linkText', v)} placeholderTextColor="#CBD5E1" />
            </View>
          </View>
        </>
      )}

      <Text style={styles.sectionDivider}>Display Settings</Text>
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Text style={styles.label}>Width (px)</Text>
          <TextInput style={styles.input} placeholder="728" value={String(formData.displaySettings.width || '')} onChangeText={v => setNested('displaySettings', 'width', parseInt(v) || 728)} keyboardType="numeric" placeholderTextColor="#CBD5E1" />
        </View>
        <View style={styles.formHalf}>
          <Text style={styles.label}>Height (px)</Text>
          <TextInput style={styles.input} placeholder="90" value={String(formData.displaySettings.height || '')} onChangeText={v => setNested('displaySettings', 'height', parseInt(v) || 90)} keyboardType="numeric" placeholderTextColor="#CBD5E1" />
        </View>
        <View style={styles.formHalf}>
          <Text style={styles.label}>BG Color</Text>
          <TextInput style={styles.input} placeholder="#ffffff" value={formData.displaySettings.backgroundColor} onChangeText={v => setNested('displaySettings', 'backgroundColor', v)} placeholderTextColor="#CBD5E1" autoCapitalize="none" />
        </View>
        <View style={styles.formHalf}>
          <Text style={styles.label}>Border Radius</Text>
          <TextInput style={styles.input} placeholder="0" value={String(formData.displaySettings.borderRadius || 0)} onChangeText={v => setNested('displaySettings', 'borderRadius', parseInt(v) || 0)} keyboardType="numeric" placeholderTextColor="#CBD5E1" />
        </View>
      </View>
    </ScrollView>
  );

  const renderTargetingTab = () => (
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.formGroup}>
          <Text style={styles.sectionDivider}>Target Pages</Text>
          <Text style={styles.helpText}>Which pages should this ad appear on?</Text>
          <View style={[styles.chipGroup, { marginTop: 8 }]}>
            {TARGET_PAGES.map(p => (
              <TouchableOpacity key={p} style={[styles.chip, formData.targeting.pages.includes(p) && styles.chipSelected]} onPress={() => toggleArray('targeting', 'pages', p)}>
                <Text style={[styles.chipText, formData.targeting.pages.includes(p) && styles.chipTextSelected]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.sectionDivider}>User Types</Text>
          <View style={styles.chipGroup}>
            {TARGET_USERS.map(u => (
              <TouchableOpacity key={u} style={[styles.chip, formData.targeting.userTypes.includes(u) && styles.chipSelected]} onPress={() => toggleArray('targeting', 'userTypes', u)}>
                <Text style={[styles.chipText, formData.targeting.userTypes.includes(u) && styles.chipTextSelected]}>{u.charAt(0).toUpperCase() + u.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.sectionDivider}>Devices</Text>
          <View style={styles.chipGroup}>
            {TARGET_DEVICES.map(d => (
              <TouchableOpacity key={d} style={[styles.chip, formData.targeting.devices.includes(d) && styles.chipSelected]} onPress={() => toggleArray('targeting', 'devices', d)}>
                <Text style={[styles.chipText, formData.targeting.devices.includes(d) && styles.chipTextSelected]}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    );

  const renderScheduleTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.infoBox}>
        <Ionicons name="calendar" size={16} color="#0369A1" />
        <Text style={styles.infoBoxText}>Leave end date empty for indefinite display. Ad shows between start and end dates.</Text>
      </View>
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Text style={styles.label}>Start Date</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.schedule.startDate} onChangeText={v => setNested('schedule', 'startDate', v)} placeholderTextColor="#CBD5E1" />
        </View>
        <View style={styles.formHalf}>
          <Text style={styles.label}>End Date (optional)</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.schedule.endDate} onChangeText={v => setNested('schedule', 'endDate', v)} placeholderTextColor="#CBD5E1" />
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Timezone</Text>
        <TextInput style={styles.input} placeholder="UTC" value={formData.schedule.timezone} onChangeText={v => setNested('schedule', 'timezone', v)} placeholderTextColor="#CBD5E1" />
      </View>
    </ScrollView>
  );

  const renderPerformanceTab = () => {
    if (!editMode || !currentAd) return <View style={{ padding: 20 }}><Text style={{ color: '#6B7280', textAlign: 'center' }}>Performance data available after ad is created.</Text></View>;
    const ctr = currentAd.performance?.impressions > 0 ? ((currentAd.performance.clicks / currentAd.performance.impressions) * 100).toFixed(2) : '0.00';
    const items = [
      { icon: 'eye', color: '#3B82F6', value: (currentAd.performance?.impressions || 0).toLocaleString(), label: 'Impressions' },
      { icon: 'hand-left', color: '#10B981', value: (currentAd.performance?.clicks || 0).toLocaleString(), label: 'Clicks' },
      { icon: 'analytics', color: '#F59E0B', value: `${ctr}%`, label: 'CTR' },
      { icon: 'cash', color: '#8B5CF6', value: `$${(currentAd.performance?.revenue || 0).toFixed(2)}`, label: 'Revenue' },
    ];
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.sectionDivider}>Performance Metrics</Text>
          <View style={styles.perfGrid}>
            {items.map(({ icon, color, value, label }) => (
              <View key={label} style={styles.perfCard}>
                <Ionicons name={icon} size={24} color={color} />
                <Text style={styles.perfCardValue}>{value}</Text>
                <Text style={styles.perfCardLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.resetStatsBtn} onPress={() => handleResetStats(currentAd)}>
            <Ionicons name="refresh" size={16} color="#EF4444" />
            <Text style={styles.resetStatsBtnText}>Reset Stats</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.sectionDivider}>Ad Details</Text>
          <Text style={styles.helpText}>Created: {currentAd.createdAt ? new Date(currentAd.createdAt).toLocaleDateString() : 'N/A'}</Text>
          <Text style={styles.helpText}>Modified: {currentAd.updatedAt ? new Date(currentAd.updatedAt).toLocaleDateString() : 'N/A'}</Text>
          <Text style={[styles.helpText, { fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier' }]}>ID: {currentAd._id}</Text>
        </View>
      </ScrollView>
    );
  };

  const TABS = [
    { key: 'basic', label: 'Basic' },
    { key: 'content', label: 'Content' },
    { key: 'targeting', label: 'Targeting' },
    { key: 'schedule', label: 'Schedule' },
    ...(editMode ? [{ key: 'performance', label: 'Performance' }] : []),
  ];

  const renderModal = () => (
    <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={closeModal}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
        <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()} style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.modalIconWrap}>
                <Ionicons name={editMode ? 'create' : 'megaphone'} size={18} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.modalTitle}>{editMode ? 'Edit Advertisement' : 'New Advertisement'}</Text>
                <Text style={styles.modalSubtitle}>{editMode ? `Editing: ${currentAd?.title}` : 'Fill in the details below'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModal}>
              <Ionicons name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row' }}>
              {TABS.map(tab => (
                <TouchableOpacity key={tab.key} style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]} onPress={() => setActiveTab(tab.key)}>
                  <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Body */}
          <View style={styles.modalBody}>
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'content' && renderContentTab()}
            {activeTab === 'targeting' && renderTargetingTab()}
            {activeTab === 'schedule' && renderScheduleTab()}
            {activeTab === 'performance' && renderPerformanceTab()}
          </View>
          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, saving && styles.savingBtn]} onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <><Ionicons name={editMode ? 'checkmark' : 'add'} size={15} color="#fff" /><Text style={styles.saveBtnText}>{editMode ? 'Update' : 'Create Ad'}</Text></>
              }
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  // ─── MAIN RENDER ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminLayout title="Advertisement Management" activeScreen="AdminAdvertisementManagement" onNavigate={handleNavigate} onLogout={handleLogout}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading advertisements...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Advertisement Management" activeScreen="AdminAdvertisementManagement" onNavigate={handleNavigate} onLogout={handleLogout}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.pageTitle}>Advertisement Management</Text>
            <Text style={styles.pageSubtitle}>Manage banners, AdSense, AdMob & custom ads · {filteredAds.length} ads</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshButton} onPress={() => fetchAll(true)}>
              <Ionicons name={refreshing ? 'sync' : 'refresh'} size={18} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={openAdd}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.addButtonText}>New Ad</Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderStats()}
        {renderFilters()}

        <ScrollView
          style={styles.adsList}
          contentContainerStyle={styles.adsListContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} colors={['#3B82F6']} />}
        >
          {filteredAds.length > 0 ? filteredAds.map(renderAdCard) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No advertisements found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first advertisement to get started'}
              </Text>
              {!searchQuery && selectedType === 'all' && selectedStatus === 'all' && (
                <TouchableOpacity style={[styles.addButton, { marginTop: 20 }]} onPress={openAdd}>
                  <Ionicons name="add-circle" size={18} color="#fff" />
                  <Text style={styles.addButtonText}>Create First Ad</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {renderModal()}
      </View>
    </AdminLayout>
  );
};

export default AdminAdvertisementManagementScreen;
