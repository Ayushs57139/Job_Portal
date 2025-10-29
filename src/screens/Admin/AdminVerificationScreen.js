import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminVerificationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/verifications`, { headers });
      const data = await response.json();
      setVerifications(data.verifications || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      Alert.alert('Error', 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/admin/verifications/${id}/approve`, {
        method: 'PATCH',
        headers
      });
      Alert.alert('Success', 'Verification approved');
      fetchVerifications();
    } catch (error) {
      console.error('Error approving verification:', error);
      Alert.alert('Error', 'Failed to approve verification');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/admin/verifications/${id}/reject`, {
        method: 'PATCH',
        headers
      });
      Alert.alert('Success', 'Verification rejected');
      fetchVerifications();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      Alert.alert('Error', 'Failed to reject verification');
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
      title="Verification"
      activeScreen="AdminVerification"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Verification Management</Text>
          <Text style={styles.pageSubtitle}>Review and approve user verifications</Text>
        </View>

        <View style={styles.statsBar}>
          <Text style={styles.statsText}>Pending Verifications: {verifications.filter(v => v.status === 'PENDING').length}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {verifications.length > 0 ? (
              verifications.map((verification, index) => (
                <View key={verification._id || index} style={styles.verificationCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.userName}>{verification.userName || 'N/A'}</Text>
                    <View style={[
                      styles.statusBadge,
                      verification.status === 'APPROVED' && styles.approvedBadge,
                      verification.status === 'REJECTED' && styles.rejectedBadge,
                      verification.status === 'PENDING' && styles.pendingBadge,
                    ]}>
                      <Text style={styles.statusText}>{verification.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.userEmail}>{verification.email || 'N/A'}</Text>
                  <Text style={styles.verificationType}>Type: {verification.type || 'N/A'}</Text>
                  
                  {verification.status === 'PENDING' && (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApprove(verification._id)}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(verification._id)}
                      >
                        <Ionicons name="close-circle" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-done-outline" size={64} color="#CCC" />
                <Text style={styles.emptyStateText}>No verifications found</Text>
              </View>
            )}
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
  statsBar: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    elevation: 1,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  verificationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  verificationType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pendingBadge: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  approvedBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  rejectedBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#27AE60',
  },
  rejectButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
});

export default AdminVerificationScreen;

