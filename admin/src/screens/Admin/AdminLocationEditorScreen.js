import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const AdminLocationEditorScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  
  const [formData, setFormData] = useState({
    district: '',
    city: '',
    state: '',
    country: 'India',
    isActive: true
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    countries: 0,
    states: 0
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [searchQuery, locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/admin/locations`, { headers });
      const data = await response.json();
      
      setLocations(data.locations || []);
      calculateStats(data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      Alert.alert('Error', 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (locs) => {
    const uniqueCountries = new Set(locs.map(l => l.country)).size;
    const uniqueStates = new Set(locs.map(l => l.state)).size;
    
    setStats({
      total: locs.length,
      active: locs.filter(l => l.isActive).length,
      inactive: locs.filter(l => !l.isActive).length,
      countries: uniqueCountries,
      states: uniqueStates
    });
  };

  const filterLocations = () => {
    if (!searchQuery) {
      setFilteredLocations(locations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = locations.filter(loc =>
      loc.district?.toLowerCase().includes(query) ||
      loc.city?.toLowerCase().includes(query) ||
      loc.state?.toLowerCase().includes(query) ||
      loc.country?.toLowerCase().includes(query) ||
      `${loc.district}, ${loc.city}, ${loc.state}, ${loc.country}`.toLowerCase().includes(query)
    );
    setFilteredLocations(filtered);
  };

  const handleAdd = () => {
    setEditingLocation(null);
    setFormData({
      district: '',
      city: '',
      state: '',
      country: 'India',
      isActive: true
    });
    setShowAddModal(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      district: location.district || '',
      city: location.city || '',
      state: location.state || '',
      country: location.country || 'India',
      isActive: location.isActive !== false
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.district || !formData.city || !formData.state || !formData.country) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const url = editingLocation 
        ? `${API_URL}/admin/locations/${editingLocation._id}`
        : `${API_URL}/admin/locations`;
      
      const method = editingLocation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', editingLocation ? 'Location updated successfully' : 'Location added successfully');
        setShowAddModal(false);
        fetchLocations();
      } else {
        throw new Error(data.message || 'Failed to save location');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', error.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (location) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${location.district}, ${location.city}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Authorization': `Bearer ${token}`
              };

              const response = await fetch(`${API_URL}/admin/locations/${location._id}`, {
                method: 'DELETE',
                headers
              });

              if (response.ok) {
                Alert.alert('Success', 'Location deleted successfully');
                fetchLocations();
              } else {
                throw new Error('Failed to delete location');
              }
            } catch (error) {
              console.error('Error deleting location:', error);
              Alert.alert('Error', 'Failed to delete location');
            }
          }
        }
      ]
    );
  };

  const handleBulkImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
        copyToCacheDirectory: true
      });

      if (result.type === 'cancel') return;

      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', {
        uri: result.uri,
        type: result.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: result.name
      });

      const response = await fetch(`${API_URL}/admin/locations/bulk-import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', `Imported ${data.imported || 0} locations successfully`);
        fetchLocations();
      } else {
        throw new Error(data.message || 'Failed to import locations');
      }
    } catch (error) {
      console.error('Error importing locations:', error);
      Alert.alert('Error', error.message || 'Failed to import locations');
    }
  };

  const handleBulkExport = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/locations/bulk-export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1];
          const fileUri = FileSystem.documentDirectory + 'locations_export.xlsx';
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64
          });
          await Sharing.shareAsync(fileUri);
        };
        reader.readAsDataURL(blob);
      } else {
        throw new Error('Failed to export locations');
      }
    } catch (error) {
      console.error('Error exporting locations:', error);
      Alert.alert('Error', 'Failed to export locations');
    }
  };

  const handleDownloadSample = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/locations/sample-template`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1];
          const fileUri = FileSystem.documentDirectory + 'locations_sample.xlsx';
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64
          });
          await Sharing.shareAsync(fileUri);
        };
        reader.readAsDataURL(blob);
      } else {
        throw new Error('Failed to download sample');
      }
    } catch (error) {
      console.error('Error downloading sample:', error);
      Alert.alert('Error', 'Failed to download sample template');
    }
  };

  const dynamicStyles = getStyles(isMobile, isTablet);

  return (
    <AdminLayout
      title="Location Editor"
      activeScreen="AdminLocationEditor"
      onNavigate={(screen) => navigation.navigate(screen)}
      onLogout={() => navigation.replace('AdminLogin')}
    >
      <ScrollView style={dynamicStyles.container}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.title}>Location Editor</Text>
            <Text style={dynamicStyles.subtitle}>Manage hierarchical location data</Text>
          </View>
          <View style={dynamicStyles.headerActions}>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={handleDownloadSample}
            >
              <Ionicons name="download-outline" size={20} color="#FFF" />
              <Text style={dynamicStyles.actionButtonText}>Sample</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.actionButton, { backgroundColor: '#F39C12' }]}
              onPress={handleBulkImport}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
              <Text style={dynamicStyles.actionButtonText}>Import</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.actionButton, { backgroundColor: '#27AE60' }]}
              onPress={handleBulkExport}
            >
              <Ionicons name="cloud-download-outline" size={20} color="#FFF" />
              <Text style={dynamicStyles.actionButtonText}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.actionButton, { backgroundColor: '#4A90E2' }]}
              onPress={handleAdd}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={dynamicStyles.actionButtonText}>Add Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.statCard}>
            <Ionicons name="location-outline" size={24} color="#4A90E2" />
            <Text style={dynamicStyles.statValue}>{stats.total}</Text>
            <Text style={dynamicStyles.statLabel}>Total Locations</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#27AE60" />
            <Text style={dynamicStyles.statValue}>{stats.active}</Text>
            <Text style={dynamicStyles.statLabel}>Active</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Ionicons name="close-circle-outline" size={24} color="#E74C3C" />
            <Text style={dynamicStyles.statValue}>{stats.inactive}</Text>
            <Text style={dynamicStyles.statLabel}>Inactive</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Ionicons name="flag-outline" size={24} color="#9B59B6" />
            <Text style={dynamicStyles.statValue}>{stats.countries}</Text>
            <Text style={dynamicStyles.statLabel}>Countries</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Ionicons name="map-outline" size={24} color="#E67E22" />
            <Text style={dynamicStyles.statValue}>{stats.states}</Text>
            <Text style={dynamicStyles.statLabel}>States</Text>
          </View>
        </View>

        {/* Search */}
        <View style={dynamicStyles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Search locations (District, City, State, Country)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Locations List */}
        {loading ? (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={dynamicStyles.loadingText}>Loading locations...</Text>
          </View>
        ) : filteredLocations.length === 0 ? (
          <View style={dynamicStyles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#CCC" />
            <Text style={dynamicStyles.emptyText}>No locations found</Text>
            <TouchableOpacity style={dynamicStyles.addButton} onPress={handleAdd}>
              <Text style={dynamicStyles.addButtonText}>Add First Location</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={dynamicStyles.locationsList}>
            {filteredLocations.map(location => (
              <View key={location._id} style={dynamicStyles.locationCard}>
                <View style={dynamicStyles.locationInfo}>
                  <Text style={dynamicStyles.locationName}>
                    {location.district}, {location.city}
                  </Text>
                  <Text style={dynamicStyles.locationDetails}>
                    {location.state}, {location.country}
                  </Text>
                  <View style={dynamicStyles.locationBadges}>
                    <View style={[
                      dynamicStyles.badge,
                      location.isActive ? dynamicStyles.badgeActive : dynamicStyles.badgeInactive
                    ]}>
                      <Text style={dynamicStyles.badgeText}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={dynamicStyles.locationActions}>
                  <TouchableOpacity
                    style={dynamicStyles.iconButton}
                    onPress={() => handleEdit(location)}
                  >
                    <Ionicons name="create-outline" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={dynamicStyles.iconButton}
                    onPress={() => handleDelete(location)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add/Edit Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close-outline" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={dynamicStyles.modalBody}>
                <Text style={dynamicStyles.label}>District *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Enter district name"
                  value={formData.district}
                  onChangeText={(text) => setFormData({ ...formData, district: text })}
                />

                <Text style={dynamicStyles.label}>City *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Enter city name"
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                />

                <Text style={dynamicStyles.label}>State *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Enter state name"
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                />

                <Text style={dynamicStyles.label}>Country *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Enter country name"
                  value={formData.country}
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                />

                <View style={dynamicStyles.switchContainer}>
                  <Text style={dynamicStyles.label}>Active Status</Text>
                  <TouchableOpacity
                    style={[
                      dynamicStyles.switchButton,
                      formData.isActive && dynamicStyles.switchButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  >
                    <Text style={[
                      dynamicStyles.switchButtonText,
                      formData.isActive && dynamicStyles.switchButtonTextActive
                    ]}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={dynamicStyles.exampleBox}>
                  <Text style={dynamicStyles.exampleTitle}>Format Example:</Text>
                  <Text style={dynamicStyles.exampleText}>
                    District: Loni{'\n'}
                    City: Ghaziabad{'\n'}
                    State: Uttar Pradesh{'\n'}
                    Country: India{'\n\n'}
                    Display: Loni, Ghaziabad, Uttar Pradesh, India
                  </Text>
                </View>
              </ScrollView>

              <View style={dynamicStyles.modalFooter}>
                <TouchableOpacity
                  style={[dynamicStyles.modalButton, dynamicStyles.cancelButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.modalButton, dynamicStyles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={dynamicStyles.saveButtonText}>
                    {loading ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: isMobile ? 15 : 0,
  },
  title: {
    fontSize: isMobile ? 24 : 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },
  headerActions: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
    width: isMobile ? '100%' : 'auto',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 0,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  locationsList: {
    padding: 20,
    paddingTop: 0,
    gap: 15,
  },
  locationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  locationBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: '#D1FAE5',
  },
  badgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 8,
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
    width: isMobile ? '90%' : isTablet ? '70%' : '50%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  switchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  switchButtonActive: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  switchButtonTextActive: {
    color: '#FFF',
  },
  exampleBox: {
    backgroundColor: '#EFF6FF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
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

export default AdminLocationEditorScreen;
