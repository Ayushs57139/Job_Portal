import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../styles/theme';
import Header from '../../components/Header';
import JobCard from '../../components/JobCard';
import api from '../../config/api';

const SavedJobsScreen = ({ navigation }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      // Add API call to fetch saved jobs
      // const response = await api.getSavedJobs();
      // setSavedJobs(response.jobs || []);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.messageText}>Loading...</Text>
        ) : savedJobs.length > 0 ? (
          savedJobs.map((job) => <JobCard key={job._id} job={job} />)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No Saved Jobs</Text>
            <Text style={styles.emptyText}>
              Start saving jobs to view them here
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Jobs')}
            >
              <Text style={styles.browseButtonText}>Browse Jobs</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  messageText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  browseButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
});

export default SavedJobsScreen;

