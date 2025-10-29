import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';

const AdminSettingsScreen = ({ navigation }) => {
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  const settings = [
    { title: 'General Settings', icon: 'settings-outline', color: '#3498DB' },
    { title: 'Security Settings', icon: 'shield-checkmark-outline', color: '#27AE60' },
    { title: 'Email Configuration', icon: 'mail-outline', color: '#F39C12' },
    { title: 'Payment Settings', icon: 'card-outline', color: '#9B59B6' },
    { title: 'Notification Settings', icon: 'notifications-outline', color: '#E74C3C' },
  ];

  return (
    <AdminLayout title="Settings" activeScreen="AdminSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSubtitle}>Configure platform settings</Text>
        
        {settings.map((setting, index) => (
          <TouchableOpacity key={index} style={styles.settingCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${setting.color}20` }]}>
              <Ionicons name={setting.icon} size={24} color={setting.color} />
            </View>
            <Text style={styles.settingTitle}>{setting.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  pageSubtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 20 },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: '#333' },
});

export default AdminSettingsScreen;

