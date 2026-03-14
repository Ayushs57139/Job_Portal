import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../styles/theme';
import Header from '../../components/Header';
import MultiStepJobPostForm from '../../components/MultiStepJobPostForm';
import api from '../../config/api';

const PostJobScreen = ({ navigation }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('currentUser');
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      // Transform MultiStepJobPostForm data to server /api/jobs schema
      const firstOr = (arr) => Array.isArray(arr) && arr.length > 0 ? (arr[0].label || arr[0]) : '';
      const labels = (arr) => Array.isArray(arr) ? arr.map(v => v.label || v).filter(Boolean) : [];
      const getValue = (field) => field?.value || field?.label || field || '';
      const getStringValue = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field.trim();
        return (field.value || field.label || field || '').toString().trim();
      };

      // Map form values to server enum values
      const mapEmploymentType = (value) => {
        const map = {
          'permanent': 'Permanent',
          'temporary': 'Temporary/Contract Job',
          'internship': 'Internship',
          'apprenticeship': 'Apprenticeship',
          'naps': 'NAPS',
          'freelance': 'Freelance',
          'trainee': 'Trainee',
          'fresher': 'Fresher'
        };
        const val = (value?.value || value?.label || value || '').toLowerCase();
        return map[val] || 'Permanent';
      };

      const mapJobType = (value) => {
        const map = {
          'full_time': 'Full Time',
          'part_time': 'Part Time',
          'any': 'Any'
        };
        const val = (value?.value || value?.label || value || '').toLowerCase().replace(/\s+/g, '_');
        return map[val] || 'Full Time';
      };

      const mapJobModeType = (value) => {
        const map = {
          'work_from_home': 'Work From Home',
          'work_from_office': 'Work From Office',
          'work_from_field': 'Work From Field',
          'hybrid': 'Hybrid',
          'remote': 'Remote'
        };
        const val = (value?.value || value?.label || value || '').toLowerCase().replace(/\s+/g, '_');
        return map[val] || 'Work From Office';
      };

      const mapJobShiftType = (value) => {
        const map = {
          'day_shift': 'Day Shift',
          'night_shift': 'Night Shift',
          'rotational_shift': 'Rotational Shift',
          'split_shift': 'Split Shift'
        };
        const val = (value?.value || value?.label || value || '').toLowerCase().replace(/\s+/g, '_');
        return map[val] || 'Day Shift';
      };

      const mapExperienceLevel = (value) => {
        const map = {
          'fresher': 'Fresher',
          'experienced': 'Experienced',
          'internship': 'Internship',
          'apprenticeship': 'Apprenticeship',
          'any': 'Any'
        };
        const val = (value?.value || value?.label || value || '').toLowerCase();
        return map[val] || 'Fresher';
      };

      const mapJobResponseMethod = (value) => {
        const map = {
          'internal': 'Receive Applicants Responses Internally',
          'email': 'Receive Applicants Responses On Email',
          'whatsapp': 'Receive Applicants Responses On WhatsApp',
          'external_url': 'Receive Applicants Responses External Website URL'
        };
        const val = (value?.value || value?.label || value || '').toLowerCase();
        return map[val] || null;
      };

      const mapCommunicationPreference = (value) => {
        const map = {
          'myself': 'Yes To My Self',
          'other_recruiter': 'Yes To Other Recruiter (Enter Name, Number, Email ID)',
          'no_contact': 'No I will Contact Candidates First'
        };
        const val = (value?.value || value?.label || value || '').toLowerCase();
        return map[val] || null;
      };

      // Map total experience values to server enum format
      const mapTotalExperience = (value) => {
        if (!value) return 'Fresher';
        const val = (value?.value || value?.label || value || '').toString().trim();
        
        // Handle common variations
        const map = {
          'fresher': 'Fresher',
          '0': 'Fresher',
          '0m': 'Fresher',
          '0 months': 'Fresher',
          '1m': '1 Month',
          '1 month': '1 Month',
          '2m': '2 Months',
          '2 months': '2 Months',
          '3m': '3 Months',
          '3 months': '3 Months',
          '6m': '6 Months',
          '6 months': '6 Months',
          '9m': '9 Months',
          '9 months': '9 Months',
          '1y': '1 Year',
          '1 year': '1 Year',
          '1.5y': '1.5 Years',
          '1.5 years': '1.5 Years',
          '2y': '2 Years',
          '2 years': '2 Years',
        };
        
        const lowerVal = val.toLowerCase().replace(/\s+/g, ' ');
        if (map[lowerVal]) return map[lowerVal];
        
        // If it already matches the enum format, return as is
        if (val === 'Fresher' || val.startsWith('1 Month') || val.startsWith('2 Months') || 
            val.includes('Years') || val.includes('Year')) {
          return val;
        }
        
        // Default fallback
        return 'Fresher';
      };

      // Map joining period to server enum format
      const mapJoiningPeriod = (value) => {
        if (!value) return undefined;
        const val = (value?.value || value?.label || value || '').toString().trim();
        
        const map = {
          'immediate': 'Immediate Joining',
          'immediate joining': 'Immediate Joining',
          '7_days': '7 Days',
          '7 days': '7 Days',
          '15_days': '15 Days',
          '15 days': '15 Days',
          '30_days': '30 Days',
          '30 days': '30 Days',
          '45_days': '45 Days',
          '45 days': '45 Days',
          '60_days': '60 Days',
          '60 days': '60 Days',
          '90_days': '90 Days',
          '90 days': '90 Days',
          'any': 'Any',
        };
        
        const lowerVal = val.toLowerCase().replace(/_/g, ' ');
        if (map[lowerVal]) return map[lowerVal];
        
        // If it already matches the enum format, return as is
        if (['Immediate Joining', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', 'Any'].includes(val)) {
          return val;
        }
        
        return undefined;
      };

      // Map gender to server enum format
      const mapGender = (value) => {
        if (!value) return null;
        const val = (value?.value || value?.label || value || '').toString().trim();
        
        const map = {
          'male': 'Male',
          'female': 'Female',
          'other': 'Other',
        };
        
        const lowerVal = val.toLowerCase();
        return map[lowerVal] || (['Male', 'Female', 'Other'].includes(val) ? val : null);
      };

      // Map marital status to server enum format
      const mapMaritalStatus = (value) => {
        if (!value) return null;
        const val = (value?.value || value?.label || value || '').toString().trim();
        
        const map = {
          'single': 'Single',
          'married': 'Married',
          'separated': 'Separated',
          'widowed': 'Widowed',
          'divorced': 'Divorced',
          'all types': 'All Types',
          'all': 'All Types',
        };
        
        const lowerVal = val.toLowerCase();
        return map[lowerVal] || (['Single', 'Married', 'Separated', 'Widowed', 'Divorced', 'All Types'].includes(val) ? val : null);
      };

      // Map diversity hiring to server enum format
      const mapDiversityHiring = (value) => {
        if (!value) return null;
        const val = (value?.value || value?.label || value || '').toString().trim();
        
        const map = {
          'man': 'Man',
          'man returning to work': 'Man Returning to work',
          'man_returning': 'Man Returning to work',
          'woman': 'Woman',
          'woman returning to work': 'Woman Returning to work',
          'woman_returning': 'Woman Returning to work',
          'ex-army personal': 'Ex-Army Personal',
          'ex_army': 'Ex-Army Personal',
          'differently-abled': 'Differently-abled',
          'differently_abled': 'Differently-abled',
          'any': 'Any',
        };
        
        const lowerVal = val.toLowerCase().replace(/_/g, ' ');
        return map[lowerVal] || (['Man', 'Man Returning to work', 'Woman', 'Woman Returning to work', 'Ex-Army Personal', 'Differently-abled', 'Any'].includes(val) ? val : null);
      };

      // Map disability status to server enum format
      const mapDisabilityStatus = (value) => {
        if (!value) return null;
        const val = (value?.value || value?.label || value || '').toString().trim();
        
        const map = {
          'have disability': 'Have Disability',
          'have_disability': 'Have Disability',
          "don't have disability": "Don't Have Disability",
          'dont_have_disability': "Don't Have Disability",
          'no disability': "Don't Have Disability",
          'any': 'Any',
        };
        
        const lowerVal = val.toLowerCase().replace(/_/g, ' ');
        return map[lowerVal] || (["Have Disability", "Don't Have Disability", 'Any'].includes(val) ? val : null);
      };

      // Get employer type from form data (first step)
      const employerType = formData.employerType?.value || formData.employerType?.label || formData.employerType || 'company';
      const userType = employerType === 'consultancy' ? 'consultancy' : 'company';

      // Extract HR contact fields
      const hrContactName = getStringValue(formData.contactPersonName);
      const hrContactNumber = getStringValue(formData.contactPersonNumber);
      const hrContactEmail = getStringValue(formData.contactPersonEmail);

      // Validate required HR contact fields for unauthenticated users
      if (!isAuthenticated) {
        if (!hrContactName) {
          throw new Error('HR/Contact Person Name is required');
        }
        if (!hrContactEmail || !hrContactEmail.includes('@')) {
          throw new Error('Valid HR/Contact Person Email is required');
        }
        if (!hrContactNumber) {
          throw new Error('HR/Contact Person Number is required');
        }
      }

      // Check if user is authenticated
      if (!isAuthenticated) {
        // Use post-without-registration endpoint
        const jobDataForRegistration = {
          userType: userType,
          
          // Company info
          company: {
            name: formData.companyName || '',
            type: formData.companyType?.label || formData.companyType?.value || formData.companyType || '',
            totalEmployees: formData.employeeCount?.label || formData.employeeCount?.value || formData.employeeCount || '0-10',
            website: formData.companyWebsite || '',
          },

          // Basic job info
          title: formData.jobTitle?.label || formData.jobTitle || '',
          description: formData.jobDescription || '',

          // Job details - map to server enum values
          jobPostType: 'Sales', // Required field
          employmentType: mapEmploymentType(formData.employmentType),
          jobType: mapJobType(formData.jobType),
          jobModeType: mapJobModeType(formData.jobMode),
          jobShiftType: mapJobShiftType(formData.jobShift),
          skills: Array.isArray(formData.keySkills) && formData.keySkills.length > 0 
            ? labels(formData.keySkills).join(',') 
            : (typeof formData.keySkills === 'string' ? formData.keySkills : ''),
          
          // Location
          location: {
            state: getValue(formData.jobState),
            city: firstOr(formData.jobCity),
            locality: formData.jobLocality || '',
            distanceFromLocation: getValue(formData.distance),
            includeWillingToRelocate: !!formData.includeRelocate,
          },

          // Experience
          experienceLevel: mapExperienceLevel(formData.experienceLevel),
          totalExperience: {
            min: mapTotalExperience(formData.experienceMin),
            max: mapTotalExperience(formData.experienceMax),
          },
          
          // Salary
          salary: {
            min: Number(formData.salaryMin) || 10000,
            max: Number(formData.salaryMax) || 20000,
            hideFromCandidates: !!formData.hideSalary,
          },

          // Vacancy
          numberOfVacancy: Number(formData.numberOfVacancy) || 1,

          // HR Contact - use extracted values
          hrContact: {
            name: hrContactName,
            number: hrContactNumber,
            email: hrContactEmail.toLowerCase(),
            whatsappNumber: getStringValue(formData.contactPersonWhatsapp) || hrContactNumber,
            timing: {
              start: getStringValue(formData.contactTimingStart) || '09:00',
              end: getStringValue(formData.contactTimingEnd) || '18:00',
            },
            days: Array.isArray(formData.contactDays) ? formData.contactDays : (formData.contactDays ? [formData.contactDays] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
          },

          // Additional details - only include non-empty values
          additionalBenefits: labels(formData.additionalBenefits),
          gender: (() => {
            if (Array.isArray(formData.gender)) {
              return labels(formData.gender).map(mapGender).filter(Boolean);
            }
            const mapped = mapGender(formData.gender);
            return mapped ? [mapped] : [];
          })(),
          maritalStatus: (() => {
            if (Array.isArray(formData.maritalStatus)) {
              return labels(formData.maritalStatus).map(mapMaritalStatus).filter(Boolean);
            }
            const mapped = mapMaritalStatus(formData.maritalStatus);
            return mapped ? [mapped] : [];
          })(),
          preferredLanguage: labels(formData.preferredLanguage).filter(Boolean),
          joiningPeriod: mapJoiningPeriod(formData.joiningPeriod),
          diversityHiring: (() => {
            const mapped = mapDiversityHiring(formData.diversityHiring);
            return mapped ? [mapped] : [];
          })(),
          disabilityStatus: (() => {
            const mapped = mapDisabilityStatus(formData.disabilityStatus);
            return mapped ? [mapped] : [];
          })(),
          disabilities: labels(formData.disabilityTypes).filter(Boolean),

          // Walk-in
          includeWalkinDetails: !!formData.includeWalkin,
          walkinStartDate: formData.walkinStartDate || '',
          walkinEndDate: formData.walkinEndDate || '',
          walkinTiming: formData.walkinTiming || '',
          walkinVenueAddress: formData.walkinVenue || '',
          googleMapUrl: formData.walkinGoogleMap || '',
          contactPersonName: formData.walkinContactName || '',
          contactPersonNumber: formData.walkinContactNumber || '',

          // Candidate questions
          questionsForCandidates: Array.isArray(formData.questionsForCandidates) ? formData.questionsForCandidates.filter(Boolean) : [],
          collaborateWithOtherUsers: formData.collaborateWithUsers ? (Array.isArray(formData.collaborateWithUsers) ? formData.collaborateWithUsers : [formData.collaborateWithUsers]) : [],
          jobResponseMethods: (() => {
            const mapped = mapJobResponseMethod(formData.jobResponseMethod);
            return mapped ? [mapped] : [];
          })(),
          communicationPreference: (() => {
            const mapped = mapCommunicationPreference(formData.communicationPreference);
            return mapped ? [mapped] : [];
          })(),

          // Terms agreement
          agreeTerms: 'true',
        };

        console.log('Submitting job data:', JSON.stringify(jobDataForRegistration, null, 2));
        
        const response = await api.createJobWithoutRegistration(jobDataForRegistration);
        
        console.log('Job submission response:', response);
        
        if (response.success || response.job) {
          // If a new user was created and token is provided, save credentials and log them in
          if (response.token && response.user) {
            try {
              // Save token and user data to AsyncStorage
              await AsyncStorage.setItem('token', response.token);
              await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
              await AsyncStorage.setItem('user', JSON.stringify(response.user));
              
              // Update API instance token
              await api.setToken(response.token);
              
              // Determine which dashboard to navigate to based on employerType
              // Check both employerType and userType fields for compatibility
              const employerType = response.user.employerType || response.user.userType || userType;
              const dashboardRoute = employerType === 'consultancy' 
                ? 'ConsultancyDashboard' 
                : 'CompanyDashboard';
              
              console.log('Navigating to dashboard:', dashboardRoute, 'employerType:', employerType);
              
              // Show success message with login credentials prominently
              const loginEmail = response.user.email;
              const loginPassword = response.user.tempPassword || 'Not available';
              const accountType = employerType === 'consultancy' ? 'Consultancy' : 'Company';
              
              // Navigate to dashboard immediately (works on both web and mobile)
              // Use a small delay to ensure state is saved
              setTimeout(() => {
                try {
                  console.log('Attempting navigation to:', dashboardRoute);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: dashboardRoute }],
                  });
                  console.log('Navigation successful');
                } catch (navError) {
                  console.error('Navigation error:', navError);
                  // Fallback: try regular navigate
                  try {
                    console.log('Trying fallback navigation');
                    navigation.navigate(dashboardRoute);
                  } catch (fallbackError) {
                    console.error('Fallback navigation error:', fallbackError);
                    // Last resort: navigate to home
                    navigation.navigate('Home');
                  }
                }
              }, 300);
              
              // Show success message after navigation is initiated
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                // For web, use browser alert (non-blocking)
                setTimeout(() => {
                  const message = `Job posted successfully! Your account has been created.\n\n📧 Login Email: ${loginEmail}\n🔑 Temporary Password: ${loginPassword}\n\n⚠️ IMPORTANT: Please save these credentials!\n\nYou will be redirected to your dashboard.`;
                  window.alert(message);
                }, 100);
              } else {
                // For mobile, use React Native Alert
                setTimeout(() => {
                  Alert.alert(
                    'Account Created Successfully!',
                    `Job posted successfully! Your account has been created.\n\n📧 Login Email: ${loginEmail}\n🔑 Temporary Password: ${loginPassword}\n\n⚠️ IMPORTANT: Please save these credentials!\n\nYou will be redirected to your dashboard.`,
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          // Navigation already initiated above
                        }
                      }
                    ],
                    { cancelable: false }
                  );
                }, 100);
              }
            } catch (storageError) {
              console.error('Error saving credentials:', storageError);
              // Still show success but without auto-login
              Alert.alert(
                'Success',
                `Job posted successfully! Your account has been created.${response.user.tempPassword ? ` Your temporary password is: ${response.user.tempPassword}. Please login to access your dashboard.` : ''}`,
                [
                  { text: 'OK', onPress: () => navigation.navigate('Home') }
                ]
              );
            }
          } else {
            // Existing user or no token - show regular success message
            Alert.alert(
              'Success',
              'Job posted successfully!',
              [
                { text: 'Post Another Job', style: 'cancel' },
                { text: 'View Jobs', onPress: () => navigation.navigate('Jobs') },
                { text: 'Go to Home', onPress: () => navigation.navigate('Home') },
              ]
            );
          }
        } else {
          throw new Error(response.message || 'Job posting failed');
        }
      } else {
        // User is authenticated, use regular job posting endpoint
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
            website: formData.companyWebsite || '',
            industry: ''
          },

          // Job details
          employmentType: getValue(formData.employmentType),
          jobType: getValue(formData.jobType),
          jobModeType: getValue(formData.jobMode),
          jobShiftType: getValue(formData.jobShift),
          skills: labels(formData.keySkills),
          
          // Location
          location: {
            state: getValue(formData.jobState),
            city: firstOr(formData.jobCity),
            locality: formData.jobLocality || '',
            distanceFromLocation: getValue(formData.distance),
            includeWillingToRelocate: !!formData.includeRelocate,
          },

          // Experience
          experienceLevel: getValue(formData.experienceLevel),
          experienceType: getValue(formData.experienceLevel),
          totalExperience: {
            min: getValue(formData.experienceMin) || 'Fresher',
            max: getValue(formData.experienceMax) || 'Fresher',
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

          // HR Contact - use extracted values
          hrContact: {
            name: hrContactName || getStringValue(formData.contactPersonName),
            number: hrContactNumber || getStringValue(formData.contactPersonNumber),
            email: hrContactEmail || getStringValue(formData.contactPersonEmail),
            whatsappNumber: getStringValue(formData.contactPersonWhatsapp) || hrContactNumber || getStringValue(formData.contactPersonNumber),
            timing: {
              start: getStringValue(formData.contactTimingStart) || '',
              end: getStringValue(formData.contactTimingEnd) || '',
            },
            days: Array.isArray(formData.contactDays) ? formData.contactDays : (formData.contactDays ? [formData.contactDays] : []),
          },

          // Additional details
          additionalBenefits: labels(formData.additionalBenefits),
          gender: Array.isArray(formData.gender) ? labels(formData.gender) : (getValue(formData.gender) ? [getValue(formData.gender)] : []),
          maritalStatus: Array.isArray(formData.maritalStatus) ? labels(formData.maritalStatus) : (getValue(formData.maritalStatus) ? [getValue(formData.maritalStatus)] : []),
          industry: labels(formData.industries),
          departmentCategory: labels(formData.departments)[0] || '',
          departmentSubcategory: labels(formData.subDepartments),
          jobRole: labels(formData.jobRoles),

          education: labels(formData.educationLevel),
          course: labels(formData.course),
          specialization: labels(formData.specialization),
          candidateAge: {
            min: getValue(formData.ageMin),
            max: getValue(formData.ageMax),
          },
          preferredLanguage: labels(formData.preferredLanguage),
          joiningPeriod: getValue(formData.joiningPeriod) || 'Immediate Joining',

          diversityHiring: getValue(formData.diversityHiring),
          disabilityStatus: getValue(formData.disabilityStatus),
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

        console.log('Submitting job data (authenticated):', JSON.stringify(jobData, null, 2));
        
        const response = await api.createJob(jobData);
        
        console.log('Job submission response:', response);
        
        if (response.job || response.message) {
          // Show success message - use web alert for immediate feedback on web
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            const confirmed = window.confirm(
              `✅ Job Posted Successfully!\n\nYour job "${jobData.title}" has been posted successfully and is now live on the platform.\n\nClick OK to view jobs.`
            );
            if (confirmed) {
              navigation.navigate('Jobs');
            }
          } else {
            Alert.alert(
              '✅ Job Posted Successfully!',
              `Your job "${jobData.title}" has been posted successfully and is now live on the platform.`,
              [
                { text: 'Post Another Job', style: 'cancel' },
                { text: 'View Jobs', onPress: () => navigation.navigate('Jobs') },
                { text: 'Go to Home', onPress: () => navigation.navigate('Home') },
              ]
            );
          }
        } else {
          throw new Error(response.message || 'Job posting failed');
        }
      }
    } catch (error) {
      console.error('Job submission error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      Alert.alert(
        'Error',
        error.message || 'Failed to post job. Please check all required fields are filled and try again.',
        [{ text: 'OK' }]
      );
      throw error;
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
