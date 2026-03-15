import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius, spacing } from '../styles/theme';
import { useResponsive } from '../utils/responsive';

const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') return Platform;
  } catch (e) {}
  return { OS: 'android' };
};
const isWeb = getPlatform().OS === 'web';

const CATEGORY_COLORS = {
  'Networking': '#3B82F6',
  'Workplace Trends': '#8B5CF6',
  'Interview Prep': '#10B981',
  'Career Tips': '#F59E0B',
  'Skills': '#EF4444',
  'Professional Development': '#6366F1',
  'Salary Negotiation': '#EC4899',
};

const CARD_BG_COLORS = [
  ['#EFF6FF', '#DBEAFE', '#3B82F6'],
  ['#F5F3FF', '#EDE9FE', '#8B5CF6'],
  ['#ECFDF5', '#D1FAE5', '#10B981'],
  ['#FFFBEB', '#FEF3C7', '#F59E0B'],
  ['#FFF1F2', '#FFE4E6', '#EF4444'],
];

const BlogCard = ({ blog, index = 0 }) => {
  const navigation = useNavigation();
  const { width } = useResponsive();
  const isMobile = width <= 480;

  const categoryColor = CATEGORY_COLORS[blog.category] || colors.primary;
  const bgSet = CARD_BG_COLORS[index % CARD_BG_COLORS.length];

  const cardWidth = isMobile ? width - 40 : width <= 600 ? 260 : width <= 834 ? 280 : 300;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => navigation.navigate('BlogDetail', { slug: blog.slug })}
      activeOpacity={0.95}
    >
      {/* Colored top strip instead of big gradient block */}
      <View style={[styles.colorStrip, { backgroundColor: bgSet[0] }]}>
        <View style={[styles.iconCircle, { backgroundColor: bgSet[2] + '20', borderColor: bgSet[2] + '30' }]}>
          <Ionicons name="newspaper-outline" size={22} color={bgSet[2]} />
        </View>
        <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{blog.category || 'Article'}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{blog.title}</Text>
        {blog.excerpt ? (
          <Text style={styles.excerpt} numberOfLines={2}>{blog.excerpt}</Text>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.readTimePill}>
            <Ionicons name="time-outline" size={12} color="#64748B" />
            <Text style={styles.readTimeText}>{blog.readTime || '5 min read'}</Text>
          </View>
          <View style={styles.readMoreRow}>
            <Text style={styles.readMoreText}>Read More</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...(isWeb && {
      cursor: 'pointer',
      boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
      transition: 'box-shadow 0.2s ease',
    }),
  },
  colorStrip: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 6,
  },
  excerpt: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  readTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    fontSize: 11,
    color: '#64748B',
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default BlogCard;
