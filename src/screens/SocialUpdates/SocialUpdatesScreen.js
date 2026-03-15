import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';
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

const SocialUpdatesScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const { width } = responsive;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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

      const response = await api.getSocialUpdates({ page: pageNum, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });

      if (response && response.socialUpdates) {
        if (isRefresh || pageNum === 1) setPosts(response.socialUpdates);
        else setPosts((prev) => [...prev, ...response.socialUpdates]);
        setHasMore(response.pagination && response.pagination.currentPage < response.pagination.totalPages);
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

  const renderHeader = () => (
    <View style={styles.pageHeader}>
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Social Updates</Text>
        <Text style={styles.heroSubtitle}>Connect, share, and stay updated with the community</Text>
      </View>
      <View style={styles.headerActions}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Latest Posts</Text>
        </View>
        {currentUser && (
          <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreatePost')}>
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.createBtnText}>Create Post</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingMoreText}>Loading more posts...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="newspaper-outline" size={48} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptyText}>Be the first to share something with the community!</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading social updates...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUser={currentUser}
            onUpdate={() => loadPosts(1, true)}
            onPress={() => handlePostPress(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[styles.listContent, posts.length === 0 && styles.listContentEmpty]}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748B' },
  list: { flex: 1 },
  listContent: {
    paddingBottom: 32,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  listContentEmpty: { flex: 1 },

  pageHeader: { marginBottom: 8 },

  heroSection: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center' },

  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionAccent: { width: 4, height: 20, backgroundColor: colors.primary, borderRadius: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },

  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  createBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

  loadingMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 10 },
  loadingMoreText: { fontSize: 14, color: '#64748B' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconBox: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center' },
});

export default SocialUpdatesScreen;
