import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';

const AdminJobAlertsScreen = ({ navigation }) => {
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  return (
    <AdminLayout title="Job Alerts" activeScreen="AdminJobAlerts" onNavigate={handleNavigate} onLogout={handleLogout}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Job Alerts</Text>
        <Text style={styles.pageSubtitle}>Manage job alert subscriptions</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Job alerts management coming soon...</Text>
        </View>
      </View>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  pageSubtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 20 },
  infoCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginTop: 20 },
  infoText: { fontSize: 16, color: '#666', textAlign: 'center' },
});

export default AdminJobAlertsScreen;

