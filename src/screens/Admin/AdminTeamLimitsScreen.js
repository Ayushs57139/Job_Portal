import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminTeamLimitsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [teamLimits, setTeamLimits] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchTeamLimits();
  }, []);

  const fetchTeamLimits = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/team-limits`, { headers });
      const data = await response.json();
      setTeamLimits(data.teamLimits || []);
    } catch (error) {
      console.error('Error fetching team limits:', error);
      Alert.alert('Error', 'Failed to fetch team limits');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <AdminLayout
      title="Team Limits"
      activeScreen="AdminTeamLimits"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Team Limits Management</Text>
          <Text style={styles.pageSubtitle}>Manage team size limits for employers</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Team Limits Overview</Text>
              <Text style={styles.infoText}>
                Configure team member limits for different employer packages and subscription tiers.
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{teamLimits.length}</Text>
                <Text style={styles.statLabel}>Total Employers</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {teamLimits.reduce((sum, t) => sum + (t.currentMembers || 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Total Members</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default AdminTeamLimitsScreen;

