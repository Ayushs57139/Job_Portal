import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../styles/theme';
import Header from '../../components/Header';

const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') return Platform;
  } catch (e) {}
  return { OS: 'android' };
};
const isWeb = getPlatform().OS === 'web';

const FEATURES = [
  { icon: 'checkmark-circle-outline', title: 'ATS-Friendly', desc: 'Optimized for Applicant Tracking Systems' },
  { icon: 'brush-outline', title: 'Multiple Templates', desc: 'Professionally designed resume templates' },
  { icon: 'color-palette-outline', title: 'Customizable Themes', desc: 'Personalize with various color themes' },
  { icon: 'download-outline', title: 'Easy Export', desc: 'Download in PDF or Word format instantly' },
  { icon: 'time-outline', title: 'Quick & Easy', desc: 'Build a professional resume in 5 simple steps' },
  { icon: 'shield-checkmark-outline', title: '100% Free', desc: 'No hidden charges, create unlimited resumes' },
];

const STATS = [
  { value: '50K+', label: 'Resumes Created' },
  { value: '98%', label: 'Success Rate' },
  { value: '10+', label: 'Templates' },
  { value: '5 Min', label: 'Average Time' },
];

const TESTIMONIALS = [
  { id: 1, name: 'Divi J', role: 'Recent Graduate', rating: 5, quote: 'Amazing AI Writer! It transformed my average resume into a standout one. Received three interview invites in just a week!', color: '#6366F1' },
  { id: 2, name: 'Aviral S', role: 'Engineer', rating: 5, quote: 'The AI resume writer is a career lifesaver! Tailored my CV perfectly to my industry. Landed an interview with my top choice company!', color: '#8B5CF6' },
  { id: 3, name: 'Arpita K', role: 'Product Manager', rating: 4, quote: "Didn't believe in AI magic until now. The writer made my resume shine in ways I couldn't have imagined.", color: '#EC4899' },
];

const ResumeBuilderScreen = () => {
  const navigation = useNavigation();
  const [testimonialPage, setTestimonialPage] = useState(0);

  const getInitials = (name) => {
    if (!name) return 'U';
    const w = name.split(' ');
    return w.length >= 2 ? (w[0][0] + w[w.length - 1][0]).toUpperCase() : name[0].toUpperCase();
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroIconBox}>
              <Ionicons name="document-text-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.heroTitle}>Resume Builder</Text>
            <Text style={styles.heroSubtitle}>
              Create a professional resume in minutes. Stand out to employers with our easy-to-use builder.
            </Text>
            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('CreateResume')}>
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.heroBtnText}>Create Resume</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {STATS.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Features */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Why Use Our Resume Builder?</Text>
            </View>
            <View style={styles.featuresGrid}>
              {FEATURES.map((f) => (
                <View key={f.title} style={styles.featureCard}>
                  <View style={styles.featureIconBox}>
                    <Ionicons name={f.icon} size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Testimonials */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>What Our Users Say</Text>
            </View>
            <View style={styles.testimonialsGrid}>
              {TESTIMONIALS.map((t) => (
                <View key={t.id} style={styles.testimonialCard}>
                  <View style={styles.stars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons key={i} name={i < t.rating ? 'star' : 'star-outline'} size={14} color="#F59E0B" />
                    ))}
                  </View>
                  <Text style={styles.testimonialQuote}>"{t.quote}"</Text>
                  <View style={styles.testimonialFooter}>
                    <View style={[styles.testimonialAvatar, { backgroundColor: t.color }]}>
                      <Text style={styles.testimonialAvatarText}>{getInitials(t.name)}</Text>
                    </View>
                    <View>
                      <Text style={styles.testimonialName}>{t.name}</Text>
                      <Text style={styles.testimonialRole}>{t.role}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* CTA */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Ready to build your resume?</Text>
            <Text style={styles.ctaSubtitle}>Join 50,000+ professionals who've landed their dream jobs</Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('CreateResume')}>
              <Ionicons name="rocket-outline" size={20} color="#FFF" />
              <Text style={styles.ctaBtnText}>Get Started — It's Free</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingBottom: 40 },
  inner: {
    maxWidth: isWeb ? 960 : '100%',
    alignSelf: 'center',
    width: '100%',
  },

  // Hero
  hero: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroIconBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0',
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 10, textAlign: 'center' },
  heroSubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24, maxWidth: 480 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10,
  },
  heroBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

  // Stats
  statsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    paddingHorizontal: 16, paddingVertical: 20,
  },
  statCard: {
    flex: 1, minWidth: 120,
    backgroundColor: '#FFF', borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B', textAlign: 'center' },

  // Section
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionAccent: { width: 4, height: 20, backgroundColor: colors.primary, borderRadius: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },

  // Features
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: {
    width: isWeb ? '31%' : '47%',
    backgroundColor: '#FFF', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  featureIconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  featureDesc: { fontSize: 12, color: '#64748B', lineHeight: 18 },

  // Testimonials
  testimonialsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  testimonialCard: {
    flex: 1, minWidth: isWeb ? 260 : '100%',
    backgroundColor: '#FFF', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  stars: { flexDirection: 'row', gap: 2, marginBottom: 10 },
  testimonialQuote: { fontSize: 13, color: '#475569', lineHeight: 20, fontStyle: 'italic', marginBottom: 14, flex: 1 },
  testimonialFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  testimonialAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  testimonialAvatarText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  testimonialName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  testimonialRole: { fontSize: 12, color: '#64748B' },

  // CTA
  ctaSection: {
    backgroundColor: '#EEF2FF', marginHorizontal: 16, borderRadius: 16,
    padding: 28, alignItems: 'center', marginBottom: 8,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  ctaSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 20, textAlign: 'center' },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10,
  },
  ctaBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});

export default ResumeBuilderScreen;
