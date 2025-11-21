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
      // Transform MultiStepJobPostForm data to server /api/jobs schema
      const firstOr = (arr) => Array.isArray(arr) && arr.length > 0 ? (arr[0].label || arr[0]) : '';
      const labels = (arr) => Array.isArray(arr) ? arr.map(v => v.label || v).filter(Boolean) : [];

      const jobData = {
        // Force active so it shows on main website immediately (server allows overriding)
        status: 'active',

        // Basic job info
        title: formData.jobTitle?.label || formData.jobTitle || '',
        description: formData.jobDescription || '',

        // Company info
        company: {
          name: formData.companyName || '',
          type: formData.companyType?.label || formData.companyType?.value || '',
          totalEmployees: formData.employeeCount?.label || formData.employeeCount?.value || '',
          website: '',
          industry: ''
        },

        // Job details
        employmentType: formData.employmentType?.label || formData.employmentType?.value || '',
        jobType: formData.jobType?.label || formData.jobType?.value || '',
        jobModeType: formData.jobMode?.label || formData.jobMode?.value || '',
        jobShiftType: formData.jobShift?.label || formData.jobShift?.value || '',
        skills: labels(formData.keySkills),
        
        // Location
        location: {
          state: formData.jobState?.label || formData.jobState?.value || '',
          city: firstOr(formData.jobCity),
          locality: formData.jobLocality || '',
          distanceFromLocation: formData.distance?.label || formData.distance?.value || '',
          includeWillingToRelocate: !!formData.includeRelocate,
        },

        // Experience
        experienceLevel: formData.experienceLevel?.label || formData.experienceLevel?.value || '',
        experienceType: formData.experienceLevel?.label || formData.experienceLevel?.value || '',
        totalExperience: {
          min: formData.experienceMin?.label || formData.experienceMin?.value || '',
          max: formData.experienceMax?.label || formData.experienceMax?.value || '',
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

      Alert.alert('Success', 'Job posted successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('AdminJobs'),
        },
      ]);
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

