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
                <Text style={styles.modalTitle}>{label || 'Select an option'}</Text>
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
                  placeholder="Search..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {allowAddNew && (
                <TouchableOpacity
                  style={styles.addNewButton}
                  onPress={() => setShowAddNew(!showAddNew)}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#4f46e5" />
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
                    placeholderTextColor="#94a3b8"
                  />
                  <TouchableOpacity style={styles.addNewSubmit} onPress={handleAddNew}>
                    <Text style={styles.addNewSubmitText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}

              <ScrollView 
                style={styles.optionsList}
                nestedScrollEnabled
                showsVerticalScrollIndicator={true}
              >
                {filteredOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.value || index}
                    style={[
                      styles.option,
                      value?.value === option.value && styles.optionSelected
                    ]}
                    onPress={() => handleSelect(option)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      value?.value === option.value && styles.optionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                    {value?.value === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color="#4f46e5" />
                    )}
                  </TouchableOpacity>
                ))}
                {filteredOptions.length === 0 && (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>No results found</Text>
                  </View>
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
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
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
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  addNewButtonText: {
    marginLeft: spacing.sm,
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 14,
  },
  addNewContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  addNewInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addNewSubmit: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addNewSubmitText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  optionsList: {
    maxHeight: 300,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  optionText: {
    fontSize: 15,
    color: '#1e293b',
    flex: 1,
  },
  optionTextSelected: {
    color: '#4f46e5',
    fontWeight: '600',
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
});

export default DropdownField;

