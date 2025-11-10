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
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
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
    <View style={[styles.leftSide, isPhone && styles.leftSidePhone, isTablet && styles.leftSideTablet]}>
      <ScrollView 
        style={styles.leftScrollView}
        contentContainerStyle={[
          styles.leftScrollContent,
          isPhone && styles.leftScrollContentPhone,
          isTablet && styles.leftScrollContentTablet,
          isLaptop && styles.leftScrollContentLaptop
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={[styles.logoContainer, isPhone && styles.logoContainerPhone]}>
          <Text style={[styles.logoText, isPhone && styles.logoTextPhone, isTablet && styles.logoTextTablet]}>
            <Text style={styles.logoPrimary}>Free</Text>
            <Text style={styles.logoSecondary}>job</Text>
            <Text style={styles.logoTertiary}>wala</Text>
          </Text>
        </View>

        {/* Header Badge */}
        <View style={[styles.headerBadge, isPhone && styles.headerBadgePhone]}>
          <Ionicons name={userTypeConfig[userType].icon} size={isPhone ? 14 : 16} color="#fff" />
          <Text style={[styles.headerBadgeText, isPhone && styles.headerBadgeTextPhone]}>{userTypeConfig[userType].title}</Text>
        </View>

        {/* Welcome */}
        <Text style={[styles.welcomeTitle, isPhone && styles.welcomeTitlePhone, isTablet && styles.welcomeTitleTablet]}>Welcome Back!</Text>
        <Text style={[styles.welcomeSubtitle, isPhone && styles.welcomeSubtitlePhone]}>{userTypeConfig[userType].subtitle}</Text>


        {/* Login ID Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Login ID</Text>
          <View style={styles.inputWrapper}>
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
          <Text style={styles.inputHelp}>
            You can login with your User ID (JW12345678), Email, or Phone Number
          </Text>
          {errors.loginId && <Text style={styles.errorText}>{errors.loginId}</Text>}
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
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
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* General Error Message */}
        {generalError && (
          <View style={styles.generalErrorContainer}>
            <Text style={styles.generalErrorText}>{generalError}</Text>
          </View>
        )}

        {/* Sign In Button */}
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Create Account */}
        <View style={styles.createAccountContainer}>
          <Text style={styles.createAccountText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.createAccountLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderRightSide = () => (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6']}
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
    backgroundColor: '#ffffff',
  },
  leftSidePhone: {
    flex: 1,
    width: '100%',
  },
  leftSideTablet: {
    flex: 1.2,
  },
  leftScrollView: {
    flex: 1,
  },
  leftScrollContent: {
    padding: 48,
    paddingTop: 32,
  },
  leftScrollContentPhone: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  leftScrollContentTablet: {
    padding: 32,
    paddingTop: 24,
  },
  leftScrollContentLaptop: {
    padding: 48,
    paddingTop: 32,
  },
  
  // Logo
  logoContainer: {
    marginBottom: 24,
  },
  logoContainerPhone: {
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
  },
  logoTextPhone: {
    fontSize: 24,
  },
  logoTextTablet: {
    fontSize: 26,
  },
  logoPrimary: {
    color: '#3b82f6',
  },
  logoSecondary: {
    color: '#1e293b',
  },
  logoTertiary: {
    color: '#1e293b',
  },
  
  // Header Badge
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#475569',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 24,
    gap: 8,
  },
  headerBadgePhone: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  headerBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerBadgeTextPhone: {
    fontSize: 12,
  },
  
  // Welcome
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeTitlePhone: {
    fontSize: 24,
    marginBottom: 6,
  },
  welcomeTitleTablet: {
    fontSize: 28,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  welcomeSubtitlePhone: {
    fontSize: 14,
    marginBottom: 20,
  },
  
  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 6,
  },
  generalErrorContainer: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  generalErrorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  
  // Sign In Button
  signInButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Create Account
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  createAccountText: {
    fontSize: 14,
    color: '#64748b',
  },
  createAccountLink: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
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

