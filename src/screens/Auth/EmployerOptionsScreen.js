import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const EmployerOptionsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.logoPrimary}>Free </Text>
            <Text style={styles.logoSecondary}>job </Text>
            <Text style={styles.logoTertiary}>wala</Text>
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Choose Your Employer Type</Text>
        <Text style={styles.subtitle}>
          Select whether you're a company or consultancy to access the appropriate login and registration options
        </Text>

        {/* Cards Container */}
        <View style={styles.cardsContainer}>
          {/* Company Card */}
          <View style={styles.card}>
            <LinearGradient
              colors={['#2c3e50', '#34495e']}
              style={styles.cardGradient}
            >
              {/* Icon */}
              <View style={styles.iconCircle}>
                <Ionicons name="business" size={40} color="#fff" />
              </View>

              {/* Title */}
              <Text style={styles.cardTitle}>Company</Text>
              <Text style={styles.cardDescription}>
                For businesses looking to hire talent directly for their organization
              </Text>

              {/* Buttons */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login', { userType: 'employer', employerType: 'company' })}
              >
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={styles.loginButtonText}>Company Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate('CompanyRegister')}
              >
                <Ionicons name="person-add-outline" size={18} color="#2c3e50" />
                <Text style={styles.registerButtonText}>Company Registration</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Consultancy Card */}
          <View style={styles.card}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.cardGradient}
            >
              {/* Icon */}
              <View style={styles.iconCircle}>
                <Ionicons name="people" size={40} color="#fff" />
              </View>

              {/* Title */}
              <Text style={styles.cardTitle}>Consultancy</Text>
              <Text style={styles.cardDescription}>
                For recruitment agencies and consulting firms providing hiring services
              </Text>

              {/* Buttons */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login', { userType: 'employer', employerType: 'consultancy' })}
              >
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={styles.loginButtonText}>Consultancy Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate('ConsultancyRegister')}
              >
                <Ionicons name="person-add-outline" size={18} color="#6366f1" />
                <Text style={styles.registerButtonText}>Consultancy Registration</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
    alignSelf: 'flex-start',
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    width: '100%',
    maxWidth: 1000,
    flexDirection: isWeb && width > 768 ? 'row' : 'column',
    gap: 24,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.lg,
  },
  cardGradient: {
    padding: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    opacity: 0.9,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    gap: 8,
  },
  registerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default EmployerOptionsScreen;

