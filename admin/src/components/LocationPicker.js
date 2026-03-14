import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const LocationPicker = ({ value, onChange, placeholder = 'Select Location', style }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(value || null);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchLocations();
    } else {
      setLocations([]);
    }
  }, [searchQuery]);

  const searchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/locations/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (location) => {
    const formatted = location.fullLocation || `${location.district}, ${location.city}, ${location.state}, ${location.country}`;
    setSelectedLocation(formatted);
    onChange(formatted);
    setShowModal(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSelectedLocation(null);
    onChange('');
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="location-outline" size={20} color="#666" />
        <Text style={[styles.inputText, !selectedLocation && styles.placeholder]}>
          {selectedLocation || placeholder}
        </Text>
        {selectedLocation && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close-outline" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by district, city, or state..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
              </View>
            ) : locations.length > 0 ? (
              <FlatList
                data={locations}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.locationItem}
                    onPress={() => handleSelectLocation(item)}
                  >
                    <Ionicons name="location-outline" size={20} color="#4A90E2" />
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationText}>{item.fullLocation}</Text>
                      <Text style={styles.locationSubtext}>
                        {item.district}, {item.city}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                style={styles.locationsList}
              />
            ) : searchQuery.length >= 2 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>No locations found</Text>
                <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="location-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>Start typing to search</Text>
                <Text style={styles.emptySubtext}>Enter at least 2 characters</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF',
    gap: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  clearButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  locationsList: {
    maxHeight: 400,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 5,
  },
});

export default LocationPicker;
