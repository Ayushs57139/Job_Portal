import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

const TABS = [
  { id: 'all', label: 'All Jobs' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

const EmployerJobsScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(route?.params?.tab || 'all');
  const [jobs, setJobs] = useState([]);

  const loadJobs = async (tab = activeTab) => {
    try {
      if (!refreshing) setLoading(true);
      const params = {};
      if (tab !== 'all') params.status = tab;
      const res = await api.getMyJobs(params);
      setJobs(res.jobs || []);
    } catch (e) {
      console.error('Error loading employer jobs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs('all');
  }, []);

  useEffect(() => {
    loadJobs(activeTab);
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs(activeTab);
  };

  const toggleStatus = async (job) => {
    const next = job.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateJob(job._id, { status: next });
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: next } : j));
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const JobRow = ({ job }) => (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
        <Text style={styles.sub} numberOfLines={1}>{job.company?.name} • {job.location?.city}, {job.location?.state}</Text>
        <Text style={styles.meta}>Posted {api.formatIndianDate(job.createdAt)} • Applications {job.applications?.length || 0}</Text>
      </View>
      <View style={styles.rowActions}>
        <View style={[styles.badge, job.status === 'active' ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{job.status?.toUpperCase() || 'UNKNOWN'}</Text>
        </View>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('JobDetails', { jobId: job._id })}>
          <Ionicons name="eye" size={16} color={colors.text} />
          <Text style={styles.secondaryBtnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => toggleStatus(job)}>
          <Ionicons name={job.status === 'active' ? 'pause' : 'play'} size={16} color={colors.textWhite} />
          <Text style={styles.primaryBtnText}>{job.status === 'active' ? 'Deactivate' : 'Activate'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header showBack title="Jobs Management" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading jobs…</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={56} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptySub}>Post your first job to get started.</Text>
          </View>
        ) : (
          <View style={styles.table}>
            {jobs.map(job => (
              <JobRow key={job._id} job={job} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  tabActive: { backgroundColor: '#4A6CF7', borderColor: '#4A6CF7' },
  tabText: { ...typography.body2, color: colors.text },
  tabTextActive: { color: colors.textWhite, fontWeight: '700' },
  loadingWrap: { alignItems: 'center', paddingVertical: spacing.xl },
  loadingText: { ...typography.body1, color: colors.textSecondary, marginTop: spacing.sm },
  empty: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyTitle: { ...typography.h5, color: colors.textSecondary, marginTop: spacing.sm },
  emptySub: { ...typography.body2, color: colors.textLight, marginTop: 2 },
  table: { gap: spacing.sm },
  row: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  rowMain: { gap: 2, marginBottom: spacing.sm },
  title: { ...typography.body1, fontWeight: '700', color: colors.text },
  sub: { ...typography.body2, color: colors.textSecondary },
  meta: { ...typography.caption, color: colors.textLight },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  badgeActive: { backgroundColor: 'rgba(16,185,129,0.15)' },
  badgeInactive: { backgroundColor: 'rgba(107,114,128,0.15)' },
  badgeText: { ...typography.caption, color: colors.text },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  secondaryBtnText: { ...typography.caption, color: colors.text },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#4A6CF7' },
  primaryBtnText: { ...typography.caption, color: colors.textWhite, fontWeight: '700' },
});

export default EmployerJobsScreen;


