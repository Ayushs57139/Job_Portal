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
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import api from '../config/api';
import { useResponsive } from '../utils/responsive';

const AdminLoginScreen = ({ navigation, route }) => {
  const responsive = useResponsive();
  const { width, height } = Dimensions.get('window');
  const isWeb = Platform.OS === 'web';
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isWideScreen = width > 768;
  const dynamicStyles = getStyles(isMobile, isTablet, isWideScreen, isWeb);
  
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [gradientAnim] = useState(new Animated.Value(0));
  
  // Removed auto-login check - always require password

  useEffect(() => {
    // Animate on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(gradientAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(gradientAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
  }, []);

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
      
      // Handle rate limit errors with specific messaging
      if (error.isRateLimit || error.status === 429 || error.message.includes('Too many requests')) {
        Alert.alert(
          'Rate Limit Exceeded',
          error.message || 'Too many login attempts. Please wait a few minutes before trying again.',
          [
            {
              text: 'OK',
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert(
          'Login Failed',
          error.message || 'Invalid credentials. Please check your User ID/Email and password.'
        );
      }
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

  const renderContent = () => {
    return (
      <>
        {/* Clean Background */}
        <Animated.View style={[dynamicStyles.animatedBackground, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Subtle decorative elements */}
          <View style={dynamicStyles.decorativeCircle1} />
          <View style={dynamicStyles.decorativeCircle2} />
        </Animated.View>

        {/* Minimal Header Section */}
        <Animated.View
          style={[
            dynamicStyles.headerCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={dynamicStyles.iconContainer}>
            <Ionicons 
              name="shield-checkmark" 
              size={isWeb || isWideScreen 
                ? (isMobile ? 28 : isTablet ? 30 : 32)
                : (isMobile ? 36 : isTablet ? 40 : 44)} 
              color={colors.primary} 
            />
          </View>
          <Text style={dynamicStyles.headerTitle}>Admin Portal</Text>
          <Text style={dynamicStyles.headerSubtitle}>
            Secure access to manage your platform
          </Text>
        </Animated.View>

        {/* Login Form Card */}
        <Animated.View
          style={[
            dynamicStyles.loginCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={dynamicStyles.loginCardContent}>
            <Text style={dynamicStyles.loginTitle}>Welcome Back</Text>
            <Text style={dynamicStyles.loginSubtitle}>Sign in to continue</Text>

            {/* User ID/Email Input */}
            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.inputLabel}>Email or User ID</Text>
              <View style={[dynamicStyles.inputWrapper, loginId && dynamicStyles.inputWrapperFilled]}>
                <Ionicons name="mail-outline" size={20} color={loginId ? colors.primary : colors.textSecondary} style={dynamicStyles.inputIcon} />
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Enter your email or user ID"
                  placeholderTextColor={colors.textSecondary}
                  value={loginId}
                  onChangeText={setLoginId}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  {...(Platform.OS === 'web' && { outline: 'none' })}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.inputLabel}>Password</Text>
              <View style={[dynamicStyles.inputWrapper, password && dynamicStyles.inputWrapperFilled]}>
                <Ionicons name="lock-closed-outline" size={20} color={password ? colors.primary : colors.textSecondary} style={dynamicStyles.inputIcon} />
                <TextInput
                  style={dynamicStyles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  {...(Platform.OS === 'web' && { outline: 'none' })}
                />
                <TouchableOpacity
                  style={dynamicStyles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={dynamicStyles.forgotPasswordButton}
              onPress={handleForgotPassword}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={dynamicStyles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[dynamicStyles.loginButton, loading && dynamicStyles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              <View style={dynamicStyles.loginButtonGradient}>
                {loading ? (
                  <ActivityIndicator color={colors.textWhite} size="small" />
                ) : (
                  <>
                    <Text style={dynamicStyles.loginButtonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.textWhite} />
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Security Notice */}
            <View style={dynamicStyles.securityNotice}>
              <Ionicons 
                name="shield-checkmark-outline" 
                size={16} 
                color={colors.primary} 
              />
              <Text style={dynamicStyles.securityNoticeText}>
                Secure admin area. All login attempts are monitored.
              </Text>
            </View>
          </View>
        </Animated.View>
      </>
    );
  };

  const renderRightSideContent = () => {
    return (
      <View style={dynamicStyles.rightSideContent}>
        <View style={dynamicStyles.rightSideInner}>
          <View style={dynamicStyles.adminFeaturesContainer}>
            <View style={dynamicStyles.featureIconContainer}>
              <Ionicons 
                name="settings" 
                size={isWeb || isWideScreen ? 32 : 36} 
                color={colors.primary} 
              />
            </View>
            <Text style={dynamicStyles.rightSideTitle}>Admin Features</Text>
            <Text style={dynamicStyles.rightSideSubtitle}>
              Complete control over your job portal platform
            </Text>

            <View style={dynamicStyles.featuresList}>
              <View style={dynamicStyles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={isWeb || isWideScreen ? 20 : 22} 
                  color={colors.primary} 
                />
                <Text style={dynamicStyles.featureText}>User Management</Text>
              </View>
              <View style={dynamicStyles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={isWeb || isWideScreen ? 20 : 22} 
                  color={colors.primary} 
                />
                <Text style={dynamicStyles.featureText}>Job Posting Control</Text>
              </View>
              <View style={dynamicStyles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={isWeb || isWideScreen ? 20 : 22} 
                  color={colors.primary} 
                />
                <Text style={dynamicStyles.featureText}>Analytics & Reports</Text>
              </View>
              <View style={dynamicStyles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={isWeb || isWideScreen ? 20 : 22} 
                  color={colors.primary} 
                />
                <Text style={dynamicStyles.featureText}>System Configuration</Text>
              </View>
              <View style={dynamicStyles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={isWeb || isWideScreen ? 20 : 22} 
                  color={colors.primary} 
                />
                <Text style={dynamicStyles.featureText}>Security Monitoring</Text>
              </View>
            </View>

            <View style={dynamicStyles.statsContainer}>
              <View style={dynamicStyles.statItem}>
                <Ionicons 
                  name="people" 
                  size={isWeb || isWideScreen ? 22 : 24} 
                  color={colors.primary} 
                />
                <Text style={dynamicStyles.statNumber}>24/7</Text>
                <Text style={dynamicStyles.statLabel}>Support</Text>
              </View>
              <View style={dynamicStyles.statItem}>
                <Ionicons 
                  name="shield-checkmark" 
                  size={isWeb || isWideScreen ? 22 : 24} 
                  color={colors.primary} 
                />
                <Text style={dynamicStyles.statNumber}>100%</Text>
                <Text style={dynamicStyles.statLabel}>Secure</Text>
              </View>
              <View style={dynamicStyles.statItem}>
                <Ionicons 
                  name="speedometer" 
                  size={isWeb || isWideScreen ? 22 : 24} 
                  color={colors.primary} 
                />
                <Text style={dynamicStyles.statNumber}>Fast</Text>
                <Text style={dynamicStyles.statLabel}>Access</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const shouldShowTwoColumns = (isWeb || isWideScreen) && width >= 1024 && !isTablet;
  
  const content = (
    <View style={dynamicStyles.contentWrapper}>
      {shouldShowTwoColumns ? (
        <View style={dynamicStyles.twoColumnLayout}>
          <View style={dynamicStyles.leftColumn}>
            {renderContent()}
          </View>
          {renderRightSideContent()}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={dynamicStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {renderContent()}
          {!isMobile && width >= 768 && width < 1024 && (
            <View style={dynamicStyles.mobileRightSection}>
              {renderRightSideContent()}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={dynamicStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'web' ? undefined : 'height'}
        style={dynamicStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {content}
      </KeyboardAvoidingView>
    </View>
  );
};

const getStyles = (isMobile, isTablet, isWideScreen, isWeb) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web' && {
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }),
  },
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    top: -150,
    right: -150,
    ...(Platform.OS === 'web' && {
      filter: 'blur(80px)',
    }),
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
    bottom: -100,
    left: -100,
    ...(Platform.OS === 'web' && {
      filter: 'blur(80px)',
    }),
  },
  scrollContent: {
    flexGrow: 1,
    ...(Platform.OS === 'web' ? {
      minHeight: '100vh',
    } : {
      minHeight: '100%',
    }),
  },
  keyboardView: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      maxHeight: '100vh',
    }),
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 1,
    ...(Platform.OS === 'web' || isWideScreen ? {
      height: '100vh',
      maxHeight: '100vh',
      paddingVertical: spacing.sm,
    } : {
      paddingVertical: spacing.xl,
    }),
    ...(isWideScreen && {
      maxWidth: '100%',
    }),
    ...(isTablet && {
      maxWidth: 500,
    }),
  },
  twoColumnLayout: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    maxWidth: 1400,
    ...(Platform.OS === 'web' && {
      display: 'flex',
      flexWrap: 'nowrap',
    }),
    ...(isTablet && {
      flexDirection: 'column',
    }),
  },
  mobileRightSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    marginHorizontal: spacing.md,
  },
  leftColumn: {
    flex: 1,
    maxWidth: isTablet ? '100%' : 520,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isWeb || isWideScreen ? (isTablet ? spacing.lg : spacing.md) : spacing.lg,
    ...(isTablet && {
      paddingBottom: spacing.xl,
    }),
  },
  rightSideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isWeb || isWideScreen ? spacing.xl : spacing.xl,
    paddingVertical: isWeb || isWideScreen ? spacing.xl : spacing.xl,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      display: 'flex',
    }),
  },
  rightSideInner: {
    width: '100%',
    maxWidth: isWeb || isWideScreen ? 450 : 500,
    alignItems: 'center',
  },
  adminFeaturesContainer: {
    width: '100%',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: isWeb || isWideScreen ? 64 : 72,
    height: isWeb || isWideScreen ? 64 : 72,
    borderRadius: isWeb || isWideScreen ? 32 : 36,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 0,
  },
  rightSideTitle: {
    ...typography.h3,
    color: colors.textDark,
    fontWeight: '600',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 24 : isTablet ? 26 : 28)
      : (isMobile ? 26 : isTablet ? 28 : 30),
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  rightSideSubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 14 : isTablet ? 15 : 16)
      : (isMobile ? 15 : isTablet ? 16 : 17),
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
    fontWeight: '400',
  },
  featuresList: {
    width: '100%',
    marginBottom: isWeb || isWideScreen ? spacing.xl : spacing.xxl,
    gap: isWeb || isWideScreen ? spacing.sm : spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isWeb || isWideScreen ? spacing.sm : spacing.md,
    paddingVertical: isWeb || isWideScreen ? spacing.xs : spacing.sm,
  },
  featureText: {
    ...typography.body1,
    color: colors.textDark,
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 14 : isTablet ? 15 : 16)
      : (isMobile ? 15 : isTablet ? 16 : 17),
    fontWeight: '400',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    ...typography.h4,
    color: colors.textDark,
    fontWeight: '600',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 18 : isTablet ? 20 : 22)
      : (isMobile ? 20 : isTablet ? 22 : 24),
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 11 : isTablet ? 12 : 12)
      : (isMobile ? 12 : isTablet ? 13 : 13),
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    width: '100%',
    flexShrink: 0,
    position: 'relative',
    marginBottom: isWeb || isWideScreen ? spacing.lg : spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGradient: {
    paddingVertical: isWeb || isWideScreen 
      ? (isMobile ? spacing.md + spacing.sm : isTablet ? spacing.lg : spacing.lg + spacing.sm)
      : (isMobile ? spacing.xl + spacing.md : isTablet ? spacing.xxl : spacing.xxl + spacing.md),
    paddingHorizontal: isMobile ? spacing.lg : spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(20px)',
    }),
  },
  iconContainer: {
    width: isWeb || isWideScreen 
      ? (isMobile ? 60 : isTablet ? 64 : 68)
      : (isMobile ? 80 : isTablet ? 88 : 96),
    height: isWeb || isWideScreen 
      ? (isMobile ? 60 : isTablet ? 64 : 68)
      : (isMobile ? 80 : isTablet ? 88 : 96),
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isWeb || isWideScreen ? spacing.md : spacing.lg,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  iconGlow: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 40px rgba(255, 255, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
    } : {
      shadowColor: '#fff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 20,
      elevation: 15,
    }),
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textDark,
    fontWeight: '700',
    marginBottom: spacing.xs,
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 24 : isTablet ? 26 : 28)
      : (isMobile ? 28 : isTablet ? 32 : 36),
    letterSpacing: -0.5,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 13 : isTablet ? 14 : 15)
      : (isMobile ? 14 : isTablet ? 15 : 16),
    fontWeight: '400',
    letterSpacing: 0,
    paddingHorizontal: spacing.md,
  },
  formContainer: {
    padding: isWeb || isWideScreen 
      ? (isMobile ? spacing.xs : spacing.sm)
      : (isMobile ? spacing.lg : spacing.xl),
    width: '100%',
    flexShrink: 1,
    justifyContent: 'flex-start',
    zIndex: 2,
    ...(Platform.OS === 'web' && {
      overflow: 'visible',
    }),
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 32,
    padding: isWeb || isWideScreen
      ? (isMobile ? spacing.md + spacing.sm : isTablet ? spacing.lg : spacing.lg + spacing.sm)
      : (isMobile ? spacing.xl + spacing.sm : isTablet ? spacing.xxl : spacing.xxl + spacing.md),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(20px)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.15,
      shadowRadius: 40,
      elevation: 20,
    }),
  },
  formHeader: {
    marginBottom: isWeb || isWideScreen ? spacing.md + spacing.sm : spacing.xl + spacing.md,
    alignItems: 'center',
  },
  formTitle: {
    ...typography.h4,
    color: '#1A202C',
    fontWeight: '800',
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 17 : isTablet ? 19 : 21)
      : (isMobile ? 24 : isTablet ? 26 : 28),
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: spacing.xs,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
    }),
  },
  inputGroup: {
    marginBottom: isWeb || isWideScreen ? spacing.md - spacing.xs : spacing.lg,
  },
  inputLabel: {
    ...typography.body2,
    color: colors.textDark,
    fontWeight: '500',
    marginBottom: spacing.sm,
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 13 : isTablet ? 14 : 14)
      : (isMobile ? 14 : isTablet ? 15 : 15),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: isWeb || isWideScreen
      ? (isMobile ? 48 : isTablet ? 50 : 52)
      : (isMobile ? 52 : isTablet ? 54 : 56),
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.2s ease',
    } : {}),
  },
  inputWrapperFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
    }),
  },
  inputIconContainer: {
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.textDark,
    paddingVertical: isWeb || isWideScreen
      ? (isMobile ? spacing.md : spacing.md + 2)
      : (isMobile ? spacing.md : spacing.md + 2),
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 15 : isTablet ? 15 : 16)
      : (isMobile ? 15 : isTablet ? 16 : 16),
    fontWeight: '400',
  },
  passwordInput: {
    paddingRight: spacing.sm,
  },
  eyeIcon: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }),
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: isWeb || isWideScreen ? spacing.md : spacing.lg,
    marginTop: isWeb || isWideScreen ? -spacing.xs : -spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }),
  },
  forgotPasswordText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '500',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 13 : isTablet ? 14 : 14)
      : (isMobile ? 14 : isTablet ? 14 : 15),
    ...(Platform.OS === 'web' && {
      transition: 'color 0.2s ease',
    }),
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: spacing.md,
    width: '100%',
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      ':hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
      },
    } : {}),
  },
  loginButtonDisabled: {
    opacity: 0.7,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
      cursor: 'not-allowed',
      ':hover': {
        transform: 'none',
      },
    }),
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: isWeb || isWideScreen
      ? (isMobile ? spacing.md : isTablet ? spacing.md + 2 : spacing.md + 4)
      : (isMobile ? spacing.md + 4 : spacing.lg),
    gap: spacing.sm,
    minHeight: isWeb || isWideScreen
      ? (isMobile ? 48 : isTablet ? 50 : 52)
      : (isMobile ? 52 : isTablet ? 54 : 56),
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    } : {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    }),
  },
  loginButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '600',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 15 : isTablet ? 15 : 16)
      : (isMobile ? 16 : isTablet ? 16 : 17),
    letterSpacing: 0.2,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: isWeb || isWideScreen
      ? (isMobile ? spacing.md : spacing.md)
      : (isMobile ? spacing.md : spacing.lg),
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  securityIconContainer: {
    width: isWeb || isWideScreen ? 28 : 32,
    height: isWeb || isWideScreen ? 28 : 32,
    borderRadius: isWeb || isWideScreen ? 14 : 16,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityNoticeText: {
    ...typography.caption,
    color: colors.primary,
    flex: 1,
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 12 : isTablet ? 12 : 13)
      : (isMobile ? 12 : isTablet ? 13 : 13),
    fontWeight: '400',
    letterSpacing: 0,
  },
  loginCard: {
    width: '100%',
    maxWidth: isWeb || isWideScreen ? 440 : 480,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: isWeb || isWideScreen
      ? (isMobile ? spacing.xl : isTablet ? spacing.xl + spacing.sm : spacing.xxl)
      : (isMobile ? spacing.xl + spacing.md : isTablet ? spacing.xxl : spacing.xxl + spacing.lg),
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 8,
    }),
  },
  loginCardContent: {
    width: '100%',
  },
  loginTitle: {
    ...typography.h3,
    color: colors.textDark,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'left',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 24 : isTablet ? 26 : 28)
      : (isMobile ? 26 : isTablet ? 28 : 30),
    letterSpacing: -0.3,
  },
  loginSubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'left',
    marginBottom: isWeb || isWideScreen ? spacing.xl : spacing.xl + spacing.sm,
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 14 : isTablet ? 15 : 16)
      : (isMobile ? 15 : isTablet ? 16 : 17),
    fontWeight: '400',
  },
  inputContainer: {
    marginBottom: isWeb || isWideScreen ? spacing.md : spacing.lg,
    width: '100%',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
});

export default AdminLoginScreen;

