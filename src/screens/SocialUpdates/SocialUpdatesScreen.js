import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isPhone = width <= 480;
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

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

  // Full post view modal state
  const [fullPostModalVisible, setFullPostModalVisible] = useState(false);
  const [selectedFullPost, setSelectedFullPost] = useState(null);

  useEffect(() => {
    loadUserData();
    loadPosts();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await api.getCurrentUserFromStorage();
      console.log('Loaded user data:', userData);
      setCurrentUser(userData);
    } catch (error) {
      console.log('Could not load user data:', error);
      setCurrentUser(null);
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
    console.log('handleLike called with postId:', postId);
    console.log('currentUser:', currentUser);
    if (!currentUser) {
      if (isWeb) {
        window.alert('Please login to like posts.');
      } else {
        Alert.alert('Login Required', 'Please login to like posts.');
      }
      return;
    }

    try {
      console.log('Calling API to like post:', postId);
      const response = await api.likeSocialUpdate(postId);
      console.log('Like response:', response);
      
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
      if (isWeb) {
        window.alert('Failed to like post. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to like post. Please try again.');
      }
    }
  };

  const openCommentModal = (post) => {
    console.log('openCommentModal called with post:', post?._id);
    console.log('currentUser:', currentUser);
    if (!currentUser) {
      if (isWeb) {
        window.alert('Please login to comment on posts.');
      } else {
        Alert.alert('Login Required', 'Please login to comment on posts.');
      }
      return;
    }
    console.log('Opening comment modal');
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

  const openFullPostModal = (post) => {
    setSelectedFullPost(post);
    setFullPostModalVisible(true);
  };

  const closeFullPostModal = () => {
    setFullPostModalVisible(false);
    setSelectedFullPost(null);
  };

  const handleShare = async (post) => {
    console.log('handleShare called with post:', post?._id);
    console.log('currentUser:', currentUser);
    if (!currentUser) {
      if (isWeb) {
        window.alert('Please login to share posts.');
      } else {
        Alert.alert('Login Required', 'Please login to share posts.');
      }
      return;
    }

    if (isWeb) {
      const platform = window.prompt('Choose a platform to share:\n1. WhatsApp\n2. Facebook\n3. Twitter\n\nEnter 1, 2, or 3:');
      if (platform === '1') {
        shareToPlaystore(post, 'whatsapp');
      } else if (platform === '2') {
        shareToPlaystore(post, 'facebook');
      } else if (platform === '3') {
        shareToPlaystore(post, 'twitter');
      }
    } else {
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
    }
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

      if (isWeb) {
        window.alert('Post shared successfully!');
      } else {
        Alert.alert('Success', 'Post shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      if (isWeb) {
        window.alert('Failed to share post. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to share post. Please try again.');
      }
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
      <TouchableOpacity 
        style={styles.postCard}
        onPress={() => openFullPostModal(item)}
        activeOpacity={0.9}
      >
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
          <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.postText} numberOfLines={3}>{item.content}</Text>

          {/* Post Media - Show thumbnail only */}
          {item.media && item.media.length > 0 && item.media[0].type === 'image' && (
            <Image
              source={{ uri: `${api.baseURL.replace('/api', '')}${item.media[0].url}` }}
              style={styles.postImageThumbnail}
              resizeMode="cover"
            />
          )}

          {/* Tags - Show limited */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {item.tags.length > 2 && (
                <Text style={styles.moreTagsText}>+{item.tags.length - 2} more</Text>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons - Compact */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e?.stopPropagation?.();
              console.log('Like button pressed for post:', item._id);
              handleLike(item._id);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? colors.error : colors.textSecondary}
            />
            <Text style={[styles.actionButtonTextCompact, isLiked && styles.likedText]}>
              {item.engagement?.likes || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e?.stopPropagation?.();
              console.log('Comment button pressed for post:', item._id);
              openFullPostModal(item);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.actionButtonTextCompact}>
              {item.engagement?.comments || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e?.stopPropagation?.();
              console.log('Share button pressed for post:', item._id);
              handleShare(item);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.actionButtonTextCompact}>
              {item.engagement?.shares || 0}
            </Text>
          </TouchableOpacity>
        </View>

        {/* View Full Post Button */}
        <TouchableOpacity 
          style={styles.viewFullButton}
          onPress={(e) => {
            e?.stopPropagation?.();
            openFullPostModal(item);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.viewFullButtonText}>View Full Post</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
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
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="megaphone" size={56} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Social Updates</Text>
          <Text style={styles.heroSubtitle}>
            Stay connected with the latest from companies and consultancies
          </Text>
        </View>

        {/* Posts Grid */}
        {loading && posts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading social updates...</Text>
          </View>
        ) : posts.length === 0 ? (
          renderEmpty()
        ) : (
          <View style={styles.postsGrid}>
            {posts.map((post) => (
              <View key={post._id} style={styles.postCardWrapper}>
                {renderPostItem({ item: post })}
              </View>
            ))}
          </View>
        )}

        {/* Load More Footer */}
        {loadingMore && (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </ScrollView>

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

      {/* Full Post View Modal */}
      <Modal
        visible={fullPostModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeFullPostModal}
      >
        <View style={styles.fullModalContainer}>
          <View style={styles.fullModalHeader}>
            <Text style={styles.fullModalTitle}>Social Update</Text>
            <TouchableOpacity onPress={closeFullPostModal}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedFullPost && (
            <ScrollView style={styles.fullModalContent}>
              {/* Full Post Card */}
              <View style={styles.fullPostCard}>
                {/* Post Header */}
                <View style={styles.fullPostHeader}>
                  <View style={styles.authorInfo}>
                    <View style={styles.avatarContainer}>
                      {selectedFullPost.authorLogo ? (
                        <Image source={{ uri: selectedFullPost.authorLogo }} style={styles.avatar} />
                      ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                          <Ionicons name="business" size={20} color={colors.textSecondary} />
                        </View>
                      )}
                    </View>
                    <View style={styles.authorDetails}>
                      <Text style={styles.authorName}>{selectedFullPost.authorName}</Text>
                      <View style={styles.postMeta}>
                        <Text style={styles.authorType}>
                          {selectedFullPost.authorType === 'admin' ? 'Admin' : selectedFullPost.authorType === 'company' ? 'Company' : 'Consultancy'}
                        </Text>
                        <Text style={styles.dotSeparator}> • </Text>
                        <Text style={styles.postDate}>{formatDate(selectedFullPost.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                  {selectedFullPost.postType && selectedFullPost.postType !== 'general' && (
                    <View style={styles.postTypeBadge}>
                      <Text style={styles.postTypeText}>
                        {selectedFullPost.postType.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Full Post Content */}
                <View style={styles.fullPostContent}>
                  <Text style={styles.fullPostTitle}>{selectedFullPost.title}</Text>
                  <Text style={styles.fullPostText}>{selectedFullPost.content}</Text>

                  {/* Full Post Media */}
                  {selectedFullPost.media && selectedFullPost.media.length > 0 && selectedFullPost.media[0].type === 'image' && (
                    <Image
                      source={{ uri: `${api.baseURL.replace('/api', '')}${selectedFullPost.media[0].url}` }}
                      style={styles.fullPostImage}
                      resizeMode="cover"
                    />
                  )}

                  {/* All Tags */}
                  {selectedFullPost.tags && selectedFullPost.tags.length > 0 && (
                    <View style={styles.fullTagsContainer}>
                      {selectedFullPost.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Engagement Stats */}
                <View style={styles.fullEngagementStats}>
                  <TouchableOpacity onPress={() => selectedFullPost.engagement?.likes > 0 && Alert.alert('Likes', `${selectedFullPost.engagement.likes} people liked this post`)}>
                    <Text style={styles.engagementText}>
                      {selectedFullPost.engagement?.likes || 0} likes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => selectedFullPost.comments && selectedFullPost.comments.length > 0 && openViewCommentsModal(selectedFullPost)}>
                    <Text style={styles.engagementText}>
                      {selectedFullPost.engagement?.comments || 0} comments
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.engagementText}>
                    {selectedFullPost.engagement?.shares || 0} shares
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.fullActionButtons}>
                  <TouchableOpacity
                    style={styles.fullActionButton}
                    onPress={() => {
                      const isLiked = currentUser && selectedFullPost.likedBy && selectedFullPost.likedBy.includes(currentUser._id);
                      handleLike(selectedFullPost._id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={currentUser && selectedFullPost.likedBy && selectedFullPost.likedBy.includes(currentUser._id) ? 'heart' : 'heart-outline'}
                      size={22}
                      color={currentUser && selectedFullPost.likedBy && selectedFullPost.likedBy.includes(currentUser._id) ? colors.error : colors.textSecondary}
                    />
                    <Text style={[styles.actionButtonText, currentUser && selectedFullPost.likedBy && selectedFullPost.likedBy.includes(currentUser._id) && styles.likedText]}>
                      Like
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.fullActionButton}
                    onPress={() => {
                      closeFullPostModal();
                      openCommentModal(selectedFullPost);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.actionButtonText}>Comment</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.fullActionButton}
                    onPress={() => handleShare(selectedFullPost)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>

                {/* Comments Preview */}
                {selectedFullPost.comments && selectedFullPost.comments.length > 0 && (
                  <View style={styles.commentsPreview}>
                    {selectedFullPost.comments.slice(0, 2).map((comment, index) => (
                      <View key={index} style={styles.commentItem}>
                        <Text style={styles.commentAuthor}>
                          {comment.user?.firstName} {comment.user?.lastName}:
                        </Text>
                        <Text style={styles.commentText} numberOfLines={2}>
                          {comment.content}
                        </Text>
                      </View>
                    ))}
                    {selectedFullPost.comments.length > 2 && (
                      <TouchableOpacity onPress={() => {
                        closeFullPostModal();
                        openViewCommentsModal(selectedFullPost);
                      }}>
                        <Text style={styles.viewMoreComments}>
                          View all {selectedFullPost.comments.length} comments
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
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
    backgroundColor: colors.white,
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
    paddingVertical: isMobile ? spacing.xl : spacing.xxl,
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...(isWeb && {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    }),
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
    maxWidth: width * 0.8,
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'center',
    paddingHorizontal: isWeb ? spacing.xl : spacing.lg,
    ...(isWeb && {
      maxWidth: 1400,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  postCardWrapper: {
    width: isPhone ? '100%' : '48%',
  },
  postCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    ...(isWeb && {
      userSelect: 'none',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
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
    width: 40,
    height: 40,
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
    fontSize: 14,
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
    fontSize: 10,
  },
  dotSeparator: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  postDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  postTypeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
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
    lineHeight: 20,
    fontSize: 16,
  },
  postText: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  postImageThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.border,
  },
  postImage: {
    width: '100%',
    height: 240,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    backgroundColor: colors.border,
    ...shadows.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    gap: spacing.xs,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 10,
  },
  moreTagsText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
  },
  engagementStats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.lg,
  },
  engagementText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    ...(isWeb && {
      pointerEvents: 'auto',
    }),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderRadius: borderRadius.sm,
    ...(isWeb && {
      cursor: 'pointer',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'manipulation',
      pointerEvents: 'auto',
    }),
  },
  actionButtonText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionButtonTextCompact: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  viewFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.primaryLight + '20',
    gap: spacing.xs,
  },
  viewFullButtonText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
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
  // Full Post Modal Styles
  fullPostCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    margin: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  fullPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  fullPostContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  fullPostTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  fullPostText: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  fullPostImage: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    backgroundColor: colors.border,
    ...shadows.sm,
  },
  fullTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  fullEngagementStats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.lg,
  },
  fullActionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  fullActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    borderRadius: borderRadius.sm,
  },
});

export default SocialUpdatesScreen;
