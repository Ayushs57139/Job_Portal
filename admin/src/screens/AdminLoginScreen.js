import React, { useState } from 'react';
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
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
// Header component removed - admin app doesn't need main site header
import api from '../config/api';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isWideScreen = width > 768;
const isTablet = width > 600 && width <= 768;
const isMobile = width <= 600;

const AdminLoginScreen = ({ navigation, route }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
    // Removed auto-login check - always require password

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
      });

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
      }
    } catch (error) {
      console.error('Admin login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid credentials. Please check your User ID/Email and password.'
      );
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

  const renderContent = () => (
    <>
      {/* Header Section */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.headerCard}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={64} color={colors.textWhite} />
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
                    size={22}
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
                    size={22}
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
                      size={22}
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
                      <Ionicons name="log-in-outline" size={22} color={colors.textWhite} />
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Security Notice */}
              <View style={styles.securityNotice}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
                <Text style={styles.securityNoticeText}>
                  This is a secure admin area. All login attempts are monitored.
                </Text>
              </View>
            </View>

            {/* Back to Login - Admin app doesn't have Home */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('AdminLogin')}
              disabled={loading}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.primary} />
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
    </>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {renderContent()}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {renderContent()}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' && {
      width: '100%',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }),
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      width: '100%',
      height: '100vh',
      overflowY: 'scroll',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      width: '100%',
      maxWidth: isWideScreen ? 600 : '100%',
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
  },
  headerCard: {
    padding: isWideScreen ? spacing.xxl : spacing.lg,
    alignItems: 'center',
    paddingTop: isWideScreen ? spacing.xxl * 2 : spacing.xxl * 1.5,
    paddingBottom: isWideScreen ? spacing.xxl * 2 : spacing.xxl * 1.5,
    minHeight: isWideScreen ? 320 : 280,
    width: '100%',
    justifyContent: 'center',
  },
  iconContainer: {
    width: isWideScreen ? 140 : width > 400 ? 120 : 100,
    height: isWideScreen ? 140 : width > 400 ? 120 : 100,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    fontSize: isWideScreen ? 36 : width > 400 ? 32 : 28,
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
    fontSize: isWideScreen ? 16 : 14,
    fontWeight: '500',
    letterSpacing: 0.3,
    paddingHorizontal: spacing.md,
  },
  formContainer: {
    padding: isWideScreen ? spacing.xl : spacing.lg,
    marginTop: isWideScreen ? -spacing.xxl * 1.5 : -spacing.xxl,
    paddingBottom: spacing.xxl,
    width: '100%',
    ...(isWideScreen && {
      maxWidth: 600,
    }),
  },
  formCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: isWideScreen ? spacing.xxl : spacing.lg,
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
    fontSize: isWideScreen ? 24 : width > 400 ? 22 : 20,
    letterSpacing: 0.3,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.subtitle2,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
    fontSize: isWideScreen ? 14 : 13,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
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
    paddingVertical: spacing.md + 2,
    fontSize: isWideScreen ? 16 : 15,
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
    fontSize: isWideScreen ? 14 : 13,
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
    paddingVertical: spacing.lg,
    gap: spacing.md,
    minHeight: isWideScreen ? 56 : 52,
  },
  loginButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: isWideScreen ? 16 : 15,
    letterSpacing: 0.5,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    padding: spacing.md + 4,
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
    fontSize: isWideScreen ? 13 : 12,
    lineHeight: isWideScreen ? 18 : 16,
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
    ...(isWideScreen && {
      maxWidth: 600,
    }),
  },
  backButtonText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
    fontSize: isWideScreen ? 15 : 14,
  },
});

export default AdminLoginScreen;

