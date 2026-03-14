import React, { useState, useEffect, useCallback } from 'react';
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
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';
import socketService from '../../services/socketService';

const AdminLiveChatSupportScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, jobseeker, company, consultancy
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadConversations();
    
    // Initialize socket connection
    const initializeSocket = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
        
        // Listen for new messages and conversation updates
        const unsubscribeNotification = socketService.onMessageNotification((data) => {
          // Reload conversations to update unread counts and last messages
          loadConversations();
        });

        // Listen for new messages in any conversation
        const unsubscribeNewMessage = socketService.onNewMessage((data) => {
          // Update the conversation's last message
          setConversations(prev => 
            prev.map(conv => {
              if (conv._id === data.conversationId) {
                return {
                  ...conv,
                  lastMessage: {
                    content: data.message.content,
                    sender: data.message.sender,
                    timestamp: data.message.createdAt
                  }
                };
              }
              return conv;
            })
          );
        });

        return () => {
          unsubscribeNotification();
          unsubscribeNewMessage();
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
        setIsConnected(false);
      }
    };

    const cleanup = initializeSocket();

    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
  }, []);

  useEffect(() => {
    filterConversations();
  }, [searchQuery, selectedFilter, conversations]);

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

  const filterConversations = useCallback(() => {
    let filtered = [...conversations];

    // Apply user type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(conv => {
        const otherParticipants = conv.participants.filter(
          p => p.user && (p.user.userType === 'admin' || p.user.userType === 'superadmin') === false
        );
        
        if (selectedFilter === 'jobseeker') {
          return otherParticipants.some(p => p.user?.userType === 'jobseeker');
        } else if (selectedFilter === 'company') {
          return otherParticipants.some(p => p.user?.userType === 'employer' && p.user?.employerType === 'company');
        } else if (selectedFilter === 'consultancy') {
          return otherParticipants.some(p => p.user?.userType === 'employer' && p.user?.employerType === 'consultancy');
        }
        return true;
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => {
        const subject = conv.subject?.toLowerCase() || '';
        const participantNames = conv.participants
          .map(p => `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.toLowerCase())
          .join(' ');
        const lastMessage = conv.lastMessage?.content?.toLowerCase() || '';
        
        return subject.includes(query) || 
               participantNames.includes(query) || 
               lastMessage.includes(query);
      });
    }

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, selectedFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  const openConversation = (conversation) => {
    navigation.navigate('ChatConversation', { conversationId: conversation._id });
  };

  const startNewChat = async (user) => {
    try {
      // Determine conversation type based on user type
      let conversationType = 'admin_support';
      if (user.userType === 'jobseeker') {
        conversationType = 'jobseeker_support';
      } else if (user.userType === 'employer') {
        conversationType = 'employer_support';
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
        `Support Chat with ${user.firstName} ${user.lastName}`
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

  const getParticipantInfo = (conversation) => {
    const otherParticipants = conversation.participants.filter(
      p => p.user && (p.user.userType === 'admin' || p.user.userType === 'superadmin') === false
    );
    
    if (otherParticipants.length > 0) {
      const user = otherParticipants[0].user;
      return {
        name: `${user.firstName || ''} ${user.lastName || ''}`,
        type: user.userType === 'employer' 
          ? (user.employerType === 'company' ? 'Company' : 'Consultancy')
          : 'Job Seeker'
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

  const renderConversationItem = ({ item }) => {
    const participantInfo = getParticipantInfo(item);
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity 
        style={[styles.conversationItem, hasUnread && styles.unreadConversation]}
        onPress={() => openConversation(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, hasUnread && styles.avatarUnread]}>
            <Text style={styles.avatarText}>
              {participantInfo.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {item.unreadCount > 9 ? '9+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <View style={styles.nameContainer}>
              <Text style={[styles.participantName, hasUnread && styles.unreadText]} numberOfLines={1}>
                {participantInfo.name}
              </Text>
              <View style={[styles.userTypeBadge, participantInfo.type === 'Company' && styles.userTypeCompany, participantInfo.type === 'Consultancy' && styles.userTypeConsultancy]}>
                <Text style={styles.userTypeText}>{participantInfo.type}</Text>
              </View>
            </View>
            <Text style={styles.timestamp}>
              {formatTime(item.lastMessage?.timestamp)}
            </Text>
          </View>
          
          {item.lastMessage && (
            <Text style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]} numberOfLines={2}>
              {item.lastMessage.content}
            </Text>
          )}
        </View>

        <Ionicons 
          name="chevron-forward" 
          size={18} 
          color={colors.textLight} 
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }) => {
    const userTypeLabel = item.userType === 'employer' 
      ? (item.employerType === 'company' ? 'Company' : 'Consultancy')
      : 'Job Seeker';
    
    const userTypeColor = item.userType === 'employer'
      ? (item.employerType === 'company' ? colors.info : colors.success)
      : colors.primary;

    return (
      <TouchableOpacity 
        style={styles.userItem}
        onPress={() => startNewChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.userItemContent}>
          <View style={[styles.userAvatar, { backgroundColor: userTypeColor }]}>
            <Text style={styles.userAvatarText}>
              {item.firstName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.firstName} {item.lastName}
            </Text>
            <View style={styles.userTypeContainer}>
              <View style={[styles.userTypeBadge, { backgroundColor: userTypeColor + '15' }]}>
                <Text style={[styles.userTypeText, { color: userTypeColor }]}>
                  {userTypeLabel}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.userActionButton}>
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Conversations</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterOptions}>
            {[
              { key: 'all', label: 'All Conversations', icon: 'chatbubbles' },
              { key: 'jobseeker', label: 'Job Seekers', icon: 'person' },
              { key: 'company', label: 'Companies', icon: 'business' },
              { key: 'consultancy', label: 'Consultancies', icon: 'people' },
            ].map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterOption,
                  selectedFilter === filter.key && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setSelectedFilter(filter.key);
                  setShowFilterModal(false);
                }}
              >
                <Ionicons 
                  name={filter.icon} 
                  size={24} 
                  color={selectedFilter === filter.key ? colors.primary : colors.text} 
                />
                <Text style={[
                  styles.filterLabel,
                  selectedFilter === filter.key && styles.filterLabelSelected
                ]}>
                  {filter.label}
                </Text>
                {selectedFilter === filter.key && (
                  <Ionicons name="checkmark" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const NewChatModal = () => (
    <Modal
      visible={showNewChatModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowNewChatModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowNewChatModal(false)}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.modalTouchable}
        >
          <View style={styles.modalContent}>
            {/* Modern Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="chatbubbles" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Start New Chat</Text>
                  <Text style={styles.modalSubtitle}>
                    Search and select a user to begin
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowNewChatModal(false)}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modern Search Bar */}
            <View style={styles.modalSearchWrapper}>
              <View style={styles.modalSearchContainer}>
                <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.modalSearchIcon} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search by name..."
                  placeholderTextColor={colors.textLight}
                  value={userSearchQuery}
                  onChangeText={(text) => {
                    setUserSearchQuery(text);
                    loadAvailableUsers(text);
                  }}
                  autoFocus={false}
                />
                {userSearchQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => {
                      setUserSearchQuery('');
                      loadAvailableUsers('');
                    }}
                    style={styles.modalClearButton}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Users List */}
            {searchingUsers ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.modalLoadingText}>Searching users...</Text>
              </View>
            ) : (
              <FlatList
                data={availableUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                style={styles.userList}
                contentContainerStyle={styles.userListContent}
                showsVerticalScrollIndicator={true}
                ListEmptyComponent={
                  <View style={styles.modalEmptyState}>
                    <View style={styles.modalEmptyIconContainer}>
                      <Ionicons name="people-outline" size={56} color={colors.textLight} />
                    </View>
                    <Text style={styles.modalEmptyTitle}>
                      {userSearchQuery ? 'No users found' : 'No users available'}
                    </Text>
                    <Text style={styles.modalEmptyText}>
                      {userSearchQuery 
                        ? 'Try a different search term' 
                        : 'Search for users to start a conversation'}
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) {
    return (
      <AdminLayout title="Live Chat Support" activeScreen="AdminLiveChatSupport" onNavigate={handleNavigate} onLogout={handleLogout}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Live Chat Support" activeScreen="AdminLiveChatSupport" onNavigate={handleNavigate} onLogout={handleLogout}>
      <View style={styles.container}>
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.pageTitle}>Live Chat Support</Text>
              <View style={styles.headerMeta}>
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, isConnected && styles.statusDotActive]} />
                  <Text style={styles.statusText}>
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </Text>
                </View>
                <Text style={styles.pageSubtitle}>
                  {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.newChatButtonHeader}
              onPress={() => {
                setShowNewChatModal(true);
                loadAvailableUsers();
              }}
            >
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.newChatButtonText}>New Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modern Search and Filter Bar */}
        <View style={styles.searchBar}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter !== 'all' && styles.filterButtonActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons 
              name="filter" 
              size={18} 
              color={selectedFilter !== 'all' ? colors.white : colors.primary} 
            />
            {selectedFilter !== 'all' && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
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
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedFilter !== 'all'
                  ? 'No conversations match your search or filter'
                  : 'Start a new conversation to begin chatting with users'}
              </Text>
              <TouchableOpacity 
                style={styles.startChatButton}
                onPress={() => {
                  setShowNewChatModal(true);
                  loadAvailableUsers();
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.white} />
                <Text style={styles.startChatButtonText}>Start New Chat</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <FilterModal />
        <NewChatModal />
      </View>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body2,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: {
    ...typography.h3,
    color: colors.textDark,
    fontWeight: '700',
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textLight,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  pageSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  newChatButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  newChatButtonText: {
    ...typography.buttonSmall,
    color: colors.white,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body2,
    color: colors.text,
    height: '100%',
    fontSize: 14,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  conversationsList: {
    flex: 1,
    backgroundColor: colors.background,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: spacing.md + 4,
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xs,
  },
  unreadConversation: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  avatarUnread: {
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
  avatarText: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  conversationContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    marginRight: spacing.sm,
  },
  participantName: {
    ...typography.body1,
    color: colors.textDark,
    fontWeight: '600',
    fontSize: 15,
  },
  unreadText: {
    fontWeight: '700',
    color: colors.textDark,
  },
  userTypeBadge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  userTypeCompany: {
    backgroundColor: colors.infoLight,
  },
  userTypeConsultancy: {
    backgroundColor: colors.successLight,
  },
  userTypeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  timestamp: {
    ...typography.caption,
    color: colors.textLight,
    fontSize: 11,
  },
  lastMessage: {
    ...typography.body2,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  lastMessageUnread: {
    color: colors.textDark,
    fontWeight: '500',
  },
  chevron: {
    opacity: 0.4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textDark,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  startChatButtonText: {
    ...typography.buttonSmall,
    color: colors.white,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalTouchable: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    maxHeight: '100%',
    ...shadows.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg + 4,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.textDark,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSearchWrapper: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  modalSearchIcon: {
    marginRight: spacing.sm,
  },
  modalSearchInput: {
    flex: 1,
    ...typography.body2,
    color: colors.text,
    height: '100%',
    fontSize: 15,
  },
  modalClearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    minHeight: 200,
  },
  modalLoadingText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  filterOptions: {
    padding: spacing.md,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  filterLabel: {
    ...typography.body2,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
    fontWeight: '500',
  },
  filterLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  userList: {
    flex: 1,
  },
  userListContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  userItem: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xs,
    overflow: 'hidden',
  },
  userItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  userAvatarText: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  userName: {
    ...typography.body1,
    color: colors.textDark,
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: 15,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  userTypeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  userActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  modalEmptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalEmptyTitle: {
    ...typography.h5,
    color: colors.textDark,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalEmptyText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AdminLiveChatSupportScreen;
