import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import api from '../../config/api';

const LiveChatSupportScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    loadConversations();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUserFromStorage();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await api.getConversations();
      if (response.success) {
        setConversations(response.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAvailableUsers = async (search = '') => {
    try {
      setSearchingUsers(true);
      const response = await api.getChatPartners(search);
      if (response.success) {
        setAvailableUsers(response.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load available users');
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const openConversation = (conversation) => {
    navigation.navigate('ChatConversation', { conversationId: conversation._id });
  };

  const startNewChat = async (user) => {
    try {
      // Determine conversation type
      let conversationType = 'jobseeker_employer';
      
      if (currentUser.userType === 'jobseeker') {
        if (user.userType === 'employer') {
          conversationType = 'jobseeker_employer';
        } else if (user.userType === 'admin' || user.userType === 'superadmin') {
          conversationType = 'jobseeker_support';
        }
      } else if (currentUser.userType === 'employer') {
        if (user.userType === 'jobseeker') {
          conversationType = 'jobseeker_employer';
        } else if (user.userType === 'admin' || user.userType === 'superadmin') {
          conversationType = 'employer_support';
        }
      }

      const participants = [
        {
          user: user._id,
          userType: user.userType,
          employerType: user.employerType || undefined
        }
      ];

      const response = await api.createConversation(
        participants,
        conversationType,
        null
      );

      if (response.success) {
        setShowNewChatModal(false);
        navigation.navigate('ChatConversation', { conversationId: response.conversation._id });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to start new conversation');
    }
  };

  const startSupportChat = async () => {
    try {
      // Find or create a conversation with support (admin)
      const conversationType = currentUser.userType === 'employer' 
        ? 'employer_support' 
        : 'jobseeker_support';

      // For now, we'll just show the new chat modal with admins
      setShowNewChatModal(true);
      loadAvailableUsers();
    } catch (error) {
      console.error('Error starting support chat:', error);
      Alert.alert('Error', 'Failed to start support chat');
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!currentUser) return null;
    
    const otherParticipants = conversation.participants.filter(
      p => p.user && p.user._id !== currentUser._id
    );
    
    if (otherParticipants.length > 0) {
      const user = otherParticipants[0].user;
      return {
        name: `${user.firstName || ''} ${user.lastName || ''}`,
        type: user.userType === 'employer' 
          ? (user.employerType === 'company' ? 'Company' : 'Consultancy')
          : user.userType === 'admin' || user.userType === 'superadmin'
          ? 'Support'
          : 'Job Seeker',
        avatar: user.profile?.avatar,
      };
    }
    
    return { name: 'Unknown User', type: 'Unknown' };
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const participantInfo = getOtherParticipant(conv);
    const participantName = participantInfo.name.toLowerCase();
    const lastMessage = conv.lastMessage?.content?.toLowerCase() || '';
    
    return participantName.includes(query) || lastMessage.includes(query);
  });

  const renderConversationItem = ({ item }) => {
    const participantInfo = getOtherParticipant(item);
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity 
        style={[styles.conversationItem, hasUnread && styles.unreadConversation]}
        onPress={() => openConversation(item)}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, hasUnread && styles.avatarUnread]}>
            <Text style={styles.avatarText}>
              {participantInfo.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          {hasUnread && <View style={styles.unreadBadge} />}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.participantName, hasUnread && styles.unreadText]}>
              {participantInfo.name}
            </Text>
            <Text style={styles.timestamp}>
              {formatTime(item.lastMessage?.timestamp)}
            </Text>
          </View>
          
          <Text style={styles.userType}>{participantInfo.type}</Text>
          
          {item.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={2}>
              {item.lastMessage.content}
            </Text>
          )}
        </View>

        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => startNewChat(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.firstName?.charAt(0).toUpperCase() || 'U'}
        </Text>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.userType}>
          {item.userType === 'employer' 
            ? (item.employerType === 'company' ? 'Company' : 'Consultancy')
            : item.userType === 'admin' || item.userType === 'superadmin'
            ? 'Support'
            : 'Job Seeker'}
        </Text>
      </View>

      <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  const NewChatModal = () => (
    <Modal
      visible={showNewChatModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowNewChatModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Start New Chat</Text>
            <TouchableOpacity onPress={() => setShowNewChatModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users by name..."
              placeholderTextColor={colors.textSecondary}
              value={userSearchQuery}
              onChangeText={(text) => {
                setUserSearchQuery(text);
                loadAvailableUsers(text);
              }}
            />
          </View>

          {searchingUsers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={availableUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item._id}
              style={styles.userList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={colors.textLight} />
                  <Text style={styles.emptyText}>
                    {userSearchQuery ? 'No users found' : 'Search for users to start chatting'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.content}>
        {/* Header with actions */}
        <View style={styles.contentHeader}>
          <View>
            <Text style={styles.title}>Messages</Text>
            <Text style={styles.subtitle}>
              {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={startSupportChat}
            >
              <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.newChatButton}
              onPress={() => {
                setShowNewChatModal(true);
                loadAvailableUsers();
              }}
            >
              <Ionicons name="create-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Conversations List */}
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item._id}
          style={styles.conversationsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No conversations match your search'
                  : 'Start a conversation or chat with support'}
              </Text>
              
              <View style={styles.emptyActions}>
                <TouchableOpacity 
                  style={styles.emptySupportButton}
                  onPress={startSupportChat}
                >
                  <Ionicons name="help-circle-outline" size={20} color={colors.white} />
                  <Text style={styles.emptySupportButtonText}>Contact Support</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.emptyNewChatButton}
                  onPress={() => {
                    setShowNewChatModal(true);
                    loadAvailableUsers();
                  }}
                >
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                  <Text style={styles.emptyNewChatButtonText}>New Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />

        <NewChatModal />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body1,
    color: colors.textSecondary,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  supportButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  newChatButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
    height: '100%',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadConversation: {
    backgroundColor: '#F0F8FF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarUnread: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  avatarText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  participantName: {
    ...typography.subtitle1,
    color: colors.text,
    fontWeight: '600',
  },
  unreadText: {
    fontWeight: 'bold',
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  userType: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  lastMessage: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  emptySupportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  emptySupportButtonText: {
    ...typography.button,
    color: colors.white,
  },
  emptyNewChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  emptyNewChatButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    height: 44,
  },
  userList: {
    flex: 1,
    padding: spacing.md,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    ...typography.subtitle1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
});

export default LiveChatSupportScreen;

