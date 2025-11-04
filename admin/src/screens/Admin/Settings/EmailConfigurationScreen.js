import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AdminLayout from '../../../components/Admin/AdminLayout';
import api from '../../../config/api';
import { colors, spacing, typography, borderRadius } from '../../../styles/theme';

const EmailConfigurationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [settings, setSettings] = useState({
    provider: 'smtp',
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      username: '',
      password: '',
    },
    fromEmail: '',
    fromName: '',
    replyToEmail: '',
    enableEmailNotifications: true,
    dailyEmailLimit: 1000,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.getSettings();
      if (response.success) {
        setSettings(response.settings.email);
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
      const response = await api.updateEmailSettings(settings);
      if (response.success) {
        Alert.alert('Success', 'Email settings updated successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      setTesting(true);
      const response = await api.sendTestEmail(testEmail);
      if (response.success) {
        Alert.alert('Success', `Test email sent to ${testEmail}`);
        setTestEmail('');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      Alert.alert('Error', 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  if (loading) {
    return (
      <AdminLayout title="Email Configuration" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Email Configuration" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>Email Configuration</Text>
            <Text style={styles.pageSubtitle}>Configure email delivery settings</Text>
          </View>
        </View>

        {/* Email Provider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Provider</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Provider</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.provider}
                onValueChange={(value) => setSettings({ ...settings, provider: value })}
                style={styles.picker}
              >
                <Picker.Item label="SMTP" value="smtp" />
                <Picker.Item label="SendGrid" value="sendgrid" />
                <Picker.Item label="Mailgun" value="mailgun" />
                <Picker.Item label="Amazon SES" value="ses" />
              </Picker>
            </View>
          </View>
        </View>

        {/* SMTP Configuration */}
        {settings.provider === 'smtp' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SMTP Configuration</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>SMTP Host</Text>
              <TextInput
                style={styles.input}
                value={settings.smtp.host}
                onChangeText={(text) => setSettings({ ...settings, smtp: { ...settings.smtp, host: text } })}
                placeholder="smtp.gmail.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SMTP Port</Text>
              <TextInput
                style={styles.input}
                value={String(settings.smtp.port)}
                onChangeText={(text) => setSettings({ ...settings, smtp: { ...settings.smtp, port: parseInt(text) || 587 } })}
                placeholder="587"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Use SSL/TLS</Text>
              <Switch
                value={settings.smtp.secure}
                onValueChange={(value) => setSettings({ ...settings, smtp: { ...settings.smtp, secure: value } })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SMTP Username</Text>
              <TextInput
                style={styles.input}
                value={settings.smtp.username}
                onChangeText={(text) => setSettings({ ...settings, smtp: { ...settings.smtp, username: text } })}
                placeholder="your-email@gmail.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SMTP Password</Text>
              <TextInput
                style={styles.input}
                value={settings.smtp.password}
                onChangeText={(text) => setSettings({ ...settings, smtp: { ...settings.smtp, password: text } })}
                placeholder="Enter password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
            </View>
          </View>
        )}

        {/* Email Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>From Email</Text>
            <TextInput
              style={styles.input}
              value={settings.fromEmail}
              onChangeText={(text) => setSettings({ ...settings, fromEmail: text })}
              placeholder="noreply@freejobwala.com"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>From Name</Text>
            <TextInput
              style={styles.input}
              value={settings.fromName}
              onChangeText={(text) => setSettings({ ...settings, fromName: text })}
              placeholder="Free Job Wala"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reply-To Email</Text>
            <TextInput
              style={styles.input}
              value={settings.replyToEmail}
              onChangeText={(text) => setSettings({ ...settings, replyToEmail: text })}
              placeholder="support@freejobwala.com"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>Enable Email Notifications</Text>
              <Text style={styles.switchDescription}>
                Allow platform to send email notifications
              </Text>
            </View>
            <Switch
              value={settings.enableEmailNotifications}
              onValueChange={(value) => setSettings({ ...settings, enableEmailNotifications: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Daily Email Limit</Text>
            <TextInput
              style={styles.input}
              value={String(settings.dailyEmailLimit)}
              onChangeText={(text) => setSettings({ ...settings, dailyEmailLimit: parseInt(text) || 1000 })}
              placeholder="1000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Test Email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Email Configuration</Text>
          <Text style={styles.description}>
            Send a test email to verify your configuration
          </Text>
          
          <View style={styles.testEmailRow}>
            <TextInput
              style={[styles.input, styles.testEmailInput]}
              value={testEmail}
              onChangeText={setTestEmail}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={[styles.testButton, testing && styles.testButtonDisabled]}
              onPress={handleTestEmail}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="send" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
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
              <Ionicons name="mail" size={20} color={colors.white} />
              <Text style={styles.saveButtonText}>Save Email Settings</Text>
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
  description: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.subtitle2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.text,
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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
    marginBottom: spacing.xs,
  },
  switchDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  testEmailRow: {
    flexDirection: 'row',
  },
  testEmailInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  testButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: colors.textLight,
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

export default EmailConfigurationScreen;

