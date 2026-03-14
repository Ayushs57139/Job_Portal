import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api, { API_URL } from '../../config/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Platform.OS === 'web' ? Math.min(480, SCREEN_WIDTH * 0.9) : SCREEN_WIDTH * 0.9;

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
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
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
  const [showPassword, setShowPassword] = useState(false);
  const dateInputRef = useRef(null);
  const dateButtonRef = useRef(null);

  // Animate sidebar on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SIDEBAR_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Home');
      }
    });
  };

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
            
            const uploadResponse = await fetch(`${API_URL}/users/upload-resume`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${response.token}`,
                // Don't set Content-Type for FormData - let browser set it with boundary
              },
              body: formDataToSend,
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json().catch(() => ({}));
              throw new Error(errorData.message || 'Failed to upload resume');
            }

            const uploadData = await uploadResponse.json();
            console.log('Resume uploaded successfully:', uploadData);
          } catch (resumeError) {
            console.error('Resume upload error:', resumeError);
            // Don't fail registration if resume upload fails
          }
        }

        // Close sidebar with animation then redirect
        handleClose();
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserDashboard' }],
          });
        }, 300);
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
    <Modal
      visible={true}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          activeOpacity={1} 
          onPress={handleClose}
        />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Register</Text>
          <TouchableOpacity onPress={() => {
            handleClose();
            setTimeout(() => navigation.navigate('Login'), 300);
          }}>
            <Text style={styles.loginLink}>Already have account?</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
              activeOpacity={0.7}
            >
              <View style={styles.pickerIconContainer}>
                <Ionicons name="person-outline" size={22} color="#3B82F6" />
              </View>
              <Text style={[styles.pickerText, !formData.gender && styles.placeholderText]}>
                {formData.gender || 'Select Gender'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
          </View>

          <View style={styles.referralContainer}>
            <Text style={styles.label}>From Where You Heard About Us</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowReferralModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.pickerIconContainer}>
                <Ionicons name="share-social-outline" size={22} color="#3B82F6" />
              </View>
              <Text style={[styles.pickerText, !formData.referralSource && styles.placeholderText]}>
                {formData.referralSource || 'Select Source'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
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

          <TouchableOpacity onPress={() => {
            handleClose();
            setTimeout(() => navigation.navigate('Login'), 300);
          }}>
            <Text style={styles.loginLink}>Already have account?</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Gender Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="person-outline" size={24} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Select Gender</Text>
                  <Text style={styles.modalSubtitle}>Choose your gender</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowGenderModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalOptionsContainer}>
              <FlatList
                data={GENDERS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = formData.gender === item;
                  const getGenderIcon = (gender) => {
                    switch(gender.toLowerCase()) {
                      case 'male': return 'male';
                      case 'female': return 'female';
                      case 'other': return 'person';
                      default: return 'person-outline';
                    }
                  };
                  const getGenderColor = (gender) => {
                    switch(gender.toLowerCase()) {
                      case 'male': return '#3B82F6';
                      case 'female': return '#EC4899';
                      case 'other': return '#8B5CF6';
                      default: return '#6B7280';
                    }
                  };
                  return (
                    <TouchableOpacity
                      style={[
                        styles.modalOption,
                        isSelected && styles.modalOptionSelected
                      ]}
                      onPress={() => {
                        updateFormData('gender', item);
                        setShowGenderModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.modalOptionLeft}>
                        <View style={[
                          styles.modalOptionIconContainer,
                          { backgroundColor: isSelected ? getGenderColor(item) + '15' : '#F9FAFB' }
                        ]}>
                          <Ionicons 
                            name={getGenderIcon(item)} 
                            size={22} 
                            color={isSelected ? getGenderColor(item) : '#6B7280'} 
                          />
                        </View>
                        <Text style={[
                          styles.modalOptionText,
                          isSelected && styles.modalOptionTextSelected
                        ]}>
                          {item}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={[styles.checkmarkContainer, { backgroundColor: getGenderColor(item) }]}>
                          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Referral Source Modal */}
      <Modal
        visible={showReferralModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReferralModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReferralModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="share-social-outline" size={24} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>From Where You Heard About Us</Text>
                  <Text style={styles.modalSubtitle}>Select a referral source</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowReferralModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalOptionsContainer}>
              <FlatList
                data={REFERRAL_SOURCES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = formData.referralSource === item;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.modalOption,
                        isSelected && styles.modalOptionSelected
                      ]}
                      onPress={() => {
                        updateFormData('referralSource', item);
                        setShowReferralModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.modalOptionLeft}>
                        <View style={[
                          styles.modalOptionIconContainer,
                          { backgroundColor: isSelected ? '#3B82F6' + '15' : '#F9FAFB' }
                        ]}>
                          <Ionicons 
                            name="radio-button-on" 
                            size={20} 
                            color={isSelected ? '#3B82F6' : '#9CA3AF'} 
                          />
                        </View>
                        <Text style={[
                          styles.modalOptionText,
                          isSelected && styles.modalOptionTextSelected
                        ]}>
                          {item}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkmarkContainer}>
                          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backdropTouchable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  uploadContainer: {
    marginBottom: 20,
  },
  uploadLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    minHeight: 120,
  },
  uploadButtonSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    borderStyle: 'solid',
  },
  uploadIconContainer: {
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#4F46E5',
    marginTop: 8,
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  uploadSuccessText: {
    color: '#10B981',
    marginTop: 6,
    fontWeight: '500',
    fontSize: 13,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorTextContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  separatorText: {
    color: '#9CA3AF',
    fontWeight: '500',
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkboxContainerSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  checkboxContainerError: {
    borderColor: '#EF4444',
  },
  checkboxIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxIconContainerSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  checkboxLabel: {
    color: '#374151',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  checkboxLabelSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  privacyLink: {
    color: '#4F46E5',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  dobContainer: {
    marginBottom: 20,
  },
  webDatePickerContainer: {
    position: 'relative',
    width: '100%',
  },
  genderContainer: {
    marginBottom: 20,
  },
  referralContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontSize: 14,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    gap: 10,
    minHeight: 48,
  },
  pickerButtonFocused: {
    borderColor: '#4F46E5',
    backgroundColor: '#F9FAFB',
  },
  pickerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 6,
    fontSize: 13,
  },
  gradientButton: {
    borderRadius: 8,
    marginTop: 24,
    overflow: 'hidden',
  },
  registerButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    flexDirection: 'row',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    maxHeight: '75%',
    width: '90%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOptionsContainer: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  modalOptionSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  modalOptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  modalOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RegisterScreen;

