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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../../components/Admin/AdminLayout';
import api from '../../../config/api';
import { colors, spacing, typography, borderRadius } from '../../../styles/theme';
import { useResponsive } from '../../../utils/responsive';

const SecuritySettingsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enableTwoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    passwordMinLength: 6,
    requireSpecialCharacters: false,
    requireNumbers: false,
    requireUppercase: false,
    passwordExpiryDays: 0,
    enableIPWhitelist: false,
    whitelistedIPs: [],
    enableCaptcha: false,
    captchaSiteKey: '',
    captchaSecretKey: '',
  });
  const [ipInput, setIpInput] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.getSettings();
      if (response.success) {
        setSettings(response.settings.security);
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
      const response = await api.updateSecuritySettings(settings);
      if (response.success) {
        Alert.alert('Success', 'Security settings updated successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addIP = () => {
    if (ipInput.trim() && !settings.whitelistedIPs.includes(ipInput.trim())) {
      setSettings({
        ...settings,
        whitelistedIPs: [...settings.whitelistedIPs, ipInput.trim()],
      });
      setIpInput('');
    }
  };

  const removeIP = (ip) => {
    setSettings({
      ...settings,
      whitelistedIPs: settings.whitelistedIPs.filter((i) => i !== ip),
    });
  };

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  if (loading) {
    return (
      <AdminLayout title="Security Settings" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading settings...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Security Settings" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={dynamicStyles.headerTextContainer}>
            <Text style={dynamicStyles.pageTitle}>Security Settings</Text>
            <Text style={dynamicStyles.pageSubtitle}>Configure security and authentication</Text>
          </View>
        </View>

        {/* Authentication */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Authentication</Text>
          
          <View style={dynamicStyles.switchRow}>
            <View style={dynamicStyles.switchLabelContainer}>
              <Text style={dynamicStyles.switchLabel}>Two-Factor Authentication</Text>
              <Text style={dynamicStyles.switchDescription}>
                Require 2FA for admin accounts
              </Text>
            </View>
            <Switch
              value={settings.enableTwoFactorAuth}
              onValueChange={(value) => setSettings({ ...settings, enableTwoFactorAuth: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Session Timeout (minutes)</Text>
            <TextInput
              style={dynamicStyles.input}
              value={String(settings.sessionTimeout)}
              onChangeText={(text) => setSettings({ ...settings, sessionTimeout: parseInt(text) || 30 })}
              keyboardType="number-pad"
              placeholder="30"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Max Login Attempts</Text>
            <TextInput
              style={dynamicStyles.input}
              value={String(settings.maxLoginAttempts)}
              onChangeText={(text) => setSettings({ ...settings, maxLoginAttempts: parseInt(text) || 5 })}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Lockout Duration (minutes)</Text>
            <TextInput
              style={dynamicStyles.input}
              value={String(settings.lockoutDuration)}
              onChangeText={(text) => setSettings({ ...settings, lockoutDuration: parseInt(text) || 15 })}
              keyboardType="number-pad"
              placeholder="15"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Password Requirements */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Password Requirements</Text>
          
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Minimum Length</Text>
            <TextInput
              style={dynamicStyles.input}
              value={String(settings.passwordMinLength)}
              onChangeText={(text) => setSettings({ ...settings, passwordMinLength: parseInt(text) || 6 })}
              keyboardType="number-pad"
              placeholder="6"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={dynamicStyles.switchRow}>
            <Text style={dynamicStyles.switchLabel}>Require Special Characters</Text>
            <Switch
              value={settings.requireSpecialCharacters}
              onValueChange={(value) => setSettings({ ...settings, requireSpecialCharacters: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={dynamicStyles.switchRow}>
            <Text style={dynamicStyles.switchLabel}>Require Numbers</Text>
            <Switch
              value={settings.requireNumbers}
              onValueChange={(value) => setSettings({ ...settings, requireNumbers: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={dynamicStyles.switchRow}>
            <Text style={dynamicStyles.switchLabel}>Require Uppercase Letters</Text>
            <Switch
              value={settings.requireUppercase}
              onValueChange={(value) => setSettings({ ...settings, requireUppercase: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Password Expiry (days, 0 = never)</Text>
            <TextInput
              style={dynamicStyles.input}
              value={String(settings.passwordExpiryDays)}
              onChangeText={(text) => setSettings({ ...settings, passwordExpiryDays: parseInt(text) || 0 })}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* IP Whitelist */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>IP Whitelist</Text>
          
          <View style={dynamicStyles.switchRow}>
            <View style={dynamicStyles.switchLabelContainer}>
              <Text style={dynamicStyles.switchLabel}>Enable IP Whitelist</Text>
              <Text style={dynamicStyles.switchDescription}>
                Only allow access from whitelisted IPs
              </Text>
            </View>
            <Switch
              value={settings.enableIPWhitelist}
              onValueChange={(value) => setSettings({ ...settings, enableIPWhitelist: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {settings.enableIPWhitelist && (
            <>
              <View style={dynamicStyles.ipInputRow}>
                <TextInput
                  style={[dynamicStyles.input, dynamicStyles.ipInput]}
                  value={ipInput}
                  onChangeText={setIpInput}
                  placeholder="Enter IP address"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={dynamicStyles.addButton} onPress={addIP}>
                  <Ionicons name="add" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>

              {settings.whitelistedIPs.map((ip, index) => (
                <View key={index} style={dynamicStyles.ipItem}>
                  <Text style={dynamicStyles.ipText}>{ip}</Text>
                  <TouchableOpacity onPress={() => removeIP(ip)}>
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </View>

        {/* CAPTCHA */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>CAPTCHA Protection</Text>
          
          <View style={dynamicStyles.switchRow}>
            <View style={dynamicStyles.switchLabelContainer}>
              <Text style={dynamicStyles.switchLabel}>Enable CAPTCHA</Text>
              <Text style={dynamicStyles.switchDescription}>
                Protect login and registration forms
              </Text>
            </View>
            <Switch
              value={settings.enableCaptcha}
              onValueChange={(value) => setSettings({ ...settings, enableCaptcha: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {settings.enableCaptcha && (
            <>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>CAPTCHA Site Key</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={settings.captchaSiteKey}
                  onChangeText={(text) => setSettings({ ...settings, captchaSiteKey: text })}
                  placeholder="Enter site key"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>CAPTCHA Secret Key</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={settings.captchaSecretKey}
                  onChangeText={(text) => setSettings({ ...settings, captchaSecretKey: text })}
                  placeholder="Enter secret key"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  secureTextEntry
                />
              </View>
            </>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[dynamicStyles.saveButton, saving && dynamicStyles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color={colors.white} />
              <Text style={dynamicStyles.saveButtonText}>Save Security Settings</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={dynamicStyles.bottomSpacing} />
      </ScrollView>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
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
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
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
  ipInputRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  ipInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ipItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  ipText: {
    ...typography.body1,
    color: colors.text,
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

const styles = StyleSheet.create({});

export default SecuritySettingsScreen;

