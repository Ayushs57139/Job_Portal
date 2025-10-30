import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

const isWeb = Platform.OS === 'web';

const EmployerSidebar = ({ visible, onClose, navigation, role = 'company', permanent = false, activeKey = 'overview' }) => {
  const items = [
    { key: 'overview', label: 'Overview', icon: 'grid-outline', action: () => onClose && onClose() },
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
    { key: 'settings', label: 'Settings', icon: 'settings-outline', action: () => navigation.navigate('Services') },
  ];

  const SidebarInner = ({ containerStyle }) => (
    <View style={containerStyle}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Free job wala</Text>
        <Text style={styles.brandSubtitle}>{role === 'consultancy' ? 'Consultancy' : 'Company'} Panel</Text>
      </View>
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
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
              activeOpacity={0.8}
            >
              <Ionicons name={item.icon} size={22} color={isActive ? '#4A90E2' : '#E0E0E0'} />
              <Text style={[styles.itemText, isActive && styles.activeItemText]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={isActive ? '#4A90E2' : '#B0B0B0'} style={styles.expandIcon} />
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  permanentContainer: {
    width: isWeb ? 260 : 260,
    backgroundColor: '#2C3E50',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: isWeb ? 260 : '80%',
    backgroundColor: '#2C3E50',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.none || 0,
  },
  drawerStatic: {
    width: 260,
    backgroundColor: '#2C3E50',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.none || 0,
    height: '100%',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)'
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 6,
  },
  itemText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  expandIcon: {
    marginLeft: 'auto',
  },
  activeItem: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  activeItemText: {
    color: '#4A90E2',
    fontWeight: '700'
  },
});

export default EmployerSidebar;


