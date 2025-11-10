import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal, Platform, Dimensions } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL } from '../../config/api';

const { width } = Dimensions.get('window');
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

const AdminUsersScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [user, setUser] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [importExportLoading, setImportExportLoading] = useState(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'JOBSEEKER'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterRole, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/users`, { headers });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterRole !== 'ALL') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: !currentStatus })
      });
      Alert.alert('Success', 'User status updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers
              });
              Alert.alert('Success', 'User deleted successfully');
              fetchUsers();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const verifyUser = async (userId) => {
    Alert.alert(
      'Verify User',
      'Are you sure you want to verify this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              const response = await fetch(`${API_URL}/admin/users/${userId}/verify`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ isVerified: true })
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Failed to verify user');
              }

              Alert.alert('Success', 'User verified successfully');
              fetchUsers();
            } catch (error) {
              console.error('Error verifying user:', error);
              Alert.alert('Error', error.message || 'Failed to verify user');
            }
          }
        }
      ]
    );
  };

  const viewUser = (user) => {
    setSelectedUser(user);
    setViewModalVisible(true);
  };

  const handleAddUser = async () => {
    try {
      // Validate required fields
      if (!newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.password || !newUserData.role) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUserData.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      // Validate password length
      if (newUserData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/users/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newUserData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      Alert.alert('Success', 'User created successfully');
      setAddUserModalVisible(false);
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'JOBSEEKER'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', error.message || 'Failed to create user');
    }
  };

  const handleBulkExport = async () => {
    try {
      setImportExportLoading(true);
      
      // Create CSV content
      const csvHeader = 'Name,Email,Role,Status,Verified,Last Active,Last Modified,Joined Date\n';
      const csvRows = users.map(user => {
        const name = user.name || 'N/A';
        const email = user.email || '';
        const role = user.role || 'N/A';
        const status = user.isActive ? 'ACTIVE' : 'INACTIVE';
        const verified = user.isVerified ? 'Yes' : 'No';
        const lastActive = user.lastActive ? formatDate(user.lastActive) : 'N/A';
        const lastModified = user.lastModified ? formatDate(user.lastModified) : 'N/A';
        const joined = formatDate(user.createdAt);
        return `"${name}","${email}","${role}","${status}","${verified}","${lastActive}","${lastModified}","${joined}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      if (Platform.OS === 'web') {
        // For web, create download link
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `users_export_${Date.now()}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        }
        Alert.alert('Success', 'Users exported successfully');
      } else {
        // For mobile, save and share file
        const fileName = `users_export_${Date.now()}.csv`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(filePath, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath);
          Alert.alert('Success', 'Users exported successfully');
        } else {
          Alert.alert('Info', `File saved to: ${filePath}`);
        }
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      Alert.alert('Error', 'Failed to export users');
    } finally {
      setImportExportLoading(false);
    }
  };

  const handleBulkImport = async () => {
    try {
      setImportExportLoading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setImportExportLoading(false);
        return;
      }

      const fileUri = result.assets[0].uri;

      // Read CSV file
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Parse CSV
      const lines = fileContent.split('\n');
      const csvHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const usersToImport = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length >= 3) {
            usersToImport.push({
              name: values[0],
              email: values[1],
              role: values[2],
              password: values[3] || 'DefaultPassword123!', // Default password if not provided
            });
          }
        }
      }

      if (usersToImport.length === 0) {
        Alert.alert('Error', 'No valid users found in CSV file');
        setImportExportLoading(false);
        return;
      }

      // Send to backend
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/users/bulk-import`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ users: usersToImport })
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', `Successfully imported ${data.imported || usersToImport.length} users`);
        fetchUsers();
      } else {
        Alert.alert('Error', data.message || 'Failed to import users');
      }
    } catch (error) {
      console.error('Error importing users:', error);
      Alert.alert('Error', 'Failed to import users. Please check file format.');
    } finally {
      setImportExportLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleCSV = `Name,Email,Role,Password
John Doe,john@example.com,JOBSEEKER,Password123!
Jane Smith,jane@example.com,EMPLOYER,Password123!
Mike Johnson,mike@example.com,JOBSEEKER,Password123!`;
    
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blob = new Blob([sampleCSV], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample_users_import.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      }
      Alert.alert('Success', 'Sample CSV downloaded');
    } else {
      Alert.alert(
        'Sample CSV Format',
        'CSV should have columns: Name, Email, Role, Password\n\nRoles: JOBSEEKER, EMPLOYER\n\nExample:\nJohn Doe,john@example.com,JOBSEEKER,Pass123!',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <AdminLayout
        title="Users"
        activeScreen="AdminUsers"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Users"
      activeScreen="AdminUsers"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.pageTitle}>User Management</Text>
            <Text style={styles.pageSubtitle}>Manage all registered users</Text>
          </View>
          <View style={styles.bulkActionsContainer}>
            <TouchableOpacity
              style={styles.addUserButton}
              onPress={() => setAddUserModalVisible(true)}
            >
              <Ionicons name="person-add-outline" size={18} color="#FFF" />
              <Text style={styles.addUserButtonText}>Add User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sampleButton}
              onPress={downloadSampleCSV}
              disabled={importExportLoading}
            >
              <Ionicons name="document-text-outline" size={18} color="#9B59B6" />
              <Text style={styles.sampleButtonText}>Sample CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.importButton}
              onPress={handleBulkImport}
              disabled={importExportLoading}
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
              <Text style={styles.importButtonText}>
                {importExportLoading ? 'Processing...' : 'Import CSV'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleBulkExport}
              disabled={importExportLoading}
            >
              <Ionicons name="cloud-download-outline" size={18} color="#FFF" />
              <Text style={styles.exportButtonText}>
                {importExportLoading ? 'Processing...' : 'Export CSV'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filterRole === 'ALL' && styles.activeFilter]}
              onPress={() => setFilterRole('ALL')}
            >
              <Text style={[styles.filterButtonText, filterRole === 'ALL' && styles.activeFilterText]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterRole === 'JOBSEEKER' && styles.activeFilter]}
              onPress={() => setFilterRole('JOBSEEKER')}
            >
              <Text style={[styles.filterButtonText, filterRole === 'JOBSEEKER' && styles.activeFilterText]}>
                Job Seekers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterRole === 'EMPLOYER' && styles.activeFilter]}
              onPress={() => setFilterRole('EMPLOYER')}
            >
              <Text style={[styles.filterButtonText, filterRole === 'EMPLOYER' && styles.activeFilterText]}>
                Employers
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsBar}>
          <Text style={styles.statsText}>Total Users: {filteredUsers.length}</Text>
        </View>

        <ScrollView style={styles.tableContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.table}>
            {!isMobile && (
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.nameColumn]}>Name</Text>
                <Text style={[styles.tableHeaderText, styles.emailColumn]}>Email</Text>
                <Text style={[styles.tableHeaderText, styles.roleColumn]}>Role</Text>
                <Text style={[styles.tableHeaderText, styles.verifiedColumn]}>Verified</Text>
                <Text style={[styles.tableHeaderText, styles.statusColumn]}>Status</Text>
                <Text style={[styles.tableHeaderText, styles.lastActiveColumn]}>Last Active</Text>
                <Text style={[styles.tableHeaderText, styles.joinedColumn]}>Joined</Text>
                <Text style={[styles.tableHeaderText, styles.actionsColumn]}>Actions</Text>
              </View>
            )}

            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <View key={user._id || index} style={styles.tableRow}>
                  {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4 }]}>Name:</Text>}
                  <Text style={[styles.tableCellText, styles.nameColumn, styles.nameText]}>
                    {user.name || 'N/A'}
                  </Text>
                  {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Email:</Text>}
                  <Text style={[styles.tableCellText, styles.emailColumn]}>
                    {user.email || 'N/A'}
                  </Text>
                  {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Role:</Text>}
                  <View style={styles.roleColumn}>
                    <View style={[
                      styles.roleBadge,
                      user.role === 'JOBSEEKER' && styles.jobseekerBadge,
                      user.role === 'EMPLOYER' && styles.employerBadge,
                    ]}>
                      <Text style={styles.roleBadgeText}>{user.role || 'N/A'}</Text>
                    </View>
                  </View>
                  {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Verified:</Text>}
                  <View style={styles.verifiedColumn}>
                    <View style={[
                      styles.verifiedBadge,
                      user.isVerified ? styles.verifiedYes : styles.verifiedNo,
                    ]}>
                      <Ionicons 
                        name={user.isVerified ? 'checkmark-circle' : 'close-circle'} 
                        size={isMobile ? 14 : 16} 
                        color={user.isVerified ? '#27AE60' : '#E74C3C'} 
                      />
                      <Text style={[
                        styles.verifiedText,
                        user.isVerified ? styles.verifiedYesText : styles.verifiedNoText
                      ]}>
                        {user.isVerified ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  </View>
                  {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Status:</Text>}
                  <View style={styles.statusColumn}>
                    <TouchableOpacity
                      style={[
                        styles.statusBadge,
                        user.isActive ? styles.activeBadge : styles.inactiveBadge,
                      ]}
                      onPress={() => toggleUserStatus(user._id, user.isActive)}
                    >
                      <Text style={styles.statusBadgeText}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Last Active:</Text>}
                  <Text style={[styles.tableCellText, styles.lastActiveColumn]}>
                    {user.lastActive ? formatDate(user.lastActive) : 'Never'}
                  </Text>
                  {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Joined:</Text>}
                  <Text style={[styles.tableCellText, styles.joinedColumn]}>
                    {formatDate(user.createdAt)}
                  </Text>
                  {isMobile && <Text style={[styles.tableCellText, { fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 4 }]}>Actions:</Text>}
                  <View style={styles.actionsColumn}>
                    {!user.isVerified && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.verifyButton]}
                        onPress={() => verifyUser(user._id)}
                      >
                        <Ionicons name="shield-checkmark-outline" size={18} color="#27AE60" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => viewUser(user)}
                    >
                      <Ionicons name="eye-outline" size={18} color="#4A90E2" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => deleteUser(user._id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#CCC" />
                <Text style={styles.emptyStateText}>No users found</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* View User Modal */}
        <Modal
          visible={viewModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setViewModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>User Details</Text>
                <TouchableOpacity
                  onPress={() => setViewModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {selectedUser && (
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{selectedUser.name || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{selectedUser.email || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{selectedUser.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Role:</Text>
                    <Text style={styles.detailValue}>{selectedUser.role || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Verified:</Text>
                    <View style={[
                      styles.verifiedBadge,
                      selectedUser.isVerified ? styles.verifiedYes : styles.verifiedNo,
                    ]}>
                      <Ionicons 
                        name={selectedUser.isVerified ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={selectedUser.isVerified ? '#27AE60' : '#E74C3C'} 
                      />
                      <Text style={[
                        styles.verifiedText,
                        selectedUser.isVerified ? styles.verifiedYesText : styles.verifiedNoText
                      ]}>
                        {selectedUser.isVerified ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[
                      styles.statusBadge,
                      selectedUser.isActive ? styles.activeBadge : styles.inactiveBadge,
                    ]}>
                      <Text style={styles.statusBadgeText}>
                        {selectedUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Active:</Text>
                    <Text style={styles.detailValue}>
                      {selectedUser.lastActive ? formatDate(selectedUser.lastActive) : 'Never'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Modified:</Text>
                    <Text style={styles.detailValue}>
                      {selectedUser.lastModified ? formatDate(selectedUser.lastModified) : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Joined:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedUser.createdAt)}</Text>
                  </View>
                  
                  {!selectedUser.isVerified && (
                    <TouchableOpacity
                      style={styles.verifyButtonLarge}
                      onPress={() => {
                        setViewModalVisible(false);
                        verifyUser(selectedUser._id);
                      }}
                    >
                      <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                      <Text style={styles.verifyButtonText}>Verify User</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Add User Modal */}
        <Modal
          visible={addUserModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAddUserModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New User</Text>
                <TouchableOpacity
                  onPress={() => setAddUserModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>First Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter first name"
                    value={newUserData.firstName}
                    onChangeText={(text) => setNewUserData({...newUserData, firstName: text})}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Last Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter last name"
                    value={newUserData.lastName}
                    onChangeText={(text) => setNewUserData({...newUserData, lastName: text})}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Email *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter email address"
                    value={newUserData.email}
                    onChangeText={(text) => setNewUserData({...newUserData, email: text})}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Phone</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter phone number"
                    value={newUserData.phone}
                    onChangeText={(text) => setNewUserData({...newUserData, phone: text})}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Password *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter password (min 6 characters)"
                    value={newUserData.password}
                    onChangeText={(text) => setNewUserData({...newUserData, password: text})}
                    secureTextEntry
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Role *</Text>
                  <View style={styles.roleSelector}>
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        newUserData.role === 'JOBSEEKER' && styles.roleOptionActive
                      ]}
                      onPress={() => setNewUserData({...newUserData, role: 'JOBSEEKER'})}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        newUserData.role === 'JOBSEEKER' && styles.roleOptionTextActive
                      ]}>
                        Job Seeker
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        newUserData.role === 'EMPLOYER' && styles.roleOptionActive
                      ]}
                      onPress={() => setNewUserData({...newUserData, role: 'EMPLOYER'})}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        newUserData.role === 'EMPLOYER' && styles.roleOptionTextActive
                      ]}>
                        Employer
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddUser}
                >
                  <Ionicons name="person-add" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>Create User</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  bulkActionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  addUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E67E22',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 6,
  },
  addUserButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F4FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 6,
  },
  sampleButtonText: {
    color: '#9B59B6',
    fontSize: 14,
    fontWeight: '600',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 6,
  },
  importButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 6,
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 12 : isTablet ? 14 : 15,
    marginBottom: isMobile ? 12 : 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: isMobile ? 10 : 12,
    marginBottom: isMobile ? 12 : 15,
  },
  searchIcon: {
    marginRight: isMobile ? 6 : 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: isMobile ? 10 : 12,
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: isMobile ? 8 : 10,
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  },
  filterButton: {
    flex: isMobile ? 0 : 1,
    paddingVertical: isMobile ? 8 : 10,
    paddingHorizontal: isMobile ? 12 : 15,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    minWidth: isMobile ? '48%' : 'auto',
    marginBottom: isMobile ? 8 : 0,
  },
  activeFilter: {
    backgroundColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: '#FFF',
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
  tableContainer: {
    flex: 1,
  },
  table: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: isMobile ? 'column' : 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    paddingBottom: isMobile ? 8 : 12,
    marginBottom: isMobile ? 8 : 12,
  },
  tableHeaderText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '600',
    color: '#666',
  },
  tableRow: {
    flexDirection: isMobile ? 'column' : 'row',
    paddingVertical: isMobile ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? 12 : 0,
    backgroundColor: isMobile ? '#F9F9F9' : 'transparent',
    borderRadius: isMobile ? 8 : 0,
    padding: isMobile ? 12 : 0,
  },
  tableCellText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#333',
    marginBottom: isMobile ? 8 : 0,
  },
  nameColumn: {
    flex: isMobile ? 0 : 1.8,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  emailColumn: {
    flex: isMobile ? 0 : 2.5,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  roleColumn: {
    flex: isMobile ? 0 : 1.2,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  verifiedColumn: {
    flex: isMobile ? 0 : 1,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  statusColumn: {
    flex: isMobile ? 0 : 1.2,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  lastActiveColumn: {
    flex: isMobile ? 0 : 1.3,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  joinedColumn: {
    flex: isMobile ? 0 : 1.3,
    width: isMobile ? '100%' : 'auto',
    marginBottom: isMobile ? 4 : 0,
  },
  actionsColumn: {
    flex: isMobile ? 0 : 2,
    flexDirection: 'row',
    gap: 6,
    width: isMobile ? '100%' : 'auto',
    marginTop: isMobile ? 8 : 0,
  },
  nameText: {
    fontWeight: '500',
    color: '#C0392B',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  jobseekerBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  employerBadge: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3498DB',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E74C3C',
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F5F6FA',
  },
  deleteButton: {
    marginLeft: 4,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  verifiedYes: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  verifiedNo: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  verifiedYesText: {
    color: '#27AE60',
  },
  verifiedNoText: {
    color: '#E74C3C',
  },
  verifyButton: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  verifyButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleOptionTextActive: {
    color: '#FFF',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E67E22',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminUsersScreen;

