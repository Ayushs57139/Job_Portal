import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

const { width, height } = Dimensions.get('window');
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

const AdminLoginScreen = ({ navigation, route }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const user = await api.getCurrentUserFromStorage();
      if (user) {
        // Check if user is admin
        if (user.userType === 'admin' || user.userType === 'superadmin') {
          // Already logged in as admin, redirect to dashboard
          navigation.replace('AdminDashboard');
          return;
        }
      }
    } catch (error) {
      console.log('Not logged in');
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both User ID/Email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.login({
        loginId: loginId.trim(),
        password: password.trim(),
        userType: 'admin', // Specify admin userType for admin login
      });

      // Check if response has an error message
      if (response && response.message && response.message !== 'Login successful') {
        Alert.alert('Login Failed', response.message);
        setLoading(false);
        return;
      }

      // Check if response has user data
      if (response && response.user) {
        // Check if user is actually an admin or superadmin
        if (response.user.userType === 'admin' || response.user.userType === 'superadmin') {
          // Admin login successful - navigate directly to dashboard
          navigation.replace('AdminDashboard');
        } else {
          // Not an admin account
          await api.logout();
          Alert.alert('Access Denied', 'This is not an admin account. Please use the correct login page.');
        }
      } else {
        // No user data in response - show error
        Alert.alert(
          'Login Failed',
          'Invalid response from server. Please check your credentials and try again.'
        );
      }
    } catch (error) {
      console.error('Admin login error:', error);
      // Extract error message - handle both Error objects and string messages
      let errorMessage = 'Invalid credentials. Please check your User ID/Email and password.';
      
      if (error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && error.toString) {
        errorMessage = error.toString();
      }
      
      // Show the error to user
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Password Recovery',
      'Please contact the super administrator to reset your password.',
      [{ text: 'OK' }]
    );
  };

  if (checkingAuth) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>
            {/* Header Section */}
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.headerCard}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="shield-checkmark" 
                  size={isMobile ? 56 : isTablet ? 60 : 64} 
                  color={colors.textWhite} 
                />
              </View>
              <Text style={styles.headerTitle}>Admin Login</Text>
              <Text style={styles.headerSubtitle}>
                Secure access to administrative dashboard
              </Text>
            </LinearGradient>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.formCard}>
              <Text style={styles.formTitle}>Sign in to your account</Text>
              
              {/* User ID / Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>User ID or Email</Text>
                <View style={[
                  styles.inputWrapper,
                  loginId && styles.inputWrapperFilled
                ]}>
                  <Ionicons
                    name="person-circle-outline"
                    size={isMobile ? 20 : 22}
                    color={loginId ? colors.primary : colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your User ID or Email"
                    placeholderTextColor={colors.textSecondary}
                    value={loginId}
                    onChangeText={setLoginId}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[
                  styles.inputWrapper,
                  password && styles.inputWrapperFilled
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={isMobile ? 20 : 22}
                    color={password ? colors.primary : colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={isMobile ? 20 : 22}
                      color={password ? colors.primary : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.loginButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textWhite} />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={isMobile ? 20 : 22} color={colors.textWhite} />
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Security Notice */}
              <View style={styles.securityNotice}>
                <Ionicons 
                  name="information-circle" 
                  size={isMobile ? 18 : 20} 
                  color={colors.info} 
                />
                <Text style={styles.securityNoticeText}>
                  This is a secure admin area. All login attempts are monitored.
                </Text>
              </View>
            </View>

            {/* Back to Home */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={isMobile ? 18 : 20} color={colors.primary} />
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
    ...(Platform.OS === 'web' && {
      alignItems: 'center',
    }),
  },
  contentWrapper: {
    width: '100%',
    ...(isDesktop && {
      maxWidth: 600,
      alignSelf: 'center',
    }),
    ...(isTablet && {
      maxWidth: 550,
      alignSelf: 'center',
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: isMobile ? 14 : 16,
  },
  headerCard: {
    padding: isMobile ? spacing.lg : isTablet ? spacing.xl : spacing.xxl,
    alignItems: 'center',
    paddingTop: isMobile ? spacing.xxl * 1.5 : isTablet ? spacing.xxl * 1.75 : spacing.xxl * 2,
    paddingBottom: isMobile ? spacing.xxl * 1.5 : isTablet ? spacing.xxl * 1.75 : spacing.xxl * 2,
    minHeight: isMobile ? 240 : isTablet ? 280 : 320,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
  },
  iconContainer: {
    width: isMobile ? 100 : isTablet ? 120 : 140,
    height: isMobile ? 100 : isTablet ? 120 : 140,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isMobile ? spacing.lg : spacing.xl,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textWhite,
    fontWeight: '800',
    marginBottom: spacing.sm,
    fontSize: isMobile ? 28 : isTablet ? 32 : 36,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  headerSubtitle: {
    ...typography.body1,
    color: colors.textWhite,
    opacity: 0.95,
    textAlign: 'center',
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: '500',
    letterSpacing: 0.3,
    paddingHorizontal: spacing.md,
  },
  formContainer: {
    padding: isMobile ? spacing.md : isTablet ? spacing.lg : spacing.lg,
    marginTop: isMobile ? -spacing.xxl : isTablet ? -spacing.xxl * 1.25 : -spacing.xxl * 1.5,
    paddingBottom: spacing.xxl,
    width: '100%',
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
  },
  formCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: isMobile ? spacing.lg : isTablet ? spacing.xl : spacing.xxl,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    width: '100%',
  },
  formTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xl,
    textAlign: 'center',
    fontSize: isMobile ? 20 : isTablet ? 22 : 24,
    letterSpacing: 0.3,
  },
  inputGroup: {
    marginBottom: isMobile ? spacing.lg : spacing.xl,
  },
  inputLabel: {
    ...typography.subtitle2,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: isMobile ? spacing.sm + 2 : spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperFilled: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}05`,
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
    paddingVertical: isMobile ? spacing.md : spacing.md + 2,
    fontSize: isMobile ? 15 : isTablet ? 15.5 : 16,
  },
  passwordInput: {
    paddingRight: spacing.md,
  },
  eyeIcon: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  forgotPasswordText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
  },
  loginButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.md,
    marginTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1 }],
    width: '100%',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isMobile ? spacing.md + 4 : spacing.lg,
    gap: spacing.md,
    minHeight: isMobile ? 52 : isTablet ? 54 : 56,
  },
  loginButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: isMobile ? 15 : isTablet ? 15.5 : 16,
    letterSpacing: 0.5,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    padding: isMobile ? spacing.md : spacing.md + 4,
    backgroundColor: `${colors.info}12`,
    borderRadius: borderRadius.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.info}30`,
  },
  securityNoticeText: {
    ...typography.caption,
    color: colors.info,
    flex: 1,
    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
    lineHeight: isMobile ? 16 : isTablet ? 17 : 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    width: '100%',
  },
  backButtonText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
    fontSize: isMobile ? 14 : isTablet ? 14.5 : 15,
  },
});

export default AdminLoginScreen;

