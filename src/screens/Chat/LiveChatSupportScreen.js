import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import UserSidebar from '../../components/UserSidebar';
import api from '../../config/api';

// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';
const REFRESH_INTERVAL = 10000; // 10 seconds for real-time chat updates

const LiveChatSupportScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(isWeb);
  const intervalRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadCurrentUser();
    loadConversations();
  }, []);

  // Load conversations function
  const loadConversations = useCallback(async (showLoading = false) => {
    if (showLoading) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    try {
      const response = await api.getConversations();
      if (response.success) {
        const convs = response.conversations || [];
        // Filter conversations to only show company, consultancy, and admin
        const filtered = convs.filter(conv => {
          if (!currentUser) return false;
          
          const otherParticipants = conv.participants.filter(
            p => p.user && p.user._id !== currentUser._id
          );
          
          if (otherParticipants.length === 0) return false;
          
          const otherUser = otherParticipants[0].user;
          const userType = otherUser?.userType;
          
          // Only show conversations with company, consultancy, or admin
          return (
            userType === 'admin' || 
            userType === 'superadmin' || 
            (userType === 'employer' && (otherUser?.employerType === 'company' || otherUser?.employerType === 'consultancy'))
          );
        });
        
        setConversations(filtered);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      if (showLoading) {
        Alert.alert('Error', 'Failed to load conversations');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser, fadeAnim]);

  // Auto-refresh interval
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadConversations(false); // Silent refresh
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadConversations]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      loadConversations(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        loadConversations(false);
      }, REFRESH_INTERVAL);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [loadConversations])
  );

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUserFromStorage();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadAvailableUsers = async (search = '') => {
    try {
      setSearchingUsers(true);
      const response = await api.getChatPartners(search);
      if (response.success) {
        const users = response.users || [];
        
        // Filter to only show company, consultancy, and admin users
        const filtered = users.filter(user => {
          const userType = user.userType;
          return (
            userType === 'admin' || 
            userType === 'superadmin' || 
            (userType === 'employer' && (user.employerType === 'company' || user.employerType === 'consultancy'))
          );
        });
        
        setAvailableUsers(filtered);
        setFilteredUsers(filtered);
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
    loadConversations(true);
  };

  const getUserInitials = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
    }
    if (currentUser?.firstName) {
      return currentUser.firstName[0].toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await api.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
        },
      ]
    );
  };

  const openConversation = (conversation) => {
    navigation.navigate('ChatConversation', { conversationId: conversation._id });
  };

  const startNewChat = async (user) => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'User information not available');
        return;
      }

      // Determine conversation type
      let conversationType = 'jobseeker_employer';
      
      if (currentUser.userType === 'jobseeker') {
        if (user.userType === 'employer') {
          conversationType = 'jobseeker_employer';
        } else if (user.userType === 'admin' || user.userType === 'superadmin') {
          conversationType = 'jobseeker_support';
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
      // Find admin users first
      setShowNewChatModal(true);
      await loadAvailableUsers('');
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
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        type: user.userType === 'employer' 
          ? (user.employerType === 'company' ? 'Company' : 'Consultancy')
          : user.userType === 'admin' || user.userType === 'superadmin'
          ? 'Support'
          : 'User',
        avatar: user.profile?.avatar,
        userType: user.userType,
      };
    }
    
    return { name: 'Unknown User', type: 'Unknown', userType: null };
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

  // Filter available users by search
  useEffect(() => {
    if (!userSearchQuery.trim()) {
      setFilteredUsers(availableUsers);
      return;
    }
    
    const query = userSearchQuery.toLowerCase();
    const filtered = availableUsers.filter(user => {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      return name.includes(query);
    });
    setFilteredUsers(filtered);
  }, [userSearchQuery, availableUsers]);

  const renderConversationItem = ({ item }) => {
    const participantInfo = getOtherParticipant(item);
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
      activeOpacity={0.7}
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
        <Text style={styles.userTypeText}>
          {item.userType === 'employer' 
            ? (item.employerType === 'company' ? 'Company' : 'Consultancy')
            : item.userType === 'admin' || item.userType === 'superadmin'
            ? 'Support Admin'
            : 'User'}
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
              placeholder="Search companies, consultancies, or support..."
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
              data={filteredUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item._id}
              style={styles.userList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>
                    {userSearchQuery ? 'No users found' : 'Search for companies, consultancies, or support to start chatting'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      {sidebarOpen && (
        <UserSidebar
          navigation={navigation}
          activeKey="liveChat"
          onClose={!isWeb ? () => setSidebarOpen(false) : null}
          badges={{}}
        />
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setSidebarOpen(!sidebarOpen)}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Live Chat</Text>
          
          <View style={styles.headerRight}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </View>
              <Text style={styles.userName}>{currentUser?.firstName || 'User'}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButtonHeader} onPress={handleLogout}>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              <Text style={styles.logoutTextHeader}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Header with actions */}
          <View style={styles.contentHeader}>
            <View>
              <Text style={styles.title}>Messages</Text>
              <View style={styles.liveIndicatorHeader}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
                <Text style={styles.subtitle}>
                  {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                </Text>
              </View>
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
                  loadAvailableUsers('');
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
          <Animated.View style={[styles.conversationsListContainer, { opacity: fadeAnim }]}>
            <FlatList
              data={filteredConversations}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item._id}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No Messages Yet</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? 'No conversations match your search'
                      : 'Start a conversation with companies, consultancies, or support'}
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
                        loadAvailableUsers('');
                      }}
                    >
                      <Ionicons name="create-outline" size={20} color={colors.primary} />
                      <Text style={styles.emptyNewChatButtonText}>New Chat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
            />
          </Animated.View>

          <NewChatModal />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
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
    ...typography.body1,
    color: colors.textSecondary,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  menuButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userName: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
  },
  logoutButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  logoutTextHeader: {
    ...typography.body2,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
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
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  liveIndicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveText: {
    ...typography.caption,
    color: '#10b981',
    fontWeight: '600',
    fontSize: 11,
    marginRight: spacing.xs,
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
  conversationsListContainer: {
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
  avatarUnread: {
    borderWidth: 2,
    borderColor: colors.success,
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
    ...typography.body1,
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
    ...typography.h5,
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
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
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
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  userTypeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default LiveChatSupportScreen;
