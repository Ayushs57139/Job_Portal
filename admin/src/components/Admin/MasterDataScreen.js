import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal, Switch, Platform } from 'react-native';
import AdminLayout from './AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import { useResponsive, getResponsiveValue, getResponsiveFontSize, getResponsivePadding } from '../../utils/responsive';

const MasterDataScreen = ({ 
  navigation,
  title,
  subtitle,
  apiEndpoint,
  fetchEndpoint,
  screenName,
  fieldName = 'name',
  additionalFields = [],
  parentField = null, // e.g., { key: 'parentId', label: 'Parent Industry', fetchEndpoint: '/admin/master-data/industries' }
  showSubItems = false // Whether to show sub-items in the list
}) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [parentItems, setParentItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: null });
  const [user, setUser] = useState(null);
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  useEffect(() => {
    fetchItems();
    if (parentField) {
      fetchParentItems();
    }
  }, []);

  const fetchParentItems = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${parentField.fetchEndpoint}`, { headers });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract parent items array
      let fetchedParents = null;
      if (Array.isArray(data)) {
        fetchedParents = data;
      } else if (data.data && Array.isArray(data.data)) {
        fetchedParents = data.data;
      } else if (data[parentField.label.toLowerCase()] && Array.isArray(data[parentField.label.toLowerCase()])) {
        fetchedParents = data[parentField.label.toLowerCase()];
      }
      
      if (Array.isArray(fetchedParents)) {
        setParentItems(fetchedParents);
      }
    } catch (error) {
      console.error(`Error fetching parent items:`, error);
    }
  };

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

      const endpoint = fetchEndpoint || apiEndpoint;
      const response = await fetch(`${API_URL}${endpoint}`, { headers });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Try to find the data array in the response
      let fetchedItems = null;
      
      // Common key names for data arrays
      const possibleKeys = [
        title.toLowerCase(),
        title.toLowerCase() + 's',
        'data',
        'items',
        'results'
      ];
      
      // First, check if the response itself is an array
      if (Array.isArray(data)) {
        fetchedItems = data;
      } else {
        // Look for array values in the response object
        for (const key of possibleKeys) {
          if (data[key] && Array.isArray(data[key])) {
            fetchedItems = data[key];
            break;
          }
        }
        
        // If still not found, try to find any array in the response
        if (!fetchedItems) {
          const keys = Object.keys(data);
          for (const key of keys) {
            if (Array.isArray(data[key])) {
              fetchedItems = data[key];
              break;
            }
          }
        }
      }
      
      // Ensure items is always an array
      if (Array.isArray(fetchedItems)) {
        setItems(fetchedItems);
      } else {
        console.warn(`Expected array for ${title}, got:`, typeof fetchedItems);
        setItems([]);
      }
    } catch (error) {
      console.error(`Error fetching ${title}:`, error);
      setItems([]); // Ensure items is always an array even on error
      Alert.alert('Error', `Failed to fetch ${title}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate main field
    if (!currentItem[fieldName]?.trim()) {
      Alert.alert('Error', `Please enter a ${fieldName}`);
      return;
    }

    // Validate required additional fields
    for (const field of additionalFields) {
      if (field.required && !currentItem[field.key]?.trim()) {
        Alert.alert('Error', `Please enter ${field.label}`);
        return;
      }
    }

    // Validate parent field if required
    if (parentField && parentField.required && !currentItem[parentField.key]) {
      Alert.alert('Error', `Please select ${parentField.label}`);
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

      // Prepare data (remove id for create/update)
      const dataToSend = { ...currentItem };
      const itemId = dataToSend.id;
      delete dataToSend.id;

      // Convert subcategories from comma-separated string to array if needed
      if (dataToSend.subcategories && typeof dataToSend.subcategories === 'string') {
        dataToSend.subcategories = dataToSend.subcategories
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }

      // Remove empty parent field if not set
      if (parentField && !dataToSend[parentField.key]) {
        delete dataToSend[parentField.key];
      }

      let response;
      if (editMode && itemId) {
        // Update existing item
        response = await fetch(`${API_URL}${apiEndpoint}/${itemId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(dataToSend)
        });
      } else {
        // Create new item
        response = await fetch(`${API_URL}${apiEndpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(dataToSend)
        });
      }

      const result = await response.json();
      
      if (!response.ok) {
        const errorMessage = result.message || result.error || `Failed to save ${title}`;
        throw new Error(errorMessage);
      }

      Alert.alert('Success', editMode ? `${title} updated successfully` : `${title} created successfully`);
      setModalVisible(false);
      setEditMode(false);
      resetCurrentItem();
      fetchItems();
    } catch (error) {
      console.error(`Error saving ${title}:`, error);
      Alert.alert('Error', error.message || `Failed to save ${title}`);
    }
  };

  const resetCurrentItem = () => {
    const emptyItem = { id: null, [fieldName]: '' };
    additionalFields.forEach(field => {
      emptyItem[field.key] = field.defaultValue || '';
    });
    if (parentField) {
      emptyItem[parentField.key] = '';
    }
    setCurrentItem(emptyItem);
    setEditMode(false);
  };

  const handleEdit = (item) => {
    // Get the ID - handle both _id and id formats
    const itemId = item._id || item.id;
    
    const editItem = { id: itemId, [fieldName]: item[fieldName] || '' };
    
    // Add all additional fields
    additionalFields.forEach(field => {
      let value = item[field.key] || field.defaultValue || '';
      // Convert subcategories array to comma-separated string for display
      if (field.key === 'subcategories' && Array.isArray(value)) {
        value = value.join(', ');
      }
      editItem[field.key] = value;
    });
    
    // Handle parent field - check multiple possible field names
    if (parentField) {
      const parentId = item[parentField.key] || 
                       item.parentId || 
                       item.parent || 
                       item.industry || 
                       item.department || 
                       item.educationField || 
                       item.course || 
                       (item[parentField.key + 'Id']) ||
                       '';
      editItem[parentField.key] = parentId;
    }
    
    setCurrentItem(editItem);
    setEditMode(true);
    setModalVisible(true);
  };

  const handleDelete = async (item) => {
    // Get the ID - handle both _id and id formats
    const itemId = item._id || item.id || item;
    
    if (!itemId) {
      Alert.alert('Error', 'Invalid item ID');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this ${title.toLowerCase()}? This action cannot be undone.`,
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

              const response = await fetch(`${API_URL}${apiEndpoint}/${itemId}`, {
                method: 'DELETE',
                headers
              });

              const result = await response.json();
              
              if (!response.ok) {
                const errorMessage = result.message || result.error || `Failed to delete ${title}`;
                throw new Error(errorMessage);
              }

              Alert.alert('Success', `${title} deleted successfully`);
              fetchItems();
            } catch (error) {
              console.error(`Error deleting ${title}:`, error);
              Alert.alert('Error', error.message || `Failed to delete ${title}`);
            }
          }
        }
      ]
    );
  };

  const filteredItems = Array.isArray(items) 
    ? items.filter(item =>
        item[fieldName]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleLogout = () => {
    navigation.replace('AdminLogin');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const responsive = useResponsive();
  const dynamicStyles = getStyles(responsive);

  return (
    <AdminLayout
      title={title}
      activeScreen={screenName}
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.headerSection}>
          <View style={dynamicStyles.headerTextContainer}>
            <Text style={dynamicStyles.pageTitle}>{title}</Text>
            <Text style={dynamicStyles.pageSubtitle}>{subtitle}</Text>
          </View>
          <TouchableOpacity
            style={dynamicStyles.addButton}
            onPress={() => {
              resetCurrentItem();
              setEditMode(false);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={responsive.isMobile ? 18 : 22} color="#FFF" />
            {!responsive.isMobile && <Text style={dynamicStyles.addButtonText}>Add New</Text>}
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.searchContainer}>
          <Ionicons name="search" size={responsive.isMobile ? 18 : 20} color="#999" style={dynamicStyles.searchIcon} />
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={dynamicStyles.statsBar}>
          <Text style={dynamicStyles.statsText}>Total: {filteredItems.length}</Text>
        </View>

        {loading ? (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={dynamicStyles.loadingText}>Loading {title.toLowerCase()}...</Text>
          </View>
        ) : (
          <ScrollView style={dynamicStyles.listContainer} showsVerticalScrollIndicator={false}>
            <View style={dynamicStyles.listWrapper}>
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <View key={item._id || item.id || index} style={dynamicStyles.listItem}>
                    <View style={dynamicStyles.itemContent}>
                      <Text style={dynamicStyles.itemName}>{item[fieldName]}</Text>
                      {parentField && (
                        <View style={dynamicStyles.parentInfoContainer}>
                          <Ionicons name="layers-outline" size={responsive.isMobile ? 14 : 16} color="#64748B" />
                          <Text style={dynamicStyles.parentLabel}>{parentField.label}:</Text>
                          {(() => {
                            const parentId = item[parentField.key] || 
                                            item.parentId || 
                                            item.parent || 
                                            item.educationField || 
                                            item.course ||
                                            '';
                            if (parentId) {
                              const parent = parentItems.find(p => (p._id || p.id) === parentId);
                              return (
                                <Text style={dynamicStyles.parentValue}>
                                  {parent?.[fieldName] || 'N/A'}
                                </Text>
                              );
                            } else {
                              return (
                                <Text style={dynamicStyles.parentValueEmpty}>Not assigned</Text>
                              );
                            }
                          })()}
                        </View>
                      )}
                      {showSubItems && item.subcategories && item.subcategories.length > 0 && (
                        <View style={dynamicStyles.subItemsContainer}>
                          <Text style={dynamicStyles.subItemsLabel}>Sub-items ({item.subcategories.length}):</Text>
                          <View style={dynamicStyles.subItemsList}>
                            {item.subcategories.slice(0, responsive.isMobile ? 2 : 3).map((sub, idx) => (
                              <Text key={idx} style={dynamicStyles.subItemText}>{sub}</Text>
                            ))}
                            {item.subcategories.length > (responsive.isMobile ? 2 : 3) && (
                              <Text style={dynamicStyles.subItemText}>+{item.subcategories.length - (responsive.isMobile ? 2 : 3)} more</Text>
                            )}
                          </View>
                        </View>
                      )}
                      {additionalFields.map(field => (
                        field.displayInList && (
                          <Text key={field.key} style={dynamicStyles.itemSubtext}>
                            {field.label}: {item[field.key]}
                          </Text>
                        )
                      ))}
                    </View>
                    <View style={dynamicStyles.itemActions}>
                      <TouchableOpacity
                        style={dynamicStyles.editButton}
                        onPress={() => handleEdit(item)}
                      >
                        <Ionicons name="create-outline" size={responsive.isMobile ? 18 : 20} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={dynamicStyles.deleteButton}
                        onPress={() => handleDelete(item)}
                      >
                        <Ionicons name="trash-outline" size={responsive.isMobile ? 18 : 20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={dynamicStyles.emptyState}>
                  <View style={dynamicStyles.emptyStateIconContainer}>
                    <Ionicons name="folder-open-outline" size={responsive.isMobile ? 48 : 64} color={colors.textLight} />
                  </View>
                  <Text style={dynamicStyles.emptyStateText}>No {title.toLowerCase()} found</Text>
                  <Text style={dynamicStyles.emptyStateSubtext}>Click "Add New" to create your first {title.toLowerCase()}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setModalVisible(false);
            setShowParentDropdown(false);
            setEditMode(false);
            resetCurrentItem();
          }}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setModalVisible(false);
              setShowParentDropdown(false);
              setEditMode(false);
              resetCurrentItem();
            }}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>
                  {editMode ? `Edit ${title}` : `Add New ${title}`}
                </Text>
                <TouchableOpacity
                  style={dynamicStyles.modalCloseButton}
                  onPress={() => {
                    setModalVisible(false);
                    setShowParentDropdown(false);
                    setEditMode(false);
                    resetCurrentItem();
                  }}
                >
                  <Ionicons name="close" size={responsive.isMobile ? 20 : 24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <View style={dynamicStyles.modalBody}>
              <View style={dynamicStyles.fieldContainer}>
                <Text style={dynamicStyles.fieldLabel}>
                  {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} <Text style={dynamicStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={dynamicStyles.modalInput}
                  placeholder={`Enter ${fieldName}`}
                  placeholderTextColor="#94A3B8"
                  value={currentItem[fieldName] || ''}
                  onChangeText={(text) => setCurrentItem({ ...currentItem, [fieldName]: text })}
                />
              </View>

              {parentField && (
                <View style={[dynamicStyles.fieldContainer, showParentDropdown && dynamicStyles.fieldContainerDropdownOpen]}>
                  <Text style={dynamicStyles.fieldLabel}>
                    {parentField.label} {parentField.required && <Text style={dynamicStyles.requiredStar}>*</Text>}
                  </Text>
                  <TouchableOpacity
                    style={[
                      dynamicStyles.dropdownButton,
                      showParentDropdown && dynamicStyles.dropdownButtonActive
                    ]}
                    onPress={() => setShowParentDropdown(!showParentDropdown)}
                  >
                    <Text style={[
                      dynamicStyles.dropdownButtonText,
                      !currentItem[parentField.key] && { color: '#94A3B8' }
                    ]}>
                      {currentItem[parentField.key] 
                        ? (parentItems.find(p => (p._id || p.id) === currentItem[parentField.key])?.[fieldName] || 'Select parent')
                        : 'Select parent'}
                    </Text>
                    <Ionicons 
                      name={showParentDropdown ? 'chevron-up' : 'chevron-down'} 
                      size={responsive.isMobile ? 20 : 22} 
                      color={showParentDropdown ? colors.primary : "#94A3B8"} 
                    />
                  </TouchableOpacity>
                  {showParentDropdown && (
                    <View style={dynamicStyles.dropdownList}>
                      <ScrollView 
                        style={dynamicStyles.dropdownScroll} 
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={true}
                      >
                        <TouchableOpacity
                          style={[
                            dynamicStyles.dropdownItem,
                            !currentItem[parentField.key] && dynamicStyles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            setCurrentItem({ ...currentItem, [parentField.key]: '' });
                            setShowParentDropdown(false);
                          }}
                        >
                          <Text style={[
                            dynamicStyles.dropdownItemText,
                            !currentItem[parentField.key] && dynamicStyles.dropdownItemTextSelected
                          ]}>
                            None
                          </Text>
                          {!currentItem[parentField.key] && (
                            <Ionicons name="checkmark" size={responsive.isMobile ? 16 : 18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                        {parentItems.length > 0 ? (
                          parentItems.map((parent) => (
                            <TouchableOpacity
                              key={parent._id || parent.id}
                              style={[
                                dynamicStyles.dropdownItem,
                                currentItem[parentField.key] === (parent._id || parent.id) && dynamicStyles.dropdownItemSelected
                              ]}
                              onPress={() => {
                                setCurrentItem({ ...currentItem, [parentField.key]: parent._id || parent.id });
                                setShowParentDropdown(false);
                              }}
                            >
                              <Text style={[
                                dynamicStyles.dropdownItemText,
                                currentItem[parentField.key] === (parent._id || parent.id) && dynamicStyles.dropdownItemTextSelected
                              ]}>
                                {parent[fieldName]}
                              </Text>
                              {currentItem[parentField.key] === (parent._id || parent.id) && (
                                <Ionicons name="checkmark" size={responsive.isMobile ? 16 : 18} color={colors.primary} />
                              )}
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={dynamicStyles.dropdownItem}>
                            <Text style={[dynamicStyles.dropdownItemText, { color: '#94A3B8', fontStyle: 'italic' }]}>
                              No {parentField.label.toLowerCase()} available
                            </Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

              <ScrollView style={dynamicStyles.modalFieldsContainer} showsVerticalScrollIndicator={false}>
                {additionalFields.map(field => (
                  <View key={field.key} style={dynamicStyles.fieldContainer}>
                    {field.type === 'text' && (
                      <>
                        <Text style={dynamicStyles.fieldLabel}>
                          {field.label} {field.required && <Text style={dynamicStyles.requiredStar}>*</Text>}
                        </Text>
                        <TextInput
                          style={[dynamicStyles.modalInput, field.multiline && dynamicStyles.multilineInput]}
                          placeholder={field.placeholder || field.label}
                          placeholderTextColor="#94A3B8"
                          value={currentItem[field.key] || ''}
                          onChangeText={(text) => setCurrentItem({ ...currentItem, [field.key]: text })}
                          multiline={field.multiline}
                          numberOfLines={field.numberOfLines}
                        />
                      </>
                    )}
                    {field.type === 'boolean' && (
                      <View style={dynamicStyles.switchContainer}>
                        <Text style={dynamicStyles.fieldLabel}>{field.label}</Text>
                        <Switch
                          value={currentItem[field.key] !== undefined ? currentItem[field.key] : field.defaultValue}
                          onValueChange={(value) => setCurrentItem({ ...currentItem, [field.key]: value })}
                          trackColor={{ false: '#CBD5E1', true: colors.primary }}
                          thumbColor={colors.white}
                          ios_backgroundColor="#CBD5E1"
                        />
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
              </View>

              <View style={dynamicStyles.modalActions}>
                <TouchableOpacity
                  style={[dynamicStyles.modalButton, dynamicStyles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setShowParentDropdown(false);
                    setEditMode(false);
                    resetCurrentItem();
                  }}
                >
                  <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.modalButton, dynamicStyles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={dynamicStyles.saveButtonText}>{editMode ? 'Update' : 'Create'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </AdminLayout>
  );
};

const getStyles = (responsive) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: getResponsiveValue(12, 16, 20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(spacing.lg, spacing.xl, spacing.xl),
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: getResponsiveFontSize(15),
  },
  headerSection: {
    flexDirection: responsive.isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: responsive.isMobile ? 'flex-start' : 'flex-start',
    marginBottom: getResponsiveValue(spacing.lg, spacing.xl, spacing.xl),
    paddingBottom: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    gap: responsive.isMobile ? spacing.md : 0,
  },
  headerTextContainer: {
    flex: responsive.isMobile ? 1 : undefined,
  },
  pageTitle: {
    ...typography.h3,
    color: '#1A202C',
    marginBottom: spacing.xs,
    fontWeight: '700',
    fontSize: getResponsiveFontSize(28),
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    ...typography.body2,
    color: '#64748B',
    fontSize: getResponsiveFontSize(14),
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: getResponsiveValue(spacing.sm + 2, spacing.sm + 4, spacing.sm + 4),
    paddingHorizontal: getResponsiveValue(spacing.md, spacing.lg + 2, spacing.lg + 4),
    borderRadius: borderRadius.md + 2,
    ...shadows.sm,
    gap: spacing.xs + 2,
    elevation: 3,
    alignSelf: responsive.isMobile ? 'stretch' : 'flex-start',
  },
  addButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: getResponsiveFontSize(15),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg + 2,
    paddingHorizontal: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    paddingVertical: getResponsiveValue(spacing.sm, spacing.md, spacing.md),
    marginBottom: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...shadows.sm,
    elevation: 2,
  },
  searchIcon: {
    marginRight: getResponsiveValue(spacing.sm, spacing.md, spacing.md),
    color: '#94A3B8',
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    ...typography.body1,
    color: colors.text,
    fontSize: getResponsiveFontSize(16),
    fontWeight: '400',
  },
  statsBar: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    marginBottom: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    borderWidth: 0,
    ...shadows.sm,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statsText: {
    ...typography.body1,
    color: '#1A202C',
    fontWeight: '700',
    fontSize: getResponsiveFontSize(16),
    letterSpacing: 0.2,
  },
  listContainer: {
    flex: 1,
  },
  listWrapper: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg + 2,
    padding: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    borderWidth: 0,
    ...shadows.md,
    elevation: 3,
  },
  listItem: {
    flexDirection: responsive.isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: responsive.isMobile ? 'flex-start' : 'center',
    paddingVertical: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    paddingHorizontal: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    marginBottom: getResponsiveValue(spacing.sm, spacing.md, spacing.md),
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.xs,
    elevation: 1,
    gap: responsive.isMobile ? spacing.sm : 0,
  },
  itemContent: {
    flex: 1,
    paddingRight: responsive.isMobile ? 0 : spacing.md,
    width: responsive.isMobile ? '100%' : undefined,
  },
  itemName: {
    ...typography.body1,
    color: '#1A202C',
    fontWeight: '700',
    fontSize: getResponsiveFontSize(16),
    letterSpacing: -0.2,
    marginBottom: spacing.sm,
  },
  parentInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginTop: spacing.xs,
    flexWrap: responsive.isMobile ? 'wrap' : 'nowrap',
  },
  parentLabel: {
    ...typography.caption,
    color: '#64748B',
    fontSize: getResponsiveFontSize(12),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  parentValue: {
    ...typography.caption,
    color: colors.primary,
    fontSize: getResponsiveFontSize(13),
    fontWeight: '700',
  },
  parentValueEmpty: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: getResponsiveFontSize(13),
    fontWeight: '500',
    fontStyle: 'italic',
  },
  itemSubtext: {
    ...typography.caption,
    color: '#64748B',
    marginTop: spacing.xs,
    fontSize: getResponsiveFontSize(13),
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignSelf: responsive.isMobile ? 'flex-end' : 'auto',
    marginTop: responsive.isMobile ? spacing.sm : 0,
  },
  editButton: {
    padding: getResponsiveValue(spacing.sm, spacing.sm + 2, spacing.sm + 2),
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    ...shadows.xs,
    elevation: 1,
  },
  deleteButton: {
    padding: getResponsiveValue(spacing.sm, spacing.sm + 2, spacing.sm + 2),
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    ...shadows.xs,
    elevation: 1,
  },
  emptyState: {
    paddingVertical: getResponsiveValue(spacing.xl, spacing.xxl * 1.5, spacing.xxl * 1.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateIconContainer: {
    width: getResponsiveValue(100, 140, 140),
    height: getResponsiveValue(100, 140, 140),
    borderRadius: borderRadius.full,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    ...typography.h5,
    color: '#1A202C',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontWeight: '700',
    fontSize: getResponsiveFontSize(20),
  },
  emptyStateSubtext: {
    ...typography.body2,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: getResponsiveValue(spacing.md, spacing.xl, spacing.xl),
    fontSize: getResponsiveFontSize(14),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(16, 24, 32),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveValue(20, 24, 28),
    padding: 0,
    width: '100%',
    maxWidth: getResponsiveValue('100%', 600, 680),
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 25,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    }),
  },
  modalTitle: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 0,
    letterSpacing: -0.3,
    flex: 1,
    paddingRight: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: getResponsiveValue(20, 24, 28),
    borderTopRightRadius: getResponsiveValue(20, 24, 28),
    paddingHorizontal: getResponsiveValue(spacing.lg, 32, 44),
    paddingTop: getResponsiveValue(spacing.lg, 32, 44),
    paddingBottom: getResponsiveValue(spacing.md, 20, 24),
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  modalCloseButton: {
    width: getResponsiveValue(36, 40, 40),
    height: getResponsiveValue(36, 40, 40),
    borderRadius: getResponsiveValue(18, 20, 20),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }),
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalBody: {
    padding: getResponsiveValue(spacing.lg, 32, 44),
    maxHeight: '60vh',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      maxHeight: 'calc(85vh - 200px)',
    }),
  },
  modalFieldsContainer: {
    maxHeight: getResponsiveValue(300, 400, 500),
    marginBottom: 0,
    ...(Platform.OS === 'web' && {
      maxHeight: 'calc(88vh - 380px)',
    }),
  },
  fieldContainer: {
    marginBottom: getResponsiveValue(spacing.lg, spacing.xl, spacing.xl),
    position: 'relative',
    zIndex: 10,
  },
  fieldContainerDropdownOpen: {
    zIndex: 1000,
    position: 'relative',
  },
  fieldLabel: {
    color: '#334155',
    fontWeight: '600',
    marginBottom: getResponsiveValue(8, 10, 12),
    fontSize: getResponsiveFontSize(13),
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  requiredStar: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(14),
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: getResponsiveValue(12, 14, 16),
    paddingHorizontal: getResponsiveValue(spacing.md, 18, 20),
    color: '#1A202C',
    fontSize: getResponsiveFontSize(16),
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    }),
    fontWeight: '400',
  },
  multilineInput: {
    minHeight: getResponsiveValue(100, 120, 140),
    textAlignVertical: 'top',
    paddingTop: spacing.md + 6,
    lineHeight: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: getResponsiveValue(spacing.md, spacing.lg, spacing.lg + 4),
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md + 4,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  modalActions: {
    flexDirection: 'row',
    gap: getResponsiveValue(spacing.md, 18, 22),
    padding: getResponsiveValue(spacing.lg, 32, 44),
    paddingTop: getResponsiveValue(spacing.md, 20, 26),
    borderTopWidth: 2,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FAFBFC',
    borderBottomLeftRadius: getResponsiveValue(20, 24, 28),
    borderBottomRightRadius: getResponsiveValue(20, 24, 28),
  },
  modalButton: {
    flex: 1,
    paddingVertical: getResponsiveValue(14, 16, 18),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }),
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  cancelButtonText: {
    ...typography.button,
    color: '#64748B',
    fontSize: getResponsiveFontSize(15),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  saveButton: {
    backgroundColor: colors.primary,
    ...shadows.md,
    elevation: 4,
    borderWidth: 0,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: getResponsiveFontSize(15),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  subItemsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: '#F1F5F9',
  },
  subItemsLabel: {
    ...typography.caption,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: getResponsiveFontSize(11),
  },
  subItemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  subItemText: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: getResponsiveValue(spacing.sm, spacing.md, spacing.md),
    paddingVertical: spacing.xs + 4,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    fontWeight: '600',
    fontSize: getResponsiveFontSize(12),
    letterSpacing: 0.2,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: getResponsiveValue(12, 14, 16),
    paddingHorizontal: getResponsiveValue(spacing.md, 18, 20),
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    }),
    minHeight: getResponsiveValue(48, 52, 56),
    zIndex: 10,
  },
  dropdownButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.15)',
    } : {
      elevation: 3,
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    }),
    borderWidth: 2.5,
    zIndex: 10,
  },
  dropdownButtonText: {
    color: '#0F172A',
    flex: 1,
    fontSize: getResponsiveFontSize(16),
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#2563EB',
    borderRadius: 12,
    marginTop: 6,
    maxHeight: getResponsiveValue(240, 280, 320),
    minHeight: 60,
    zIndex: 10000,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
    } : {
      elevation: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    }),
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(37, 99, 235, 0.2)',
    }),
  },
  dropdownScroll: {
    maxHeight: getResponsiveValue(240, 280, 320),
    ...(Platform.OS === 'web' && {
      maxHeight: 320,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getResponsiveValue(12, 14, 16),
    paddingHorizontal: getResponsiveValue(spacing.md, 18, 20),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    minHeight: getResponsiveValue(48, 52, 56),
    backgroundColor: '#FFFFFF',
  },
  dropdownItemSelected: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    paddingLeft: 20,
    borderBottomColor: '#DBEAFE',
    borderRightWidth: 2,
    borderRightColor: '#DBEAFE',
  },
  dropdownItemText: {
    color: '#1A202C',
    flex: 1,
    fontSize: getResponsiveFontSize(15),
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  dropdownItemTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: getResponsiveFontSize(15),
  },
});

export default MasterDataScreen;

