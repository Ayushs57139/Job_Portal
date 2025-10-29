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
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import api from '../../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isWideScreen = width > 768;

const LoginScreen = ({ navigation }) => {
  const [userType, setUserType] = useState('jobseeker');
  const [employerType, setEmployerType] = useState('company');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const userTypeConfig = {
    jobseeker: {
      title: 'Job Seeker Login',
      subtitle: 'Sign in to your job seeker account',
      icon: 'person',
    },
    employer: {
      title: 'Employer Login',
      subtitle: 'Sign in to your employer account',
      icon: 'business',
    },
    superadmin: {
      title: 'Admin Login',
      subtitle: 'Sign in to your admin account',
      icon: 'shield-checkmark',
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

    try {
      const loginData = {
        loginId: loginId.trim(),
        password,
        userType,
      };

      if (userType === 'employer') {
        loginData.employerType = employerType;
      }

      const response = await api.login(loginData);

      if (response.token) {
        Alert.alert('Success', 'Login successful!');
        
        // Navigate to appropriate dashboard
        if (userType === 'jobseeker') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserDashboard' }],
          });
        } else if (userType === 'employer') {
          if (employerType === 'company') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'CompanyDashboard' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'ConsultancyDashboard' }],
            });
          }
        } else if (userType === 'superadmin') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminDashboard' }],
          });
        }
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again');
    } finally {
      setLoading(false);
    }
  };

  const renderLeftSide = () => (
    <View style={styles.leftSide}>
      <ScrollView 
        style={styles.leftScrollView}
        contentContainerStyle={styles.leftScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.logoPrimary}>Free</Text>
            <Text style={styles.logoSecondary}>job</Text>
            <Text style={styles.logoTertiary}>wala</Text>
          </Text>
        </View>

        {/* Header Badge */}
        <View style={styles.headerBadge}>
          <Ionicons name={userTypeConfig[userType].icon} size={16} color="#fff" />
          <Text style={styles.headerBadgeText}>{userTypeConfig[userType].title}</Text>
        </View>

        {/* Welcome */}
        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
        <Text style={styles.welcomeSubtitle}>{userTypeConfig[userType].subtitle}</Text>

        {/* User Type Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, userType === 'jobseeker' && styles.tabActive]}
            onPress={() => setUserType('jobseeker')}
          >
            <Ionicons name="person" size={16} color={userType === 'jobseeker' ? '#fff' : '#64748b'} />
            <Text style={[styles.tabText, userType === 'jobseeker' && styles.tabTextActive]}>
              Job Seeker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, userType === 'employer' && styles.tabActive]}
            onPress={() => setUserType('employer')}
          >
            <Ionicons name="briefcase" size={16} color={userType === 'employer' ? '#fff' : '#64748b'} />
            <Text style={[styles.tabText, userType === 'employer' && styles.tabTextActive]}>
              Employer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, userType === 'superadmin' && styles.tabActive]}
            onPress={() => setUserType('superadmin')}
          >
            <Ionicons name="shield-checkmark" size={16} color={userType === 'superadmin' ? '#fff' : '#64748b'} />
            <Text style={[styles.tabText, userType === 'superadmin' && styles.tabTextActive]}>
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Employer Type Selection */}
        {userType === 'employer' && (
          <View style={styles.employerTypeRow}>
            <TouchableOpacity
              style={[styles.employerTab, employerType === 'company' && styles.employerTabActive]}
              onPress={() => setEmployerType('company')}
            >
              <Text style={[styles.employerTabText, employerType === 'company' && styles.employerTabTextActive]}>
                Company
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.employerTab, employerType === 'consultancy' && styles.employerTabActive]}
              onPress={() => setEmployerType('consultancy')}
            >
              <Text style={[styles.employerTabText, employerType === 'consultancy' && styles.employerTabTextActive]}>
                Consultancy
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
              }}
              secureTextEntry
            />
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

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
      style={styles.rightSide}
    >
      <View style={styles.rightContent}>
        <Text style={styles.rightTitle}>Find Your Dream Job</Text>
        <Text style={styles.rightSubtitle}>
          Connect with top employers and discover opportunities that match your skills and aspirations
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={styles.featureText}>Browse thousands of job listings</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={styles.featureText}>Create professional profiles</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={styles.featureText}>Get matched with relevant jobs</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={styles.featureText}>Track application status</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={styles.featureText}>Receive job recommendations</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
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
    flexDirection: isWideScreen ? 'row' : 'column',
  },
  
  // Left Side Styles
  leftSide: {
    flex: isWideScreen ? 1 : 1,
    backgroundColor: '#ffffff',
  },
  leftScrollView: {
    flex: 1,
  },
  leftScrollContent: {
    padding: isWideScreen ? 48 : 24,
    paddingTop: isWideScreen ? 32 : 24,
  },
  
  // Logo
  logoContainer: {
    marginBottom: 24,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
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
  headerBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Welcome
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  
  // Employer Type
  employerTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  employerTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  employerTabActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  employerTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  employerTabTextActive: {
    color: '#ffffff',
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
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
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
  rightContent: {
    maxWidth: 500,
  },
  rightTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  rightSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 32,
    lineHeight: 24,
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
});

export default LoginScreen;

