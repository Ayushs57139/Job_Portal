import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminRoleManagementScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editedPermissions, setEditedPermissions] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/roles`, { headers });
      const data = await response.json();
      
      if (response.ok) {
        setRoles(data.roles || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      Alert.alert('Error', 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRole = (role) => {
    setSelectedRole(role);
    setViewModalVisible(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setEditedPermissions([...role.permissions]);
    setEditModalVisible(true);
  };

  const handleUpdateRole = async () => {
    try {
      if (!selectedRole) return;

      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ permissions: editedPermissions })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update role');
      }

      Alert.alert('Success', 'Role updated successfully');
      setEditModalVisible(false);
      fetchRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      Alert.alert('Error', error.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = (role) => {
    if (!role.canDelete) {
      Alert.alert('Cannot Delete', 'This role cannot be deleted as it is a system role.');
      return;
    }

    Alert.alert(
      'Delete Role',
      `Are you sure you want to delete the "${role.name}" role? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => performDeleteRole(role)
        }
      ]
    );
  };

  const performDeleteRole = async (role) => {
    try {
      // In a real implementation, you would call the backend API
      Alert.alert('Info', 'Role deletion is not implemented in this version. Roles are system-defined.');
    } catch (error) {
      console.error('Error deleting role:', error);
      Alert.alert('Error', 'Failed to delete role');
    }
  };

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  if (loading) {
    return (
      <AdminLayout
        title="Role Management"
        activeScreen="AdminRoleManagement"
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading roles...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Role Management"
      activeScreen="AdminRoleManagement"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.pageTitle}>Role Management</Text>
            <Text style={styles.pageSubtitle}>Manage user roles and permissions</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => Alert.alert('Info', 'Roles are system-defined. You can view and edit permissions for existing roles.')}
          >
            <Ionicons name="information-circle-outline" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Role Info</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {roles.map((role) => (
            <View key={role.id} style={styles.roleCard}>
              <View style={styles.roleHeader}>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>{role.name}</Text>
                  <Text style={styles.roleUsers}>{role.users} users</Text>
                </View>
                <View style={styles.roleActions}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleViewRole(role)}
                  >
                    <Ionicons name="eye-outline" size={20} color="#27AE60" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditRole(role)}
                  >
                    <Ionicons name="create-outline" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.deleteButton, !role.canDelete && styles.disabledButton]}
                    onPress={() => handleDeleteRole(role)}
                    disabled={!role.canDelete}
                  >
                    <Ionicons 
                      name="trash-outline" 
                      size={20} 
                      color={role.canDelete ? "#E74C3C" : "#CCC"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.permissionsContainer}>
                <Text style={styles.permissionsLabel}>Permissions:</Text>
                <View style={styles.permissionsList}>
                  {role.permissions.map((permission, index) => (
                    <View key={index} style={styles.permissionBadge}>
                      <Text style={styles.permissionText}>{permission}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {role.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>{role.description}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* View Role Modal */}
        <Modal
          visible={viewModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setViewModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Role Details</Text>
                <TouchableOpacity
                  onPress={() => setViewModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {selectedRole && (
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Role Name:</Text>
                    <Text style={styles.detailValue}>{selectedRole.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Users:</Text>
                    <Text style={styles.detailValue}>{selectedRole.users}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Role ID:</Text>
                    <Text style={styles.detailValue}>{selectedRole.id}</Text>
                  </View>
                  {selectedRole.description && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailValue}>{selectedRole.description}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Can Delete:</Text>
                    <Text style={[styles.detailValue, selectedRole.canDelete ? styles.textSuccess : styles.textDanger]}>
                      {selectedRole.canDelete ? 'Yes' : 'No (System Role)'}
                    </Text>
                  </View>
                  
                  <View style={styles.permissionsSection}>
                    <Text style={styles.permissionsSectionLabel}>Permissions:</Text>
                    <View style={styles.permissionsList}>
                      {selectedRole.permissions.map((permission, index) => (
                        <View key={index} style={styles.permissionBadgeLarge}>
                          <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                          <Text style={styles.permissionTextLarge}>{permission}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Edit Role Modal */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Role</Text>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {selectedRole && (
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#4A90E2" />
                    <Text style={styles.infoText}>
                      {selectedRole.id === 'superadmin' 
                        ? 'Super Admin role cannot be modified.' 
                        : 'You are viewing the role permissions. In this version, role permissions are system-defined.'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Role Name:</Text>
                    <Text style={styles.detailValue}>{selectedRole.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Users:</Text>
                    <Text style={styles.detailValue}>{selectedRole.users}</Text>
                  </View>
                  
                  <View style={styles.permissionsSection}>
                    <Text style={styles.permissionsSectionLabel}>Current Permissions:</Text>
                    <View style={styles.permissionsList}>
                      {editedPermissions.map((permission, index) => (
                        <View key={index} style={styles.permissionBadgeLarge}>
                          <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                          <Text style={styles.permissionTextLarge}>{permission}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {selectedRole.id !== 'superadmin' && (
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={handleUpdateRole}
                    >
                      <Ionicons name="save-outline" size={20} color="#FFF" />
                      <Text style={styles.updateButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              )}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  roleCard: {
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
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  roleUsers: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  roleActions: {
    flexDirection: 'row',
    gap: 10,
  },
  viewButton: {
    padding: 8,
    backgroundColor: '#F5F6FA',
    borderRadius: 6,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#F5F6FA',
    borderRadius: 6,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#F5F6FA',
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  permissionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  permissionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  permissionBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  permissionText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
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
  textSuccess: {
    color: '#27AE60',
    fontWeight: '600',
  },
  textDanger: {
    color: '#E74C3C',
    fontWeight: '600',
  },
  permissionsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  permissionsSectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  permissionBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  permissionTextLarge: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4A90E2',
    lineHeight: 18,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminRoleManagementScreen;

