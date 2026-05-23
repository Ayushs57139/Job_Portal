import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import MultiStepJobPostForm from '../../components/MultiStepJobPostForm';
import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useResponsive } from '../../utils/responsive';

const DRAFTS_INDEX_KEY = 'jobDrafts:index';
const EmployerPostJobScreen = ({ navigation, route }) => {
  const responsive = useResponsive();
  const { isMobile, isTabletDevice } = responsive;
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      const getVal = (field) => field?.value || field?.label || field || '';

      // Enum mappers — server requires exact enum strings
      const mapEmploymentType = (v) => {
        const map = { permanent: 'Permanent', temporary: 'Temporary/Contract Job', internship: 'Internship', apprenticeship: 'Apprenticeship', naps: 'NAPS', freelance: 'Freelance', trainee: 'Trainee', fresher: 'Fresher' };
        const k = (getVal(v)).toLowerCase().replace(/[\s/]+/g, '_').replace(/_+/g, '_');
        return map[k] || getVal(v) || 'Permanent';
      };
      const mapJobType = (v) => {
        const map = { full_time: 'Full Time', part_time: 'Part Time', any: 'Any', 'full time': 'Full Time', 'part time': 'Part Time' };
        const k = (getVal(v)).toLowerCase().replace(/\s+/g, '_');
        return map[k] || getVal(v) || 'Full Time';
      };
      const mapJobMode = (v) => {
        const map = { work_from_home: 'Work From Home', work_from_office: 'Work From Office', work_from_field: 'Work From Field', hybrid: 'Hybrid', remote: 'Remote' };
        const k = (getVal(v)).toLowerCase().replace(/\s+/g, '_');
        return map[k] || getVal(v) || 'Work From Office';
      };
      const mapJobShift = (v) => {
        const map = { day_shift: 'Day Shift', night_shift: 'Night Shift', rotational_shift: 'Rotational Shift', split_shift: 'Split Shift' };
        const k = (getVal(v)).toLowerCase().replace(/\s+/g, '_');
        return map[k] || getVal(v) || 'Day Shift';
      };
      const mapExpLevel = (v) => {
        const map = { fresher: 'Fresher', experienced: 'Experienced', internship: 'Internship', apprenticeship: 'Apprenticeship', any: 'Any' };
        return map[(getVal(v)).toLowerCase()] || getVal(v) || 'Fresher';
      };
      const mapExp = (v) => {
        const val = (getVal(v) || '').toString().trim();
        if (!val || val === '') return 'Fresher';
        return val;
      };
      const mapJoining = (v) => {
        const val = getVal(v);
        const valid = ['Immediate Joining', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', 'Any'];
        return valid.includes(val) ? val : 'Immediate Joining';
      };

      const jobData = {
        status: 'active',
        title: formData.jobTitle?.label || formData.jobTitle || '',
        description: formData.jobDescription || '',
        company: {
          name: formData.companyName || '',
          type: formData.companyType?.label || formData.companyType?.value || '',
          totalEmployees: formData.employeeCount?.label || formData.employeeCount?.value || '',
          website: formData.companyWebsite || '',
          industry: ''
        },
        employmentType: mapEmploymentType(formData.employmentType),
        jobType: mapJobType(formData.jobType),
        jobModeType: mapJobMode(formData.jobMode),
        jobShiftType: mapJobShift(formData.jobShift),
        skills: labels(formData.keySkills),
        location: {
          state: getVal(formData.jobState),
          city: firstOr(formData.jobCity),
          locality: formData.jobLocality || '',
          distanceFromLocation: getVal(formData.distance),
          includeWillingToRelocate: !!formData.includeRelocate,
        },
        experienceLevel: mapExpLevel(formData.experienceLevel),
        experienceType: mapExpLevel(formData.experienceLevel),
        totalExperience: {
          min: mapExp(formData.experienceMin) || 'Fresher',
          max: mapExp(formData.experienceMax) || 'Fresher',
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
        gender: Array.isArray(formData.gender) ? labels(formData.gender) : (getVal(formData.gender) ? [getVal(formData.gender)] : []),
        maritalStatus: Array.isArray(formData.maritalStatus) ? labels(formData.maritalStatus) : (getVal(formData.maritalStatus) ? [getVal(formData.maritalStatus)] : []),
        industry: labels(formData.industries),
        departmentCategory: labels(formData.departments)[0] || '',
        departmentSubcategory: labels(formData.subDepartments),
        jobRole: labels(formData.jobRoles),
        education: labels(formData.educationLevel),
        course: labels(formData.course),
        specialization: labels(formData.specialization),
        candidateAge: {
          min: getVal(formData.ageMin),
          max: getVal(formData.ageMax),
        },
        preferredLanguage: labels(formData.preferredLanguage),
        joiningPeriod: mapJoining(formData.joiningPeriod),
        diversityHiring: Array.isArray(formData.diversityHiring) ? labels(formData.diversityHiring) : (getVal(formData.diversityHiring) ? [getVal(formData.diversityHiring)] : []),
        disabilityStatus: Array.isArray(formData.disabilityStatus) ? labels(formData.disabilityStatus) : (getVal(formData.disabilityStatus) ? [getVal(formData.disabilityStatus)] : []),
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

      const response = await api.createJob(jobData);

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

      // Show success message - use web alert for immediate feedback on web
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const confirmed = window.confirm(
          `✅ Job Posted Successfully!\n\nYour job "${jobData.title}" has been posted successfully and is now live on the platform.\n\nClick OK to view your jobs.`
        );
        if (confirmed) {
          navigation.navigate('EmployerJobs');
        }
      } else {
        Alert.alert(
          '✅ Job Posted Successfully!',
          `Your job "${jobData.title}" has been posted successfully and is now live on the platform.`,
          [
            { text: 'Post Another Job', style: 'cancel' },
            { text: 'View My Jobs', onPress: () => navigation.navigate('EmployerJobs') },
          ]
        );
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to post job. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {!isMobile && (
        <View style={[styles.sidebarWrapper, isTabletDevice && styles.sidebarWrapperTablet]}>
          <EmployerSidebar permanent navigation={navigation} role="company" activeKey="postJob" />
        </View>
      )}
      {isMobile && (
        <EmployerSidebar 
          visible={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          navigation={navigation} 
          role="company" 
          activeKey="postJob" 
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
      <ScrollView contentContainerStyle={[styles.contentWrapper, isMobile && styles.contentWrapperMobile, isTabletDevice && styles.contentWrapperTablet]}>
        <View style={[styles.headerBar, isMobile && styles.headerBarMobile, isTabletDevice && styles.headerBarTablet]}>
          <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>Post New Job</Text>
          <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>Fill the details below to publish your job</Text>
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
    width: 280,
  },
  sidebarWrapperTablet: {
    width: 240,
  },
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
  contentWrapper: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  contentWrapperMobile: {
    padding: spacing.sm,
    paddingTop: spacing.xl + 40,
  },
  contentWrapperTablet: {
    padding: spacing.md,
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
  headerBarTablet: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerTitleMobile: {
    fontSize: 18,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  headerSubtitleMobile: {
    fontSize: 12,
  },
  formWrapper: {
    backgroundColor: 'transparent',
  },
});

export default EmployerPostJobScreen;


