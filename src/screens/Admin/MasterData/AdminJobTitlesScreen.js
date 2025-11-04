import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';

const AdminJobTitlesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [jobTitles, setJobTitles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: null, name: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchJobTitles();
  }, []);

    const fetchJobTitles = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const fullUrl = `${API_URL}/admin/master-data/job-titles`;
      console.log('[AdminJobTitlesScreen] Fetching from:', fullUrl);
      
      const response = await fetch(fullUrl, { 
        headers,
        method: 'GET',
        credentials: 'include'
      });
      
      console.log('[AdminJobTitlesScreen] Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AdminJobTitlesScreen] Error response:', errorText);
        throw new Error(`API returned status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[AdminJobTitlesScreen] Response data:', data);
      const fetchedItems = data.success && data.data ? data.data : (data.data || data.jobTitles || []);
      
      // Normalize id fields: ensure both _id and id are available
      const normalizedItems = fetchedItems.map(item => ({
        ...item,
        _id: item._id || item.id,
        id: item.id || item._id
      }));
      
      setJobTitles(normalizedItems);
    } catch (error) {
      console.error('Error fetching job titles:', error);
      Alert.alert('Error', `Failed to fetch job titles: ${error.message || error}`);
      setJobTitles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentItem.name.trim()) {
      Alert.alert('Error', 'Please enter a job title');
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

      let response;
      if (editMode) {
        response = await fetch(`${API_URL}/admin/master-data/job-titles/${currentItem.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ name: currentItem.name })
        });
        Alert.alert('Success', 'Job title updated successfully');
      } else {
        response = await fetch(`${API_URL}/admin/master-data/job-titles`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: currentItem.name })
        });
        Alert.alert('Success', 'Job title created successfully');
      }
      setModalVisible(false);
      setCurrentItem({ id: null, name: '' });
      fetchJobTitles();
    } catch (error) {
      console.error('Error saving job title:', error);
      Alert.alert('Error', 'Failed to save job title');
    }
  };

  const handleEdit = (item) => {
    const itemId = item._id || item.id;
    setCurrentItem({ id: itemId, name: item.name });
    setEditMode(true);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this job title?',
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

              await fetch(`${API_URL}/admin/master-data/job-titles/${id}`, {
                method: 'DELETE',
                headers
              });
              Alert.alert('Success', 'Job title deleted successfully');
              fetchJobTitles();
            } catch (error) {
              console.error('Error deleting job title:', error);
              Alert.alert('Error', 'Failed to delete job title');
            }
          }
        }
      ]
    );
  };

  const filteredJobTitles = jobTitles.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <AdminLayout
      title="Job Titles"
      activeScreen="AdminJobTitles"
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.pageTitle}>Job Titles</Text>
            <Text style={styles.pageSubtitle}>Manage job title master data</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setCurrentItem({ id: null, name: '' });
              setEditMode(false);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search job titles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.statsBar}>
          <Text style={styles.statsText}>Total Job Titles: {filteredJobTitles.length}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.listWrapper}>
              {filteredJobTitles.length > 0 ? (
                                filteredJobTitles.map((item, index) => {
                  const itemId = item._id || item.id;
                  return (
                    <View key={itemId || index} style={styles.listItem}>        
                      <Text style={styles.itemName}>{item.name}</Text>
                      <View style={styles.itemActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEdit(item)}
                        >
                          <Ionicons name="create-outline" size={18} color="#4A90E2" />                                                                            
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDelete(itemId)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#E74C3C" />                                                                             
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="folder-open-outline" size={64} color="#CCC" />
                  <Text style={styles.emptyStateText}>No job titles found</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Job Title' : 'Add New Job Title'}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter job title name"
                value={currentItem.name}
                onChangeText={(text) => setCurrentItem({ ...currentItem, name: text })}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setCurrentItem({ id: null, name: '' });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    elevation: 1,
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
  listContainer: {
    flex: 1,
  },
  listWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  itemActions: {
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
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F6FA',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminJobTitlesScreen;

