import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

const WeekDaysField = ({ 
  label, 
  value = [], 
  onSelect, 
  error,
  required = false,
  disabled = false,
  multiSelect = true
}) => {
  const weekDays = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' },
  ];

  const handleToggle = (day) => {
    if (disabled) return;

    if (multiSelect) {
      const isSelected = value.includes(day.value);
      if (isSelected) {
        onSelect(value.filter(v => v !== day.value));
      } else {
        onSelect([...value, day.value]);
      }
    } else {
      onSelect([day.value]);
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
      
      <View style={styles.daysContainer}>
        {weekDays.map((day) => {
          const isSelected = value.includes(day.value);
          return (
            <TouchableOpacity
              key={day.value}
              style={[
                styles.dayButton,
                isSelected && styles.dayButtonSelected,
                error && !isSelected && styles.dayButtonError,
                disabled && styles.dayButtonDisabled
              ]}
              onPress={() => handleToggle(day)}
              disabled={disabled}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.dayTextSelected
              ]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
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
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayButton: {
    flex: 1,
    minWidth: 45,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayButtonError: {
    borderColor: colors.error,
  },
  dayButtonDisabled: {
    opacity: 0.5,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: colors.textWhite,
    fontWeight: '600',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default WeekDaysField;

