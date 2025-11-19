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
const isPhone = width <= 480;
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

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

  const renderBlogCard = (blog, index) => {
    const categoryColors = getCategoryColor(blog.category);
    const canEdit = canEditBlog(blog);

    return (
      <TouchableOpacity
        key={blog._id}
        style={[styles.blogCard, { opacity: loading ? 0 : 1 }]}
        onPress={() => {
          try {
            const params = blog.slug 
              ? { slug: blog.slug } 
              : { blogId: blog._id };
            console.log('Navigating to BlogDetail with params:', params);
            navigation.navigate('BlogDetail', params);
          } catch (error) {
            console.error('Navigation error:', error);
          }
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={categoryColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.blogHeader}
        >
          <View style={styles.blogHeaderContent}>
            {blog.featured && (
              <View style={styles.featuredBadge}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featuredBadgeGradient}
                >
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text style={styles.featuredText}>Featured</Text>
                </LinearGradient>
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{blog.category}</Text>
            </View>
          </View>
          <View style={styles.blogHeaderIcon}>
            <Ionicons name="newspaper-outline" size={32} color="rgba(255,255,255,0.3)" />
          </View>
        </LinearGradient>

        <View style={styles.blogContent}>
          <Text style={styles.blogTitle} numberOfLines={2}>
            {blog.title}
          </Text>
          <Text style={styles.blogExcerpt} numberOfLines={3}>
            {blog.excerpt || 'Read this insightful article to learn more...'}
          </Text>

          {blog.tags && blog.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                <View key={tagIndex} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.blogMeta}>
            <View style={styles.metaLeft}>
              <View style={styles.metaItem}>
                <View style={styles.metaIconContainer}>
                  <Ionicons name="person-circle" size={14} color={colors.primary} />
                </View>
                <Text style={styles.metaText}>{blog.author || 'Admin'}</Text>
              </View>
              <View style={styles.metaItem}>
                <View style={styles.metaIconContainer}>
                  <Ionicons name="time-outline" size={14} color={colors.primary} />
                </View>
                <Text style={styles.metaText}>{blog.readTime || '5 min'}</Text>
              </View>
            </View>
            <View style={styles.metaRight}>
              <View style={styles.metaItem}>
                <View style={styles.metaIconContainer}>
                  <Ionicons name="eye-outline" size={14} color={colors.primary} />
                </View>
                <Text style={styles.metaText}>{blog.views || 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.blogFooter}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={12} color={colors.textLight} />
              <Text style={styles.dateText}>
                {formatDate(blog.publishedAt || blog.createdAt)}
              </Text>
            </View>
            <View style={styles.footerActions}>
              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={(e) => {
                  try {
                    if (e && e.stopPropagation) {
                      e.stopPropagation();
                    }
                    const params = blog.slug 
                      ? { slug: blog.slug } 
                      : { blogId: blog._id };
                    console.log('Read More - Navigating to BlogDetail with params:', params);
                    navigation.navigate('BlogDetail', params);
                  } catch (error) {
                    console.error('Read More navigation error:', error);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.readMoreText}>Read More</Text>
                <Ionicons name="arrow-forward" size={12} color={colors.primary} />
              </TouchableOpacity>
              {canEdit && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('CreateBlog', { blog });
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteBlog(blog._id);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
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
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Latest Blogs & Articles</Text>
          <Text style={styles.heroSubtitle}>
            Discover career insights, tips, and industry trends
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatValue}>{pagination?.totalBlogs || blogs.length}</Text>
              <Text style={styles.heroStatLabel}>Total Articles</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatValue}>
                {blogs.filter(blog => blog.featured).length}
              </Text>
              <Text style={styles.heroStatLabel}>Featured</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatValue}>
                {categories.length - 1}
              </Text>
              <Text style={styles.heroStatLabel}>Categories</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <LinearGradient
          colors={['#667EEA', '#764BA2', '#F093FB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.searchContainerGradient}
        >
          <View style={styles.searchContainer}>
            <View style={styles.searchRow}>
              <View style={styles.searchInputWrapper}>
                <View style={styles.searchIconWrapper}>
                  <Ionicons name="search" size={isPhone ? 18 : (isMobile ? 20 : (isTablet ? 22 : 24))} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.searchInput}
                  placeholder={isPhone ? "Search blogs..." : "Search blogs, topics, or keywords..."}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={colors.textLight}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {canCreateBlog() && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate('CreateBlog')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#667EEA', '#764BA2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.createButtonGradient}
                  >
                    <Ionicons name="add-circle" size={22} color="#fff" />
                    <Text style={styles.createButtonText}>Write Blog</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    isActive && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.7}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={['#667EEA', '#764BA2']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.categoryChipGradient}
                    >
                      <Ionicons
                        name={category.icon}
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.categoryChipTextActive}>
                        {category.label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.categoryChipInactive}>
                      <View style={styles.categoryIconContainer}>
                        <Ionicons
                          name={category.icon}
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <Text style={styles.categoryChipText}>
                        {category.label}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

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
                <View style={styles.resultsHeaderContent}>
                  <Ionicons name="library-outline" size={24} color={colors.primary} />
                  <Text style={styles.resultsText}>
                    {pagination?.totalBlogs || blogs.length} {blogs.length === 1 ? 'Blog' : 'Blogs'} Found
                  </Text>
                </View>
              </View>
              <View style={styles.blogsGrid}>
                {blogs.map((blog, index) => renderBlogCard(blog, index))}
              </View>
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
    paddingVertical: isMobile ? spacing.xl : spacing.xxl,
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
    alignItems: 'center',
    ...(isWeb && {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    }),
  },
  heroTitle: {
    fontSize: isMobile ? 26 : (isTablet ? 32 : 42),
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: isMobile ? spacing.md : 0,
  },
  heroSubtitle: {
    fontSize: isWeb ? 18 : 16,
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  heroStatsRow: {
    flexDirection: isPhone ? 'column' : 'row',
    gap: spacing.md,
    width: '100%',
    maxWidth: 900,
    marginTop: spacing.lg,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  heroStatLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  searchContainerGradient: {
    marginHorizontal: isPhone ? spacing.sm : spacing.lg,
    marginTop: -spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    padding: 0,
  },
  searchContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: isPhone ? spacing.md : (isMobile ? spacing.lg : isTablet ? spacing.xl : spacing.xl + spacing.sm),
    gap: isPhone ? spacing.sm : spacing.md,
    maxWidth: isDesktop ? 1400 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  searchRow: {
    flexDirection: isPhone ? 'column' : (isMobile ? 'column' : 'row'),
    gap: isPhone ? spacing.sm : (isMobile ? spacing.md : spacing.lg),
    alignItems: 'stretch',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    gap: 0,
    ...shadows.sm,
    overflow: 'hidden',
  },
  searchIconWrapper: {
    paddingHorizontal: spacing.md + spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
    fontSize: isPhone ? 14 : 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  clearButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
    borderRadius: borderRadius.full,
  },
  createButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
    alignSelf: isPhone ? 'stretch' : 'center',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + spacing.xs,
    gap: spacing.sm,
  },
  createButtonText: {
    ...typography.button,
    color: '#fff',
    fontWeight: '700',
    fontSize: isPhone ? 14 : 16,
  },
  categoriesWrapper: {
    marginVertical: spacing.lg,
    backgroundColor: colors.background,
    paddingVertical: spacing.md + spacing.xs,
  },
  categoriesScroll: {
    marginBottom: 0,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md + spacing.xs,
  },
  categoryChip: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryChipActive: {
    ...shadows.md,
    borderWidth: 0,
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + spacing.xs,
    gap: spacing.sm,
  },
  categoryChipInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + spacing.xs,
    gap: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  categoryChipText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  blogsSection: {
    paddingHorizontal: isWeb ? spacing.xl : spacing.lg,
    ...(isWeb && {
      maxWidth: 1400,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  resultsHeader: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  resultsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultsText: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  blogsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'center',
  },
  blogCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    transform: [{ scale: 1 }],
    width: isPhone ? '100%' : isMobile ? '48%' : isTablet ? '47%' : '46%',
    ...(isWeb && isDesktop && {
      maxWidth: 550,
      minWidth: 480,
    }),
  },
  blogHeader: {
    height: 120,
    padding: spacing.lg,
    position: 'relative',
  },
  blogHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  blogHeaderIcon: {
    position: 'absolute',
    right: -15,
    bottom: -15,
    opacity: 0.2,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
  },
  featuredBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    ...shadows.sm,
  },
  featuredText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '800',
    fontSize: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  categoryText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '800',
    fontSize: 10,
  },
  blogContent: {
    padding: spacing.lg,
  },
  blogTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 26,
  },
  blogExcerpt: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  metaLeft: {
    flexDirection: 'row',
    gap: spacing.lg,
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
  metaIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    fontSize: 11,
  },
  blogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: '500',
    fontSize: 11,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    zIndex: 10,
    ...(isWeb && {
      cursor: 'pointer',
    }),
  },
  readMoreText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 10,
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
    padding: spacing.xxl + spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    margin: spacing.lg,
    ...shadows.md,
  },
  emptyText: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.lg,
    fontWeight: '700',
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default BlogsScreen;
