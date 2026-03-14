import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const AdminPostCard = ({ post, onUpdate, onEdit, onDelete, onViewDetails }) => {
  const [localPost, setLocalPost] = useState(post);

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

  const getPostTypeLabel = (type) => {
    const labels = {
      job_announcement: 'Job Announcement',
      company_update: 'Company Update',
      industry_news: 'Industry News',
      career_tips: 'Career Tips',
      event_announcement: 'Event Announcement',
      general: 'General',
    };
    return labels[type] || type;
  };

  const getLikeTypeIcon = (type) => {
    const icons = {
      thumb: 'thumbs-up',
      celebrate: 'trophy',
      support: 'hand-left',
      love: 'heart',
      insightful: 'bulb',
      funny: 'happy',
    };
    return icons[type] || 'thumbs-up';
  };

  const getLikeTypeColor = (type) => {
    const colors = {
      thumb: '#3B82F6',
      celebrate: '#F59E0B',
      support: '#8B5CF6',
      love: '#EF4444',
      insightful: '#10B981',
      funny: '#F97316',
    };
    return colors[type] || '#6B7280';
  };

  // Calculate like type breakdown
  const getLikeBreakdown = () => {
    if (!localPost.likes || !Array.isArray(localPost.likes)) return [];
    
    const breakdown = {};
    localPost.likes.forEach(like => {
      const type = like.likeType || 'thumb';
      breakdown[type] = (breakdown[type] || 0) + 1;
    });

    return Object.entries(breakdown).map(([type, count]) => ({
      type,
      count,
      icon: getLikeTypeIcon(type),
      color: getLikeTypeColor(type),
    }));
  };

  const likeBreakdown = getLikeBreakdown();

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
                      {getPostTypeLabel(localPost.postType)}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
        
        {/* Status Badges */}
        <View style={styles.statusBadges}>
          {localPost.isPinned && (
            <View style={[styles.badge, styles.pinnedBadge]}>
              <Ionicons name="pin" size={12} color="#FFF" />
            </View>
          )}
          {localPost.isFeatured && (
            <View style={[styles.badge, styles.featuredBadge]}>
              <Ionicons name="star" size={12} color="#FFF" />
            </View>
          )}
          <View style={[styles.badge, localPost.status === 'published' ? styles.publishedBadge : styles.draftBadge]}>
            <Text style={styles.badgeText}>{localPost.status}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <TouchableOpacity onPress={onViewDetails} activeOpacity={0.9}>
        <Text style={styles.title}>{localPost.title}</Text>
        <Text style={styles.content} numberOfLines={3}>
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

      {/* Like Type Breakdown */}
      {likeBreakdown.length > 0 && (
        <View style={styles.likeBreakdown}>
          <Text style={styles.likeBreakdownTitle}>Reactions:</Text>
          <View style={styles.likeTypes}>
            {likeBreakdown.map(({ type, count, icon, color }) => (
              <View key={type} style={styles.likeTypeItem}>
                <Ionicons name={icon} size={16} color={color} />
                <Text style={[styles.likeTypeCount, { color }]}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Engagement Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={16} color="#EF4444" />
          <Text style={styles.statText}>{localPost.engagement?.likes || localPost.likes?.length || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble" size={16} color="#6366F1" />
          <Text style={styles.statText}>{localPost.engagement?.comments || localPost.comments?.length || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="share-social" size={16} color="#10B981" />
          <Text style={styles.statText}>{localPost.engagement?.shares || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="repeat" size={16} color="#8B5CF6" />
          <Text style={styles.statText}>{localPost.repostCount || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="eye" size={16} color="#6B7280" />
          <Text style={styles.statText}>{localPost.engagement?.views || 0}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onViewDetails}>
          <Ionicons name="eye-outline" size={18} color="#6366F1" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={18} color="#10B981" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
  statusBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pinnedBadge: {
    backgroundColor: '#F59E0B',
  },
  featuredBadge: {
    backgroundColor: '#8B5CF6',
  },
  publishedBadge: {
    backgroundColor: '#10B981',
  },
  draftBadge: {
    backgroundColor: '#6B7280',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
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
  likeBreakdown: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  likeBreakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  likeTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  likeTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  likeTypeCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
});

export default AdminPostCard;
