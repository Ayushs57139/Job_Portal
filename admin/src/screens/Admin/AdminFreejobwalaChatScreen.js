import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Alert, TextInput, Modal, Platform, FlatList
} from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const INDIGO = '#4F46E5';
const LIGHT_BG = '#F8FAFF';

const AdminFreejobwalaChatScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stats, setStats] = useState(null);

  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);
  const [activeConv, setActiveConv] = useState(null);
  const [adminInput, setAdminInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    let result = [...conversations];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.guestName?.toLowerCase().includes(q) ||
        c.guestEmail?.toLowerCase().includes(q) ||
        c.sessionId?.includes(q)
      );
    }
    if (selectedStatus !== 'all') result = result.filter(c => c.status === selectedStatus);
    setFiltered(result);
  }, [searchQuery, selectedStatus, conversations]);

  const fetchAll = async () => {
    await Promise.all([fetchConversations(), fetchStats()]);
  };

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      const res = await fetch(`${API_URL}/admin/chatbot/conversations?limit=100`, { headers });
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_URL}/admin/chatbot/stats`, { headers });
      if (res.ok) { const d = await res.json(); setStats(d.stats); }
    } catch (e) { console.error(e); }
  };

  const openChat = async (conv) => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_URL}/admin/chatbot/conversations/${conv._id}`, { headers });
      const data = await res.json();
      setActiveConv(data.conversation || conv);
      setChatOpen(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 200);
    } catch (e) {
      setActiveConv(conv);
      setChatOpen(true);
    }
  };

  const sendAdminMessage = async () => {
    if (!adminInput.trim() || !activeConv) return;
    setSending(true);
    try {
      const headers = await getHeaders();
      await fetch(`${API_URL}/chatbot/admin/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sessionId: activeConv.sessionId, message: adminInput.trim() })
      });
      // Refresh conversation
      const res = await fetch(`${API_URL}/admin/chatbot/conversations/${activeConv._id}`, { headers });
      const data = await res.json();
      setActiveConv(data.conversation);
      setAdminInput('');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!activeConv) return;
    try {
      const headers = await getHeaders();
      await fetch(`${API_URL}/admin/chatbot/conversations/${activeConv._id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ status: newStatus })
      });
      setChatOpen(false);
      fetchAll();
    } catch (e) { Alert.alert('Error', 'Failed to update'); }
  };

  const deleteConv = (id) => {
    Alert.alert('Delete', 'Delete this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const headers = await getHeaders();
          await fetch(`${API_URL}/admin/chatbot/conversations/${id}`, { method: 'DELETE', headers });
          setChatOpen(false);
          fetchAll();
        }
      }
    ]);
  };

  const fmtTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const statusColor = { active: '#10B981', closed: '#6B7280', archived: '#9CA3AF' };

  return (
    <AdminLayout
      title="Freejobwala Chat"
      activeScreen="AdminFreejobwalaChat"
      onNavigate={(s) => navigation.navigate(s)}
      onLogout={() => navigation.replace('AdminLogin')}
    >
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={S.container}>

          {/* Header */}
          <View style={S.pageHeader}>
            <View>
              <Text style={S.pageTitle}>Chatbot Dashboard</Text>
              <Text style={S.pageSub}>Manage all chatbot conversations in real-time</Text>
            </View>
            <View style={S.headerActions}>
              <TouchableOpacity style={S.refreshBtn} onPress={fetchAll}>
                <Ionicons name="refresh" size={18} color={INDIGO} />
              </TouchableOpacity>
              <TouchableOpacity style={S.templateBtn} onPress={() => navigation.navigate('AdminChatTemplates')}>
                <Ionicons name="list" size={16} color="#FFF" />
                <Text style={S.templateBtnText}>Templates</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          {stats && (
            <View style={S.statsRow}>
              {[
                { label: 'Total', value: stats.total, icon: 'chatbubbles', color: INDIGO },
                { label: 'Active', value: stats.active, icon: 'radio-button-on', color: '#10B981' },
                { label: 'Closed', value: stats.closed, icon: 'checkmark-circle', color: '#6B7280' },
                { label: 'Messages', value: stats.totalMessages, icon: 'chatbox-ellipses', color: '#F59E0B' },
              ].map(s => (
                <View key={s.label} style={S.statCard}>
                  <View style={[S.statIcon, { backgroundColor: s.color + '18' }]}>
                    <Ionicons name={s.icon} size={20} color={s.color} />
                  </View>
                  <Text style={S.statNum}>{s.value ?? 0}</Text>
                  <Text style={S.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Search + Filter */}
          <View style={S.searchRow}>
            <View style={S.searchBox}>
              <Ionicons name="search" size={18} color="#94A3B8" />
              <TextInput
                style={S.searchInput}
                placeholder="Search by name, email, session..."
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

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.filterRow}>
            {['all', 'active', 'closed', 'archived'].map(s => (
              <TouchableOpacity
                key={s}
                style={[S.chip, selectedStatus === s && S.chipActive]}
                onPress={() => setSelectedStatus(s)}
              >
                <Text style={[S.chipText, selectedStatus === s && S.chipTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={S.resultCount}>{filtered.length} conversation{filtered.length !== 1 ? 's' : ''}</Text>

          {/* List */}
          {loading ? (
            <View style={S.center}><ActivityIndicator size="large" color={INDIGO} /></View>
          ) : filtered.length === 0 ? (
            <View style={S.empty}>
              <Ionicons name="chatbubbles-outline" size={56} color="#CBD5E1" />
              <Text style={S.emptyText}>No conversations found</Text>
            </View>
          ) : (
            filtered.map((conv) => (
              <View key={conv._id} style={S.convCard}>
                <View style={S.convTop}>
                  <View style={S.avatar}>
                    <Text style={S.avatarText}>{(conv.guestName || 'G')[0].toUpperCase()}</Text>
                  </View>
                  <View style={S.convInfo}>
                    <Text style={S.convName}>{conv.guestName || 'Guest'}</Text>
                    {conv.guestEmail && <Text style={S.convMeta}>{conv.guestEmail}</Text>}
                    <Text style={S.convMeta}>{fmtTime(conv.lastActivity)}</Text>
                  </View>
                  <View style={[S.statusPill, { backgroundColor: (statusColor[conv.status] || '#6B7280') + '18' }]}>
                    <View style={[S.statusDot, { backgroundColor: statusColor[conv.status] || '#6B7280' }]} />
                    <Text style={[S.statusText, { color: statusColor[conv.status] || '#6B7280' }]}>{conv.status}</Text>
                  </View>
                </View>

                {conv.messages?.length > 0 && (
                  <Text style={S.lastMsg} numberOfLines={2}>
                    {conv.messages[conv.messages.length - 1]?.message}
                  </Text>
                )}

                <View style={S.convFooter}>
                  <Text style={S.msgCount}>{conv.messageCount || 0} messages</Text>
                  <TouchableOpacity style={S.openBtn} onPress={() => openChat(conv)}>
                    <Ionicons name="chatbubble-ellipses" size={14} color="#FFF" />
                    <Text style={S.openBtnText}>Open Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Chat Modal */}
      <Modal visible={chatOpen} transparent animationType="slide" onRequestClose={() => setChatOpen(false)}>
        <View style={S.modalOverlay}>
          <View style={S.chatModal}>
            {/* Modal Header */}
            <View style={S.chatHeader}>
              <View style={S.chatHeaderLeft}>
                <View style={S.chatAvatar}>
                  <Text style={S.chatAvatarText}>{(activeConv?.guestName || 'G')[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={S.chatName}>{activeConv?.guestName || 'Guest'}</Text>
                  <Text style={S.chatSub}>{activeConv?.guestEmail || activeConv?.sessionId?.slice(0, 16) + '...'}</Text>
                </View>
              </View>
              <View style={S.chatHeaderRight}>
                {activeConv?.status === 'active' && (
                  <TouchableOpacity style={S.closeConvBtn} onPress={() => updateStatus('closed')}>
                    <Text style={S.closeConvText}>Close</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={S.deleteConvBtn} onPress={() => deleteConv(activeConv?._id)}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setChatOpen(false)} style={S.closeChatBtn}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              style={S.msgList}
              contentContainerStyle={S.msgListContent}
              showsVerticalScrollIndicator={false}
            >
              {activeConv?.messages?.map((msg, i) => (
                <View key={i} style={[S.bubble, msg.sender === 'user' ? S.userBubble : S.botBubble]}>
                  <Text style={S.bubbleSender}>{msg.sender === 'user' ? '👤 User' : '🤖 Bot'}</Text>
                  <Text style={S.bubbleText}>{msg.message}</Text>
                  <Text style={S.bubbleTime}>{fmtTime(msg.timestamp)}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Admin Reply Input */}
            <View style={S.replyBar}>
              <TextInput
                style={S.replyInput}
                placeholder="Type a reply as bot..."
                value={adminInput}
                onChangeText={setAdminInput}
                multiline
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity
                style={[S.sendBtn, (!adminInput.trim() || sending) && S.sendBtnDisabled]}
                onPress={sendAdminMessage}
                disabled={!adminInput.trim() || sending}
              >
                {sending ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={18} color="#FFF" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
};

const S = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: LIGHT_BG },
  container: { padding: 20 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  pageSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  refreshBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  templateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: INDIGO, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  templateBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: 120, backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statNum: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },

  searchRow: { marginBottom: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  filterRow: { marginBottom: 14 },
  chip: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FFF', marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: INDIGO, borderColor: INDIGO },
  chipText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  resultCount: { fontSize: 13, color: '#64748B', marginBottom: 14 },

  center: { padding: 40, alignItems: 'center' },
  empty: { padding: 60, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12 },
  emptyText: { fontSize: 16, color: '#94A3B8', marginTop: 12 },

  convCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  convTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: INDIGO + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '700', color: INDIGO },
  convInfo: { flex: 1 },
  convName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  convMeta: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  lastMsg: { fontSize: 13, color: '#64748B', backgroundColor: '#F8FAFF', padding: 10, borderRadius: 8, marginBottom: 10 },
  convFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgCount: { fontSize: 12, color: '#94A3B8' },
  openBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: INDIGO, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  openBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  // Chat Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  chatModal: { width: '92%', maxWidth: 600, height: '80%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px rgba(0,0,0,0.2)' } : { elevation: 8 }) },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: INDIGO },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chatAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  chatAvatarText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  chatName: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  chatSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  chatHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  closeConvBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  closeConvText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  deleteConvBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  closeChatBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  msgList: { flex: 1, backgroundColor: '#F8FAFF' },
  msgListContent: { padding: 16, gap: 10 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 4 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#EEF2FF', borderBottomRightRadius: 4 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  bubbleSender: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginBottom: 4 },
  bubbleText: { fontSize: 14, color: '#1E293B', lineHeight: 20 },
  bubbleTime: { fontSize: 10, color: '#94A3B8', marginTop: 4, textAlign: 'right' },

  replyBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 10, backgroundColor: '#FFF' },
  replyInput: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#1E293B', maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: INDIGO, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});

export default AdminFreejobwalaChatScreen;
