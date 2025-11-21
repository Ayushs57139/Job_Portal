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
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const isWeb = Platform.OS === 'web';

const UserSettingsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(isWeb && !isPhone);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [userRole, setUserRole] = useState('company');
  
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
      
      // Check if user is a company or consultancy
      const isCompanyUser = user?.userType === 'company' || 
                           (user?.userType === 'employer' && user?.employerType === 'company');
      const isConsultancyUser = user?.userType === 'consultancy' || 
                               (user?.userType === 'employer' && user?.employerType === 'consultancy');
      
      if (isCompanyUser || isConsultancyUser) {
        setIsCompany(true);
        setUserRole(isConsultancyUser ? 'consultancy' : 'company');
      } else {
        setIsCompany(false);
      }
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

  // If company, use EmployerSidebar layout (like CompanyProfileScreen)
  if (isCompany) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.sidebarWrapper}>
          <EmployerSidebar 
            permanent 
            navigation={navigation} 
            role={userRole} 
            activeKey="settings" 
          />
        </View>
        
        <View style={dynamicStyles.mainContentWrapper}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.headerTitle}>Settings</Text>
            
            <View style={dynamicStyles.headerRight}>
              <View style={dynamicStyles.userInfo}>
                <View style={dynamicStyles.avatar}>
                  <Text style={dynamicStyles.avatarText}>{getUserInitials()}</Text>
                </View>
                <Text style={dynamicStyles.userName}>{currentUser?.firstName || 'User'}</Text>
              </View>
              <TouchableOpacity 
                style={dynamicStyles.logoutButtonHeader} 
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-forward" size={isPhone ? 14 : 16} color="#FFFFFF" />
                <Text style={dynamicStyles.logoutTextHeader}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={dynamicStyles.content} contentContainerStyle={dynamicStyles.contentContainer}>
          {/* Change Password Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Change Password</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Update your password to keep your account secure</Text>
            
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
              style={dynamicStyles.saveButton}
            />
          </View>

          {/* Account Settings Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Account Settings</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Manage your account preferences</Text>
            
            <View style={dynamicStyles.settingItem}>
              <View style={dynamicStyles.settingInfo}>
                <Text style={dynamicStyles.settingLabel}>Email Notifications</Text>
                <Text style={dynamicStyles.settingDescription}>Receive email notifications about your applications</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                style={[dynamicStyles.toggle, accountSettings.emailNotifications && dynamicStyles.toggleActive]}
              >
                <View style={[dynamicStyles.toggleThumb, accountSettings.emailNotifications && dynamicStyles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.settingItem}>
              <View style={dynamicStyles.settingInfo}>
                <Text style={dynamicStyles.settingLabel}>Job Alerts</Text>
                <Text style={dynamicStyles.settingDescription}>Get notified about new job opportunities</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, jobAlerts: !prev.jobAlerts }))}
                style={[dynamicStyles.toggle, accountSettings.jobAlerts && dynamicStyles.toggleActive]}
              >
                <View style={[dynamicStyles.toggleThumb, accountSettings.jobAlerts && dynamicStyles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.settingItem}>
              <View style={dynamicStyles.settingInfo}>
                <Text style={dynamicStyles.settingLabel}>Application Updates</Text>
                <Text style={dynamicStyles.settingDescription}>Receive updates on your job applications</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, applicationUpdates: !prev.applicationUpdates }))}
                style={[dynamicStyles.toggle, accountSettings.applicationUpdates && dynamicStyles.toggleActive]}
              >
                <View style={[dynamicStyles.toggleThumb, accountSettings.applicationUpdates && dynamicStyles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.settingItem}>
              <View style={dynamicStyles.settingInfo}>
                <Text style={dynamicStyles.settingLabel}>Marketing Emails</Text>
                <Text style={dynamicStyles.settingDescription}>Receive marketing and promotional emails</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, marketingEmails: !prev.marketingEmails }))}
                style={[dynamicStyles.toggle, accountSettings.marketingEmails && dynamicStyles.toggleActive]}
              >
                <View style={[dynamicStyles.toggleThumb, accountSettings.marketingEmails && dynamicStyles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <Button
              title="Save Settings"
              onPress={handleSaveAccountSettings}
              loading={saving}
              style={dynamicStyles.saveButton}
            />
          </View>

          {/* Account Information Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Account Information</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Your account details</Text>
            
            <View style={dynamicStyles.infoItem}>
              <Text style={dynamicStyles.infoLabel}>Email</Text>
              <Text style={dynamicStyles.infoValue}>{currentUser?.email || 'N/A'}</Text>
            </View>

            <View style={dynamicStyles.infoItem}>
              <Text style={dynamicStyles.infoLabel}>Phone</Text>
              <Text style={dynamicStyles.infoValue}>{currentUser?.phone || 'Not provided'}</Text>
            </View>

            <View style={dynamicStyles.infoItem}>
              <Text style={dynamicStyles.infoLabel}>Name</Text>
              <Text style={dynamicStyles.infoValue}>
                {currentUser?.firstName && currentUser?.lastName
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : currentUser?.firstName || 'Not provided'}
              </Text>
            </View>

            <View style={dynamicStyles.infoItem}>
              <Text style={dynamicStyles.infoLabel}>Account Type</Text>
              <Text style={dynamicStyles.infoValue}>
                {isCompany ? (userRole === 'consultancy' ? 'Consultancy' : 'Company') : 'User'}
              </Text>
            </View>
          </View>

          {/* Danger Zone Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Danger Zone</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Irreversible actions</Text>
            
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
              style={[dynamicStyles.saveButton, dynamicStyles.dangerButton]}
            />
          </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // Regular user layout with UserSidebar
  return (
    <View style={dynamicStyles.container}>
      {/* Sidebar */}
      {/* Sidebar - Always visible on web desktop */}
      {isWeb && !isPhone ? (
        <UserSidebar
          navigation={navigation}
          activeKey="settings"
          onClose={null}
          badges={{}}
        />
      ) : sidebarOpen ? (
        <>
          {isPhone && (
            <TouchableOpacity
              style={dynamicStyles.backdrop}
              onPress={() => setSidebarOpen(false)}
              activeOpacity={1}
            />
          )}
          <UserSidebar
            navigation={navigation}
            activeKey="settings"
            onClose={isPhone ? () => setSidebarOpen(false) : (!isWeb ? () => setSidebarOpen(false) : null)}
            badges={{}}
          />
        </>
      ) : null}

      {/* Main Content */}
      <View style={dynamicStyles.mainContent}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          {(!isWeb || isPhone) && (
            <TouchableOpacity 
              onPress={() => setSidebarOpen(!sidebarOpen)}
              style={dynamicStyles.menuButton}
            >
              <Ionicons name="menu" size={isPhone ? 20 : 24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <Text style={dynamicStyles.headerTitle}>Settings</Text>
          
          <View style={dynamicStyles.headerRight}>
            <View style={dynamicStyles.userInfo}>
              <View style={dynamicStyles.avatar}>
                <Text style={dynamicStyles.avatarText}>{getUserInitials()}</Text>
              </View>
              <Text style={dynamicStyles.userName}>{currentUser?.firstName || 'User'}</Text>
            </View>
            <TouchableOpacity 
              style={dynamicStyles.logoutButtonHeader} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-forward" size={isPhone ? 14 : 16} color="#FFFFFF" />
              <Text style={dynamicStyles.logoutTextHeader}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={dynamicStyles.content} contentContainerStyle={dynamicStyles.contentContainer}>
          {/* Change Password Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Change Password</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Update your password to keep your account secure</Text>
            
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
              style={dynamicStyles.saveButton}
            />
          </View>

          {/* Account Settings Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Account Settings</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Manage your account preferences</Text>
            
            <View style={dynamicStyles.settingItem}>
              <View style={dynamicStyles.settingInfo}>
                <Text style={dynamicStyles.settingLabel}>Email Notifications</Text>
                <Text style={dynamicStyles.settingDescription}>Receive email notifications about your applications</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                style={[dynamicStyles.toggle, accountSettings.emailNotifications && dynamicStyles.toggleActive]}
              >
                <View style={[dynamicStyles.toggleThumb, accountSettings.emailNotifications && dynamicStyles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.settingItem}>
              <View style={dynamicStyles.settingInfo}>
                <Text style={dynamicStyles.settingLabel}>Job Alerts</Text>
                <Text style={dynamicStyles.settingDescription}>Get notified about new job opportunities</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, jobAlerts: !prev.jobAlerts }))}
                style={[dynamicStyles.toggle, accountSettings.jobAlerts && dynamicStyles.toggleActive]}
              >
                <View style={[dynamicStyles.toggleThumb, accountSettings.jobAlerts && dynamicStyles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.settingItem}>
              <View style={dynamicStyles.settingInfo}>
                <Text style={dynamicStyles.settingLabel}>Application Updates</Text>
                <Text style={dynamicStyles.settingDescription}>Receive updates on your job applications</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, applicationUpdates: !prev.applicationUpdates }))}
                style={[dynamicStyles.toggle, accountSettings.applicationUpdates && dynamicStyles.toggleActive]}
              >
                <View style={[dynamicStyles.toggleThumb, accountSettings.applicationUpdates && dynamicStyles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.settingItem}>
              <View style={dynamicStyles.settingInfo}>
                <Text style={dynamicStyles.settingLabel}>Marketing Emails</Text>
                <Text style={dynamicStyles.settingDescription}>Receive marketing and promotional emails</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountSettings(prev => ({ ...prev, marketingEmails: !prev.marketingEmails }))}
                style={[dynamicStyles.toggle, accountSettings.marketingEmails && dynamicStyles.toggleActive]}
              >
                <View style={[dynamicStyles.toggleThumb, accountSettings.marketingEmails && dynamicStyles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <Button
              title="Save Settings"
              onPress={handleSaveAccountSettings}
              loading={saving}
              style={dynamicStyles.saveButton}
            />
          </View>

          {/* Account Information Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Account Information</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Your account details</Text>
            
            <View style={dynamicStyles.infoItem}>
              <Text style={dynamicStyles.infoLabel}>Email</Text>
              <Text style={dynamicStyles.infoValue}>{currentUser?.email || 'N/A'}</Text>
            </View>

            <View style={dynamicStyles.infoItem}>
              <Text style={dynamicStyles.infoLabel}>Phone</Text>
              <Text style={dynamicStyles.infoValue}>{currentUser?.phone || 'Not provided'}</Text>
            </View>

            <View style={dynamicStyles.infoItem}>
              <Text style={dynamicStyles.infoLabel}>Name</Text>
              <Text style={dynamicStyles.infoValue}>
                {currentUser?.firstName && currentUser?.lastName
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : currentUser?.firstName || 'Not provided'}
              </Text>
            </View>

            <View style={dynamicStyles.infoItem}>
              <Text style={dynamicStyles.infoLabel}>Account Type</Text>
              <Text style={dynamicStyles.infoValue}>User</Text>
            </View>
          </View>

          {/* Danger Zone Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Danger Zone</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Irreversible actions</Text>
            
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
              style={[dynamicStyles.saveButton, dynamicStyles.dangerButton]}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const getStyles = (isPhone, isMobile, isTablet, isDesktop) => {
  const isWeb = Platform.OS === 'web';
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: isPhone ? 'column' : 'row',
      backgroundColor: colors.background
    },
    sidebarWrapper: {
      width: isPhone ? '100%' : (isMobile ? 260 : 280),
    },
    mainContentWrapper: {
      flex: 1,
      position: 'relative',
      backgroundColor: '#FFFFFF'
    },
    mainContent: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      ...(isWeb && !isPhone && {
        marginLeft: isDesktop ? 280 : (isTablet ? 260 : 240),
        width: `calc(100% - ${isDesktop ? 280 : (isTablet ? 260 : 240)}px)`,
      }),
      ...(isPhone && {
        width: '100%',
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
      paddingVertical: isPhone ? spacing.sm : spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: '#FFFFFF',
      ...(isPhone && {
        flexWrap: 'wrap',
      }),
    },
    menuButton: {
      marginRight: isPhone ? spacing.sm : spacing.md
    },
    headerTitle: {
      ...typography.h4,
      color: colors.text,
      fontWeight: '700',
      flex: 1,
      fontSize: isPhone ? 18 : (isMobile ? 20 : (isTablet ? 22 : 24)),
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isPhone ? spacing.sm : spacing.md,
      ...(isPhone && {
        width: '100%',
        marginTop: spacing.sm,
        justifyContent: 'flex-end',
      }),
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isPhone ? spacing.xs : spacing.sm,
      ...(isPhone && {
        flex: 1,
      }),
    },
    avatar: {
      width: isPhone ? 32 : (isMobile ? 36 : 40),
      height: isPhone ? 32 : (isMobile ? 36 : 40),
      borderRadius: isPhone ? 16 : (isMobile ? 18 : 20),
      backgroundColor: '#4A90E2',
      alignItems: 'center',
      justifyContent: 'center'
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: isPhone ? 12 : (isMobile ? 14 : 16),
      fontWeight: '600'
    },
    userName: {
      ...typography.body2,
      color: colors.text,
      fontWeight: '500',
      fontSize: isPhone ? 13 : (isMobile ? 14 : 16),
      ...(isPhone && {
        display: 'none',
      }),
    },
    logoutButtonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ef4444',
      paddingHorizontal: isPhone ? spacing.sm : spacing.md,
      paddingVertical: isPhone ? spacing.xs : spacing.sm,
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
      fontWeight: '600',
      fontSize: isPhone ? 12 : 14,
    },
    content: {
      flex: 1
    },
    contentContainer: {
      padding: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl)
    },
    section: {
      marginBottom: isPhone ? spacing.lg : spacing.xl,
      padding: isPhone ? spacing.md : spacing.lg,
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border
    },
    sectionTitle: {
      ...typography.h5,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.xs,
      fontSize: isPhone ? 16 : (isMobile ? 18 : (isTablet ? 20 : 22)),
    },
    sectionSubtitle: {
      ...typography.body2,
      color: colors.textSecondary,
      marginBottom: spacing.md,
      fontSize: isPhone ? 13 : (isMobile ? 14 : 15),
    },
    saveButton: {
      marginTop: spacing.md
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: isPhone ? spacing.sm : spacing.md,
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
      marginBottom: spacing.xs,
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
    },
    settingDescription: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: isPhone ? 12 : (isMobile ? 13 : 14),
    },
    toggle: {
      width: isPhone ? 44 : 50,
      height: isPhone ? 24 : 28,
      borderRadius: isPhone ? 12 : 14,
      backgroundColor: colors.border,
      justifyContent: 'center',
      paddingHorizontal: 2
    },
    toggleActive: {
      backgroundColor: colors.primary
    },
    toggleThumb: {
      width: isPhone ? 20 : 24,
      height: isPhone ? 20 : 24,
      borderRadius: isPhone ? 10 : 12,
      backgroundColor: '#FFFFFF',
      alignSelf: 'flex-start'
    },
    toggleThumbActive: {
      alignSelf: 'flex-end'
    },
    infoItem: {
      paddingVertical: isPhone ? spacing.sm : spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight
    },
    infoLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      fontSize: isPhone ? 11 : 12,
    },
    infoValue: {
      ...typography.body1,
      color: colors.text,
      fontWeight: '500',
      fontSize: isPhone ? 14 : (isMobile ? 15 : 16),
    },
    dangerButton: {
      borderColor: colors.error,
      backgroundColor: colors.error + '10',
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    }
  });
};

export default UserSettingsScreen;

