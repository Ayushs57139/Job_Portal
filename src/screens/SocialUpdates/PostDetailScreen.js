import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';
import Header from '../../components/Header';
import LikeButton from '../../components/SocialUpdates/LikeButton';
import CommentInput from '../../components/SocialUpdates/CommentInput';
import ShareModal from '../../components/SocialUpdates/ShareModal';
import RepostModal from '../../components/SocialUpdates/RepostModal';
import FollowButton from '../../components/SocialUpdates/FollowButton';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const responsive = useResponsive();
  const { width } = responsive;
  const isMobile = width <= 768;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    loadData();
  }, [postId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postData, userData] = await Promise.all([
        api.getSocialUpdate(postId),
        api.getCurrentUserFromStorage().catch(() => null),
      ]);

      setPost(postData);
      setCurrentUser(userData);
      setComments(postData.comments || []);
    } catch (error) {
      console.error('Error loading post:', error);
      Alert.alert('Error', 'Failed to load post details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (likeType) => {
    try {
      const response = await api.likeSocialUpdate(post._id, likeType);
      setPost({
        ...post,
        engagement: {
          ...post.engagement,
          likes: response.likes,
        },
        likedBy: response.isLiked
          ? [...(post.likedBy || []), currentUser.id]
          : (post.likedBy || []).filter((id) => id !== currentUser.id),
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (content, isSuggested, suggestionId) => {
    try {
      const response = await api.commentOnSocialUpdate(
        post._id,
        content,
        isSuggested,
        suggestionId
      );
      setComments([...comments, response.comment]);
      setPost({
        ...post,
        engagement: {
          ...post.engagement,
          comments: (post.engagement?.comments || 0) + 1,
        },
      });
    } catch (error) {
      console.error('Error commenting:', error);
      throw error;
    }
  };

  const handleShare = async (platform) => {
    try {
      await api.shareSocialUpdate(post._id, platform);
      setPost({
        ...post,
        engagement: {
          ...post.engagement,
          shares: (post.engagement?.shares || 0) + 1,
        },
      });
    } catch (error) {
      console.error('Error sharing:', error);
      throw error;
    }
  };

  const handleRepost = async (repostType, thoughts) => {
    try {
      await api.repostSocialUpdate(post._id, repostType, thoughts);
      setPost({
        ...post,
        repostCount: (post.repostCount || 0) + 1,
      });
      Alert.alert('Success', 'Post reposted successfully!');
    } catch (error) {
      console.error('Error reposting:', error);
      throw error;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPostTypeColor = (type) => {
    const colors = {
      job_announcement: '#10B981',
      company_update: '#6366F1',
      industry_news: '#F59E0B',
      career_tips: '#8B5CF6',
      event_announcement: '#EC4899',
      general: '#6B7280',
    };
    return colors[type] || colors.general;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Post not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isOwnPost = currentUser && post.author?._id === currentUser.id;
  const canFollow =
    !isOwnPost &&
    (post.authorType === 'company' || post.authorType === 'consultancy');

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButtonTop}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
          <Text style={styles.backButtonTopText}>Back</Text>
        </TouchableOpacity>

        {/* Post Card */}
        <View style={styles.postCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.authorInfo}>
              {post.authorLogo ? (
                <Image source={{ uri: post.authorLogo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={24} color="#9CA3AF" />
                </View>
              )}
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{post.authorName}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
                  {post.postType && (
                    <>
                      <Text style={styles.dot}>•</Text>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor: `${getPostTypeColor(post.postType)}15`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeText,
                            { color: getPostTypeColor(post.postType) },
                          ]}
                        >
                          {post.postType.replace('_', ' ')}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
            {canFollow && <FollowButton userId={post.author?._id} size="small" />}
          </View>

          {/* Content */}
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.contentText}>{post.content}</Text>

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <View style={styles.mediaContainer}>
              {post.media.map((item, index) => (
                <Image
                  key={index}
                  source={{ uri: item.url }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Engagement Stats */}
          <View style={styles.stats}>
            <Text style={styles.statText}>{post.engagement?.likes || 0} likes</Text>
            <Text style={styles.statText}>
              {post.engagement?.comments || 0} comments
            </Text>
            <Text style={styles.statText}>
              {post.engagement?.shares || 0} shares
            </Text>
            {post.repostCount > 0 && (
              <Text style={styles.statText}>{post.repostCount} reposts</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <LikeButton
              postId={post._id}
              initialLikes={post.engagement?.likes || 0}
              initialIsLiked={post.likedBy?.includes(currentUser?.id)}
              initialUserLikeType={
                post.likes?.find((l) => l.user === currentUser?.id)?.likeType
              }
              onLike={handleLike}
              size="medium"
            />

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
              <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowRepostModal(true)}
            >
              <Ionicons name="repeat" size={20} color="#6B7280" />
              <Text style={styles.actionText}>Repost</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowShareModal(true)}
            >
              <Ionicons name="share-social-outline" size={20} color="#6B7280" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Comments ({comments.length})
          </Text>

          {/* Comment Input */}
          {currentUser && (
            <View style={styles.commentInputContainer}>
              <CommentInput
                postId={post._id}
                postType={post.postType}
                onSubmit={handleComment}
              />
            </View>
          )}

          {/* Comments List */}
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <View key={index} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    <Ionicons name="person-circle" size={40} color="#6366F1" />
                  </View>
                  <View style={styles.commentContent}>
                    <Text style={styles.commentAuthor}>
                      {comment.user?.firstName} {comment.user?.lastName}
                    </Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <Text style={styles.commentDate}>
                      {formatDate(comment.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noComments}>
              <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
              <Text style={styles.noCommentsText}>No comments yet</Text>
              <Text style={styles.noCommentsSubtext}>
                Be the first to comment!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
        onShare={handleShare}
      />

      <RepostModal
        visible={showRepostModal}
        onClose={() => setShowRepostModal(false)}
        post={post}
        onRepost={handleRepost}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  backButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  backButtonTopText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestamp: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  dot: {
    color: '#D1D5DB',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 32,
  },
  contentText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 26,
    marginBottom: 16,
  },
  mediaContainer: {
    marginBottom: 16,
    gap: 12,
  },
  mediaImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  commentsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  commentInputContainer: {
    marginBottom: 24,
  },
  commentCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  noComments: {
    alignItems: 'center',
    padding: 40,
  },
  noCommentsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default PostDetailScreen;
