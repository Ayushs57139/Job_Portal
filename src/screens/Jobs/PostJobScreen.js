import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { colors, spacing } from '../../styles/theme';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../config/api';

const PostJobScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    location: '',
    experienceRequired: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handlePostJob = async () => {
    const newErrors = {};
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.createJob(formData);
      Alert.alert('Success', 'Job posted successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Input
          label="Job Title"
          value={formData.jobTitle}
          onChangeText={(text) => setFormData({ ...formData, jobTitle: text })}
          placeholder="e.g., Software Engineer"
          icon="briefcase-outline"
          error={errors.jobTitle}
        />

        <Input
          label="Company Name"
          value={formData.companyName}
          onChangeText={(text) => setFormData({ ...formData, companyName: text })}
          placeholder="Company name"
          icon="business-outline"
          error={errors.companyName}
        />

        <Input
          label="Location"
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
          placeholder="City, State"
          icon="location-outline"
          error={errors.location}
        />

        <Input
          label="Experience Required"
          value={formData.experienceRequired}
          onChangeText={(text) => setFormData({ ...formData, experienceRequired: text })}
          placeholder="e.g., 2-5 years"
          icon="briefcase-outline"
        />

        <Input
          label="Salary Min"
          value={formData.salaryMin}
          onChangeText={(text) => setFormData({ ...formData, salaryMin: text })}
          placeholder="Minimum salary"
          icon="cash-outline"
          keyboardType="numeric"
        />

        <Input
          label="Salary Max"
          value={formData.salaryMax}
          onChangeText={(text) => setFormData({ ...formData, salaryMax: text })}
          placeholder="Maximum salary"
          icon="cash-outline"
          keyboardType="numeric"
        />

        <Input
          label="Job Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Describe the job role..."
          multiline
          numberOfLines={6}
          error={errors.description}
        />

        <Input
          label="Requirements"
          value={formData.requirements}
          onChangeText={(text) => setFormData({ ...formData, requirements: text })}
          placeholder="List the requirements..."
          multiline
          numberOfLines={4}
        />

        <Button
          title="Post Job"
          onPress={handlePostJob}
          loading={loading}
          style={styles.postButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  postButton: {
    marginTop: spacing.md,
  },
});

export default PostJobScreen;

