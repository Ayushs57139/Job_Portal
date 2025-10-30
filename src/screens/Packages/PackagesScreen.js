import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import { API_URL } from '../../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Predefined gradient colors for packages
const gradientColors = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#fa709a', '#fee140'],
  ['#a8edea', '#fed6e3'],
  ['#ff9a9e', '#fecfef'],
  ['#ffecd2', '#fcb69f'],
  ['#ff6e7f', '#bfe9ff'],
];

const PackagesScreen = () => {
  const [selectedTab, setSelectedTab] = useState('employer');
  const [loading, setLoading] = useState(true);
  const [employerPackages, setEmployerPackages] = useState([]);
  const [candidatePackages, setCandidatePackages] = useState([]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      // Fetch employer packages (using public endpoint, no auth required)
      const employerResponse = await fetch(`${API_URL}/api/packages?packageType=employer&isActive=true`);
      const employerData = await employerResponse.json();
      
      // Fetch candidate packages (using public endpoint, no auth required)
      const candidateResponse = await fetch(`${API_URL}/api/packages?packageType=candidate&isActive=true`);
      const candidateData = await candidateResponse.json();
      
      if (employerData.success) {
        // Transform backend data to frontend format
        const transformedEmployer = employerData.packages.map((pkg, index) => ({
          id: pkg._id,
          title: pkg.name,
          subtitle: pkg.description.substring(0, 50) + (pkg.description.length > 50 ? '...' : ''),
          price: pkg.price === 0 ? 'FREE' : `${pkg.currency === 'INR' ? '₹' : '$'}${pkg.price.toLocaleString()}`,
          popular: pkg.isFeatured,
          gradientColors: gradientColors[index % gradientColors.length],
          period: `${pkg.periodValue} ${pkg.period}`,
          gstApplicable: pkg.gstApplicable,
          supportIncluded: pkg.supportIncluded,
          supportDetails: pkg.supportDetails,
          features: pkg.features.map(feature => ({
            icon: getIconForFeature(feature.name),
            label: feature.name,
            value: feature.value,
            isPositive: feature.included,
            isNegative: !feature.included,
          })),
        }));
        setEmployerPackages(transformedEmployer);
      }
      
      if (candidateData.success) {
        // Transform backend data to frontend format
        const transformedCandidate = candidateData.packages.map((pkg, index) => ({
          id: pkg._id,
          title: pkg.name,
          subtitle: pkg.description.substring(0, 50) + (pkg.description.length > 50 ? '...' : ''),
          price: pkg.price === 0 ? 'FREE' : `${pkg.currency === 'INR' ? '₹' : '$'}${pkg.price.toLocaleString()}`,
          gradientColors: gradientColors[(index + 3) % gradientColors.length],
          period: `${pkg.periodValue} ${pkg.period}`,
          gstApplicable: pkg.gstApplicable,
          supportIncluded: pkg.supportIncluded,
          supportDetails: pkg.supportDetails,
          features: pkg.features.map(feature => ({
            icon: getIconForFeature(feature.name),
            label: feature.name,
            value: feature.value,
            isPositive: feature.included,
            isNegative: !feature.included,
          })),
        }));
        setCandidatePackages(transformedCandidate);
      }
    } catch (error) {
      console.error('Fetch packages error:', error);
      Alert.alert('Error', 'Failed to load packages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get appropriate icon for feature
  const getIconForFeature = (featureName) => {
    const lowerName = featureName.toLowerCase();
    if (lowerName.includes('user') || lowerName.includes('superuser')) return 'person';
    if (lowerName.includes('subuser') || lowerName.includes('sub user')) return 'people-outline';
    if (lowerName.includes('job post')) return 'briefcase';
    if (lowerName.includes('featured')) return 'star';
    if (lowerName.includes('candidate') || lowerName.includes('applies')) return 'people';
    if (lowerName.includes('expiry') || lowerName.includes('time')) return 'time';
    if (lowerName.includes('cv') || lowerName.includes('resume')) return 'document-text';
    if (lowerName.includes('invite') || lowerName.includes('mail') || lowerName.includes('email')) return 'mail';
    if (lowerName.includes('chat') || lowerName.includes('support')) return 'chatbubble';
    if (lowerName.includes('validity') || lowerName.includes('period')) return 'calendar';
    if (lowerName.includes('priority') || lowerName.includes('boost')) return 'trophy';
    if (lowerName.includes('attention') || lowerName.includes('view')) return 'eye';
    if (lowerName.includes('highlight')) return 'flash';
    if (lowerName.includes('chance') || lowerName.includes('increase')) return 'trending-up';
    if (lowerName.includes('referral') || lowerName.includes('gift')) return 'gift';
    return 'checkmark-circle';
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

  const renderPackageCard = (pkg, isCandidate = false) => (
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
          {pkg.price !== 'FREE' && pkg.gstApplicable && (
            <Text style={styles.gstText}>*GST As Applicable</Text>
          )}
        </View>
        {pkg.period && (
          <View style={styles.periodContainer}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.periodText}>Valid for {pkg.period}</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.featuresContainer}>
        {pkg.features && pkg.features.map(renderFeatureItem)}
      </View>

      {pkg.supportIncluded && pkg.supportDetails && (
        <View style={styles.supportContainer}>
          <View style={styles.supportHeader}>
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.info} />
            <Text style={styles.supportTitle}>Support Included</Text>
          </View>
          <Text style={styles.supportDescription}>{pkg.supportDetails}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.selectButton}>
        <LinearGradient
          colors={pkg.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.selectButtonGradient}
        >
          <Text style={styles.selectButtonText}>
            {isCandidate 
              ? 'Boost My Profile' 
              : pkg.price === 'FREE' 
                ? 'Get Started' 
                : 'Choose Plan'}
          </Text>
          <Ionicons 
            name={isCandidate ? "rocket" : "arrow-forward"} 
            size={18} 
            color="#fff" 
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      </View>
    );
  }

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
              {employerPackages.length > 0 ? (
                employerPackages.map((pkg) => renderPackageCard(pkg, false))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="cube-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No packages available</Text>
                  <Text style={styles.emptySubtext}>
                    Check back later for employer packages
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Candidate Packages</Text>
              <Text style={styles.sectionSubtitle}>
                Boost your profile visibility and get noticed by recruiters
              </Text>
              {candidatePackages.length > 0 ? (
                candidatePackages.map((pkg) => renderPackageCard(pkg, true))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="cube-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No packages available</Text>
                  <Text style={styles.emptySubtext}>
                    Check back later for candidate packages
                  </Text>
                </View>
              )}
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    ...typography.h5,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  periodText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  supportContainer: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  supportTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
  },
  supportDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default PackagesScreen;

