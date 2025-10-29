import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import StatCard from '../../components/Admin/StatCard';

const AdminAnalyticsScreen = ({ navigation }) => {
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  return (
    <AdminLayout title="Analytics" activeScreen="AdminAnalytics" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Analytics Dashboard</Text>
        <Text style={styles.pageSubtitle}>View platform statistics and insights</Text>
        
        <View style={styles.statsContainer}>
          <StatCard icon="eye" iconColor="#3498DB" iconBg="rgba(52, 152, 219, 0.1)" count="1,234" label="Page Views" />
          <StatCard icon="people" iconColor="#27AE60" iconBg="rgba(39, 174, 96, 0.1)" count="567" label="Active Users" />
        </View>
        
        <View style={styles.statsContainer}>
          <StatCard icon="trending-up" iconColor="#F39C12" iconBg="rgba(243, 156, 18, 0.1)" count="89%" label="Growth Rate" />
          <StatCard icon="time" iconColor="#9B59B6" iconBg="rgba(155, 89, 182, 0.1)" count="5m 30s" label="Avg. Session" />
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  pageSubtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 20 },
  statsContainer: { flexDirection: 'row', marginHorizontal: -8 },
});

export default AdminAnalyticsScreen;

