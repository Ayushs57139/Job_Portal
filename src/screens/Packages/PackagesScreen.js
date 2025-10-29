import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const PackagesScreen = () => {
  const [selectedTab, setSelectedTab] = useState('employer');

  // Employer Packages Data
  const employerPackages = [
    {
      id: 1,
      title: 'Free Package',
      subtitle: 'Perfect for Getting Started',
      price: 'FREE',
      gradientColors: ['#667eea', '#764ba2'],
      features: [
        { icon: 'person', label: 'SuperUser', value: '1' },
        { icon: 'people-outline', label: 'SubUser', value: '0' },
        { icon: 'briefcase', label: 'Job Post', value: '2' },
        { icon: 'star-outline', label: 'Featured Job', value: '0' },
        { icon: 'people', label: 'Job Applies Candidates', value: 'Upto 60' },
        { icon: 'time', label: 'Job Applies Expiry', value: '30 Days' },
        { icon: 'document-text', label: 'CV Access', value: '10' },
        { icon: 'mail', label: 'Job (Invite) Invitee', value: '30' },
        { icon: 'chatbubble-outline', label: 'Chat Support', value: '×', isNegative: true },
        { icon: 'calendar', label: 'Package Validity', value: '15 Days' },
      ],
    },
    {
      id: 2,
      title: 'Starter Package',
      subtitle: 'Best for Small Teams',
      price: '₹999',
      popular: true,
      gradientColors: ['#f093fb', '#f5576c'],
      features: [
        { icon: 'person', label: 'SuperUser', value: '1' },
        { icon: 'people-outline', label: 'SubUser', value: '1' },
        { icon: 'briefcase', label: 'Job Post', value: '4' },
        { icon: 'star', label: 'Featured Job', value: '2' },
        { icon: 'people', label: 'Job Applies Candidates', value: 'Upto 150' },
        { icon: 'time', label: 'Job Applies Expiry', value: '45 Days' },
        { icon: 'document-text', label: 'CV Access', value: '75' },
        { icon: 'mail', label: 'Job (Invite) Invitee', value: '75' },
        { icon: 'chatbubble', label: 'Chat Support', value: 'Mon-Sat 10am-7pm', isPositive: true },
        { icon: 'calendar', label: 'Package Validity', value: '30 Days' },
      ],
    },
    {
      id: 3,
      title: 'Professional Package',
      subtitle: 'For Growing Businesses',
      price: '₹2,499',
      gradientColors: ['#4facfe', '#00f2fe'],
      features: [
        { icon: 'person', label: 'SuperUser', value: '1' },
        { icon: 'people-outline', label: 'SubUser', value: '2' },
        { icon: 'briefcase', label: 'Job Post', value: '10' },
        { icon: 'star', label: 'Featured Job', value: '6' },
        { icon: 'people', label: 'Job Applies Candidates', value: 'Upto 300' },
        { icon: 'time', label: 'Job Applies Expiry', value: '45 Days' },
        { icon: 'document-text', label: 'CV Access', value: '150' },
        { icon: 'mail', label: 'Job (Invite) Invitee', value: '150' },
        { icon: 'chatbubble', label: 'Chat Support', value: 'Mon-Sat 10am-7pm', isPositive: true },
        { icon: 'calendar', label: 'Package Validity', value: '45 Days' },
      ],
    },
  ];

  // Candidate Package Data
  const candidatePackage = {
    title: 'Profile Booster Package',
    subtitle: 'Stand Out from the Crowd',
    price: '₹499',
    gradientColors: ['#fa709a', '#fee140'],
    features: [
      { icon: 'trophy', label: 'Priority Applicant Tag', value: '✓', isPositive: true },
      { icon: 'eye', label: 'Get Upto 10X attention from recruiters', value: '✓', isPositive: true },
      { icon: 'flash', label: 'Highlight your application to recruiter', value: '✓', isPositive: true },
      { icon: 'trending-up', label: 'Increase your chance of shortlisting', value: '✓', isPositive: true },
      { icon: 'chatbubble', label: 'Chat Support (Mon-Sat 10am-7pm)', value: '✓', isPositive: true },
      { icon: 'calendar', label: 'Package Validity', value: '30 Days' },
    ],
    referralProgram: {
      title: 'Referral Program',
      description: 'Refer 20 Job Seekers / Candidates and Get Profile Booster Package For Free',
      icon: 'gift',
    },
  };

  const renderFeatureItem = (feature) => (
    <View key={feature.label} style={styles.featureItem}>
      <View style={styles.featureLeft}>
        <Ionicons
          name={feature.icon}
          size={18}
          color={feature.isNegative ? colors.error : feature.isPositive ? colors.success : colors.primary}
        />
        <Text style={styles.featureLabel}>{feature.label}</Text>
      </View>
      <Text
        style={[
          styles.featureValue,
          feature.isNegative && styles.featureValueNegative,
          feature.isPositive && styles.featureValuePositive,
        ]}
      >
        {feature.value}
      </Text>
    </View>
  );

  const renderEmployerPackageCard = (pkg) => (
    <View key={pkg.id} style={styles.packageCard}>
      <LinearGradient
        colors={pkg.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.packageHeader}
      >
        {pkg.popular && (
          <View style={styles.popularBadge}>
            <Ionicons name="star" size={12} color="#fff" />
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
        )}
        <Text style={styles.packageTitle}>{pkg.title}</Text>
        <Text style={styles.packageSubtitle}>{pkg.subtitle}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.packagePrice}>{pkg.price}</Text>
          {pkg.price !== 'FREE' && (
            <Text style={styles.gstText}>*GST As Applicable</Text>
          )}
        </View>
      </LinearGradient>

      <View style={styles.featuresContainer}>
        {pkg.features.map(renderFeatureItem)}
      </View>

      <TouchableOpacity style={styles.selectButton}>
        <LinearGradient
          colors={pkg.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.selectButtonGradient}
        >
          <Text style={styles.selectButtonText}>
            {pkg.price === 'FREE' ? 'Get Started' : 'Choose Plan'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCandidatePackageCard = () => (
    <View style={styles.packageCard}>
      <LinearGradient
        colors={candidatePackage.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.packageHeader}
      >
        <Text style={styles.packageTitle}>{candidatePackage.title}</Text>
        <Text style={styles.packageSubtitle}>{candidatePackage.subtitle}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.packagePrice}>{candidatePackage.price}</Text>
          <Text style={styles.gstText}>*GST As Applicable</Text>
        </View>
      </LinearGradient>

      <View style={styles.featuresContainer}>
        {candidatePackage.features.map(renderFeatureItem)}
      </View>

      <View style={styles.referralContainer}>
        <View style={styles.referralHeader}>
          <Ionicons name={candidatePackage.referralProgram.icon} size={24} color={colors.warning} />
          <Text style={styles.referralTitle}>{candidatePackage.referralProgram.title}</Text>
        </View>
        <Text style={styles.referralDescription}>
          {candidatePackage.referralProgram.description}
        </Text>
      </View>

      <TouchableOpacity style={styles.selectButton}>
        <LinearGradient
          colors={candidatePackage.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.selectButtonGradient}
        >
          <Text style={styles.selectButtonText}>Boost My Profile</Text>
          <Ionicons name="rocket" size={18} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <Ionicons name="ribbon" size={48} color="#fff" />
          <Text style={styles.heroTitle}>Choose Your Perfect Package</Text>
          <Text style={styles.heroSubtitle}>
            Unlock premium features and grow your career or business
          </Text>
        </LinearGradient>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'employer' && styles.tabActive]}
            onPress={() => setSelectedTab('employer')}
          >
            <Ionicons
              name="business"
              size={20}
              color={selectedTab === 'employer' ? '#fff' : colors.primary}
            />
            <Text style={[styles.tabText, selectedTab === 'employer' && styles.tabTextActive]}>
              For Employers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'candidate' && styles.tabActive]}
            onPress={() => setSelectedTab('candidate')}
          >
            <Ionicons
              name="person"
              size={20}
              color={selectedTab === 'candidate' ? '#fff' : colors.primary}
            />
            <Text style={[styles.tabText, selectedTab === 'candidate' && styles.tabTextActive]}>
              For Candidates
            </Text>
          </TouchableOpacity>
        </View>

        {/* Packages Section */}
        <View style={styles.packagesSection}>
          {selectedTab === 'employer' ? (
            <>
              <Text style={styles.sectionTitle}>Employer Packages</Text>
              <Text style={styles.sectionSubtitle}>
                Choose the perfect plan to find and hire top talent
              </Text>
              {employerPackages.map(renderEmployerPackageCard)}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Candidate Package</Text>
              <Text style={styles.sectionSubtitle}>
                Boost your profile visibility and get noticed by recruiters
              </Text>
              {renderCandidatePackageCard()}
            </>
          )}
        </View>

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={32} color={colors.success} />
            <Text style={styles.infoTitle}>Secure Payment</Text>
            <Text style={styles.infoText}>All transactions are encrypted and secure</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="headset" size={32} color={colors.info} />
            <Text style={styles.infoTitle}>24/7 Support</Text>
            <Text style={styles.infoText}>We're here to help you succeed</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="refresh" size={32} color={colors.warning} />
            <Text style={styles.infoTitle}>Flexible Plans</Text>
            <Text style={styles.infoText}>Upgrade or downgrade anytime</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...typography.h2,
    color: '#fff',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 500,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.primary,
  },
  tabTextActive: {
    color: '#fff',
  },
  packagesSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sectionSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  packageCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  packageHeader: {
    padding: spacing.xl,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  popularText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  packageTitle: {
    ...typography.h3,
    color: '#fff',
    marginBottom: spacing.xs,
  },
  packageSubtitle: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.lg,
  },
  priceContainer: {
    marginTop: spacing.sm,
  },
  packagePrice: {
    ...typography.h1,
    color: '#fff',
    fontWeight: '800',
  },
  gstText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  featuresContainer: {
    padding: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  featureLabel: {
    ...typography.body2,
    color: colors.text,
    flex: 1,
  },
  featureValue: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
  },
  featureValueNegative: {
    color: colors.error,
  },
  featureValuePositive: {
    color: colors.success,
  },
  referralContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  referralTitle: {
    ...typography.h6,
    color: colors.text,
    flex: 1,
  },
  referralDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  selectButton: {
    margin: spacing.lg,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  selectButtonText: {
    ...typography.button,
    color: '#fff',
    fontWeight: '700',
  },
  footerInfo: {
    flexDirection: isWeb ? 'row' : 'column',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  infoTitle: {
    ...typography.h6,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default PackagesScreen;

