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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import api from '../../config/api';

const BlogDetailScreen = ({ route, navigation }) => {
  const { blogId } = route.params;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadBlog();
  }, [blogId]);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await api.get('/api/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadBlog = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/blogs/${blogId}`);
      if (response.data.success) {
        setBlog(response.data.blog);
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      Alert.alert('Error', 'Failed to load blog');
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
              const response = await api.delete(`/api/blogs/${blogId}`);
              if (response.data.success) {
                Alert.alert('Success', 'Blog deleted successfully');
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting blog:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete blog');
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
    const colors = {
      'Career Tips': ['#667eea', '#764ba2'],
      'Interview Prep': ['#f093fb', '#f5576c'],
      'Workplace Trends': ['#4facfe', '#00f2fe'],
      'Resume Writing': ['#43e97b', '#38f9d7'],
      'Job Search': ['#fa709a', '#fee140'],
      'Industry News': ['#30cfd0', '#330867'],
      'Salary Negotiation': ['#a8edea', '#fed6e3'],
      'Networking': ['#ff9a56', '#ff6a88'],
      'Professional Development': ['#ffecd2', '#fcb69f'],
      'Work-Life Balance': ['#a1c4fd', '#c2e9fb'],
    };
    return colors[category] || ['#667eea', '#764ba2'];
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
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Ionicons name="share-social" size={22} color={colors.text} />
          </TouchableOpacity>
          {canEditBlog() && (
            <>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateBlog', { blog })}
                style={styles.iconButton}
              >
                <Ionicons name="create" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
                <Ionicons name="trash" size={22} color={colors.error} />
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
        <LinearGradient
          colors={categoryColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          {blog.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.featuredText}>Featured Article</Text>
            </View>
          )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{blog.category}</Text>
          </View>
          <Text style={styles.title}>{blog.title}</Text>
          <Text style={styles.excerpt}>{blog.excerpt}</Text>
        </LinearGradient>

        {/* Meta Information */}
        <View style={styles.metaSection}>
          <View style={styles.authorInfo}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>
                {blog.author.charAt(0).toUpperCase()}
              </Text>
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
              <Ionicons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{formatDate(blog.publishedAt || blog.createdAt)}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{blog.readTime}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{blog.views} views</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.content}>{blog.content}</Text>
        </View>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {blog.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={categoryColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            <Ionicons name="newspaper" size={32} color="#fff" />
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
          </LinearGradient>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    padding: spacing.xl,
    minHeight: 250,
    justifyContent: 'flex-end',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  featuredText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  categoryText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.h2,
    color: '#fff',
    marginBottom: spacing.md,
  },
  excerpt: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  metaSection: {
    padding: spacing.lg,
    backgroundColor: colors.cardBackground,
    marginTop: -spacing.lg,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  authorInitial: {
    ...typography.h4,
    color: '#fff',
    fontWeight: '700',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    ...typography.h6,
    color: colors.text,
  },
  authorType: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  contentSection: {
    padding: spacing.lg,
  },
  content: {
    ...typography.body1,
    color: colors.text,
    lineHeight: 28,
  },
  tagsSection: {
    padding: spacing.lg,
  },
  tagsTitle: {
    ...typography.h6,
    color: colors.text,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  ctaSection: {
    padding: spacing.lg,
  },
  ctaCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  ctaTitle: {
    ...typography.h4,
    color: '#fff',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  ctaSubtitle: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  ctaButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default BlogDetailScreen;

