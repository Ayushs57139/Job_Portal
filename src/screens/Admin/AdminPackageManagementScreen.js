import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import { API_URL } from '../../config/api';

const AdminPackageManagementScreen = ({ navigation }) => {
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  // State management
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // all, employer, candidate
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'INR',
    period: 'months',
    periodValue: '1',
    packageType: 'employer',
    isActive: true,
    isFeatured: false,
    displayOrder: '0',
    gstApplicable: true,
    supportIncluded: false,
    supportDetails: '',
    features: [],
  });

  // Feature form state
  const [featureName, setFeatureName] = useState('');
  const [featureValue, setFeatureValue] = useState('');
  const [featureIncluded, setFeatureIncluded] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    filterPackages();
  }, [searchQuery, selectedType, packages]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/api/admin/packages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPackages(data.packages || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch packages');
      }
    } catch (error) {
      console.error('Fetch packages error:', error);
      Alert.alert('Error', 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const filterPackages = () => {
    let filtered = [...packages];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(pkg => pkg.packageType === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.name.toLowerCase().includes(query) ||
        pkg.description.toLowerCase().includes(query)
      );
    }

    setFilteredPackages(filtered);
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentPackage(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'INR',
      period: 'months',
      periodValue: '1',
      packageType: 'employer',
      isActive: true,
      isFeatured: false,
      displayOrder: '0',
      gstApplicable: true,
      supportIncluded: false,
      supportDetails: '',
      features: [],
    });
    setModalVisible(true);
  };

  const openEditModal = (pkg) => {
    setEditMode(true);
    setCurrentPackage(pkg);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      price: pkg.price?.toString() || '',
      currency: pkg.currency || 'INR',
      period: pkg.period || 'months',
      periodValue: pkg.periodValue?.toString() || '1',
      packageType: pkg.packageType || 'employer',
      isActive: pkg.isActive !== undefined ? pkg.isActive : true,
      isFeatured: pkg.isFeatured !== undefined ? pkg.isFeatured : false,
      displayOrder: pkg.displayOrder?.toString() || '0',
      gstApplicable: pkg.gstApplicable !== undefined ? pkg.gstApplicable : true,
      supportIncluded: pkg.supportIncluded !== undefined ? pkg.supportIncluded : false,
      supportDetails: pkg.supportDetails || '',
      features: pkg.features || [],
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Package name is required');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Package description is required');
      return;
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      Alert.alert('Validation Error', 'Valid price is required');
      return;
    }
    if (!formData.periodValue || isNaN(formData.periodValue) || parseInt(formData.periodValue) < 1) {
      Alert.alert('Validation Error', 'Valid period value is required');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('adminToken');
      
      const packageData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        currency: formData.currency,
        period: formData.period,
        periodValue: parseInt(formData.periodValue),
        packageType: formData.packageType,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        displayOrder: parseInt(formData.displayOrder) || 0,
        gstApplicable: formData.gstApplicable,
        supportIncluded: formData.supportIncluded,
        supportDetails: formData.supportDetails.trim(),
        features: formData.features,
      };

      const url = editMode
        ? `${API_URL}/api/admin/packages/${currentPackage._id}`
        : `${API_URL}/api/admin/packages`;

      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', data.message || `Package ${editMode ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        fetchPackages();
      } else {
        Alert.alert('Error', data.message || `Failed to ${editMode ? 'update' : 'create'} package`);
      }
    } catch (error) {
      console.error('Submit package error:', error);
      Alert.alert('Error', `Failed to ${editMode ? 'update' : 'create'} package`);
    }
  };

  const handleDelete = (pkg) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${pkg.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('adminToken');
              
              const response = await fetch(`${API_URL}/api/admin/packages/${pkg._id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert('Success', 'Package deleted successfully');
                fetchPackages();
              } else {
                Alert.alert('Error', data.message || 'Failed to delete package');
              }
            } catch (error) {
              console.error('Delete package error:', error);
              Alert.alert('Error', 'Failed to delete package');
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (pkg) => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/api/admin/packages/${pkg._id}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchPackages();
      } else {
        Alert.alert('Error', data.message || 'Failed to toggle package status');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      Alert.alert('Error', 'Failed to toggle package status');
    }
  };

  const toggleFeatured = async (pkg) => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/api/admin/packages/${pkg._id}/toggle-featured`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchPackages();
      } else {
        Alert.alert('Error', data.message || 'Failed to toggle featured status');
      }
    } catch (error) {
      console.error('Toggle featured error:', error);
      Alert.alert('Error', 'Failed to toggle featured status');
    }
  };

  const addFeature = () => {
    if (!featureName.trim() || !featureValue.trim()) {
      Alert.alert('Validation Error', 'Feature name and value are required');
      return;
    }

    const newFeature = {
      name: featureName.trim(),
      value: featureValue.trim(),
      included: featureIncluded,
    };

    setFormData({
      ...formData,
      features: [...formData.features, newFeature],
    });

    setFeatureName('');
    setFeatureValue('');
    setFeatureIncluded(true);
  };

  const removeFeature = (index) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({ ...formData, features: updatedFeatures });
  };

  const renderPackageCard = (pkg) => (
    <View key={pkg._id} style={styles.packageCard}>
      <View style={styles.packageHeader}>
        <View style={styles.packageTitleRow}>
          <Text style={styles.packageName}>{pkg.name}</Text>
          <View style={styles.badgeContainer}>
            {pkg.isFeatured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.badgeText}>Featured</Text>
              </View>
            )}
            <View style={[styles.statusBadge, pkg.isActive ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={styles.badgeText}>{pkg.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.badgeText}>{pkg.packageType}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.packageDescription}>{pkg.description}</Text>
        <View style={styles.packageDetailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {pkg.currency} {pkg.price?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {pkg.periodValue} {pkg.period}
            </Text>
          </View>
          {pkg.gstApplicable && (
            <View style={styles.detailItem}>
              <Ionicons name="receipt-outline" size={16} color="#666" />
              <Text style={styles.detailText}>GST Applicable</Text>
            </View>
          )}
        </View>
        {pkg.features && pkg.features.length > 0 && (
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Features:</Text>
            {pkg.features.slice(0, 3).map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons
                  name={feature.included ? "checkmark-circle" : "close-circle"}
                  size={14}
                  color={feature.included ? "#4CAF50" : "#F44336"}
                />
                <Text style={styles.featureText}>
                  {feature.name}: {feature.value}
                </Text>
              </View>
            ))}
            {pkg.features.length > 3 && (
              <Text style={styles.moreFeatures}>+{pkg.features.length - 3} more features</Text>
            )}
          </View>
        )}
      </View>
      <View style={styles.packageActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => toggleActive(pkg)}
        >
          <Ionicons
            name={pkg.isActive ? "eye-off-outline" : "eye-outline"}
            size={18}
            color="#2196F3"
          />
          <Text style={styles.actionButtonText}>
            {pkg.isActive ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => toggleFeatured(pkg)}
        >
          <Ionicons
            name={pkg.isFeatured ? "star" : "star-outline"}
            size={18}
            color="#FFD700"
          />
          <Text style={styles.actionButtonText}>
            {pkg.isFeatured ? 'Unfeatured' : 'Featured'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(pkg)}
        >
          <Ionicons name="create-outline" size={18} color="#4CAF50" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(pkg)}
        >
          <Ionicons name="trash-outline" size={18} color="#F44336" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editMode ? 'Edit Package' : 'Add New Package'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Text style={styles.label}>Package Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Professional Package"
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Package description"
              multiline
              numberOfLines={3}
            />

            <View style={styles.row}>
              <View style={styles.halfColumn}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfColumn}>
                <Text style={styles.label}>Currency</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      Alert.alert('Select Currency', '', [
                        { text: 'INR', onPress: () => setFormData({ ...formData, currency: 'INR' }) },
                        { text: 'USD', onPress: () => setFormData({ ...formData, currency: 'USD' }) },
                        { text: 'EUR', onPress: () => setFormData({ ...formData, currency: 'EUR' }) },
                      ]);
                    }}
                  >
                    <Text style={styles.pickerText}>{formData.currency}</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfColumn}>
                <Text style={styles.label}>Period Value *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.periodValue}
                  onChangeText={(text) => setFormData({ ...formData, periodValue: text })}
                  placeholder="1"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfColumn}>
                <Text style={styles.label}>Period *</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      Alert.alert('Select Period', '', [
                        { text: 'Days', onPress: () => setFormData({ ...formData, period: 'days' }) },
                        { text: 'Months', onPress: () => setFormData({ ...formData, period: 'months' }) },
                        { text: 'Years', onPress: () => setFormData({ ...formData, period: 'years' }) },
                      ]);
                    }}
                  >
                    <Text style={styles.pickerText}>{formData.period}</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Package Type *</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, formData.packageType === 'employer' && styles.radioButtonActive]}
                onPress={() => setFormData({ ...formData, packageType: 'employer' })}
              >
                <Text style={[styles.radioText, formData.packageType === 'employer' && styles.radioTextActive]}>
                  Employer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, formData.packageType === 'candidate' && styles.radioButtonActive]}
                onPress={() => setFormData({ ...formData, packageType: 'candidate' })}
              >
                <Text style={[styles.radioText, formData.packageType === 'candidate' && styles.radioTextActive]}>
                  Candidate
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Display Order</Text>
            <TextInput
              style={styles.input}
              value={formData.displayOrder}
              onChangeText={(text) => setFormData({ ...formData, displayOrder: text })}
              placeholder="0"
              keyboardType="numeric"
            />

            {/* Settings */}
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Active</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                thumbColor={formData.isActive ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Featured</Text>
              <Switch
                value={formData.isFeatured}
                onValueChange={(value) => setFormData({ ...formData, isFeatured: value })}
                trackColor={{ false: '#ccc', true: '#FFD700' }}
                thumbColor={formData.isFeatured ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>GST Applicable</Text>
              <Switch
                value={formData.gstApplicable}
                onValueChange={(value) => setFormData({ ...formData, gstApplicable: value })}
                trackColor={{ false: '#ccc', true: '#2196F3' }}
                thumbColor={formData.gstApplicable ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Support Included</Text>
              <Switch
                value={formData.supportIncluded}
                onValueChange={(value) => setFormData({ ...formData, supportIncluded: value })}
                trackColor={{ false: '#ccc', true: '#2196F3' }}
                thumbColor={formData.supportIncluded ? '#fff' : '#f4f3f4'}
              />
            </View>

            {formData.supportIncluded && (
              <>
                <Text style={styles.label}>Support Details</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.supportDetails}
                  onChangeText={(text) => setFormData({ ...formData, supportDetails: text })}
                  placeholder="e.g., 24/7 Email Support"
                  multiline
                  numberOfLines={2}
                />
              </>
            )}

            {/* Features Section */}
            <Text style={styles.sectionTitle}>Features</Text>
            
            <View style={styles.featureInputGroup}>
              <TextInput
                style={[styles.input, styles.featureInput]}
                value={featureName}
                onChangeText={setFeatureName}
                placeholder="Feature name (e.g., Job Posts)"
              />
              <TextInput
                style={[styles.input, styles.featureInput]}
                value={featureValue}
                onChangeText={setFeatureValue}
                placeholder="Value (e.g., 10)"
              />
              <View style={styles.featureIncludedRow}>
                <Text style={styles.featureIncludedLabel}>Included:</Text>
                <Switch
                  value={featureIncluded}
                  onValueChange={setFeatureIncluded}
                  trackColor={{ false: '#ccc', true: '#4CAF50' }}
                />
              </View>
              <TouchableOpacity style={styles.addFeatureButton} onPress={addFeature}>
                <Ionicons name="add-circle" size={24} color="#2196F3" />
              </TouchableOpacity>
            </View>

            {formData.features.length > 0 && (
              <View style={styles.featuresListContainer}>
                {formData.features.map((feature, index) => (
                  <View key={index} style={styles.featureListItem}>
                    <Ionicons
                      name={feature.included ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={feature.included ? "#4CAF50" : "#F44336"}
                    />
                    <Text style={styles.featureListText}>
                      {feature.name}: {feature.value}
                    </Text>
                    <TouchableOpacity onPress={() => removeFeature(index)}>
                      <Ionicons name="trash-outline" size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {editMode ? 'Update' : 'Create'} Package
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <AdminLayout
        title="Package Management"
        activeScreen="AdminPackageManagement"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Package Management"
      activeScreen="AdminPackageManagement"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Package Management</Text>
            <Text style={styles.pageSubtitle}>Manage subscription packages</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search package management..."
            />
          </View>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, selectedType === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedType('all')}
            >
              <Text style={[styles.filterButtonText, selectedType === 'all' && styles.filterButtonTextActive]}>
                All ({packages.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedType === 'employer' && styles.filterButtonActive]}
              onPress={() => setSelectedType('employer')}
            >
              <Text style={[styles.filterButtonText, selectedType === 'employer' && styles.filterButtonTextActive]}>
                Employer ({packages.filter(p => p.packageType === 'employer').length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedType === 'candidate' && styles.filterButtonActive]}
              onPress={() => setSelectedType('candidate')}
            >
              <Text style={[styles.filterButtonText, selectedType === 'candidate' && styles.filterButtonTextActive]}>
                Candidate ({packages.filter(p => p.packageType === 'candidate').length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Packages List */}
        <ScrollView style={styles.packagesList} showsVerticalScrollIndicator={false}>
          {filteredPackages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No package management found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Get started by adding a new package'}
              </Text>
            </View>
          ) : (
            filteredPackages.map(renderPackageCard)
          )}
        </ScrollView>

        {renderModal()}
      </View>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pageTitle: {
    fontSize: 24,
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
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    outlineStyle: 'none',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  packagesList: {
    flex: 1,
    padding: 16,
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  packageHeader: {
    padding: 16,
  },
  packageTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  typeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  packageDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  featuresSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
  },
  moreFeatures: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 4,
  },
  packageActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  toggleButton: {
    backgroundColor: '#E3F2FD',
  },
  editButton: {
    backgroundColor: '#E8F5E9',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    outlineStyle: 'none',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfColumn: {
    flex: 1,
  },
  pickerContainer: {
    marginTop: 6,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerText: {
    fontSize: 14,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  radioText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  radioTextActive: {
    color: '#2196F3',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  featureInputGroup: {
    marginTop: 8,
  },
  featureInput: {
    marginBottom: 8,
  },
  featureIncludedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  featureIncludedLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  addFeatureButton: {
    alignSelf: 'center',
    marginTop: 4,
  },
  featuresListContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  featureListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  featureListText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AdminPackageManagementScreen;
