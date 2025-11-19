import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isPhone = width <= 480;
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

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

  const getTextValue = (value, fallback) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' || typeof value === 'number') return value.toString();
    if (Array.isArray(value)) return value.filter(Boolean).join(', ') || fallback;
    if (typeof value === 'object') {
      const objectText = Object.values(value)
        .filter((v) => typeof v === 'string' && v.trim())
        .join(', ');
      return objectText || fallback;
    }
    return fallback;
  };

  const location = getTextValue(
    company.profile?.company?.location ||
      company.profile?.company?.city ||
      company.location?.city ||
      company.location,
    'Multiple locations'
  );

  const companyType = getTextValue(
    company.profile?.company?.companyType || company.companyType,
    'Private company'
  );

  const employeeCount = getTextValue(
    company.profile?.company?.employeeCount || company.employeeCount,
    '200+ employees'
  );

  const hiringStatus = (company.openPositions || 0) > 0 ? 'Actively hiring' : 'Building talent pool';

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('CompanyDetails', { companyId: company._id })}
      activeOpacity={0.9}
    >
      <View style={styles.trustBadge}>
        <Ionicons name="shield-checkmark" size={14} color="#4338CA" />
        <Text style={styles.trustBadgeText}>{company.isFeatured ? 'Featured partner' : 'Verified'}</Text>
      </View>

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

      <View style={styles.metaChips}>
        <View style={styles.metaChip}>
          <Ionicons name="location-outline" size={14} color="#4338CA" />
          <Text style={styles.metaChipText}>{location}</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="briefcase-outline" size={14} color="#4338CA" />
          <Text style={styles.metaChipText}>{companyType}</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="people-outline" size={14} color="#4338CA" />
          <Text style={styles.metaChipText}>{employeeCount}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {company.profile?.company?.description || company.description || 'Leading company in the industry'}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.viewJobsButton}>
          <Text style={styles.viewJobsText}>View Jobs</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </View>
        <View style={styles.hiringTag}>
          <Ionicons name="flash" size={14} color="#10B981" />
          <Text style={styles.hiringTagText}>{hiringStatus}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: isPhone ? spacing.sm : (isMobile ? spacing.md : isTablet ? spacing.md : spacing.lg),
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
    ...(isWeb && {
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isPhone ? spacing.sm : spacing.md,
    gap: isPhone ? spacing.sm : spacing.md,
  },
  avatar: {
    width: isPhone ? 44 : (isMobile ? 48 : (isTablet ? 52 : 56)),
    height: isPhone ? 44 : (isMobile ? 48 : (isTablet ? 52 : 56)),
    borderRadius: isPhone ? 22 : (isMobile ? 24 : (isTablet ? 26 : 28)),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: isPhone ? 18 : (isMobile ? 20 : (isTablet ? 22 : 24)),
    fontWeight: '700',
    color: colors.textWhite,
  },
  headerInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: isPhone ? 14 : (isMobile ? 16 : (isTablet ? 17 : (isDesktop ? 18 : 17))),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  industryBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: isPhone ? spacing.xs : spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  industryText: {
    fontSize: isPhone ? 10 : (isMobile ? 11 : (isTablet ? 11 : (isDesktop ? 12 : 11))),
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
    fontSize: isPhone ? 12 : (isMobile ? 13 : (isTablet ? 13 : (isDesktop ? 14 : 13))),
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
    fontSize: isPhone ? 11 : (isMobile ? 12 : (isTablet ? 12 : (isDesktop ? 13 : 12))),
    color: colors.text,
    fontWeight: '600',
  },
  description: {
    fontSize: isPhone ? 12 : (isMobile ? 13 : (isTablet ? 13 : (isDesktop ? 14 : 13))),
    color: colors.textSecondary,
    marginBottom: isPhone ? spacing.sm : spacing.md,
    lineHeight: isPhone ? 18 : (isMobile ? 18 : (isTablet ? 19 : 20)),
  },
  metaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 1.5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.lg,
    backgroundColor: '#EEF2FF',
  },
  metaChipText: {
    fontSize: isPhone ? 11 : 12,
    fontWeight: '600',
    color: '#4338CA',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  viewJobsButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: borderRadius.md,
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewJobsText: {
    fontSize: isPhone ? 13 : (isMobile ? 14 : (isTablet ? 14 : (isDesktop ? 15 : 14))),
    fontWeight: '600',
    color: colors.textWhite,
  },
  hiringTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 1.5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#ECFDF5',
  },
  hiringTagText: {
    fontSize: isPhone ? 11 : 12,
    fontWeight: '600',
    color: '#047857',
  },
  trustBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 1.5,
    backgroundColor: '#EEF2FF',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    zIndex: 1,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4338CA',
  },
});

export default CompanyCard;

