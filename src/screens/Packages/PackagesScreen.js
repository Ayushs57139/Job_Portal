import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const isWebPlatform = Platform.OS === 'web';

const ACCENT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9', '#14B8A6',
];

const PackagesScreen = () => {
  const [selectedTab, setSelectedTab] = useState('employer');
  const [loading, setLoading] = useState(true);
  const [employerPackages, setEmployerPackages] = useState([]);
  const [candidatePackages, setCandidatePackages] = useState([]);

  const responsive = useResponsive();
  const { width } = responsive;
  const isMobile = width <= 600;
  const isDesktop = width > 1024;

  useEffect(() => {
    fetchPackages();
    const interval = setInterval(fetchPackages, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const [employerData, candidateData] = await Promise.all([
        api.request('/packages?packageType=employer&isActive=true'),
        api.request('/packages?packageType=candidate&isActive=true'),
      ]);

      if (employerData.success) {
        setEmployerPackages(employerData.packages.map((pkg, i) => transformPackage(pkg, i)));
      }
      if (candidateData.success) {
        setCandidatePackages(candidateData.packages.map((pkg, i) => transformPackage(pkg, i + 3)));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load packages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const transformPackage = (pkg, index) => ({
    id: pkg._id,
    title: pkg.name,
    subtitle: pkg.description.substring(0, 60) + (pkg.description.length > 60 ? '...' : ''),
    price: pkg.price === 0 ? 'FREE' : `${pkg.currency === 'INR' ? '₹' : '$'}${pkg.price.toLocaleString()}`,
    isFree: pkg.price === 0,
    popular: pkg.isFeatured,
    accentColor: ACCENT_COLORS[index % ACCENT_COLORS.length],
    period: `${pkg.periodValue} ${pkg.period}`,
    gstApplicable: pkg.gstApplicable,
    supportIncluded: pkg.supportIncluded,
    supportDetails: pkg.supportDetails,
    features: pkg.features.map((f) => ({
      icon: getIconForFeature(f.name),
      label: f.name,
      value: f.value,
      included: f.included,
    })),
  });

  const getIconForFeature = (name) => {
    const n = name.toLowerCase();
    if (n.includes('user') || n.includes('superuser')) return 'person-outline';
    if (n.includes('subuser')) return 'people-outline';
    if (n.includes('job post')) return 'briefcase-outline';
    if (n.includes('featured')) return 'star-outline';
    if (n.includes('candidate') || n.includes('applies')) return 'people-outline';
    if (n.includes('expiry') || n.includes('time')) return 'time-outline';
    if (n.includes('cv') || n.includes('resume')) return 'document-text-outline';
    if (n.includes('invite') || n.includes('mail') || n.includes('email')) return 'mail-outline';
    if (n.includes('chat') || n.includes('support')) return 'chatbubble-outline';
    if (n.includes('validity') || n.includes('period')) return 'calendar-outline';
    if (n.includes('priority') || n.includes('boost')) return 'trophy-outline';
    if (n.includes('highlight')) return 'flash-outline';
    if (n.includes('referral') || n.includes('gift')) return 'gift-outline';
    return 'checkmark-circle-outline';
  };

  const renderPackageCard = (pkg, isCandidate = false) => (
    <View key={pkg.id} style={[styles.pkgCard, isMobile && styles.pkgCardMobile]}>
      {/* Card header */}
      <View style={[styles.pkgHeader, { borderTopColor: pkg.accentColor }]}>
        {pkg.popular && (
          <View style={[styles.popularBadge, { backgroundColor: pkg.accentColor }]}>
            <Ionicons name="star" size={10} color="#FFF" />
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
        )}
        <View style={[styles.pkgIconBox, { backgroundColor: pkg.accentColor + '15' }]}>
          <Ionicons name={isCandidate ? 'person-circle-outline' : 'business-outline'} size={28} color={pkg.accentColor} />
        </View>
        <Text style={styles.pkgTitle}>{pkg.title}</Text>
        <Text style={styles.pkgSubtitle}>{pkg.subtitle}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.pkgPrice, { color: pkg.accentColor }]}>{pkg.price}</Text>
          {!pkg.isFree && pkg.gstApplicable && (
            <Text style={styles.gstNote}>+GST</Text>
          )}
        </View>
        {pkg.period && (
          <View style={styles.periodRow}>
            <Ionicons name="time-outline" size={13} color="#64748B" />
            <Text style={styles.periodText}>Valid for {pkg.period}</Text>
          </View>
        )}
      </View>

      {/* Features */}
      <View style={styles.pkgFeatures}>
        {pkg.features.map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <View style={styles.featureLeft}>
              <Ionicons
                name={f.icon}
                size={15}
                color={f.included ? '#10B981' : '#EF4444'}
              />
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
            <Text style={[styles.featureValue, { color: f.included ? '#10B981' : '#EF4444' }]}>
              {f.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Support */}
      {pkg.supportIncluded && pkg.supportDetails && (
        <View style={styles.supportBox}>
          <Ionicons name="chatbubble-ellipses-outline" size={15} color="#10B981" />
          <Text style={styles.supportText}>{pkg.supportDetails}</Text>
        </View>
      )}

      {/* CTA */}
      <TouchableOpacity style={[styles.pkgBtn, { backgroundColor: pkg.accentColor }]}>
        <Text style={styles.pkgBtnText}>
          {isCandidate ? 'Boost My Profile' : pkg.isFree ? 'Get Started' : 'Choose Plan'}
        </Text>
        <Ionicons name={isCandidate ? 'rocket-outline' : 'arrow-forward'} size={16} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      </View>
    );
  }

  const packages = selectedTab === 'employer' ? employerPackages : candidatePackages;

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Choose Your Plan</Text>
          <Text style={styles.heroSubtitle}>Unlock premium features and grow your career or business</Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabWrapper}>
          <View style={styles.tabBar}>
            {[
              { id: 'employer', label: 'For Employers', icon: 'business-outline' },
              { id: 'candidate', label: 'For Candidates', icon: 'person-outline' },
            ].map((tab) => {
              const isActive = selectedTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setSelectedTab(tab.id)}
                >
                  <Ionicons name={tab.icon} size={16} color={isActive ? '#FFF' : '#64748B'} />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section header */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionAccent} />
          <View>
            <Text style={styles.sectionTitle}>
              {selectedTab === 'employer' ? 'Employer Packages' : 'Candidate Packages'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {selectedTab === 'employer'
                ? 'Find and hire top talent with the right plan'
                : 'Boost your profile visibility and get noticed by recruiters'}
            </Text>
          </View>
        </View>

        {/* Packages grid */}
        {packages.length > 0 ? (
          <View style={[styles.pkgGrid, isMobile && styles.pkgGridMobile]}>
            {packages.map((pkg) => renderPackageCard(pkg, selectedTab === 'candidate'))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="cube-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyText}>No packages available</Text>
            <Text style={styles.emptySubtext}>Check back later</Text>
          </View>
        )}

        {/* Referral section (candidate only) */}
        {selectedTab === 'candidate' && (
          <View style={styles.referralCard}>
            <View style={styles.referralLeft}>
              <View style={styles.referralIconBox}>
                <Ionicons name="gift-outline" size={28} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.referralTitle}>Referral Program</Text>
                <Text style={styles.referralDesc}>
                  Refer 20 Job Seekers & Get Profile Booster Package FREE!
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.referralBtn}>
              <Ionicons name="share-social-outline" size={16} color="#FFF" />
              <Text style={styles.referralBtnText}>Invite Friends</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer trust badges */}
        <View style={[styles.trustRow, isMobile && styles.trustRowMobile]}>
          {[
            { icon: 'shield-checkmark-outline', title: 'Secure Payment', desc: 'All transactions are encrypted' },
            { icon: 'headset-outline', title: '24/7 Support', desc: "We're here to help you succeed" },
            { icon: 'refresh-outline', title: 'Flexible Plans', desc: 'Upgrade or downgrade anytime' },
          ].map((item) => (
            <View key={item.title} style={styles.trustCard}>
              <Ionicons name={item.icon} size={24} color={colors.primary} />
              <Text style={styles.trustTitle}>{item.title}</Text>
              <Text style={styles.trustDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748B' },

  hero: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  heroSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },

  tabWrapper: { paddingHorizontal: 16, paddingVertical: 16 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 10, borderRadius: 8,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#FFF' },

  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: 16, marginBottom: 16,
  },
  sectionAccent: { width: 4, height: 44, backgroundColor: colors.primary, borderRadius: 2, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#64748B' },

  pkgGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 14,
    paddingHorizontal: 16, paddingBottom: 8,
    justifyContent: 'flex-start',
  },
  pkgGridMobile: { flexDirection: 'column' },

  pkgCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    width: isWebPlatform ? 'calc(33.33% - 10px)' : '100%',
    minWidth: 280,
    ...(isWebPlatform && { boxShadow: '0 2px 8px rgba(15,23,42,0.07)' }),
  },
  pkgCardMobile: { width: '100%' },

  pkgHeader: {
    padding: 20,
    borderTopWidth: 4,
    borderTopColor: '#6366F1',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  popularText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  pkgIconBox: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  pkgTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  pkgSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 14, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 },
  pkgPrice: { fontSize: 32, fontWeight: '800' },
  gstNote: { fontSize: 12, color: '#94A3B8' },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  periodText: { fontSize: 12, color: '#64748B' },

  pkgFeatures: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  featureRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  featureLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  featureLabel: { fontSize: 13, color: '#334155', flex: 1 },
  featureValue: { fontSize: 13, fontWeight: '600' },

  supportBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginHorizontal: 16, marginBottom: 12, padding: 12,
    backgroundColor: '#F0FDF4', borderRadius: 8,
    borderLeftWidth: 3, borderLeftColor: '#10B981',
  },
  supportText: { fontSize: 12, color: '#166534', flex: 1, lineHeight: 18 },

  pkgBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, marginTop: 4, paddingVertical: 13, borderRadius: 10,
  },
  pkgBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIconBox: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: '#64748B' },

  referralCard: {
    marginHorizontal: 16, marginVertical: 16,
    backgroundColor: '#FFFBEB', borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: '#FDE68A',
    flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap',
  },
  referralLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 200 },
  referralIconBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center',
  },
  referralTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  referralDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  referralBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F59E0B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
  },
  referralBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  trustRow: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8,
  },
  trustRowMobile: { flexDirection: 'column' },
  trustCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  trustTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 10, marginBottom: 4, textAlign: 'center' },
  trustDesc: { fontSize: 12, color: '#64748B', textAlign: 'center' },
});

export default PackagesScreen;
