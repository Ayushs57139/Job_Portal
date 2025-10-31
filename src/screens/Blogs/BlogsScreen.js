import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const BlogsScreen = ({ navigation }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);
  const [pagination, setPagination] = useState(null);

  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'Career Tips', label: 'Career Tips', icon: 'bulb' },
    { id: 'Interview Prep', label: 'Interview', icon: 'people' },
    { id: 'Workplace Trends', label: 'Trends', icon: 'trending-up' },
    { id: 'Resume Writing', label: 'Resume', icon: 'document-text' },
    { id: 'Job Search', label: 'Job Search', icon: 'search' },
    { id: 'Industry News', label: 'News', icon: 'newspaper' },
  ];

  useEffect(() => {
    loadUser();
    loadBlogs();
  }, [selectedCategory, searchQuery]);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUserFromStorage();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 20,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.getBlogs(params);

      if (response.success) {
        setBlogs(response.blogs);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      Alert.alert('Error', 'Failed to load blogs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBlogs();
  };

  const handleDeleteBlog = async (blogId) => {
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
              const response = await api.request(`/blogs/${blogId}`, {
                method: 'DELETE'
              });
              if (response.success) {
                Alert.alert('Success', 'Blog deleted successfully');
                loadBlogs();
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

  const canCreateBlog = () => {
    if (!user) return false;
    return ['admin', 'superadmin', 'company', 'consultancy'].includes(user.userType);
  };

  const canEditBlog = (blog) => {
    if (!user) return false;
    const isAdmin = user.userType === 'admin' || user.userType === 'superadmin';
    const isOwner = blog.authorId === user._id;
    return isAdmin || isOwner;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

  const renderBlogCard = (blog) => {
    const categoryColors = getCategoryColor(blog.category);
    const canEdit = canEditBlog(blog);

    return (
      <TouchableOpacity
        key={blog._id}
        style={styles.blogCard}
        onPress={() => navigation.navigate('BlogDetail', { blogId: blog._id })}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={categoryColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.blogHeader}
        >
          {blog.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{blog.category}</Text>
          </View>
        </LinearGradient>

        <View style={styles.blogContent}>
          <Text style={styles.blogTitle} numberOfLines={2}>
            {blog.title}
          </Text>
          <Text style={styles.blogExcerpt} numberOfLines={3}>
            {blog.excerpt}
          </Text>

          <View style={styles.blogMeta}>
            <View style={styles.metaLeft}>
              <View style={styles.metaItem}>
                <Ionicons name="person-circle" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>{blog.author}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>{blog.readTime}</Text>
              </View>
            </View>
            <View style={styles.metaRight}>
              <View style={styles.metaItem}>
                <Ionicons name="eye" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>{blog.views || 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.blogFooter}>
            <Text style={styles.dateText}>{formatDate(blog.publishedAt || blog.createdAt)}</Text>
            {canEdit && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('CreateBlog', { blog })}
                >
                  <Ionicons name="create" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteBlog(blog._id)}
                >
                  <Ionicons name="trash" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {blog.tags && blog.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {blog.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <Ionicons name="newspaper" size={48} color="#fff" />
          <Text style={styles.heroTitle}>Latest Blogs & Articles</Text>
          <Text style={styles.heroSubtitle}>
            Discover career insights, tips, and industry trends
          </Text>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search blogs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {canCreateBlog() && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateBlog')}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.createButtonText}>Write Blog</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={18}
                color={selectedCategory === category.id ? '#fff' : colors.primary}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Blogs List */}
        <View style={styles.blogsSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading blogs...</Text>
            </View>
          ) : blogs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={colors.textLight} />
              <Text style={styles.emptyText}>No blogs found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Be the first to write a blog!'}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                  {pagination?.totalBlogs || blogs.length} {blogs.length === 1 ? 'Blog' : 'Blogs'} Found
                </Text>
              </View>
              {blogs.map(renderBlogCard)}
            </>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...typography.h2,
    color: '#fff',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    padding: spacing.lg,
    gap: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  createButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  createButtonText: {
    ...typography.button,
    color: '#fff',
    fontWeight: '700',
  },
  categoriesScroll: {
    marginBottom: spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardBackground,
    gap: spacing.xs,
    ...shadows.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  blogsSection: {
    paddingHorizontal: spacing.lg,
  },
  resultsHeader: {
    marginBottom: spacing.md,
  },
  resultsText: {
    ...typography.body1,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  blogCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  blogHeader: {
    height: 120,
    justifyContent: 'space-between',
    padding: spacing.md,
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
  },
  categoryText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  blogContent: {
    padding: spacing.lg,
  },
  blogTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  blogExcerpt: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  metaLeft: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaRight: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  blogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dateText: {
    ...typography.caption,
    color: colors.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
});

export default BlogsScreen;
