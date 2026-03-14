import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminWhatsAppSettingsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [settings, setSettings] = useState({
    whatsappEnabled: false,
    emailEnabled: true,
    apiProvider: 'twilio', // twilio, whatsapp-business-api, custom
    
    // Twilio Settings
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    
    // WhatsApp Business API Settings
    whatsappBusinessApiUrl: '',
    whatsappBusinessApiToken: '',
    whatsappBusinessPhoneNumberId: '',
    
    // Custom API Settings
    customApiUrl: '',
    customApiKey: '',
    customApiMethod: 'POST',
    
    // Rate Limiting
    maxMessagesPerMinute: 10,
    maxMessagesPerHour: 100,
    maxMessagesPerDay: 500,
    
    // Test Settings
    testPhoneNumber: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/admin/whatsapp-settings`, { headers });
      const data = await response.json();
      
      if (response.ok && data.settings) {
        setSettings({ ...settings, ...data.settings });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/admin/whatsapp-settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'WhatsApp settings saved successfully');
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.testPhoneNumber) {
      Alert.alert('Missing Phone Number', 'Please enter a test phone number');
      return;
    }

    try {
      setTesting(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/admin/test-whatsapp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phoneNumber: settings.testPhoneNumber,
          message: 'This is a test message from FreeJobWala Admin Panel'
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Test message sent successfully! Check your WhatsApp.');
      } else {
        throw new Error(data.message || 'Failed to send test message');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      Alert.alert('Error', error.message || 'Failed to send test message');
    } finally {
      setTesting(false);
    }
  };

  const dynamicStyles = getStyles(isMobile, isTablet);

  if (loading) {
    return (
      <AdminLayout
        title="WhatsApp Settings"
        activeScreen="AdminWhatsAppSettings"
        onNavigate={(screen) => navigation.navigate(screen)}
        onLogout={() => navigation.replace('AdminLogin')}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={dynamicStyles.loadingText}>Loading settings...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="WhatsApp Settings"
      activeScreen="AdminWhatsAppSettings"
      onNavigate={(screen) => navigation.navigate(screen)}
      onLogout={() => navigation.replace('AdminLogin')}
    >
      <ScrollView style={dynamicStyles.container}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity
            style={dynamicStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <View style={dynamicStyles.headerContent}>
            <Text style={dynamicStyles.title}>WhatsApp API Settings</Text>
            <Text style={dynamicStyles.subtitle}>Configure WhatsApp integration for bulk messaging</Text>
          </View>
        </View>

        {/* Enable/Disable Toggles */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Enable Services</Text>
          
          <View style={dynamicStyles.toggleRow}>
            <View style={dynamicStyles.toggleInfo}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <View style={dynamicStyles.toggleTextContainer}>
                <Text style={dynamicStyles.toggleLabel}>WhatsApp Messaging</Text>
                <Text style={dynamicStyles.toggleDescription}>Enable WhatsApp bulk messaging</Text>
              </View>
            </View>
            <Switch
              value={settings.whatsappEnabled}
              onValueChange={(value) => setSettings({ ...settings, whatsappEnabled: value })}
              trackColor={{ false: '#D1D5DB', true: '#25D366' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={dynamicStyles.toggleRow}>
            <View style={dynamicStyles.toggleInfo}>
              <Ionicons name="mail-outline" size={24} color="#4A90E2" />
              <View style={dynamicStyles.toggleTextContainer}>
                <Text style={dynamicStyles.toggleLabel}>Email Messaging</Text>
                <Text style={dynamicStyles.toggleDescription}>Enable email bulk messaging</Text>
              </View>
            </View>
            <Switch
              value={settings.emailEnabled}
              onValueChange={(value) => setSettings({ ...settings, emailEnabled: value })}
              trackColor={{ false: '#D1D5DB', true: '#4A90E2' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* API Provider Selection */}
        {settings.whatsappEnabled && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>WhatsApp API Provider</Text>
            
            <View style={dynamicStyles.providerContainer}>
              <TouchableOpacity
                style={[
                  dynamicStyles.providerButton,
                  settings.apiProvider === 'twilio' && dynamicStyles.providerButtonActive
                ]}
                onPress={() => setSettings({ ...settings, apiProvider: 'twilio' })}
              >
                <Text style={[
                  dynamicStyles.providerText,
                  settings.apiProvider === 'twilio' && dynamicStyles.providerTextActive
                ]}>
                  Twilio
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  dynamicStyles.providerButton,
                  settings.apiProvider === 'whatsapp-business-api' && dynamicStyles.providerButtonActive
                ]}
                onPress={() => setSettings({ ...settings, apiProvider: 'whatsapp-business-api' })}
              >
                <Text style={[
                  dynamicStyles.providerText,
                  settings.apiProvider === 'whatsapp-business-api' && dynamicStyles.providerTextActive
                ]}>
                  WhatsApp Business API
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  dynamicStyles.providerButton,
                  settings.apiProvider === 'custom' && dynamicStyles.providerButtonActive
                ]}
                onPress={() => setSettings({ ...settings, apiProvider: 'custom' })}
              >
                <Text style={[
                  dynamicStyles.providerText,
                  settings.apiProvider === 'custom' && dynamicStyles.providerTextActive
                ]}>
                  Custom API
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Twilio Settings */}
        {settings.whatsappEnabled && settings.apiProvider === 'twilio' && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Twilio Configuration</Text>
            
            <Text style={dynamicStyles.label}>Account SID</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter Twilio Account SID"
              value={settings.twilioAccountSid}
              onChangeText={(text) => setSettings({ ...settings, twilioAccountSid: text })}
            />

            <Text style={dynamicStyles.label}>Auth Token</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter Twilio Auth Token"
              value={settings.twilioAuthToken}
              onChangeText={(text) => setSettings({ ...settings, twilioAuthToken: text })}
              secureTextEntry
            />

            <Text style={dynamicStyles.label}>WhatsApp Phone Number</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="+1234567890"
              value={settings.twilioPhoneNumber}
              onChangeText={(text) => setSettings({ ...settings, twilioPhoneNumber: text })}
              keyboardType="phone-pad"
            />

            <View style={dynamicStyles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#4A90E2" />
              <Text style={dynamicStyles.infoText}>
                Get your Twilio credentials from: https://console.twilio.com/
              </Text>
            </View>
          </View>
        )}

        {/* WhatsApp Business API Settings */}
        {settings.whatsappEnabled && settings.apiProvider === 'whatsapp-business-api' && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>WhatsApp Business API Configuration</Text>
            
            <Text style={dynamicStyles.label}>API URL</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="https://graph.facebook.com/v17.0"
              value={settings.whatsappBusinessApiUrl}
              onChangeText={(text) => setSettings({ ...settings, whatsappBusinessApiUrl: text })}
            />

            <Text style={dynamicStyles.label}>Access Token</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter WhatsApp Business API Token"
              value={settings.whatsappBusinessApiToken}
              onChangeText={(text) => setSettings({ ...settings, whatsappBusinessApiToken: text })}
              secureTextEntry
            />

            <Text style={dynamicStyles.label}>Phone Number ID</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter Phone Number ID"
              value={settings.whatsappBusinessPhoneNumberId}
              onChangeText={(text) => setSettings({ ...settings, whatsappBusinessPhoneNumberId: text })}
            />

            <View style={dynamicStyles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#4A90E2" />
              <Text style={dynamicStyles.infoText}>
                Get your credentials from Meta Business Suite
              </Text>
            </View>
          </View>
        )}

        {/* Custom API Settings */}
        {settings.whatsappEnabled && settings.apiProvider === 'custom' && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Custom API Configuration</Text>
            
            <Text style={dynamicStyles.label}>API URL</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="https://your-api.com/send-whatsapp"
              value={settings.customApiUrl}
              onChangeText={(text) => setSettings({ ...settings, customApiUrl: text })}
            />

            <Text style={dynamicStyles.label}>API Key</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter API Key"
              value={settings.customApiKey}
              onChangeText={(text) => setSettings({ ...settings, customApiKey: text })}
              secureTextEntry
            />

            <Text style={dynamicStyles.label}>HTTP Method</Text>
            <View style={dynamicStyles.methodContainer}>
              <TouchableOpacity
                style={[
                  dynamicStyles.methodButton,
                  settings.customApiMethod === 'POST' && dynamicStyles.methodButtonActive
                ]}
                onPress={() => setSettings({ ...settings, customApiMethod: 'POST' })}
              >
                <Text style={[
                  dynamicStyles.methodText,
                  settings.customApiMethod === 'POST' && dynamicStyles.methodTextActive
                ]}>
                  POST
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  dynamicStyles.methodButton,
                  settings.customApiMethod === 'GET' && dynamicStyles.methodButtonActive
                ]}
                onPress={() => setSettings({ ...settings, customApiMethod: 'GET' })}
              >
                <Text style={[
                  dynamicStyles.methodText,
                  settings.customApiMethod === 'GET' && dynamicStyles.methodTextActive
                ]}>
                  GET
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Rate Limiting */}
        {settings.whatsappEnabled && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Rate Limiting</Text>
            
            <Text style={dynamicStyles.label}>Max Messages Per Minute</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="10"
              value={String(settings.maxMessagesPerMinute)}
              onChangeText={(text) => setSettings({ ...settings, maxMessagesPerMinute: parseInt(text) || 10 })}
              keyboardType="numeric"
            />

            <Text style={dynamicStyles.label}>Max Messages Per Hour</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="100"
              value={String(settings.maxMessagesPerHour)}
              onChangeText={(text) => setSettings({ ...settings, maxMessagesPerHour: parseInt(text) || 100 })}
              keyboardType="numeric"
            />

            <Text style={dynamicStyles.label}>Max Messages Per Day</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="500"
              value={String(settings.maxMessagesPerDay)}
              onChangeText={(text) => setSettings({ ...settings, maxMessagesPerDay: parseInt(text) || 500 })}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Test Connection */}
        {settings.whatsappEnabled && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Test Connection</Text>
            
            <Text style={dynamicStyles.label}>Test Phone Number (with country code)</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="+919876543210"
              value={settings.testPhoneNumber}
              onChangeText={(text) => setSettings({ ...settings, testPhoneNumber: text })}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={[dynamicStyles.testButton, testing && dynamicStyles.testButtonDisabled]}
              onPress={handleTestConnection}
              disabled={testing}
            >
              <Ionicons name="send-outline" size={20} color="#FFF" />
              <Text style={dynamicStyles.testButtonText}>
                {testing ? 'Sending...' : 'Send Test Message'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[dynamicStyles.saveButton, saving && dynamicStyles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
          <Text style={dynamicStyles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 15,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  toggleDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  providerContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
  },
  providerButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  providerButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  providerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  providerTextActive: {
    color: '#FFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
  },
  methodContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  methodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  methodTextActive: {
    color: '#FFF',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    padding: 14,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  testButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminWhatsAppSettingsScreen;
