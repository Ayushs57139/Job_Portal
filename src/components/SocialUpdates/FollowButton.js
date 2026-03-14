import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const FollowButton = ({ 
  userId, 
  initialIsFollowing = false,
  size = 'medium',
  style 
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [userId]);

  const checkFollowStatus = async () => {
    try {
      const response = await api.isFollowing(userId);
      setIsFollowing(response.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    try {
      setLoading(true);
      
      if (isFollowing) {
        await api.unfollowUser(userId);
        setIsFollowing(false);
        Alert.alert('Success', 'Unfollowed successfully');
      } else {
        await api.followUser(userId, {
          jobPosts: true,
          socialUpdates: true,
          companyNews: true
        });
        setIsFollowing(true);
        Alert.alert('Success', 'Following! You will receive updates.');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', error.message || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  const buttonSize = size === 'small' ? styles.buttonSmall : size === 'large' ? styles.buttonLarge : styles.buttonMedium;
  const textSize = size === 'small' ? styles.textSmall : size === 'large' ? styles.textLarge : styles.textMedium;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonSize,
        isFollowing ? styles.buttonFollowing : styles.buttonNotFollowing,
        style
      ]}
      onPress={handleFollow}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isFollowing ? "#6366F1" : "#FFFFFF"} />
      ) : (
        <>
          <Ionicons 
            name={isFollowing ? "checkmark" : "add"} 
            size={size === 'small' ? 14 : size === 'large' ? 20 : 16} 
            color={isFollowing ? "#6366F1" : "#FFFFFF"} 
          />
          <Text style={[
            styles.text,
            textSize,
            isFollowing ? styles.textFollowing : styles.textNotFollowing
          ]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonMedium: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonLarge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonNotFollowing: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  buttonFollowing: {
    backgroundColor: '#FFFFFF',
    borderColor: '#6366F1',
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 16,
  },
  textNotFollowing: {
    color: '#FFFFFF',
  },
  textFollowing: {
    color: '#6366F1',
  },
});

export default FollowButton;
