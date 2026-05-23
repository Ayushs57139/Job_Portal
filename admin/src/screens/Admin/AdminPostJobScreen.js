import React from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import MultiStepJobPostForm from '../../components/MultiStepJobPostForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminPostJobScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  const handleSubmit = async (formData) => {
    try {
      // Validate required HR contact fields
      if (!formData.contactPersonName || !formData.contactPersonName.trim()) {
        throw new Error('HR/Contact Person Name is required');
      }
      if (!formData.contactPersonNumber || !formData.contactPersonNumber.trim()) {
        throw new Error('HR/Contact Person Number is required');
      }
      if (!formData.contactPersonEmail || !formData.contactPersonEmail.trim()) {
        throw new Error('HR/Contact Person Email is required');
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactPersonEmail.trim())) {
        throw new Error('Please enter a valid email address');
      }

      // Transform MultiStepJobPostForm data to server /api/jobs schema
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
      const mapExp = (v) => { const val = (getVal(v) || '').toString().trim(); return val || 'Fresher'; };
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
        
        // Location
        location: {
          state: getVal(formData.jobState),
          city: firstOr(formData.jobCity),
          locality: formData.jobLocality || '',
          distanceFromLocation: getVal(formData.distance),
          includeWillingToRelocate: !!formData.includeRelocate,
        },

        // Experience
        experienceLevel: mapExpLevel(formData.experienceLevel),
        experienceType: mapExpLevel(formData.experienceLevel),
        totalExperience: {
          min: mapExp(formData.experienceMin),
          max: mapExp(formData.experienceMax),
        },

        // Salary
        salary: {
          min: Number(formData.salaryMin) || 0,
          max: Number(formData.salaryMax) || 0,
          currency: 'INR',
          hideFromCandidates: !!formData.hideSalary,
        },

        // Vacancy
        numberOfVacancy: Number(formData.numberOfVacancy) || 1,

        // HR Contact
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

        // Additional details
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

        // Walk-in
        includeWalkinDetails: !!formData.includeWalkin,
        walkinStartDate: formData.walkinStartDate || '',
        walkinEndDate: formData.walkinEndDate || '',
        walkinTiming: formData.walkinTiming || '',
        walkinVenueAddress: formData.walkinVenue || '',
        googleMapUrl: formData.walkinGoogleMap || '',

        // Candidate questions and collaboration
        candidateQuestions: formData.questionsForCandidates || [],
        collaborateWithOtherUsers: !!formData.collaborateWithUsers,
        collaboratorEmails: formData.collaboratorEmails || '',
      };

      const token = await AsyncStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(jobData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to post job');
      }

      // Show success popup with job details
      // Show immediately for web using browser alert
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // For web, use browser's confirm dialog for immediate feedback
        const confirmed = window.confirm(
          `✅ Job Posted Successfully!\n\nYour job "${jobData.title}" has been posted successfully and is now live on the platform.\n\nClick OK to view all jobs.`
        );
        if (confirmed) {
          navigation.navigate('AdminJobs');
        }
      } else {
        // For mobile, use React Native Alert
        Alert.alert(
          '✅ Job Posted Successfully!',
          `Your job "${jobData.title}" has been posted successfully and is now live on the platform.\n\nYou will be redirected to the Jobs page.`,
          [
            {
              text: 'View Jobs',
              onPress: () => {
                navigation.navigate('AdminJobs');
              },
              style: 'default',
            },
          ],
          { cancelable: false }
        );
      }
      
      // Return success to prevent form from showing error
      return { success: true, data };
    } catch (error) {
      console.error('Error posting job:', error);
      Alert.alert('Error', error.message || 'Failed to post job');
      throw error;
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Job Posting',
      'Are you sure you want to cancel? All entered data will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <AdminLayout title="Post Job" activeScreen="AdminPostJob" onNavigate={handleNavigate} onLogout={handleLogout}>
      <View style={dynamicStyles.container}>
        <MultiStepJobPostForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
        />
      </View>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: { 
    flex: 1,
    padding: isMobile ? 12 : isTablet ? 16 : 20,
  },
});

const styles = StyleSheet.create({});

export default AdminPostJobScreen;

