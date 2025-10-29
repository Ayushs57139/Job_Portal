import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

const DropdownField = ({ 
  label, 
  value, 
  options = [], 
  onSelect, 
  placeholder = 'Select an option',
  error,
  required = false,
  icon,
  allowAddNew = false,
  onAddNew,
  disabled = false
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option) => {
    onSelect(option);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleAddNew = () => {
    if (newOptionText.trim() && onAddNew) {
      onAddNew(newOptionText.trim());
      setNewOptionText('');
      setShowAddNew(false);
      setModalVisible(false);
    }
  };

  const displayValue = value ? (typeof value === 'object' ? value.label : value) : placeholder;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
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
            color={value ? colors.text : colors.textLight}
            style={styles.icon}
          />
        )}
        <Text style={[
          styles.dropdownText,
          !value && styles.placeholderText
        ]}>
          {displayValue}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

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
              <Text style={styles.modalTitle}>{label || 'Select an option'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.textLight}
              />
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
              {filteredOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.value || index}
                  style={[
                    styles.option,
                    value?.value === option.value && styles.optionSelected
                  ]}
                  onPress={() => handleSelect(option)}
                >
                  <Text style={[
                    styles.optionText,
                    value?.value === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {value?.value === option.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
              {filteredOptions.length === 0 && (
                <Text style={styles.noResultsText}>No results found</Text>
              )}
            </ScrollView>
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
    paddingBottom: spacing.xl,
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
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionSelected: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: 2,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  noResultsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: spacing.xl,
  },
});

export default DropdownField;

