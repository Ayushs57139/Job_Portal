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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

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
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-circle-outline"
                    size={22}
                    color={colors.textSecondary}
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
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={colors.textSecondary}
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
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={22}
                      color={colors.textSecondary}
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

            {/* Back to Home */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
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
    padding: spacing.xxl,
    alignItems: 'center',
    paddingTop: spacing.xxl * 1.5,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textWhite,
    fontWeight: '700',
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
    marginTop: -spacing.xl,
  },
  formCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.md,
  },
  formTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.subtitle2,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  passwordInput: {
    paddingRight: spacing.md,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    padding: spacing.xs,
  },
  forgotPasswordText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  loginButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '700',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: `${colors.info}15`,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
  },
  securityNoticeText: {
    ...typography.caption,
    color: colors.info,
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  backButtonText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default AdminLoginScreen;

