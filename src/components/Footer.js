import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);

  const handleNavigation = (route) => {
    try {
      navigation.navigate(route);
    } catch (error) {
      console.log('Navigation route not found:', route);
    }
  };

  const FooterSection = ({ title, links }) => {
    const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);
    return (
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>{title}</Text>
        {links.map((link, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleNavigation(link.route)}
            style={dynamicStyles.linkButton}
          >
            <Text style={dynamicStyles.linkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={dynamicStyles.footer}>
      <View style={dynamicStyles.footerContent}>
        {/* Company Info */}
        <View style={dynamicStyles.companySection}>
          <Text style={dynamicStyles.companyName}>JobWala</Text>
          <Text style={dynamicStyles.tagline}>Connecting talent with opportunity</Text>
        </View>

        {/* Quick Links */}
        <FooterSection
          title="Quick Links"
          links={[
            { label: 'Jobs', route: 'Jobs' },
            { label: 'Companies', route: 'Companies' },
            { label: 'Services', route: 'Services' },
          ]}
        />

        {/* Support */}
        <FooterSection
          title="Support"
          links={[
            { label: 'Help Center', route: 'HelpCenter' },
            { label: 'Contact Us', route: 'ContactUs' },
            { label: 'Terms & Conditions', route: 'Terms' },
            { label: 'Privacy Policy', route: 'Privacy' },
          ]}
        />
      </View>

      <View style={dynamicStyles.bottomBar}>
        <Text style={dynamicStyles.copyright}>
          © 2025 JobWala. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

const getStyles = (isPhone, isMobile, isTablet, isDesktop, width) => StyleSheet.create({
  footer: {
    backgroundColor: '#2D3748',
    paddingTop: isPhone ? spacing.lg : (isMobile ? spacing.xl : isTablet ? spacing.xl : spacing.xxl),
  },
  footerContent: {
    flexDirection: isPhone ? 'column' : (isMobile ? 'column' : 'row'),
    flexWrap: 'wrap',
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : isTablet ? spacing.lg : spacing.xl),
    paddingBottom: isPhone ? spacing.lg : spacing.xl,
    gap: isPhone ? spacing.md : (isMobile ? spacing.lg : isTablet ? spacing.lg : spacing.xl),
    maxWidth: isDesktop ? (width > 1400 ? 1400 : 1200) : '100%',
    marginHorizontal: 'auto',
    width: '100%',
  },
  companySection: {
    flex: isMobile ? 1 : 1,
    minWidth: isMobile ? '100%' : 200,
  },
  companyName: {
    fontSize: isPhone ? 18 : (isMobile ? 20 : (isTablet ? 22 : (isDesktop ? 24 : 22))),
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body1,
    color: '#A0AEC0',
    lineHeight: isPhone ? 20 : (isMobile ? 22 : (isTablet ? 22 : 24)),
    fontSize: isPhone ? 13 : (isMobile ? 14 : (isTablet ? 15 : (isDesktop ? 16 : 15))),
  },
  section: {
    flex: isPhone ? 1 : (isMobile ? 1 : 1),
    minWidth: isPhone ? '100%' : (isMobile ? '100%' : 150),
    marginBottom: isPhone ? spacing.md : 0,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textWhite,
    marginBottom: spacing.md,
    fontWeight: '600',
    fontSize: isPhone ? 14 : (isMobile ? 16 : (isTablet ? 17 : (isDesktop ? 18 : 17))),
  },
  linkButton: {
    paddingVertical: spacing.xs,
  },
  linkText: {
    ...typography.body2,
    color: '#A0AEC0',
    lineHeight: isPhone ? 20 : (isMobile ? 22 : (isTablet ? 22 : 24)),
    fontSize: isPhone ? 12 : (isMobile ? 13 : (isTablet ? 13 : (isDesktop ? 14 : 13))),
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#4A5568',
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : isTablet ? spacing.lg : spacing.xl),
    alignItems: 'center',
  },
  copyright: {
    ...typography.body2,
    color: '#A0AEC0',
    fontSize: isPhone ? 11 : (isMobile ? 12 : (isTablet ? 13 : (isDesktop ? 14 : 13))),
    textAlign: 'center',
  },
});

export default Footer;

