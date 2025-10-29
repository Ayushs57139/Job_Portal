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

const ConsultancyRegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsappAvailable: false,
    password: '',
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
    if (!formData.consultancyName.trim()) newErrors.consultancyName = 'Consultancy name is required';
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
        userType: 'employer',
        employerType: 'consultancy',
        consultancy: {
          name: formData.consultancyName,
          designation: formData.designation,
          heardAboutUs: formData.heardAboutUs,
        },
      };

      const response = await api.register(registrationData);

      if (response.token) {
        Alert.alert(
          'Success',
          'Registration successful! Redirecting to your dashboard...',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'ConsultancyDashboard' }],
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Please check your details and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.header}
        >
          <Ionicons name="people" size={32} color="#fff" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Consultancy Registration</Text>
          <Text style={styles.headerSubtitle}>Let's Get Started, Tell Us about Your Consultancy</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Recruitment & Consulting Partner</Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          {/* Personal Information Section */}
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => updateField('firstName', text)}
                placeholder=""
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => updateField('lastName', text)}
                placeholder=""
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Email ID *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                placeholder=""
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder=""
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => updateField('whatsappAvailable', !formData.whatsappAvailable)}
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
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              placeholder=""
              secureTextEntry
            />
            <Text style={styles.helperText}>Password must be at least 6 characters long</Text>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Consultancy Information Section */}
          <Text style={styles.sectionTitle}>Consultancy Information</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Your Consultancy Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.consultancyName}
                onChangeText={(text) => updateField('consultancyName', text)}
                placeholder=""
              />
              {errors.consultancyName && <Text style={styles.errorText}>{errors.consultancyName}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Your Designation *</Text>
              <TextInput
                style={styles.input}
                value={formData.designation}
                onChangeText={(text) => updateField('designation', text)}
                placeholder=""
              />
              {errors.designation && <Text style={styles.errorText}>{errors.designation}</Text>}
            </View>
          </View>

          <View style={styles.fullInput}>
            <Text style={styles.label}>From Where You Heard About Us *</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowSourceModal(true)}
              >
                <Text style={formData.heardAboutUs ? styles.pickerTextSelected : styles.pickerText}>
                  {formData.heardAboutUs || 'Select an option'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            {errors.heardAboutUs && <Text style={styles.errorText}>{errors.heardAboutUs}</Text>}
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
                        <Ionicons name="checkmark" size={20} color="#2c3e50" />
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
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creating Account...' : 'Create Consultancy Account'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.orText}>or</Text>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login', { userType: 'employer', employerType: 'consultancy' })}>
              <Text style={styles.loginLink}>Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    marginTop: 8,
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  helperText: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: 15,
    color: '#94a3b8',
  },
  pickerTextSelected: {
    fontSize: 15,
    color: '#1e293b',
  },
  registerButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  registerButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  orText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
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
    color: '#2c3e50',
  },
});

export default ConsultancyRegisterScreen;

