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
import { Picker } from '@react-native-picker/picker';
import AdminLayout from '../../../components/Admin/AdminLayout';
import api from '../../../config/api';
import { colors, spacing, typography, borderRadius } from '../../../styles/theme';
import { useResponsive } from '../../../utils/responsive';

const GeneralSettingsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    contactEmail: '',
    contactPhone: '',
    timezone: 'Asia/Kolkata',
    language: 'en',
    currency: 'INR',
    dateFormat: 'DD-MM-YYYY',
    maintenanceMode: false,
    maintenanceMessage: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.getSettings();
      if (response.success) {
        setSettings(response.settings.general);
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
      const response = await api.updateGeneralSettings(settings);
      if (response.success) {
        Alert.alert('Success', 'General settings updated successfully');
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
      <AdminLayout title="General Settings" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading settings...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="General Settings" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={dynamicStyles.headerTextContainer}>
            <Text style={dynamicStyles.pageTitle}>General Settings</Text>
            <Text style={dynamicStyles.pageSubtitle}>Configure basic platform settings</Text>
          </View>
        </View>

        {/* Site Information */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Site Information</Text>
          
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Site Name</Text>
            <TextInput
              style={dynamicStyles.input}
              value={settings.siteName}
              onChangeText={(text) => setSettings({ ...settings, siteName: text })}
              placeholder="Enter site name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Site Description</Text>
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea]}
              value={settings.siteDescription}
              onChangeText={(text) => setSettings({ ...settings, siteDescription: text })}
              placeholder="Enter site description"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Site URL</Text>
            <TextInput
              style={dynamicStyles.input}
              value={settings.siteUrl}
              onChangeText={(text) => setSettings({ ...settings, siteUrl: text })}
              placeholder="https://example.com"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Contact Information</Text>
          
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Contact Email</Text>
            <TextInput
              style={dynamicStyles.input}
              value={settings.contactEmail}
              onChangeText={(text) => setSettings({ ...settings, contactEmail: text })}
              placeholder="contact@example.com"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Contact Phone</Text>
            <TextInput
              style={dynamicStyles.input}
              value={settings.contactPhone}
              onChangeText={(text) => setSettings({ ...settings, contactPhone: text })}
              placeholder="+91 1234567890"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Regional Settings */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Regional Settings</Text>
          
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Timezone</Text>
            <View style={dynamicStyles.pickerContainer}>
              <Picker
                selectedValue={settings.timezone}
                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                style={dynamicStyles.picker}
              >
                <Picker.Item label="Asia/Kolkata (IST)" value="Asia/Kolkata" />
                <Picker.Item label="America/New_York (EST)" value="America/New_York" />
                <Picker.Item label="Europe/London (GMT)" value="Europe/London" />
                <Picker.Item label="Asia/Dubai (GST)" value="Asia/Dubai" />
                <Picker.Item label="Asia/Singapore (SGT)" value="Asia/Singapore" />
              </Picker>
            </View>
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Language</Text>
            <View style={dynamicStyles.pickerContainer}>
              <Picker
                selectedValue={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
                style={dynamicStyles.picker}
              >
                <Picker.Item label="English" value="en" />
                <Picker.Item label="Hindi" value="hi" />
              </Picker>
            </View>
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Currency</Text>
            <View style={dynamicStyles.pickerContainer}>
              <Picker
                selectedValue={settings.currency}
                onValueChange={(value) => setSettings({ ...settings, currency: value })}
                style={dynamicStyles.picker}
              >
                <Picker.Item label="Indian Rupee (INR)" value="INR" />
                <Picker.Item label="US Dollar (USD)" value="USD" />
                <Picker.Item label="Euro (EUR)" value="EUR" />
              </Picker>
            </View>
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Date Format</Text>
            <View style={dynamicStyles.pickerContainer}>
              <Picker
                selectedValue={settings.dateFormat}
                onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                style={dynamicStyles.picker}
              >
                <Picker.Item label="DD-MM-YYYY" value="DD-MM-YYYY" />
                <Picker.Item label="MM-DD-YYYY" value="MM-DD-YYYY" />
                <Picker.Item label="YYYY-MM-DD" value="YYYY-MM-DD" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Maintenance Mode */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Maintenance Mode</Text>
          
          <View style={dynamicStyles.switchRow}>
            <View style={dynamicStyles.switchLabelContainer}>
              <Text style={dynamicStyles.switchLabel}>Enable Maintenance Mode</Text>
              <Text style={dynamicStyles.switchDescription}>
                When enabled, only admins can access the site
              </Text>
            </View>
            <Switch
              value={settings.maintenanceMode}
              onValueChange={(value) => setSettings({ ...settings, maintenanceMode: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {settings.maintenanceMode && (
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Maintenance Message</Text>
              <TextInput
                style={[dynamicStyles.input, dynamicStyles.textArea]}
                value={settings.maintenanceMessage}
                onChangeText={(text) => setSettings({ ...settings, maintenanceMessage: text })}
                placeholder="Enter maintenance message"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
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
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={dynamicStyles.saveButtonText}>Save Changes</Text>
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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

export default GeneralSettingsScreen;

