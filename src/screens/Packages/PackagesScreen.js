import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const { width } = Dimensions.get('window');
const isWebPlatform = Platform.OS === 'web';

// Predefined gradient colors for packages (no blue)
const gradientColors = [
  ['#667eea', '#764ba2'], // Modern Purple to Deep Purple
  ['#f093fb', '#f5576c'], // Vibrant Pink to Coral
  ['#ff6b6b', '#ee5a6f'], // Coral Red to Deep Pink
  ['#43e97b', '#38f9d7'], // Fresh Green to Turquoise
  ['#fa709a', '#fee140'], // Pink to Golden Yellow
  ['#ff9a56', '#ff6a88'], // Warm Orange to Pink
  ['#a8edea', '#fed6e3'], // Soft Teal to Pink
  ['#ffecd2', '#fcb69f'], // Cream to Peach
];

const PackagesScreen = () => {
  const [selectedTab, setSelectedTab] = useState('employer');
  const [loading, setLoading] = useState(true);
  const [employerPackages, setEmployerPackages] = useState([]);
  const [candidatePackages, setCandidatePackages] = useState([]);
  
  // Responsive handling
  const responsive = useResponsive();
  const screenWidth = responsive.width;
  const isPhone = screenWidth <= 480;
  const isSmallPhone = screenWidth <= 375;
  const isMobile = screenWidth <= 600;
  const isTablet = screenWidth > 600 && screenWidth <= 1024;
  const isDesktop = screenWidth > 1024;
  
  // Dynamic styles
  const dynamicStyles = getDynamicStyles(isPhone, isSmallPhone, isMobile, isTablet, isDesktop, screenWidth);

  useEffect(() => {
    fetchPackages();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPackages();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      // Fetch employer packages (using public endpoint, no auth required)
      const employerData = await api.request(`/packages?packageType=employer&isActive=true`);
      
      // Fetch candidate packages (using public endpoint, no auth required)
      const candidateData = await api.request(`/packages?packageType=candidate&isActive=true`);
      
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
    <View key={feature.label} style={dynamicStyles.featureItem}>
      <View style={styles.featureLeft}>
        <Ionicons
          name={feature.icon}
          size={isPhone ? 16 : 18}
          color={feature.isNegative ? colors.error : feature.isPositive ? colors.success : colors.success}
        />
        <Text style={dynamicStyles.featureLabel}>{feature.label}</Text>
      </View>
      <Text
        style={[
          dynamicStyles.featureValue,
          feature.isNegative && styles.featureValueNegative,
          feature.isPositive && styles.featureValuePositive,
        ]}
      >
        {feature.value}
      </Text>
    </View>
  );

  const renderPackageCard = (pkg, isCandidatePackage = false) => (
    <View style={dynamicStyles.packageCard}>
      <LinearGradient
        colors={pkg.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dynamicStyles.packageHeader}
      >
        {pkg.popular && (
          <View style={dynamicStyles.popularBadge}>
            <Ionicons name="star" size={isPhone ? 10 : 12} color="#fff" />
            <Text style={dynamicStyles.popularText}>POPULAR</Text>
          </View>
        )}
        <Text style={dynamicStyles.packageTitle}>{pkg.title}</Text>
        <Text style={dynamicStyles.packageSubtitle}>{pkg.subtitle}</Text>
        <View style={styles.priceContainer}>
          <Text style={dynamicStyles.packagePrice}>{pkg.price}</Text>
          {pkg.price !== 'FREE' && pkg.gstApplicable && (
            <Text style={dynamicStyles.gstText}>*GST As Applicable</Text>
          )}
        </View>
        {pkg.period && (
          <View style={styles.periodContainer}>
            <Ionicons name="time-outline" size={isPhone ? 12 : 14} color="rgba(255,255,255,0.9)" />
            <Text style={dynamicStyles.periodText}>Valid for {pkg.period}</Text>
          </View>
        )}
      </LinearGradient>

      <View style={dynamicStyles.featuresContainer}>
        {pkg.features && pkg.features.map(renderFeatureItem)}
      </View>

      {pkg.supportIncluded && pkg.supportDetails && (
        <View style={dynamicStyles.supportContainer}>
          <View style={styles.supportHeader}>
            <Ionicons name="chatbubble-ellipses" size={isPhone ? 16 : 20} color={colors.success} />
            <Text style={dynamicStyles.supportTitle}>Support Included</Text>
          </View>
          <Text style={dynamicStyles.supportDescription}>{pkg.supportDetails}</Text>
        </View>
      )}

      <TouchableOpacity style={dynamicStyles.selectButton}>
        <LinearGradient
          colors={pkg.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={dynamicStyles.selectButtonGradient}
        >
          <Text style={dynamicStyles.selectButtonText}>
            {isCandidatePackage 
              ? 'Boost My Profile' 
              : pkg.price === 'FREE' 
                ? 'Get Started' 
                : 'Choose Plan'}
          </Text>
          <Ionicons 
            name={isCandidatePackage ? "rocket" : "arrow-forward"} 
            size={isPhone ? 16 : 18} 
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
          <ActivityIndicator size="large" color={colors.success} />
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
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={dynamicStyles.heroSection}>
          <Ionicons name="ribbon" size={isPhone ? 36 : 48} color={colors.success} />
          <Text style={dynamicStyles.heroTitle}>Choose Your Perfect Package</Text>
          <Text style={dynamicStyles.heroSubtitle}>
            Unlock premium features and grow your career or business
          </Text>
        </View>

        {/* Tab Selector */}
        <View style={dynamicStyles.tabContainer}>
          <TouchableOpacity
            style={[dynamicStyles.tab, selectedTab === 'employer' && styles.tabActive]}
            onPress={() => setSelectedTab('employer')}
          >
            <Ionicons
              name="business"
              size={isPhone ? 16 : 20}
              color={selectedTab === 'employer' ? '#fff' : colors.success}
            />
            <Text style={[dynamicStyles.tabText, selectedTab === 'employer' && styles.tabTextActive]}>
              For Employers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tab, selectedTab === 'candidate' && styles.tabActive]}
            onPress={() => setSelectedTab('candidate')}
          >
            <Ionicons
              name="person"
              size={isPhone ? 16 : 20}
              color={selectedTab === 'candidate' ? '#fff' : colors.success}
            />
            <Text style={[dynamicStyles.tabText, selectedTab === 'candidate' && styles.tabTextActive]}>
              For Candidates
            </Text>
          </TouchableOpacity>
        </View>

        {/* Packages Section */}
        <View style={dynamicStyles.packagesSection}>
          {selectedTab === 'employer' ? (
            <>
              <Text style={dynamicStyles.sectionTitle}>Employer Packages</Text>
              <Text style={dynamicStyles.sectionSubtitle}>
                Choose the perfect plan to find and hire top talent
              </Text>
              {employerPackages.length > 0 ? (
                <View style={dynamicStyles.packagesGrid}>
                  {employerPackages.map((pkg) => (
                    <View key={pkg.id} style={dynamicStyles.packageCardWrapper}>
                      {renderPackageCard(pkg, false)}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="cube-outline" size={isPhone ? 48 : 64} color="#ccc" />
                  <Text style={styles.emptyText}>No packages available</Text>
                  <Text style={styles.emptySubtext}>
                    Check back later for employer packages
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={dynamicStyles.sectionTitle}>Candidate Packages</Text>
              <Text style={dynamicStyles.sectionSubtitle}>
                Boost your profile visibility and get noticed by recruiters
              </Text>
              {candidatePackages.length > 0 ? (
                <View style={dynamicStyles.packagesGrid}>
                  {candidatePackages.map((pkg) => (
                    <View key={pkg.id} style={dynamicStyles.packageCardWrapper}>
                      {renderPackageCard(pkg, true)}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="cube-outline" size={isPhone ? 48 : 64} color="#ccc" />
                  <Text style={styles.emptyText}>No packages available</Text>
                  <Text style={styles.emptySubtext}>
                    Check back later for candidate packages
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Referral Program Section */}
        {selectedTab === 'candidate' && (
          <View style={dynamicStyles.referralSection}>
            <LinearGradient
              colors={['#ff9a56', '#ff6a88']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={dynamicStyles.referralGradient}
            >
              <Ionicons name="gift" size={isPhone ? 36 : 48} color="#fff" />
              <Text style={dynamicStyles.referralTitle}>🎁 Referral Program</Text>
              <Text style={dynamicStyles.referralSubtitle}>
                Refer 20 Job Seekers & Get Profile Booster Package FREE!
              </Text>
              <Text style={dynamicStyles.referralDescription}>
                Share with your friends and network. When 20 of them join our platform and create profiles, you'll receive a FREE Profile Booster Package worth ₹499!
              </Text>
              <TouchableOpacity style={dynamicStyles.referralButton}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                  style={dynamicStyles.referralButtonGradient}
                >
                  <Ionicons name="share-social" size={isPhone ? 16 : 20} color="#fff" />
                  <Text style={dynamicStyles.referralButtonText}>Invite Friends Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Footer Info */}
        <View style={dynamicStyles.footerInfo}>
          <View style={dynamicStyles.infoCard}>
            <Ionicons name="shield-checkmark" size={isPhone ? 24 : 32} color={colors.success} />
            <Text style={dynamicStyles.infoTitle}>Secure Payment</Text>
            <Text style={dynamicStyles.infoText}>All transactions are encrypted and secure</Text>
          </View>
          <View style={dynamicStyles.infoCard}>
            <Ionicons name="headset" size={isPhone ? 24 : 32} color={colors.success} />
            <Text style={dynamicStyles.infoTitle}>24/7 Support</Text>
            <Text style={dynamicStyles.infoText}>We're here to help you succeed</Text>
          </View>
          <View style={dynamicStyles.infoCard}>
            <Ionicons name="refresh" size={isPhone ? 24 : 32} color={colors.warning} />
            <Text style={dynamicStyles.infoTitle}>Flexible Plans</Text>
            <Text style={dynamicStyles.infoText}>Upgrade or downgrade anytime</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Dynamic styles based on screen size
const getDynamicStyles = (isPhone, isSmallPhone, isMobile, isTablet, isDesktop, screenWidth) => ({
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: isPhone ? spacing.sm : 0,
  },
  heroSection: {
    padding: isPhone ? spacing.lg : spacing.xxl,
    paddingTop: isPhone ? spacing.xl : spacing.xxl + spacing.xl,
    paddingBottom: isPhone ? spacing.xl : spacing.xxl + spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isPhone ? spacing.md : spacing.xl,
    backgroundColor: colors.cardBackground,
    marginHorizontal: isPhone ? spacing.sm : spacing.lg,
    borderRadius: isPhone ? borderRadius.lg : borderRadius.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: isSmallPhone ? 20 : isPhone ? 22 : isTablet ? 28 : 32,
  },
  heroSubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 500,
    fontSize: isPhone ? 13 : 15,
    paddingHorizontal: isPhone ? spacing.sm : 0,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: isPhone ? spacing.sm : spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: isPhone ? borderRadius.lg : borderRadius.xl,
    padding: spacing.xs,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    paddingHorizontal: isPhone ? spacing.sm : spacing.lg,
    borderRadius: borderRadius.md,
    gap: isPhone ? spacing.xs : spacing.sm,
  },
  tabText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.success,
    fontSize: isSmallPhone ? 12 : isPhone ? 13 : 15,
  },
  packagesSection: {
    paddingHorizontal: isPhone ? spacing.sm : spacing.lg,
    maxWidth: isDesktop ? 1400 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  packagesGrid: {
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    gap: isPhone ? spacing.md : spacing.lg,
    justifyContent: 'center',
  },
  packageCardWrapper: {
    width: isPhone ? '100%' : 
           isMobile ? '100%' : 
           isTablet ? (screenWidth > 900 ? '48%' : '100%') : 
           isDesktop ? '31%' : 
           '100%',
    flexBasis: isDesktop ? '31%' : undefined,
    flexGrow: 0,
    flexShrink: 0,
    maxWidth: isDesktop ? 400 : undefined,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: isPhone ? spacing.md : spacing.xl,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: isSmallPhone ? 22 : isPhone ? 24 : isTablet ? 28 : 32,
  },
  sectionSubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: isPhone ? spacing.md : spacing.xl,
    fontSize: isPhone ? 13 : 15,
    lineHeight: isPhone ? 20 : 24,
    paddingHorizontal: isPhone ? spacing.sm : 0,
  },
  packageCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: isPhone ? borderRadius.lg : borderRadius.xl,
    marginBottom: 0,
    overflow: 'hidden',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    height: '100%',
    flexDirection: 'column',
  },
  packageHeader: {
    padding: isPhone ? spacing.md : spacing.lg,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: isPhone ? spacing.sm : spacing.md,
    right: isPhone ? spacing.sm : spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: isPhone ? spacing.sm : spacing.md,
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
    fontSize: isPhone ? 9 : 11,
  },
  packageTitle: {
    ...typography.h3,
    color: '#fff',
    marginBottom: spacing.xs,
    fontSize: isSmallPhone ? 18 : isPhone ? 20 : isTablet ? 24 : 26,
  },
  packageSubtitle: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: isPhone ? spacing.sm : spacing.md,
    fontSize: isSmallPhone ? 11 : isPhone ? 12 : 14,
  },
  packagePrice: {
    ...typography.h1,
    color: '#fff',
    fontWeight: '800',
    fontSize: isSmallPhone ? 24 : isPhone ? 28 : isTablet ? 36 : 40,
  },
  gstText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
    fontSize: isPhone ? 10 : 12,
  },
  periodText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    fontSize: isPhone ? 11 : 13,
  },
  featuresContainer: {
    padding: isPhone ? spacing.sm : spacing.lg,
    backgroundColor: colors.background,
    flex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isPhone ? spacing.xs : spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  featureLabel: {
    ...typography.body2,
    color: colors.text,
    flex: 1,
    fontSize: isPhone ? 12 : 14,
  },
  featureValue: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    fontSize: isPhone ? 12 : 14,
  },
  supportContainer: {
    margin: isPhone ? spacing.sm : spacing.lg,
    marginTop: 0,
    padding: isPhone ? spacing.sm : spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  supportTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    fontSize: isPhone ? 13 : 15,
  },
  supportDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: isPhone ? 18 : 20,
    fontSize: isPhone ? 12 : 14,
  },
  selectButton: {
    margin: isPhone ? spacing.sm : spacing.lg,
    marginTop: 0,
    borderRadius: isPhone ? borderRadius.lg : borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    gap: spacing.sm,
  },
  selectButtonText: {
    ...typography.button,
    color: '#fff',
    fontWeight: '700',
    fontSize: isPhone ? 13 : 15,
  },
  referralSection: {
    marginHorizontal: isPhone ? spacing.sm : spacing.lg,
    marginVertical: isPhone ? spacing.md : spacing.xl,
    borderRadius: isPhone ? borderRadius.lg : borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  referralGradient: {
    padding: isPhone ? spacing.lg : spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralTitle: {
    ...typography.h3,
    color: '#fff',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: isSmallPhone ? 20 : isPhone ? 22 : 28,
  },
  referralSubtitle: {
    ...typography.h6,
    color: '#fff',
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: isPhone ? 14 : 18,
  },
  referralDescription: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: isPhone ? spacing.md : spacing.xl,
    lineHeight: isPhone ? 20 : 24,
    paddingHorizontal: isPhone ? 0 : spacing.md,
    fontSize: isPhone ? 13 : 16,
  },
  referralButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  referralButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isPhone ? spacing.lg : spacing.xxl,
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    gap: spacing.sm,
  },
  referralButtonText: {
    ...typography.button,
    color: '#fff',
    fontWeight: '700',
    fontSize: isPhone ? 14 : 16,
  },
  footerInfo: {
    flexDirection: isMobile ? 'column' : 'row',
    paddingHorizontal: isPhone ? spacing.sm : spacing.lg,
    paddingTop: isPhone ? spacing.md : spacing.xl,
    gap: isPhone ? spacing.md : spacing.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    padding: isPhone ? spacing.md : spacing.xl,
    borderRadius: isPhone ? borderRadius.lg : borderRadius.xl,
    alignItems: 'center',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoTitle: {
    ...typography.h6,
    color: colors.text,
    marginTop: isPhone ? spacing.sm : spacing.md,
    marginBottom: spacing.xs,
    fontSize: isPhone ? 14 : 16,
  },
  infoText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: isPhone ? 12 : 14,
  },
});

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
    paddingTop: spacing.xxl + spacing.xl,
    paddingBottom: spacing.xxl + spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
    fontWeight: '800',
  },
  heroSubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 500,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    backgroundColor: colors.success,
  },
  tabText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.success,
  },
  tabTextActive: {
    color: '#fff',
  },
  // These styles are now handled by dynamicStyles - keeping minimal fallbacks
  priceContainer: {
    marginTop: spacing.xs,
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
  // selectButton, selectButtonGradient, selectButtonText, footerInfo, infoCard, infoTitle, infoText 
  // are now handled by dynamicStyles
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
  // supportContainer is now handled by dynamicStyles
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  supportDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  referralSection: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  referralGradient: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralTitle: {
    ...typography.h3,
    color: '#fff',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
  },
  referralSubtitle: {
    ...typography.h6,
    color: '#fff',
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '600',
  },
  referralDescription: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  referralButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  referralButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  referralButtonText: {
    ...typography.button,
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default PackagesScreen;

