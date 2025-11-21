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

const PaymentSettingsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enablePayments: true,
    defaultCurrency: 'INR',
    gstEnabled: true,
    gstPercentage: 18,
    paymentGateways: {
      razorpay: { enabled: false, keyId: '', keySecret: '', webhookSecret: '' },
      stripe: { enabled: false, publishableKey: '', secretKey: '', webhookSecret: '' },
      paypal: { enabled: false, clientId: '', clientSecret: '', mode: 'sandbox' },
    },
    refundPolicy: '',
    termsAndConditions: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.getSettings();
      if (response.success) {
        setSettings(response.settings.payment);
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
      const response = await api.updatePaymentSettings(settings);
      if (response.success) {
        Alert.alert('Success', 'Payment settings updated successfully');
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
      <AdminLayout title="Payment Settings" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading settings...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Payment Settings" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={dynamicStyles.headerTextContainer}>
            <Text style={dynamicStyles.pageTitle}>Payment Settings</Text>
            <Text style={dynamicStyles.pageSubtitle}>Configure payment gateways and policies</Text>
          </View>
        </View>

        {/* General Payment Settings */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>General Settings</Text>
          
          <View style={dynamicStyles.switchRow}>
            <Text style={dynamicStyles.switchLabel}>Enable Payments</Text>
            <Switch
              value={settings.enablePayments}
              onValueChange={(value) => setSettings({ ...settings, enablePayments: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Default Currency</Text>
            <View style={dynamicStyles.pickerContainer}>
              <Picker
                selectedValue={settings.defaultCurrency}
                onValueChange={(value) => setSettings({ ...settings, defaultCurrency: value })}
                style={dynamicStyles.picker}
              >
                <Picker.Item label="Indian Rupee (INR)" value="INR" />
                <Picker.Item label="US Dollar (USD)" value="USD" />
                <Picker.Item label="Euro (EUR)" value="EUR" />
              </Picker>
            </View>
          </View>

          <View style={dynamicStyles.switchRow}>
            <Text style={dynamicStyles.switchLabel}>Enable GST</Text>
            <Switch
              value={settings.gstEnabled}
              onValueChange={(value) => setSettings({ ...settings, gstEnabled: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {settings.gstEnabled && (
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>GST Percentage (%)</Text>
              <TextInput
                style={dynamicStyles.input}
                value={String(settings.gstPercentage)}
                onChangeText={(text) => setSettings({ ...settings, gstPercentage: parseFloat(text) || 18 })}
                keyboardType="decimal-pad"
                placeholder="18"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          )}
        </View>

        {/* Razorpay */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.gatewayHeader}>
            <Text style={dynamicStyles.sectionTitle}>Razorpay</Text>
            <Switch
              value={settings.paymentGateways.razorpay.enabled}
              onValueChange={(value) => setSettings({
                ...settings,
                paymentGateways: {
                  ...settings.paymentGateways,
                  razorpay: { ...settings.paymentGateways.razorpay, enabled: value }
                }
              })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {settings.paymentGateways.razorpay.enabled && (
            <>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Key ID</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={settings.paymentGateways.razorpay.keyId}
                  onChangeText={(text) => setSettings({
                    ...settings,
                    paymentGateways: {
                      ...settings.paymentGateways,
                      razorpay: { ...settings.paymentGateways.razorpay, keyId: text }
                    }
                  })}
                  placeholder="Enter Razorpay Key ID"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Key Secret</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={settings.paymentGateways.razorpay.keySecret}
                  onChangeText={(text) => setSettings({
                    ...settings,
                    paymentGateways: {
                      ...settings.paymentGateways,
                      razorpay: { ...settings.paymentGateways.razorpay, keySecret: text }
                    }
                  })}
                  placeholder="Enter Key Secret"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Webhook Secret</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={settings.paymentGateways.razorpay.webhookSecret}
                  onChangeText={(text) => setSettings({
                    ...settings,
                    paymentGateways: {
                      ...settings.paymentGateways,
                      razorpay: { ...settings.paymentGateways.razorpay, webhookSecret: text }
                    }
                  })}
                  placeholder="Enter Webhook Secret"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>
            </>
          )}
        </View>

        {/* Stripe */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.gatewayHeader}>
            <Text style={dynamicStyles.sectionTitle}>Stripe</Text>
            <Switch
              value={settings.paymentGateways.stripe.enabled}
              onValueChange={(value) => setSettings({
                ...settings,
                paymentGateways: {
                  ...settings.paymentGateways,
                  stripe: { ...settings.paymentGateways.stripe, enabled: value }
                }
              })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {settings.paymentGateways.stripe.enabled && (
            <>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Publishable Key</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={settings.paymentGateways.stripe.publishableKey}
                  onChangeText={(text) => setSettings({
                    ...settings,
                    paymentGateways: {
                      ...settings.paymentGateways,
                      stripe: { ...settings.paymentGateways.stripe, publishableKey: text }
                    }
                  })}
                  placeholder="Enter Publishable Key"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Secret Key</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={settings.paymentGateways.stripe.secretKey}
                  onChangeText={(text) => setSettings({
                    ...settings,
                    paymentGateways: {
                      ...settings.paymentGateways,
                      stripe: { ...settings.paymentGateways.stripe, secretKey: text }
                    }
                  })}
                  placeholder="Enter Secret Key"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>
            </>
          )}
        </View>

        {/* PayPal */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.gatewayHeader}>
            <Text style={dynamicStyles.sectionTitle}>PayPal</Text>
            <Switch
              value={settings.paymentGateways.paypal.enabled}
              onValueChange={(value) => setSettings({
                ...settings,
                paymentGateways: {
                  ...settings.paymentGateways,
                  paypal: { ...settings.paymentGateways.paypal, enabled: value }
                }
              })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {settings.paymentGateways.paypal.enabled && (
            <>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Client ID</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={settings.paymentGateways.paypal.clientId}
                  onChangeText={(text) => setSettings({
                    ...settings,
                    paymentGateways: {
                      ...settings.paymentGateways,
                      paypal: { ...settings.paymentGateways.paypal, clientId: text }
                    }
                  })}
                  placeholder="Enter Client ID"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Client Secret</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={settings.paymentGateways.paypal.clientSecret}
                  onChangeText={(text) => setSettings({
                    ...settings,
                    paymentGateways: {
                      ...settings.paymentGateways,
                      paypal: { ...settings.paymentGateways.paypal, clientSecret: text }
                    }
                  })}
                  placeholder="Enter Client Secret"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Mode</Text>
                <View style={dynamicStyles.pickerContainer}>
                  <Picker
                    selectedValue={settings.paymentGateways.paypal.mode}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        paypal: { ...settings.paymentGateways.paypal, mode: value }
                      }
                    })}
                    style={dynamicStyles.picker}
                  >
                    <Picker.Item label="Sandbox (Test)" value="sandbox" />
                    <Picker.Item label="Live (Production)" value="live" />
                  </Picker>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Policies */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Policies</Text>
          
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Refund Policy</Text>
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea]}
              value={settings.refundPolicy}
              onChangeText={(text) => setSettings({ ...settings, refundPolicy: text })}
              placeholder="Enter refund policy..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Terms and Conditions</Text>
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea]}
              value={settings.termsAndConditions}
              onChangeText={(text) => setSettings({ ...settings, termsAndConditions: text })}
              placeholder="Enter terms and conditions..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>
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
              <Ionicons name="card" size={20} color={colors.white} />
              <Text style={dynamicStyles.saveButtonText}>Save Payment Settings</Text>
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
  gatewayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
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
    minHeight: 100,
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
  switchLabel: {
    ...typography.subtitle1,
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

export default PaymentSettingsScreen;

