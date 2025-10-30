import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const isWeb = Platform.OS === 'web';

const CompanyCard = ({ company }) => {
  const navigation = useNavigation();

  // Get company initials for avatar
  const getInitials = (name) => {
    if (!name) return 'C';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={14} color="#FFB800" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="star-half" name="star-half" size={14} color="#FFB800" />
      );
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Ionicons key={`star-empty-${i}`} name="star-outline" size={14} color="#FFB800" />
      );
    }
    
    return stars;
  };

  // Get consistent color based on company name
  const getAvatarColor = (name) => {
    const avatarColors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    if (!name) return avatarColors[0];
    const charCode = name.charCodeAt(0);
    return avatarColors[charCode % avatarColors.length];
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(company.profile?.company?.name || company.name) }]}>
          <Text style={styles.avatarText}>{getInitials(company.profile?.company?.name || company.name)}</Text>
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.companyName} numberOfLines={1}>
            {company.profile?.company?.name || company.name}
          </Text>
          <View style={styles.industryBadge}>
            <Text style={styles.industryText}>
              {company.profile?.company?.industry || company.industry || 'Technology'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.openPositions}>
          {company.openPositions || 0} open {company.openPositions === 1 ? 'position' : 'positions'}
        </Text>
        
        {company.rating && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(company.rating)}
            </View>
            <Text style={styles.ratingText}>
              {company.rating}/5
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {company.profile?.company?.description || company.description || 'Leading company in the industry'}
      </Text>

      <TouchableOpacity
        style={styles.viewJobsButton}
        onPress={() => navigation.navigate('CompanyDetails', { companyId: company._id })}
        activeOpacity={0.8}
      >
        <Text style={styles.viewJobsText}>View Jobs</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textWhite,
  },
  headerInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  industryBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  industryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  openPositions: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  viewJobsButton: {
    backgroundColor: '#6366F1',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewJobsText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textWhite,
  },
});

export default CompanyCard;

