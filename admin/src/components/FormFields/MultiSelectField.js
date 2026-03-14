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
  const [showAddNew, setShowAddNew] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');
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

  const handleAddNew = async () => {
    if (newOptionText.trim() && onAddNew) {
      if (typeof onAddNew === 'function' && onAddNew.constructor.name === 'AsyncFunction') {
        await onAddNew(newOptionText.trim());
      } else {
        onAddNew(newOptionText.trim());
      }
      setNewOptionText('');
      setShowAddNew(false);
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
        statusBarTranslucent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContentWrapper}>
            <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
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
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
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
                placeholderTextColor={colors.textLight}
              />
              {isSearching && (
                <Text style={styles.searchingText}>Searching...</Text>
              )}
            </View>

            {allowAddNew && (
              <TouchableOpacity
                style={styles.addNewButton}
                onPress={() => setShowAddNew(!showAddNew)}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.addNewButtonText}>Add New Option</Text>
              </TouchableOpacity>
            )}

            {showAddNew && (
              <View style={styles.addNewContainer}>
                <TextInput
                  style={styles.addNewInput}
                  placeholder="Enter new option"
                  value={newOptionText}
                  onChangeText={setNewOptionText}
                  placeholderTextColor={colors.textLight}
                />
                <TouchableOpacity style={styles.addNewSubmit} onPress={handleAddNew}>
                  <Text style={styles.addNewSubmitText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView 
              style={styles.optionsList}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
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
                      isDisabled && styles.optionDisabled
                    ]}
                    onPress={() => handleToggle(option)}
                    disabled={isDisabled}
                  >
                    <View style={styles.checkboxContainer}>
                      <View style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected
                      ]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color={colors.textWhite} />
                        )}
                      </View>
                      <Text style={[
                        styles.optionText,
                        isDisabled && styles.optionTextDisabled
                      ]}>
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {filteredOptions.length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search-outline" size={48} color={colors.textLight} />
                  <Text style={styles.noResultsText}>No results found</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContentWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212121',
    letterSpacing: -0.2,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#757575',
    marginTop: 4,
    fontWeight: '400',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: '#FAFBFC',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: '#E8EBED',
  },
  searchIcon: {
    marginRight: spacing.sm,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 2,
    fontSize: 14,
    color: '#2C2C2C',
    fontWeight: '400',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  addNewButtonText: {
    marginLeft: spacing.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  addNewContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  addNewInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  addNewSubmit: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
  },
  addNewSubmitText: {
    color: colors.textWhite,
    fontWeight: '600',
  },
  optionsList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    maxHeight: 320,
  },
  option: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginVertical: 2,
    backgroundColor: 'transparent',
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
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  optionText: {
    fontSize: 15,
    color: '#323232',
    fontWeight: '400',
    letterSpacing: -0.15,
  },
  optionTextDisabled: {
    color: '#9E9E9E',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 15,
    marginTop: spacing.md,
    fontWeight: '400',
  },
  modalFooter: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  doneButton: {
    backgroundColor: '#1976D2',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#1976D2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  searchingContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  searchingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default MultiSelectField;

