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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';

const AdminSMTPSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  const [settings, setSettings] = useState({
    provider: 'smtp',
    smtp: {
      host: '',
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

  const [showPassword, setShowPassword] = useState(false);

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.getSMTPSettings();
      
      if (response.success && response.data.email) {
        setSettings({
          provider: response.data.email.provider || 'smtp',
          smtp: {
            host: response.data.email.smtp?.host || '',
            port: response.data.email.smtp?.port || 587,
            secure: response.data.email.smtp?.secure || false,
            username: response.data.email.smtp?.username || '',
            password: '', // Don't populate password for security
          },
          fromEmail: response.data.email.fromEmail || '',
          fromName: response.data.email.fromName || '',
          replyToEmail: response.data.email.replyToEmail || '',
          enableEmailNotifications: response.data.email.enableEmailNotifications !== false,
          dailyEmailLimit: response.data.email.dailyEmailLimit || 1000,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load SMTP settings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSettings();
  };

  const handleSave = async () => {
    try {
      // Validation
      if (settings.provider === 'smtp') {
        if (!settings.smtp.host.trim()) {
          Alert.alert('Validation Error', 'Please enter SMTP host');
          return;
        }
        if (!settings.smtp.username.trim()) {
          Alert.alert('Validation Error', 'Please enter SMTP username');
          return;
        }
      }

      if (!settings.fromEmail.trim()) {
        Alert.alert('Validation Error', 'Please enter from email address');
        return;
      }

      if (!settings.fromName.trim()) {
        Alert.alert('Validation Error', 'Please enter from name');
        return;
      }

      setSaving(true);

      // Only include password if it's been changed
      const dataToSend = {
        provider: settings.provider,
        smtp: {
          host: settings.smtp.host.trim(),
          port: parseInt(settings.smtp.port) || 587,
          secure: settings.smtp.secure,
          username: settings.smtp.username.trim(),
        },
        fromEmail: settings.fromEmail.trim(),
        fromName: settings.fromName.trim(),
        replyToEmail: settings.replyToEmail.trim(),
        enableEmailNotifications: settings.enableEmailNotifications,
        dailyEmailLimit: parseInt(settings.dailyEmailLimit) || 1000,
      };

      // Only include password if it's been updated
      if (settings.smtp.password) {
        dataToSend.smtp.password = settings.smtp.password;
      }

      const response = await api.updateSMTPSettings(dataToSend);

      if (response.success) {
        Alert.alert('Success', 'SMTP settings updated successfully');
        loadSettings(); // Reload to clear password field
      } else {
        Alert.alert('Error', response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      if (!testEmail.trim()) {
        Alert.alert('Validation Error', 'Please enter a test email address');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(testEmail.trim())) {
        Alert.alert('Validation Error', 'Please enter a valid email address');
        return;
      }

      setTesting(true);

      const response = await api.testSMTPConnection(testEmail.trim());

      if (response.success) {
        Alert.alert(
          'Success',
          `Test email sent successfully to ${testEmail}. Please check your inbox.`
        );
        setTestEmail('');
      } else {
        Alert.alert('Error', response.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error testing email:', error);
      Alert.alert('Error', error.message || 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset SMTP settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
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
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <AdminLayout
        title="SMTP Settings"
        activeScreen="AdminSMTPSettings"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="SMTP Settings"
      activeScreen="AdminSMTPSettings"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>SMTP Settings</Text>
            <Text style={styles.pageSubtitle}>
              Configure email server settings for sending emails
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleResetSettings}
            >
              <Ionicons name="refresh-outline" size={20} color={colors.error} />
              <Text style={[styles.secondaryButtonText, { color: colors.error }]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#FFF" />
                  <Text style={styles.primaryButtonText}>Save Settings</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Email Provider Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email Provider</Text>
            <Text style={styles.sectionSubtitle}>
              Select your email service provider
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Provider</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={settings.provider}
                  onValueChange={(value) =>
                    setSettings({ ...settings, provider: value })
                  }
                  style={styles.pickerInput}
                >
                  <Picker.Item label="SMTP" value="smtp" />
                  <Picker.Item label="SendGrid (Coming Soon)" value="sendgrid" enabled={false} />
                  <Picker.Item label="Mailgun (Coming Soon)" value="mailgun" enabled={false} />
                  <Picker.Item label="AWS SES (Coming Soon)" value="ses" enabled={false} />
                </Picker>
              </View>
            </View>
          </View>

          {/* SMTP Configuration */}
          {settings.provider === 'smtp' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SMTP Configuration</Text>
              <Text style={styles.sectionSubtitle}>
                Enter your SMTP server details
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SMTP Host *</Text>
                <TextInput
                  style={styles.input}
                  value={settings.smtp.host}
                  onChangeText={(text) =>
                    setSettings({
                      ...settings,
                      smtp: { ...settings.smtp, host: text },
                    })
                  }
                  placeholder="smtp.gmail.com"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <Text style={styles.hint}>
                  Common: Gmail (smtp.gmail.com), Outlook (smtp.office365.com)
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SMTP Port *</Text>
                <TextInput
                  style={styles.input}
                  value={String(settings.smtp.port)}
                  onChangeText={(text) =>
                    setSettings({
                      ...settings,
                      smtp: { ...settings.smtp, port: parseInt(text) || 587 },
                    })
                  }
                  placeholder="587"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />
                <Text style={styles.hint}>
                  Common ports: 587 (TLS), 465 (SSL), 25 (Non-secure)
                </Text>
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.switchLabel}>Use SSL/TLS</Text>
                  <Text style={styles.switchHint}>
                    Enable secure connection (recommended)
                  </Text>
                </View>
                <Switch
                  value={settings.smtp.secure}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      smtp: { ...settings.smtp, secure: value },
                    })
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SMTP Username *</Text>
                <TextInput
                  style={styles.input}
                  value={settings.smtp.username}
                  onChangeText={(text) =>
                    setSettings({
                      ...settings,
                      smtp: { ...settings.smtp, username: text },
                    })
                  }
                  placeholder="your-email@domain.com"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SMTP Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={settings.smtp.password}
                    onChangeText={(text) =>
                      setSettings({
                        ...settings,
                        smtp: { ...settings.smtp, password: text },
                      })
                    }
                    placeholder="Enter password to update"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.hint}>
                  For Gmail, use App Password instead of your regular password
                </Text>
              </View>
            </View>
          )}

          {/* Email Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email Settings</Text>
            <Text style={styles.sectionSubtitle}>
              Configure sender information and limits
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>From Email *</Text>
              <TextInput
                style={styles.input}
                value={settings.fromEmail}
                onChangeText={(text) =>
                  setSettings({ ...settings, fromEmail: text })
                }
                placeholder="noreply@jobwala.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text style={styles.hint}>
                Email address that will appear as the sender
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>From Name *</Text>
              <TextInput
                style={styles.input}
                value={settings.fromName}
                onChangeText={(text) =>
                  setSettings({ ...settings, fromName: text })
                }
                placeholder="JobWala"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.hint}>
                Name that will appear as the sender
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reply-To Email</Text>
              <TextInput
                style={styles.input}
                value={settings.replyToEmail}
                onChangeText={(text) =>
                  setSettings({ ...settings, replyToEmail: text })
                }
                placeholder="support@jobwala.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text style={styles.hint}>
                Email address for replies (optional)
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Daily Email Limit</Text>
              <TextInput
                style={styles.input}
                value={String(settings.dailyEmailLimit)}
                onChangeText={(text) =>
                  setSettings({
                    ...settings,
                    dailyEmailLimit: parseInt(text) || 1000,
                  })
                }
                placeholder="1000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
              <Text style={styles.hint}>
                Maximum number of emails to send per day
              </Text>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.switchLabel}>Enable Email Notifications</Text>
                <Text style={styles.switchHint}>
                  Send automated email notifications to users
                </Text>
              </View>
              <Switch
                value={settings.enableEmailNotifications}
                onValueChange={(value) =>
                  setSettings({ ...settings, enableEmailNotifications: value })
                }
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>

          {/* Test Email Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Email Configuration</Text>
            <Text style={styles.sectionSubtitle}>
              Send a test email to verify your SMTP settings
            </Text>

            <View style={styles.testEmailContainer}>
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
                style={styles.testButton}
                onPress={handleTestEmail}
                disabled={testing || !testEmail.trim()}
              >
                {testing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={20} color="#FFF" />
                    <Text style={styles.testButtonText}>Send Test</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                Make sure to save your settings before sending a test email
              </Text>
            </View>
          </View>

          {/* Help Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Need Help?</Text>
            <View style={styles.helpCard}>
              <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Gmail Setup Guide</Text>
                <Text style={styles.helpText}>
                  1. Enable 2-Step Verification in your Google Account{'\n'}
                  2. Go to Security → App passwords{'\n'}
                  3. Generate an app password for "Mail"{'\n'}
                  4. Use the generated password in SMTP Password field
                </Text>
              </View>
            </View>

            <View style={styles.helpCard}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.success} />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Security Best Practices</Text>
                <Text style={styles.helpText}>
                  • Always use SSL/TLS for secure connections{'\n'}
                  • Use app-specific passwords instead of account passwords{'\n'}
                  • Set appropriate daily email limits to prevent abuse{'\n'}
                  • Regularly test your email configuration
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    minWidth: 140,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#FFF',
  },
  picker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFF',
  },
  pickerInput: {
    height: 48,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  switchHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  testEmailContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  testEmailInput: {
    flex: 1,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    minWidth: 120,
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  helpText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default AdminSMTPSettingsScreen;
