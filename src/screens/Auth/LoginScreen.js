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

const LoginScreen = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  
  // Responsive breakpoints
  const isPhone = width <= 768;
  const isTablet = width > 768 && width <= 1024;
  const isLaptop = width > 1024;
  const isWideScreen = width > 768;
  const isMobile = width <= 600;
  
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
      const errorMessage = error.message || 'Please check your credentials and try again';
      setGeneralError(errorMessage);
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderLeftSide = () => (
    <LinearGradient
      colors={['#ffffff', '#f8fafc', '#f1f5f9']}
      style={[styles.leftSide, isPhone && styles.leftSidePhone, isTablet && styles.leftSideTablet]}
    >
      <View 
        style={[
          styles.leftContent,
          isPhone && styles.leftContentPhone,
          isTablet && styles.leftContentTablet,
          isLaptop && styles.leftContentLaptop
        ]}
      >
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
            <Ionicons name="person" size={28} color="#4f46e5" />
          </View>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>{userTypeConfig[userType].subtitle}</Text>
        </View>


        {/* Login Form Card */}
        <View style={styles.loginFormCard}>
          {/* Login ID Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="person-outline" size={18} color="#64748b" style={styles.labelIcon} />
              <Text style={styles.inputLabel}>Login ID</Text>
            </View>
            <View style={[styles.inputWrapper, errors.loginId && styles.inputWrapperError]}>
              <TextInput
                style={styles.input}
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
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={14} color="#ef4444" />
                <Text style={styles.errorText}>{errors.loginId}</Text>
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
                  setGeneralError('');
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
          {generalError && (
            <View style={styles.generalErrorContainer}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          )}

          {/* Sign In Button */}
          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
            style={styles.signInButtonWrapper}
          >
            <LinearGradient
              colors={['#4f46e5', '#6366f1']}
              style={[styles.signInButton, loading && styles.signInButtonDisabled]}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.signInButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Create Account */}
          <View style={styles.createAccountContainer}>
            <Text style={styles.createAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
              <Text style={styles.createAccountLink}>Create Account</Text>
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
        styles.rightSide,
        isTablet && styles.rightSideTablet,
        isLaptop && styles.rightSideLaptop
      ]}
    >
      <View style={[
        styles.rightContent,
        isTablet && styles.rightContentTablet
      ]}>
        <Text style={[
          styles.rightTitle,
          isTablet && styles.rightTitleTablet
        ]}>Find Your Dream Job</Text>
        <Text style={[
          styles.rightSubtitle,
          isTablet && styles.rightSubtitleTablet
        ]}>
          Connect with top employers and discover opportunities that match your skills and aspirations
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={[
              styles.featureText,
              isTablet && styles.featureTextTablet
            ]}>Browse thousands of job listings</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={[
              styles.featureText,
              isTablet && styles.featureTextTablet
            ]}>Create professional profiles</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={[
              styles.featureText,
              isTablet && styles.featureTextTablet
            ]}>Get matched with relevant jobs</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={[
              styles.featureText,
              isTablet && styles.featureTextTablet
            ]}>Track application status</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={[
              styles.featureText,
              isTablet && styles.featureTextTablet
            ]}>Receive job recommendations</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <View style={[
        styles.mainContainer,
        isPhone && styles.mainContainerPhone,
        isTablet && styles.mainContainerTablet,
        isLaptop && styles.mainContainerLaptop
      ]}>
        {renderLeftSide()}
        {isWideScreen && renderRightSide()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  
  // Left Side Styles
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
  
  // Logo
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
  
  // Header Section
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
  
  // Welcome
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
  
  // Login Form Card
  loginFormCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  // Input Groups
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
  inputHelp: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
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
  
  // Sign In Button
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
  
  // Divider
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
  
  // Create Account
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
  
  // Right Side Styles
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

export default LoginScreen;

