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

const EMPTY_FORM = { question: '', answer: '', category: 'General', order: 0, isActive: true, isFeatured: false };

const getStyles = (isMobile) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? 14 : 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  pageTitle: { fontSize: isMobile ? 18 : 22, fontWeight: '700', color: '#0F172A' },
  pageSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 6 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  refreshBtn: { padding: 9, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  statsRow: { flexDirection: 'row', padding: isMobile ? 12 : 16, gap: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: 80, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statVal: { fontSize: isMobile ? 18 : 22, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  toolbar: { flexDirection: isMobile ? 'column' : 'row', gap: 10, padding: isMobile ? 12 : 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, paddingVertical: 9, fontSize: 13, color: '#0F172A' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterChipText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  list: { flex: 1 },
  listContent: { padding: isMobile ? 12 : 16, gap: 10 },
  // Category group
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 6 },
  categoryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6 },
  categoryCount: { fontSize: 11, color: '#94A3B8' },
  // FAQ card
  faqCard: { backgroundColor: '#fff', borderRadius: 10, padding: isMobile ? 12 : 14, borderWidth: 1, borderColor: '#E2E8F0' },
  faqCardInactive: { opacity: 0.55 },
  faqCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  faqCardLeft: { flex: 1 },
  faqQuestion: { fontSize: isMobile ? 14 : 15, fontWeight: '600', color: '#0F172A', lineHeight: 20 },
  faqAnswer: { fontSize: 13, color: '#64748B', marginTop: 6, lineHeight: 19 },
  faqMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  faqActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 7, borderRadius: 6, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#94A3B8', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#CBD5E1', marginTop: 6, textAlign: 'center' },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', alignItems: 'center', padding: isMobile ? 10 : 24 },
  modal: {
    backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 640,
    ...(Platform.OS === 'web' ? { maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' } : { maxHeight: '90%', elevation: 20 }),
    overflow: 'hidden',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? 14 : 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalIconWrap: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  modalSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  modalCloseBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  modalBody: { ...(Platform.OS === 'web' ? { flex: 1, overflowY: 'auto' } : { flex: 1 }), padding: isMobile ? 14 : 20 },
  formGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9, fontSize: 13, color: '#0F172A' },
  textArea: { minHeight: 100, textAlignVertical: 'top', lineHeight: 19 },
  formRow: { flexDirection: isMobile ? 'column' : 'row', gap: 12 },
  formHalf: { flex: 1 },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 6, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  chipSelected: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  chipText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  chipTextSelected: { color: '#3B82F6', fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  helpText: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  sectionDivider: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  newCatInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8, fontSize: 13, color: '#0F172A', marginTop: 8 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: isMobile ? 14 : 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, backgroundColor: '#3B82F6' },
  saveBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  savingBtn: { backgroundColor: '#93C5FD' },
});

const PRESET_CATEGORIES = ['General', 'Job Seekers', 'Employers', 'Account & Billing', 'Technical', 'Privacy & Security'];

export default function AdminFAQsScreen({ navigation }) {
  const { isMobile } = useResponsive();
  const styles = getStyles(isMobile);

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFaq, setCurrentFaq] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCat, setShowCustomCat] = useState(false);

  const getToken = async () => AsyncStorage.getItem('token');

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const token = await getToken();
      const h = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      const [faqRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/faqs/admin/list?limit=500`, { headers: h }),
        fetch(`${API_URL}/faqs/admin/stats`, { headers: h }),
      ]);
      const [faqData, statsData] = await Promise.all([faqRes.json(), statsRes.json()]);
      if (faqData.success) { setFaqs(faqData.data); setFiltered(faqData.data); setCategories(faqData.categories || []); }
      if (statsData.success) setStats(statsData.data);
    } catch (e) { Alert.alert('Error', 'Failed to load FAQs'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    let f = [...faqs];
    if (search) f = f.filter(x => x.question.toLowerCase().includes(search.toLowerCase()) || x.answer.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== 'all') f = f.filter(x => x.category === catFilter);
    if (statusFilter === 'active') f = f.filter(x => x.isActive);
    if (statusFilter === 'inactive') f = f.filter(x => !x.isActive);
    setFiltered(f);
  }, [search, catFilter, statusFilter, faqs]);

  const apiCall = async (url, method, body) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}${url}`, {
      method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  };

  const handleSave = async () => {
    if (!form.question.trim()) { Alert.alert('Validation', 'Question is required'); return; }
    if (!form.answer.trim()) { Alert.alert('Validation', 'Answer is required'); return; }
    const finalCategory = showCustomCat && customCategory.trim() ? customCategory.trim() : form.category;
    setSaving(true);
    try {
      const payload = { ...form, category: finalCategory };
      const url = editMode ? `/faqs/admin/${currentFaq._id}` : '/faqs/admin/create';
      const data = await apiCall(url, editMode ? 'PUT' : 'POST', payload);
      if (data.success) { Alert.alert('Success', editMode ? 'FAQ updated!' : 'FAQ created!'); closeModal(); fetchAll(); }
      else Alert.alert('Error', data.message || 'Operation failed');
    } catch (e) { Alert.alert('Error', 'Failed to save FAQ'); }
    finally { setSaving(false); }
  };

  const handleDelete = (faq) => {
    Alert.alert('Delete FAQ', `Delete this FAQ?\n\n"${faq.question}"`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const data = await apiCall(`/faqs/admin/${faq._id}`, 'DELETE');
        if (data.success) fetchAll(); else Alert.alert('Error', data.message);
      }}
    ]);
  };

  const handleToggle = async (faq) => {
    const data = await apiCall(`/faqs/admin/${faq._id}/toggle`, 'PUT');
    if (data.success) fetchAll(); else Alert.alert('Error', data.message);
  };

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditMode(false); setCurrentFaq(null); setCustomCategory(''); setShowCustomCat(false); setModalVisible(true); };
  const openEdit = (faq) => {
    setCurrentFaq(faq);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, order: faq.order || 0, isActive: faq.isActive, isFeatured: faq.isFeatured || false });
    setShowCustomCat(!PRESET_CATEGORIES.includes(faq.category));
    setCustomCategory(!PRESET_CATEGORIES.includes(faq.category) ? faq.category : '');
    setEditMode(true); setModalVisible(true);
  };
  const closeModal = () => { setModalVisible(false); setEditMode(false); setCurrentFaq(null); };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Group filtered FAQs by category
  const grouped = filtered.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const renderModal = () => (
    <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={closeModal}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeModal}>
        <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()} style={styles.modal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.modalIconWrap}><Ionicons name={editMode ? 'create' : 'help-circle'} size={17} color="#3B82F6" /></View>
              <View>
                <Text style={styles.modalTitle}>{editMode ? 'Edit FAQ' : 'New FAQ'}</Text>
                <Text style={styles.modalSubtitle}>{editMode ? `Editing question` : 'Add a new question & answer'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModal}><Ionicons name="close" size={15} color="#64748B" /></TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.formGroup}>
              <Text style={styles.label}>Question *</Text>
              <TextInput style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]} placeholder="e.g. How do I reset my password?" value={form.question} onChangeText={v => set('question', v)} multiline numberOfLines={2} placeholderTextColor="#CBD5E1" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Answer *</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Provide a clear, helpful answer..." value={form.answer} onChangeText={v => set('answer', v)} multiline numberOfLines={5} placeholderTextColor="#CBD5E1" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.sectionDivider}>Category</Text>
              <View style={styles.chipGroup}>
                {PRESET_CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} style={[styles.chip, form.category === cat && !showCustomCat && styles.chipSelected]}
                    onPress={() => { set('category', cat); setShowCustomCat(false); setCustomCategory(''); }}>
                    <Text style={[styles.chipText, form.category === cat && !showCustomCat && styles.chipTextSelected]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={[styles.chip, showCustomCat && styles.chipSelected]} onPress={() => setShowCustomCat(true)}>
                  <Text style={[styles.chipText, showCustomCat && styles.chipTextSelected]}>+ Custom</Text>
                </TouchableOpacity>
              </View>
              {showCustomCat && (
                <TextInput style={styles.newCatInput} placeholder="Enter custom category name" value={customCategory} onChangeText={setCustomCategory} placeholderTextColor="#CBD5E1" />
              )}
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Display Order</Text>
                <TextInput style={styles.input} placeholder="0" value={String(form.order)} onChangeText={v => set('order', parseInt(v) || 0)} keyboardType="numeric" placeholderTextColor="#CBD5E1" />
                <Text style={styles.helpText}>Lower = shown first</Text>
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Settings</Text>
                <View style={styles.switchRow}>
                  <View><Text style={styles.label}>Active</Text><Text style={styles.helpText}>Show on website</Text></View>
                  <Switch value={form.isActive} onValueChange={v => set('isActive', v)} trackColor={{ false: '#E2E8F0', true: '#3B82F6' }} thumbColor="#fff" />
                </View>
                <View style={[styles.switchRow, { marginTop: 6 }]}>
                  <View><Text style={styles.label}>Featured</Text><Text style={styles.helpText}>Highlight this FAQ</Text></View>
                  <Switch value={form.isFeatured} onValueChange={v => set('isFeatured', v)} trackColor={{ false: '#E2E8F0', true: '#F59E0B' }} thumbColor="#fff" />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, saving && styles.savingBtn]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <><Ionicons name={editMode ? 'checkmark' : 'add'} size={14} color="#fff" /><Text style={styles.saveBtnText}>{editMode ? 'Update' : 'Create FAQ'}</Text></>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) return (
    <AdminLayout title="FAQ Management" activeScreen="AdminFAQs" onNavigate={handleNavigate} onLogout={handleLogout}>
      <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#3B82F6" /></View>
    </AdminLayout>
  );

  return (
    <AdminLayout title="FAQ Management" activeScreen="AdminFAQs" onNavigate={handleNavigate} onLogout={handleLogout}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>FAQ Management</Text>
            <Text style={styles.pageSubtitle}>Manage frequently asked questions · {filtered.length} FAQs</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchAll(true)}>
              <Ionicons name="refresh" size={17} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
              <Ionicons name="add-circle" size={17} color="#fff" />
              <Text style={styles.addBtnText}>New FAQ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsRow}>
            {[
              { icon: 'help-circle', color: '#3B82F6', val: stats.total, label: 'Total' },
              { icon: 'checkmark-circle', color: '#10B981', val: stats.active, label: 'Active' },
              { icon: 'close-circle', color: '#94A3B8', val: stats.inactive, label: 'Inactive' },
              { icon: 'star', color: '#F59E0B', val: stats.featured, label: 'Featured' },
            ].map(({ icon, color, val, label }) => (
              <View key={label} style={styles.statCard}>
                <Ionicons name={icon} size={18} color={color} />
                <Text style={styles.statVal}>{val}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
            <TextInput style={styles.searchInput} placeholder="Search FAQs..." value={search} onChangeText={setSearch} placeholderTextColor="#CBD5E1" />
            {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color="#94A3B8" /></TouchableOpacity> : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {['all', ...categories].map(c => (
                <TouchableOpacity key={c} style={[styles.filterChip, catFilter === c && styles.filterChipActive]} onPress={() => setCatFilter(c)}>
                  <Text style={[styles.filterChipText, catFilter === c && styles.filterChipTextActive]}>{c === 'all' ? 'All Categories' : c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([val, label]) => (
                <TouchableOpacity key={val} style={[styles.filterChip, statusFilter === val && styles.filterChipActive]} onPress={() => setStatusFilter(val)}>
                  <Text style={[styles.filterChipText, statusFilter === val && styles.filterChipTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* List */}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} colors={['#3B82F6']} />}>
          {Object.keys(grouped).length > 0 ? Object.entries(grouped).map(([cat, items]) => (
            <View key={cat}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryDot} />
                <Text style={styles.categoryLabel}>{cat}</Text>
                <Text style={styles.categoryCount}>({items.length})</Text>
              </View>
              {items.map(faq => (
                <View key={faq._id} style={[styles.faqCard, !faq.isActive && styles.faqCardInactive, { marginBottom: 8 }]}>
                  <View style={styles.faqCardTop}>
                    <View style={styles.faqCardLeft}>
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                      <Text style={styles.faqAnswer} numberOfLines={2}>{faq.answer}</Text>
                      <View style={styles.faqMeta}>
                        <View style={[styles.badge, { backgroundColor: faq.isActive ? '#ECFDF5' : '#F1F5F9' }]}>
                          <Ionicons name={faq.isActive ? 'checkmark-circle' : 'ellipse-outline'} size={11} color={faq.isActive ? '#059669' : '#94A3B8'} />
                          <Text style={[styles.badgeText, { color: faq.isActive ? '#059669' : '#94A3B8' }]}>{faq.isActive ? 'Active' : 'Inactive'}</Text>
                        </View>
                        {faq.isFeatured && (
                          <View style={[styles.badge, { backgroundColor: '#FFFBEB' }]}>
                            <Ionicons name="star" size={11} color="#D97706" />
                            <Text style={[styles.badgeText, { color: '#D97706' }]}>Featured</Text>
                          </View>
                        )}
                        {faq.order > 0 && <Text style={{ fontSize: 11, color: '#CBD5E1' }}>Order: {faq.order}</Text>}
                      </View>
                    </View>
                    <View style={styles.faqActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(faq)}><Ionicons name="create-outline" size={16} color="#3B82F6" /></TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggle(faq)}>
                        <Ionicons name={faq.isActive ? 'eye-off-outline' : 'eye-outline'} size={16} color={faq.isActive ? '#F59E0B' : '#10B981'} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(faq)}><Ionicons name="trash-outline" size={16} color="#EF4444" /></TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )) : (
            <View style={styles.emptyBox}>
              <Ionicons name="help-circle-outline" size={56} color="#E2E8F0" />
              <Text style={styles.emptyText}>No FAQs found</Text>
              <Text style={styles.emptySubtext}>{search || catFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first FAQ to get started'}</Text>
              {!search && catFilter === 'all' && (
                <TouchableOpacity style={[styles.addBtn, { marginTop: 16 }]} onPress={openAdd}>
                  <Ionicons name="add-circle" size={16} color="#fff" />
                  <Text style={styles.addBtnText}>Create First FAQ</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {renderModal()}
      </View>
    </AdminLayout>
  );
}
