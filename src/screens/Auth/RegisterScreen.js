import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../config/api';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    whatsappAvailable: false,
    referralSource: '',
    privacyPolicy: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  const updateFormData = (key, value) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: null });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.privacyPolicy) {
      newErrors.privacyPolicy = 'You must agree to the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        userType: 'jobseeker',
        referralSource: formData.referralSource,
      };

      if (formData.whatsappAvailable && formData.phone) {
        registrationData.whatsappNumber = formData.phone;
      }

      const response = await api.register(registrationData);

      if (response.token) {
        Alert.alert(
          'Success',
          'Registration successful! Redirecting to your dashboard...',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'UserDashboard' }],
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Please check your details and try again'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Candidate Registration</Text>
          <Text style={styles.headerSubtitle}>Let's Get Started, Tell Us about Yourself</Text>
        </LinearGradient>

      <View style={styles.formContainer}>
        <Input
          label="First Name"
          value={formData.firstName}
          onChangeText={(text) => updateFormData('firstName', text)}
          placeholder="Enter your first name"
          icon="person-outline"
          error={errors.firstName}
        />

        <Input
          label="Last Name"
          value={formData.lastName}
          onChangeText={(text) => updateFormData('lastName', text)}
          placeholder="Enter your last name"
          icon="person-outline"
          error={errors.lastName}
        />

        <Input
          label="Phone Number"
          value={formData.phone}
          onChangeText={(text) => updateFormData('phone', text)}
          placeholder="10-digit mobile number"
          icon="call-outline"
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => updateFormData('whatsappAvailable', !formData.whatsappAvailable)}
        >
          <Ionicons
            name={formData.whatsappAvailable ? 'checkbox' : 'square-outline'}
            size={24}
            color={formData.whatsappAvailable ? colors.primary : colors.textSecondary}
          />
          <Text style={styles.checkboxLabel}>Available on WhatsApp</Text>
        </TouchableOpacity>

        <Input
          label="Email ID"
          value={formData.email}
          onChangeText={(text) => updateFormData('email', text)}
          placeholder="your.email@example.com"
          icon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Password"
          value={formData.password}
          onChangeText={(text) => updateFormData('password', text)}
          placeholder="Create a secure password"
          icon="lock-closed-outline"
          secureTextEntry
          error={errors.password}
        />

        <Input
          label="Date of Birth"
          value={formData.dateOfBirth}
          onChangeText={(text) => updateFormData('dateOfBirth', text)}
          placeholder="dd-mmm-yyyy (e.g., 12-oct-2000)"
          icon="calendar-outline"
          error={errors.dateOfBirth}
        />

        <View style={styles.genderContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderButtons}>
            {['Male', 'Female', 'Other'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderButton,
                  formData.gender === gender && styles.genderButtonActive,
                ]}
                onPress={() => updateFormData('gender', gender)}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === gender && styles.genderButtonTextActive,
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => updateFormData('privacyPolicy', !formData.privacyPolicy)}
        >
          <Ionicons
            name={formData.privacyPolicy ? 'checkbox' : 'square-outline'}
            size={24}
            color={formData.privacyPolicy ? colors.primary : colors.textSecondary}
          />
          <Text style={styles.checkboxLabel}>I agree to the Privacy Policy</Text>
        </TouchableOpacity>
        {errors.privacyPolicy && (
          <Text style={styles.errorText}>{errors.privacyPolicy}</Text>
        )}

        <Button
          title="Register"
          onPress={handleRegister}
          loading={loading}
          style={styles.registerButton}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login here</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textWhite,
    textAlign: 'center',
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
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  checkboxLabel: {
    ...typography.body2,
    color: colors.text,
  },
  genderContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  genderButtonText: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
  },
  genderButtonTextActive: {
    color: colors.textWhite,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  registerButton: {
    marginTop: spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  loginText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;

