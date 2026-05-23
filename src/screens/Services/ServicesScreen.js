import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../styles/theme';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../config/api';

const ServicesScreen = ({ navigation }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    try {
      const res = await fetch(`${api.baseURL}/packages?isActive=true`);
      const data = await res.json();
      if (data.success && data.packages) setPackages(data.packages);
    } catch (e) {
      console.warn('Services load error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadServices(); };

  const serviceFeatures = [
    { icon: 'briefcase-outline', title: 'Job Posting', desc: 'Post unlimited jobs and reach thousands of candidates instantly.' },
    { icon: 'people-outline', title: 'Candidate Search', desc: 'Search and filter from a vast pool of verified candidates.' },
    { icon: 'document-text-outline', title: 'Resume Access', desc: 'Access detailed resumes and profiles of job seekers.' },
    { icon: 'notifications-outline', title: 'Job Alerts', desc: 'Automated alerts to notify candidates about matching jobs.' },
    { icon: 'shield-checkmark-outline', title: 'Verified Profiles', desc: 'All employer and candidate profiles are KYC verified.' },
    { icon: 'chatbubbles-outline', title: 'Live Chat Support', desc: 'Real-time support for employers and job seekers.' },
  ];

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Our Services</Text>
          <Text style={styles.heroSubtitle}>
            Everything you need to hire smarter or land your dream job
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.featuresGrid}>
            {serviceFeatures.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <Ionicons name={f.icon} size={26} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Packages */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : packages.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Plans</Text>
            <Text style={styles.sectionSubtitle}>Choose the plan that fits your needs</Text>
            {packages.map((pkg) => (
              <View key={pkg._id} style={[styles.packageCard, pkg.isPopular && styles.packageCardPopular]}>
                {pkg.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                  </View>
                )}
                <Text style={styles.packageName}>{pkg.name}</Text>
                <Text style={styles.packagePrice}>
                  {pkg.price === 0 ? 'Free' : `₹${pkg.price?.toLocaleString('en-IN')}`}
                  {pkg.duration ? <Text style={styles.packageDuration}> / {pkg.duration} days</Text> : null}
                </Text>
                {pkg.description ? <Text style={styles.packageDesc}>{pkg.description}</Text> : null}
                {pkg.features && pkg.features.length > 0 && (
                  <View style={styles.featuresList}>
                    {pkg.features.map((feat, fi) => (
                      <View key={fi} style={styles.featuresListItem}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                        <Text style={styles.featuresListText}>{feat}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.packageBtn, pkg.isPopular && styles.packageBtnPopular]}
                  onPress={() => navigation.navigate('Packages')}
                >
                  <Text style={[styles.packageBtnText, pkg.isPopular && styles.packageBtnTextPopular]}>
                    Get Started
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {/* CTA */}
        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Ready to get started?</Text>
          <Text style={styles.ctaSubtitle}>Join thousands of employers and job seekers on our platform</Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.ctaBtnText}>Find Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctaBtn, styles.ctaBtnOutline]} onPress={() => navigation.navigate('EmployerOptions')}>
              <Text style={[styles.ctaBtnText, styles.ctaBtnOutlineText]}>Post Jobs</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Footer navigation={navigation} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
    alignItems: 'center',
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 10 },
  heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22 },
  section: { paddingHorizontal: 16, paddingVertical: 28 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  sectionSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#E2E8F0',
  },
  featureIconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  featureDesc: { fontSize: 12, color: '#64748B', lineHeight: 18 },
  loadingBox: { paddingVertical: 40, alignItems: 'center' },
  packageCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0',
  },
  packageCardPopular: { borderColor: colors.primary, borderWidth: 2 },
  popularBadge: {
    backgroundColor: colors.primary, alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12,
  },
  popularBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  packageName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  packagePrice: { fontSize: 26, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  packageDuration: { fontSize: 14, fontWeight: '400', color: '#64748B' },
  packageDesc: { fontSize: 13, color: '#64748B', marginBottom: 14, lineHeight: 20 },
  featuresList: { gap: 8, marginBottom: 16 },
  featuresListItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featuresListText: { fontSize: 13, color: '#334155' },
  packageBtn: {
    paddingVertical: 12, borderRadius: 8, alignItems: 'center',
    borderWidth: 1, borderColor: colors.primary,
  },
  packageBtnPopular: { backgroundColor: colors.primary },
  packageBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  packageBtnTextPopular: { color: '#fff' },
  cta: {
    backgroundColor: '#0F172A', margin: 16, borderRadius: 16,
    padding: 28, alignItems: 'center', marginBottom: 8,
  },
  ctaTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  ctaSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  ctaButtons: { flexDirection: 'row', gap: 12 },
  ctaBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  ctaBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  ctaBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  ctaBtnOutlineText: { color: 'rgba(255,255,255,0.9)' },
});

export default ServicesScreen;
