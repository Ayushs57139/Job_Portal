import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AuthModal = ({ 
  visible, 
  onClose, 
  userType = 'jobseeker', // jobseeker, employer, consultancy
  onSuccess 
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '', // for employer/consultancy
    agreeTerms: false
  });

  const getUserTypeConfig = () => {
    switch (userType) {
      case 'employer':
        return {
          title: 'Employer',
          icon: 'business',
          color: '#6366F1',
          gradient: ['#6366F1', '#8B5CF6'],
          loginTitle: 'Employer Login',
          registerTitle: 'Employer Registration',
          benefits: [
            'Post unlimited jobs',
            'Access to candidate database',
            'Advanced analytics',
            'Priority support'
          ]
        };
      case 'consultancy':
        return {
          title: 'Consultancy',
          icon: 'briefcase',
          color: '#EC4899',
          gradient: ['#EC4899', '#F43F5E'],
          loginTitle: 'Consultancy Login',
          registerTitle: 'Consultancy Registration',
          benefits: [
            'Manage multiple clients',
            'Bulk job posting',
            'Candidate placement tracking',
            'Commission management'
          ]
        };
      default: // jobseeker
        return {
          title: 'Job Seeker',
          icon: 'person',
          color: '#10B981',
          gradient: ['#10B981', '#059669'],
          loginTitle: 'Job Seeker Login',
          registerTitle: 'Job Seeker Registration',
          benefits: [
            'Browse thousands of jobs',
            'Create professional profile',
            'Get job recommendations',
            'Track applications'
          ]
        };
    }
  };

  const config = getUserTypeConfig();

  const handleLogin = async () => {
    // Implement login logic
    setLoading(true);
    try {
      // API call here
      console.log('Login:', loginData, userType);
      setTimeout(() => {
        setLoading(false);
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
    }
  };

  const handleRegister = async () => {
    // Implement registration logic
    if (registerData.password !== registerData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!registerData.agreeTerms) {
      alert('Please agree to terms and conditions');
      return;
    }
    
    setLoading(true);
    try {
      // API call here
      console.log('Register:', registerData, userType);
      setTimeout(() => {
        setLoading(false);
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error) {
      setLoading(false);
      console.error('Registration error:', error);
    }
  };

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email or Phone</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email or phone"
            value={loginData.email}
            onChangeText={(text) => setLoginData({ ...loginData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={loginData.password}
            onChangeText={(text) => setLoginData({ ...loginData, password: text })}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: config.color }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="log-in-outline" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(false)}>
        <Text style={styles.switchButtonText}>
          Don't have an account? <Text style={[styles.switchButtonLink, { color: config.color }]}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegisterForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>First Name *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="First name"
              value={registerData.firstName}
              onChangeText={(text) => setRegisterData({ ...registerData, firstName: text })}
            />
          </View>
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Last Name *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Last name"
              value={registerData.lastName}
              onChangeText={(text) => setRegisterData({ ...registerData, lastName: text })}
            />
          </View>
        </View>
      </View>

      {(userType === 'employer' || userType === 'consultancy') && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {userType === 'employer' ? 'Company Name' : 'Consultancy Name'} *
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="business-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={userType === 'employer' ? 'Enter company name' : 'Enter consultancy name'}
              value={registerData.companyName}
              onChangeText={(text) => setRegisterData({ ...registerData, companyName: text })}
            />
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={registerData.email}
            onChangeText={(text) => setRegisterData({ ...registerData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={registerData.phone}
            onChangeText={(text) => setRegisterData({ ...registerData, phone: text })}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            value={registerData.password}
            onChangeText={(text) => setRegisterData({ ...registerData, password: text })}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            value={registerData.confirmPassword}
            onChangeText={(text) => setRegisterData({ ...registerData, confirmPassword: text })}
            secureTextEntry={!showPassword}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => setRegisterData({ ...registerData, agreeTerms: !registerData.agreeTerms })}
      >
        <View style={[styles.checkbox, registerData.agreeTerms && styles.checkboxChecked]}>
          {registerData.agreeTerms && <Ionicons name="checkmark" size={16} color="#FFF" />}
        </View>
        <Text style={styles.checkboxLabel}>
          I agree to the <Text style={[styles.link, { color: config.color }]}>Terms & Conditions</Text> and{' '}
          <Text style={[styles.link, { color: config.color }]}>Privacy Policy</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: config.color }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="person-add-outline" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(true)}>
        <Text style={styles.switchButtonText}>
          Already have an account? <Text style={[styles.switchButtonLink, { color: config.color }]}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={[styles.modalHeader, { backgroundColor: config.color }]}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name={config.icon} size={24} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>
                    {isLogin ? config.loginTitle : config.registerTitle}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {isLogin ? 'Welcome back!' : 'Create your account'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={styles.modalBody}>
              {isLogin ? renderLoginForm() : renderRegisterForm()}
            </View>

            {/* Footer Benefits */}
            {isLogin && (
              <View style={styles.modalFooter}>
                <Text style={styles.footerTitle}>Why join us?</Text>
                <View style={styles.benefitsList}>
                  {config.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={16} color={config.color} />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
    maxHeight: 400,
  },
  formContainer: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#9CA3AF',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  switchButtonLink: {
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  link: {
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default AuthModal;
