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
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
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
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
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

            <ScrollView style={styles.optionsList}>
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
                <Text style={styles.noResultsText}>No results found</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h5,
    color: colors.text,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
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
    maxHeight: 400,
  },
  option: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextDisabled: {
    color: colors.textLight,
  },
  noResultsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: spacing.xl,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  doneButtonText: {
    color: colors.textWhite,
    fontWeight: '600',
    fontSize: 16,
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

