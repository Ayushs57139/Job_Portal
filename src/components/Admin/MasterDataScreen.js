import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import AdminLayout from './AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const MasterDataScreen = ({ 
  navigation,
  title,
  subtitle,
  apiEndpoint,
  screenName,
  fieldName = 'name',
  additionalFields = []
}) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: null });
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${apiEndpoint}`, { headers });
      const data = await response.json();
      const dataKey = Object.keys(data)[0];
      setItems(data[dataKey] || []);
    } catch (error) {
      console.error(`Error fetching ${title}:`, error);
      Alert.alert('Error', `Failed to fetch ${title}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentItem[fieldName]?.trim()) {
      Alert.alert('Error', `Please enter a ${fieldName}`);
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

      if (editMode) {
        await fetch(`${API_URL}${apiEndpoint}/${currentItem.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(currentItem)
        });
        Alert.alert('Success', `${title} updated successfully`);
      } else {
        await fetch(`${API_URL}${apiEndpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(currentItem)
        });
        Alert.alert('Success', `${title} created successfully`);
      }
      setModalVisible(false);
      resetCurrentItem();
      fetchItems();
    } catch (error) {
      console.error(`Error saving ${title}:`, error);
      Alert.alert('Error', `Failed to save ${title}`);
    }
  };

  const resetCurrentItem = () => {
    const emptyItem = { id: null, [fieldName]: '' };
    additionalFields.forEach(field => {
      emptyItem[field.key] = field.defaultValue || '';
    });
    setCurrentItem(emptyItem);
  };

  const handleEdit = (item) => {
    const editItem = { id: item._id, [fieldName]: item[fieldName] };
    additionalFields.forEach(field => {
      editItem[field.key] = item[field.key] || field.defaultValue || '';
    });
    setCurrentItem(editItem);
    setEditMode(true);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this ${title.toLowerCase()}?`,
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

              await fetch(`${API_URL}${apiEndpoint}/${id}`, {
                method: 'DELETE',
                headers
              });
              Alert.alert('Success', `${title} deleted successfully`);
              fetchItems();
            } catch (error) {
              console.error(`Error deleting ${title}:`, error);
              Alert.alert('Error', `Failed to delete ${title}`);
            }
          }
        }
      ]
    );
  };

  const filteredItems = items.filter(item =>
    item[fieldName]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <AdminLayout
      title={title}
      activeScreen={screenName}
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.pageTitle}>{title}</Text>
            <Text style={styles.pageSubtitle}>{subtitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetCurrentItem();
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
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.statsBar}>
          <Text style={styles.statsText}>Total: {filteredItems.length}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.listWrapper}>
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <View key={item._id || index} style={styles.listItem}>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName}>{item[fieldName]}</Text>
                      {additionalFields.map(field => (
                        field.displayInList && (
                          <Text key={field.key} style={styles.itemSubtext}>
                            {field.label}: {item[field.key]}
                          </Text>
                        )
                      ))}
                    </View>
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit(item)}
                      >
                        <Ionicons name="create-outline" size={18} color="#4A90E2" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item._id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="folder-open-outline" size={64} color="#CCC" />
                  <Text style={styles.emptyStateText}>No {title.toLowerCase()} found</Text>
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
                {editMode ? `Edit ${title}` : `Add New ${title}`}
              </Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder={`Enter ${fieldName}`}
                value={currentItem[fieldName] || ''}
                onChangeText={(text) => setCurrentItem({ ...currentItem, [fieldName]: text })}
              />

              {additionalFields.map(field => (
                <View key={field.key}>
                  {field.type === 'text' && (
                    <TextInput
                      style={styles.modalInput}
                      placeholder={field.placeholder || field.label}
                      value={currentItem[field.key] || ''}
                      onChangeText={(text) => setCurrentItem({ ...currentItem, [field.key]: text })}
                      multiline={field.multiline}
                      numberOfLines={field.numberOfLines}
                    />
                  )}
                </View>
              ))}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    resetCurrentItem();
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
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itemSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
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
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
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

export default MasterDataScreen;

