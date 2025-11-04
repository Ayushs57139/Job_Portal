import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminFreejobwalaChatScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [searchQuery, selectedStatus, conversations]);

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/chatbot/stats`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/chatbot/conversations?limit=100`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data.conversations || []);
      setFilteredConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      Alert.alert('Error', 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const filterConversations = () => {
    let filtered = [...conversations];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.guestEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.guestPhone?.includes(searchQuery) ||
        conv.sessionId?.includes(searchQuery)
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(conv => conv.status === selectedStatus);
    }

    setFilteredConversations(filtered);
  };

  const handleViewConversation = async (conversation) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/chatbot/conversations/${conversation._id}`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversation details');
      }
      
      const data = await response.json();
      setSelectedConversation(data.conversation);
      setAdminNotes(data.conversation.adminNotes || '');
      setModalVisible(true);
      
      // Refresh to update read status
      fetchConversations();
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      Alert.alert('Error', 'Failed to fetch conversation details');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedConversation) return;

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/chatbot/conversations/${selectedConversation._id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus, adminNotes })
      });

      if (!response.ok) {
        throw new Error('Failed to update conversation');
      }

      Alert.alert('Success', 'Conversation updated successfully');
      setModalVisible(false);
      fetchConversations();
      fetchStats();
    } catch (error) {
      console.error('Error updating conversation:', error);
      Alert.alert('Error', 'Failed to update conversation');
    }
  };

  const handleDeleteConversation = async (convId) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              const response = await fetch(`${API_URL}/admin/chatbot/conversations/${convId}`, {
                method: 'DELETE',
                headers
              });

              if (!response.ok) {
                throw new Error('Failed to delete conversation');
              }

              Alert.alert('Success', 'Conversation deleted successfully');
              setModalVisible(false);
              fetchConversations();
              fetchStats();
            } catch (error) {
              console.error('Error deleting conversation:', error);
              Alert.alert('Error', 'Failed to delete conversation');
            }
          }
        }
      ]
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <AdminLayout
      title="Freejobwala Chat"
      activeScreen="AdminFreejobwalaChat"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>Freejobwala Chat</Text>
            <Text style={styles.pageSubtitle}>Manage chatbot conversations</Text>
          </View>

          {/* Statistics Cards */}
          {stats && (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="chatbubbles" size={24} color="#4A90E2" />
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="time" size={24} color="#27AE60" />
                <Text style={styles.statNumber}>{stats.active}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-done" size={24} color="#95A5A6" />
                <Text style={styles.statNumber}>{stats.closed}</Text>
                <Text style={styles.statLabel}>Closed</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="chatbox-ellipses" size={24} color="#9B59B6" />
                <Text style={styles.statNumber}>{stats.totalMessages}</Text>
                <Text style={styles.statLabel}>Messages</Text>
              </View>
            </View>
          )}

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, email, phone, or session ID..."
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

          {/* Status Filter */}
          <View style={styles.filtersSection}>
            <Text style={styles.filtersLabel}>Status:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
              {['all', 'active', 'closed', 'archived'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[styles.filterChipText, selectedStatus === status && styles.filterChipTextActive]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Results */}
          <View style={styles.resultsSection}>
            <Text style={styles.resultsText}>
              Showing {filteredConversations.length} {filteredConversations.length === 1 ? 'conversation' : 'conversations'}
            </Text>
          </View>

          {/* Conversations List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.loadingText}>Loading conversations...</Text>
            </View>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv, index) => (
              <View key={conv._id || index} style={styles.convCard}>
                <View style={styles.convHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{conv.guestName || 'Guest'}</Text>
                      {conv.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{conv.unreadCount}</Text>
                        </View>
                      )}
                    </View>
                    {conv.guestEmail && (
                      <Text style={styles.userEmail}>{conv.guestEmail}</Text>
                    )}
                    {conv.guestPhone && (
                      <Text style={styles.userPhone}>📞 {conv.guestPhone}</Text>
                    )}
                  </View>
                  <View style={styles.badges}>
                    <View style={[styles.statusBadge, styles[`${conv.status}Badge`]]}>
                      <Text style={styles.statusBadgeText}>{conv.status}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.convMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="chatbox-ellipses" size={16} color="#999" />
                    <Text style={styles.metaText}>{conv.messageCount} messages</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={16} color="#999" />
                    <Text style={styles.metaText}>
                      {formatTimestamp(conv.lastActivity)}
                    </Text>
                  </View>
                </View>

                {conv.messages && conv.messages.length > 0 && (
                  <View style={styles.lastMessage}>
                    <Text style={styles.lastMessageLabel}>Last message:</Text>
                    <Text style={styles.lastMessageText} numberOfLines={2}>
                      {conv.messages[conv.messages.length - 1]?.message}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewConversation(conv)}
                >
                  <Ionicons name="eye" size={20} color="#FFF" />
                  <Text style={styles.viewButtonText}>View Conversation</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>No conversations found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Conversations will appear here when users chat'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Conversation Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Conversation Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedConversation && (
                <>
                  {/* User Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>User Information</Text>
                    <Text style={styles.sectionText}>Name: {selectedConversation.guestName || 'Guest'}</Text>
                    {selectedConversation.guestEmail && (
                      <Text style={styles.sectionText}>Email: {selectedConversation.guestEmail}</Text>
                    )}
                    {selectedConversation.guestPhone && (
                      <Text style={styles.sectionText}>Phone: {selectedConversation.guestPhone}</Text>
                    )}
                    <Text style={styles.sectionText}>Session ID: {selectedConversation.sessionId}</Text>
                    <Text style={styles.sectionText}>Status: {selectedConversation.status}</Text>
                  </View>

                  {/* Messages */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Conversation</Text>
                    <View style={styles.messagesContainer}>
                      {selectedConversation.messages && selectedConversation.messages.map((msg, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.messageBubble,
                            msg.sender === 'user' ? styles.userMessage : styles.botMessage
                          ]}
                        >
                          <Text style={styles.messageSender}>
                            {msg.sender === 'user' ? '👤 User' : '🤖 Bot'}
                          </Text>
                          <Text style={styles.messageText}>{msg.message}</Text>
                          <Text style={styles.messageTime}>
                            {formatTimestamp(msg.timestamp)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Admin Notes */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Admin Notes</Text>
                    <TextInput
                      style={styles.textArea}
                      value={adminNotes}
                      onChangeText={setAdminNotes}
                      placeholder="Add notes about this conversation..."
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  {/* Actions */}
                  <View style={styles.actionButtons}>
                    {selectedConversation.status === 'active' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.closeButton]}
                        onPress={() => handleUpdateStatus('closed')}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Close Conversation</Text>
                      </TouchableOpacity>
                    )}
                    {selectedConversation.status === 'closed' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.archiveButton]}
                        onPress={() => handleUpdateStatus('archived')}
                      >
                        <Ionicons name="archive" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Archive</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteConversation(selectedConversation._id)}
                    >
                      <Ionicons name="trash" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  convCard: {
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
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  badges: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  closedBadge: {
    backgroundColor: 'rgba(149, 165, 166, 0.1)',
  },
  archivedBadge: {
    backgroundColor: 'rgba(52, 73, 94, 0.1)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  convMeta: {
    flexDirection: 'row',
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
  lastMessage: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  lastMessageLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 5,
  },
  lastMessageText: {
    fontSize: 13,
    color: '#666',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewButtonText: {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 600,
    maxHeight: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    maxHeight: 500,
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  messagesContainer: {
    gap: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
  },
  messageSender: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
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
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  closeButton: {
    backgroundColor: '#27AE60',
  },
  archiveButton: {
    backgroundColor: '#95A5A6',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AdminFreejobwalaChatScreen;
