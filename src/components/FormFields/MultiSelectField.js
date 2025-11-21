import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

const MultiSelectField = ({ 
  label, 
  value = [], 
  options = [], 
  onSelect, 
  placeholder = 'Select options',
  error,
  required = false,
  icon,
  maxSelections,
  allowAddNew = false,
  onAddNew,
  disabled = false,
  onSearch = null // New prop for async search
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState(options);

  // Update dynamic options when options prop changes
  useEffect(() => {
    setDynamicOptions(options);
  }, [options]);

  const filteredOptions = searchQuery
    ? dynamicOptions.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dynamicOptions;

  const handleToggle = (option) => {
    const isSelected = value.some(v => v.value === option.value);
    
    if (isSelected) {
      onSelect(value.filter(v => v.value !== option.value));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      onSelect([...value, option]);
    }
  };

  const handleRemove = (optionToRemove) => {
    onSelect(value.filter(v => v.value !== optionToRemove.value));
  };

  const handleAddNew = async (newValue) => {
    if (newValue && newValue.trim() && onAddNew) {
      try {
        const trimmedValue = newValue.trim();
        
        // Call the onAddNew callback (which will add to options, call API, and select the item)
        if (typeof onAddNew === 'function' && onAddNew.constructor.name === 'AsyncFunction') {
          await onAddNew(trimmedValue);
        } else {
          onAddNew(trimmedValue);
        }
        
        // Wait a moment for the parent to update options and value
        // Then refresh dynamicOptions to include the newly added option
        setTimeout(() => {
          setDynamicOptions(options);
        }, 100);
        
        setSearchQuery(''); // Clear search after adding
      } catch (error) {
        console.error('Error adding new option:', error);
      }
    }
  };

  const displayText = value.length > 0 
    ? `${value.length} selected` 
    : placeholder;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
          {maxSelections && <Text style={styles.maxText}> (Max {maxSelections})</Text>}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.dropdown,
          error && styles.dropdownError,
          disabled && styles.dropdownDisabled
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={value.length > 0 ? colors.text : colors.textLight}
            style={styles.icon}
          />
        )}
        <Text style={[
          styles.dropdownText,
          value.length === 0 && styles.placeholderText
        ]}>
          {displayText}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {value.length > 0 && (
        <View style={styles.selectedContainer}>
          {value.map((item, index) => (
            <View key={item.value || index} style={styles.selectedItem}>
              <Text style={styles.selectedItemText}>{item.label}</Text>
              <TouchableOpacity onPress={() => handleRemove(item)}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>{label || 'Select options'}</Text>
                {maxSelections && (
                  <Text style={styles.modalSubtitle}>
                    {value.length} of {maxSelections} selected
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search options..."
                value={searchQuery}
                onChangeText={async (text) => {
                  setSearchQuery(text);
                  // Trigger async search if provided
                  if (onSearch && text.length >= 2) {
                    setIsSearching(true);
                    try {
                      const results = await onSearch(text);
                      if (results && Array.isArray(results)) {
                        setDynamicOptions(results);
                      }
                    } catch (error) {
                      console.error('Search error:', error);
                    } finally {
                      setIsSearching(false);
                    }
                  } else if (text.length === 0) {
                    // Reset to original options when search is cleared
                    setDynamicOptions(options);
                  }
                }}
                placeholderTextColor="#94a3b8"
              />
              {isSearching && (
                <Text style={styles.searchingText}>Searching...</Text>
              )}
            </View>

            <ScrollView 
              style={styles.optionsList}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              {isSearching && (
                <View style={styles.searchingContainer}>
                  <Text style={styles.searchingText}>Searching...</Text>
                </View>
              )}
              {filteredOptions.map((option, index) => {
                const isSelected = value.some(v => v.value === option.value);
                const isDisabled = maxSelections && value.length >= maxSelections && !isSelected;
                
                return (
                  <TouchableOpacity
                    key={option.value || index}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                      isDisabled && styles.optionDisabled
                    ]}
                    onPress={() => handleToggle(option)}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                  >
                    <View style={styles.checkboxContainer}>
                      <View style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected
                      ]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#ffffff" />
                        )}
                      </View>
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                        isDisabled && styles.optionTextDisabled
                      ]}>
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {/* Show add new option when search query doesn't match and allowAddNew is true */}
              {allowAddNew && searchQuery.trim() && filteredOptions.length === 0 && !isSearching && (
                <TouchableOpacity
                  style={styles.addNewOptionItem}
                  onPress={() => handleAddNew(searchQuery)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle" size={20} color="#4f46e5" />
                  <Text style={styles.addNewOptionText}>Add "{searchQuery}"</Text>
                </TouchableOpacity>
              )}
              {/* Show add new option when search query doesn't match existing options exactly */}
              {allowAddNew && searchQuery.trim() && filteredOptions.length > 0 && 
               !filteredOptions.some(opt => opt.label.toLowerCase() === searchQuery.toLowerCase()) && (
                <TouchableOpacity
                  style={styles.addNewOptionItem}
                  onPress={() => handleAddNew(searchQuery)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle" size={20} color="#4f46e5" />
                  <Text style={styles.addNewOptionText}>Add "{searchQuery}"</Text>
                </TouchableOpacity>
              )}
              {filteredOptions.length === 0 && !searchQuery.trim() && !isSearching && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No results found</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  maxText: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  dropdownError: {
    borderColor: colors.error,
  },
  dropdownDisabled: {
    backgroundColor: colors.borderLight,
    opacity: 0.6,
  },
  icon: {
    marginRight: spacing.sm,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textLight,
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  selectedItemText: {
    color: colors.textWhite,
    fontSize: 14,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: '#1e293b',
  },
  addNewOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.lg,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderStyle: 'dashed',
  },
  addNewOptionText: {
    marginLeft: spacing.sm,
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 15,
  },
  optionsList: {
    maxHeight: 300,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    borderRadius: 8,
    marginVertical: 2,
  },
  optionSelected: {
    backgroundColor: '#eef2ff',
    borderBottomColor: 'transparent',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxSelected: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  optionText: {
    fontSize: 15,
    color: '#1e293b',
    flex: 1,
  },
  optionTextSelected: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  optionTextDisabled: {
    color: '#94a3b8',
  },
  noResultsContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
  },
  modalFooter: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  doneButton: {
    backgroundColor: '#4f46e5',
    padding: spacing.md + 2,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  searchingContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  searchingText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
});

export default MultiSelectField;

