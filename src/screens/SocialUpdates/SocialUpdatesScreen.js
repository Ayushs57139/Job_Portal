import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const SocialUpdatesScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Comment modal state
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // View all comments modal state
  const [viewCommentsModalVisible, setViewCommentsModalVisible] = useState(false);
  const [commentsPost, setCommentsPost] = useState(null);

  useEffect(() => {
    loadUserData();
    loadPosts();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await api.getCurrentUserFromStorage();
      setCurrentUser(userData);
    } catch (error) {
      console.log('Could not load user data:', error);
    }
  };

  const loadPosts = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.getSocialUpdates({
        page: pageNum,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (response && response.socialUpdates) {
        if (isRefresh || pageNum === 1) {
          setPosts(response.socialUpdates);
        } else {
          setPosts((prev) => [...prev, ...response.socialUpdates]);
        }

        setHasMore(
          response.pagination &&
          response.pagination.currentPage < response.pagination.totalPages
        );
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load social updates. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    loadPosts(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to like posts.');
      return;
    }

    try {
      const response = await api.likeSocialUpdate(postId);
      
      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                engagement: {
                  ...post.engagement,
                  likes: response.likes,
                },
                likedBy: response.isLiked
                  ? [...(post.likedBy || []), currentUser._id]
                  : (post.likedBy || []).filter((id) => id !== currentUser._id),
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post. Please try again.');
    }
  };

  const openCommentModal = (post) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to comment on posts.');
      return;
    }
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPost(null);
    setCommentText('');
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment.');
      return;
    }

    if (!selectedPost) return;

    setSubmittingComment(true);
    try {
      const response = await api.commentOnSocialUpdate(selectedPost._id, commentText.trim());

      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === selectedPost._id
            ? {
                ...post,
                engagement: {
                  ...post.engagement,
                  comments: response.totalComments,
                },
                comments: [...(post.comments || []), response.comment],
              }
            : post
        )
      );

      closeCommentModal();
      Alert.alert('Success', 'Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', error.message || 'Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const openViewCommentsModal = (post) => {
    setCommentsPost(post);
    setViewCommentsModalVisible(true);
  };

  const closeViewCommentsModal = () => {
    setViewCommentsModalVisible(false);
    setCommentsPost(null);
  };

  const handleShare = async (post) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to share posts.');
      return;
    }

    Alert.alert(
      'Share Post',
      'Choose a platform to share',
      [
        { text: 'WhatsApp', onPress: () => shareToPlaystore(post, 'whatsapp') },
        { text: 'Facebook', onPress: () => shareToPlaystore(post, 'facebook') },
        { text: 'Twitter', onPress: () => shareToPlaystore(post, 'twitter') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const shareToPlaystore = async (post, platform) => {
    try {
      await api.shareSocialUpdate(post._id, platform);
      
      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                engagement: {
                  ...p.engagement,
                  shares: (p.engagement?.shares || 0) + 1,
                },
              }
            : p
        )
      );

      Alert.alert('Success', 'Post shared successfully!');
    } catch (error) {
      console.error('Error sharing post:', error);
      Alert.alert('Error', 'Failed to share post. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderPostItem = ({ item }) => {
    const isLiked = currentUser && item.likedBy && item.likedBy.includes(currentUser._id);
    
    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <View style={styles.avatarContainer}>
              {item.authorLogo ? (
                <Image source={{ uri: item.authorLogo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="business" size={20} color={colors.textSecondary} />
                </View>
              )}
            </View>
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{item.authorName}</Text>
              <View style={styles.postMeta}>
                <Text style={styles.authorType}>
                  {item.authorType === 'admin' ? 'Admin' : item.authorType === 'company' ? 'Company' : 'Consultancy'}
                </Text>
                <Text style={styles.dotSeparator}> • </Text>
                <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
          </View>
          {item.postType && item.postType !== 'general' && (
            <View style={styles.postTypeBadge}>
              <Text style={styles.postTypeText}>
                {item.postType.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postText}>{item.content}</Text>

          {/* Post Media */}
          {item.media && item.media.length > 0 && item.media[0].type === 'image' && (
            <Image
              source={{ uri: `${api.baseURL.replace('/api', '')}${item.media[0].url}` }}
              style={styles.postImage}
              resizeMode="cover"
            />
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Engagement Stats */}
        <View style={styles.engagementStats}>
          <TouchableOpacity onPress={() => item.engagement?.likes > 0 && Alert.alert('Likes', `${item.engagement.likes} people liked this post`)}>
            <Text style={styles.engagementText}>
              {item.engagement?.likes || 0} likes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => item.comments && item.comments.length > 0 && openViewCommentsModal(item)}>
            <Text style={styles.engagementText}>
              {item.engagement?.comments || 0} comments
            </Text>
          </TouchableOpacity>
          <Text style={styles.engagementText}>
            {item.engagement?.shares || 0} shares
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item._id)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? colors.error : colors.textSecondary}
            />
            <Text style={[styles.actionButtonText, isLiked && styles.likedText]}>
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openCommentModal(item)}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionButtonText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Preview */}
        {item.comments && item.comments.length > 0 && (
          <View style={styles.commentsPreview}>
            {item.comments.slice(0, 2).map((comment, index) => (
              <View key={index} style={styles.commentItem}>
                <Text style={styles.commentAuthor}>
                  {comment.user?.firstName} {comment.user?.lastName}:
                </Text>
                <Text style={styles.commentText} numberOfLines={2}>
                  {comment.content}
                </Text>
              </View>
            ))}
            {item.comments.length > 2 && (
              <TouchableOpacity onPress={() => openViewCommentsModal(item)}>
                <Text style={styles.viewMoreComments}>
                  View all {item.comments.length} comments
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="newspaper-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Social Updates Yet</Text>
      <Text style={styles.emptyText}>
        Check back later for updates from companies and consultancies!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading social updates...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <Ionicons name="megaphone" size={48} color="#fff" />
            <Text style={styles.heroTitle}>Social Updates</Text>
            <Text style={styles.heroSubtitle}>
              Stay connected with the latest from companies and consultancies
            </Text>
          </LinearGradient>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      {/* Add Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeCommentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Comment</Text>
              <TouchableOpacity onPress={closeCommentModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedPost && (
              <View style={styles.selectedPostPreview}>
                <Text style={styles.selectedPostAuthor}>{selectedPost.authorName}</Text>
                <Text style={styles.selectedPostTitle} numberOfLines={2}>
                  {selectedPost.title}
                </Text>
              </View>
            )}

            <TextInput
              style={styles.commentInput}
              placeholder="Write your comment..."
              placeholderTextColor={colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, submittingComment && styles.submitButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={submittingComment}
            >
              {submittingComment ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={styles.submitButtonText}>Post Comment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* View All Comments Modal */}
      <Modal
        visible={viewCommentsModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeViewCommentsModal}
      >
        <View style={styles.fullModalContainer}>
          <View style={styles.fullModalHeader}>
            <Text style={styles.fullModalTitle}>Comments</Text>
            <TouchableOpacity onPress={closeViewCommentsModal}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          {commentsPost && (
            <ScrollView style={styles.fullModalContent}>
              {/* Post Preview */}
              <View style={styles.postPreviewCard}>
                <View style={styles.postPreviewHeader}>
                  <View style={styles.authorInfo}>
                    <View style={styles.avatarContainer}>
                      {commentsPost.authorLogo ? (
                        <Image source={{ uri: commentsPost.authorLogo }} style={styles.avatar} />
                      ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                          <Ionicons name="business" size={20} color={colors.textSecondary} />
                        </View>
                      )}
                    </View>
                    <View style={styles.authorDetails}>
                      <Text style={styles.authorName}>{commentsPost.authorName}</Text>
                      <Text style={styles.postDate}>{formatDate(commentsPost.createdAt)}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.postPreviewTitle}>{commentsPost.title}</Text>
                <Text style={styles.postPreviewContent} numberOfLines={3}>
                  {commentsPost.content}
                </Text>
              </View>

              {/* Comments List */}
              <View style={styles.commentsListContainer}>
                <Text style={styles.commentsListTitle}>
                  {commentsPost.comments?.length || 0} Comments
                </Text>

                {commentsPost.comments && commentsPost.comments.length > 0 ? (
                  commentsPost.comments.map((comment, index) => (
                    <View key={index} style={styles.fullCommentCard}>
                      <View style={styles.fullCommentHeader}>
                        <View style={styles.commentUserInfo}>
                          <View style={styles.commentAvatar}>
                            <Ionicons name="person-circle" size={36} color={colors.primary} />
                          </View>
                          <View>
                            <Text style={styles.fullCommentAuthor}>
                              {comment.user?.firstName} {comment.user?.lastName}
                            </Text>
                            <Text style={styles.fullCommentDate}>
                              {formatDate(comment.createdAt)}
                            </Text>
                          </View>
                        </View>
                        {comment.likes > 0 && (
                          <View style={styles.commentLikesContainer}>
                            <Ionicons name="heart" size={16} color={colors.error} />
                            <Text style={styles.commentLikesCount}>{comment.likes}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.fullCommentContent}>{comment.content}</Text>
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <View style={styles.repliesContainer}>
                          {comment.replies.map((reply, replyIndex) => (
                            <View key={replyIndex} style={styles.replyCard}>
                              <View style={styles.replyHeader}>
                                <Ionicons name="person-circle" size={28} color={colors.info} />
                                <View style={styles.replyInfo}>
                                  <Text style={styles.replyAuthor}>
                                    {reply.user?.firstName} {reply.user?.lastName}
                                  </Text>
                                  <Text style={styles.replyDate}>
                                    {formatDate(reply.createdAt)}
                                  </Text>
                                </View>
                              </View>
                              <Text style={styles.replyContent}>{reply.content}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.noCommentsContainer}>
                    <Ionicons name="chatbubbles-outline" size={48} color={colors.border} />
                    <Text style={styles.noCommentsText}>No comments yet</Text>
                    <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
                  </View>
                )}
              </View>

              {/* Add Comment Button */}
              {currentUser && (
                <TouchableOpacity
                  style={styles.addCommentButton}
                  onPress={() => {
                    closeViewCommentsModal();
                    openCommentModal(commentsPost);
                  }}
                >
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                  <Text style={styles.addCommentButtonText}>Add a comment</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
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
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  heroSection: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.h2,
    color: '#fff',
    marginTop: spacing.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  heroSubtitle: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  postCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.md,
    ...(isWeb && {
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'all 0.3s ease',
    }),
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary + '20',
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    ...typography.subtitle1,
    color: colors.text,
    fontWeight: '600',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  authorType: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  dotSeparator: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  postDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  postTypeBadge: {
    backgroundColor: '#667eea15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#667eea30',
  },
  postTypeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 10,
  },
  postContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  postTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  postText: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.border,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: '#667eea10',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#667eea20',
  },
  tagText: {
    ...typography.caption,
    color: '#667eea',
    fontWeight: '600',
  },
  engagementStats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  engagementText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  actionButtonText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  likedText: {
    color: colors.error,
  },
  commentsPreview: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  commentAuthor: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  commentText: {
    ...typography.body2,
    color: colors.textSecondary,
    flex: 1,
  },
  viewMoreComments: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    margin: spacing.lg,
    padding: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 24,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
  },
  selectedPostPreview: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  selectedPostAuthor: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  selectedPostTitle: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
  },
  commentInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    ...typography.body2,
    color: colors.text,
    minHeight: 100,
    marginBottom: spacing.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.border,
    ...shadows.sm,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '600',
  },
  // Full Modal Styles
  fullModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  fullModalTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  fullModalContent: {
    flex: 1,
    padding: spacing.md,
  },
  postPreviewCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  postPreviewHeader: {
    marginBottom: spacing.sm,
  },
  postPreviewTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  postPreviewContent: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  commentsListContainer: {
    marginBottom: spacing.lg,
  },
  commentsListTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  fullCommentCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  fullCommentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAvatar: {
    marginRight: spacing.sm,
  },
  fullCommentAuthor: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
  },
  fullCommentDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  commentLikesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentLikesCount: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  fullCommentContent: {
    ...typography.body2,
    color: colors.text,
    lineHeight: 22,
  },
  repliesContainer: {
    marginTop: spacing.md,
    paddingLeft: spacing.lg,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  replyCard: {
    marginBottom: spacing.sm,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  replyInfo: {
    flex: 1,
  },
  replyAuthor: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
  },
  replyDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  replyContent: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 20,
    paddingLeft: 36,
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  noCommentsText: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  noCommentsSubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  addCommentButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default SocialUpdatesScreen;
