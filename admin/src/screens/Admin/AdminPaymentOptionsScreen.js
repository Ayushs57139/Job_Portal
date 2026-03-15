import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Switch, RefreshControl, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

// ─── Gateway definitions ─────────────────────────────────────────────────────

const GATEWAYS = [
  {
    id: 'razorpay',
    name: 'Razorpay',
    icon: 'card-outline',
    color: '#3395FF',
    bg: '#EFF6FF',
    description: 'India\'s leading payment gateway. Supports cards, UPI, netbanking & wallets.',
    fields: [
      { key: 'keyId', label: 'Key ID', placeholder: 'rzp_live_...', secure: false, required: true },
      { key: 'keySecret', label: 'Key Secret', placeholder: 'Enter Key Secret', secure: true, required: true },
      { key: 'webhookSecret', label: 'Webhook Secret', placeholder: 'Enter Webhook Secret (optional)', secure: true, required: false },
    ],
    switches: [
      { key: 'testMode', label: 'Test Mode', desc: 'Use Razorpay test credentials' },
    ],
  },
  {
    id: 'paytm',
    name: 'PayTM',
    icon: 'wallet-outline',
    color: '#00BAF2',
    bg: '#E0F7FD',
    description: 'PayTM payment gateway for UPI, wallets, cards and netbanking.',
    fields: [
      { key: 'merchantId', label: 'Merchant ID', placeholder: 'Enter PayTM Merchant ID', secure: false, required: true },
      { key: 'merchantKey', label: 'Merchant Key', placeholder: 'Enter Merchant Key', secure: true, required: true },
      { key: 'website', label: 'Website', placeholder: 'WEBSTAGING or WEBPROD', secure: false, required: false },
      { key: 'callbackUrl', label: 'Callback URL', placeholder: 'https://yourdomain.com/paytm/callback', secure: false, required: false },
    ],
    switches: [
      { key: 'testMode', label: 'Test Mode', desc: 'Use PayTM staging environment' },
    ],
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: 'phone-portrait-outline',
    color: '#5F259F',
    bg: '#F3E8FF',
    description: 'PhonePe payment gateway for UPI and wallet payments.',
    fields: [
      { key: 'merchantId', label: 'Merchant ID', placeholder: 'Enter PhonePe Merchant ID', secure: false, required: true },
      { key: 'saltKey', label: 'Salt Key', placeholder: 'Enter Salt Key', secure: true, required: true },
      { key: 'saltIndex', label: 'Salt Index', placeholder: '1', secure: false, required: false },
      { key: 'callbackUrl', label: 'Callback URL', placeholder: 'https://yourdomain.com/phonepe/callback', secure: false, required: false },
    ],
    switches: [
      { key: 'testMode', label: 'Test Mode', desc: 'Use PhonePe UAT environment' },
    ],
  },
  {
    id: 'upi',
    name: 'UPI Payments',
    icon: 'qr-code-outline',
    color: '#FF6B00',
    bg: '#FFF3E0',
    description: 'Direct UPI payments via VPA (Virtual Payment Address).',
    fields: [
      { key: 'vpa', label: 'UPI VPA', placeholder: 'yourname@bankname', secure: false, required: true },
      { key: 'merchantName', label: 'Merchant Name', placeholder: 'Your Business Name', secure: false, required: true },
      { key: 'description', label: 'Payment Description', placeholder: 'Payment for services', secure: false, required: false },
    ],
    switches: [],
  },
  {
    id: 'creditCard',
    name: 'Credit Card',
    icon: 'card-outline',
    color: '#10B981',
    bg: '#ECFDF5',
    description: 'Accept credit card payments via your configured payment gateway.',
    fields: [
      { key: 'provider', label: 'Gateway Provider', placeholder: 'razorpay / paytm / phonepe', secure: false, required: false },
      { key: 'note', label: 'Note', placeholder: 'Internal note about credit card processing', secure: false, required: false },
    ],
    switches: [],
  },
  {
    id: 'debitCard',
    name: 'Debit Card',
    icon: 'card-outline',
    color: '#F59E0B',
    bg: '#FEF3C7',
    description: 'Accept debit card payments via your configured payment gateway.',
    fields: [
      { key: 'provider', label: 'Gateway Provider', placeholder: 'razorpay / paytm / phonepe', secure: false, required: false },
      { key: 'note', label: 'Note', placeholder: 'Internal note about debit card processing', secure: false, required: false },
    ],
    switches: [],
  },
];

// ─── Main Screen ─────────────────────────────────────────────────────────────

const AdminPaymentOptionsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const S = getStyles(isMobile, isTablet);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // gateway id being saved
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState('razorpay');
  const [gateways, setGateways] = useState({});
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstPercentage, setGstPercentage] = useState('18');
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, revenue: 0 });

  useEffect(() => {
    fetchUser();
    loadSettings();
    loadStats();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setUser(d.user || d); }
      }
    } catch (e) {}
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const p = data.settings?.payment || {};
        setGlobalEnabled(p.enablePayments !== false);
        setCurrency(p.defaultCurrency || 'INR');
        setGstEnabled(p.gstEnabled !== false);
        setGstPercentage(String(p.gstPercentage ?? 18));
        // Build local gateway state — merge server data with defaults
        const built = {};
        GATEWAYS.forEach(gw => {
          const srv = p.paymentGateways?.[gw.id] || {};
          const defaults = {};
          gw.fields.forEach(f => { defaults[f.key] = ''; });
          gw.switches.forEach(s => { defaults[s.key] = true; });
          built[gw.id] = { enabled: false, ...defaults, ...srv };
          // Mask secrets shown as ****
          gw.fields.filter(f => f.secure).forEach(f => {
            if (built[gw.id][f.key] === '****') built[gw.id][f.key] = '';
          });
        });
        setGateways(built);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/razorpay/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const txns = data.transactions || [];
        setStats({
          total: txns.length,
          success: txns.filter(t => t.status === 'success' || t.status === 'captured').length,
          failed: txns.filter(t => t.status === 'failed').length,
          revenue: txns.filter(t => t.status === 'success' || t.status === 'captured').reduce((s, t) => s + (t.amount || 0), 0),
        });
      }
    } catch (e) {}
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSettings();
    loadStats();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const updateGateway = (gwId, key, value) => {
    setGateways(prev => ({ ...prev, [gwId]: { ...prev[gwId], [key]: value } }));
  };

  const saveGateway = async (gwId) => {
    const gw = GATEWAYS.find(g => g.id === gwId);
    const data = gateways[gwId] || {};
    // Validate required fields if enabled
    if (data.enabled) {
      for (const f of gw.fields.filter(f => f.required)) {
        if (!data[f.key]?.trim()) {
          Alert.alert('Validation Error', `${f.label} is required to enable ${gw.name}`);
          return;
        }
      }
    }
    try {
      setSaving(gwId);
      const token = await AsyncStorage.getItem('token');
      const body = {
        enablePayments: globalEnabled,
        defaultCurrency: currency,
        gstEnabled,
        gstPercentage: Number(gstPercentage),
        paymentGateways: { [gwId]: data },
      };
      const res = await fetch(`${API_URL}/api/settings/payment`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        Alert.alert('Saved', `${gw.name} settings saved successfully.`);
        loadSettings();
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save settings');
    } finally {
      setSaving(null);
    }
  };

  const saveGlobal = async () => {
    try {
      setSaving('global');
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/settings/payment`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ enablePayments: globalEnabled, defaultCurrency: currency, gstEnabled, gstPercentage: Number(gstPercentage) }),
      });
      const result = await res.json();
      if (res.ok && result.success) Alert.alert('Saved', 'Global payment settings saved.');
      else throw new Error(result.message || 'Save failed');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  const handleNavigate = (screen) => navigation.navigate(screen);
  const handleLogout = () => navigation.replace('AdminLogin');

  if (loading) {
    return (
      <AdminLayout title="Payment Options" activeScreen="AdminPaymentOptions" onNavigate={handleNavigate} user={user} onLogout={handleLogout}>
        <View style={S.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={S.loadingTxt}>Loading payment settings...</Text></View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Payment Options" activeScreen="AdminPaymentOptions" onNavigate={handleNavigate} user={user} onLogout={handleLogout}>
      <ScrollView style={S.page} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Page header */}
        <View style={S.pageHeader}>
          <View>
            <Text style={S.pageTitle}>Payment Options</Text>
            <Text style={S.pageSub}>Configure payment gateways — PayTM, PhonePe, UPI, Razorpay, Cards & more</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={S.statsRow}>
          {[
            { label: 'Total Transactions', value: stats.total, icon: 'receipt-outline', bg: '#EFF6FF', ic: colors.primary },
            { label: 'Successful', value: stats.success, icon: 'checkmark-circle-outline', bg: '#ECFDF5', ic: '#10B981' },
            { label: 'Failed', value: stats.failed, icon: 'close-circle-outline', bg: '#FEF2F2', ic: '#EF4444' },
            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: 'cash-outline', bg: '#FEF3C7', ic: '#F59E0B' },
          ].map(s => (
            <View key={s.label} style={S.statCard}>
              <View style={[S.statIcon, { backgroundColor: s.bg }]}><Ionicons name={s.icon} size={26} color={s.ic} /></View>
              <Text style={S.statVal}>{s.value}</Text>
              <Text style={S.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Global settings */}
        <View style={S.card}>
          <Text style={S.cardTitle}>Global Payment Settings</Text>
          <View style={S.switchRow}>
            <View style={S.switchInfo}><Text style={S.switchLabel}>Enable Payments</Text><Text style={S.switchDesc}>Allow users to make payments on the platform</Text></View>
            <Switch value={globalEnabled} onValueChange={setGlobalEnabled} trackColor={{ false: '#CBD5E1', true: colors.primary }} thumbColor="#fff" />
          </View>
          <View style={S.switchRow}>
            <View style={S.switchInfo}><Text style={S.switchLabel}>GST Enabled</Text><Text style={S.switchDesc}>Apply GST on all transactions</Text></View>
            <Switch value={gstEnabled} onValueChange={setGstEnabled} trackColor={{ false: '#CBD5E1', true: colors.primary }} thumbColor="#fff" />
          </View>
          <View style={S.row}>
            <View style={[S.inputGroup, { flex: 1 }]}>
              <Text style={S.inputLabel}>Currency</Text>
              <TextInput style={S.input} value={currency} onChangeText={setCurrency} placeholder="INR" placeholderTextColor="#94A3B8" />
            </View>
            <View style={[S.inputGroup, { flex: 1 }]}>
              <Text style={S.inputLabel}>GST %</Text>
              <TextInput style={S.input} value={gstPercentage} onChangeText={setGstPercentage} placeholder="18" keyboardType="numeric" placeholderTextColor="#94A3B8" />
            </View>
          </View>
          <TouchableOpacity style={S.saveBtn} onPress={saveGlobal} disabled={saving === 'global'}>
            {saving === 'global' ? <ActivityIndicator size="small" color="#fff" /> : <><Ionicons name="save-outline" size={18} color="#fff" /><Text style={S.saveBtnTxt}>Save Global Settings</Text></>}
          </TouchableOpacity>
        </View>

        {/* Gateway cards */}
        {GATEWAYS.map(gw => {
          const gwData = gateways[gw.id] || {};
          const isOpen = expanded === gw.id;
          return (
            <View key={gw.id} style={S.card}>
              {/* Gateway header row */}
              <TouchableOpacity style={S.gwHeader} onPress={() => setExpanded(isOpen ? null : gw.id)} activeOpacity={0.8}>
                <View style={[S.gwIconWrap, { backgroundColor: gw.bg }]}>
                  <Ionicons name={gw.icon} size={24} color={gw.color} />
                </View>
                <View style={S.gwInfo}>
                  <Text style={S.gwName}>{gw.name}</Text>
                  <Text style={S.gwDesc} numberOfLines={1}>{gw.description}</Text>
                </View>
                <View style={S.gwRight}>
                  <View style={[S.badge, gwData.enabled ? S.badgeOn : S.badgeOff]}>
                    <Text style={[S.badgeTxt, gwData.enabled ? S.badgeTxtOn : S.badgeTxtOff]}>
                      {gwData.enabled ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#64748B" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>

              {isOpen && (
                <View style={S.gwBody}>
                  {/* Enable toggle */}
                  <View style={S.switchRow}>
                    <View style={S.switchInfo}>
                      <Text style={S.switchLabel}>Enable {gw.name}</Text>
                      <Text style={S.switchDesc}>{gw.description}</Text>
                    </View>
                    <Switch
                      value={!!gwData.enabled}
                      onValueChange={v => updateGateway(gw.id, 'enabled', v)}
                      trackColor={{ false: '#CBD5E1', true: gw.color }}
                      thumbColor="#fff"
                    />
                  </View>

                  {/* Extra switches (testMode etc.) */}
                  {gw.switches.map(sw => (
                    <View key={sw.key} style={S.switchRow}>
                      <View style={S.switchInfo}><Text style={S.switchLabel}>{sw.label}</Text><Text style={S.switchDesc}>{sw.desc}</Text></View>
                      <Switch
                        value={!!gwData[sw.key]}
                        onValueChange={v => updateGateway(gw.id, sw.key, v)}
                        trackColor={{ false: '#CBD5E1', true: colors.primary }}
                        thumbColor="#fff"
                      />
                    </View>
                  ))}

                  {/* Fields */}
                  {gw.fields.map(f => (
                    <View key={f.key} style={S.inputGroup}>
                      <Text style={S.inputLabel}>{f.label}{f.required && <Text style={{ color: '#EF4444' }}> *</Text>}</Text>
                      <TextInput
                        style={S.input}
                        value={gwData[f.key] || ''}
                        onChangeText={v => updateGateway(gw.id, f.key, v)}
                        placeholder={f.placeholder}
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={f.secure}
                        autoCapitalize="none"
                      />
                    </View>
                  ))}

                  {/* Save button */}
                  <TouchableOpacity
                    style={[S.saveBtn, { backgroundColor: gw.color }]}
                    onPress={() => saveGateway(gw.id)}
                    disabled={saving === gw.id}
                  >
                    {saving === gw.id
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <><Ionicons name="save-outline" size={18} color="#fff" /><Text style={S.saveBtnTxt}>Save {gw.name} Settings</Text></>
                    }
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </AdminLayout>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingTxt: { color: '#64748B', marginTop: 12, fontSize: 14 },

  pageHeader: { marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: '#E2E8F0' },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#1A202C', letterSpacing: -0.5 },
  pageSub: { fontSize: 14, color: '#64748B', marginTop: 4 },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, minWidth: 130, backgroundColor: '#fff', borderRadius: 14, padding: 16,
    ...shadows.md, borderWidth: 1, borderColor: '#F1F5F9',
  },
  statIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statVal: { fontSize: 24, fontWeight: '800', color: '#1A202C', marginBottom: 2 },
  statLbl: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
    ...shadows.md, borderWidth: 1, borderColor: '#F1F5F9',
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1A202C', marginBottom: 16 },

  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 8,
  },
  switchInfo: { flex: 1, paddingRight: 12 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#1A202C', marginBottom: 2 },
  switchDesc: { fontSize: 12, color: '#64748B' },

  row: { flexDirection: 'row', gap: 12 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#1A202C', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 14, fontSize: 14, color: '#1A202C', backgroundColor: '#fff',
  },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, paddingVertical: 13, borderRadius: 10, marginTop: 8,
    ...shadows.sm,
  },
  saveBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Gateway card
  gwHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gwIconWrap: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  gwInfo: { flex: 1 },
  gwName: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  gwDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  gwRight: { flexDirection: 'row', alignItems: 'center' },
  gwBody: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeOn: { backgroundColor: '#ECFDF5' },
  badgeOff: { backgroundColor: '#F1F5F9' },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  badgeTxtOn: { color: '#10B981' },
  badgeTxtOff: { color: '#94A3B8' },
});

export default AdminPaymentOptionsScreen;
