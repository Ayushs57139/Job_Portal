import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius } from '../styles/theme';
import { useResponsive } from '../utils/responsive';

const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') return Platform;
  } catch (e) {}
  return { OS: 'android' };
};
const isWeb = getPlatform().OS === 'web';

const AVATAR_COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CompanyCard = ({ company }) => {
  const navigation = useNavigation();
  const { width } = useResponsive();

  const getInitials = (name) => {
    if (!name) return 'C';
    const w = name.trim().split(' ');
    return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  };

  const getTextValue = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.filter(Boolean).join(', ') || fallback;
    return fallback;
  };

  const name = company.profile?.company?.name || company.name || 'Company';
  const industry = getTextValue(company.profile?.company?.industry || company.industry, 'Technology');
  const location = getTextValue(
    company.profile?.company?.location || company.profile?.company?.city || company.location?.city || company.location,
    'India'
  );
  const openPositions = company.openPositions || 0;
  const isVerified = company.isVerified || company.isEmployerVerified;
  const isFeatured = company.isFeatured;
  const avatarColor = getAvatarColor(name);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CompanyDetails', { companyId: company._id, id: company._id })}
      activeOpacity={0.95}
    >
      {/* Top: logo + name + badge */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: avatarColor + '18', borderColor: avatarColor + '30' }]}>
          <Text style={[styles.avatarText, { color: avatarColor }]}>{getInitials(name)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.companyName} numberOfLines={1}>{name}</Text>
          <Text style={styles.industry} numberOfLines={1}>{industry}</Text>
        </View>
        {(isFeatured || isVerified) ? (
          <View style={[styles.badge, isFeatured ? styles.badgeFeatured : styles.badgeVerified]}>
            <Text style={[styles.badgeText, isFeatured ? styles.badgeFeaturedText : styles.badgeVerifiedText]}>
              {isFeatured ? 'Featured' : 'Verified'}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="briefcase-outline" size={13} color="#64748B" />
          <Text style={styles.statText}>
            {openPositions > 0 ? `${openPositions} open ${openPositions === 1 ? 'job' : 'jobs'}` : 'No openings'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="location-outline" size={13} color="#64748B" />
          <Text style={styles.statText} numberOfLines={1}>{location}</Text>
        </View>
      </View>

      {/* Hiring status */}
      {openPositions > 0 ? (
        <View style={styles.hiringRow}>
          <View style={styles.hiringDot} />
          <Text style={styles.hiringText}>Actively Hiring</Text>
        </View>
      ) : null}

      {/* CTA */}
      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() => navigation.navigate('CompanyDetails', { companyId: company._id, id: company._id })}
        activeOpacity={0.85}
      >
        <Text style={styles.viewBtnText}>View Jobs</Text>
        <Ionicons name="arrow-forward" size={13} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 220,
    height: 200,
    ...(isWeb && {
      cursor: 'pointer',
      boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  industry: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '400',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  badgeFeatured: {
    backgroundColor: '#FEF3C7',
  },
  badgeVerified: {
    backgroundColor: '#DCFCE7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeFeaturedText: {
    color: '#92400E',
  },
  badgeVerifiedText: {
    color: '#166534',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  statsRow: {
    gap: 6,
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  hiringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  hiringDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  hiringText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '08',
    marginTop: 'auto',
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default CompanyCard;
