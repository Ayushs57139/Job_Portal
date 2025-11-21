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
// Header component removed - admin app doesn't need main site header
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

  const renderContent = () => {
    const gradientColors = gradientAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        ['#667eea', '#764ba2', '#f093fb'],
        ['#764ba2', '#667eea', '#4facfe'],
      ],
    });

    return (
      <>
        {/* Animated Background Gradient */}
        <Animated.View style={[dynamicStyles.animatedBackground, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Decorative circles */}
          <View style={dynamicStyles.decorativeCircle1} />
          <View style={dynamicStyles.decorativeCircle2} />
          <View style={dynamicStyles.decorativeCircle3} />
        </Animated.View>

        {/* Header Section */}
        <Animated.View
          style={[
            dynamicStyles.headerCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.95)', 'rgba(118, 75, 162, 0.95)', 'rgba(240, 147, 251, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={dynamicStyles.headerGradient}
          >
            <View style={dynamicStyles.iconContainer}>
              <View style={dynamicStyles.iconGlow}>
                <Ionicons 
                  name="shield-checkmark" 
                  size={isWeb || isWideScreen 
                    ? (isMobile ? 34 : isTablet ? 38 : 42)
                    : (isMobile ? 52 : isTablet ? 58 : 64)} 
                  color={colors.textWhite} 
                />
              </View>
            </View>
            <Text style={dynamicStyles.headerTitle}>Admin Portal</Text>
            <Text style={dynamicStyles.headerSubtitle}>
              Secure access to manage your platform
            </Text>
          </LinearGradient>
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
              <View style={dynamicStyles.inputWrapper}>
                <Ionicons name="person-outline" size={isMobile ? 20 : 22} color={colors.primary} style={dynamicStyles.inputIcon} />
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="User ID or Email"
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
              <View style={dynamicStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={isMobile ? 20 : 22} color={colors.primary} style={dynamicStyles.inputIcon} />
                <TextInput
                  style={dynamicStyles.passwordInput}
                  placeholder="Password"
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
                    size={isMobile ? 20 : 22}
                    color={password ? colors.primary : colors.textSecondary}
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
              <Ionicons name="key-outline" size={14} color={colors.primary} />
              <Text style={dynamicStyles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[dynamicStyles.loginButton, loading && dynamicStyles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={dynamicStyles.loginButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textWhite} size="small" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={isMobile ? 20 : 22} color={colors.textWhite} />
                    <Text style={dynamicStyles.loginButtonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={isMobile ? 18 : 20} color={colors.textWhite} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Security Notice */}
            <View style={dynamicStyles.securityNotice}>
              <View style={dynamicStyles.securityIconContainer}>
                <Ionicons 
                  name="shield-checkmark" 
                  size={isWeb || isWideScreen 
                    ? (isMobile ? 16 : isTablet ? 17 : 18)
                    : (isMobile ? 18 : 20)} 
                  color={colors.info} 
                />
              </View>
              <Text style={dynamicStyles.securityNoticeText}>
                This is a secure admin area. All login attempts are monitored.
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
                size={isWeb || isWideScreen ? 38 : 48} 
                color="rgba(255, 255, 255, 0.9)" 
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
                  size={isWeb || isWideScreen ? 18 : 20} 
                  color="rgba(255, 255, 255, 0.9)" 
                />
                <Text style={dynamicStyles.featureText}>User Management</Text>
              </View>
              <View style={dynamicStyles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={isWeb || isWideScreen ? 18 : 20} 
                  color="rgba(255, 255, 255, 0.9)" 
                />
                <Text style={dynamicStyles.featureText}>Job Posting Control</Text>
              </View>
              <View style={dynamicStyles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={isWeb || isWideScreen ? 18 : 20} 
                  color="rgba(255, 255, 255, 0.9)" 
                />
                <Text style={dynamicStyles.featureText}>Analytics & Reports</Text>
              </View>
              <View style={dynamicStyles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={isWeb || isWideScreen ? 18 : 20} 
                  color="rgba(255, 255, 255, 0.9)" 
                />
                <Text style={dynamicStyles.featureText}>System Configuration</Text>
              </View>
              <View style={dynamicStyles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={isWeb || isWideScreen ? 18 : 20} 
                  color="rgba(255, 255, 255, 0.9)" 
                />
                <Text style={dynamicStyles.featureText}>Security Monitoring</Text>
              </View>
            </View>

            <View style={dynamicStyles.statsContainer}>
              <View style={dynamicStyles.statItem}>
                <Ionicons 
                  name="people" 
                  size={isWeb || isWideScreen ? 20 : 24} 
                  color="rgba(255, 255, 255, 0.8)" 
                />
                <Text style={dynamicStyles.statNumber}>24/7</Text>
                <Text style={dynamicStyles.statLabel}>Support</Text>
              </View>
              <View style={dynamicStyles.statItem}>
                <Ionicons 
                  name="shield-checkmark" 
                  size={isWeb || isWideScreen ? 20 : 24} 
                  color="rgba(255, 255, 255, 0.8)" 
                />
                <Text style={dynamicStyles.statNumber}>100%</Text>
                <Text style={dynamicStyles.statLabel}>Secure</Text>
              </View>
              <View style={dynamicStyles.statItem}>
                <Ionicons 
                  name="speedometer" 
                  size={isWeb || isWideScreen ? 20 : 24} 
                  color="rgba(255, 255, 255, 0.8)" 
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

  const content = (
    <View style={dynamicStyles.contentWrapper}>
      {isWeb || isWideScreen ? (
        <View style={dynamicStyles.twoColumnLayout}>
          <View style={dynamicStyles.leftColumn}>
            {renderContent()}
          </View>
          {renderRightSideContent()}
        </View>
      ) : (
        renderContent()
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
        {isWeb || isWideScreen ? (
          content
        ) : (
          <ScrollView
            contentContainerStyle={dynamicStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {content}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const getStyles = (isMobile, isTablet, isWideScreen, isWeb) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
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
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    top: -100,
    right: -100,
    ...(Platform.OS === 'web' && {
      filter: 'blur(60px)',
    }),
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(118, 75, 162, 0.1)',
    bottom: -50,
    left: -50,
    ...(Platform.OS === 'web' && {
      filter: 'blur(60px)',
    }),
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(240, 147, 251, 0.1)',
    top: '40%',
    right: '10%',
    ...(Platform.OS === 'web' && {
      filter: 'blur(60px)',
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
    }),
  },
  leftColumn: {
    flex: 1,
    maxWidth: 520,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isWeb || isWideScreen ? spacing.md : spacing.lg,
  },
  rightSideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isWeb || isWideScreen ? spacing.lg : spacing.xl,
    paddingVertical: isWeb || isWideScreen ? spacing.md : spacing.xl,
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
    width: isWeb || isWideScreen ? 80 : 100,
    height: isWeb || isWideScreen ? 80 : 100,
    borderRadius: isWeb || isWideScreen ? 40 : 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isWeb || isWideScreen ? spacing.md : spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    }),
  },
  rightSideTitle: {
    ...typography.h3,
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 22 : isTablet ? 24 : 26)
      : (isMobile ? 28 : isTablet ? 32 : 36),
    marginBottom: isWeb || isWideScreen ? spacing.xs : spacing.sm,
    textAlign: 'center',
    letterSpacing: 0.5,
    ...(Platform.OS === 'web' && {
      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    }),
  },
  rightSideSubtitle: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 13 : isTablet ? 14 : 15)
      : (isMobile ? 15 : isTablet ? 16 : 17),
    textAlign: 'center',
    marginBottom: isWeb || isWideScreen ? spacing.lg : spacing.xl,
    lineHeight: isWeb || isWideScreen ? 20 : 24,
    fontWeight: '500',
    ...(Platform.OS === 'web' && {
      textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
    }),
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
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 13 : isTablet ? 14 : 15)
      : (isMobile ? 15 : isTablet ? 16 : 17),
    fontWeight: '600',
    flex: 1,
    ...(Platform.OS === 'web' && {
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    }),
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: isWeb || isWideScreen ? spacing.md : spacing.lg,
    paddingTop: isWeb || isWideScreen ? spacing.lg : spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    ...typography.h4,
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 16 : isTablet ? 18 : 20)
      : (isMobile ? 20 : isTablet ? 22 : 24),
    ...(Platform.OS === 'web' && {
      textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
    }),
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 10 : isTablet ? 11 : 12)
      : (isMobile ? 12 : isTablet ? 13 : 14),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    ...(Platform.OS === 'web' && {
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
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
    width: '100%',
    flexShrink: 0,
    position: 'relative',
    marginBottom: isWeb || isWideScreen ? spacing.md : spacing.xl,
    borderRadius: 0,
    overflow: 'hidden',
    ...(Platform.OS === 'web' || isWideScreen ? {
      height: isMobile ? 130 : isTablet ? 140 : 150,
      maxHeight: isMobile ? 130 : isTablet ? 140 : 150,
    } : {
      minHeight: isMobile ? 180 : isTablet ? 200 : 220,
    }),
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
      ? (isMobile ? 65 : isTablet ? 72 : 78)
      : (isMobile ? 100 : isTablet ? 110 : 120),
    height: isWeb || isWideScreen 
      ? (isMobile ? 65 : isTablet ? 72 : 78)
      : (isMobile ? 100 : isTablet ? 110 : 120),
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isWeb || isWideScreen ? spacing.xs : spacing.lg,
    position: 'relative',
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
    color: colors.textWhite,
    fontWeight: '900',
    marginBottom: isWeb || isWideScreen ? 1 : spacing.sm,
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 20 : isTablet ? 22 : 24)
      : (isMobile ? 32 : isTablet ? 36 : 40),
    letterSpacing: 1.2,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    ...(Platform.OS === 'web' ? {
      textShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
    } : {
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 4 },
      textShadowRadius: 8,
    }),
  },
  headerSubtitle: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.98)',
    textAlign: 'center',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 10 : isTablet ? 11 : 12)
      : (isMobile ? 14 : isTablet ? 15 : 16),
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    ...(Platform.OS === 'web' && {
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    }),
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isWeb || isWideScreen ? spacing.sm : spacing.md,
    gap: spacing.xs,
  },
  inputLabelText: {
    ...typography.subtitle2,
    color: '#2D3748',
    fontWeight: '700',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 12 : isTablet ? 12.5 : 13)
      : (isMobile ? 14 : isTablet ? 14.5 : 15),
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.md,
    minHeight: isWeb || isWideScreen
      ? (isMobile ? 46 : isTablet ? 48 : 50)
      : (isMobile ? 56 : isTablet ? 58 : 60),
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  inputWrapperFilled: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 2.5,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.2), 0 0 0 4px rgba(37, 99, 235, 0.08)',
      transform: 'translateY(-1px)',
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
    color: '#1A202C',
    paddingVertical: isWeb || isWideScreen
      ? (isMobile ? spacing.sm + 2 : spacing.md)
      : (isMobile ? spacing.md : spacing.md + 2),
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 14 : isTablet ? 14.5 : 15)
      : (isMobile ? 15.5 : isTablet ? 16 : 16.5),
    fontWeight: '500',
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
    fontWeight: '700',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 12 : isTablet ? 12.5 : 13)
      : (isMobile ? 13.5 : isTablet ? 14 : 14.5),
    ...(Platform.OS === 'web' && {
      transition: 'color 0.2s ease',
    }),
  },
  loginButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: isWeb || isWideScreen ? spacing.md - spacing.xs : spacing.lg,
    width: '100%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4), 0 4px 8px rgba(102, 126, 234, 0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5), 0 6px 12px rgba(102, 126, 234, 0.4)',
      },
      ':active': {
        transform: 'translateY(0px)',
      },
    } : {
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 12,
    }),
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
    paddingVertical: isWeb || isWideScreen
      ? (isMobile ? spacing.md - spacing.xs : isTablet ? spacing.md : spacing.md + spacing.xs)
      : (isMobile ? spacing.md + spacing.sm : spacing.lg),
    gap: spacing.md,
    minHeight: isWeb || isWideScreen
      ? (isMobile ? 46 : isTablet ? 48 : 50)
      : (isMobile ? 56 : isTablet ? 58 : 60),
  },
  loginButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 14 : isTablet ? 15 : 16)
      : (isMobile ? 16 : isTablet ? 17 : 18),
    letterSpacing: 0.8,
    ...(Platform.OS === 'web' && {
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    }),
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: isWeb || isWideScreen ? spacing.md - spacing.xs : spacing.xl,
    padding: isWeb || isWideScreen
      ? (isMobile ? spacing.sm : spacing.md - spacing.xs)
      : (isMobile ? spacing.md + spacing.xs : spacing.lg),
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: 16,
    gap: isWeb || isWideScreen ? spacing.sm : spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
    }),
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
    color: '#1E40AF',
    flex: 1,
    fontSize: isWeb || isWideScreen
      ? (isMobile ? 11 : isTablet ? 11.5 : 12)
      : (isMobile ? 12.5 : isTablet ? 13 : 13.5),
    lineHeight: isWeb || isWideScreen
      ? (isMobile ? 14 : isTablet ? 15 : 16)
      : (isMobile ? 17 : isTablet ? 18 : 19),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default AdminLoginScreen;

