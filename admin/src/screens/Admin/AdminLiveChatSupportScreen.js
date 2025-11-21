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
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

const AdminLiveChatSupportScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
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

  useEffect(() => {
    loadConversations();
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
        style={[dynamicStyles.conversationItem, hasUnread && dynamicStyles.unreadConversation]}
        onPress={() => openConversation(item)}
      >
        <View style={dynamicStyles.avatarContainer}>
          <View style={[dynamicStyles.avatar, hasUnread && dynamicStyles.avatarUnread]}>
            <Text style={dynamicStyles.avatarText}>
              {participantInfo.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          {hasUnread && <View style={dynamicStyles.unreadBadge} />}
        </View>
        
        <View style={dynamicStyles.conversationContent}>
          <View style={dynamicStyles.conversationHeader}>
            <Text style={[dynamicStyles.participantName, hasUnread && dynamicStyles.unreadText]}>
              {participantInfo.name}
            </Text>
            <Text style={dynamicStyles.timestamp}>
              {formatTime(item.lastMessage?.timestamp)}
            </Text>
          </View>
          
          <View style={dynamicStyles.conversationBody}>
            <Text style={dynamicStyles.userType}>{participantInfo.type}</Text>
            {item.subject && (
              <Text style={dynamicStyles.subject} numberOfLines={1}>
                {item.subject}
              </Text>
            )}
          </View>
          
          {item.lastMessage && (
            <Text style={dynamicStyles.lastMessage} numberOfLines={2}>
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
      style={dynamicStyles.userItem}
      onPress={() => startNewChat(item)}
    >
      <View style={dynamicStyles.avatar}>
        <Text style={dynamicStyles.avatarText}>
          {item.firstName?.charAt(0).toUpperCase() || 'U'}
        </Text>
      </View>
      
      <View style={dynamicStyles.userInfo}>
        <Text style={dynamicStyles.userName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={dynamicStyles.userType}>
          {item.userType === 'employer' 
            ? (item.employerType === 'company' ? 'Company' : 'Consultancy')
            : 'Job Seeker'}
        </Text>
      </View>

      <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableOpacity 
        style={dynamicStyles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
        <View style={dynamicStyles.modalContent}>
          <View style={dynamicStyles.modalHeader}>
            <Text style={dynamicStyles.modalTitle}>Filter Conversations</Text>
            <TouchableOpacity 
              onPress={() => setShowFilterModal(false)}
              style={dynamicStyles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={dynamicStyles.filterOptions}>
            {[
              { key: 'all', label: 'All Conversations', icon: 'chatbubbles' },
              { key: 'jobseeker', label: 'Job Seekers', icon: 'person' },
              { key: 'company', label: 'Companies', icon: 'business' },
              { key: 'consultancy', label: 'Consultancies', icon: 'people' },
            ].map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  dynamicStyles.filterOption,
                  selectedFilter === filter.key && dynamicStyles.filterOptionSelected
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
                  dynamicStyles.filterLabel,
                  selectedFilter === filter.key && dynamicStyles.filterLabelSelected
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
        </TouchableOpacity>
      </TouchableOpacity>
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
        style={dynamicStyles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowNewChatModal(false)}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
        <View style={dynamicStyles.modalContent}>
          <View style={dynamicStyles.modalHeader}>
            <Text style={dynamicStyles.modalTitle}>Start New Chat</Text>
            <TouchableOpacity 
              onPress={() => setShowNewChatModal(false)}
              style={dynamicStyles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={dynamicStyles.searchIcon} />
            <TextInput
              style={dynamicStyles.searchInput}
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
            <View style={dynamicStyles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={availableUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item._id}
              style={dynamicStyles.userList}
              ListEmptyComponent={
                <View style={dynamicStyles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={colors.textLight} />
                  <Text style={dynamicStyles.emptyText}>
                    {userSearchQuery ? 'No users found' : 'Search for users to start chatting'}
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
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading conversations...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Live Chat Support" activeScreen="AdminLiveChatSupport" onNavigate={handleNavigate} onLogout={handleLogout}>
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.pageTitle}>Live Chat Support</Text>
          <Text style={dynamicStyles.pageSubtitle}>
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Search and Filter Bar */}
        <View style={dynamicStyles.searchBar}>
          <View style={dynamicStyles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={dynamicStyles.searchIcon} />
            <TextInput
              style={dynamicStyles.searchInput}
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

          <TouchableOpacity 
            style={[dynamicStyles.filterButton, selectedFilter !== 'all' && dynamicStyles.filterButtonActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons 
              name="filter" 
              size={20} 
              color={selectedFilter !== 'all' ? colors.white : colors.primary} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={dynamicStyles.newChatButton}
            onPress={() => {
              setShowNewChatModal(true);
              loadAvailableUsers();
            }}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Conversations List */}
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item._id}
          style={dynamicStyles.conversationsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.textLight} />
              <Text style={dynamicStyles.emptyTitle}>No conversations yet</Text>
              <Text style={dynamicStyles.emptyText}>
                {searchQuery || selectedFilter !== 'all'
                  ? 'No conversations match your search or filter'
                  : 'Start a new conversation to begin chatting with users'}
              </Text>
              <TouchableOpacity 
                style={dynamicStyles.startChatButton}
                onPress={() => {
                  setShowNewChatModal(true);
                  loadAvailableUsers();
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.white} />
                <Text style={dynamicStyles.startChatButtonText}>Start New Chat</Text>
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

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontSize: isMobile ? 13 : isTablet ? 14 : 15,
  },
  header: {
    padding: isMobile ? spacing.md : isTablet ? spacing.lg - 4 : spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
    fontSize: isMobile ? 22 : isTablet ? 26 : 28,
  },
  pageSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
  },
  searchBar: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
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
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  newChatButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
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
  conversationBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userType: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  subject: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
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
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  startChatButtonText: {
    ...typography.button,
    color: colors.white,
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
  },
  filterOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterLabel: {
    ...typography.body1,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  filterLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
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
  },
});

const styles = StyleSheet.create({});

export default AdminLiveChatSupportScreen;
