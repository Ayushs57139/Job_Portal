import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

const AutoCompleteField = ({ 
  label, 
  value, 
  suggestions = [], 
  onChangeText,
  onSelect,
  placeholder = 'Type or select',
  error,
  required = false,
  icon,
  allowAddNew = false,
  onAddNew,
  disabled = false,
  multiline = false,
  numberOfLines = 1
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = value
    ? suggestions.filter(suggestion =>
        suggestion.label.toLowerCase().includes(value.toLowerCase())
      )
    : suggestions.slice(0, 10); // Show first 10 suggestions when empty

  const handleSelect = (suggestion) => {
    if (onSelect) {
      onSelect(suggestion);
    } else {
      onChangeText(suggestion.label);
    }
    setShowSuggestions(false);
  };

  const handleChangeText = (text) => {
    onChangeText(text);
    setShowSuggestions(true);
  };

  const handleAddNew = () => {
    if (value.trim() && onAddNew) {
      onAddNew(value.trim());
      setShowSuggestions(false);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? colors.primary : colors.textSecondary}
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            isFocused && styles.inputFocused,
            error && styles.inputError,
            multiline && styles.inputMultiline,
          ]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay to allow suggestion click
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            style={styles.suggestionsList}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={suggestion.value || index}
                style={styles.suggestionItem}
                onPress={() => handleSelect(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion.label}</Text>
              </TouchableOpacity>
            ))}
            {allowAddNew && value && !filteredSuggestions.some(s => s.label.toLowerCase() === value.toLowerCase()) && (
              <TouchableOpacity
                style={styles.addNewSuggestion}
                onPress={handleAddNew}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.addNewSuggestionText}>Add "{value}"</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    zIndex: 1,
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
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  icon: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.md,
    zIndex: 1,
  },
  suggestionsContainer: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    maxHeight: 200,
    ...StyleSheet.absoluteFillObject,
    top: 'auto',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  suggestionText: {
    fontSize: 15,
    color: colors.text,
  },
  addNewSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.borderLight,
    gap: spacing.sm,
  },
  addNewSuggestionText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default AutoCompleteField;

