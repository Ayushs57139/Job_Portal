import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CANDIDATE_LABELS } from './CandidateLabelManager';

const CandidateLabels = ({ labels = [], style, compact = false }) => {
  if (!labels || labels.length === 0) {
    return null;
  }

  const activeLabels = CANDIDATE_LABELS.filter(label => labels.includes(label.id));

  if (activeLabels.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {activeLabels.map((label) => (
        <View
          key={label.id}
          style={[
            styles.labelBadge,
            { backgroundColor: label.color + '20', borderColor: label.color },
            compact && styles.labelBadgeCompact
          ]}
        >
          <Ionicons name={label.icon} size={compact ? 12 : 14} color={label.color} />
          <Text style={[styles.labelText, { color: label.color }, compact && styles.labelTextCompact]}>
            {label.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4
  },
  labelBadgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600'
  },
  labelTextCompact: {
    fontSize: 10
  }
});

export default CandidateLabels;
