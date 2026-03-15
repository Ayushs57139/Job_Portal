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
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../../styles/theme';
import api from '../../config/api';

const isWeb = Platform.OS === 'web';

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── NAVBAR ── */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
          <Text style={styles.logoText}>
            <Text style={styles.logoPrimary}>Free</Text>
            <Text style={styles.logoJob}>job</Text>
            <Text style={styles.logoWala}>wala</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navLoginBtn}
          onPress={() => navigation.navigate('EmployerOptions')}
          activeOpacity={0.8}
        >
          <Text style={styles.navLoginBtnText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* ── HERO HEADER ── */}
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.hero}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={employerType === 'company' ? 'business' : 'people'}
            size={32}
            color={employerType === 'company' ? '#a5b4fc' : '#c4b5fd'}
          />
        </View>
        <Text style={styles.heroTitle}>Employer Registration</Text>
        <Text style={styles.heroSubtitle}>
          {employerType === 'company'
            ? "Let's Get Started, Tell Us about Your Company"
            : "Let's Get Started, Tell Us about Your Consultancy"}
        </Text>

        {/* Type selector */}
        <View style={styles.typeSelectorContainer}>
          {['company', 'consultancy'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeOpt, employerType === t && styles.typeOptActive]}
              onPress={() => setEmployerType(t)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={t === 'company' ? 'business' : 'people'}
                size={18}
                color={employerType === t ? '#ffffff' : '#94a3b8'}
              />
              <Text style={[styles.typeOptTxt, employerType === t && styles.typeOptTxtActive]}>
                {t === 'company' ? 'Company' : 'Consultancy'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* ── FORM CARD ── */}
      <View style={styles.cardOuter}>
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
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  // Navbar
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
    ...(isWeb ? { position: 'sticky', top: 0, zIndex: 100 } : {}),
  },
  logoText: { fontSize: 24, fontWeight: '800' },
  logoPrimary: { color: '#3b82f6' },
  logoJob: { color: '#f97316' },
  logoWala: { color: '#1e293b' },
  navLoginBtn: {
    borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 18,
    paddingVertical: 8, borderRadius: 8,
  },
  navLoginBtnText: { fontSize: 14, color: '#1e293b', fontWeight: '600' },

  // Hero
  hero: {
    paddingTop: 40, paddingBottom: 40, paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 2, borderColor: 'rgba(165,180,252,0.4)',
  },
  heroTitle: {
    fontSize: 26, fontWeight: '800', color: '#ffffff', marginBottom: 6, textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14, color: '#a5b4fc', textAlign: 'center', marginBottom: 24, lineHeight: 20,
  },
  typeSelectorContainer: {
    flexDirection: 'row', gap: 10, backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 5, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  typeOpt: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 11, paddingHorizontal: 24, borderRadius: 10,
  },
  typeOptActive: {
    backgroundColor: '#6366f1',
    ...shadows.md,
  },
  typeOptTxt: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  typeOptTxtActive: { color: '#ffffff', fontWeight: '700' },

  // Card
  cardOuter: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  formContainer: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 5,
    borderWidth: 1, borderColor: '#e2e8f0',
    maxWidth: 900, alignSelf: 'center', width: '100%',
  },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 20, marginTop: 4, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  labelIcon: { marginRight: 6 },
  row: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  halfInput: { flex: 1 },
  fullInput: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  inputWrapper: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10,
    backgroundColor: '#ffffff', paddingHorizontal: 2,
  },
  inputWrapperError: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  input: { paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1e293b' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  helperText: { fontSize: 12, color: '#6366f1', marginTop: 4 },
  errorText: { fontSize: 12, color: '#ef4444', fontWeight: '500' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  checkboxLabel: { fontSize: 13, color: '#475569', flex: 1 },
  link: { color: '#6366f1', textDecorationLine: 'underline' },
  pickerContainer: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10,
    backgroundColor: '#ffffff', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  pickerText: { fontSize: 14, color: '#94a3b8' },
  pickerTextSelected: { fontSize: 14, color: '#1e293b' },
  registerButtonWrapper: {
    marginTop: 20, marginBottom: 14, borderRadius: 10,
    overflow: 'hidden', ...shadows.md,
  },
  registerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15, borderRadius: 10,
  },
  registerButtonDisabled: { opacity: 0.6 },
  registerButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  loginContainer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 4, flexWrap: 'wrap',
  },
  loginText: { fontSize: 14, color: '#64748b' },
  loginLink: { fontSize: 14, color: '#6366f1', fontWeight: '700', textDecorationLine: 'underline' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff', borderRadius: 14, width: '100%',
    maxWidth: 500, maxHeight: '80%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18, borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  modalOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  modalOptionText: { fontSize: 14, color: '#1e293b', flex: 1 },
  modalOptionTextSelected: { fontWeight: '600', color: '#6366f1' },
});

export default EmployerRegisterScreen;

