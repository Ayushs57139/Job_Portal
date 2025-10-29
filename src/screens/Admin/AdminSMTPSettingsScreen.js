import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';

const AdminSMTPSettingsScreen = ({ navigation }) => {
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  return (
    <AdminLayout title="SMTP Settings" activeScreen="AdminSMTPSettings" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>SMTP Settings</Text>
        <Text style={styles.pageSubtitle}>Configure email server settings</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>SMTP Configuration</Text>
          <Text style={styles.infoText}>Configure your SMTP server settings for sending emails from the platform.</Text>
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  pageSubtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 20 },
  infoCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 20 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#666', lineHeight: 20 },
});

export default AdminSMTPSettingsScreen;

