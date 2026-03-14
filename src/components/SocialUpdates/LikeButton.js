import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LIKE_TYPES = [
  { key: 'thumb', icon: 'thumbs-up', label: 'Like', color: '#3B82F6' },
  { key: 'celebrate', icon: 'happy', label: 'Celebrate', color: '#10B981' },
  { key: 'support', icon: 'hand-left', label: 'Support', color: '#8B5CF6' },
  { key: 'love', icon: 'heart', label: 'Love', color: '#EF4444' },
  { key: 'insightful', icon: 'bulb', label: 'Insightful', color: '#F59E0B' },
  { key: 'funny', icon: 'happy-outline', label: 'Funny', color: '#EC4899' },
];

const LikeButton = ({ 
  postId, 
  initialLikes = 0, 
  initialIsLiked = false, 
  initialUserLikeType = null,
  onLike,
  size = 'medium',
  showLabel = true 
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [userLikeType, setUserLikeType] = useState(initialUserLikeType);

  const handleLike = async (likeType = 'thumb') => {
    try {
      setShowReactions(false);
      
      // Optimistic update
      const wasLiked = isLiked && userLikeType === likeType;
      setIsLiked(!wasLiked);
      setUserLikeType(wasLiked ? null : likeType);
      setLikes(wasLiked ? likes - 1 : (isLiked ? likes : likes + 1));

      // Call API
      if (onLike) {
        await onLike(likeType);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(initialIsLiked);
      setUserLikeType(initialUserLikeType);
      setLikes(initialLikes);
      console.error('Error liking post:', error);
    }
  };

  const getCurrentLikeIcon = () => {
    if (!isLiked || !userLikeType) return 'heart-outline';
    const likeType = LIKE_TYPES.find(t => t.key === userLikeType);
    return likeType ? likeType.icon : 'heart-outline';
  };

  const getCurrentLikeColor = () => {
    if (!isLiked || !userLikeType) return '#6B7280';
    const likeType = LIKE_TYPES.find(t => t.key === userLikeType);
    return likeType ? likeType.color : '#6B7280';
  };

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const textSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.likeButton}
        onPress={() => handleLike('thumb')}
        onLongPress={() => setShowReactions(true)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={getCurrentLikeIcon()} 
          size={iconSize} 
          color={getCurrentLikeColor()} 
        />
        {showLabel && (
          <Text style={[styles.likeText, { fontSize: textSize, color: getCurrentLikeColor() }]}>
            {likes}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showReactions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactions(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowReactions(false)}
        >
          <View style={styles.reactionsContainer}>
            {LIKE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.reactionButton,
                  userLikeType === type.key && styles.reactionButtonActive
                ]}
                onPress={() => handleLike(type.key)}
              >
                <Ionicons name={type.icon} size={28} color={type.color} />
                <Text style={[styles.reactionLabel, { color: type.color }]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  likeText: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reactionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  reactionButtonActive: {
    backgroundColor: '#F3F4F6',
  },
  reactionLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default LikeButton;
