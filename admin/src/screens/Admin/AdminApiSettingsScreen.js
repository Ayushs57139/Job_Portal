import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Switch, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { colors, spacing, shadows, borderRadius } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

// ─── API Group Definitions ────────────────────────────────────────────────────

const API_GROUPS = [
  {
    id: 'googleMaps',
    name: 'Google Maps',
    icon: 'map-outline',
    color: '#4285F4',
    bg: '#EBF3FE',
    description: 'Location autocomplete, maps display and geocoding.',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'AIzaSy...', secure: true, required: true },
      { key: 'note', label: 'Note', placeholder: 'Internal note', secure: false, required: false },
    ],
    switches: [],
  },
  {
    id: 'googleOAuth',
    name: 'Google OAuth',
    icon: 'logo-google',
    color: '#DB4437',
    bg: '#FDECEA',
    description: 'Allow users to sign in with their Google account.',
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'xxxx.apps.googleusercontent.com', secure: false, required: true },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'GOCSPX-...', secure: true, required: true },
      { key: 'callbackUrl', label: 'Callback URL', placeholder: 'https://yourdomain.com/auth/google/callback', secure: false, required: false },
    ],
    switches: [],
  },
  {
    id: 'facebookOAuth',
    name: 'Facebook OAuth',
    icon: 'logo-facebook',
    color: '#1877F2',
    bg: '#E7F0FD',
    description: 'Allow users to sign in with their Facebook account.',
    fields: [
      { key: 'appId', label: 'App ID', placeholder: 'Enter Facebook App ID', secure: false, required: true },
      { key: 'appSecret', label: 'App Secret', placeholder: 'Enter App Secret', secure: true, required: true },
      { key: 'callbackUrl', label: 'Callback URL', placeholder: 'https://yourdomain.com/auth/facebook/callback', secure: false, required: false },
    ],
    switches: [],
  },
  {
    id: 'linkedinOAuth',
    name: 'LinkedIn OAuth',
    icon: 'logo-linkedin',
    color: '#0A66C2',
    bg: '#E8F1FB',
    description: 'Allow users to sign in with their LinkedIn account.',
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'Enter LinkedIn Client ID', secure: false, required: true },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'Enter Client Secret', secure: true, required: true },
      { key: 'callbackUrl', label: 'Callback URL', placeholder: 'https://yourdomain.com/auth/linkedin/callback', secure: false, required: false },
    ],
    switches: [],
  },
  {
    id: 'emailLogin',
    name: 'Email Login (JWT)',
    icon: 'mail-outline',
    color: '#10B981',
    bg: '#ECFDF5',
    description: 'Standard email & password login using JWT tokens.',
    fields: [
      { key: 'jwtSecret', label: 'JWT Secret', placeholder: 'Enter a strong random secret', secure: true, required: true },
      { key: 'jwtExpiresIn', label: 'Token Expiry', placeholder: '7d / 24h / 30d', secure: false, required: false },
    ],
    switches: [],
  },
  {
    id: 'mobileOtp',
    name: 'Mobile OTP Login',
    icon: 'phone-portrait-outline',
    color: '#F59E0B',
    bg: '#FEF3C7',
    description: 'OTP-based login via SMS for mobile numbers.',
    fields: [
      { key: 'provider', label: 'Provider', placeholder: 'msg91 / twilio / fast2sms', secure: false, required: false },
      { key: 'apiKey', label: 'API Key', placeholder: 'Enter SMS provider API key', secure: true, required: true },
      { key: 'senderId', label: 'Sender ID', placeholder: 'FREEJB', secure: false, required: false },
      { key: 'templateId', label: 'Template ID', placeholder: 'OTP template ID', secure: false, required: false },
      { key: 'otpExpiry', label: 'OTP Expiry (minutes)', placeholder: '10', secure: false, required: false },
    ],
    switches: [],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp API',
    icon: 'logo-whatsapp',
    color: '#25D366',
    bg: '#E8FBF0',
    description: 'Send WhatsApp messages for OTP, notifications and alerts.',
    fields: [
      { key: 'provider', label: 'Provider', placeholder: 'wati / twilio / meta / interakt', secure: false, required: false },
      { key: 'apiKey', label: 'API Key / Auth Token', placeholder: 'Enter API key', secure: true, required: true },
      { key: 'apiUrl', label: 'API URL', placeholder: 'https://live-mt-server.wati.io/...', secure: false, required: false },
      { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: 'Meta phone number ID', secure: false, required: false },
      { key: 'accessToken', label: 'Access Token', placeholder: 'Meta access token', secure: true, required: false },
      { key: 'webhookVerifyToken', label: 'Webhook Verify Token', placeholder: 'Custom verify token', secure: false, required: false },
    ],
    switches: [],
  },
  {
    id: 'arattai',
    name: 'Arattai API (Chat)',
    icon: 'chatbubbles-outline',
    color: '#8B5CF6',
    bg: '#F3E8FF',
    description: 'Arattai live chat and messaging integration.',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Enter Arattai API key', secure: true, required: true },
      { key: 'apiUrl', label: 'API URL', placeholder: 'https://api.arattai.com', secure: false, required: false },
      { key: 'appId', label: 'App ID', placeholder: 'Enter App ID', secure: false, required: false },
      { key: 'region', label: 'Region', placeholder: 'in / us / eu', secure: false, required: false },
    ],
    switches: [],
  },
  {
    id: 'firebase',
    name: 'Firebase (Push Notifications)',
    icon: 'notifications-outline',
    color: '#FF6D00',
    bg: '#FFF3E0',
    description: 'Firebase Cloud Messaging for push notifications.',
    fields: [
      { key: 'projectId', label: 'Project ID', placeholder: 'your-firebase-project', secure: false, required: true },
      { key: 'serverKey', label: 'Server Key', placeholder: 'AAAA...', secure: true, required: true },
      { key: 'vapidKey', label: 'VAPID Key (Web)', placeholder: 'BNtq...', secure: false, required: false },
    ],
    switches: [],
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary (Media Storage)',
    icon: 'cloud-upload-outline',
    color: '#3448C5',
    bg: '#EEF0FD',
    description: 'Cloud storage for images, resumes and media files.',
    fields: [
      { key: 'cloudName', label: 'Cloud Name', placeholder: 'your-cloud-name', secure: false, required: true },
      { key: 'apiKey', label: 'API Key', placeholder: 'Enter Cloudinary API key', secure: false, required: true },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'Enter API Secret', secure: true, required: true },
    ],
    switches: [],
  },
  {
    id: 'awsS3',
    name: 'AWS S3 (File Storage)',
    icon: 'server-outline',
    color: '#FF9900',
    bg: '#FFF8EC',
    description: 'Amazon S3 for scalable file and document storage.',
    fields: [
      { key: 'accessKeyId', label: 'Access Key ID', placeholder: 'AKIA...', secure: false, required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', placeholder: 'Enter Secret Access Key', secure: true, required: true },
      { key: 'region', label: 'Region', placeholder: 'ap-south-1', secure: false, required: false },
      { key: 'bucketName', label: 'Bucket Name', placeholder: 'your-bucket-name', secure: false, required: true },
    ],
    switches: [],
  },
];

// ─── Main Screen ─────────────────────────────────────────────────────────────

const AdminApiSettingsScreen = ({ navigation }) => {
  const { isMobile, isTablet } = useResponsive();
  const S = getStyles(isMobile, isTablet);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState('googleMaps');
  const [apis, setApis] = useState({});

  useEffect(() => { fetchUser(); loadSettings(); }, []);

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
        const ak = data.settings?.apiKeys || {};
        const built = {};
        API_GROUPS.forEach(g => {
          const srv = ak[g.id] || {};
          const defaults = { enabled: false };
          g.fields.forEach(f => { defaults[f.key] = ''; });
          built[g.id] = { ...defaults, ...srv };
          // Clear masked secrets
          g.fields.filter(f => f.secure).forEach(f => {
            if (built[g.id][f.key] === '****') built[g.id][f.key] = '';
          });
        });
        setApis(built);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load API settings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadSettings().finally(() => setRefreshing(false)); };

  const update = (id, key, value) => setApis(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  const save = async (groupId) => {
    const grp = API_GROUPS.find(g => g.id === groupId);
    const data = apis[groupId] || {};
    if (data.enabled) {
      for (const f of grp.fields.filter(f => f.required)) {
        if (!data[f.key]?.toString().trim()) {
          Alert.alert('Validation', `${f.label} is required to enable ${grp.name}`);
          return;
        }
      }
    }
    try {
      setSaving(groupId);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/settings/api-keys`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ [groupId]: data }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        Alert.alert('Saved', `${grp.name} settings saved.`);
        loadSettings();
      } else throw new Error(result.message || 'Save failed');
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
      <AdminLayout title="API Settings" activeScreen="AdminApiSettings" onNavigate={handleNavigate} user={user} onLogout={handleLogout}>
        <View style={S.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={S.loadingTxt}>Loading API settings...</Text></View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="API Settings" activeScreen="AdminApiSettings" onNavigate={handleNavigate} user={user} onLogout={handleLogout}>
      <ScrollView style={S.page} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Header */}
        <View style={S.pageHeader}>
          <View>
            <Text style={S.pageTitle}>API Management</Text>
            <Text style={S.pageSub}>Manage API keys for Maps, OAuth, OTP, WhatsApp, Chat and storage integrations</Text>
          </View>
        </View>

        {/* Info banner */}
        <View style={S.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
          <Text style={S.infoTxt}>Secrets are masked after saving. Re-enter only if you want to change them. All keys are stored encrypted.</Text>
        </View>

        {/* API group cards */}
        {API_GROUPS.map(grp => {
          const data = apis[grp.id] || {};
          const isOpen = expanded === grp.id;
          return (
            <View key={grp.id} style={S.card}>
              <TouchableOpacity style={S.gwHeader} onPress={() => setExpanded(isOpen ? null : grp.id)} activeOpacity={0.8}>
                <View style={[S.gwIcon, { backgroundColor: grp.bg }]}>
                  <Ionicons name={grp.icon} size={22} color={grp.color} />
                </View>
                <View style={S.gwInfo}>
                  <Text style={S.gwName}>{grp.name}</Text>
                  <Text style={S.gwDesc} numberOfLines={1}>{grp.description}</Text>
                </View>
                <View style={S.gwRight}>
                  <View style={[S.badge, data.enabled ? S.badgeOn : S.badgeOff]}>
                    <Text style={[S.badgeTxt, data.enabled ? S.badgeTxtOn : S.badgeTxtOff]}>
                      {data.enabled ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>

              {isOpen && (
                <View style={S.body}>
                  {/* Enable toggle */}
                  <View style={S.switchRow}>
                    <View style={S.switchInfo}>
                      <Text style={S.switchLabel}>Enable {grp.name}</Text>
                      <Text style={S.switchDesc}>{grp.description}</Text>
                    </View>
                    <Switch
                      value={!!data.enabled}
                      onValueChange={v => update(grp.id, 'enabled', v)}
                      trackColor={{ false: '#CBD5E1', true: grp.color }}
                      thumbColor="#fff"
                    />
                  </View>

                  {/* Fields */}
                  {grp.fields.map(f => (
                    <View key={f.key} style={S.inputGroup}>
                      <Text style={S.inputLabel}>{f.label}{f.required && <Text style={{ color: '#EF4444' }}> *</Text>}</Text>
                      <TextInput
                        style={S.input}
                        value={data[f.key] != null ? String(data[f.key]) : ''}
                        onChangeText={v => update(grp.id, f.key, v)}
                        placeholder={f.placeholder}
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={f.secure}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[S.saveBtn, { backgroundColor: grp.color }]}
                    onPress={() => save(grp.id)}
                    disabled={saving === grp.id}
                  >
                    {saving === grp.id
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <><Ionicons name="save-outline" size={16} color="#fff" /><Text style={S.saveBtnTxt}>Save {grp.name}</Text></>
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

  pageHeader: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: '#E2E8F0' },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#1A202C', letterSpacing: -0.5 },
  pageSub: { fontSize: 14, color: '#64748B', marginTop: 4 },

  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#EFF6FF', borderRadius: 10, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: '#BFDBFE',
  },
  infoTxt: { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 18 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14,
    ...shadows.md, borderWidth: 1, borderColor: '#F1F5F9',
  },
  gwHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gwIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  gwInfo: { flex: 1 },
  gwName: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  gwDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  gwRight: { flexDirection: 'row', alignItems: 'center' },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeOn: { backgroundColor: '#ECFDF5' },
  badgeOff: { backgroundColor: '#F1F5F9' },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  badgeTxtOn: { color: '#10B981' },
  badgeTxtOff: { color: '#94A3B8' },

  body: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },

  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 12,
  },
  switchInfo: { flex: 1, paddingRight: 12 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#1A202C', marginBottom: 2 },
  switchDesc: { fontSize: 12, color: '#64748B' },

  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#1A202C', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10,
    paddingVertical: 11, paddingHorizontal: 14, fontSize: 14, color: '#1A202C', backgroundColor: '#fff',
  },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 10, marginTop: 6, ...shadows.sm,
  },
  saveBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default AdminApiSettingsScreen;
