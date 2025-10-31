import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

const isWeb = Platform.OS === 'web';

const UserSidebar = ({ navigation, activeKey = 'dashboard', onClose = null, badges = {} }) => {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>
          Free <Text style={styles.brandTitleOrange}>job</Text> wala
        </Text>
        <Text style={styles.brandSubtitle}>Dashboard</Text>
      </View>
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, isActive && styles.activeItem]}
              onPress={item.action}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={item.icon} 
                size={20} 
                color={isActive ? '#4A90E2' : '#FFFFFF'} 
                style={styles.icon}
              />
              <Text style={[styles.itemText, isActive && styles.activeItemText]}>
                {item.label}
              </Text>
              {item.badge !== null && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: isWeb ? 260 : 260,
    backgroundColor: '#2C3E50',
    height: '100%',
    paddingTop: spacing.xl,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  brandTitleOrange: {
    color: '#FF6B35',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 4,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 6,
  },
  icon: {
    marginRight: 12,
  },
  itemText: {
    fontSize: 15,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default UserSidebar;

