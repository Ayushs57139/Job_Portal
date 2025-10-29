import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../styles/theme';

const Footer = () => {
  const navigation = useNavigation();

  const handleNavigation = (route) => {
    try {
      navigation.navigate(route);
    } catch (error) {
      console.log('Navigation route not found:', route);
    }
  };

  const FooterSection = ({ title, links }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {links.map((link, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleNavigation(link.route)}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>{link.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        {/* Company Info */}
        <View style={styles.companySection}>
          <Text style={styles.companyName}>JobWala</Text>
          <Text style={styles.tagline}>Connecting talent with opportunity</Text>
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

      <View style={styles.bottomBar}>
        <Text style={styles.copyright}>
          © 2025 JobWala. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#2D3748',
    paddingTop: spacing.xxl,
  },
  footerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  companySection: {
    flex: 1,
    minWidth: 200,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body1,
    color: '#A0AEC0',
    lineHeight: 24,
  },
  section: {
    flex: 1,
    minWidth: 150,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textWhite,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: spacing.xs,
  },
  linkText: {
    ...typography.body2,
    color: '#A0AEC0',
    lineHeight: 24,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#4A5568',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  copyright: {
    ...typography.body2,
    color: '#A0AEC0',
  },
});

export default Footer;

