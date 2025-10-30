import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../../components/Admin/AdminLayout';
import api from '../../../config/api';
import { colors, spacing, typography, borderRadius } from '../../../styles/theme';

const NotificationSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enablePushNotifications: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    notificationTypes: {
      jobAlerts: { email: true, push: true, sms: false },
      applicationUpdates: { email: true, push: true, sms: false },
      newJobPosted: { email: true, push: true, sms: false },
      accountActivity: { email: true, push: false, sms: false },
      marketing: { email: false, push: false, sms: false },
    },
    adminNotifications: {
      newUserRegistration: true,
      newJobPosting: true,
      newApplication: false,
      systemErrors: true,
      paymentReceived: true,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.getSettings();
      if (response.success) {
        setSettings(response.settings.notifications);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.updateNotificationSettings(settings);
      if (response.success) {
        Alert.alert('Success', 'Notification settings updated successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  if (loading) {
    return (
      <AdminLayout title="Notification Settings" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Notification Settings" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>Notification Settings</Text>
            <Text style={styles.pageSubtitle}>Manage notification preferences</Text>
          </View>
        </View>

        {/* Global Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Settings</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>Push Notifications</Text>
              <Text style={styles.switchDescription}>
                Enable push notifications across the platform
              </Text>
            </View>
            <Switch
              value={settings.enablePushNotifications}
              onValueChange={(value) => setSettings({ ...settings, enablePushNotifications: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>Email Notifications</Text>
              <Text style={styles.switchDescription}>
                Enable email notifications across the platform
              </Text>
            </View>
            <Switch
              value={settings.enableEmailNotifications}
              onValueChange={(value) => setSettings({ ...settings, enableEmailNotifications: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>SMS Notifications</Text>
              <Text style={styles.switchDescription}>
                Enable SMS notifications across the platform
              </Text>
            </View>
            <Switch
              value={settings.enableSMSNotifications}
              onValueChange={(value) => setSettings({ ...settings, enableSMSNotifications: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* User Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Notification Types</Text>
          
          {/* Job Alerts */}
          <View style={styles.notificationTypeCard}>
            <Text style={styles.notificationTypeTitle}>Job Alerts</Text>
            <View style={styles.notificationChannels}>
              <View style={styles.channelRow}>
                <Text style={styles.channelLabel}>Email</Text>
                <Switch
                  value={settings.notificationTypes.jobAlerts.email}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    notificationTypes: {
                      ...settings.notificationTypes,
                      jobAlerts: { ...settings.notificationTypes.jobAlerts, email: value }
                    }
                  })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
              <View style={styles.channelRow}>
                <Text style={styles.channelLabel}>Push</Text>
                <Switch
                  value={settings.notificationTypes.jobAlerts.push}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    notificationTypes: {
                      ...settings.notificationTypes,
                      jobAlerts: { ...settings.notificationTypes.jobAlerts, push: value }
                    }
                  })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
              <View style={styles.channelRow}>
                <Text style={styles.channelLabel}>SMS</Text>
                <Switch
                  value={settings.notificationTypes.jobAlerts.sms}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    notificationTypes: {
                      ...settings.notificationTypes,
                      jobAlerts: { ...settings.notificationTypes.jobAlerts, sms: value }
                    }
                  })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
          </View>

          {/* Application Updates */}
          <View style={styles.notificationTypeCard}>
            <Text style={styles.notificationTypeTitle}>Application Updates</Text>
            <View style={styles.notificationChannels}>
              <View style={styles.channelRow}>
                <Text style={styles.channelLabel}>Email</Text>
                <Switch
                  value={settings.notificationTypes.applicationUpdates.email}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    notificationTypes: {
                      ...settings.notificationTypes,
                      applicationUpdates: { ...settings.notificationTypes.applicationUpdates, email: value }
                    }
                  })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
              <View style={styles.channelRow}>
                <Text style={styles.channelLabel}>Push</Text>
                <Switch
                  value={settings.notificationTypes.applicationUpdates.push}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    notificationTypes: {
                      ...settings.notificationTypes,
                      applicationUpdates: { ...settings.notificationTypes.applicationUpdates, push: value }
                    }
                  })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
          </View>

          {/* New Job Posted */}
          <View style={styles.notificationTypeCard}>
            <Text style={styles.notificationTypeTitle}>New Job Posted</Text>
            <View style={styles.notificationChannels}>
              <View style={styles.channelRow}>
                <Text style={styles.channelLabel}>Email</Text>
                <Switch
                  value={settings.notificationTypes.newJobPosted.email}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    notificationTypes: {
                      ...settings.notificationTypes,
                      newJobPosted: { ...settings.notificationTypes.newJobPosted, email: value }
                    }
                  })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
              <View style={styles.channelRow}>
                <Text style={styles.channelLabel}>Push</Text>
                <Switch
                  value={settings.notificationTypes.newJobPosted.push}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    notificationTypes: {
                      ...settings.notificationTypes,
                      newJobPosted: { ...settings.notificationTypes.newJobPosted, push: value }
                    }
                  })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
          </View>

          {/* Account Activity */}
          <View style={styles.notificationTypeCard}>
            <Text style={styles.notificationTypeTitle}>Account Activity</Text>
            <View style={styles.notificationChannels}>
              <View style={styles.channelRow}>
                <Text style={styles.channelLabel}>Email</Text>
                <Switch
                  value={settings.notificationTypes.accountActivity.email}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    notificationTypes: {
                      ...settings.notificationTypes,
                      accountActivity: { ...settings.notificationTypes.accountActivity, email: value }
                    }
                  })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
          </View>

          {/* Marketing */}
          <View style={styles.notificationTypeCard}>
            <Text style={styles.notificationTypeTitle}>Marketing</Text>
            <View style={styles.notificationChannels}>
              <View style={styles.channelRow}>
                <Text style={styles.channelLabel}>Email</Text>
                <Switch
                  value={settings.notificationTypes.marketing.email}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    notificationTypes: {
                      ...settings.notificationTypes,
                      marketing: { ...settings.notificationTypes.marketing, email: value }
                    }
                  })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Admin Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Notifications</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>New User Registration</Text>
            <Switch
              value={settings.adminNotifications.newUserRegistration}
              onValueChange={(value) => setSettings({
                ...settings,
                adminNotifications: { ...settings.adminNotifications, newUserRegistration: value }
              })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>New Job Posting</Text>
            <Switch
              value={settings.adminNotifications.newJobPosting}
              onValueChange={(value) => setSettings({
                ...settings,
                adminNotifications: { ...settings.adminNotifications, newJobPosting: value }
              })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>New Application</Text>
            <Switch
              value={settings.adminNotifications.newApplication}
              onValueChange={(value) => setSettings({
                ...settings,
                adminNotifications: { ...settings.adminNotifications, newApplication: value }
              })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>System Errors</Text>
            <Switch
              value={settings.adminNotifications.systemErrors}
              onValueChange={(value) => setSettings({
                ...settings,
                adminNotifications: { ...settings.adminNotifications, systemErrors: value }
              })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Payment Received</Text>
            <Switch
              value={settings.adminNotifications.paymentReceived}
              onValueChange={(value) => setSettings({
                ...settings,
                adminNotifications: { ...settings.adminNotifications, paymentReceived: value }
              })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="notifications" size={20} color={colors.white} />
              <Text style={styles.saveButtonText}>Save Notification Settings</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body1,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  pageTitle: {
    ...typography.h2,
    color: colors.text,
  },
  pageSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchLabel: {
    ...typography.subtitle1,
    color: colors.text,
  },
  switchDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notificationTypeCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  notificationTypeTitle: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  notificationChannels: {
    gap: spacing.sm,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default NotificationSettingsScreen;

