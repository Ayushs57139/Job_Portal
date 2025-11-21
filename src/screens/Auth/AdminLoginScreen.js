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
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'web' ? undefined : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.contentWrapper}>
          {/* Header Section */}
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name="shield-checkmark" 
                size={isMobile ? 48 : isTablet ? 52 : 56} 
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
                    size={isMobile ? 18 : 20}
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
                    size={isMobile ? 18 : 20}
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
                      size={isMobile ? 18 : 20}
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
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textWhite} size="small" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={isMobile ? 18 : 20} color={colors.textWhite} />
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Security Notice */}
              <View style={styles.securityNotice}>
                <Ionicons 
                  name="information-circle" 
                  size={isMobile ? 16 : 18} 
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
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={isMobile ? 16 : 18} color={colors.primary} />
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }),
  },
  keyboardView: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      height: 'calc(100vh - 60px)',
      overflow: 'hidden',
      display: 'flex',
    }),
    ...(Platform.OS !== 'web' && {
      flex: 1,
    }),
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(isDesktop && {
      maxWidth: 520,
      alignSelf: 'center',
    }),
    ...(isTablet && {
      maxWidth: 500,
      alignSelf: 'center',
    }),
    ...(Platform.OS === 'web' && {
      maxHeight: '100%',
      paddingVertical: spacing.xs,
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
    paddingVertical: isMobile ? spacing.lg + spacing.sm : isTablet ? spacing.xl : spacing.xl + spacing.sm,
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexShrink: 0,
    ...(Platform.OS === 'web' && {
      height: isMobile ? 150 : isTablet ? 170 : 190,
      minHeight: isMobile ? 140 : isTablet ? 160 : 180,
      maxHeight: isMobile ? 160 : isTablet ? 180 : 200,
    }),
    ...(Platform.OS !== 'web' && {
      minHeight: isMobile ? 140 : isTablet ? 160 : 180,
      maxHeight: isMobile ? 160 : isTablet ? 180 : 200,
    }),
  },
  iconContainer: {
    width: isMobile ? 72 : isTablet ? 80 : 88,
    height: isMobile ? 72 : isTablet ? 80 : 88,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(10px)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    }),
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textWhite,
    fontWeight: '800',
    marginBottom: spacing.xs,
    fontSize: isMobile ? 24 : isTablet ? 26 : 28,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.textWhite,
    opacity: 0.92,
    textAlign: 'center',
    fontSize: isMobile ? 12.5 : isTablet ? 13 : 13.5,
    fontWeight: '500',
    letterSpacing: 0.2,
    paddingHorizontal: spacing.md,
  },
  formContainer: {
    padding: isMobile ? spacing.md : spacing.lg,
    marginTop: isMobile ? -spacing.xl : isTablet ? -spacing.xl - spacing.sm : -spacing.xxl,
    width: '100%',
    flexShrink: 1,
    justifyContent: 'flex-start',
    ...(Platform.OS === 'web' && {
      overflow: 'visible',
    }),
  },
  formCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: isMobile ? spacing.lg : isTablet ? spacing.lg + spacing.sm : spacing.xl,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    width: '100%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 10,
    }),
  },
  formTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontSize: isMobile ? 18 : isTablet ? 19 : 20,
    letterSpacing: 0.2,
  },
  inputGroup: {
    marginBottom: spacing.md + spacing.sm,
  },
  inputLabel: {
    ...typography.subtitle2,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
    fontSize: isMobile ? 12.5 : isTablet ? 13 : 13.5,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 4,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.2s ease',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    }),
  },
  inputWrapperFilled: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
    paddingVertical: isMobile ? spacing.sm + 4 : spacing.md,
    fontSize: isMobile ? 14.5 : isTablet ? 15 : 15.5,
    ...(Platform.OS === 'web' && {
      outline: 'none',
    }),
  },
  passwordInput: {
    paddingRight: spacing.sm,
  },
  eyeIcon: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  forgotPasswordText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: isMobile ? 12.5 : isTablet ? 13 : 13.5,
  },
  loginButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.md,
    marginTop: spacing.sm,
    width: '100%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.18)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 6,
    }),
  },
  loginButtonDisabled: {
    opacity: 0.65,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isMobile ? spacing.md : spacing.md + spacing.xs,
    gap: spacing.sm,
    minHeight: isMobile ? 48 : isTablet ? 50 : 52,
  },
  loginButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: isMobile ? 14.5 : isTablet ? 15 : 15.5,
    letterSpacing: 0.4,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md + spacing.sm,
    padding: isMobile ? spacing.sm + 4 : spacing.md,
    backgroundColor: `${colors.info}0F`,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.info}25`,
  },
  securityNoticeText: {
    ...typography.caption,
    color: colors.info,
    flex: 1,
    fontSize: isMobile ? 11.5 : isTablet ? 12 : 12.5,
    lineHeight: isMobile ? 15 : isTablet ? 16 : 17,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md + spacing.sm,
    padding: spacing.sm + 4,
    gap: spacing.xs + 2,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    width: '100%',
  },
  backButtonText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
  },
});

export default AdminLoginScreen;

