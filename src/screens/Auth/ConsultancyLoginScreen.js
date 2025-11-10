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

const ConsultancyLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Validate inputs
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Please enter your email';
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
        email: email.trim(),
        password,
      };

      const response = await api.consultancyLogin(loginData);

      if (response.token) {
        // STRICT VALIDATION: Only allow consultancy accounts to proceed
        if (response.user && response.user.userType === 'consultancy') {
          Alert.alert('Success', 'Login successful!');
          
          // Navigate to consultancy dashboard
          navigation.reset({
            index: 0,
            routes: [{ name: 'ConsultancyDashboard' }],
          });
        } else {
          // Invalid user type - logout and show error
          await api.logout();
          Alert.alert(
            'Access Denied', 
            'This account is not authorized for consultancy login. Please use the correct login page.'
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
          <Ionicons name="people" size={16} color="#fff" />
          <Text style={styles.headerBadgeText}>Consultancy Login</Text>
        </View>

        {/* Welcome */}
        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
        <Text style={styles.welcomeSubtitle}>Sign in to your consultancy account</Text>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: null });
                setGeneralError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
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
          <Text style={styles.createAccountText}>Don't have a consultancy account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ConsultancyRegister')}>
            <Text style={styles.createAccountLink}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Employer Options */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('EmployerOptions')}
        >
          <Ionicons name="arrow-back" size={16} color="#6366f1" />
          <Text style={styles.backButtonText}>Back to Employer Options</Text>
        </TouchableOpacity>
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
        <Text style={styles.rightTitle}>Recruitment Excellence</Text>
        <Text style={styles.rightSubtitle}>
          Manage client requirements, source candidates, and streamline your recruitment process
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={styles.featureText}>Access premium candidate pool</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={styles.featureText}>Manage multiple clients</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={styles.featureText}>Track placements efficiently</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={styles.featureText}>Advanced search and filters</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color="#6366f1" />
            </View>
            <Text style={styles.featureText}>Performance analytics</Text>
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
    backgroundColor: '#6366f1',
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
    marginBottom: 20,
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
  
  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backButtonText: {
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

export default ConsultancyLoginScreen;

