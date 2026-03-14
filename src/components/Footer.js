import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';
import { useResponsive } from '../utils/responsive';

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
  const { width } = responsive;
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;

  const handleNavigation = (route) => {
    try {
      navigation.navigate(route);
    } catch (error) {
      console.log('Navigation route not found:', route);
    }
  };

  const FooterSection = ({ title, links, icon }) => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name={icon} size={18} color="#FF6B35" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.linksContainer}>
          {links.map((link, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleNavigation(link.route)}
              style={styles.linkButton}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const SocialButton = ({ iconName, url }) => (
    <TouchableOpacity
      style={styles.socialButton}
      onPress={() => url && Linking.openURL(url)}
      activeOpacity={0.8}
    >
      <Ionicons name={iconName} size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.footer}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={styles.contentWrapper}>
          {/* Company Info */}
          <View style={styles.companySection}>
            <View style={styles.logoContainer}>
              <Text style={styles.companyName}>
                <Text style={styles.logoFree}>Free</Text>
                <Text style={styles.logoJob}>job</Text>
                <Text style={styles.logoWala}>wala</Text>
              </Text>
            </View>
            <Text style={styles.tagline}>
              Connecting talent with opportunity. Find your dream job or the perfect candidate with us.
            </Text>
            
            {/* Social Links */}
            <View style={styles.socialRow}>
              <SocialButton iconName="logo-facebook" url="https://facebook.com" />
              <SocialButton iconName="logo-twitter" url="https://twitter.com" />
              <SocialButton iconName="logo-linkedin" url="https://linkedin.com" />
              <SocialButton iconName="logo-instagram" url="https://instagram.com" />
            </View>
          </View>

          {/* Links Grid */}
          <View style={styles.linksGrid}>
            <FooterSection
              title="Quick Links"
              icon="flash-outline"
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
              icon="briefcase-outline"
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
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomContent}>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} FreeJobWala. All rights reserved.
          </Text>
          <View style={styles.bottomLinks}>
            <TouchableOpacity onPress={() => handleNavigation('Terms')}>
              <Text style={styles.bottomLinkText}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.divider}>•</Text>
            <TouchableOpacity onPress={() => handleNavigation('Privacy')}>
              <Text style={styles.bottomLinkText}>Privacy</Text>
            </TouchableOpacity>
            <Text style={styles.divider}>•</Text>
            <TouchableOpacity onPress={() => handleNavigation('ContactUs')}>
              <Text style={styles.bottomLinkText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#2D3748',
    width: '100%',
    marginTop: 40,
  },
  topSection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#4A5568',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  contentWrapper: {
    maxWidth: 1400,
    width: '100%',
    marginHorizontal: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 48,
  },
  companySection: {
    flex: 1,
    minWidth: 280,
    maxWidth: 360,
  },
  logoContainer: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  logoFree: {
    color: '#FFFFFF',
  },
  logoJob: {
    color: '#FF6B35',
  },
  logoWala: {
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 16,
    color: '#CBD5E0',
    lineHeight: 26,
    marginBottom: 28,
    fontWeight: '400',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 14,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A5568',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#718096',
  },
  linksGrid: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 40,
    justifyContent: 'space-between',
    minWidth: 500,
  },
  section: {
    minWidth: 160,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  linksContainer: {
    gap: 4,
  },
  linkButton: {
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 15,
    color: '#CBD5E0',
    lineHeight: 20,
    fontWeight: '400',
  },
  bottomBar: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#4A5568',
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: '#1A202C',
  },
  bottomContent: {
    maxWidth: 1400,
    width: '100%',
    marginHorizontal: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  copyright: {
    fontSize: 15,
    color: '#A0AEC0',
    fontWeight: '400',
  },
  bottomLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bottomLinkText: {
    fontSize: 15,
    color: '#CBD5E0',
    fontWeight: '400',
  },
  divider: {
    color: '#718096',
    fontSize: 14,
  },
});

export default Footer;
