import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../config/api';

const REFERRAL_SOURCES = [
  'Freejobwala YouTube Channel',
  'Other YouTube Channel',
  'YouTube Ads',
  'YouTube',
  'TV Ads',
  'Arattai Messenger',
  'WhatsApp',
  'Telegram',
  'LinkedIn',
  'Facebook',
  'Instagram',
  'Grokipedia',
  'Wikipedia',
  'X / Twitter',
  'Google Search',
  'Google Play Store',
  'Internet Searches',
  'Refer By Friend',
  'Refer By Recruiter',
  'Post Shared By Friend',
  'Refer By Job Consultancy',
  'Refer By Another Company',
  'Other Social Media Platform',
];

const GENDERS = ['Male', 'Female', 'Other'];

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: new Date(),
    gender: '',
    whatsappAvailable: false,
    referralSource: '',
    privacyPolicy: false,
    resume: null,
  });
  const [loading, setLoading] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [errors, setErrors] = useState({});
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Format date as "12-Oct-2025"
  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const updateFormData = (key, value) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: null });
  };

  const handleResumePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const resumeFile = {
          uri: asset.uri,
          type: asset.mimeType,
          name: asset.name,
        };
        
        updateFormData('resume', resumeFile);
        
        // Parse resume automatically
        await parseAndFillResume(resumeFile);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const parseAndFillResume = async (resumeFile) => {
    setParsingResume(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('resume', {
        uri: resumeFile.uri,
        type: resumeFile.type,
        name: resumeFile.name,
      });

      const response = await fetch('http://10.0.2.2:5000/api/resume/parse', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success && data.data) {
        const parsedData = data.data;
        
        // Auto-fill form fields if not already filled
        if (parsedData.firstName && !formData.firstName) {
          updateFormData('firstName', parsedData.firstName);
        }
        if (parsedData.lastName && !formData.lastName) {
          updateFormData('lastName', parsedData.lastName);
        }
        if (parsedData.email && !formData.email) {
          updateFormData('email', parsedData.email);
        }
        if (parsedData.phone && !formData.phone) {
          updateFormData('phone', parsedData.phone);
        }
        
        Alert.alert(
          'Resume Parsed',
          'Resume has been parsed successfully. Form fields have been auto-filled.'
        );
      }
    } catch (error) {
      console.error('Error parsing resume:', error);
      Alert.alert(
        'Parsing Failed',
        'Could not parse resume automatically, but the file has been uploaded. Please fill the form manually.'
      );
    } finally {
      setParsingResume(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.dateOfBirth || !(formData.dateOfBirth instanceof Date) || isNaN(formData.dateOfBirth.getTime())) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.privacyPolicy) {
      newErrors.privacyPolicy = 'You must agree to the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formatDate(formData.dateOfBirth),
        gender: formData.gender,
        userType: 'jobseeker',
        referralSource: formData.referralSource,
      };

      if (formData.whatsappAvailable && formData.phone) {
        registrationData.whatsappNumber = formData.phone;
      }

      const response = await api.register(registrationData);

      if (response.token) {
        // If resume is uploaded, upload it separately
        if (formData.resume) {
          try {
            const formDataToSend = new FormData();
            formDataToSend.append('resume', {
              uri: formData.resume.uri,
              type: formData.resume.type,
              name: formData.resume.name,
            });
            
            await fetch(`http://10.0.2.2:5000/api/users/upload-resume`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${response.token}`,
              },
              body: formDataToSend,
            });
          } catch (resumeError) {
            console.error('Resume upload error:', resumeError);
            // Don't fail registration if resume upload fails
          }
        }

        Alert.alert(
          'Success',
          'Registration successful! Redirecting to your dashboard...',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'UserDashboard' }],
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Please check your details and try again'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Candidate Registration Form</Text>
          <Text style={styles.headerSubtitle}>Let's Get Started, Tell us about Yourself.</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          {/* Upload Resume Section */}
          <View style={styles.uploadContainer}>
            <Text style={styles.label}>Upload Resume</Text>
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={handleResumePick}
              disabled={parsingResume}
            >
              {parsingResume ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <Ionicons name="document-text-outline" size={32} color={colors.primary} />
              )}
              <Text style={styles.uploadButtonText}>
                {parsingResume 
                  ? 'Parsing Resume...' 
                  : formData.resume 
                    ? formData.resume.name 
                    : 'Choose Resume File'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Or Separator */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Or</Text>
            <View style={styles.separatorLine} />
          </View>

          <Input
            label="First Name *"
            value={formData.firstName}
            onChangeText={(text) => updateFormData('firstName', text)}
            placeholder=""
            icon="person-outline"
            error={errors.firstName}
          />

          <Input
            label="Last Name *"
            value={formData.lastName}
            onChangeText={(text) => updateFormData('lastName', text)}
            placeholder=""
            icon="person-outline"
            error={errors.lastName}
          />

          <Input
            label="Phone Number *"
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text)}
            placeholder=""
            icon="call-outline"
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => updateFormData('whatsappAvailable', !formData.whatsappAvailable)}
          >
            <Ionicons
              name={formData.whatsappAvailable ? 'checkbox' : 'square-outline'}
              size={20}
              color={formData.whatsappAvailable ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.checkboxLabel}>Tick if Number is Available on WhatsApp</Text>
          </TouchableOpacity>

          <Input
            label="Email ID *"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            placeholder=""
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password *"
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            placeholder=""
            icon="lock-closed-outline"
            secureTextEntry
            error={errors.password}
          />

          <View style={styles.dobContainer}>
            <Text style={styles.label}>DOB *</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.webDatePickerContainer}>
                <View style={styles.pickerButton} pointerEvents="none">
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
                  <Text style={styles.pickerText}>
                    {formatDate(formData.dateOfBirth)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} style={{ marginLeft: spacing.sm }} />
                </View>
                <input
                  type="date"
                  value={formData.dateOfBirth.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value + 'T00:00:00');
                    if (!isNaN(newDate.getTime())) {
                      updateFormData('dateOfBirth', newDate);
                    }
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                />
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <Text style={styles.pickerText}>
                    {formatDate(formData.dateOfBirth)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={formData.dateOfBirth}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }
                      if (selectedDate) {
                        updateFormData('dateOfBirth', selectedDate);
                        if (Platform.OS === 'ios') {
                          setShowDatePicker(false);
                        }
                      } else if (Platform.OS === 'ios') {
                        setShowDatePicker(false);
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}
            {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
          </View>

          <View style={styles.genderContainer}>
            <Text style={styles.label}>Gender *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowGenderModal(true)}
            >
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <Text style={[styles.pickerText, !formData.gender && styles.placeholderText]}>
                {formData.gender || 'Select Gender'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
          </View>

          <View style={styles.referralContainer}>
            <Text style={styles.label}>From Where You Heard About Us</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowReferralModal(true)}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.primary} />
              <Text style={[styles.pickerText, !formData.referralSource && styles.placeholderText]}>
                {formData.referralSource || 'Select Source'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => updateFormData('privacyPolicy', !formData.privacyPolicy)}
          >
            <Ionicons
              name={formData.privacyPolicy ? 'checkbox' : 'square-outline'}
              size={20}
              color={formData.privacyPolicy ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.checkboxLabel}>Tick Agree With Privacy Policy</Text>
          </TouchableOpacity>
          {errors.privacyPolicy && (
            <Text style={styles.errorText}>{errors.privacyPolicy}</Text>
          )}

          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Registering...' : 'Register'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Gender Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={GENDERS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    updateFormData('gender', item);
                    setShowGenderModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.gender === item && styles.modalOptionTextSelected
                  ]}>
                    {item}
                  </Text>
                  {formData.gender === item && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Referral Source Modal */}
      <Modal
        visible={showReferralModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReferralModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>From Where You Heard About Us</Text>
              <TouchableOpacity onPress={() => setShowReferralModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={REFERRAL_SOURCES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    updateFormData('referralSource', item);
                    setShowReferralModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.referralSource === item && styles.modalOptionTextSelected
                  ]}>
                    {item}
                  </Text>
                  {formData.referralSource === item && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textWhite,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body1,
    color: colors.textWhite,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    padding: spacing.lg,
  },
  uploadContainer: {
    marginBottom: spacing.md,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    marginTop: spacing.xs,
  },
  uploadButtonText: {
    ...typography.body2,
    color: colors.text,
    marginTop: spacing.sm,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  checkboxLabel: {
    ...typography.body2,
    color: colors.text,
  },
  dobContainer: {
    marginBottom: spacing.md,
  },
  webDatePickerContainer: {
    position: 'relative',
    width: '100%',
  },
  genderContainer: {
    marginBottom: spacing.md,
  },
  referralContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pickerText: {
    flex: 1,
    ...typography.body2,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textLight,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  gradientButton: {
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  registerButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  loginText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalOptionText: {
    ...typography.body2,
    color: colors.text,
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;

