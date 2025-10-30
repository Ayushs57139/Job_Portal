import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import MultiStepJobPostForm from '../../components/MultiStepJobPostForm';
import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFTS_INDEX_KEY = 'jobDrafts:index';
const EmployerPostJobScreen = ({ navigation, route }) => {
  const [draftMeta, setDraftMeta] = useState({ draftId: null, initialData: {}, initialStep: 0 });

  useEffect(() => {
    const init = async () => {
      let draftId = route?.params?.draftId;
      if (!draftId) {
        draftId = `d_${Date.now()}`;
        const indexJson = await AsyncStorage.getItem(DRAFTS_INDEX_KEY);
        const index = indexJson ? JSON.parse(indexJson) : [];
        if (!index.includes(draftId)) {
          index.push(draftId);
          await AsyncStorage.setItem(DRAFTS_INDEX_KEY, JSON.stringify(index));
        }
      } else {
        const raw = await AsyncStorage.getItem(`jobDrafts:${draftId}`);
        if (raw) {
          const payload = JSON.parse(raw);
          setDraftMeta((prev) => ({ ...prev, initialData: payload.formData || {}, initialStep: payload.currentStep || 0 }));
        }
      }
      setDraftMeta((prev) => ({ ...prev, draftId }));
    };
    init();
  }, [route?.params?.draftId]);

  const autosaveKey = useMemo(() => (draftMeta.draftId ? `jobDrafts:${draftMeta.draftId}` : null), [draftMeta.draftId]);
  const handleSubmit = async (formData) => {
    try {
      const firstOr = (arr) => Array.isArray(arr) && arr.length > 0 ? (arr[0].label || arr[0]) : '';
      const labels = (arr) => Array.isArray(arr) ? arr.map(v => v.label || v).filter(Boolean) : [];

      const jobData = {
        status: 'active',
        title: formData.jobTitle?.label || formData.jobTitle || '',
        description: formData.jobDescription || '',
        company: {
          name: formData.companyName || '',
          type: formData.companyType?.label || formData.companyType?.value || '',
          totalEmployees: formData.employeeCount?.label || formData.employeeCount?.value || '',
          website: '',
          industry: ''
        },
        employmentType: formData.employmentType?.label || formData.employmentType?.value || '',
        jobType: formData.jobType?.label || formData.jobType?.value || '',
        jobModeType: formData.jobMode?.label || formData.jobMode?.value || '',
        jobShiftType: formData.jobShift?.label || formData.jobShift?.value || '',
        skills: labels(formData.keySkills),
        location: {
          state: formData.jobState?.label || formData.jobState?.value || '',
          city: firstOr(formData.jobCity),
          locality: formData.jobLocality || '',
          distanceFromLocation: formData.distance?.label || formData.distance?.value || '',
          includeWillingToRelocate: !!formData.includeRelocate,
        },
        experienceLevel: formData.experienceLevel?.label || formData.experienceLevel?.value || '',
        experienceType: formData.experienceLevel?.label || formData.experienceLevel?.value || '',
        totalExperience: {
          min: formData.experienceMin?.label || formData.experienceMin?.value || '',
          max: formData.experienceMax?.label || formData.experienceMax?.value || '',
        },
        salary: {
          min: Number(formData.salaryMin) || 0,
          max: Number(formData.salaryMax) || 0,
          currency: 'INR',
          hideFromCandidates: !!formData.hideSalary,
        },
        numberOfVacancy: Number(formData.numberOfVacancy) || 1,
        hrContact: {
          name: formData.contactPersonName || '',
          number: formData.contactPersonNumber || '',
          email: formData.contactPersonEmail || '',
          whatsappNumber: formData.contactPersonWhatsapp || formData.contactPersonNumber || '',
          timing: {
            start: formData.contactTimingStart || '',
            end: formData.contactTimingEnd || '',
          },
          days: formData.contactDays || [],
        },
        additionalBenefits: labels(formData.additionalBenefits),
        gender: formData.gender?.label || formData.gender?.value || '',
        maritalStatus: formData.maritalStatus?.label || formData.maritalStatus?.value || '',
        industry: labels(formData.industries),
        departmentCategory: labels(formData.departments)[0] || '',
        departmentSubcategory: labels(formData.subDepartments),
        jobRole: labels(formData.jobRoles),
        education: labels(formData.educationLevel),
        course: labels(formData.course),
        specialization: labels(formData.specialization),
        candidateAge: {
          min: formData.ageMin?.label || formData.ageMin?.value || '',
          max: formData.ageMax?.label || formData.ageMax?.value || '',
        },
        preferredLanguage: labels(formData.preferredLanguage),
        joiningPeriod: formData.joiningPeriod?.label || formData.joiningPeriod?.value || '',
        diversityHiring: formData.diversityHiring?.label || formData.diversityHiring?.value || '',
        disabilityStatus: formData.disabilityStatus?.label || formData.disabilityStatus?.value || '',
        disabilities: labels(formData.disabilityTypes),
        includeWalkinDetails: !!formData.includeWalkin,
        walkinStartDate: formData.walkinStartDate || '',
        walkinEndDate: formData.walkinEndDate || '',
        walkinTiming: formData.walkinTiming || '',
        walkinVenueAddress: formData.walkinVenue || '',
        googleMapUrl: formData.walkinGoogleMap || '',
        candidateQuestions: formData.questionsForCandidates || [],
        collaborateWithOtherUsers: !!formData.collaborateWithUsers,
        collaboratorEmails: formData.collaboratorEmails || '',
      };

      await api.createJob(jobData);

      // cleanup draft if exists
      try {
        if (draftMeta.draftId) {
          const indexJson = await AsyncStorage.getItem(DRAFTS_INDEX_KEY);
          const index = indexJson ? JSON.parse(indexJson) : [];
          const nextIndex = index.filter((id) => id !== draftMeta.draftId);
          await AsyncStorage.setItem(DRAFTS_INDEX_KEY, JSON.stringify(nextIndex));
          await AsyncStorage.removeItem(`jobDrafts:${draftMeta.draftId}`);
        }
      } catch (_) {}

      Alert.alert(
        'Success',
        'Job posted successfully!',
        [
          { text: 'Post Another Job', style: 'cancel' },
          { text: 'View My Jobs', onPress: () => navigation.navigate('EmployerJobs') },
        ]
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to post job. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sidebarWrapper}>
        <EmployerSidebar permanent navigation={navigation} role="company" activeKey="postJob" />
      </View>
      <ScrollView contentContainerStyle={styles.contentWrapper}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Post New Job</Text>
          <Text style={styles.headerSubtitle}>Fill the details below to publish your job</Text>
        </View>
        <View style={styles.formWrapper}>
          <MultiStepJobPostForm 
            onSubmit={handleSubmit}
            initialData={draftMeta.initialData}
            initialStep={draftMeta.initialStep}
            enableAutosave={!!autosaveKey}
            autosaveKey={autosaveKey}
          />
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F6FA'
  },
  sidebarWrapper: {
    width: 260,
  },
  contentWrapper: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerBar: {
    backgroundColor: '#FFF',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
  },
  formWrapper: {
    backgroundColor: 'transparent',
  },
});

export default EmployerPostJobScreen;


