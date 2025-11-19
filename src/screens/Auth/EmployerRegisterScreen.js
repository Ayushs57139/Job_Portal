import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../../styles/theme';
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

const EmployerRegisterScreen = ({ navigation }) => {
  const [employerType, setEmployerType] = useState('company'); // 'company' or 'consultancy'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsappAvailable: false,
    password: '',
    companyName: '',
    consultancyName: '',
    designation: '',
    heardAboutUs: '',
    agreeToTerms: false,
    receiveUpdates: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSourceModal, setShowSourceModal] = useState(false);

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
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
      newErrors.phone = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (employerType === 'company') {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    } else {
      if (!formData.consultancyName.trim()) newErrors.consultancyName = 'Consultancy name is required';
    }
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.heardAboutUs) newErrors.heardAboutUs = 'Please select an option';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

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
        phone: formData.phone,
        password: formData.password,
      };

      if (employerType === 'company') {
        registrationData.company = {
          name: formData.companyName,
          designation: formData.designation,
          heardAboutUs: formData.heardAboutUs,
        };
        const response = await api.companyRegister(registrationData);
        if (response && response.token) {
          Alert.alert(
            'Success',
            'Registration successful! Redirecting to KYC verification...',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('KYCForm', { userType: 'company' });
                },
              },
            ]
          );
          setTimeout(() => {
            navigation.navigate('KYCForm', { userType: 'company' });
          }, 500);
        } else {
          Alert.alert('Registration Failed', 'Registration was not successful. Please try again.');
        }
      } else {
        registrationData.consultancy = {
          name: formData.consultancyName,
          designation: formData.designation,
          heardAboutUs: formData.heardAboutUs,
        };
        const response = await api.consultancyRegister(registrationData);
        if (response && response.token) {
          Alert.alert(
            'Success',
            'Registration successful! Redirecting to KYC verification...',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('KYCForm', { userType: 'consultancy' });
                },
              },
            ]
          );
          setTimeout(() => {
            navigation.navigate('KYCForm', { userType: 'consultancy' });
          }, 500);
        } else {
          Alert.alert('Registration Failed', 'Registration was not successful. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'Please check your details and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e0e7ff', '#f1f5f9']}
        style={styles.backgroundGradient}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Logo */}
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <Text style={styles.logoText}>
              <Text style={styles.logoPrimary}>Free</Text>
              <Text style={styles.logoJob}>job</Text>
              <Text style={styles.logoWala}>wala</Text>
            </Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.iconCircle}>
              <Ionicons 
                name={employerType === 'company' ? 'business' : 'people'} 
                size={32} 
                color={employerType === 'company' ? '#2c3e50' : '#6366f1'} 
              />
            </View>
            <Text style={styles.headerTitle}>Employer Registration</Text>
            <Text style={styles.headerSubtitle}>
              {employerType === 'company' 
                ? "Let's Get Started, Tell Us about Your Company"
                : "Let's Get Started, Tell Us about Your Consultancy"}
            </Text>
            
            {/* Employer Type Selection */}
            <View style={styles.typeSelectorContainer}>
              <TouchableOpacity
                style={styles.typeOptionWrapper}
                onPress={() => setEmployerType('company')}
                activeOpacity={0.8}
              >
                {employerType === 'company' ? (
                  <LinearGradient
                    colors={['#2c3e50', '#34495e']}
                    style={styles.typeOptionActive}
                  >
                    <Ionicons name="business" size={22} color="#fff" />
                    <Text style={styles.typeOptionTextActive}>Company</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.typeOption}>
                    <Ionicons name="business" size={22} color="#64748b" />
                    <Text style={styles.typeOptionText}>Company</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.typeOptionWrapper}
                onPress={() => setEmployerType('consultancy')}
                activeOpacity={0.8}
              >
                {employerType === 'consultancy' ? (
                  <LinearGradient
                    colors={['#6366f1', '#8b5cf6']}
                    style={styles.typeOptionActive}
                  >
                    <Ionicons name="people" size={22} color="#fff" />
                    <Text style={styles.typeOptionTextActive}>Consultancy</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.typeOption}>
                    <Ionicons name="people" size={22} color="#64748b" />
                    <Text style={styles.typeOptionText}>Consultancy</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formContainer}>
            {/* Personal Information Section */}
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={24} color={employerType === 'company' ? '#2c3e50' : '#6366f1'} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>First Name *</Text>
                </View>
                <View style={[styles.inputWrapper, errors.firstName && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => updateField('firstName', text)}
                    placeholder="Enter first name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                {errors.firstName && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  </View>
                )}
              </View>

              <View style={styles.halfInput}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Last Name *</Text>
                </View>
                <View style={[styles.inputWrapper, errors.lastName && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => updateField('lastName', text)}
                    placeholder="Enter last name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                {errors.lastName && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <View style={styles.labelContainer}>
                  <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.labelIcon} />
                  <Text style={styles.label}>Email ID *</Text>
                </View>
                <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => updateField('email', text)}
                    placeholder="Enter email address"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text style={styles.errorText}>{errors.email}</Text>
                  </View>
                )}
              </View>

              <View style={styles.halfInput}>
                <View style={styles.labelContainer}>
                  <Ionicons name="call-outline" size={18} color="#64748b" style={styles.labelIcon} />
                  <Text style={styles.label}>Mobile Number *</Text>
                </View>
                <View style={[styles.inputWrapper, errors.phone && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => updateField('phone', text)}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                {errors.phone && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => updateField('whatsappAvailable', !formData.whatsappAvailable)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={formData.whatsappAvailable ? 'checkbox' : 'square-outline'}
                    size={18}
                    color={formData.whatsappAvailable ? '#6366f1' : '#64748b'}
                  />
                  <Text style={styles.checkboxLabel}>Tick if Number is Available on WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fullInput}>
              <View style={styles.labelContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.labelIcon} />
                <Text style={styles.label}>Password *</Text>
              </View>
              <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                />
              </View>
              <Text style={styles.helperText}>Password must be at least 6 characters long</Text>
              {errors.password && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              )}
            </View>

            {/* Company/Consultancy Information Section */}
            <View style={styles.sectionHeader}>
              <Ionicons 
                name={employerType === 'company' ? 'business-outline' : 'people-outline'} 
                size={24} 
                color={employerType === 'company' ? '#2c3e50' : '#6366f1'} 
              />
              <Text style={styles.sectionTitle}>
                {employerType === 'company' ? 'Company Information' : 'Consultancy Information'}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>
                    {employerType === 'company' ? 'Your Company Name *' : 'Your Consultancy Name *'}
                  </Text>
                </View>
                <View style={[
                  styles.inputWrapper, 
                  (errors.companyName || errors.consultancyName) && styles.inputWrapperError
                ]}>
                  <TextInput
                    style={styles.input}
                    value={employerType === 'company' ? formData.companyName : formData.consultancyName}
                    onChangeText={(text) => updateField(
                      employerType === 'company' ? 'companyName' : 'consultancyName', 
                      text
                    )}
                    placeholder={employerType === 'company' ? 'Enter company name' : 'Enter consultancy name'}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                {errors.companyName && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text style={styles.errorText}>{errors.companyName}</Text>
                  </View>
                )}
                {errors.consultancyName && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text style={styles.errorText}>{errors.consultancyName}</Text>
                  </View>
                )}
              </View>

              <View style={styles.halfInput}>
                <View style={styles.labelContainer}>
                  <Ionicons name="briefcase-outline" size={18} color="#64748b" style={styles.labelIcon} />
                  <Text style={styles.label}>Your Designation *</Text>
                </View>
                <View style={[styles.inputWrapper, errors.designation && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.input}
                    value={formData.designation}
                    onChangeText={(text) => updateField('designation', text)}
                    placeholder="Enter designation"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                {errors.designation && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text style={styles.errorText}>{errors.designation}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.fullInput}>
              <View style={styles.labelContainer}>
                <Ionicons name="information-circle-outline" size={18} color="#64748b" style={styles.labelIcon} />
                <Text style={styles.label}>From Where You Heard About Us *</Text>
              </View>
              <TouchableOpacity
                style={[styles.pickerContainer, errors.heardAboutUs && styles.inputWrapperError]}
                onPress={() => setShowSourceModal(true)}
                activeOpacity={0.7}
              >
                <Text style={formData.heardAboutUs ? styles.pickerTextSelected : styles.pickerText}>
                  {formData.heardAboutUs || 'Select an option'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
              {errors.heardAboutUs && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.heardAboutUs}</Text>
                </View>
              )}
            </View>

          {/* Referral Source Modal */}
          <Modal
            visible={showSourceModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowSourceModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>From Where You Heard About Us</Text>
                  <TouchableOpacity onPress={() => setShowSourceModal(false)}>
                    <Ionicons name="close" size={24} color="#1e293b" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={REFERRAL_SOURCES}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        updateField('heardAboutUs', item);
                        setShowSourceModal(false);
                      }}
                    >
                      <Text style={[
                        styles.modalOptionText,
                        formData.heardAboutUs === item && styles.modalOptionTextSelected
                      ]}>
                        {item}
                      </Text>
                      {formData.heardAboutUs === item && (
                        <Ionicons name="checkmark" size={20} color={employerType === 'company' ? '#2c3e50' : '#6366f1'} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('agreeToTerms', !formData.agreeToTerms)}
          >
            <Ionicons
              name={formData.agreeToTerms ? 'checkbox' : 'square-outline'}
              size={20}
              color={formData.agreeToTerms ? '#6366f1' : '#64748b'}
            />
            <Text style={styles.checkboxLabel}>
              I agree to the <Text style={styles.link}>Terms and Conditions</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text> *
            </Text>
          </TouchableOpacity>
          {errors.agreeToTerms && <Text style={styles.errorText}>{errors.agreeToTerms}</Text>}

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('receiveUpdates', !formData.receiveUpdates)}
          >
            <Ionicons
              name={formData.receiveUpdates ? 'checkbox' : 'square-outline'}
              size={20}
              color={formData.receiveUpdates ? '#6366f1' : '#64748b'}
            />
            <Text style={styles.checkboxLabel}>I would like to receive updates and newsletters</Text>
          </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.9}
              style={styles.registerButtonWrapper}
            >
              {employerType === 'company' ? (
                <LinearGradient
                  colors={['#2c3e50', '#34495e']}
                  style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                >
                  <Ionicons name="person-add-outline" size={20} color="#fff" />
                  <Text style={styles.registerButtonText}>{loading ? 'Registering...' : 'Register'}</Text>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                >
                  <Ionicons name="person-add-outline" size={20} color="#fff" />
                  <Text style={styles.registerButtonText}>{loading ? 'Registering...' : 'Register'}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('EmployerOptions')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>Login here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoContainer: {
    position: 'absolute',
    top: 32,
    left: 20,
    zIndex: 10,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoPrimary: {
    color: '#3b82f6',
  },
  logoJob: {
    color: '#FF6B35',
  },
  logoWala: {
    color: '#1e293b',
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 32,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...shadows.lg,
    borderWidth: 3,
    borderColor: '#e0e7ff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeOptionWrapper: {
    flex: 1,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  typeOptionActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...shadows.md,
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  typeOptionTextActive: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelIcon: {
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  fullInput: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  inputWrapper: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1e293b',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  link: {
    color: '#6366f1',
    textDecorationLine: 'underline',
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerText: {
    fontSize: 15,
    color: '#94a3b8',
  },
  pickerTextSelected: {
    fontSize: 15,
    color: '#1e293b',
  },
  registerButtonWrapper: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#1e293b',
    flex: 1,
  },
  modalOptionTextSelected: {
    fontWeight: '600',
  },
});

export default EmployerRegisterScreen;

