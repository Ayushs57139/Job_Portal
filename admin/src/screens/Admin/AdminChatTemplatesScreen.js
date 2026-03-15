import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, Platform
} from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const INDIGO = '#4F46E5';
const CATEGORIES = ['greeting', 'jobs', 'application', 'resume', 'company', 'packages', 'support', 'interview', 'general', 'custom'];
const DYNAMIC_TYPES = ['none', 'jobs', 'packages', 'candidates', 'companies'];

const EMPTY_FORM = {
  triggerKeywords: '',
  responseText: '',
  category: 'general',
  suggestedReplies: '',
  attachDynamicData: 'none',
  priority: '0',
  isActive: true,
};

const AdminChatTemplatesScreen = ({ navigation }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => { fetchTemplates(); }, []);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      const res = await fetch(`${API_URL}/chatbot/templates`, { headers });
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (tpl) => {
    setEditing(tpl);
    setForm({
      triggerKeywords: (tpl.triggerKeywords || []).join(', '),
      responseText: tpl.responseText || '',
      category: tpl.category || 'general',
      suggestedReplies: (tpl.suggestedReplies || []).join(', '),
      attachDynamicData: tpl.attachDynamicData || 'none',
      priority: String(tpl.priority ?? 0),
      isActive: tpl.isActive !== false,
    });
    setModalOpen(true);
  };

  const saveTemplate = async () => {
    if (!form.responseText.trim()) {
      Alert.alert('Validation', 'Response text is required');
      return;
    }
    setSaving(true);
    try {
      const headers = await getHeaders();
      const body = {
        triggerKeywords: form.triggerKeywords.split(',').map(k => k.trim()).filter(Boolean),
        responseText: form.responseText.trim(),
        category: form.category,
        suggestedReplies: form.suggestedReplies.split(',').map(s => s.trim()).filter(Boolean),
        attachDynamicData: form.attachDynamicData,
        priority: parseInt(form.priority) || 0,
        isActive: form.isActive,
      };

      const url = editing ? `${API_URL}/chatbot/templates/${editing._id}` : `${API_URL}/chatbot/templates`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const data = await res.json();

      if (data.success) {
        setModalOpen(false);
        fetchTemplates();
      } else {
        Alert.alert('Error', data.message || 'Failed to save');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = (id) => {
    Alert.alert('Delete', 'Delete this template?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const headers = await getHeaders();
          await fetch(`${API_URL}/chatbot/templates/${id}`, { method: 'DELETE', headers });
          fetchTemplates();
        }
      }
    ]);
  };

  const toggleActive = async (tpl) => {
    const headers = await getHeaders();
    await fetch(`${API_URL}/chatbot/templates/${tpl._id}`, {
      method: 'PUT', headers,
      body: JSON.stringify({ ...tpl, isActive: !tpl.isActive })
    });
    fetchTemplates();
  };

  const filtered = templates.filter(t =>
    !searchQ ||
    t.responseText?.toLowerCase().includes(searchQ.toLowerCase()) ||
    t.triggerKeywords?.some(k => k.includes(searchQ.toLowerCase())) ||
    t.category?.includes(searchQ.toLowerCase())
  );

  const catColor = {
    greeting: '#10B981', jobs: INDIGO, application: '#F59E0B', resume: '#8B5CF6',
    company: '#06B6D4', packages: '#EF4444', support: '#64748B',
    interview: '#F97316', general: '#94A3B8', custom: '#EC4899'
  };

  return (
    <AdminLayout
      title="Chat Templates"
      activeScreen="AdminChatTemplates"
      onNavigate={(s) => navigation.navigate(s)}
      onLogout={() => navigation.replace('AdminLogin')}
    >
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={S.container}>

          <View style={S.pageHeader}>
            <View>
              <Text style={S.pageTitle}>Reply Templates</Text>
              <Text style={S.pageSub}>Manage chatbot auto-reply templates</Text>
            </View>
            <TouchableOpacity style={S.addBtn} onPress={openCreate}>
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={S.addBtnText}>Add Template</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={S.searchBox}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={S.searchInput}
              placeholder="Search templates..."
              value={searchQ}
              onChangeText={setSearchQ}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={S.count}>{filtered.length} template{filtered.length !== 1 ? 's' : ''}</Text>

          {loading ? (
            <View style={S.center}><ActivityIndicator size="large" color={INDIGO} /></View>
          ) : filtered.length === 0 ? (
            <View style={S.empty}>
              <Ionicons name="document-text-outline" size={56} color="#CBD5E1" />
              <Text style={S.emptyText}>No templates yet</Text>
              <Text style={S.emptySub}>Add templates to make the chatbot smarter</Text>
            </View>
          ) : (
            filtered.map(tpl => (
              <View key={tpl._id} style={[S.card, !tpl.isActive && S.cardInactive]}>
                <View style={S.cardTop}>
                  <View style={[S.catBadge, { backgroundColor: (catColor[tpl.category] || '#94A3B8') + '18' }]}>
                    <Text style={[S.catText, { color: catColor[tpl.category] || '#94A3B8' }]}>{tpl.category}</Text>
                  </View>
                  <View style={S.cardActions}>
                    <TouchableOpacity style={S.iconBtn} onPress={() => toggleActive(tpl)}>
                      <Ionicons name={tpl.isActive ? 'toggle' : 'toggle-outline'} size={22} color={tpl.isActive ? '#10B981' : '#94A3B8'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={S.iconBtn} onPress={() => openEdit(tpl)}>
                      <Ionicons name="pencil" size={16} color={INDIGO} />
                    </TouchableOpacity>
                    <TouchableOpacity style={S.iconBtn} onPress={() => deleteTemplate(tpl._id)}>
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {tpl.triggerKeywords?.length > 0 && (
                  <View style={S.keywordsRow}>
                    {tpl.triggerKeywords.slice(0, 5).map((kw, i) => (
                      <View key={i} style={S.kwChip}><Text style={S.kwText}>{kw}</Text></View>
                    ))}
                    {tpl.triggerKeywords.length > 5 && (
                      <Text style={S.kwMore}>+{tpl.triggerKeywords.length - 5}</Text>
                    )}
                  </View>
                )}

                <Text style={S.responseText} numberOfLines={3}>{tpl.responseText}</Text>

                <View style={S.cardMeta}>
                  {tpl.attachDynamicData !== 'none' && (
                    <View style={S.dynamicBadge}>
                      <Ionicons name="flash" size={12} color="#F59E0B" />
                      <Text style={S.dynamicText}>Dynamic: {tpl.attachDynamicData}</Text>
                    </View>
                  )}
                  <Text style={S.priorityText}>Priority: {tpl.priority}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={S.modalOverlay}>
          <View style={S.modal}>
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>{editing ? 'Edit Template' : 'New Template'}</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={S.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={S.label}>Trigger Keywords <Text style={S.hint}>(comma-separated)</Text></Text>
              <TextInput
                style={S.input}
                placeholder="e.g. job, jobs, vacancy, opening"
                value={form.triggerKeywords}
                onChangeText={v => setForm(f => ({ ...f, triggerKeywords: v }))}
                placeholderTextColor="#94A3B8"
              />

              <Text style={S.label}>Response Text *</Text>
              <TextInput
                style={[S.input, S.textarea]}
                placeholder="Enter the bot's response..."
                value={form.responseText}
                onChangeText={v => setForm(f => ({ ...f, responseText: v }))}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholderTextColor="#94A3B8"
              />

              <Text style={S.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.catRow}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[S.catChip, form.category === cat && S.catChipActive]}
                    onPress={() => setForm(f => ({ ...f, category: cat }))}
                  >
                    <Text style={[S.catChipText, form.category === cat && S.catChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={S.label}>Suggested Replies <Text style={S.hint}>(comma-separated)</Text></Text>
              <TextInput
                style={S.input}
                placeholder="e.g. Find Jobs, Resume Tips, Contact Support"
                value={form.suggestedReplies}
                onChangeText={v => setForm(f => ({ ...f, suggestedReplies: v }))}
                placeholderTextColor="#94A3B8"
              />

              <Text style={S.label}>Attach Dynamic Data</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.catRow}>
                {DYNAMIC_TYPES.map(dt => (
                  <TouchableOpacity
                    key={dt}
                    style={[S.catChip, form.attachDynamicData === dt && S.catChipActive]}
                    onPress={() => setForm(f => ({ ...f, attachDynamicData: dt }))}
                  >
                    <Text style={[S.catChipText, form.attachDynamicData === dt && S.catChipTextActive]}>{dt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={S.label}>Priority <Text style={S.hint}>(higher = matched first)</Text></Text>
              <TextInput
                style={S.input}
                placeholder="0"
                value={form.priority}
                onChangeText={v => setForm(f => ({ ...f, priority: v }))}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />

              <View style={S.activeRow}>
                <Text style={S.label}>Active</Text>
                <TouchableOpacity onPress={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                  <Ionicons name={form.isActive ? 'toggle' : 'toggle-outline'} size={28} color={form.isActive ? '#10B981' : '#94A3B8'} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={S.modalFooter}>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={S.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.saveBtn, saving && S.saveBtnDisabled]} onPress={saveTemplate} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={S.saveText}>{editing ? 'Update' : 'Create'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
};

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAFF' },
  container: { padding: 20 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  pageSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: INDIGO, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 8, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  count: { fontSize: 13, color: '#64748B', marginBottom: 14 },

  center: { padding: 40, alignItems: 'center' },
  empty: { padding: 60, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#94A3B8', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#CBD5E1', marginTop: 4 },

  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardInactive: { opacity: 0.55 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  catText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  cardActions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F8FAFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  keywordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  kwChip: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  kwText: { fontSize: 11, color: INDIGO, fontWeight: '500' },
  kwMore: { fontSize: 11, color: '#94A3B8', alignSelf: 'center' },
  responseText: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 10 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dynamicBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  dynamicText: { fontSize: 11, color: '#D97706', fontWeight: '500' },
  priorityText: { fontSize: 11, color: '#94A3B8' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '92%', maxWidth: 560, maxHeight: '88%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px rgba(0,0,0,0.2)' } : { elevation: 8 }) },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  modalBody: { padding: 20, maxHeight: 480 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  hint: { fontWeight: '400', color: '#94A3B8' },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1E293B', backgroundColor: '#FAFBFF' },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  catRow: { marginBottom: 4 },
  catChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  catChipActive: { backgroundColor: INDIGO, borderColor: INDIGO },
  catChipText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  catChipTextActive: { color: '#FFF', fontWeight: '600' },
  activeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  cancelText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: INDIGO, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { fontSize: 14, color: '#FFF', fontWeight: '700' },
});

export default AdminChatTemplatesScreen;
