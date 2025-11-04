import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isWideScreen = width > 768;
const isMobile = width <= 600;

const BlogCard = ({ blog }) => {
  const navigation = useNavigation();

  const getCategoryColor = (category) => {
    const categoryColors = {
      'Networking': '#3B82F6',
      'Workplace Trends': '#8B5CF6',
      'Interview Prep': '#10B981',
      'Career Tips': '#F59E0B',
      'Skills': '#EF4444',
    };
    return categoryColors[category] || colors.primary;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('BlogDetail', { slug: blog.slug })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.imageContainer}
      >
        <Ionicons name="newspaper-outline" size={48} color={colors.textWhite} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(blog.category) }]}>
          <Text style={styles.categoryText}>{blog.category}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {blog.title}
        </Text>

        {blog.excerpt && (
          <Text style={styles.excerpt} numberOfLines={3}>
            {blog.excerpt}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{blog.readTime || '5 min read'}</Text>
          </View>
          <TouchableOpacity style={styles.readMore}>
            <Text style={styles.readMoreText}>Read More</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    width: isMobile ? width - spacing.lg * 2 : isWideScreen ? 320 : 280,
    overflow: 'hidden',
    ...shadows.md,
    ...(isWeb && {
      cursor: 'pointer',
      userSelect: 'none',
    }),
  },
  imageContainer: {
    height: isMobile ? 150 : 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: isWideScreen ? spacing.lg : spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
    fontSize: isWideScreen ? 12 : 11,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
    fontSize: isWideScreen ? 20 : 18,
  },
  excerpt: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: isWideScreen ? 20 : 18,
    fontSize: isWideScreen ? 14 : 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: isWideScreen ? 12 : 11,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  readMoreText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: isWideScreen ? 14 : 13,
  },
});

export default BlogCard;

