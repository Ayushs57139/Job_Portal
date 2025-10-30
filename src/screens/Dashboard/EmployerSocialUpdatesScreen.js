import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';

const EmployerSocialUpdatesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);

  const loadMyPosts = async () => {
    try {
      setLoading(true);
      const res = await api.getMySocialUpdates({ limit: 50 });
      setPosts(res.socialUpdates || []);
    } catch (e) {
      console.error('Load social updates error', e);
      Alert.alert('Error', 'Failed to load your social updates');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadMyPosts(); }, []);

  const handleDelete = (id) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.deleteSocialUpdate(id);
          await loadMyPosts();
          Alert.alert('Deleted', 'Post deleted successfully');
        } catch (e) {
          Alert.alert('Error', e.message || 'Failed to delete post');
        }
      } },
    ]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMyPosts();
  };

  const renderPost = (p) => (
    <View key={p._id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.postTitle} numberOfLines={1}>{p.title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.smallBtn, styles.infoBtn]} onPress={()=>navigation.navigate('SocialUpdates') }>
            <Ionicons name="eye-outline" size={16} color={colors.white} /><Text style={styles.smallBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallBtn, styles.dangerBtn]} onPress={()=>handleDelete(p._id)}>
            <Ionicons name="trash-outline" size={16} color={colors.white} /><Text style={styles.smallBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.postExcerpt} numberOfLines={3}>{p.content}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}><Ionicons name="heart-outline" size={16} color={colors.error} /><Text style={styles.metaText}>{p.engagement?.likes || 0} Likes</Text></View>
        <View style={styles.metaItem}><Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.info} /><Text style={styles.metaText}>{p.engagement?.comments || 0} Comments</Text></View>
        <View style={styles.metaItem}><Ionicons name="share-social-outline" size={16} color={colors.primary} /><Text style={styles.metaText}>{p.engagement?.shares || 0} Shares</Text></View>
      </View>
      {p.tags && p.tags.length>0 && (
        <View style={styles.tagsRow}>
          {p.tags.slice(0,4).map((t,i)=>(<View key={i} style={styles.tag}><Text style={styles.tagText}>#{t}</Text></View>))}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading social updates…</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.sidebar}><EmployerSidebar permanent navigation={navigation} role="company" activeKey="social" /></View>
      <View style={styles.content}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Social Updates</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={()=>navigation.navigate('EmployerCreateSocialPost')}>
            <Ionicons name="add-circle-outline" size={18} color={colors.white} />
            <Text style={styles.primaryBtnText}>Create Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />}>
          {posts.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="newspaper-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySub}>Create your first social update for everyone to see</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={()=>navigation.navigate('CreateSocialPost')}>
                <Text style={styles.primaryBtnText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            posts.map(renderPost)
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  sidebar: { width: 280, backgroundColor: colors.sidebarBackground },
  content: { flex: 1 },
  headerBar: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { ...typography.h3, color: colors.text, fontWeight: '700' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  primaryBtnText: { ...typography.button, color: colors.white, fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body1, color: colors.textSecondary, marginTop: spacing.sm },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h5, color: colors.text, fontWeight: '700', marginTop: spacing.md },
  emptySub: { ...typography.body1, color: colors.textSecondary, marginVertical: spacing.sm },
  card: { backgroundColor: colors.cardBackground, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  postTitle: { ...typography.h6, color: colors.text, fontWeight: '700', flex: 1, marginRight: spacing.md },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: 8 },
  smallBtnText: { ...typography.caption, color: colors.white, fontWeight: '600' },
  infoBtn: { backgroundColor: colors.info },
  dangerBtn: { backgroundColor: colors.error },
  postExcerpt: { ...typography.body2, color: colors.textSecondary, marginTop: spacing.xs },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: { backgroundColor: colors.primary + '12', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 12 },
  tagText: { ...typography.caption, color: colors.primary },
});

export default EmployerSocialUpdatesScreen;


