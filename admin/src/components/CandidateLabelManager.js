import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const CANDIDATE_LABELS = [
  { id: 'premium', label: 'Premium Candidate', color: '#FFD700', icon: 'star' },
  { id: 'starred', label: 'Starred Candidate', color: '#FFA500', icon: 'star-outline' },
  { id: 'featured', label: 'Featured Candidate', color: '#9C27B0', icon: 'ribbon' },
  { id: 'actively_searching', label: 'Actively Job Searching', color: '#4CAF50', icon: 'search' },
  { id: 'urgent', label: 'Urgent Candidate', color: '#F44336', icon: 'alert-circle' },
  { id: 'profile_booster', label: 'Profile Booster', color: '#2196F3', icon: 'trending-up' }
];

const CandidateLabelManager = ({ candidateId, currentLabels = [], onLabelsUpdate, visible, onClose }) => {
  const [selectedLabels, setSelectedLabels] = useState(currentLabels);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedLabels(currentLabels);
    }
  }, [visible, currentLabels]);

  const toggleLabel = (labelId) => {
    setSelectedLabels(prev => {
      if (prev.includes(labelId)) {
        return prev.filter(id => id !== labelId);
      } else {
        return [...prev, labelId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('adminToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const response = await fetch(`${API_URL}/candidates/${candidateId}/labels`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ labels: selectedLabels })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Candidate labels updated successfully');
        if (onLabelsUpdate) {
          onLabelsUpdate(selectedLabels);
        }
        onClose();
      } else {
        Alert.alert('Error', data.message || 'Failed to update labels');
      }
    } catch (error) {
      console.error('Update labels error:', error);
      Alert.alert('Error', 'Failed to update labels');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Manage Candidate Labels</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.labelsContainer}>
            <Text style={styles.instructionText}>
              Select labels to categorize this candidate:
            </Text>

            {CANDIDATE_LABELS.map((label) => {
              const isSelected = selectedLabels.includes(label.id);
              return (
                <TouchableOpacity
                  key={label.id}
                  style={[
                    styles.labelOption,
                    isSelected && { ...styles.labelOptionSelected, borderColor: label.color }
                  ]}
                  onPress={() => toggleLabel(label.id)}
                >
                  <View style={styles.labelOptionLeft}>
                    <View style={[styles.labelIconContainer, { backgroundColor: label.color + '20' }]}>
                      <Ionicons name={label.icon} size={24} color={label.color} />
                    </View>
                    <Text style={[styles.labelOptionText, isSelected && styles.labelOptionTextSelected]}>
                      {label.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={label.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Labels</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    padding: 4
  },
  labelsContainer: {
    padding: 20,
    maxHeight: 400
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16
  },
  labelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  labelOptionSelected: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2
  },
  labelOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  labelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  labelOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  labelOptionTextSelected: {
    fontWeight: '600',
    color: '#000'
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600'
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center'
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc'
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600'
  }
});

export { CANDIDATE_LABELS };
export default CandidateLabelManager;
