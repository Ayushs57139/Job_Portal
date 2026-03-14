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

  // Always use ScrollView for consistent scrolling behavior
  const OptionsListComponent = ScrollView;
  const optionsListProps = { 
    style: styles.optionsList, 
    showsVerticalScrollIndicator: true,
    nestedScrollEnabled: true
  };

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
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContentWrapper}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label || 'Select an option'}</Text>
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

            <OptionsListComponent {...optionsListProps}>
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
                    <View style={styles.checkmarkContainer}>
                      <Ionicons name="checkmark-circle" size={22} color="#1976D2" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {filteredOptions.length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search-outline" size={48} color={colors.textLight} />
                  <Text style={styles.noResultsText}>No results found</Text>
                </View>
              )}
            </OptionsListComponent>
            </View>
          </View>
        </TouchableOpacity>
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
    paddingBottom: spacing.md,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginVertical: 2,
    backgroundColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#DBECFC',
  },
  optionText: {
    fontSize: 15,
    color: '#323232',
    fontWeight: '400',
    letterSpacing: -0.15,
  },
  optionTextSelected: {
    color: '#1565C0',
    fontWeight: '500',
  },
  checkmarkContainer: {
    marginLeft: spacing.sm,
    marginRight: 2,
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
});

export default DropdownField;

