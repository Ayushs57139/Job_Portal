import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';

const { width } = Dimensions.get('window');
// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';

// Resume Themes Configuration
const RESUME_THEMES = [
  { 
    id: 'purple', 
    name: 'Royal Purple', 
    gradient: ['#9D50BB', '#6E48AA'], 
    accent: '#9D50BB', 
    icon: '👑',
    description: 'Elegant and sophisticated'
  },
  { 
    id: 'teal', 
    name: 'Mint Teal', 
    gradient: ['#11998e', '#38ef7d'], 
    accent: '#11998e', 
    icon: '🌿',
    description: 'Fresh and modern'
  },
  { 
    id: 'orange', 
    name: 'Sunset Orange', 
    gradient: ['#f093fb', '#f5576c'], 
    accent: '#f5576c', 
    icon: '🌅',
    description: 'Vibrant and energetic'
  },
  { 
    id: 'dark', 
    name: 'Midnight Dark', 
    gradient: ['#2c3e50', '#34495e'], 
    accent: '#8B5CF6', 
    icon: '🌙',
    description: 'Professional and bold'
  },
  { 
    id: 'green', 
    name: 'Forest Green', 
    gradient: ['#134e5e', '#71b280'], 
    accent: '#71b280', 
    icon: '🌲',
    description: 'Trustworthy and natural'
  },
];

// Testimonials data
const TESTIMONIALS = [
  [
    {
      id: 1,
      name: 'Divi J',
      role: 'Recent Graduate',
      rating: 5,
      quote: "Amazing AI Writer! It transformed my average resume into a standout one. Received three interview invites in just a week!",
      avatarColor: '#6366F1',
    },
    {
      id: 2,
      name: 'Aviral S',
      role: 'Engineer',
      rating: 5,
      quote: "The AI resume writer is a career lifesaver! Tailored my CV perfectly to my industry. Landed an interview with my top choice company!",
      avatarColor: '#8B5CF6',
    },
    {
      id: 3,
      name: 'Arpita K',
      role: 'Product Manager',
      rating: 4,
      quote: "Didn't believe in AI magic until now. The writer made my resume shine in ways I couldn't have imagined. Truly grateful!",
      avatarColor: '#EC4899',
    },
  ],
  [
    {
      id: 4,
      name: 'Rahul M',
      role: 'Software Developer',
      rating: 5,
      quote: "Best resume builder I've used! The templates are professional and the export feature works flawlessly.",
      avatarColor: '#F59E0B',
    },
    {
      id: 5,
      name: 'Priya S',
      role: 'Marketing Manager',
      rating: 5,
      quote: "Created my perfect resume in just 10 minutes. The step-by-step process is so intuitive and helpful!",
      avatarColor: '#10B981',
    },
    {
      id: 6,
      name: 'Amit K',
      role: 'Data Scientist',
      rating: 5,
      quote: "Love the ATS-friendly format! Got multiple interview calls after updating my resume with this tool.",
      avatarColor: '#3B82F6',
    },
  ],
];

const ResumeBuilderScreen = () => {
  const navigation = useNavigation();
  const [selectedTheme] = useState(RESUME_THEMES[0]);
  const [currentTestimonialPage, setCurrentTestimonialPage] = useState(0);

  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars.push(
          <Ionicons key={`star-${i}`} name="star" size={18} color="#FFB800" />
        );
      } else {
        stars.push(
          <Ionicons key={`star-${i}`} name="star-outline" size={18} color="#FFB800" />
        );
      }
    }
    return stars;
  };


  return (
    <View style={styles.container}>
      <Header />
      
      {/* Single ScrollView wrapping all content */}
      <ScrollView
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Content Wrapper */}
        <View style={styles.contentWrapper}>
          {/* Hero Header */}
          <View style={styles.heroHeader}>
            <View style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <View style={styles.heroTitleRow}>
                  <View style={styles.heroIconContainer}>
                    <Ionicons name="document-text" size={28} color={selectedTheme.accent} />
                  </View>
                  <View style={styles.heroTextWrapper}>
                    <Text style={styles.heroTitle}>Resume Builder</Text>
                    <Text style={styles.heroSubtitle}>
                      Create a professional resume in minutes. Stand out to employers with our easy-to-use resume builder.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Why Use Our Resume Builder?</Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureCard}>
                <View style={[styles.featureIconContainer, { backgroundColor: selectedTheme.accent + '15' }]}>
                  <Ionicons name="checkmark-circle" size={32} color={selectedTheme.accent} />
                </View>
                <Text style={styles.featureTitle}>ATS-Friendly</Text>
                <Text style={styles.featureDescription}>Resumes optimized for Applicant Tracking Systems</Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={[styles.featureIconContainer, { backgroundColor: selectedTheme.accent + '15' }]}>
                  <Ionicons name="brush" size={32} color={selectedTheme.accent} />
                </View>
                <Text style={styles.featureTitle}>Multiple Templates</Text>
                <Text style={styles.featureDescription}>Choose from professionally designed resume templates</Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={[styles.featureIconContainer, { backgroundColor: selectedTheme.accent + '15' }]}>
                  <Ionicons name="color-palette" size={32} color={selectedTheme.accent} />
                </View>
                <Text style={styles.featureTitle}>Customizable Themes</Text>
                <Text style={styles.featureDescription}>Personalize your resume with various color themes</Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={[styles.featureIconContainer, { backgroundColor: selectedTheme.accent + '15' }]}>
                  <Ionicons name="download" size={32} color={selectedTheme.accent} />
                </View>
                <Text style={styles.featureTitle}>Easy Export</Text>
                <Text style={styles.featureDescription}>Download your resume in PDF or Word format instantly</Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={[styles.featureIconContainer, { backgroundColor: selectedTheme.accent + '15' }]}>
                  <Ionicons name="time" size={32} color={selectedTheme.accent} />
                </View>
                <Text style={styles.featureTitle}>Quick & Easy</Text>
                <Text style={styles.featureDescription}>Build a professional resume in just 5 simple steps</Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={[styles.featureIconContainer, { backgroundColor: selectedTheme.accent + '15' }]}>
                  <Ionicons name="shield-checkmark" size={32} color={selectedTheme.accent} />
                </View>
                <Text style={styles.featureTitle}>100% Free</Text>
                <Text style={styles.featureDescription}>No hidden charges, create unlimited resumes</Text>
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Resumes Created</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>10+</Text>
              <Text style={styles.statLabel}>Templates</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5 Min</Text>
              <Text style={styles.statLabel}>Average Time</Text>
            </View>
          </View>

          {/* Testimonials Section */}
          <View style={styles.testimonialsSection}>
            <Text style={styles.testimonialsTitle}>Why our customers love us</Text>
            <View style={styles.testimonialsGrid}>
              {TESTIMONIALS[currentTestimonialPage]?.map((testimonial) => (
                <View key={testimonial.id} style={styles.testimonialCard}>
                  <View style={styles.testimonialStars}>
                    {renderStars(testimonial.rating)}
                  </View>
                  <Text style={styles.testimonialQuote}>"{testimonial.quote}"</Text>
                  <View style={styles.testimonialFooter}>
                    <View style={[styles.testimonialAvatar, { backgroundColor: testimonial.avatarColor }]}>
                      <Text style={styles.testimonialAvatarText}>{getInitials(testimonial.name)}</Text>
                    </View>
                    <View style={styles.testimonialInfo}>
                      <Text style={styles.testimonialName}>{testimonial.name}</Text>
                      <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.testimonialsPagination}>
              <TouchableOpacity
                style={[styles.paginationButton, currentTestimonialPage === 0 && styles.paginationButtonDisabled]}
                onPress={() => setCurrentTestimonialPage(Math.max(0, currentTestimonialPage - 1))}
                disabled={currentTestimonialPage === 0}
              >
                <Ionicons name="chevron-back" size={20} color={currentTestimonialPage === 0 ? colors.textLight : colors.text} />
              </TouchableOpacity>
              <Text style={styles.paginationText}>
                {currentTestimonialPage + 1}/{TESTIMONIALS.length}
              </Text>
              <TouchableOpacity
                style={[styles.paginationButton, currentTestimonialPage === TESTIMONIALS.length - 1 && styles.paginationButtonDisabled]}
                onPress={() => setCurrentTestimonialPage(Math.min(TESTIMONIALS.length - 1, currentTestimonialPage + 1))}
                disabled={currentTestimonialPage === TESTIMONIALS.length - 1}
              >
                <Ionicons name="chevron-forward" size={20} color={currentTestimonialPage === TESTIMONIALS.length - 1 ? colors.textLight : colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.createResumeSection}>
            <TouchableOpacity
              style={styles.createResumeButton}
              onPress={() => {
                navigation.navigate('CreateResume');
              }}
            >
              <LinearGradient
                colors={selectedTheme.gradient}
                style={styles.createResumeButtonGradient}
              >
                <Ionicons name="add-circle" size={28} color={colors.textWhite} />
                <Text style={styles.createResumeButtonText}>Create Resume</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
    padding: isWeb ? spacing.xl : spacing.lg,
    paddingBottom: spacing.xxl,
    ...(isWeb && {
      alignItems: 'center',
    }),
  },
  contentWrapper: {
    width: '100%',
    maxWidth: isWeb ? 1000 : '100%',
  },
  
  // Hero Header Styles
  heroHeader: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  heroTextWrapper: {
    flex: 1,
    gap: spacing.xs,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.text,
    fontWeight: '800',
    fontSize: isWeb ? 36 : 32,
  },
  heroSubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  
  // Features Section
  featuresSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featuresTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xl,
    textAlign: 'center',
    fontSize: isWeb ? 28 : 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: isWeb ? '30%' : '48%',
    minWidth: isWeb ? 280 : 'auto',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  featureTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontSize: 16,
  },
  featureDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },
  
  // Stats Section
  statsSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: isWeb ? 200 : '45%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statNumber: {
    ...typography.h1,
    color: colors.success,
    fontWeight: '800',
    fontSize: isWeb ? 40 : 36,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  
  // Create Resume Section
  createResumeSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  createResumeButton: {
    width: '100%',
    maxWidth: isWeb ? 400 : '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  createResumeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  createResumeButtonText: {
    ...typography.h5,
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: 20,
  },
  
  // Testimonials Section
  testimonialsSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  testimonialsTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xl,
    textAlign: 'center',
    fontSize: isWeb ? 28 : 24,
  },
  testimonialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  testimonialCard: {
    flex: 1,
    minWidth: isWeb ? 280 : '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  testimonialStars: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  testimonialQuote: {
    ...typography.body1,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
    fontSize: 14,
    fontStyle: 'italic',
  },
  testimonialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  testimonialAvatarText: {
    ...typography.h6,
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: 18,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
    fontSize: 15,
  },
  testimonialRole: {
    ...typography.body2,
    color: colors.textSecondary,
    fontSize: 13,
  },
  testimonialsPagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xs,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
});

export default ResumeBuilderScreen;
