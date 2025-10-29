import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';

const AdminEmailLogsScreen = ({ navigation }) => {
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  return (
    <AdminLayout title="Email Logs" activeScreen="AdminEmailLogs" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>Email Logs</Text>
        <Text style={styles.pageSubtitle}>View email sending history and logs</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Email logs will appear here...</Text>
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
  infoText: { fontSize: 16, color: '#666', textAlign: 'center' },
});

export default AdminEmailLogsScreen;

