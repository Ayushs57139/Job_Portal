import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  TextInput,
  Platform,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const getStyles = (isPhone, isMobile, isTablet, isDesktop, width) => {
  const isWeb = Platform.OS === 'web';
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    mainContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    mainContainerPhone: {
      flexDirection: 'column',
    },
    mainContainerTablet: {
      flexDirection: 'row',
    },
    mainContainerLaptop: {
      flexDirection: 'row',
    },
    leftSide: {
      flex: 1,
    },
    leftSidePhone: {
      flex: 1,
      width: '100%',
    },
    leftSideTablet: {
      flex: 1.2,
    },
    leftContent: {
      flex: 1,
      padding: 48,
      paddingTop: 100,
      justifyContent: 'center',
    },
    leftContentPhone: {
      padding: 20,
      paddingTop: 80,
    },
    leftContentTablet: {
      padding: 32,
      paddingTop: 90,
    },
    leftContentLaptop: {
      padding: 48,
      paddingTop: 100,
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
      fontSize: 28,
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
    welcomeTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: 6,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    welcomeSubtitle: {
      fontSize: 14,
      color: '#64748b',
      textAlign: 'center',
      lineHeight: 20,
    },
    loginFormCard: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 24,
      ...shadows.lg,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    inputGroup: {
      marginBottom: 16,
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
      marginTop: 4,
      marginBottom: 16,
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
    signInButtonDisabled: {
      opacity: 0.6,
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
      marginBottom: 12,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#e2e8f0',
    },
    dividerText: {
      fontSize: 13,
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
      color: '#4f46e5',
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
    rightSide: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 48,
    },
    rightSideTablet: {
      flex: 0.8,
      padding: 32,
    },
    rightSideLaptop: {
      flex: 1,
      padding: 48,
    },
    rightContent: {
      maxWidth: 500,
    },
    rightContentTablet: {
      maxWidth: 400,
    },
    rightTitle: {
      fontSize: 36,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 16,
    },
    rightTitleTablet: {
      fontSize: 30,
      marginBottom: 14,
    },
    rightSubtitle: {
      fontSize: 16,
      color: '#ffffff',
      opacity: 0.9,
      marginBottom: 32,
      lineHeight: 24,
    },
    rightSubtitleTablet: {
      fontSize: 15,
      marginBottom: 28,
      lineHeight: 22,
    },
    featuresList: {
      gap: 20,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    checkIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureText: {
      fontSize: 16,
      color: '#ffffff',
      flex: 1,
    },
    featureTextTablet: {
      fontSize: 15,
    },
  });
};

const LoginScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const isWideScreen = responsive.width > 768;
  const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);
  
  const [userType] = useState('jobseeker');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const userTypeConfig = {
    jobseeker: {
      title: 'Job Seeker Login',
      subtitle: 'Sign in to your job seeker account',
      icon: 'person',
    },
  };

  const handleLogin = async () => {
    // Validate inputs
    const newErrors = {};
    if (!loginId.trim()) newErrors.loginId = 'Please enter your login ID';
    if (!password) newErrors.password = 'Please enter your password';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setGeneralError('');

    try {
      const loginData = {
        loginId: loginId.trim(),
        password,
        userType,
      };

      const response = await api.login(loginData);

      if (response.token) {
        // STRICT VALIDATION: Only allow jobseeker accounts to proceed
        if (response.user && response.user.userType === 'jobseeker') {
          Alert.alert('Success', 'Login successful!');
          
          // Navigate to job seeker dashboard
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserDashboard' }],
          });
        } else {
          // Invalid user type - logout and show error
          await api.logout();
          Alert.alert(
            'Access Denied', 
            'This account is not authorized for jobseeker login. Please use the correct login page.'
          );
        }
      }
    } catch (error) {
      // Parse error message from response
      let errorMessage = error.message || 'Please check your credentials and try again';
      const newErrors = {};
      
      // Check for specific error types
      if (errorMessage.toLowerCase().includes('no account found') || 
          errorMessage.toLowerCase().includes('login id') ||
          errorMessage.toLowerCase().includes('user id') ||
          errorMessage.toLowerCase().includes('email') ||
          errorMessage.toLowerCase().includes('phone')) {
        newErrors.loginId = errorMessage;
        setGeneralError('');
      } else if (errorMessage.toLowerCase().includes('password') || 
                 errorMessage.toLowerCase().includes('incorrect password')) {
        newErrors.password = errorMessage;
        setGeneralError('');
      } else if (errorMessage.toLowerCase().includes('deactivated')) {
        setGeneralError(errorMessage);
        setErrors({});
      } else if (errorMessage.toLowerCase().includes('access denied') ||
                 errorMessage.toLowerCase().includes('not authorized') ||
                 errorMessage.toLowerCase().includes('cannot login')) {
        setGeneralError(errorMessage);
        setErrors({});
      } else {
        setGeneralError(errorMessage);
        setErrors({});
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
      }
      
      // Also show in alert for visibility
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderLeftSide = () => (
    <LinearGradient
      colors={['#ffffff', '#f8fafc', '#f1f5f9']}
      style={[dynamicStyles.leftSide, isPhone && dynamicStyles.leftSidePhone, isTablet && dynamicStyles.leftSideTablet]}
    >
      <View 
        style={[
          dynamicStyles.leftContent,
          isPhone && dynamicStyles.leftContentPhone,
          isTablet && dynamicStyles.leftContentTablet,
          isDesktop && dynamicStyles.leftContentLaptop
        ]}
      >
        {/* Logo */}
        <TouchableOpacity 
          style={dynamicStyles.logoContainer}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Text style={dynamicStyles.logoText}>
            <Text style={dynamicStyles.logoPrimary}>Free</Text>
            <Text style={dynamicStyles.logoJob}>job</Text>
            <Text style={dynamicStyles.logoWala}>wala</Text>
          </Text>
        </TouchableOpacity>

        {/* Header Section */}
        <View style={dynamicStyles.headerSection}>
          <View style={dynamicStyles.iconCircle}>
            <Ionicons name="person" size={isPhone ? 24 : 28} color="#4f46e5" />
          </View>
          <Text style={dynamicStyles.welcomeTitle}>Welcome Back!</Text>
          <Text style={dynamicStyles.welcomeSubtitle}>{userTypeConfig[userType].subtitle}</Text>
        </View>


        {/* Login Form Card */}
        <View style={dynamicStyles.loginFormCard}>
          {/* Login ID Input */}
          <View style={dynamicStyles.inputGroup}>
            <View style={dynamicStyles.labelContainer}>
              <Ionicons name="person-outline" size={isPhone ? 16 : 18} color="#64748b" style={dynamicStyles.labelIcon} />
              <Text style={dynamicStyles.inputLabel}>Login ID</Text>
            </View>
            <View style={[dynamicStyles.inputWrapper, errors.loginId && dynamicStyles.inputWrapperError]}>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter User ID, Email, or Phone Number"
                placeholderTextColor="#94a3b8"
                value={loginId}
                onChangeText={(text) => {
                  setLoginId(text);
                  setErrors({ ...errors, loginId: null });
                  setGeneralError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            {errors.loginId && (
              <View style={dynamicStyles.errorContainer}>
                <Ionicons name="alert-circle" size={isPhone ? 12 : 14} color="#ef4444" />
                <Text style={dynamicStyles.errorText}>{errors.loginId}</Text>
              </View>
            )}
          </View>

          {/* Password Input */}
          <View style={dynamicStyles.inputGroup}>
            <View style={dynamicStyles.labelContainer}>
              <Ionicons name="lock-closed-outline" size={isPhone ? 16 : 18} color="#64748b" style={dynamicStyles.labelIcon} />
              <Text style={dynamicStyles.inputLabel}>Password</Text>
            </View>
            <View style={[dynamicStyles.inputWrapper, errors.password && dynamicStyles.inputWrapperError]}>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({ ...errors, password: null });
                  setGeneralError('');
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={dynamicStyles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={isPhone ? 20 : 22}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <View style={dynamicStyles.errorContainer}>
                <Ionicons name="alert-circle" size={isPhone ? 12 : 14} color="#ef4444" />
                <Text style={dynamicStyles.errorText}>{errors.password}</Text>
              </View>
            )}
          </View>

          {/* General Error Message */}
          {generalError && (
            <View style={dynamicStyles.generalErrorContainer}>
              <Ionicons name="alert-circle" size={isPhone ? 16 : 18} color="#ef4444" />
              <Text style={dynamicStyles.generalErrorText}>{generalError}</Text>
            </View>
          )}

          {/* Sign In Button */}
          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
            style={dynamicStyles.signInButtonWrapper}
          >
            <LinearGradient
              colors={['#4f46e5', '#6366f1']}
              style={[dynamicStyles.signInButton, loading && dynamicStyles.signInButtonDisabled]}
            >
              <Ionicons name="log-in-outline" size={isPhone ? 18 : 20} color="#fff" />
              <Text style={dynamicStyles.signInButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={dynamicStyles.divider}>
            <View style={dynamicStyles.dividerLine} />
            <Text style={dynamicStyles.dividerText}>or</Text>
            <View style={dynamicStyles.dividerLine} />
          </View>

          {/* Create Account */}
          <View style={dynamicStyles.createAccountContainer}>
            <Text style={dynamicStyles.createAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
              <Text style={dynamicStyles.createAccountLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderRightSide = () => (
    <LinearGradient
      colors={['#4f46e5', '#6366f1', '#7c3aed']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        dynamicStyles.rightSide,
        isTablet && dynamicStyles.rightSideTablet,
        isDesktop && dynamicStyles.rightSideLaptop
      ]}
    >
      <View style={[
        dynamicStyles.rightContent,
        isTablet && dynamicStyles.rightContentTablet
      ]}>
        <Text style={[
          dynamicStyles.rightTitle,
          isTablet && dynamicStyles.rightTitleTablet
        ]}>Find Your Dream Job</Text>
        <Text style={[
          dynamicStyles.rightSubtitle,
          isTablet && dynamicStyles.rightSubtitleTablet
        ]}>
          Connect with top employers and discover opportunities that match your skills and aspirations
        </Text>

        <View style={dynamicStyles.featuresList}>
          <View style={dynamicStyles.featureItem}>
            <View style={dynamicStyles.checkIcon}>
              <Ionicons name="checkmark" size={isPhone ? 14 : 16} color="#6366f1" />
            </View>
            <Text style={[
              dynamicStyles.featureText,
              isTablet && dynamicStyles.featureTextTablet
            ]}>Browse thousands of job listings</Text>
          </View>

          <View style={dynamicStyles.featureItem}>
            <View style={dynamicStyles.checkIcon}>
              <Ionicons name="checkmark" size={isPhone ? 14 : 16} color="#6366f1" />
            </View>
            <Text style={[
              dynamicStyles.featureText,
              isTablet && dynamicStyles.featureTextTablet
            ]}>Create professional profiles</Text>
          </View>

          <View style={dynamicStyles.featureItem}>
            <View style={dynamicStyles.checkIcon}>
              <Ionicons name="checkmark" size={isPhone ? 14 : 16} color="#6366f1" />
            </View>
            <Text style={[
              dynamicStyles.featureText,
              isTablet && dynamicStyles.featureTextTablet
            ]}>Get matched with relevant jobs</Text>
          </View>

          <View style={dynamicStyles.featureItem}>
            <View style={dynamicStyles.checkIcon}>
              <Ionicons name="checkmark" size={isPhone ? 14 : 16} color="#6366f1" />
            </View>
            <Text style={[
              dynamicStyles.featureText,
              isTablet && dynamicStyles.featureTextTablet
            ]}>Track application status</Text>
          </View>

          <View style={dynamicStyles.featureItem}>
            <View style={dynamicStyles.checkIcon}>
              <Ionicons name="checkmark" size={isPhone ? 14 : 16} color="#6366f1" />
            </View>
            <Text style={[
              dynamicStyles.featureText,
              isTablet && dynamicStyles.featureTextTablet
            ]}>Receive job recommendations</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={dynamicStyles.container}>
      <View style={[
        dynamicStyles.mainContainer,
        isPhone && dynamicStyles.mainContainerPhone,
        isTablet && dynamicStyles.mainContainerTablet,
        isDesktop && dynamicStyles.mainContainerLaptop
      ]}>
        {renderLeftSide()}
        {isWideScreen && renderRightSide()}
      </View>
    </View>
  );
};

export default LoginScreen;

