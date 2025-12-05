import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../styles/theme';
import { useResponsive } from '../utils/responsive';

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

const Footer = () => {
  const navigation = useNavigation();
  const responsive = useResponsive();
  
  // Enhanced device detection
  const { width } = responsive;
  const isXsPhone = width <= 320;
  const isSmallPhone = width > 320 && width <= 375;
  const isPhone = width > 375 && width <= 414;
  const isLargePhone = width > 414 && width <= 480;
  const isMobile = width <= 480;
  const isSmallTablet = width > 480 && width <= 600;
  const isTablet = width > 600 && width <= 768;
  const isLargeTablet = width > 768 && width <= 834;
  const isTabletDevice = width > 480 && width <= 834;
  const isSmallLaptop = width > 834 && width <= 1024;
  const isLaptop = width > 1024 && width <= 1200;
  const isDesktop = width > 1200 && width <= 1440;
  const isLargeDesktop = width > 1440;
  const isDesktopDevice = width > 834;
  
  const dynamicStyles = getStyles(
    isXsPhone, isSmallPhone, isPhone, isLargePhone, isMobile,
    isSmallTablet, isTablet, isLargeTablet, isTabletDevice,
    isSmallLaptop, isLaptop, isDesktop, isLargeDesktop, isDesktopDevice, width
  );

  const handleNavigation = (route) => {
    try {
      navigation.navigate(route);
    } catch (error) {
      console.log('Navigation route not found:', route);
    }
  };

  const FooterSection = ({ title, links, icon }) => {
    return (
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.sectionTitleRow}>
          {icon && <Ionicons name={icon} size={isMobile ? 12 : 18} color={colors.textWhite} style={{ marginRight: isMobile ? 4 : 8 }} />}
          <Text style={dynamicStyles.sectionTitle} numberOfLines={1}>{title}</Text>
        </View>
        {links.map((link, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleNavigation(link.route)}
            style={dynamicStyles.linkButton}
            activeOpacity={0.7}
          >
            <Text style={dynamicStyles.linkText} numberOfLines={1}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const SocialButton = ({ iconName, url, label }) => (
    <TouchableOpacity
      style={dynamicStyles.socialButton}
      onPress={() => url && Linking.openURL(url)}
      activeOpacity={0.7}
    >
      <Ionicons name={iconName} size={isMobile ? 16 : 20} color="#A0AEC0" />
    </TouchableOpacity>
  );

  return (
    <View style={dynamicStyles.footer}>
      <View style={dynamicStyles.footerContent}>
        {/* Company Info */}
        <View style={dynamicStyles.companySection}>
          <View style={dynamicStyles.logoContainer}>
            <Text style={dynamicStyles.companyName}>
              <Text style={dynamicStyles.logoFree}>Free</Text>
              <Text style={dynamicStyles.logoJob}>job</Text>
              <Text style={dynamicStyles.logoWala}>wala</Text>
            </Text>
          </View>
          <Text style={dynamicStyles.tagline}>
            Connecting talent with opportunity. Find your dream job or the perfect candidate with us.
          </Text>
          
          {/* Social Links */}
          <View style={dynamicStyles.socialRow}>
            <SocialButton iconName="logo-facebook" url="https://facebook.com" label="Facebook" />
            <SocialButton iconName="logo-twitter" url="https://twitter.com" label="Twitter" />
            <SocialButton iconName="logo-linkedin" url="https://linkedin.com" label="LinkedIn" />
            <SocialButton iconName="logo-instagram" url="https://instagram.com" label="Instagram" />
          </View>
        </View>

        {/* Links Sections */}
        <View style={dynamicStyles.linksContainer}>
          <FooterSection
            title="Quick Links"
            icon="briefcase-outline"
            links={[
              { label: 'Browse Jobs', route: 'Jobs' },
              { label: 'Companies', route: 'Companies' },
              { label: 'Career Blogs', route: 'Blogs' },
              { label: 'Services', route: 'Services' },
            ]}
          />

          <FooterSection
            title="Job Seekers"
            icon="person-outline"
            links={[
              { label: 'Create Account', route: 'Register' },
              { label: 'Build Resume', route: 'ResumeBuilder' },
              { label: 'Job Alerts', route: 'JobAlertForm' },
              { label: 'Saved Jobs', route: 'SavedJobs' },
            ]}
          />

          <FooterSection
            title="Employers"
            icon="business-outline"
            links={[
              { label: 'Post a Job', route: 'PostJob' },
              { label: 'Browse Candidates', route: 'Companies' },
              { label: 'Pricing', route: 'Packages' },
              { label: 'Employer Login', route: 'EmployerOptions' },
            ]}
          />

          <FooterSection
            title="Support"
            icon="help-circle-outline"
            links={[
              { label: 'Help Center', route: 'HelpCenter' },
              { label: 'Contact Us', route: 'ContactUs' },
              { label: 'Terms & Conditions', route: 'Terms' },
              { label: 'Privacy Policy', route: 'Privacy' },
            ]}
          />
        </View>
      </View>

      {/* App Download Section - Mobile Only */}
      {isMobile && (
        <View style={dynamicStyles.appDownloadSection}>
          <Text style={dynamicStyles.appDownloadTitle}>Get our app</Text>
          <View style={dynamicStyles.appButtonsRow}>
            <TouchableOpacity style={dynamicStyles.appButton}>
              <Ionicons name="logo-google-playstore" size={16} color={colors.textWhite} />
              <View style={dynamicStyles.appButtonText}>
                <Text style={dynamicStyles.appButtonLabel}>Get it on</Text>
                <Text style={dynamicStyles.appButtonStore}>Google Play</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.appButton}>
              <Ionicons name="logo-apple" size={18} color={colors.textWhite} />
              <View style={dynamicStyles.appButtonText}>
                <Text style={dynamicStyles.appButtonLabel}>Download on</Text>
                <Text style={dynamicStyles.appButtonStore}>App Store</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Bar */}
      <View style={dynamicStyles.bottomBar}>
        <Text style={dynamicStyles.copyright}>
          © {new Date().getFullYear()} FreeJobWala. All rights reserved.
        </Text>
        {!isMobile && (
          <View style={dynamicStyles.bottomLinks}>
            <TouchableOpacity onPress={() => handleNavigation('Terms')}>
              <Text style={dynamicStyles.bottomLinkText}>Terms</Text>
            </TouchableOpacity>
            <Text style={dynamicStyles.bottomLinkDivider}>•</Text>
            <TouchableOpacity onPress={() => handleNavigation('Privacy')}>
              <Text style={dynamicStyles.bottomLinkText}>Privacy</Text>
            </TouchableOpacity>
            <Text style={dynamicStyles.bottomLinkDivider}>•</Text>
            <TouchableOpacity onPress={() => handleNavigation('ContactUs')}>
              <Text style={dynamicStyles.bottomLinkText}>Contact</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const getStyles = (
  isXsPhone, isSmallPhone, isPhone, isLargePhone, isMobile,
  isSmallTablet, isTablet, isLargeTablet, isTabletDevice,
  isSmallLaptop, isLaptop, isDesktop, isLargeDesktop, isDesktopDevice, width
) => {
  // Calculate responsive values
  const horizontalPadding = isXsPhone ? 12 : isSmallPhone ? 14 : isMobile ? 16 : isSmallTablet ? 20 : isTablet ? 24 : isLargeTablet ? 32 : isSmallLaptop ? 40 : isLaptop ? 48 : 64;
  const verticalPadding = isXsPhone ? 16 : isSmallPhone ? 20 : isMobile ? 24 : isTabletDevice ? 40 : 48;
  const maxWidth = isDesktopDevice ? (isLargeDesktop ? 1400 : isDesktop ? 1320 : 1140) : '100%';
  
  return StyleSheet.create({
    footer: {
      backgroundColor: '#1A202C',
      paddingTop: verticalPadding,
    },
    footerContent: {
      flexDirection: isMobile ? 'column' : isSmallTablet ? 'column' : 'row',
      flexWrap: 'wrap',
      paddingHorizontal: horizontalPadding,
      paddingBottom: isMobile ? verticalPadding * 0.5 : verticalPadding * 0.75,
      gap: isMobile ? 16 : isTabletDevice ? 28 : 32,
      maxWidth: maxWidth,
      marginHorizontal: 'auto',
      width: '100%',
      alignItems: isMobile ? 'stretch' : 'flex-start',
      overflow: 'visible',
    },
    companySection: {
      flex: isMobile ? 0 : isSmallTablet ? 1 : isTablet ? 1 : 1.5,
      width: isMobile ? '100%' : 'auto',
      minWidth: isMobile ? '100%' : isSmallTablet ? '100%' : 200,
      maxWidth: isMobile ? '100%' : isSmallTablet ? '100%' : isDesktopDevice ? 350 : 280,
      marginBottom: isMobile ? 20 : 0,
      zIndex: 1,
      position: 'relative',
    },
    logoContainer: {
      marginBottom: isMobile ? 8 : 12,
    },
    companyName: {
      fontSize: isXsPhone ? 18 : isSmallPhone ? 20 : isMobile ? 22 : isTabletDevice ? 26 : 28,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    logoFree: {
      color: colors.textWhite,
    },
    logoJob: {
      color: '#FF6B35',
    },
    logoWala: {
      color: colors.textWhite,
    },
    tagline: {
      ...typography.body2,
      color: '#A0AEC0',
      lineHeight: isMobile ? 18 : 22,
      fontSize: isXsPhone ? 11 : isSmallPhone ? 12 : isMobile ? 12 : 15,
      marginBottom: isMobile ? 12 : 16,
    },
    socialRow: {
      flexDirection: 'row',
      gap: isMobile ? 8 : 10,
      marginTop: isMobile ? 4 : 8,
      zIndex: 0,
    },
    socialButton: {
      width: isMobile ? 32 : 40,
      height: isMobile ? 32 : 40,
      borderRadius: isMobile ? 16 : 20,
      backgroundColor: '#2D3748',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#4A5568',
    },
    linksContainer: {
      flex: isMobile ? 0 : 3,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isMobile ? 12 : isSmallTablet ? 16 : isTabletDevice ? 20 : 24,
      width: isMobile ? '100%' : 'auto',
      justifyContent: isMobile ? 'space-between' : 'flex-start',
      zIndex: 2,
      position: 'relative',
      backgroundColor: '#1A202C',
    },
    section: {
      flexBasis: isMobile ? '47%' : isSmallTablet ? '47%' : 'auto',
      flexGrow: isMobile ? 0 : isSmallTablet ? 0 : 1,
      flexShrink: 0,
      minWidth: isMobile ? 130 : isSmallTablet ? 140 : isTabletDevice ? 120 : 140,
      maxWidth: isMobile ? '47%' : isSmallTablet ? '47%' : 'none',
      marginBottom: isMobile ? 16 : 0,
      backgroundColor: '#1A202C',
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isMobile ? 8 : 16,
    },
    sectionTitle: {
      ...typography.h6,
      color: colors.textWhite,
      fontWeight: '600',
      fontSize: isXsPhone ? 11 : isSmallPhone ? 12 : isMobile ? 12 : isTabletDevice ? 16 : 17,
      flexShrink: 1,
    },
    linkButton: {
      paddingVertical: isMobile ? 3 : 8,
    },
    linkText: {
      ...typography.body2,
      color: '#A0AEC0',
      lineHeight: isMobile ? 16 : 20,
      fontSize: isXsPhone ? 10 : isSmallPhone ? 11 : isMobile ? 11 : isTabletDevice ? 13 : 14,
    },
    appDownloadSection: {
      paddingHorizontal: horizontalPadding,
      paddingVertical: isMobile ? 14 : 20,
      borderTopWidth: 1,
      borderTopColor: '#2D3748',
      alignItems: 'center',
    },
    appDownloadTitle: {
      ...typography.h6,
      color: colors.textWhite,
      marginBottom: isMobile ? 8 : 12,
      fontSize: isMobile ? 12 : 14,
    },
    appButtonsRow: {
      flexDirection: 'row',
      gap: isMobile ? 8 : 10,
    },
    appButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isMobile ? 6 : 8,
      backgroundColor: '#2D3748',
      paddingVertical: isMobile ? 6 : 8,
      paddingHorizontal: isMobile ? 10 : 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#4A5568',
    },
    appButtonText: {
      gap: 0,
    },
    appButtonLabel: {
      fontSize: isMobile ? 8 : 9,
      color: '#A0AEC0',
    },
    appButtonStore: {
      fontSize: isMobile ? 11 : 13,
      fontWeight: '600',
      color: colors.textWhite,
    },
    bottomBar: {
      borderTopWidth: 1,
      borderTopColor: '#2D3748',
      paddingVertical: isMobile ? 10 : 18,
      paddingHorizontal: horizontalPadding,
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'space-between',
      gap: isMobile ? 6 : 0,
    },
    copyright: {
      ...typography.body2,
      color: '#718096',
      fontSize: isXsPhone ? 9 : isSmallPhone ? 10 : isMobile ? 10 : 13,
      textAlign: 'center',
    },
    bottomLinks: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    bottomLinkText: {
      color: '#718096',
      fontSize: 13,
    },
    bottomLinkDivider: {
      color: '#4A5568',
      fontSize: 10,
    },
  });
};

export default Footer;
