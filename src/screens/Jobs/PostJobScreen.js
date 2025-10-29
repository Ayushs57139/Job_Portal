import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { colors } from '../../styles/theme';
import Header from '../../components/Header';
import MultiStepJobPostForm from '../../components/MultiStepJobPostForm';
import api from '../../config/api';

const PostJobScreen = ({ navigation }) => {
  const handleSubmit = async (formData) => {
    try {
      // Transform form data to match API requirements
      const jobData = {
        // Company Information
        companyName: formData.companyName,
        companyType: formData.companyType?.value,
        employeeCount: formData.employeeCount?.value,
        
        // Job Details
        jobTitle: formData.jobTitle,
        keySkills: formData.keySkills?.map(skill => skill.label) || [],
        employmentType: formData.employmentType?.value,
        jobType: formData.jobType?.value,
        jobMode: formData.jobMode?.value,
        jobShift: formData.jobShift?.value,
        
        // Location
        jobState: formData.jobState?.value,
        jobCity: formData.jobCity?.map(city => city.label) || [],
        jobLocality: formData.jobLocality,
        distance: formData.distance?.value,
        includeRelocate: formData.includeRelocate || false,
        
        // Experience & Salary
        experienceLevel: formData.experienceLevel?.value,
        experienceMin: formData.experienceMin?.value,
        experienceMax: formData.experienceMax?.value,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        hideSalary: formData.hideSalary || false,
        additionalBenefits: formData.additionalBenefits?.map(benefit => benefit.label) || [],
        
        // Candidate Requirements
        gender: formData.gender?.value,
        maritalStatus: formData.maritalStatus?.value,
        employerIndustry: formData.employerIndustry,
        department: formData.department,
        jobRoles: formData.jobRoles?.map(role => role.label) || [],
        
        // Education & Demographics
        educationLevel: formData.educationLevel?.value,
        course: formData.course?.map(c => c.label) || [],
        candidateIndustry: formData.candidateIndustry?.map(ind => ind.label) || [],
        ageMin: formData.ageMin?.value,
        ageMax: formData.ageMax?.value,
        preferredLanguage: formData.preferredLanguage?.map(lang => lang.label) || [],
        joiningPeriod: formData.joiningPeriod?.value,
        
        // Diversity & Accessibility
        diversityHiring: formData.diversityHiring?.value,
        disabilityStatus: formData.disabilityStatus?.value,
        disabilityTypes: formData.disabilityTypes?.map(type => type.label) || [],
        
        // Job Description
        description: formData.jobDescription,
        numberOfVacancy: formData.numberOfVacancy,
        
        // Walk-in Details
        includeWalkin: formData.includeWalkin || false,
        walkinStartDate: formData.walkinStartDate,
        walkinEndDate: formData.walkinEndDate,
        walkinDuration: formData.walkinDuration,
        walkinTiming: formData.walkinTiming,
        walkinVenue: formData.walkinVenue,
        walkinGoogleMap: formData.walkinGoogleMap,
        
        // Contact Information
        jobResponseMethod: formData.jobResponseMethod?.value,
        communicationPreference: formData.communicationPreference?.value,
        contactPersonName: formData.contactPersonName,
        contactPersonNumber: formData.contactPersonNumber,
        contactPersonEmail: formData.contactPersonEmail,
        contactPersonWhatsapp: formData.contactPersonWhatsapp,
        contactTimingStart: formData.contactTimingStart?.value,
        contactTimingEnd: formData.contactTimingEnd?.value,
        contactDays: formData.contactDays || [],
        
        // Additional Details
        questionsForCandidates: formData.questionsForCandidates,
        collaborateWithUsers: formData.collaborateWithUsers || false,
        collaboratorEmails: formData.collaboratorEmails,
        
        // Client Details (For Consultancy)
        aboutClient: formData.aboutClient,
        clientCompanyName: formData.clientCompanyName,
        hideClientName: formData.hideClientName || false,
        hideEmployerDetails: formData.hideEmployerDetails,
      };

      await api.createJob(jobData);
      
      Alert.alert(
        'Success',
        'Job posted successfully!',
        [
          {
            text: 'Post Another Job',
            style: 'cancel',
          },
          {
            text: 'View Jobs',
            onPress: () => navigation.navigate('Jobs'),
          },
        ]
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to post job. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Job Post',
      'Are you sure you want to cancel? All entered data will be lost.',
      [
        {
          text: 'Continue Editing',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          onPress: () => navigation.goBack(),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <MultiStepJobPostForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default PostJobScreen;
