import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminUsersScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
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
    role: 'JOBSEEKER',
    employerType: ''
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
      if (filterRole === 'COMPANY') {
        filtered = filtered.filter(user => 
          user.role === 'EMPLOYER' && user.employerType === 'company'
        );
      } else if (filterRole === 'CONSULTANCY') {
        filtered = filtered.filter(user => 
          user.role === 'EMPLOYER' && user.employerType === 'consultancy'
        );
      } else {
        filtered = filtered.filter(user => user.role === filterRole);
      }
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
                headers
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Failed to verify user');
              }

              // Update the user in the local state immediately - this will trigger useEffect to update filteredUsers
              setUsers(prevUsers => {
                const updated = prevUsers.map(user => {
                  if (user._id === userId || user.id === userId) {
                    return { ...user, isVerified: true, verifiedAt: data.user?.verifiedAt || new Date() };
                  }
                  return user;
                });
                return updated;
              });

              // Also update filteredUsers directly to ensure immediate UI update
              setFilteredUsers(prevFiltered => {
                return prevFiltered.map(user => {
                  if (user._id === userId || user.id === userId) {
                    return { ...user, isVerified: true, verifiedAt: data.user?.verifiedAt || new Date() };
                  }
                  return user;
                });
              });

              Alert.alert('Success', 'User verified successfully');
              
              // Refresh to ensure data is in sync with backend (after a delay to let UI update first)
              setTimeout(() => {
                fetchUsers();
              }, 1000);
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

      // Validate employerType if role is EMPLOYER
      if (newUserData.role === 'EMPLOYER' && !newUserData.employerType) {
        Alert.alert('Error', 'Please select Company or Consultancy for Employer role');
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
        console.error('Create user error response:', data);
        throw new Error(data.message || data.error || 'Failed to create user');
      }

      Alert.alert('Success', 'User created successfully');
      setAddUserModalVisible(false);
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'JOBSEEKER',
        employerType: ''
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.message || 'Failed to create user';
      Alert.alert('Error', errorMessage);
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

  const dynamicStyles = getStyles(isMobile, isTablet);

  if (loading) {
    return (
      <AdminLayout
        title="Users"
        activeScreen="AdminUsers"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={dynamicStyles.loadingText}>Loading users...</Text>
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
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.headerSection}>
          <View>
            <Text style={dynamicStyles.pageTitle}>User Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage all registered users</Text>
          </View>
          <View style={dynamicStyles.bulkActionsContainer}>
            <TouchableOpacity
              style={dynamicStyles.addUserButton}
              onPress={() => setAddUserModalVisible(true)}
            >
              <Ionicons name="person-add-outline" size={18} color="#FFF" />
              <Text style={dynamicStyles.addUserButtonText}>Add User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.sampleButton}
              onPress={downloadSampleCSV}
              disabled={importExportLoading}
            >
              <Ionicons name="document-text-outline" size={18} color="#9B59B6" />
              <Text style={dynamicStyles.sampleButtonText}>Sample CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.importButton}
              onPress={handleBulkImport}
              disabled={importExportLoading}
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
              <Text style={dynamicStyles.importButtonText}>
                {importExportLoading ? 'Processing...' : 'Import CSV'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.exportButton}
              onPress={handleBulkExport}
              disabled={importExportLoading}
            >
              <Ionicons name="cloud-download-outline" size={18} color="#FFF" />
              <Text style={dynamicStyles.exportButtonText}>
                {importExportLoading ? 'Processing...' : 'Export CSV'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={dynamicStyles.filterSection}>
          <View style={dynamicStyles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={dynamicStyles.searchIcon} />
            <TextInput
              style={dynamicStyles.searchInput}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={dynamicStyles.filterButtons}>
            <TouchableOpacity
              style={[dynamicStyles.filterButton, filterRole === 'ALL' && dynamicStyles.activeFilter]}
              onPress={() => setFilterRole('ALL')}
            >
              <Text style={[dynamicStyles.filterButtonText, filterRole === 'ALL' && dynamicStyles.activeFilterText]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.filterButton, filterRole === 'JOBSEEKER' && dynamicStyles.activeFilter]}
              onPress={() => setFilterRole('JOBSEEKER')}
            >
              <Text style={[dynamicStyles.filterButtonText, filterRole === 'JOBSEEKER' && dynamicStyles.activeFilterText]}>
                Job Seekers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.filterButton, filterRole === 'EMPLOYER' && dynamicStyles.activeFilter]}
              onPress={() => setFilterRole('EMPLOYER')}
            >
              <Text style={[dynamicStyles.filterButtonText, filterRole === 'EMPLOYER' && dynamicStyles.activeFilterText]}>
                Employers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.filterButton, filterRole === 'COMPANY' && dynamicStyles.activeFilter]}
              onPress={() => setFilterRole('COMPANY')}
            >
              <Text style={[dynamicStyles.filterButtonText, filterRole === 'COMPANY' && dynamicStyles.activeFilterText]}>
                Company
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.filterButton, filterRole === 'CONSULTANCY' && dynamicStyles.activeFilter]}
              onPress={() => setFilterRole('CONSULTANCY')}
            >
              <Text style={[dynamicStyles.filterButtonText, filterRole === 'CONSULTANCY' && dynamicStyles.activeFilterText]}>
                Consultancy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={dynamicStyles.statsBar}>
          <Text style={dynamicStyles.statsText}>Total Users: {filteredUsers.length}</Text>
        </View>

        <ScrollView style={dynamicStyles.tableContainer} showsVerticalScrollIndicator={false}>
          <View style={dynamicStyles.table}>
            {!isMobile && (
            <View style={dynamicStyles.tableHeader}>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.nameColumn]}>Name</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.emailColumn]}>Email</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.roleColumn]}>Role</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.verifiedColumn]}>Verified</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.statusColumn]}>Status</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.lastActiveColumn]}>Last Active</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.joinedColumn]}>Joined</Text>
              <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.actionsColumn]}>Actions</Text>
            </View>
            )}

            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <View key={user._id || index} style={isMobile ? dynamicStyles.mobileCard : dynamicStyles.tableRow}>
                  <Text style={[dynamicStyles.tableCellText, dynamicStyles.nameColumn, dynamicStyles.nameText]}>
                    {user.name || 'N/A'}
                  </Text>
                  <Text style={[dynamicStyles.tableCellText, dynamicStyles.emailColumn]}>
                    {user.email || 'N/A'}
                  </Text>
                  <View style={dynamicStyles.roleColumn}>
                    <View style={[
                      dynamicStyles.roleBadge,
                      user.role === 'JOBSEEKER' && dynamicStyles.jobseekerBadge,
                      user.role === 'EMPLOYER' && dynamicStyles.employerBadge,
                    ]}>
                      <Text style={dynamicStyles.roleBadgeText}>{user.role || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={dynamicStyles.verifiedColumn}>
                    <View style={[
                      dynamicStyles.verifiedBadge,
                      user.isVerified ? dynamicStyles.verifiedYes : dynamicStyles.verifiedNo,
                    ]}>
                      <Ionicons 
                        name={user.isVerified ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={user.isVerified ? '#27AE60' : '#E74C3C'} 
                      />
                      <Text style={[
                        dynamicStyles.verifiedText,
                        user.isVerified ? dynamicStyles.verifiedYesText : dynamicStyles.verifiedNoText
                      ]}>
                        {user.isVerified ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  </View>
                  <View style={dynamicStyles.statusColumn}>
                    <TouchableOpacity
                      style={[
                        dynamicStyles.statusBadge,
                        user.isActive ? dynamicStyles.activeBadge : dynamicStyles.inactiveBadge,
                      ]}
                      onPress={() => toggleUserStatus(user._id, user.isActive)}
                    >
                      <Text style={dynamicStyles.statusBadgeText}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[dynamicStyles.tableCellText, dynamicStyles.lastActiveColumn]}>
                    {user.lastActive ? formatDate(user.lastActive) : 'Never'}
                  </Text>
                  <Text style={[dynamicStyles.tableCellText, dynamicStyles.joinedColumn]}>
                    {formatDate(user.createdAt)}
                  </Text>
                  <View style={dynamicStyles.actionsColumn}>
                    {!user.isVerified && (
                      <TouchableOpacity
                        style={[dynamicStyles.actionButton, dynamicStyles.verifyButton]}
                        onPress={() => verifyUser(user._id)}
                      >
                        <Ionicons name="shield-checkmark-outline" size={18} color="#27AE60" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={dynamicStyles.actionButton}
                      onPress={() => viewUser(user)}
                    >
                      <Ionicons name="eye-outline" size={18} color="#4A90E2" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[dynamicStyles.actionButton, dynamicStyles.deleteButton]}
                      onPress={() => deleteUser(user._id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={dynamicStyles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#CCC" />
                <Text style={dynamicStyles.emptyStateText}>No users found</Text>
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
          <TouchableOpacity 
            style={dynamicStyles.modalOverlay}
            activeOpacity={1}
            onPress={() => setViewModalVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>User Details</Text>
                <TouchableOpacity
                  onPress={() => setViewModalVisible(false)}
                  style={dynamicStyles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              {selectedUser && (
                <ScrollView style={dynamicStyles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Name:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedUser.name || 'N/A'}</Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Email:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedUser.email || 'N/A'}</Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Phone:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedUser.phone || 'N/A'}</Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Role:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedUser.role || 'N/A'}</Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Verified:</Text>
                    <View style={[
                      dynamicStyles.verifiedBadge,
                      selectedUser.isVerified ? dynamicStyles.verifiedYes : dynamicStyles.verifiedNo,
                    ]}>
                      <Ionicons 
                        name={selectedUser.isVerified ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={selectedUser.isVerified ? '#27AE60' : '#E74C3C'} 
                      />
                      <Text style={[
                        dynamicStyles.verifiedText,
                        selectedUser.isVerified ? dynamicStyles.verifiedYesText : dynamicStyles.verifiedNoText
                      ]}>
                        {selectedUser.isVerified ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Status:</Text>
                    <View style={[
                      dynamicStyles.statusBadge,
                      selectedUser.isActive ? dynamicStyles.activeBadge : dynamicStyles.inactiveBadge,
                    ]}>
                      <Text style={dynamicStyles.statusBadgeText}>
                        {selectedUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Text>
                    </View>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Last Active:</Text>
                    <Text style={dynamicStyles.detailValue}>
                      {selectedUser.lastActive ? formatDate(selectedUser.lastActive) : 'Never'}
                    </Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Last Modified:</Text>
                    <Text style={dynamicStyles.detailValue}>
                      {selectedUser.lastModified ? formatDate(selectedUser.lastModified) : 'N/A'}
                    </Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Joined:</Text>
                    <Text style={dynamicStyles.detailValue}>{formatDate(selectedUser.createdAt)}</Text>
                  </View>
                  
                  {!selectedUser.isVerified && (
                    <TouchableOpacity
                      style={dynamicStyles.verifyButtonLarge}
                      onPress={() => {
                        setViewModalVisible(false);
                        verifyUser(selectedUser._id);
                      }}
                    >
                      <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                      <Text style={dynamicStyles.verifyButtonText}>Verify User</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              )}
            </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Add User Modal */}
        <Modal
          visible={addUserModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAddUserModalVisible(false)}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalOverlay}
            activeOpacity={1}
            onPress={() => setAddUserModalVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Add New User</Text>
                <TouchableOpacity
                  onPress={() => setAddUserModalVisible(false)}
                  style={dynamicStyles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={dynamicStyles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>First Name *</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="Enter first name"
                    value={newUserData.firstName}
                    onChangeText={(text) => setNewUserData({...newUserData, firstName: text})}
                  />
                </View>

                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Last Name *</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="Enter last name"
                    value={newUserData.lastName}
                    onChangeText={(text) => setNewUserData({...newUserData, lastName: text})}
                  />
                </View>

                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Email *</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="Enter email address"
                    value={newUserData.email}
                    onChangeText={(text) => setNewUserData({...newUserData, email: text})}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Phone</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="Enter phone number"
                    value={newUserData.phone}
                    onChangeText={(text) => setNewUserData({...newUserData, phone: text})}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Password *</Text>
                  <TextInput
                    style={dynamicStyles.formInput}
                    placeholder="Enter password (min 6 characters)"
                    value={newUserData.password}
                    onChangeText={(text) => setNewUserData({...newUserData, password: text})}
                    secureTextEntry
                  />
                </View>

                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Role *</Text>
                  <View style={dynamicStyles.roleSelector}>
                    <TouchableOpacity
                      style={[
                        dynamicStyles.roleOption,
                        newUserData.role === 'JOBSEEKER' && dynamicStyles.roleOptionActive
                      ]}
                      onPress={() => setNewUserData({...newUserData, role: 'JOBSEEKER'})}
                    >
                      <Text style={[
                        dynamicStyles.roleOptionText,
                        newUserData.role === 'JOBSEEKER' && dynamicStyles.roleOptionTextActive
                      ]}>
                        Job Seeker
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        dynamicStyles.roleOption,
                        newUserData.role === 'EMPLOYER' && dynamicStyles.roleOptionActive
                      ]}
                      onPress={() => setNewUserData({...newUserData, role: 'EMPLOYER', employerType: newUserData.employerType || ''})}
                    >
                      <Text style={[
                        dynamicStyles.roleOptionText,
                        newUserData.role === 'EMPLOYER' && dynamicStyles.roleOptionTextActive
                      ]}>
                        Employer
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {newUserData.role === 'EMPLOYER' && (
                  <View style={dynamicStyles.formGroup}>
                    <Text style={dynamicStyles.formLabel}>Employer Type *</Text>
                    <View style={dynamicStyles.roleSelector}>
                      <TouchableOpacity
                        style={[
                          dynamicStyles.roleOption,
                          newUserData.employerType === 'company' && dynamicStyles.roleOptionActive
                        ]}
                        onPress={() => setNewUserData({...newUserData, employerType: 'company'})}
                      >
                        <Text style={[
                          dynamicStyles.roleOptionText,
                          newUserData.employerType === 'company' && dynamicStyles.roleOptionTextActive
                        ]}>
                          Company
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          dynamicStyles.roleOption,
                          newUserData.employerType === 'consultancy' && dynamicStyles.roleOptionActive
                        ]}
                        onPress={() => setNewUserData({...newUserData, employerType: 'consultancy'})}
                      >
                        <Text style={[
                          dynamicStyles.roleOptionText,
                          newUserData.employerType === 'consultancy' && dynamicStyles.roleOptionTextActive
                        ]}>
                          Consultancy
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={dynamicStyles.submitButton}
                  onPress={handleAddUser}
                >
                  <Ionicons name="person-add" size={20} color="#FFF" />
                  <Text style={dynamicStyles.submitButtonText}>Create User</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
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
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
    gap: isMobile ? 12 : 0,
  },
  pageTitle: {
    fontSize: isMobile ? 22 : isTablet ? 26 : 28,
    fontWeight: 'bold',
    color: '#333',
  },
  pageSubtitle: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#666',
    marginTop: 4,
  },
  bulkActionsContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 8 : 10,
    flexWrap: isMobile ? 'nowrap' : 'wrap',
    ...(Platform.OS === 'web' && {
      flexWrap: isMobile ? 'wrap' : 'nowrap',
    }),
  },
  addUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E67E22',
    paddingVertical: isMobile ? 8 : isTablet ? 9 : 10,
    paddingHorizontal: isMobile ? 12 : isTablet ? 14 : 15,
    borderRadius: 8,
    gap: 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#D35400',
        transform: 'translateY(-1px)',
      },
    }),
  },
  addUserButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
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
    marginBottom: isMobile ? 12 : isTablet ? 14 : 15,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
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
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '600',
    color: '#333',
  },
  tableContainer: {
    flex: 1,
  },
  mobileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isMobile ? 14 : 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  mobileCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mobileCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mobileCardValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  table: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      overflowX: isMobile ? 'hidden' : 'auto',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    paddingBottom: isMobile ? 10 : isTablet ? 11 : 12,
    marginBottom: isMobile ? 10 : isTablet ? 11 : 12,
    display: isMobile ? 'none' : 'flex',
    ...(Platform.OS === 'web' && {
      display: isMobile ? 'none' : 'flex',
      minWidth: isTablet ? 700 : 900,
    }),
  },
  tableHeaderText: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '600',
    color: '#666',
  },
  tableRow: {
    flexDirection: isMobile ? 'column' : 'row',
    paddingVertical: isMobile ? 16 : isTablet ? 14 : 12,
    paddingHorizontal: isMobile ? 12 : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? 12 : 0,
    borderRadius: isMobile ? 12 : 0,
    backgroundColor: isMobile ? '#FAFAFA' : 'transparent',
    ...(Platform.OS === 'web' && {
      minWidth: isTablet ? 700 : 900,
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: isMobile ? '#F5F5F5' : 'rgba(0, 0, 0, 0.02)',
      },
    }),
  },
  tableCellText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#333',
    marginBottom: isMobile ? 8 : 0,
    ...(Platform.OS === 'web' && {
      overflow: isMobile ? 'visible' : 'hidden',
      textOverflow: isMobile ? 'clip' : 'ellipsis',
      whiteSpace: isMobile ? 'normal' : 'nowrap',
    }),
  },
  nameColumn: {
    flex: 1.8,
  },
  emailColumn: {
    flex: 2.5,
  },
  roleColumn: {
    flex: 1.2,
  },
  verifiedColumn: {
    flex: 1,
  },
  statusColumn: {
    flex: 1.2,
  },
  lastActiveColumn: {
    flex: 1.3,
  },
  joinedColumn: {
    flex: 1.3,
  },
  actionsColumn: {
    flex: 2,
    flexDirection: 'row',
    gap: 6,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 0,
    width: isMobile ? '95%' : isTablet ? '85%' : '70%',
    maxWidth: isMobile ? '100%' : 700,
    maxHeight: isMobile ? '90%' : '85%',
    ...(Platform.OS === 'web' && {
      maxWidth: isMobile ? '95%' : isTablet ? '600px' : '700px',
    }),
    width: '100%',
    maxWidth: 680,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 25,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 44,
    paddingTop: 44,
    paddingBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    }),
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalBody: {
    padding: 44,
    maxHeight: '60vh',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      maxHeight: 'calc(85vh - 200px)',
    }),
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
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: isMobile ? 6 : isTablet ? 7 : 8,
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
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({});

export default AdminUsersScreen;

