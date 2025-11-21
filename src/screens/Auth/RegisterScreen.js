import React, { useState, useRef } from 'react';
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
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api, { API_URL } from '../../config/api';

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
  const [dateInputFocused, setDateInputFocused] = useState(false);
  const dateInputRef = useRef(null);
  const dateButtonRef = useRef(null);

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

  // Parse date string to Date object
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    // Try different date formats
    const formats = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/, // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/,  // DD/MM/YY or DD-MM-YY or DD.MM.YY
      /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,  // YYYY/MM/DD or YYYY-MM-DD or YYYY.MM.DD
      /(\d{2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,    // YY/MM/YYYY or YY-MM-YYYY or YY.MM.YYYY
    ];
    
    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        let day, month, year;
        if (format.source.includes('\\d{4}') && format.source.indexOf('\\d{4}') === 0) {
          // YYYY/MM/DD format
          year = match[1];
          month = match[2];
          day = match[3];
        } else {
          // DD/MM/YYYY format (most common in India)
          day = match[1];
          month = match[2];
          year = match[3];
        }
        
        // Handle 2-digit years
        if (year.length === 2) {
          year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        }
        
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    return new Date();
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
          file: asset.file || null, // Store the File object if available (web)
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
      
      // Handle file upload differently for web vs mobile
      if (Platform.OS === 'web') {
        // For web, use the File object directly if available, otherwise create one
        if (resumeFile.file instanceof File) {
          formDataToSend.append('resume', resumeFile.file);
        } else if (resumeFile.uri instanceof File) {
          formDataToSend.append('resume', resumeFile.uri);
        } else {
          // Fetch the file and create a File object
          try {
            const fileResponse = await fetch(resumeFile.uri);
            const blob = await fileResponse.blob();
            const file = new File([blob], resumeFile.name, { type: resumeFile.type });
            formDataToSend.append('resume', file);
          } catch (fileError) {
            console.error('Error creating file from URI:', fileError);
            throw new Error('Failed to process resume file');
          }
        }
      } else {
        // For mobile (React Native), use the object format
        formDataToSend.append('resume', {
          uri: resumeFile.uri,
          type: resumeFile.type,
          name: resumeFile.name,
        });
      }

      const response = await fetch(`${API_URL}/resume/parse`, {
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
        if (parsedData.dateOfBirth && !formData.dateOfBirth) {
          try {
            const dobDate = parseDate(parsedData.dateOfBirth);
            updateFormData('dateOfBirth', dobDate);
          } catch (e) {
            console.log('Failed to parse date of birth:', e);
          }
        }
        
        Alert.alert(
          'Resume Parsed',
          'Resume has been parsed successfully. Form fields have been auto-filled.'
        );
      } else {
        console.error('Resume parsing failed:', data);
        Alert.alert(
          'Parsing Failed',
          'Could not parse resume automatically, but the file has been uploaded. Please fill the form manually.'
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
            
            // Handle file upload differently for web vs mobile
            if (Platform.OS === 'web') {
              // For web, use the File object directly if available, otherwise create one
              if (formData.resume.file instanceof File) {
                formDataToSend.append('resume', formData.resume.file);
              } else if (formData.resume.uri instanceof File) {
                formDataToSend.append('resume', formData.resume.uri);
              } else {
                // Fetch the file and create a File object
                const fileResponse = await fetch(formData.resume.uri);
                const blob = await fileResponse.blob();
                const file = new File([blob], formData.resume.name, { type: formData.resume.type });
                formDataToSend.append('resume', file);
              }
            } else {
              // For mobile (React Native), use the object format
              formDataToSend.append('resume', {
                uri: formData.resume.uri,
                type: formData.resume.type,
                name: formData.resume.name,
              });
            }
            
            await fetch(`${API_URL}/users/upload-resume`, {
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

        // Redirect immediately without alert
        navigation.reset({
          index: 0,
          routes: [{ name: 'UserDashboard' }],
        });
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
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="person-add" size={40} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Candidate Registration Form</Text>
          <Text style={styles.headerSubtitle}>Let's Get Started, Tell us about Yourself.</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.formContainer}>
          {/* Upload Resume Section */}
          <View style={styles.uploadContainer}>
            <View style={styles.uploadLabelContainer}>
              <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
              <Text style={styles.label}>Upload Resume (Optional)</Text>
            </View>
            <TouchableOpacity 
              style={[styles.uploadButton, formData.resume && styles.uploadButtonSelected]} 
              onPress={handleResumePick}
              disabled={parsingResume}
              activeOpacity={0.8}
            >
              {parsingResume ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <>
                  <View style={styles.uploadIconContainer}>
                    {formData.resume ? (
                      <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                    ) : (
                      <Ionicons name="document-text-outline" size={48} color={colors.primary} />
                    )}
                  </View>
                  <Text style={styles.uploadButtonText}>
                    {formData.resume 
                      ? formData.resume.name 
                      : 'Choose Resume File'}
                  </Text>
                  {formData.resume && (
                    <Text style={styles.uploadSuccessText}>Resume uploaded successfully!</Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Or Separator */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <View style={styles.separatorTextContainer}>
              <Text style={styles.separatorText}>Or</Text>
            </View>
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
            style={[styles.checkboxContainer, formData.whatsappAvailable && styles.checkboxContainerSelected]}
            onPress={() => updateFormData('whatsappAvailable', !formData.whatsappAvailable)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxIconContainer, formData.whatsappAvailable && styles.checkboxIconContainerSelected]}>
              {formData.whatsappAvailable && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <Ionicons name="logo-whatsapp" size={20} color={formData.whatsappAvailable ? '#25D366' : colors.textSecondary} />
            <Text style={[styles.checkboxLabel, formData.whatsappAvailable && styles.checkboxLabelSelected]}>
              Tick if Number is Available on WhatsApp
            </Text>
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
                <View 
                  ref={dateButtonRef}
                  className="pickerButton" 
                  style={[
                    styles.pickerButton,
                    dateInputFocused && styles.pickerButtonFocused
                  ]} 
                  pointerEvents="box-none"
                >
                  <Ionicons name="calendar-outline" size={22} color={colors.primary} style={{ marginRight: spacing.sm }} />
                  <Text style={styles.pickerText}>
                    {formatDate(formData.dateOfBirth)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} style={{ marginLeft: spacing.sm }} />
                </View>
                <input
                  ref={(ref) => {
                    dateInputRef.current = ref;
                  }}
                  type="date"
                  value={formData.dateOfBirth.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value + 'T00:00:00');
                    if (!isNaN(newDate.getTime())) {
                      updateFormData('dateOfBirth', newDate);
                    }
                  }}
                  onClick={async (e) => {
                    // Try showPicker() method (modern browsers)
                    if (dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
                      try {
                        await dateInputRef.current.showPicker();
                      } catch (error) {
                        // Fallback to focus and click
                        dateInputRef.current.focus();
                        setTimeout(() => {
                          dateInputRef.current?.click();
                        }, 100);
                      }
                    } else {
                      // Focus first, then click after a short delay
                      if (dateInputRef.current) {
                        dateInputRef.current.focus();
                        setTimeout(() => {
                          if (dateInputRef.current) {
                            dateInputRef.current.click();
                          }
                        }, 100);
                      }
                    }
                  }}
                  onFocus={(e) => {
                    setDateInputFocused(true);
                  }}
                  onBlur={(e) => {
                    setDateInputFocused(false);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 10,
                    pointerEvents: 'auto',
                    fontSize: '16px',
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
            style={[styles.checkboxContainer, formData.privacyPolicy && styles.checkboxContainerSelected, errors.privacyPolicy && styles.checkboxContainerError]}
            onPress={() => updateFormData('privacyPolicy', !formData.privacyPolicy)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxIconContainer, formData.privacyPolicy && styles.checkboxIconContainerSelected]}>
              {formData.privacyPolicy && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={[styles.checkboxLabel, formData.privacyPolicy && styles.checkboxLabelSelected]}>
              I agree with the <Text style={styles.privacyLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.privacyPolicy && (
            <Text style={styles.errorText}>{errors.privacyPolicy}</Text>
          )}

          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: spacing.xs }} />
                  <Text style={styles.registerButtonText}>Create Account</Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login here</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.xl + 12,
    alignItems: 'center',
    paddingBottom: spacing.xl + 8,
    paddingTop: spacing.xl + 16,
    backgroundColor: '#FFFFFF',
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#E0E7FF',
  },
  headerTitle: {
    ...typography.h2,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontSize: 28,
  },
  headerSubtitle: {
    ...typography.body1,
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  formContainer: {
    padding: spacing.lg,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl + 4,
    padding: spacing.xl + 4,
    marginHorizontal: spacing.md,
    ...shadows.lg,
    marginTop: -spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  uploadContainer: {
    marginBottom: spacing.xl,
  },
  uploadLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  uploadButton: {
    borderWidth: 2.5,
    borderColor: '#E0E7FF',
    borderStyle: 'dashed',
    borderRadius: borderRadius.xl,
    padding: spacing.xl + 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FF',
    minHeight: 140,
    transition: 'all 0.3s ease',
  },
  uploadButtonSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    borderStyle: 'solid',
  },
  uploadIconContainer: {
    marginBottom: spacing.md,
  },
  uploadButtonText: {
    ...typography.body1,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  uploadSuccessText: {
    ...typography.caption,
    color: '#10B981',
    marginTop: spacing.xs,
    fontWeight: '600',
    fontSize: 12,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    position: 'relative',
  },
  separatorLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E5E7EB',
  },
  separatorTextContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
  },
  separatorText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    transition: 'all 0.2s ease',
  },
  checkboxContainerSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: colors.primary,
  },
  checkboxContainerError: {
    borderColor: colors.error,
  },
  checkboxIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxIconContainerSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    ...typography.body2,
    color: colors.text,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  checkboxLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  privacyLink: {
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  dobContainer: {
    marginBottom: spacing.lg,
  },
  webDatePickerContainer: {
    position: 'relative',
    width: '100%',
    cursor: 'pointer',
    zIndex: 1,
  },
  genderContainer: {
    marginBottom: spacing.lg,
  },
  referralContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body2,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.sm,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.lg,
    padding: spacing.md + 4,
    gap: spacing.sm,
    minHeight: 56,
    ...shadows.sm,
    transition: 'all 0.2s ease',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  pickerButtonFocused: {
    borderColor: colors.primary,
    backgroundColor: '#F9FAFB',
    ...shadows.md,
    ...(Platform.OS === 'web' && {
      boxShadow: `0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 8px rgba(0, 0, 0, 0.15)`,
    }),
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
    borderRadius: borderRadius.xl,
    marginTop: spacing.xl,
    ...shadows.lg,
    overflow: 'hidden',
  },
  registerButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    flexDirection: 'row',
  },
  registerButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  loginText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontSize: 15,
  },
  loginLink: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg + 4,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md + 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  modalOptionText: {
    ...typography.body2,
    color: '#374151',
    fontSize: 15,
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default RegisterScreen;

