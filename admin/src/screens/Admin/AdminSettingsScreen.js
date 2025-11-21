import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

const AdminSettingsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
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
      <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.pageTitle}>Platform Settings</Text>
          <Text style={dynamicStyles.pageSubtitle}>Configure and manage platform settings</Text>
        </View>
        
        {settings.map((setting, index) => (
          <TouchableOpacity 
            key={index} 
            style={dynamicStyles.settingCard}
            onPress={() => handleSettingPress(setting.screen)}
            activeOpacity={0.7}
          >
            <View style={[dynamicStyles.iconContainer, { backgroundColor: `${setting.color}20` }]}>
              <Ionicons name={setting.icon} size={isMobile ? 24 : isTablet ? 26 : 28} color={setting.color} />
            </View>
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingTitle}>{setting.title}</Text>
              <Text style={dynamicStyles.settingDescription}>{setting.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={isMobile ? 20 : isTablet ? 22 : 24} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        <View style={dynamicStyles.infoCard}>
          <Ionicons name="information-circle" size={isMobile ? 20 : isTablet ? 22 : 24} color={colors.info} />
          <View style={dynamicStyles.infoContent}>
            <Text style={dynamicStyles.infoTitle}>Settings Information</Text>
            <Text style={dynamicStyles.infoText}>
              All settings are saved in real-time and synchronized across the platform. 
              Make sure to review your changes before saving.
            </Text>
          </View>
        </View>

        <View style={dynamicStyles.bottomSpacing} />
      </ScrollView>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: isMobile ? spacing.md : isTablet ? spacing.lg - 4 : spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: { 
    ...typography.h2,
    color: colors.text,
    fontSize: isMobile ? 22 : isTablet ? 26 : 28,
  },
  pageSubtitle: { 
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: isMobile ? spacing.sm : spacing.md,
    marginTop: isMobile ? spacing.sm : spacing.md,
    borderRadius: borderRadius.lg,
    padding: isMobile ? spacing.md : isTablet ? spacing.lg - 4 : spacing.lg,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  iconContainer: {
    width: isMobile ? 48 : isTablet ? 52 : 56,
    height: isMobile ? 48 : isTablet ? 52 : 56,
    borderRadius: isMobile ? 24 : isTablet ? 26 : 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isMobile ? spacing.sm : spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: { 
    ...typography.subtitle1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: isMobile ? 15 : isTablet ? 16 : 17,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.infoLight,
    marginHorizontal: isMobile ? spacing.sm : spacing.md,
    marginTop: isMobile ? spacing.sm : spacing.lg,
    padding: isMobile ? spacing.sm : spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoContent: {
    flex: 1,
    marginLeft: isMobile ? spacing.sm : spacing.md,
  },
  infoTitle: {
    ...typography.subtitle2,
    color: colors.info,
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: isMobile ? 13 : isTablet ? 14 : 15,
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    lineHeight: 18,
    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
  },
  bottomSpacing: {
    height: isMobile ? spacing.xl : spacing.xxl,
  },
});

const styles = StyleSheet.create({});

export default AdminSettingsScreen;

