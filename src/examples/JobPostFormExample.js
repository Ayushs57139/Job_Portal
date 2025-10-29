/**
 * Job Post Form Usage Examples
 * 
 * This file demonstrates various ways to use the MultiStepJobPostForm component
 * Copy and adapt these examples for your specific use cases
 */

import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import MultiStepJobPostForm from '../components/MultiStepJobPostForm';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// EXAMPLE 1: Basic Usage - Simple Job Post
// ============================================================================
export const BasicJobPostExample = ({ navigation }) => {
  const handleSubmit = async (formData) => {
    try {
      await api.createJob(formData);
      Alert.alert('Success', 'Job posted successfully!');
      navigation.goBack();
    } catch (error) {
      throw new Error('Failed to post job');
    }
  };

  return (
    <View style={styles.container}>
      <MultiStepJobPostForm
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
};

// ============================================================================
// EXAMPLE 2: Edit Existing Job Post
// ============================================================================
export const EditJobExample = ({ navigation, route }) => {
  const { jobId } = route.params;
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const loadJobData = async () => {
    try {
      const job = await api.getJob(jobId);
      
      // Transform API data to form format
      const formData = {
        companyName: job.companyName,
        companyType: { value: job.companyType, label: job.companyTypeLabel },
        jobTitle: job.title,
        keySkills: job.skills?.map(skill => ({ 
          value: skill, 
          label: skill 
        })) || [],
        // ... map other fields
      };
      
      setInitialData(formData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load job data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await api.updateJob(jobId, formData);
      Alert.alert('Success', 'Job updated successfully!');
      navigation.goBack();
    } catch (error) {
      throw new Error('Failed to update job');
    }
  };

  if (loading) {
    return <View><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <MultiStepJobPostForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
};

// ============================================================================
// EXAMPLE 3: Draft Saving - Save Progress Automatically
// ============================================================================
export const DraftSavingExample = ({ navigation }) => {
  const [draftData, setDraftData] = useState({});
  const DRAFT_KEY = 'job_post_draft';

  // Load draft on component mount
  useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem(DRAFT_KEY);
      if (draft) {
        setDraftData(JSON.parse(draft));
        Alert.alert('Draft Found', 'Continue from where you left off?', [
          { text: 'Start Fresh', onPress: clearDraft },
          { text: 'Continue', style: 'cancel' },
        ]);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  const saveDraft = async (data) => {
    try {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
      setDraftData({});
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await api.createJob(formData);
      await clearDraft(); // Clear draft after successful submission
      Alert.alert('Success', 'Job posted successfully!');
      navigation.goBack();
    } catch (error) {
      // Save as draft on error
      await saveDraft(formData);
      throw error;
    }
  };

  const handleCancel = () => {
    Alert.alert('Save Draft', 'Do you want to save your progress?', [
      { 
        text: 'Discard', 
        onPress: async () => {
          await clearDraft();
          navigation.goBack();
        },
        style: 'destructive'
      },
      { 
        text: 'Save Draft', 
        onPress: async () => {
          // Draft is auto-saved, just go back
          navigation.goBack();
        }
      },
      { text: 'Continue Editing', style: 'cancel' },
    ]);
  };

  // Auto-save every time form data changes
  useEffect(() => {
    if (Object.keys(draftData).length > 0) {
      const timeoutId = setTimeout(() => {
        saveDraft(draftData);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [draftData]);

  return (
    <View style={styles.container}>
      <MultiStepJobPostForm
        initialData={draftData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </View>
  );
};

// ============================================================================
// EXAMPLE 4: Job Template - Pre-fill Common Data
// ============================================================================
export const JobTemplateExample = ({ navigation, route }) => {
  const { templateType } = route.params;

  // Define templates for common job types
  const templates = {
    'software-engineer': {
      jobTitle: 'Software Engineer',
      keySkills: [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'react', label: 'React' },
        { value: 'nodejs', label: 'Node.js' },
      ],
      employmentType: { value: 'permanent', label: 'Permanent' },
      jobType: { value: 'full_time', label: 'Full Time' },
      jobMode: { value: 'hybrid', label: 'Hybrid' },
      experienceLevel: { value: 'experienced', label: 'Experienced' },
      experienceMin: { value: '2', label: '2 Years' },
      experienceMax: { value: '5', label: '5 Years' },
    },
    'sales-executive': {
      jobTitle: 'Sales Executive',
      keySkills: [
        { value: 'sales', label: 'Sales' },
        { value: 'communication', label: 'Communication' },
        { value: 'negotiation', label: 'Negotiation' },
      ],
      employmentType: { value: 'permanent', label: 'Permanent' },
      jobType: { value: 'full_time', label: 'Full Time' },
      jobMode: { value: 'work_from_field', label: 'Work From Field' },
    },
    // Add more templates as needed
  };

  const templateData = templates[templateType] || {};

  const handleSubmit = async (formData) => {
    try {
      await api.createJob(formData);
      Alert.alert('Success', 'Job posted successfully!');
      navigation.goBack();
    } catch (error) {
      throw new Error('Failed to post job');
    }
  };

  return (
    <View style={styles.container}>
      <MultiStepJobPostForm
        initialData={templateData}
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
};

// ============================================================================
// EXAMPLE 5: Company Profile Auto-fill
// ============================================================================
export const CompanyProfileExample = ({ navigation }) => {
  const [companyProfile, setCompanyProfile] = useState(null);

  useEffect(() => {
    loadCompanyProfile();
  }, []);

  const loadCompanyProfile = async () => {
    try {
      const profile = await api.getCompanyProfile();
      setCompanyProfile(profile);
    } catch (error) {
      console.error('Failed to load company profile:', error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await api.createJob(formData);
      Alert.alert('Success', 'Job posted successfully!');
      navigation.goBack();
    } catch (error) {
      throw new Error('Failed to post job');
    }
  };

  // Pre-fill company data from profile
  const initialData = companyProfile ? {
    companyName: companyProfile.name,
    companyType: { 
      value: companyProfile.type, 
      label: companyProfile.typeLabel 
    },
    employeeCount: { 
      value: companyProfile.employeeCount, 
      label: companyProfile.employeeCountLabel 
    },
    jobState: companyProfile.state,
    jobCity: [companyProfile.city],
    contactPersonName: companyProfile.hrName,
    contactPersonEmail: companyProfile.hrEmail,
    contactPersonNumber: companyProfile.hrPhone,
  } : {};

  return (
    <View style={styles.container}>
      <MultiStepJobPostForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
};

// ============================================================================
// EXAMPLE 6: Duplicate Job Post
// ============================================================================
export const DuplicateJobExample = ({ navigation, route }) => {
  const { sourceJobId } = route.params;
  const [jobData, setJobData] = useState(null);

  useEffect(() => {
    loadSourceJob();
  }, [sourceJobId]);

  const loadSourceJob = async () => {
    try {
      const job = await api.getJob(sourceJobId);
      
      // Transform and exclude certain fields (like ID, dates)
      const duplicateData = {
        ...job,
        // Clear fields that shouldn't be duplicated
        jobId: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        status: undefined,
      };
      
      setJobData(duplicateData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load job data');
      navigation.goBack();
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await api.createJob(formData);
      Alert.alert('Success', 'Job duplicated and posted successfully!');
      navigation.goBack();
    } catch (error) {
      throw new Error('Failed to duplicate job');
    }
  };

  if (!jobData) {
    return <View><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <MultiStepJobPostForm
        initialData={jobData}
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
};

// ============================================================================
// EXAMPLE 7: Multi-Location Job Post
// ============================================================================
export const MultiLocationJobExample = ({ navigation }) => {
  const handleSubmit = async (formData) => {
    try {
      // Post job for multiple locations
      const cities = formData.jobCity || [];
      
      if (cities.length > 1) {
        Alert.alert(
          'Multiple Locations',
          `This job will be posted in ${cities.length} locations. Continue?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Post',
              onPress: async () => {
                // Create separate job post for each location
                // Or create one job with multiple locations
                await api.createJob(formData);
                Alert.alert('Success', 'Job posted in all locations!');
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        await api.createJob(formData);
        Alert.alert('Success', 'Job posted successfully!');
        navigation.goBack();
      }
    } catch (error) {
      throw new Error('Failed to post job');
    }
  };

  return (
    <View style={styles.container}>
      <MultiStepJobPostForm
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// ============================================================================
// Export all examples
// ============================================================================
export default {
  BasicJobPostExample,
  EditJobExample,
  DraftSavingExample,
  JobTemplateExample,
  CompanyProfileExample,
  DuplicateJobExample,
  MultiLocationJobExample,
};

