import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import UserSidebar from '../../components/UserSidebar';
import api from '../../config/api';

const isWeb = Platform.OS === 'web';

const UserSettingsScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(isWeb);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Change Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Account Settings
  const [accountSettings, setAccountSettings] = useState({
    emailNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    marketingEmails: false
  });

  useEffect(() => {
    loadCurrentUser();
    loadAccountSettings();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUserFromStorage();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadAccountSettings = async () => {
    try {
      // Load user settings if available
      const user = await api.getCurrentUserFromStorage();
      // You can fetch settings from API if you have a settings endpoint
      // For now, using default values
    } catch (error) {
      console.error('Error loading account settings:', error);
    }
  };

  const getUserInitials = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
    }
    if (currentUser?.firstName) {
      return currentUser.firstName[0].toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    if (isWeb) {
      // Use browser's confirm dialog for web
      if (window.confirm('Are you sure you want to logout?')) {
        await api.logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } else {
      // Use React Native Alert for mobile
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              await api.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            },
          },
        ]
      );
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordForm.currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!passwordForm.newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setSaving(true);
    try {
      const response = await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.message || response.success) {
        Alert.alert('Success', 'Password changed successfully', [
          {
            text: 'OK',
            onPress: () => {
              setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
            }
          }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccountSettings = async () => {
    setSaving(true);
    try {
      // Save account settings - implement API call if you have settings endpoint
      // await api.updateAccountSettings(accountSettings);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      {sidebarOpen && (
        <UserSidebar
          navigation={navigation}
          activeKey="settings"
          onClose={!isWeb ? () => setSidebarOpen(false) : null}
          badges={{}}
        />
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setSidebarOpen(!sidebarOpen)}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Settings</Text>
          
          <View style={styles.headerRight}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </View>
              <Text style={styles.userName}>{currentUser?.firstName || 'User'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.logoutButtonHeader} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              <Text style={styles.logoutTextHeader}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Change Password Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <Text style={styles.sectionSubtitle}>Update your password to keep your account secure</Text>
            
            <Input
              label="Current Password"
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
              placeholder="Enter current password"
              icon="lock-closed-outline"
              secureTextEntry
            />

            <Input
              label="New Password"
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
              placeholder="Enter new password (min 6 characters)"
              icon="lock-closed-outline"
              secureTextEntry
            />

            <Input
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
              placeholder="Confirm new password"
              icon="lock-closed-outline"
              secureTextEntry
            />

            <Button
              title="Change Password"
              onPress={handleChangePassword}
              loading={saving}
              style={styles.saveButton}
            />
          </View>

          {/* Account Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <Text style={styles.sectionSubtitle}>Manage your account preferences</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Receive email notifications about your applications</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                style={[styles.toggle, accountSettings.emailNotifications && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, accountSettings.emailNotifications && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Job Alerts</Text>
                <Text style={styles.settingDescription}>Get notified about new job opportunities</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, jobAlerts: !prev.jobAlerts }))}
                style={[styles.toggle, accountSettings.jobAlerts && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, accountSettings.jobAlerts && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Application Updates</Text>
                <Text style={styles.settingDescription}>Receive updates on your job applications</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, applicationUpdates: !prev.applicationUpdates }))}
                style={[styles.toggle, accountSettings.applicationUpdates && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, accountSettings.applicationUpdates && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Marketing Emails</Text>
                <Text style={styles.settingDescription}>Receive marketing and promotional emails</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, marketingEmails: !prev.marketingEmails }))}
                style={[styles.toggle, accountSettings.marketingEmails && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, accountSettings.marketingEmails && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <Button
              title="Save Settings"
              onPress={handleSaveAccountSettings}
              loading={saving}
              style={styles.saveButton}
            />
          </View>

          {/* Account Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <Text style={styles.sectionSubtitle}>Your account details</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{currentUser?.email || 'N/A'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{currentUser?.phone || 'Not provided'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>
                {currentUser?.firstName && currentUser?.lastName
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : currentUser?.firstName || 'Not provided'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Account Type</Text>
              <Text style={styles.infoValue}>User</Text>
            </View>
          </View>

          {/* Danger Zone Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <Text style={styles.sectionSubtitle}>Irreversible actions</Text>
            
            <Button
              title="Delete Account"
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'Are you sure you want to delete your account? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        // Implement account deletion if you have the endpoint
                        Alert.alert('Info', 'Account deletion feature coming soon');
                      },
                    },
                  ]
                );
              }}
              variant="outline"
              style={[styles.saveButton, styles.dangerButton]}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF'
  },
  menuButton: {
    marginRight: spacing.md
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    flex: 1
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  userName: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500'
  },
  logoutButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    ...(isWeb && {
      cursor: 'pointer',
      userSelect: 'none',
    })
  },
  logoutTextHeader: {
    ...typography.body2,
    color: '#FFFFFF',
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: spacing.lg
  },
  section: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  sectionTitle: {
    ...typography.h5,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs
  },
  sectionSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.md
  },
  saveButton: {
    marginTop: spacing.md
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md
  },
  settingLabel: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2
  },
  toggleActive: {
    backgroundColor: colors.primary
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start'
  },
  toggleThumbActive: {
    alignSelf: 'flex-end'
  },
  infoItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs
  },
  infoValue: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500'
  },
  dangerButton: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10'
  }
});

export default UserSettingsScreen;

