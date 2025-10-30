import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';

const DRAFTS_INDEX_KEY = 'jobDrafts:index';

const EmployerDraftJobsScreen = ({ navigation }) => {
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
      <View style={styles.sidebarWrapper}>
        <EmployerSidebar permanent navigation={navigation} role="company" activeKey="draftJobs" />
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Draft Jobs</Text>
          <Text style={styles.headerSubtitle}>Resume your left-over job postings</Text>
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
  sidebarWrapper: { width: 260 },
  contentWrapper: { flex: 1, padding: spacing.md },
  headerBar: {
    backgroundColor: '#FFF',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: spacing.lg,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 4 },
  headerSubtitle: { color: '#666' },
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


