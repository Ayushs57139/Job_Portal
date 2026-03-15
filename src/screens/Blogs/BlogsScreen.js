import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') return Platform;
  } catch (e) {}
  return { OS: 'android' };
};
const isWeb = getPlatform().OS === 'web';

const CATEGORY_COLORS = {
  'Career Tips': '#F59E0B',
  'Interview Prep': '#10B981',
  'Workplace Trends': '#8B5CF6',
  'Resume Writing': '#3B82F6',
  'Job Search': '#EF4444',
  'Industry News': '#6366F1',
  'Salary Negotiation': '#EC4899',
  'Networking': '#0EA5E9',
};

const BlogsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);
  const [pagination, setPagination] = useState(null);

  const categories = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'Career Tips', label: 'Career Tips', icon: 'bulb-outline' },
    { id: 'Interview Prep', label: 'Interview', icon: 'people-outline' },
    { id: 'Workplace Trends', label: 'Trends', icon: 'trending-up-outline' },
    { id: 'Resume Writing', label: 'Resume', icon: 'document-text-outline' },
    { id: 'Job Search', label: 'Job Search', icon: 'search-outline' },
    { id: 'Industry News', label: 'News', icon: 'newspaper-outline' },
  ];

  useEffect(() => {
    loadUser();
    loadBlogs();
    const interval = setInterval(loadBlogs, 30000);
    return () => clearInterval(interval);
  }, [selectedCategory, searchQuery]);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUserFromStorage();
      setUser(userData);
    } catch (error) {}
  };

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const params = { page: 1, limit: 20, sortBy: 'publishedAt', sortOrder: 'desc' };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      const response = await api.getBlogs(params);
      if (response.success) {
        setBlogs(response.blogs);
        setPagination(response.pagination);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load blogs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadBlogs(); };

  const handleDeleteBlog = async (blogId) => {
    Alert.alert('Delete Blog', 'Are you sure you want to delete this blog?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const response = await api.request(`/blogs/${blogId}`, { method: 'DELETE' });
            if (response.success) { Alert.alert('Success', 'Blog deleted successfully'); loadBlogs(); }
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete blog');
          }
        },
      },
    ]);
  };

  const canCreateBlog = () => user && ['admin', 'superadmin', 'company', 'consultancy'].includes(user.userType);
  const canEditBlog = (blog) => {
    if (!user) return false;
    return user.userType === 'admin' || user.userType === 'superadmin' || blog.authorId === user._id;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || colors.primary;

  const navigateToBlog = (blog) => {
    const params = blog.slug ? { slug: blog.slug } : { blogId: blog._id };
    navigation.navigate('BlogDetail', params);
  };

  const renderBlogCard = (blog, index) => {
    const catColor = getCategoryColor(blog.category);
    const canEdit = canEditBlog(blog);

    return (
      <TouchableOpacity
        key={blog._id}
        style={styles.blogCard}
        onPress={() => navigateToBlog(blog)}
        activeOpacity={0.85}
      >
        {/* Color strip */}
        <View style={[styles.cardStrip, { backgroundColor: catColor + '15' }]}>
          <View style={[styles.cardStripIcon, { backgroundColor: catColor + '20', borderColor: catColor + '30' }]}>
            <Ionicons name="newspaper-outline" size={20} color={catColor} />
          </View>
          <View style={styles.cardStripRight}>
            {blog.featured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
            <View style={[styles.catBadge, { backgroundColor: catColor }]}>
              <Text style={styles.catBadgeText}>{blog.category || 'Article'}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.blogTitle} numberOfLines={2}>{blog.title}</Text>
          {blog.excerpt ? (
            <Text style={styles.blogExcerpt} numberOfLines={2}>{blog.excerpt}</Text>
          ) : null}

          {blog.tags && blog.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {blog.tags.slice(0, 3).map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.cardMeta}>
            <View style={styles.metaLeft}>
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={12} color="#94A3B8" />
                <Text style={styles.metaText}>{blog.author || 'Admin'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color="#94A3B8" />
                <Text style={styles.metaText}>{blog.readTime || '5 min'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="eye-outline" size={12} color="#94A3B8" />
                <Text style={styles.metaText}>{blog.views || 0}</Text>
              </View>
            </View>
            <Text style={styles.dateText}>{formatDate(blog.publishedAt || blog.createdAt)}</Text>
          </View>

          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.readMoreBtn}
              onPress={(e) => { if (e && e.stopPropagation) e.stopPropagation(); navigateToBlog(blog); }}
            >
              <Text style={styles.readMoreText}>Read More</Text>
              <Ionicons name="arrow-forward" size={12} color={colors.primary} />
            </TouchableOpacity>
            {canEdit && (
              <View style={styles.actionBtns}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={(e) => { e.stopPropagation(); navigation.navigate('CreateBlog', { blog }); }}
                >
                  <Ionicons name="create-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={(e) => { e.stopPropagation(); handleDeleteBlog(blog._id); }}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Blogs & Articles</Text>
          <Text style={styles.heroSubtitle}>Discover career insights, tips, and industry trends</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{pagination?.totalBlogs || blogs.length}</Text>
              <Text style={styles.heroStatLabel}>Articles</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{blogs.filter(b => b.featured).length}</Text>
              <Text style={styles.heroStatLabel}>Featured</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{categories.length - 1}</Text>
              <Text style={styles.heroStatLabel}>Categories</Text>
            </View>
          </View>
        </View>

        {/* Search + Create */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search blogs, topics..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94A3B8"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
            {canCreateBlog() && (
              <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateBlog')}>
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.createBtnText}>Write Blog</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          style={styles.categoriesScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, isActive && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons name={cat.icon} size={14} color={isActive ? '#FFF' : '#64748B'} />
                <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results */}
        <View style={styles.resultsSection}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading blogs...</Text>
            </View>
          ) : blogs.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="document-text-outline" size={48} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No blogs found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try a different search term' : 'Be the first to write a blog!'}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>{pagination?.totalBlogs || blogs.length} {blogs.length === 1 ? 'Blog' : 'Blogs'} Found</Text>
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  hero: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#0F172A', marginBottom: 6, textAlign: 'center' },
  heroSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 20, textAlign: 'center' },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  heroStatItem: { alignItems: 'center', paddingHorizontal: 20 },
  heroStatValue: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  heroStatLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  heroStatDivider: { width: 1, height: 32, backgroundColor: '#C7D2FE' },

  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 10,
  },
  createBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },

  categoriesScroll: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  categoriesContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  catChipTextActive: { color: '#FFF', fontWeight: '600' },

  resultsSection: {
    padding: 16,
    maxWidth: isWeb ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionAccent: { width: 4, height: 20, backgroundColor: colors.primary, borderRadius: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },

  loadingBox: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIconBox: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#64748B' },

  blogsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: isWeb ? 'flex-start' : 'center',
  },

  blogCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    width: isWeb ? 'calc(50% - 7px)' : '100%',
    ...(isWeb && { boxShadow: '0 1px 4px rgba(15,23,42,0.06)', minWidth: 300 }),
  },
  cardStrip: {
    height: 72, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 14,
  },
  cardStripIcon: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  cardStripRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featuredBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  featuredText: { fontSize: 10, fontWeight: '700', color: '#92400E' },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  catBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },

  cardContent: { padding: 14 },
  blogTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', lineHeight: 22, marginBottom: 6 },
  blogExcerpt: { fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 10 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 11, color: '#64748B' },

  cardMeta: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', marginBottom: 10,
  },
  metaLeft: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#94A3B8' },
  dateText: { fontSize: 11, color: '#94A3B8' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  readMoreText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  actionBtns: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
});

export default BlogsScreen;
