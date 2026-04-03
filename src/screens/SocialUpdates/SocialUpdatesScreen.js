import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../styles/theme';
import Header from '../../components/Header';
import PostCard from '../../components/SocialUpdates/PostCard';
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

const CATEGORIES = [
  { id: 'all', label: 'All Posts', icon: 'grid-outline' },
  { id: 'Industry News', label: 'Industry News', icon: 'newspaper-outline' },
  { id: 'Career Tips', label: 'Career Tips', icon: 'bulb-outline' },
  { id: 'Job Opportunities', label: 'Jobs', icon: 'briefcase-outline' },
  { id: 'Company Updates', label: 'Company', icon: 'business-outline' },
];

const TRENDING_TAGS = ['AI & ML', 'Remote Work', 'Career Growth', 'Tech Jobs'];

const SocialUpdatesScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const { width } = responsive;
  const isMobile = width <= 480;
  const isTabletDevice = width > 480 && width <= 834;
  const isDesktopDevice = width > 834;

  const dynamicStyles = useMemo(
    () => getStyles(isMobile, isTabletDevice, isDesktopDevice, width),
    [isMobile, isTabletDevice, isDesktopDevice, width]
  );

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUserData();
    loadPosts();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await api.getCurrentUserFromStorage();
      setCurrentUser(userData);
    } catch (error) {
      setCurrentUser(null);
    }
  };

  const loadPosts = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await api.getSocialUpdates({
        page: pageNum,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (response && response.socialUpdates) {
        if (isRefresh || pageNum === 1) setPosts(response.socialUpdates);
        else setPosts((prev) => [...prev, ...response.socialUpdates]);
        setHasMore(
          response.pagination &&
            response.pagination.currentPage < response.pagination.totalPages
        );
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => loadPosts(1, true);
  const handleLoadMore = () => { if (!loadingMore && hasMore) loadPosts(page + 1); };
  const handlePostPress = (post) => navigation.navigate('PostDetail', { postId: post._id });

  // Filter posts by category (client-side on loaded data)
  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeCategory !== 'all') {
      result = result.filter(
        (p) => p.category === activeCategory || p.tags?.includes(activeCategory)
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.content?.toLowerCase().includes(q) ||
          p.title?.toLowerCase().includes(q) ||
          p.author?.firstName?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, activeCategory, searchQuery]);

  const totalLikes = posts.reduce((s, p) => s + (p.likesCount || p.likes?.length || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.commentsCount || p.comments?.length || 0), 0);

  const renderHeader = () => (
    <View style={dynamicStyles.pageHeader}>
      {/* Hero */}
      <View style={dynamicStyles.heroSection}>
        <Text style={dynamicStyles.heroTitle}>Social Updates</Text>
        <Text style={dynamicStyles.heroSubtitle}>
          Connect, share, and stay updated with the community
        </Text>
        <View style={dynamicStyles.heroStatsRow}>
          <View style={dynamicStyles.heroStatCard}>
            <Text style={dynamicStyles.heroStatValue}>{posts.length}</Text>
            <Text style={dynamicStyles.heroStatLabel}>Total posts</Text>
          </View>
          <View style={dynamicStyles.heroStatCard}>
            <Text style={dynamicStyles.heroStatValue}>{totalLikes}</Text>
            <Text style={dynamicStyles.heroStatLabel}>Total likes</Text>
          </View>
          <View style={dynamicStyles.heroStatCard}>
            <Text style={dynamicStyles.heroStatValue}>{totalComments}</Text>
            <Text style={dynamicStyles.heroStatLabel}>Comments</Text>
          </View>
        </View>
      </View>

      {/* Search + Filter Card */}
      <View style={dynamicStyles.searchSection}>
        {/* Search row */}
        <View style={dynamicStyles.searchRow}>
          <View style={dynamicStyles.searchInputWrapper}>
            <Ionicons name="search-outline" size={isMobile ? 18 : 20} color={colors.textSecondary} />
            <TextInput
              style={dynamicStyles.searchInput}
              placeholder="Search posts, topics, authors..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textLight}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
          {currentUser && (
            <TouchableOpacity
              style={dynamicStyles.createBtn}
              onPress={() => navigation.navigate('CreatePost')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              {!isMobile && <Text style={dynamicStyles.createBtnText}>Create Post</Text>}
            </TouchableOpacity>
          )}
        </View>

        {/* Category quick filters */}
        <View style={dynamicStyles.quickFilters}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[dynamicStyles.quickFilterChip, isActive && dynamicStyles.quickFilterChipActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={isMobile ? 12 : 14}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text style={[dynamicStyles.quickFilterText, isActive && dynamicStyles.quickFilterTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Trending tags */}
        <View style={dynamicStyles.trendingTags}>
          {TRENDING_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={dynamicStyles.trendingTag}
              onPress={() => setSearchQuery(tag)}
            >
              <Ionicons name="trending-up-outline" size={isMobile ? 12 : 14} color={colors.primary} />
              <Text style={dynamicStyles.trendingTagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section header */}
      <View style={dynamicStyles.sectionHeaderRow}>
        <View style={dynamicStyles.sectionHeader}>
          <View style={dynamicStyles.sectionAccent} />
          <Text style={dynamicStyles.sectionTitle}>
            {activeCategory === 'all' ? 'Latest Posts' : activeCategory}
          </Text>
        </View>
        <Text style={dynamicStyles.resultCount}>
          {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={dynamicStyles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={dynamicStyles.loadingMoreText}>Loading more posts...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={dynamicStyles.emptyContainer}>
      <View style={dynamicStyles.emptyIconContainer}>
        <Ionicons name="newspaper-outline" size={isMobile ? 56 : 72} color={colors.primary} />
      </View>
      <Text style={dynamicStyles.emptyText}>No Posts Found</Text>
      <Text style={dynamicStyles.emptySubtext}>
        {searchQuery || activeCategory !== 'all'
          ? 'Try adjusting your filters or search query'
          : 'Be the first to share something with the community!'}
      </Text>
      {(searchQuery || activeCategory !== 'all') && (
        <TouchableOpacity
          style={dynamicStyles.clearButton}
          onPress={() => { setSearchQuery(''); setActiveCategory('all'); }}
        >
          <Ionicons name="refresh-outline" size={18} color="#FFF" />
          <Text style={dynamicStyles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={dynamicStyles.container}>
        <Header />
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading social updates...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <Header />
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={dynamicStyles.postWrapper}>
            <PostCard
              post={item}
              currentUser={currentUser}
              onUpdate={() => loadPosts(1, true)}
              onPress={() => handlePostPress(item)}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={dynamicStyles.listContent}
        style={dynamicStyles.list}
        showsVerticalScrollIndicator={isWeb}
      />
    </View>
  );
};

const getStyles = (isMobile, isTabletDevice, isDesktopDevice, width) => {
  const hPad = isMobile ? 12 : isTabletDevice ? 20 : 32;
  const maxW = isDesktopDevice ? 900 : '100%';

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    loadingText: { marginTop: 12, fontSize: 15, color: '#64748B' },
    list: { flex: 1 },
    listContent: { paddingBottom: 40 },

    pageHeader: { marginBottom: 8 },

    // ── Hero ──────────────────────────────────────────────────────────────────
    heroSection: {
      backgroundColor: '#EEF2FF',
      paddingTop: isMobile ? 28 : 40,
      paddingBottom: isMobile ? 40 : 52,
      paddingHorizontal: hPad,
      alignItems: 'center',
    },
    heroTitle: {
      fontSize: isMobile ? 26 : isTabletDevice ? 32 : 40,
      fontWeight: '700',
      color: '#0F172A',
      textAlign: 'center',
      marginBottom: 6,
    },
    heroSubtitle: {
      fontSize: isMobile ? 14 : 16,
      color: '#64748B',
      textAlign: 'center',
      maxWidth: 600,
      marginBottom: isMobile ? 20 : 28,
    },
    heroStatsRow: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: 12,
      width: '100%',
      maxWidth: 700,
    },
    heroStatCard: {
      flex: 1,
      backgroundColor: '#FFF',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      ...(isWeb ? { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } : { elevation: 1 }),
    },
    heroStatValue: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
    heroStatLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },

    // ── Search card ───────────────────────────────────────────────────────────
    searchSection: {
      backgroundColor: '#FFF',
      marginHorizontal: hPad,
      marginTop: -24,
      borderRadius: 16,
      padding: isMobile ? 14 : 20,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      maxWidth: maxW,
      alignSelf: 'center',
      width: isMobile ? `calc(100% - ${hPad * 2}px)` : '100%',
      ...(isWeb
        ? { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }
        : { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }),
      marginBottom: 20,
    },
    searchRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      marginBottom: 14,
    },
    searchInputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
      borderRadius: 10,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      gap: 8,
      minHeight: isMobile ? 42 : 46,
    },
    searchInput: {
      flex: 1,
      fontSize: isMobile ? 13 : 14,
      color: '#0F172A',
      paddingVertical: 8,
    },
    createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: isMobile ? 12 : 16,
      paddingVertical: isMobile ? 10 : 12,
      borderRadius: 10,
      ...(isWeb ? { boxShadow: '0 2px 6px rgba(79,70,229,0.3)' } : { elevation: 2 }),
    },
    createBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

    quickFilters: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    quickFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      backgroundColor: '#F8FAFC',
    },
    quickFilterChipActive: {
      backgroundColor: '#EEF2FF',
      borderColor: colors.primary,
    },
    quickFilterText: { fontSize: isMobile ? 12 : 13, color: '#64748B', fontWeight: '500' },
    quickFilterTextActive: { color: colors.primary, fontWeight: '600' },

    trendingTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    trendingTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    trendingTagText: { fontSize: 12, color: '#475569', fontWeight: '500' },

    // ── Section header ────────────────────────────────────────────────────────
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: hPad,
      marginBottom: 12,
      maxWidth: maxW,
      alignSelf: 'center',
      width: '100%',
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionAccent: { width: 4, height: 20, backgroundColor: colors.primary, borderRadius: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
    resultCount: { fontSize: 13, color: '#64748B' },

    // ── Post wrapper ──────────────────────────────────────────────────────────
    postWrapper: {
      paddingHorizontal: hPad,
      maxWidth: maxW,
      alignSelf: 'center',
      width: '100%',
      marginBottom: 4,
    },

    // ── Footer / Empty ────────────────────────────────────────────────────────
    loadingMore: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      gap: 10,
    },
    loadingMoreText: { fontSize: 14, color: '#64748B' },

    emptyContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 24,
    },
    emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#EEF2FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyText: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
    emptySubtext: { fontSize: 14, color: '#64748B', textAlign: 'center', maxWidth: 320 },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
      marginTop: 20,
    },
    clearButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  });
};

export default SocialUpdatesScreen;
