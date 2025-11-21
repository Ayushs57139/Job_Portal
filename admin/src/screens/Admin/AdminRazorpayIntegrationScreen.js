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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

const AdminRazorpayIntegrationScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    enabled: false,
    keyId: '',
    keySecret: '',
    webhookSecret: '',
    testMode: true,
  });
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    successfulPayments: 0,
    failedPayments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchUser();
    loadSettings();
    loadTransactions();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user || data);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/admin/razorpay/settings`, { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(prev => ({
            enabled: data.settings.enabled !== undefined ? data.settings.enabled : prev.enabled,
            keyId: data.settings.keyId || prev.keyId || '',
            keySecret: data.settings.keySecret && data.settings.keySecret !== '****' ? data.settings.keySecret : prev.keySecret,
            webhookSecret: data.settings.webhookSecret && data.settings.webhookSecret !== '****' ? data.settings.webhookSecret : prev.webhookSecret,
            testMode: data.settings.testMode !== undefined ? data.settings.testMode : (prev.testMode !== undefined ? prev.testMode : true),
          }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load Razorpay settings');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/admin/razorpay/transactions`, { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.transactions) {
          setTransactions(data.transactions);
          
          // Calculate stats
          const total = data.transactions.length;
          const successful = data.transactions.filter(t => t.status === 'success' || t.status === 'captured').length;
          const failed = data.transactions.filter(t => t.status === 'failed').length;
          const revenue = data.transactions
            .filter(t => t.status === 'success' || t.status === 'captured')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

          setStats({
            totalTransactions: total,
            successfulPayments: successful,
            failedPayments: failed,
            totalRevenue: revenue,
          });
        }
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSettings();
    loadTransactions();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSave = async () => {
    if (!settings.keyId || !settings.keySecret) {
      Alert.alert('Error', 'Please enter both Key ID and Key Secret');
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/admin/razorpay/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Success', 'Razorpay settings saved successfully');
        loadSettings();
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
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/admin/razorpay/test-connection`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ keyId: settings.keyId, keySecret: settings.keySecret }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Success', 'Connection test successful! Razorpay is properly configured.');
      } else {
        Alert.alert('Error', data.message || 'Connection test failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      Alert.alert('Error', 'Failed to test connection');
    }
  };

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  if (loading) {
    return (
      <AdminLayout
        title="Razorpay Integration"
        activeScreen="AdminRazorpayIntegration"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading Razorpay settings...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Razorpay Integration"
      activeScreen="AdminRazorpayIntegration"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <ScrollView
        style={dynamicStyles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={dynamicStyles.headerSection}>
          <View>
            <Text style={dynamicStyles.pageTitle}>Razorpay Integration</Text>
            <Text style={dynamicStyles.pageSubtitle}>Configure and manage Razorpay payment gateway</Text>
          </View>
        </View>

        <View style={dynamicStyles.statsGrid}>
          <View style={dynamicStyles.statCard}>
            <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="card-outline" size={28} color={colors.primary} />
            </View>
            <Text style={dynamicStyles.statNumber}>{stats.totalTransactions}</Text>
            <Text style={dynamicStyles.statLabel}>Total Transactions</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="checkmark-circle-outline" size={28} color={colors.success} />
            </View>
            <Text style={dynamicStyles.statNumber}>{stats.successfulPayments}</Text>
            <Text style={dynamicStyles.statLabel}>Successful</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="close-circle-outline" size={28} color={colors.error} />
            </View>
            <Text style={dynamicStyles.statNumber}>{stats.failedPayments}</Text>
            <Text style={dynamicStyles.statLabel}>Failed</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <View style={[dynamicStyles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="cash-outline" size={28} color="#F59E0B" />
            </View>
            <Text style={dynamicStyles.statNumber}>₹{stats.totalRevenue.toLocaleString()}</Text>
            <Text style={dynamicStyles.statLabel}>Total Revenue</Text>
          </View>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Configuration</Text>
          
          <View style={dynamicStyles.switchRow}>
            <View style={dynamicStyles.switchLabelContainer}>
              <Text style={dynamicStyles.switchLabel}>Enable Razorpay</Text>
              <Text style={dynamicStyles.switchDescription}>Activate Razorpay payment gateway</Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => setSettings({ ...settings, enabled: value })}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={dynamicStyles.switchRow}>
            <View style={dynamicStyles.switchLabelContainer}>
              <Text style={dynamicStyles.switchLabel}>Test Mode</Text>
              <Text style={dynamicStyles.switchDescription}>Use Razorpay test credentials</Text>
            </View>
            <Switch
              value={settings.testMode}
              onValueChange={(value) => setSettings({ ...settings, testMode: value })}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.inputLabel}>
              Key ID <Text style={dynamicStyles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={dynamicStyles.input}
              value={settings.keyId}
              onChangeText={(text) => setSettings({ ...settings, keyId: text })}
              placeholder="Enter Razorpay Key ID"
              placeholderTextColor="#94A3B8"
              secureTextEntry={false}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.inputLabel}>
              Key Secret <Text style={dynamicStyles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={dynamicStyles.input}
              value={settings.keySecret}
              onChangeText={(text) => setSettings({ ...settings, keySecret: text })}
              placeholder="Enter Razorpay Key Secret"
              placeholderTextColor="#94A3B8"
              secureTextEntry={true}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.inputLabel}>Webhook Secret</Text>
            <TextInput
              style={dynamicStyles.input}
              value={settings.webhookSecret}
              onChangeText={(text) => setSettings({ ...settings, webhookSecret: text })}
              placeholder="Enter Webhook Secret (optional)"
              placeholderTextColor="#94A3B8"
              secureTextEntry={true}
            />
            <Text style={dynamicStyles.inputHint}>
              Used to verify webhook requests from Razorpay
            </Text>
          </View>

          <View style={dynamicStyles.buttonRow}>
            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.testButton]}
              onPress={handleTestConnection}
              disabled={!settings.keyId || !settings.keySecret}
            >
              <Ionicons name="flash-outline" size={20} color={colors.white} />
              <Text style={dynamicStyles.testButtonText}>Test Connection</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color={colors.white} />
                  <Text style={dynamicStyles.saveButtonText}>Save Settings</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Text style={dynamicStyles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={loadTransactions}>
              <Ionicons name="refresh-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={colors.textLight} />
              <Text style={dynamicStyles.emptyStateText}>No transactions found</Text>
              <Text style={dynamicStyles.emptyStateSubtext}>
                Transactions will appear here when users purchase packages
              </Text>
            </View>
          ) : (
            <View style={dynamicStyles.transactionsList}>
              {transactions.slice(0, 10).map((transaction, index) => (
                <View key={transaction._id || index} style={dynamicStyles.transactionItem}>
                  <View style={dynamicStyles.transactionContent}>
                    <View style={dynamicStyles.transactionHeader}>
                      <Text style={dynamicStyles.transactionId}>
                        {transaction.razorpayOrderId || transaction.orderId || 'N/A'}
                      </Text>
                      <View style={[
                        dynamicStyles.statusBadge,
                        (transaction.status === 'success' || transaction.status === 'captured') 
                          ? dynamicStyles.statusSuccess 
                          : transaction.status === 'failed' 
                          ? dynamicStyles.statusFailed 
                          : dynamicStyles.statusPending
                      ]}>
                        <Text style={dynamicStyles.statusText}>
                          {transaction.status || 'pending'}
                        </Text>
                      </View>
                    </View>
                    <Text style={dynamicStyles.transactionUser}>
                      {transaction.user?.firstName} {transaction.user?.lastName} ({transaction.user?.email})
                    </Text>
                    <Text style={dynamicStyles.transactionPackage}>
                      Package: {transaction.package?.name || 'N/A'}
                    </Text>
                    <View style={dynamicStyles.transactionFooter}>
                      <Text style={dynamicStyles.transactionAmount}>
                        ₹{transaction.amount ? transaction.amount.toLocaleString() : '0'}
                      </Text>
                      <Text style={dynamicStyles.transactionDate}>
                        {transaction.createdAt 
                          ? new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  headerSection: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  pageTitle: {
    ...typography.h3,
    color: '#1A202C',
    marginBottom: spacing.xs,
    fontWeight: '700',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    ...typography.body2,
    color: '#64748B',
    fontSize: 14,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md + 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statNumber: {
    ...typography.h4,
    color: '#1A202C',
    fontWeight: '800',
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.body2,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg + 2,
    padding: spacing.xl + 8,
    marginBottom: spacing.lg,
    ...shadows.md,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    color: '#1A202C',
    fontWeight: '700',
    fontSize: 20,
    marginBottom: spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md + 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: spacing.md,
  },
  switchLabelContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  switchLabel: {
    ...typography.body1,
    color: '#1A202C',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  switchDescription: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.body2,
    color: '#1A202C',
    fontWeight: '600',
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  requiredStar: {
    color: colors.error,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.md + 4,
    paddingVertical: spacing.md + 6,
    paddingHorizontal: spacing.lg + 6,
    ...typography.body1,
    color: '#1A202C',
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },
  inputHint: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 12,
    marginTop: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 6,
    borderRadius: borderRadius.md + 4,
    gap: spacing.sm,
    ...shadows.sm,
    elevation: 2,
  },
  testButton: {
    backgroundColor: '#F59E0B',
  },
  testButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    ...shadows.md,
    elevation: 3,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  transactionsList: {
    gap: spacing.md,
  },
  transactionItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md + 4,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.xs,
    elevation: 1,
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transactionId: {
    ...typography.body1,
    color: '#1A202C',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.sm,
  },
  statusSuccess: {
    backgroundColor: '#ECFDF5',
  },
  statusFailed: {
    backgroundColor: '#FEF2F2',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    ...typography.caption,
    color: '#1A202C',
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  transactionUser: {
    ...typography.body2,
    color: '#64748B',
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  transactionPackage: {
    ...typography.body2,
    color: '#64748B',
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  transactionAmount: {
    ...typography.h6,
    color: colors.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  transactionDate: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 12,
  },
  emptyState: {
    paddingVertical: spacing.xxl * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    ...typography.h5,
    color: '#1A202C',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontWeight: '700',
    fontSize: 20,
  },
  emptyStateSubtext: {
    ...typography.body2,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    fontSize: 14,
  },
});

const styles = StyleSheet.create({});

export default AdminRazorpayIntegrationScreen;

