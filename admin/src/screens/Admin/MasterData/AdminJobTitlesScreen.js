import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';
import { useResponsive } from '../../../utils/responsive';

const AdminJobTitlesScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
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

      const response = await fetch(`${API_URL}/admin/master-data/job-titles`, { headers });
      const data = await response.json();
      setJobTitles(data.data || []);
    } catch (error) {
      console.error('Error fetching job titles:', error);
      Alert.alert('Error', 'Failed to fetch job titles');
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
    setCurrentItem({ id: item._id, name: item.name });
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
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.headerSection}>
          <View>
            <Text style={dynamicStyles.pageTitle}>Job Titles</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage job title master data</Text>
          </View>
          <TouchableOpacity
            style={dynamicStyles.addButton}
            onPress={() => {
              setCurrentItem({ id: null, name: '' });
              setEditMode(false);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={isMobile ? 18 : 20} color="#FFF" />
            <Text style={dynamicStyles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.searchContainer}>
          <Ionicons name="search" size={isMobile ? 18 : 20} color="#999" style={dynamicStyles.searchIcon} />
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Search job titles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={dynamicStyles.statsBar}>
          <Text style={dynamicStyles.statsText}>Total Job Titles: {filteredJobTitles.length}</Text>
        </View>

        {loading ? (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <ScrollView style={dynamicStyles.listContainer} showsVerticalScrollIndicator={false}>
            <View style={dynamicStyles.listWrapper}>
              {filteredJobTitles.length > 0 ? (
                filteredJobTitles.map((item, index) => (
                  <View key={item._id || index} style={dynamicStyles.listItem}>
                    <Text style={dynamicStyles.itemName}>{item.name}</Text>
                    <View style={dynamicStyles.itemActions}>
                      <TouchableOpacity
                        style={dynamicStyles.editButton}
                        onPress={() => handleEdit(item)}
                      >
                        <Ionicons name="create-outline" size={isMobile ? 16 : 18} color="#4A90E2" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={dynamicStyles.deleteButton}
                        onPress={() => handleDelete(item._id)}
                      >
                        <Ionicons name="trash-outline" size={isMobile ? 16 : 18} color="#E74C3C" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={dynamicStyles.emptyState}>
                  <Ionicons name="folder-open-outline" size={isMobile ? 48 : isTablet ? 56 : 64} color="#CCC" />
                  <Text style={dynamicStyles.emptyStateText}>No job titles found</Text>
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
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <Text style={dynamicStyles.modalTitle}>
                {editMode ? 'Edit Job Title' : 'Add New Job Title'}
              </Text>
              <TextInput
                style={dynamicStyles.modalInput}
                placeholder="Enter job title name"
                value={currentItem.name}
                onChangeText={(text) => setCurrentItem({ ...currentItem, name: text })}
                {...(Platform.OS === 'web' && { outline: 'none' })}
              />
              <View style={dynamicStyles.modalActions}>
                <TouchableOpacity
                  style={[dynamicStyles.modalButton, dynamicStyles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setCurrentItem({ id: null, name: '' });
                  }}
                >
                  <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.modalButton, dynamicStyles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={dynamicStyles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: isMobile ? 10 : 12,
    marginBottom: isMobile ? 12 : isTablet ? 14 : 15,
    elevation: 1,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
    }),
  },
  searchIcon: {
    marginRight: isMobile ? 6 : 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: isMobile ? 10 : 12,
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#333',
    ...(Platform.OS === 'web' && {
      outline: 'none',
    }),
  },
  statsBar: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: isMobile ? 10 : 12,
    marginBottom: isMobile ? 12 : isTablet ? 14 : 15,
    elevation: 1,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
    }),
  },
  statsText: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    flex: 1,
  },
  listWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 12 : isTablet ? 14 : 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }),
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isMobile ? 12 : isTablet ? 14 : 15,
    paddingHorizontal: isMobile ? 8 : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    ...(Platform.OS === 'web' && {
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
      },
    }),
  },
  itemName: {
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    color: '#333',
    flex: 1,
    ...(Platform.OS === 'web' && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  },
  itemActions: {
    flexDirection: 'row',
    gap: isMobile ? 8 : 10,
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
  emptyState: {
    paddingVertical: isMobile ? 40 : isTablet ? 50 : 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    color: '#999',
    marginTop: 15,
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
    padding: isMobile ? 20 : isTablet ? 22 : 24,
    width: isMobile ? '100%' : '80%',
    maxWidth: 400,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    }),
  },
  modalTitle: {
    fontSize: isMobile ? 18 : isTablet ? 19 : 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: isMobile ? 16 : 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: isMobile ? 10 : 12,
    paddingHorizontal: isMobile ? 12 : 15,
    fontSize: isMobile ? 14 : 15,
    marginBottom: isMobile ? 16 : 20,
    ...(Platform.OS === 'web' && {
      outline: 'none',
      ':focus': {
        borderColor: '#4A90E2',
        borderWidth: 2,
      },
    }),
  },
  modalActions: {
    flexDirection: 'row',
    gap: isMobile ? 8 : 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 8,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  cancelButton: {
    backgroundColor: '#F5F6FA',
    ...(Platform.OS === 'web' && {
      ':hover': {
        backgroundColor: '#E8ECF1',
      },
    }),
  },
  cancelButtonText: {
    color: '#666',
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    ...(Platform.OS === 'web' && {
      ':hover': {
        backgroundColor: '#357ABD',
        transform: 'translateY(-1px)',
      },
    }),
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({});

export default AdminJobTitlesScreen;

