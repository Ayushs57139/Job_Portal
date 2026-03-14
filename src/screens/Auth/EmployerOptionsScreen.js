import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import api from '../../config/api';

const { width } = Dimensions.get('window');
// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';
const isWideScreen = width > 768;

const EmployerOptionsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'sales'
  const [employerType, setEmployerType] = useState('company'); // 'company' or 'consultancy'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  // Sales enquiry form state
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [hiringFor, setHiringFor] = useState('company'); // 'company' or 'consultancy'
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Please enter your email';
    if (!password) newErrors.password = 'Please enter your password';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const loginData = {
        email: email.trim(),
        password: password,
      };

      let response;
      if (employerType === 'company') {
        response = await api.companyLogin(loginData);
        if (response.token) {
          if (response.user && response.user.userType === 'company') {
            Alert.alert('Success', 'Login successful!');
            navigation.reset({
              index: 0,
              routes: [{ name: 'CompanyDashboard' }],
            });
          } else {
            await api.logout();
            Alert.alert(
              'Access Denied', 
              'This account is not authorized for company login. Please use the correct login page.'
            );
          }
        }
      } else {
        response = await api.consultancyLogin(loginData);
        if (response.token) {
          if (response.user && response.user.userType === 'consultancy') {
            Alert.alert('Success', 'Login successful!');
            navigation.reset({
              index: 0,
              routes: [{ name: 'ConsultancyDashboard' }],
            });
          } else {
            await api.logout();
            Alert.alert(
              'Access Denied', 
              'This account is not authorized for consultancy login. Please use the correct login page.'
            );
          }
        }
      }
    } catch (error) {
      // Parse error message from response
      let errorMessage = error.message || 'Please check your credentials and try again';
      const newErrors = {};
      
      // Check for specific error types
      if (errorMessage.toLowerCase().includes('no account found') || 
          errorMessage.toLowerCase().includes('email address') ||
          errorMessage.toLowerCase().includes('login id')) {
        newErrors.email = errorMessage;
      } else if (errorMessage.toLowerCase().includes('password') || 
                 errorMessage.toLowerCase().includes('incorrect password')) {
        newErrors.password = errorMessage;
      } else if (errorMessage.toLowerCase().includes('deactivated')) {
        newErrors.general = errorMessage;
      } else if (errorMessage.toLowerCase().includes('access denied') ||
                 errorMessage.toLowerCase().includes('not authorized')) {
        newErrors.general = errorMessage;
      } else {
        newErrors.general = errorMessage;
      }
      
      setErrors(newErrors);
      
      // Also show in alert for visibility
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSalesEnquiry = async () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Please enter your full name';
    if (!mobileNumber.trim()) newErrors.mobileNumber = 'Please enter your mobile number';
    if (!workEmail.trim()) newErrors.workEmail = 'Please enter your work email';
    if (!workEmail.trim().includes('@')) newErrors.workEmail = 'Please enter a valid email address';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const enquiryData = {
        fullName: fullName.trim(),
        phone: mobileNumber.trim(),
        email: workEmail.trim(),
        hiringFor: hiringFor
      };

      const response = await api.request('/sales-enquiry/simple', {
        method: 'POST',
        body: JSON.stringify(enquiryData),
      });

      if (response.success) {
        Alert.alert('Success', 'Your enquiry has been submitted successfully. We will contact you soon!');
        // Reset form
        setFullName('');
        setMobileNumber('');
        setWorkEmail('');
        setHiringFor('company');
      }
    } catch (error) {
      let errorMessage = error.message || 'Failed to submit enquiry. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e0e7ff', '#f1f5f9']}
        style={styles.backgroundGradient}
      >
        <View style={styles.contentContainer}>
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

          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.iconCircle}>
              <Ionicons 
                name={employerType === 'company' ? 'business' : 'people'} 
                size={32} 
                color={employerType === 'company' ? '#2c3e50' : '#6366f1'} 
              />
            </View>
            <Text style={styles.title}>Employers Login</Text>
            <Text style={styles.subtitle}>
              Sign in to your Company or Consultancy account
            </Text>
          </View>

          {/* Login Form Card */}
          <View style={styles.loginFormCard}>
            {/* Tab Toggle */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'sales' && styles.tabActive]}
                onPress={() => setActiveTab('sales')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'sales' && styles.tabTextActive]}>
                  Sales enquiry
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.tabActive]}
                onPress={() => setActiveTab('login')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                  Register/Log in
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'sales' ? (
              /* Sales Enquiry Form */
              <View>
                {/* Full Name Input */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, errors.fullName && styles.inputError]}
                    placeholder="Full name"
                    placeholderTextColor="#94a3b8"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      setErrors({ ...errors, fullName: null });
                    }}
                  />
                  {errors.fullName && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#ef4444" />
                      <Text style={styles.errorText}>{errors.fullName}</Text>
                    </View>
                  )}
                </View>

                {/* Mobile Number Input */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, errors.mobileNumber && styles.inputError]}
                    placeholder="Mobile number"
                    placeholderTextColor="#94a3b8"
                    value={mobileNumber}
                    onChangeText={(text) => {
                      setMobileNumber(text);
                      setErrors({ ...errors, mobileNumber: null });
                    }}
                    keyboardType="phone-pad"
                  />
                  {errors.mobileNumber && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#ef4444" />
                      <Text style={styles.errorText}>{errors.mobileNumber}</Text>
                    </View>
                  )}
                </View>

                {/* Work Email Input */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, errors.workEmail && styles.inputError]}
                    placeholder="Work email"
                    placeholderTextColor="#94a3b8"
                    value={workEmail}
                    onChangeText={(text) => {
                      setWorkEmail(text);
                      setErrors({ ...errors, workEmail: null });
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  {errors.workEmail && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#ef4444" />
                      <Text style={styles.errorText}>{errors.workEmail}</Text>
                    </View>
                  )}
                </View>

                {/* HIRING FOR Section */}
                <View style={styles.inputGroup}>
                  <Text style={styles.hiringForLabel}>HIRING FOR</Text>
                  <View style={styles.hiringForContainer}>
                    <TouchableOpacity
                      style={[
                        styles.hiringForOption,
                        hiringFor === 'company' && styles.hiringForOptionActive
                      ]}
                      onPress={() => setHiringFor('company')}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.hiringForOptionText,
                        hiringFor === 'company' && styles.hiringForOptionTextActive
                      ]}>
                        Your company
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.hiringForOption,
                        hiringFor === 'consultancy' && styles.hiringForOptionActive
                      ]}
                      onPress={() => setHiringFor('consultancy')}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.hiringForOptionText,
                        hiringFor === 'consultancy' && styles.hiringForOptionTextActive
                      ]}>
                        Your consultancy
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Request Callback Button */}
                <TouchableOpacity
                  onPress={handleSalesEnquiry}
                  disabled={submitting}
                  activeOpacity={0.9}
                  style={styles.requestCallbackButton}
                >
                  <Text style={styles.requestCallbackButtonText}>
                    {submitting ? 'Submitting...' : 'Request callback'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Login Form */
              <>
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

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.labelIcon} />
                <Text style={styles.inputLabel}>Email Address</Text>
              </View>
              <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: null });
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {errors.email && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.email}</Text>
                </View>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.labelIcon} />
                <Text style={styles.inputLabel}>Password</Text>
              </View>
              <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: null });
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              )}
            </View>

            {/* General Error Message */}
            {errors.general && (
              <View style={styles.generalErrorContainer}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            {/* Sign In Button */}
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
              style={styles.signInButtonWrapper}
            >
              {employerType === 'company' ? (
                <LinearGradient
                  colors={['#2c3e50', '#34495e']}
                  style={styles.signInButton}
                >
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                  <Text style={styles.signInButtonText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.signInButton}
                >
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                  <Text style={styles.signInButtonText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Create Account */}
            <View style={styles.createAccountContainer}>
              <Text style={styles.createAccountText}>Don't have an account?</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('EmployerRegister')}
                activeOpacity={0.7}
              >
                <Text style={styles.createAccountLink}>Register here</Text>
              </TouchableOpacity>
            </View>
            </>
            )}
          </View>
        </View>
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
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: 32,
    left: 20,
    zIndex: 10,
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
    marginBottom: 24,
    width: '100%',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.lg,
    borderWidth: 3,
    borderColor: '#e0e7ff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  loginFormCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
  inputGroup: {
    marginBottom: 18,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  inputWrapper: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    ...(isWeb && {
      transition: 'all 0.2s ease',
    }),
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1e293b',
  },
  eyeIcon: {
    padding: 12,
    paddingRight: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
  },
  generalErrorContainer: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generalErrorText: {
    fontSize: 14,
    color: '#dc2626',
    flex: 1,
    fontWeight: '500',
  },
  signInButtonWrapper: {
    marginTop: 6,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  createAccountText: {
    fontSize: 14,
    color: '#64748b',
  },
  createAccountLink: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#ffffff',
    ...shadows.sm,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#1e293b',
    fontWeight: '700',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  hiringForLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  hiringForContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  hiringForOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiringForOptionActive: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  hiringForOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  hiringForOptionTextActive: {
    color: '#6366f1',
    fontWeight: '700',
  },
  requestCallbackButton: {
    backgroundColor: '#60a5fa',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    ...shadows.md,
  },
  requestCallbackButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default EmployerOptionsScreen;
