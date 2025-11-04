import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, Switch } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminHomepageScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [modalVisible, setModalVisible] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    backgroundColor: '#4A90E2',
    textColor: '#FFFFFF'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/homepage/config`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch homepage config');
      }
      
      const data = await response.json();
      setConfig(data.config);
    } catch (error) {
      console.error('Error fetching config:', error);
      Alert.alert('Error', 'Failed to fetch homepage configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/homepage/config`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update config');
      }

      const data = await response.json();
      setConfig(data.config);
      Alert.alert('Success', 'Homepage configuration updated successfully');
    } catch (error) {
      console.error('Error updating config:', error);
      Alert.alert('Error', 'Failed to update homepage configuration');
    }
  };

  const handleAddBanner = async () => {
    if (!bannerForm.title || !bannerForm.description) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/homepage/banners`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bannerForm)
      });

      if (!response.ok) {
        throw new Error('Failed to add banner');
      }

      const data = await response.json();
      setConfig(data.config);
      setModalVisible(false);
      setBannerForm({
        title: '',
        description: '',
        imageUrl: '',
        buttonText: '',
        buttonLink: '',
        backgroundColor: '#4A90E2',
        textColor: '#FFFFFF'
      });
      Alert.alert('Success', 'Banner added successfully');
    } catch (error) {
      console.error('Error adding banner:', error);
      Alert.alert('Error', 'Failed to add banner');
    }
  };

  const handleDeleteBanner = async (index) => {
    Alert.alert(
      'Delete Banner',
      'Are you sure you want to delete this banner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              const response = await fetch(`${API_URL}/admin/homepage/banners/${index}`, {
                method: 'DELETE',
                headers
              });

              if (!response.ok) {
                throw new Error('Failed to delete banner');
              }

              const data = await response.json();
              setConfig(data.config);
              Alert.alert('Success', 'Banner deleted successfully');
            } catch (error) {
              console.error('Error deleting banner:', error);
              Alert.alert('Error', 'Failed to delete banner');
            }
          }
        }
      ]
    );
  };

  const updateHero = (field, value) => {
    setConfig(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  const updateSection = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: {
          ...prev.sections[section],
          [field]: value
        }
      }
    }));
  };

  const updateStat = (stat, field, value) => {
    setConfig(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: {
          ...prev.stats[stat],
          [field]: value
        }
      }
    }));
  };

  const saveHeroSection = () => {
    updateConfig({ hero: config.hero });
  };

  const saveSections = () => {
    updateConfig({ sections: config.sections });
  };

  const saveStats = () => {
    updateConfig({ stats: config.stats });
  };

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  if (loading || !config) {
    return (
      <AdminLayout title="Homepage" activeScreen="AdminHomepage" onNavigate={handleNavigate} onLogout={handleLogout}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Homepage" activeScreen="AdminHomepage" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>Homepage Management</Text>
            <Text style={styles.pageSubtitle}>Manage homepage content, banners, and sections</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'hero' && styles.activeTab]}
              onPress={() => setActiveTab('hero')}
            >
              <Ionicons name="star" size={20} color={activeTab === 'hero' ? '#4A90E2' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'hero' && styles.activeTabText]}>Hero Section</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'banners' && styles.activeTab]}
              onPress={() => setActiveTab('banners')}
            >
              <Ionicons name="images" size={20} color={activeTab === 'banners' ? '#4A90E2' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'banners' && styles.activeTabText]}>Banners</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'sections' && styles.activeTab]}
              onPress={() => setActiveTab('sections')}
            >
              <Ionicons name="grid" size={20} color={activeTab === 'sections' ? '#4A90E2' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'sections' && styles.activeTabText]}>Sections</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
              onPress={() => setActiveTab('stats')}
            >
              <Ionicons name="stats-chart" size={20} color={activeTab === 'stats' ? '#4A90E2' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>Statistics</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Section Tab */}
          {activeTab === 'hero' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Hero Section Settings</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Hero Title</Text>
                <TextInput
                  style={styles.input}
                  value={config.hero.title}
                  onChangeText={(text) => updateHero('title', text)}
                  placeholder="Enter hero title"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Hero Subtitle</Text>
                <TextInput
                  style={styles.input}
                  value={config.hero.subtitle}
                  onChangeText={(text) => updateHero('subtitle', text)}
                  placeholder="Enter hero subtitle"
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.label}>Show Search Bar</Text>
                  <Switch
                    value={config.hero.showSearchBar}
                    onValueChange={(value) => updateHero('showSearchBar', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveHeroSection}>
                <Ionicons name="save" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>Save Hero Section</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Banners Tab */}
          {activeTab === 'banners' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Manage Banners</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                  <Text style={styles.addButtonText}>Add Banner</Text>
                </TouchableOpacity>
              </View>

              {config.banners && config.banners.length > 0 ? (
                config.banners.map((banner, index) => (
                  <View key={index} style={styles.bannerCard}>
                    <View style={styles.bannerHeader}>
                      <Text style={styles.bannerTitle}>{banner.title}</Text>
                      <TouchableOpacity onPress={() => handleDeleteBanner(index)}>
                        <Ionicons name="trash" size={20} color="#E74C3C" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.bannerDescription}>{banner.description}</Text>
                    {banner.imageUrl && (
                      <Text style={styles.bannerInfo}>Image: {banner.imageUrl}</Text>
                    )}
                    <View style={styles.bannerMeta}>
                      <View style={[styles.colorBox, { backgroundColor: banner.backgroundColor }]} />
                      <Text style={styles.bannerMetaText}>Order: {banner.order + 1}</Text>
                      <View style={styles.enabledBadge}>
                        <Text style={styles.enabledText}>{banner.enabled ? 'Enabled' : 'Disabled'}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="images-outline" size={64} color="#CCC" />
                  <Text style={styles.emptyText}>No banners added yet</Text>
                </View>
              )}
            </View>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Manage Homepage Sections</Text>

              {/* Latest Jobs Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <Text style={styles.sectionCardTitle}>Latest Jobs</Text>
                  <Switch
                    value={config.sections.latestJobs.enabled}
                    onValueChange={(value) => updateSection('latestJobs', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Title</Text>
                  <TextInput
                    style={styles.input}
                    value={config.sections.latestJobs.title}
                    onChangeText={(text) => updateSection('latestJobs', 'title', text)}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Subtitle</Text>
                  <TextInput
                    style={styles.input}
                    value={config.sections.latestJobs.subtitle}
                    onChangeText={(text) => updateSection('latestJobs', 'subtitle', text)}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Display Limit</Text>
                  <TextInput
                    style={styles.input}
                    value={String(config.sections.latestJobs.limit)}
                    onChangeText={(text) => updateSection('latestJobs', 'limit', parseInt(text) || 6)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Top Companies Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <Text style={styles.sectionCardTitle}>Top Companies</Text>
                  <Switch
                    value={config.sections.topCompanies.enabled}
                    onValueChange={(value) => updateSection('topCompanies', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Title</Text>
                  <TextInput
                    style={styles.input}
                    value={config.sections.topCompanies.title}
                    onChangeText={(text) => updateSection('topCompanies', 'title', text)}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Subtitle</Text>
                  <TextInput
                    style={styles.input}
                    value={config.sections.topCompanies.subtitle}
                    onChangeText={(text) => updateSection('topCompanies', 'subtitle', text)}
                  />
                </View>
              </View>

              {/* Career Blogs Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <Text style={styles.sectionCardTitle}>Career Blogs</Text>
                  <Switch
                    value={config.sections.careerBlogs.enabled}
                    onValueChange={(value) => updateSection('careerBlogs', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Title</Text>
                  <TextInput
                    style={styles.input}
                    value={config.sections.careerBlogs.title}
                    onChangeText={(text) => updateSection('careerBlogs', 'title', text)}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Subtitle</Text>
                  <TextInput
                    style={styles.input}
                    value={config.sections.careerBlogs.subtitle}
                    onChangeText={(text) => updateSection('careerBlogs', 'subtitle', text)}
                  />
                </View>
              </View>

              {/* Resume CTA Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <Text style={styles.sectionCardTitle}>Resume CTA</Text>
                  <Switch
                    value={config.sections.resumeCTA.enabled}
                    onValueChange={(value) => updateSection('resumeCTA', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Title</Text>
                  <TextInput
                    style={styles.input}
                    value={config.sections.resumeCTA.title}
                    onChangeText={(text) => updateSection('resumeCTA', 'title', text)}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Subtitle</Text>
                  <TextInput
                    style={styles.input}
                    value={config.sections.resumeCTA.subtitle}
                    onChangeText={(text) => updateSection('resumeCTA', 'subtitle', text)}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Button Text</Text>
                  <TextInput
                    style={styles.input}
                    value={config.sections.resumeCTA.buttonText}
                    onChangeText={(text) => updateSection('resumeCTA', 'buttonText', text)}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveSections}>
                <Ionicons name="save" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>Save Sections</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Homepage Statistics</Text>

              <View style={styles.statCard}>
                <View style={styles.switchRow}>
                  <Text style={styles.statLabel}>Total Jobs</Text>
                  <Switch
                    value={config.stats.totalJobs.enabled}
                    onValueChange={(value) => updateStat('totalJobs', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  value={config.stats.totalJobs.display}
                  onChangeText={(text) => updateStat('totalJobs', 'display', text)}
                  placeholder="e.g., 5 lakh+"
                />
              </View>

              <View style={styles.statCard}>
                <View style={styles.switchRow}>
                  <Text style={styles.statLabel}>Total Companies</Text>
                  <Switch
                    value={config.stats.totalCompanies.enabled}
                    onValueChange={(value) => updateStat('totalCompanies', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  value={config.stats.totalCompanies.display}
                  onChangeText={(text) => updateStat('totalCompanies', 'display', text)}
                  placeholder="e.g., 10,000+"
                />
              </View>

              <View style={styles.statCard}>
                <View style={styles.switchRow}>
                  <Text style={styles.statLabel}>Total Applicants</Text>
                  <Switch
                    value={config.stats.totalApplicants.enabled}
                    onValueChange={(value) => updateStat('totalApplicants', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  value={config.stats.totalApplicants.display}
                  onChangeText={(text) => updateStat('totalApplicants', 'display', text)}
                  placeholder="e.g., 1 million+"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveStats}>
                <Ionicons name="save" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>Save Statistics</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Banner Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Banner</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={bannerForm.title}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, title: text })}
                  placeholder="Enter banner title"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bannerForm.description}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, description: text })}
                  placeholder="Enter banner description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  value={bannerForm.imageUrl}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, imageUrl: text })}
                  placeholder="Enter image URL"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Button Text</Text>
                <TextInput
                  style={styles.input}
                  value={bannerForm.buttonText}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, buttonText: text })}
                  placeholder="e.g., Learn More"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Button Link</Text>
                <TextInput
                  style={styles.input}
                  value={bannerForm.buttonLink}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, buttonLink: text })}
                  placeholder="e.g., /jobs"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Background Color</Text>
                <TextInput
                  style={styles.input}
                  value={bannerForm.backgroundColor}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, backgroundColor: text })}
                  placeholder="#4A90E2"
                />
              </View>

              <TouchableOpacity style={styles.modalButton} onPress={handleAddBanner}>
                <Text style={styles.modalButtonText}>Add Banner</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 5,
    marginBottom: 20,
    gap: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#4A90E2',
  },
  tabContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bannerCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bannerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bannerInfo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  bannerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorBox: {
    width: 30,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  bannerMetaText: {
    fontSize: 12,
    color: '#666',
  },
  enabledBadge: {
    backgroundColor: '#27AE60',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  enabledText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  sectionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AdminHomepageScreen;
