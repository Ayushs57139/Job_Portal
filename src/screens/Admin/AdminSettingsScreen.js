import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';

const AdminSettingsScreen = ({ navigation }) => {
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  const settings = [
    { 
      title: 'General Settings', 
      icon: 'settings-outline', 
      color: '#3498DB',
      screen: 'GeneralSettings',
      description: 'Configure basic platform settings'
    },
    { 
      title: 'Security Settings', 
      icon: 'shield-checkmark-outline', 
      color: '#27AE60',
      screen: 'SecuritySettings',
      description: 'Manage security and authentication'
    },
    { 
      title: 'Email Configuration', 
      icon: 'mail-outline', 
      color: '#F39C12',
      screen: 'EmailConfiguration',
      description: 'Configure email delivery settings'
    },
    { 
      title: 'Payment Settings', 
      icon: 'card-outline', 
      color: '#9B59B6',
      screen: 'PaymentSettings',
      description: 'Setup payment gateways and policies'
    },
    { 
      title: 'Notification Settings', 
      icon: 'notifications-outline', 
      color: '#E74C3C',
      screen: 'NotificationSettings',
      description: 'Manage notification preferences'
    },
  ];

  const handleSettingPress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <AdminLayout title="Settings" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Platform Settings</Text>
          <Text style={styles.pageSubtitle}>Configure and manage platform settings</Text>
        </View>
        
        {settings.map((setting, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.settingCard}
            onPress={() => handleSettingPress(setting.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${setting.color}20` }]}>
              <Ionicons name={setting.icon} size={28} color={setting.color} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Settings Information</Text>
            <Text style={styles.infoText}>
              All settings are saved in real-time and synchronized across the platform. 
              Make sure to review your changes before saving.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: { 
    ...typography.h2,
    color: colors.text,
  },
  pageSubtitle: { 
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: { 
    ...typography.subtitle1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.infoLight,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoTitle: {
    ...typography.subtitle2,
    color: colors.info,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default AdminSettingsScreen;

