import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
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

const UserSidebar = ({ navigation, activeKey = 'dashboard', onClose = null, badges = {} }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  
  const dynamicStyles = useMemo(() => {
    return getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);
  }, [isPhone, isMobile, isTablet, isDesktop, responsive.width]);
  const items = [
    { 
      key: 'dashboard', 
      label: 'Dashboard', 
      icon: 'settings-outline', 
      action: () => {
        navigation.navigate('UserDashboard');
        if (onClose) onClose();
      },
      badge: null
    },
    { 
      key: 'applications', 
      label: 'My Applications', 
      icon: 'document-text-outline', 
      action: () => {
        navigation.navigate('MyApplications');
        if (onClose) onClose();
      },
      badge: null
    },
    { 
      key: 'resume', 
      label: 'Resume Builder', 
      icon: 'create-outline', 
      action: () => {
        navigation.navigate('ResumeBuilder');
        if (onClose) onClose();
      },
      badge: null
    },
    { 
      key: 'savedJobs', 
      label: 'Saved Jobs', 
      icon: 'bookmark-outline', 
      action: () => {
        navigation.navigate('SavedJobs');
        if (onClose) onClose();
      },
      badge: badges.savedJobs !== undefined ? badges.savedJobs : 0
    },
    { 
      key: 'activeApplications', 
      label: 'Active Applications', 
      icon: 'checkmark-circle-outline', 
      action: () => {
        navigation.navigate('ActiveApplications');
        if (onClose) onClose();
      },
      badge: badges.activeApplications !== undefined ? badges.activeApplications : 0
    },
    { 
      key: 'appliedJobs', 
      label: 'Applied Jobs', 
      icon: 'paper-plane-outline', 
      action: () => {
        navigation.navigate('AppliedJobs');
        if (onClose) onClose();
      },
      badge: badges.appliedJobs !== undefined ? badges.appliedJobs : 0
    },
    { 
      key: 'liveChat', 
      label: 'Live Chat', 
      icon: 'chatbubbles-outline', 
      action: () => {
        navigation.navigate('LiveChatSupport');
        if (onClose) onClose();
      },
      badge: null
    },
    { 
      key: 'profile', 
      label: 'Profile', 
      icon: 'person-outline', 
      action: () => {
        navigation.navigate('UserProfile');
        if (onClose) onClose();
      },
      badge: null
    },
    { 
      key: 'settings', 
      label: 'Settings', 
      icon: 'settings-outline', 
      action: () => {
        navigation.navigate('UserSettings');
        if (onClose) onClose();
      },
      badge: null
    },
  ];

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity 
          style={dynamicStyles.headerContent}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Text style={dynamicStyles.brandTitle}>
            Free <Text style={dynamicStyles.brandTitleOrange}>job</Text> wala
          </Text>
          <Text style={dynamicStyles.brandSubtitle}>Dashboard</Text>
        </TouchableOpacity>
        {isPhone && onClose && (
          <TouchableOpacity
            style={dynamicStyles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={isPhone ? 22 : 24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={dynamicStyles.menuContainer} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[dynamicStyles.item, isActive && dynamicStyles.activeItem]}
              onPress={item.action}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={item.icon} 
                size={isPhone ? 18 : (isMobile ? 20 : 22)} 
                color={isActive ? '#4A90E2' : '#FFFFFF'} 
                style={dynamicStyles.icon}
              />
              <Text style={[dynamicStyles.itemText, isActive && dynamicStyles.activeItemText]}>
                {item.label}
              </Text>
              {item.badge !== null && item.badge > 0 && (
                <View style={dynamicStyles.badge}>
                  <Text style={dynamicStyles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const getStyles = (isPhone, isMobile, isTablet, isDesktop, width) => {
  const isWeb = getPlatform().OS === 'web';
  return StyleSheet.create({
    container: {
      width: isPhone ? Math.min(width * 0.85, 320) : (isMobile ? 240 : (isTablet ? 260 : (isDesktop ? 280 : 260))),
      backgroundColor: '#2C3E50',
      height: '100%',
      paddingTop: isPhone ? spacing.lg : (isMobile ? spacing.xl : spacing.xxl),
      ...(isPhone && {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
      }),
      ...(isWeb && !isPhone && {
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isPhone ? spacing.md : (isMobile ? spacing.lg : 20),
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerContent: {
      flex: 1,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    closeButton: {
      padding: spacing.sm,
      marginLeft: spacing.sm,
      borderRadius: borderRadius.sm,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    brandTitle: {
      fontSize: isPhone ? 16 : (isMobile ? 17 : (isTablet ? 18 : 20)),
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    brandTitleOrange: {
      color: '#FF6B35',
    },
    brandSubtitle: {
      fontSize: isPhone ? 11 : (isMobile ? 12 : 13),
      color: '#B0B0B0',
      marginTop: 4,
    },
    menuContainer: {
      flex: 1,
      paddingVertical: isPhone ? spacing.sm : 10,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isPhone ? spacing.sm : (isMobile ? 12 : 14),
      paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : 20),
      marginHorizontal: isPhone ? spacing.sm : 8,
      marginVertical: isPhone ? 1 : 2,
      borderRadius: 6,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    icon: {
      marginRight: isPhone ? spacing.sm : 12,
    },
    itemText: {
      fontSize: isPhone ? 13 : (isMobile ? 14 : 15),
      color: '#FFFFFF',
      fontWeight: '500',
      flex: 1,
    },
    activeItem: {
      backgroundColor: '#4A90E2',
    },
    activeItemText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    badge: {
      backgroundColor: '#FF6B35',
      borderRadius: 12,
      paddingHorizontal: isPhone ? 6 : 8,
      paddingVertical: 2,
      minWidth: isPhone ? 20 : 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: isPhone ? 10 : 12,
      fontWeight: '600',
    },
  });
};

export default UserSidebar;

