import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
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

const EmployerSidebar = ({ visible, onClose, navigation, role = 'company', permanent = false, activeKey = 'overview' }) => {
  const responsive = useResponsive();
  const { isMobile } = responsive;
  
  const items = [
    { key: 'overview', label: 'Overview', icon: 'grid-outline', action: () => navigation.navigate('CompanyDashboard') },
    { key: 'manageJobs', label: 'Manage Jobs', icon: 'briefcase-outline', action: () => navigation.navigate('EmployerJobs') },
    { key: 'postJob', label: 'Post Job', icon: 'add-circle-outline', action: () => navigation.navigate('EmployerPostJob') },
    { key: 'draftJobs', label: 'Draft Jobs', icon: 'document-text-outline', action: () => navigation.navigate('EmployerDraftJobs') },
    { key: 'responses', label: 'Manage Job Responses', icon: 'people-outline', action: () => navigation.navigate('EmployerManageResponses') },
    { key: 'resume', label: 'Candidate Search', icon: 'search-outline', action: () => navigation.navigate('EmployerCandidateSearch') },
    { key: 'employees', label: 'Employees', icon: 'people-circle-outline', action: () => navigation.navigate('EmployerEmployees') },
    { key: 'social', label: 'Social Updates', icon: 'megaphone-outline', action: () => navigation.navigate('EmployerSocialUpdates') },
    { key: 'liveChat', label: 'Live Chat', icon: 'chatbubbles-outline', action: () => navigation.navigate('LiveChatSupport') },
    { key: 'profile', label: 'Profile', icon: 'person-circle-outline', action: () => navigation.navigate('CompanyProfile') },
    { key: 'team', label: 'Team Members', icon: 'people-outline', action: () => navigation.navigate('CompanyProfile') },
    { key: 'orgProfile', label: role === 'consultancy' ? 'Consultancy Profile' : 'Company Profile', icon: 'business-outline', action: () => navigation.navigate('CompanyProfile') },
    { key: 'settings', label: 'Settings', icon: 'settings-outline', action: () => navigation.navigate('UserSettings') },
  ];

  const SidebarInner = ({ containerStyle }) => (
    <View style={containerStyle}>
      <LinearGradient
        colors={['#1e3a8a', '#1e40af', '#2563eb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.brandContainer}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <View style={styles.brandIconContainer}>
              <Ionicons name="briefcase" size={28} color="#60A5FA" />
            </View>
            <View style={styles.brandTextContainer}>
              <Text style={styles.brandTitle}>Free job wala</Text>
              <Text style={styles.brandSubtitle}>{role === 'consultancy' ? 'Consultancy' : 'Company'} Panel</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <ScrollView 
        style={styles.menuContainer} 
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, isActive && styles.activeItem]}
              onPress={() => {
                item.action();
                if (!permanent && onClose) onClose();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <Ionicons name={item.icon} size={20} color={isActive ? '#60A5FA' : '#CBD5E1'} />
              </View>
              <Text style={[styles.itemText, isActive && styles.activeItemText]}>{item.label}</Text>
              {isActive && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  if (permanent) {
    return (
      <View style={styles.permanentContainer}>
        <SidebarInner containerStyle={styles.drawerStatic} />
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <SidebarInner containerStyle={styles.drawer} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  permanentContainer: {
    width: isWeb ? 280 : 280,
    backgroundColor: '#0F172A',
    flex: 1,
    ...(isWeb && {
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }),
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: isWeb ? 280 : '85%',
    maxWidth: 320,
    backgroundColor: '#0F172A',
    paddingTop: 0,
    paddingHorizontal: 0,
    flex: 1,
    ...(isWeb && {
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }),
  },
  drawerStatic: {
    width: 280,
    backgroundColor: '#0F172A',
    paddingTop: 0,
    paddingHorizontal: 0,
    flex: 1,
    ...(isWeb && {
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }),
  },
  headerGradient: {
    paddingBottom: spacing.lg,
    ...shadows.md,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl + 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...(isWeb && {
      cursor: 'pointer',
    }),
  },
  brandIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  brandTextContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 2,
    fontWeight: '500',
  },
  brandTitleMobile: {
    fontSize: 18,
  },
  brandSubtitleMobile: {
    fontSize: 11,
  },
  menuContainer: {
    flex: 1,
    ...(isWeb && {
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }),
  },
  menuContent: {
    paddingVertical: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.sm,
    marginVertical: 2,
    borderRadius: borderRadius.md,
    position: 'relative',
    ...(isWeb && {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }),
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    marginRight: spacing.md,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
  },
  itemText: {
    fontSize: 15,
    color: '#E2E8F0',
    flex: 1,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  itemTextMobile: {
    fontSize: 14,
  },
  activeItem: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#60A5FA',
    ...(isWeb && {
      transform: [{ translateX: 4 }],
    }),
  },
  activeItemText: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
    marginLeft: spacing.sm,
  },
});

export default EmployerSidebar;


