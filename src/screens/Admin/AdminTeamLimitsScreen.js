import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, TextInput, Modal } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminTeamLimitsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [employers, setEmployers] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [newTeamLimit, setNewTeamLimit] = useState('');

  useEffect(() => {
    fetchEmployers();
  }, []);

  useEffect(() => {
    filterEmployers();
  }, [searchQuery, employers]);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch all users who are company or consultancy
      console.log('Fetching employers from:', `${API_URL}/admin/users?userType=company,consultancy&limit=1000`);
      const response = await fetch(`${API_URL}/admin/users?userType=company,consultancy&limit=1000`, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to fetch employers');
      }
      
      const data = await response.json();
      console.log('Employers data received:', data);
      
      const employersList = data.users || [];
      console.log('Number of employers:', employersList.length);
      setEmployers(employersList);
      setFilteredEmployers(employersList);
    } catch (error) {
      console.error('Error fetching employers:', error);
      Alert.alert('Error', 'Failed to fetch employers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployers = () => {
    if (!searchQuery) {
      setFilteredEmployers(employers);
      return;
    }

    const filtered = employers.filter(emp =>
      emp.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEmployers(filtered);
  };

  const handleEditLimit = (employer) => {
    setSelectedEmployer(employer);
    setNewTeamLimit((employer.teamLimit || 0).toString());
    setEditModalVisible(true);
  };

  const handleUpdateLimit = async () => {
    if (!newTeamLimit || isNaN(newTeamLimit) || parseInt(newTeamLimit) < 0) {
      Alert.alert('Error', 'Please enter a valid team limit (0 or greater)');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/users/${selectedEmployer._id}/team-limit`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ teamLimit: parseInt(newTeamLimit) })
      });

      if (!response.ok) {
        throw new Error('Failed to update team limit');
      }

      Alert.alert('Success', 'Team limit updated successfully');
      setEditModalVisible(false);
      fetchEmployers(); // Refresh the list
    } catch (error) {
      console.error('Error updating team limit:', error);
      Alert.alert('Error', 'Failed to update team limit');
    }
  };

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const getTotalTeamMembers = () => {
    return employers.reduce((sum, emp) => sum + (emp.currentTeamMembers || 0), 0);
  };

  return (
    <AdminLayout
      title="Team Limits"
      activeScreen="AdminTeamLimits"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>Team Limits Management</Text>
            <Text style={styles.pageSubtitle}>Manage team size limits for employers</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.loadingText}>Loading employers...</Text>
            </View>
          ) : (
            <>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="business-outline" size={32} color="#4A90E2" />
                  <Text style={styles.statNumber}>{employers.length}</Text>
                  <Text style={styles.statLabel}>Total Employers</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="people-outline" size={32} color="#27AE60" />
                  <Text style={styles.statNumber}>{getTotalTeamMembers()}</Text>
                  <Text style={styles.statLabel}>Total Team Members</Text>
                </View>
              </View>

              <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={20} color="#999" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, email, or company..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {filteredEmployers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="business-outline" size={64} color="#CCCCCC" />
                  <Text style={styles.emptyStateText}>No employers found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    {searchQuery ? 'Try adjusting your search' : 'Employers will appear here when they register'}
                  </Text>
                </View>
              ) : (
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.nameColumn]}>Employer Details</Text>
                    <Text style={[styles.tableHeaderCell, styles.typeColumn]}>Type</Text>
                    <Text style={[styles.tableHeaderCell, styles.limitColumn]}>Team Limit</Text>
                    <Text style={[styles.tableHeaderCell, styles.currentColumn]}>Current Members</Text>
                    <Text style={[styles.tableHeaderCell, styles.actionColumn]}>Action</Text>
                  </View>

                  {filteredEmployers.map((employer, index) => (
                    <View key={employer._id} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                      <View style={[styles.tableCell, styles.nameColumn]}>
                        <Text style={styles.employerName}>
                          {employer.firstName} {employer.lastName}
                        </Text>
                        <Text style={styles.employerEmail}>{employer.email}</Text>
                        {employer.companyName && (
                          <Text style={styles.employerCompany}>{employer.companyName}</Text>
                        )}
                      </View>
                      <View style={[styles.tableCell, styles.typeColumn]}>
                        <View style={[styles.typeBadge, employer.userType === 'company' ? styles.companyBadge : styles.consultancyBadge]}>
                          <Text style={[styles.typeBadgeText, employer.userType === 'consultancy' && styles.consultancyBadgeText]}>
                            {employer.userType === 'company' ? 'Company' : 'Consultancy'}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.tableCell, styles.limitColumn]}>
                        <Text style={styles.limitNumber}>
                          {employer.teamLimit !== undefined ? employer.teamLimit : 0}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, styles.currentColumn]}>
                        <Text style={styles.currentNumber}>
                          {employer.currentTeamMembers || 0}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, styles.actionColumn]}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEditLimit(employer)}
                        >
                          <Ionicons name="create-outline" size={18} color="#FFF" />
                          <Text style={styles.editButtonText}>Edit Limit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Edit Team Limit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Team Limit</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedEmployer && (
              <View style={styles.modalBody}>
                <View style={styles.employerInfo}>
                  <Text style={styles.employerInfoLabel}>Employer:</Text>
                  <Text style={styles.employerInfoValue}>
                    {selectedEmployer.firstName} {selectedEmployer.lastName}
                  </Text>
                  <Text style={styles.employerInfoEmail}>{selectedEmployer.email}</Text>
                </View>

                <View style={styles.currentInfoBox}>
                  <View style={styles.currentInfoItem}>
                    <Text style={styles.currentInfoLabel}>Current Limit:</Text>
                    <Text style={styles.currentInfoValue}>
                      {selectedEmployer.teamLimit !== undefined ? selectedEmployer.teamLimit : 0}
                    </Text>
                  </View>
                  <View style={styles.currentInfoItem}>
                    <Text style={styles.currentInfoLabel}>Active Members:</Text>
                    <Text style={styles.currentInfoValue}>
                      {selectedEmployer.currentTeamMembers || 0}
                    </Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Team Limit</Text>
                  <TextInput
                    style={styles.input}
                    value={newTeamLimit}
                    onChangeText={setNewTeamLimit}
                    keyboardType="numeric"
                    placeholder="Enter team limit"
                  />
                  <Text style={styles.inputHint}>
                    Set how many team members this employer can have
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdateLimit}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
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
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    padding: 15,
  },
  tableHeaderCell: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tableRowEven: {
    backgroundColor: '#F9F9F9',
  },
  tableCell: {
    justifyContent: 'center',
  },
  nameColumn: {
    flex: 3,
  },
  typeColumn: {
    flex: 1.2,
  },
  limitColumn: {
    flex: 1,
    alignItems: 'center',
  },
  currentColumn: {
    flex: 1,
    alignItems: 'center',
  },
  actionColumn: {
    flex: 1.2,
    alignItems: 'center',
  },
  employerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  employerEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  employerCompany: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  typeBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  companyBadge: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  consultancyBadge: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A90E2',
  },
  consultancyBadgeText: {
    color: '#9B59B6',
  },
  limitNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  currentNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 5,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  employerInfo: {
    marginBottom: 20,
  },
  employerInfoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  employerInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  employerInfoEmail: {
    fontSize: 14,
    color: '#666',
  },
  currentInfoBox: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
  },
  currentInfoItem: {
    flex: 1,
  },
  currentInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  currentInfoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminTeamLimitsScreen;

