import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

const CheckboxField = ({ 
  label, 
  value, 
  onToggle, 
  error,
  disabled = false,
  description
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.checkboxContainer,
          disabled && styles.checkboxContainerDisabled
        ]}
        onPress={() => !disabled && onToggle(!value)}
        disabled={disabled}
      >
        <View style={[
          styles.checkbox,
          value && styles.checkboxChecked,
          error && styles.checkboxError
        ]}>
          {value && (
            <Ionicons name="checkmark" size={18} color={colors.textWhite} />
          )}
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainerDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxError: {
    borderColor: colors.error,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: 38,
  },
});

export default CheckboxField;

