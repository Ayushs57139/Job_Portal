import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import { useResponsive } from '../../utils/responsive';

const DRAFTS_INDEX_KEY = 'jobDrafts:index';

const EmployerDraftJobsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const { isMobile } = responsive;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDrafts = async () => {
    try {
      const indexJson = await AsyncStorage.getItem(DRAFTS_INDEX_KEY);
      const index = indexJson ? JSON.parse(indexJson) : [];
      const records = [];
      for (const id of index) {
        const raw = await AsyncStorage.getItem(`jobDrafts:${id}`);
        if (raw) {
          const payload = JSON.parse(raw);
          records.push({ id, ...payload });
        }
      }
      // Sort by updatedAt desc
      records.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setDrafts(records);
    } catch (e) {
      console.error('Error loading drafts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadDrafts);
    loadDrafts();
    return unsubscribe;
  }, [navigation]);

  const handleResume = (draft) => {
    navigation.navigate('EmployerPostJob', { draftId: draft.id });
  };

  const handleDelete = async (draftId) => {
    try {
      const indexJson = await AsyncStorage.getItem(DRAFTS_INDEX_KEY);
      const index = indexJson ? JSON.parse(indexJson) : [];
      const nextIndex = index.filter((id) => id !== draftId);
      await AsyncStorage.setItem(DRAFTS_INDEX_KEY, JSON.stringify(nextIndex));
      await AsyncStorage.removeItem(`jobDrafts:${draftId}`);
      loadDrafts();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete draft');
    }
  };

  const renderItem = ({ item }) => {
    const title = item?.formData?.jobTitle?.label || item?.formData?.companyName || 'Untitled Draft';
    const updated = item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '';
    return (
      <View style={styles.draftCard}>
        <View style={styles.draftMeta}>
          <Text style={styles.draftTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.draftUpdated}>Last saved: {updated}</Text>
        </View>
        <View style={styles.draftActions}>
          <TouchableOpacity style={styles.resumeButton} onPress={() => handleResume(item)}>
            <Ionicons name="play" size={16} color={colors.textWhite} />
            <Text style={styles.resumeText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!isMobile && (
        <View style={styles.sidebarWrapper}>
          <EmployerSidebar permanent navigation={navigation} role="company" activeKey="draftJobs" />
        </View>
      )}
      {isMobile && (
        <EmployerSidebar 
          visible={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          navigation={navigation} 
          role="company" 
          activeKey="draftJobs" 
        />
      )}
      {isMobile && (
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSidebarOpen(true)}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <View style={[styles.contentWrapper, isMobile && styles.contentWrapperMobile]}>
        <View style={[styles.headerBar, isMobile && styles.headerBarMobile]}>
          <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>Draft Jobs</Text>
          <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>Resume your left-over job postings</Text>
        </View>
        <FlatList
          data={drafts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={!loading && (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No drafts found</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F6FA' },
  sidebarWrapper: { width: 280 },
  menuButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  contentWrapper: { flex: 1, padding: spacing.md },
  contentWrapperMobile: {
    padding: spacing.sm,
    paddingTop: spacing.xl + 40,
  },
  headerBar: {
    backgroundColor: '#FFF',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: spacing.lg,
  },
  headerBarMobile: {
    padding: spacing.md,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 4 },
  headerTitleMobile: { fontSize: 18 },
  headerSubtitle: { color: '#666', fontSize: 14 },
  headerSubtitleMobile: { fontSize: 12 },
  listContent: { paddingBottom: spacing.xxl },
  draftCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  draftMeta: { flex: 1, paddingRight: spacing.md },
  draftTitle: { ...typography.body1, fontWeight: '700', color: colors.text },
  draftUpdated: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  draftActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resumeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: borderRadius.sm },
  resumeText: { ...typography.caption, color: colors.textWhite, fontWeight: '700' },
  deleteButton: { padding: 8, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  emptyBox: { alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.body1, color: colors.textSecondary, marginTop: spacing.sm },
});

export default EmployerDraftJobsScreen;


