import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import api from '../../config/api';

const { width } = Dimensions.get('window');
// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';
const isPhone = width <= 480;
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

const BlogDetailScreen = ({ route, navigation }) => {
  const { blogId, slug } = route.params || {};
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadBlog();
  }, [blogId, slug]);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUserFromStorage();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadBlog = async () => {
    try {
      setLoading(true);
      // Use slug if provided, otherwise use blogId
      const identifier = slug || blogId;
      console.log('BlogDetailScreen - Loading blog with identifier:', identifier);
      console.log('Route params:', route.params);
      
      if (!identifier) {
        console.error('No identifier provided (slug or blogId)');
        Alert.alert('Error', 'Blog identifier is missing');
        navigation.goBack();
        return;
      }
      
      const response = await api.getBlog(identifier);
      console.log('Blog API response:', response);
      
      if (response && response.success) {
        setBlog(response.blog);
      } else {
        throw new Error('Failed to load blog: Invalid response');
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', error.message || 'Failed to load blog');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${blog.title}\n\n${blog.excerpt}`,
        title: blog.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Blog',
      'Are you sure you want to delete this blog?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use slug if provided, otherwise use blogId
              const identifier = slug || blogId;
              const response = await api.request(`/blogs/${identifier}`, { method: 'DELETE' });
              if (response && response.success) {
                Alert.alert('Success', 'Blog deleted successfully');
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting blog:', error);
              Alert.alert('Error', error.message || 'Failed to delete blog');
            }
          },
        },
      ]
    );
  };

  const canEditBlog = () => {
    if (!user || !blog) return false;
    const isAdmin = user.userType === 'admin' || user.userType === 'superadmin';
    const isOwner = blog.authorId === user._id;
    return isAdmin || isOwner;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      'Career Tips': ['#FF6B6B', '#FF8E53'],
      'Interview Prep': ['#4ECDC4', '#44A08D'],
      'Workplace Trends': ['#A8EDEA', '#FED6E3'],
      'Resume Writing': ['#FFD89B', '#19547B'],
      'Job Search': ['#FF9A9E', '#FECFEF'],
      'Industry News': ['#30CFD0', '#330867'],
      'Salary Negotiation': ['#FBD786', '#F7971E'],
      'Networking': ['#C471ED', '#F64F59'],
      'Professional Development': ['#FFECD2', '#FCB69F'],
      'Work-Life Balance': ['#A1C4FD', '#C2E9FB'],
    };
    return categoryColors[category] || ['#667EEA', '#764BA2'];
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading blog...</Text>
        </View>
      </View>
    );
  }

  if (!blog) {
    return null;
  }

  const categoryColors = getCategoryColor(blog.category);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>Blog Post</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <View style={styles.iconButtonContainer}>
              <Ionicons name="share-social" size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>
          {canEditBlog() && (
            <>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateBlog', { blog })}
                style={styles.iconButton}
              >
                <View style={[styles.iconButtonContainer, styles.editButtonContainer]}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
                <View style={[styles.iconButtonContainer, styles.deleteButtonContainer]}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroWrapper}>
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <View style={styles.badgesContainer}>
                {blog.featured && (
                  <View style={styles.featuredBadge}>
                    <LinearGradient
                      colors={['#FFD700', '#FFA500']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.featuredBadgeGradient}
                    >
                      <Ionicons name="star" size={14} color="#fff" />
                      <Text style={styles.featuredText}>Featured</Text>
                    </LinearGradient>
                  </View>
                )}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{blog.category}</Text>
                </View>
              </View>
              <Text style={styles.title}>{blog.title}</Text>
              <Text style={styles.excerpt}>{blog.excerpt}</Text>
            </View>
          </View>
        </View>

        {/* Meta Information */}
        <View style={styles.metaSection}>
          <View style={styles.metaCard}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <LinearGradient
                  colors={categoryColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.authorAvatarGradient}
                >
                  <Text style={styles.authorInitial}>
                    {blog.author.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{blog.author}</Text>
                <Text style={styles.authorType}>
                  {blog.authorType.charAt(0).toUpperCase() + blog.authorType.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.metaStats}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                </View>
                <Text style={styles.statText}>{formatDate(blog.publishedAt || blog.createdAt)}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                </View>
                <Text style={styles.statText}>{blog.readTime}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="eye-outline" size={16} color={colors.primary} />
                </View>
                <Text style={styles.statText}>{blog.views || 0} views</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <View style={styles.contentCard}>
            <Text style={styles.content}>{blog.content}</Text>
          </View>
        </View>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <View style={styles.tagsCard}>
              <View style={styles.tagsHeader}>
                <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
                <Text style={styles.tagsTitle}>Tags</Text>
              </View>
              <View style={styles.tagsContainer}>
                {blog.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Ionicons name="newspaper" size={32} color={colors.primary} />
            <Text style={styles.ctaTitle}>Enjoyed this article?</Text>
            <Text style={styles.ctaSubtitle}>
              Discover more insightful articles and career tips
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Blogs')}
            >
              <Text style={styles.ctaButtonText}>Read More Articles</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isPhone ? spacing.md : spacing.lg,
    paddingVertical: spacing.md + spacing.xs,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.sm,
    ...(isWeb && {
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }),
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  headerTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    padding: spacing.xs,
  },
  iconButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  editButtonContainer: {
    backgroundColor: colors.primaryLight,
  },
  deleteButtonContainer: {
    backgroundColor: '#FFE5E5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroWrapper: {
    marginHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : spacing.lg),
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroSection: {
    padding: isPhone ? spacing.lg : spacing.xl,
    minHeight: isPhone ? 280 : 320,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
  },
  heroContent: {
    zIndex: 2,
    position: 'relative',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
  },
  featuredBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    ...shadows.sm,
  },
  featuredText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  categoryText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    fontSize: isPhone ? 24 : (isTablet ? 32 : 36),
    lineHeight: isPhone ? 30 : (isTablet ? 38 : 44),
    fontWeight: '800',
  },
  excerpt: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 26,
    fontSize: isPhone ? 15 : 16,
  },
  metaSection: {
    paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
    paddingTop: 0,
    paddingBottom: spacing.lg,
  },
  metaCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: -spacing.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  authorAvatar: {
    marginRight: spacing.md,
    ...shadows.sm,
  },
  authorAvatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    ...typography.h3,
    color: '#fff',
    fontWeight: '700',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  authorType: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 13,
  },
  metaStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  contentSection: {
    paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
    paddingVertical: spacing.lg,
  },
  contentCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: isPhone ? spacing.lg : spacing.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  content: {
    ...typography.body1,
    color: colors.text,
    lineHeight: 28,
    fontSize: isPhone ? 15 : 16,
  },
  tagsSection: {
    paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
    paddingBottom: spacing.lg,
  },
  tagsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tagsTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.xs,
  },
  tagText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  ctaSection: {
    paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
    paddingBottom: spacing.xl,
  },
  ctaCard: {
    padding: isPhone ? spacing.xl : spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ctaTitle: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: isPhone ? 20 : 24,
  },
  ctaSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    fontSize: isPhone ? 14 : 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  ctaButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '700',
    fontSize: isPhone ? 14 : 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default BlogDetailScreen;

