import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminRoleManagementScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
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
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={dynamicStyles.loadingText}>Loading roles...</Text>
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
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.headerSection}>
          <View>
            <Text style={dynamicStyles.pageTitle}>Role Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage user roles and permissions</Text>
          </View>
          <TouchableOpacity 
            style={dynamicStyles.addButton}
            onPress={() => Alert.alert('Info', 'Roles are system-defined. You can view and edit permissions for existing roles.')}
          >
            <Ionicons name="information-circle-outline" size={20} color="#FFF" />
            <Text style={dynamicStyles.addButtonText}>Role Info</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {roles.map((role) => (
            <View key={role.id} style={dynamicStyles.roleCard}>
              <View style={dynamicStyles.roleHeader}>
                <View style={dynamicStyles.roleInfo}>
                  <Text style={dynamicStyles.roleName}>{role.name}</Text>
                  <Text style={dynamicStyles.roleUsers}>{role.users} users</Text>
                </View>
                <View style={dynamicStyles.roleActions}>
                  <TouchableOpacity 
                    style={dynamicStyles.viewButton}
                    onPress={() => handleViewRole(role)}
                  >
                    <Ionicons name="eye-outline" size={20} color="#27AE60" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={dynamicStyles.editButton}
                    onPress={() => handleEditRole(role)}
                  >
                    <Ionicons name="create-outline" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[dynamicStyles.deleteButton, !role.canDelete && dynamicStyles.disabledButton]}
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
              <View style={dynamicStyles.permissionsContainer}>
                <Text style={dynamicStyles.permissionsLabel}>Permissions:</Text>
                <View style={dynamicStyles.permissionsList}>
                  {role.permissions.map((permission, index) => (
                    <View key={index} style={dynamicStyles.permissionBadge}>
                      <Text style={dynamicStyles.permissionText}>{permission}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {role.description && (
                <View style={dynamicStyles.descriptionContainer}>
                  <Text style={dynamicStyles.descriptionText}>{role.description}</Text>
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
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Role Details</Text>
                <TouchableOpacity
                  onPress={() => setViewModalVisible(false)}
                  style={dynamicStyles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {selectedRole && (
                <ScrollView style={dynamicStyles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Role Name:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedRole.name}</Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Total Users:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedRole.users}</Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Role ID:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedRole.id}</Text>
                  </View>
                  {selectedRole.description && (
                    <View style={dynamicStyles.detailRow}>
                      <Text style={dynamicStyles.detailLabel}>Description:</Text>
                      <Text style={dynamicStyles.detailValue}>{selectedRole.description}</Text>
                    </View>
                  )}
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Can Delete:</Text>
                    <Text style={[dynamicStyles.detailValue, selectedRole.canDelete ? dynamicStyles.textSuccess : dynamicStyles.textDanger]}>
                      {selectedRole.canDelete ? 'Yes' : 'No (System Role)'}
                    </Text>
                  </View>
                  
                  <View style={dynamicStyles.permissionsSection}>
                    <Text style={dynamicStyles.permissionsSectionLabel}>Permissions:</Text>
                    <View style={dynamicStyles.permissionsList}>
                      {selectedRole.permissions.map((permission, index) => (
                        <View key={index} style={dynamicStyles.permissionBadgeLarge}>
                          <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                          <Text style={dynamicStyles.permissionTextLarge}>{permission}</Text>
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
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Edit Role</Text>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={dynamicStyles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {selectedRole && (
                <ScrollView style={dynamicStyles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={dynamicStyles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#4A90E2" />
                    <Text style={dynamicStyles.infoText}>
                      {selectedRole.id === 'superadmin' 
                        ? 'Super Admin role cannot be modified.' 
                        : 'You are viewing the role permissions. In this version, role permissions are system-defined.'}
                    </Text>
                  </View>

                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Role Name:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedRole.name}</Text>
                  </View>
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Total Users:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedRole.users}</Text>
                  </View>
                  
                  <View style={dynamicStyles.permissionsSection}>
                    <Text style={dynamicStyles.permissionsSectionLabel}>Current Permissions:</Text>
                    <View style={dynamicStyles.permissionsList}>
                      {editedPermissions.map((permission, index) => (
                        <View key={index} style={dynamicStyles.permissionBadgeLarge}>
                          <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                          <Text style={dynamicStyles.permissionTextLarge}>{permission}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {selectedRole.id !== 'superadmin' && (
                    <TouchableOpacity
                      style={dynamicStyles.updateButton}
                      onPress={handleUpdateRole}
                    >
                      <Ionicons name="save-outline" size={20} color="#FFF" />
                      <Text style={dynamicStyles.updateButtonText}>Save Changes</Text>
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

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    padding: isMobile ? 12 : isTablet ? 16 : 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: isMobile ? 8 : isTablet ? 9 : 10,
    paddingHorizontal: isMobile ? 16 : isTablet ? 18 : 20,
    borderRadius: 8,
    alignSelf: isMobile ? 'stretch' : 'auto',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#229954',
        transform: 'translateY(-1px)',
      },
    }),
  },
  addButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  roleCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 14 : isTablet ? 17 : 20,
    marginBottom: isMobile ? 12 : isTablet ? 14 : 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  roleHeader: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? 12 : isTablet ? 14 : 15,
    gap: isMobile ? 12 : 0,
  },
  roleInfo: {
    flex: 1,
    width: isMobile ? '100%' : 'auto',
  },
  roleName: {
    fontSize: isMobile ? 18 : isTablet ? 19 : 20,
    fontWeight: 'bold',
    color: '#333',
  },
  roleUsers: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#666',
    marginTop: 4,
  },
  roleActions: {
    flexDirection: 'row',
    gap: isMobile ? 8 : 10,
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  },
  viewButton: {
    padding: isMobile ? 6 : 8,
    backgroundColor: '#F5F6FA',
    borderRadius: 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E8ECF1',
      },
    }),
  },
  editButton: {
    padding: isMobile ? 6 : 8,
    backgroundColor: '#F5F6FA',
    borderRadius: 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E8ECF1',
      },
    }),
  },
  deleteButton: {
    padding: isMobile ? 6 : 8,
    backgroundColor: '#F5F6FA',
    borderRadius: 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E8ECF1',
      },
    }),
  },
  disabledButton: {
    opacity: 0.5,
  },
  permissionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: isMobile ? 12 : isTablet ? 14 : 15,
    marginTop: isMobile ? 12 : isTablet ? 14 : 15,
  },
  permissionsLabel: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: isMobile ? 8 : 10,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isMobile ? 6 : 8,
  },
  permissionBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: isMobile ? 8 : isTablet ? 10 : 12,
    paddingVertical: isMobile ? 5 : 6,
    borderRadius: 6,
  },
  permissionText: {
    fontSize: isMobile ? 11 : isTablet ? 11.5 : 12,
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
    padding: isMobile ? 16 : 20,
    ...(Platform.OS === 'web' && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    }),
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: isMobile ? '100%' : '90%',
    maxWidth: 600,
    maxHeight: isMobile ? '90%' : '80%',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? 16 : isTablet ? 18 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: isMobile ? 18 : isTablet ? 19 : 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  modalBody: {
    padding: isMobile ? 16 : isTablet ? 18 : 20,
  },
  detailRow: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    paddingVertical: isMobile ? 10 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: isMobile ? 4 : 0,
  },
  detailLabel: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#333',
    flex: isMobile ? 1 : 2,
    textAlign: isMobile ? 'left' : 'right',
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
    marginTop: isMobile ? 16 : isTablet ? 18 : 20,
    paddingTop: isMobile ? 16 : isTablet ? 18 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  permissionsSectionLabel: {
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: isMobile ? 12 : isTablet ? 14 : 15,
  },
  permissionBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 6 : 8,
    borderRadius: 6,
    gap: 6,
  },
  permissionTextLarge: {
    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
    color: '#4A90E2',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FD',
    padding: isMobile ? 10 : 12,
    borderRadius: 8,
    marginBottom: isMobile ? 12 : isTablet ? 14 : 15,
    gap: isMobile ? 8 : 10,
  },
  infoText: {
    flex: 1,
    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
    color: '#4A90E2',
    lineHeight: isMobile ? 16 : 18,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: isMobile ? 10 : isTablet ? 11 : 12,
    paddingHorizontal: isMobile ? 16 : isTablet ? 18 : 20,
    borderRadius: 8,
    marginTop: isMobile ? 16 : isTablet ? 18 : 20,
    gap: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#357ABD',
        transform: 'translateY(-1px)',
      },
    }),
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({});

export default AdminRoleManagementScreen;

