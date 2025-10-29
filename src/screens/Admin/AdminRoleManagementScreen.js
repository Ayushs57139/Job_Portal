import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';

const AdminRoleManagementScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  const roles = [
    { id: 1, name: 'Super Admin', permissions: ['all'], users: 1 },
    { id: 2, name: 'Admin', permissions: ['manage_users', 'manage_jobs', 'manage_applications'], users: 3 },
    { id: 3, name: 'Moderator', permissions: ['view_users', 'manage_jobs'], users: 5 },
  ];

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

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
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add Role</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {roles.map((role) => (
            <View key={role.id} style={styles.roleCard}>
              <View style={styles.roleHeader}>
                <View>
                  <Text style={styles.roleName}>{role.name}</Text>
                  <Text style={styles.roleUsers}>{role.users} users</Text>
                </View>
                <View style={styles.roleActions}>
                  <TouchableOpacity style={styles.editButton}>
                    <Ionicons name="create-outline" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#E74C3C" />
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
            </View>
          ))}
        </ScrollView>
      </View>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default AdminRoleManagementScreen;

