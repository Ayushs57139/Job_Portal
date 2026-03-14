import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LikeButton from './LikeButton';
import CommentInput from './CommentInput';
import ShareModal from './ShareModal';
import RepostModal from './RepostModal';
import FollowButton from './FollowButton';
import api from '../../config/api';

const PostCard = ({ post, currentUser, onUpdate, onPress }) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const isOwnPost = currentUser && localPost.author?._id === currentUser.id;
  const canFollow = !isOwnPost && (localPost.authorType === 'company' || localPost.authorType === 'consultancy');

  const handleLike = async (likeType) => {
    try {
      const response = await api.likeSocialUpdate(localPost._id, likeType);
      setLocalPost({
        ...localPost,
        engagement: {
          ...localPost.engagement,
          likes: response.likes
        },
        likedBy: response.isLiked 
          ? [...(localPost.likedBy || []), currentUser.id]
          : (localPost.likedBy || []).filter(id => id !== currentUser.id)
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (content, isSuggested, suggestionId) => {
    try {
      await api.commentOnSocialUpdate(localPost._id, content, isSuggested, suggestionId);
      setLocalPost({
        ...localPost,
        engagement: {
          ...localPost.engagement,
          comments: (localPost.engagement?.comments || 0) + 1
        }
      });
      setShowCommentInput(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error commenting:', error);
      throw error;
    }
  };

  const handleShare = async (platform) => {
    try {
      await api.shareSocialUpdate(localPost._id, platform);
      setLocalPost({
        ...localPost,
        engagement: {
          ...localPost.engagement,
          shares: (localPost.engagement?.shares || 0) + 1
        }
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error sharing:', error);
      throw error;
    }
  };

  const handleRepost = async (repostType, thoughts) => {
    try {
      await api.repostSocialUpdate(localPost._id, repostType, thoughts);
      setLocalPost({
        ...localPost,
        repostCount: (localPost.repostCount || 0) + 1
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error reposting:', error);
      throw error;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          {localPost.authorLogo ? (
            <Image source={{ uri: localPost.authorLogo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{localPost.authorName}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.timestamp}>{formatDate(localPost.createdAt)}</Text>
              {localPost.postType && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <View style={[styles.typeBadge, { backgroundColor: `${getPostTypeColor(localPost.postType)}15` }]}>
                    <Text style={[styles.typeText, { color: getPostTypeColor(localPost.postType) }]}>
                      {localPost.postType.replace('_', ' ')}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
        {canFollow && (
          <FollowButton userId={localPost.author?._id} size="small" />
        )}
      </View>

      {/* Content */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Text style={styles.title}>{localPost.title}</Text>
        <Text style={styles.content} numberOfLines={4}>
          {localPost.content}
        </Text>

        {/* Media */}
        {localPost.media && localPost.media.length > 0 && (
          <View style={styles.mediaContainer}>
            {localPost.media[0].type === 'image' && (
              <Image 
                source={{ uri: localPost.media[0].url }} 
                style={styles.mediaImage}
                resizeMode="cover"
              />
            )}
          </View>
        )}

        {/* Repost indicator */}
        {localPost.isRepost && localPost.originalPost && (
          <View style={styles.repostIndicator}>
            <Ionicons name="repeat" size={14} color="#6B7280" />
            <Text style={styles.repostText}>Reposted</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Engagement Stats */}
      <View style={styles.stats}>
        <Text style={styles.statText}>
          {localPost.engagement?.likes || 0} likes
        </Text>
        <Text style={styles.statText}>
          {localPost.engagement?.comments || 0} comments
        </Text>
        <Text style={styles.statText}>
          {localPost.engagement?.shares || 0} shares
        </Text>
        {localPost.repostCount > 0 && (
          <Text style={styles.statText}>
            {localPost.repostCount} reposts
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <LikeButton
          postId={localPost._id}
          initialLikes={localPost.engagement?.likes || 0}
          initialIsLiked={localPost.likedBy?.includes(currentUser?.id)}
          initialUserLikeType={localPost.likes?.find(l => l.user === currentUser?.id)?.likeType}
          onLike={handleLike}
          size="medium"
        />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowCommentInput(!showCommentInput)}
        >
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

      {/* Comment Input */}
      {showCommentInput && (
        <View style={styles.commentInputContainer}>
          <CommentInput
            postId={localPost._id}
            postType={localPost.postType}
            onSubmit={handleComment}
            autoFocus
          />
        </View>
      )}

      {/* Modals */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={localPost}
        onShare={handleShare}
      />

      <RepostModal
        visible={showRepostModal}
        onClose={() => setShowRepostModal(false)}
        post={localPost}
        onRepost={handleRepost}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 16,
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
    fontSize: 13,
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
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  content: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  mediaContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 200,
  },
  repostIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginTop: 8,
  },
  repostText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  commentInputContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default PostCard;
