import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, shadows } from '../styles/theme';
import api from '../config/api';

const NavigationHeader = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUserFromStorage();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const NavMenuItem = ({ label, route }) => (
    <TouchableOpacity
      style={styles.navItem}
      onPress={() => {
        navigation.navigate(route);
      }}
    >
      <Text style={styles.navItemText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Logo */}
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.logo}>
            <Text style={styles.logoText}>
              <Text style={styles.logoFree}>Free</Text>
              <Text style={styles.logoJob}>job</Text>
              <Text style={styles.logoWala}>wala</Text>
            </Text>
          </TouchableOpacity>

          {/* Navigation Menu - Only show on web/larger screens */}
          {Platform.OS === 'web' && (
            <View style={styles.navMenu}>
              <NavMenuItem label="Jobs" route="Jobs" />
              <NavMenuItem label="Companies" route="Companies" />
              <NavMenuItem label="Services" route="Services" />
              <NavMenuItem label="Blogs" route="Blogs" />
              <NavMenuItem label="Social Updates" route="SocialUpdates" />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.headerActions}>
            {user ? (
              <View style={styles.userMenu}>
                <Text style={styles.userName}>Hi, {user.firstName || user.name}</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
                  <Ionicons name="log-out-outline" size={24} color={colors.textWhite} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.loginButtonText}>Candidate Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.postJobButton}
                  onPress={() => navigation.navigate('PostJob')}
                >
                  <Text style={styles.postJobButtonText}>Post Job</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.employersButton}
                  onPress={() => navigation.navigate('EmployerOptions')}
                >
                  <Text style={styles.employersButtonText}>Employers Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    ...shadows.sm,
  },
  header: {
    backgroundColor: colors.cardBackground,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    ...typography.h3,
    fontWeight: '700',
  },
  logoFree: {
    color: colors.text,
  },
  logoJob: {
    color: colors.secondary,
  },
  logoWala: {
    color: colors.text,
  },
  navMenu: {
    flexDirection: 'row',
    gap: spacing.lg,
    flex: 1,
    justifyContent: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  navItemText: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  loginButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  loginButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  postJobButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  postJobButtonText: {
    color: colors.textWhite,
    fontWeight: '600',
    fontSize: 14,
  },
  employersButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  employersButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  userMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  userName: {
    color: colors.text,
    fontWeight: '600',
  },
  iconButton: {
    padding: spacing.xs,
  },
});

export default NavigationHeader;

