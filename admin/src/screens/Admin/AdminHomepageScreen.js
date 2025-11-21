import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, Switch, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminHomepageScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
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
        <View style={dynamicStyles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Homepage" activeScreen="AdminHomepage" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.container}>
          <View style={dynamicStyles.headerSection}>
            <Text style={dynamicStyles.pageTitle}>Homepage Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage homepage content, banners, and sections</Text>
          </View>

          {/* Tabs */}
          <View style={dynamicStyles.tabs}>
            <TouchableOpacity
              style={[dynamicStyles.tab, activeTab === 'hero' && dynamicStyles.activeTab]}
              onPress={() => setActiveTab('hero')}
            >
              <Ionicons name="star" size={20} color={activeTab === 'hero' ? '#4A90E2' : '#666'} />
              <Text style={[dynamicStyles.tabText, activeTab === 'hero' && dynamicStyles.activeTabText]}>Hero Section</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.tab, activeTab === 'banners' && dynamicStyles.activeTab]}
              onPress={() => setActiveTab('banners')}
            >
              <Ionicons name="images" size={20} color={activeTab === 'banners' ? '#4A90E2' : '#666'} />
              <Text style={[dynamicStyles.tabText, activeTab === 'banners' && dynamicStyles.activeTabText]}>Banners</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.tab, activeTab === 'sections' && dynamicStyles.activeTab]}
              onPress={() => setActiveTab('sections')}
            >
              <Ionicons name="grid" size={20} color={activeTab === 'sections' ? '#4A90E2' : '#666'} />
              <Text style={[dynamicStyles.tabText, activeTab === 'sections' && dynamicStyles.activeTabText]}>Sections</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.tab, activeTab === 'stats' && dynamicStyles.activeTab]}
              onPress={() => setActiveTab('stats')}
            >
              <Ionicons name="stats-chart" size={20} color={activeTab === 'stats' ? '#4A90E2' : '#666'} />
              <Text style={[dynamicStyles.tabText, activeTab === 'stats' && dynamicStyles.activeTabText]}>Statistics</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Section Tab */}
          {activeTab === 'hero' && (
            <View style={dynamicStyles.tabContent}>
              <Text style={dynamicStyles.sectionTitle}>Hero Section Settings</Text>
              
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Hero Title</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={config.hero.title}
                  onChangeText={(text) => updateHero('title', text)}
                  placeholder="Enter hero title"
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Hero Subtitle</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={config.hero.subtitle}
                  onChangeText={(text) => updateHero('subtitle', text)}
                  placeholder="Enter hero subtitle"
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <View style={dynamicStyles.switchRow}>
                  <Text style={dynamicStyles.label}>Show Search Bar</Text>
                  <Switch
                    value={config.hero.showSearchBar}
                    onValueChange={(value) => updateHero('showSearchBar', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
              </View>

              <TouchableOpacity style={dynamicStyles.saveButton} onPress={saveHeroSection}>
                <Ionicons name="save" size={20} color="#FFF" />
                <Text style={dynamicStyles.saveButtonText}>Save Hero Section</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Banners Tab */}
          {activeTab === 'banners' && (
            <View style={dynamicStyles.tabContent}>
              <View style={dynamicStyles.sectionHeader}>
                <Text style={dynamicStyles.sectionTitle}>Manage Banners</Text>
                <TouchableOpacity
                  style={dynamicStyles.addButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                  <Text style={dynamicStyles.addButtonText}>Add Banner</Text>
                </TouchableOpacity>
              </View>

              {config.banners && config.banners.length > 0 ? (
                config.banners.map((banner, index) => (
                  <View key={index} style={dynamicStyles.bannerCard}>
                    <View style={dynamicStyles.bannerHeader}>
                      <Text style={dynamicStyles.bannerTitle}>{banner.title}</Text>
                      <TouchableOpacity onPress={() => handleDeleteBanner(index)}>
                        <Ionicons name="trash" size={20} color="#E74C3C" />
                      </TouchableOpacity>
                    </View>
                    <Text style={dynamicStyles.bannerDescription}>{banner.description}</Text>
                    {banner.imageUrl && (
                      <Text style={dynamicStyles.bannerInfo}>Image: {banner.imageUrl}</Text>
                    )}
                    <View style={dynamicStyles.bannerMeta}>
                      <View style={[dynamicStyles.colorBox, { backgroundColor: banner.backgroundColor }]} />
                      <Text style={dynamicStyles.bannerMetaText}>Order: {banner.order + 1}</Text>
                      <View style={dynamicStyles.enabledBadge}>
                        <Text style={dynamicStyles.enabledText}>{banner.enabled ? 'Enabled' : 'Disabled'}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={dynamicStyles.emptyState}>
                  <Ionicons name="images-outline" size={64} color="#CCC" />
                  <Text style={dynamicStyles.emptyText}>No banners added yet</Text>
                </View>
              )}
            </View>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <View style={dynamicStyles.tabContent}>
              <Text style={dynamicStyles.sectionTitle}>Manage Homepage Sections</Text>

              {/* Latest Jobs Section */}
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionCardHeader}>
                  <Text style={dynamicStyles.sectionCardTitle}>Latest Jobs</Text>
                  <Switch
                    value={config.sections.latestJobs.enabled}
                    onValueChange={(value) => updateSection('latestJobs', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>Title</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={config.sections.latestJobs.title}
                    onChangeText={(text) => updateSection('latestJobs', 'title', text)}
                  />
                </View>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>Subtitle</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={config.sections.latestJobs.subtitle}
                    onChangeText={(text) => updateSection('latestJobs', 'subtitle', text)}
                  />
                </View>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>Display Limit</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={String(config.sections.latestJobs.limit)}
                    onChangeText={(text) => updateSection('latestJobs', 'limit', parseInt(text) || 6)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Top Companies Section */}
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionCardHeader}>
                  <Text style={dynamicStyles.sectionCardTitle}>Top Companies</Text>
                  <Switch
                    value={config.sections.topCompanies.enabled}
                    onValueChange={(value) => updateSection('topCompanies', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>Title</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={config.sections.topCompanies.title}
                    onChangeText={(text) => updateSection('topCompanies', 'title', text)}
                  />
                </View>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>Subtitle</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={config.sections.topCompanies.subtitle}
                    onChangeText={(text) => updateSection('topCompanies', 'subtitle', text)}
                  />
                </View>
              </View>

              {/* Career Blogs Section */}
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionCardHeader}>
                  <Text style={dynamicStyles.sectionCardTitle}>Career Blogs</Text>
                  <Switch
                    value={config.sections.careerBlogs.enabled}
                    onValueChange={(value) => updateSection('careerBlogs', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>Title</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={config.sections.careerBlogs.title}
                    onChangeText={(text) => updateSection('careerBlogs', 'title', text)}
                  />
                </View>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>Subtitle</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={config.sections.careerBlogs.subtitle}
                    onChangeText={(text) => updateSection('careerBlogs', 'subtitle', text)}
                  />
                </View>
              </View>

              {/* Resume CTA Section */}
              <View style={dynamicStyles.sectionCard}>
                <View style={dynamicStyles.sectionCardHeader}>
                  <Text style={dynamicStyles.sectionCardTitle}>Resume CTA</Text>
                  <Switch
                    value={config.sections.resumeCTA.enabled}
                    onValueChange={(value) => updateSection('resumeCTA', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>Title</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={config.sections.resumeCTA.title}
                    onChangeText={(text) => updateSection('resumeCTA', 'title', text)}
                  />
                </View>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>Subtitle</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={config.sections.resumeCTA.subtitle}
                    onChangeText={(text) => updateSection('resumeCTA', 'subtitle', text)}
                  />
                </View>
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.label}>Button Text</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={config.sections.resumeCTA.buttonText}
                    onChangeText={(text) => updateSection('resumeCTA', 'buttonText', text)}
                  />
                </View>
              </View>

              <TouchableOpacity style={dynamicStyles.saveButton} onPress={saveSections}>
                <Ionicons name="save" size={20} color="#FFF" />
                <Text style={dynamicStyles.saveButtonText}>Save Sections</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <View style={dynamicStyles.tabContent}>
              <Text style={dynamicStyles.sectionTitle}>Homepage Statistics</Text>

              <View style={dynamicStyles.statCard}>
                <View style={dynamicStyles.switchRow}>
                  <Text style={dynamicStyles.statLabel}>Total Jobs</Text>
                  <Switch
                    value={config.stats.totalJobs.enabled}
                    onValueChange={(value) => updateStat('totalJobs', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <TextInput
                  style={dynamicStyles.input}
                  value={config.stats.totalJobs.display}
                  onChangeText={(text) => updateStat('totalJobs', 'display', text)}
                  placeholder="e.g., 5 lakh+"
                />
              </View>

              <View style={dynamicStyles.statCard}>
                <View style={dynamicStyles.switchRow}>
                  <Text style={dynamicStyles.statLabel}>Total Companies</Text>
                  <Switch
                    value={config.stats.totalCompanies.enabled}
                    onValueChange={(value) => updateStat('totalCompanies', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <TextInput
                  style={dynamicStyles.input}
                  value={config.stats.totalCompanies.display}
                  onChangeText={(text) => updateStat('totalCompanies', 'display', text)}
                  placeholder="e.g., 10,000+"
                />
              </View>

              <View style={dynamicStyles.statCard}>
                <View style={dynamicStyles.switchRow}>
                  <Text style={dynamicStyles.statLabel}>Total Applicants</Text>
                  <Switch
                    value={config.stats.totalApplicants.enabled}
                    onValueChange={(value) => updateStat('totalApplicants', 'enabled', value)}
                    trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                  />
                </View>
                <TextInput
                  style={dynamicStyles.input}
                  value={config.stats.totalApplicants.display}
                  onChangeText={(text) => updateStat('totalApplicants', 'display', text)}
                  placeholder="e.g., 1 million+"
                />
              </View>

              <TouchableOpacity style={dynamicStyles.saveButton} onPress={saveStats}>
                <Ionicons name="save" size={20} color="#FFF" />
                <Text style={dynamicStyles.saveButtonText}>Save Statistics</Text>
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
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Add New Banner</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={dynamicStyles.modalBody}>
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Title *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={bannerForm.title}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, title: text })}
                  placeholder="Enter banner title"
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Description *</Text>
                <TextInput
                  style={[dynamicStyles.input, dynamicStyles.textArea]}
                  value={bannerForm.description}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, description: text })}
                  placeholder="Enter banner description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Image URL</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={bannerForm.imageUrl}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, imageUrl: text })}
                  placeholder="Enter image URL"
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Button Text</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={bannerForm.buttonText}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, buttonText: text })}
                  placeholder="e.g., Learn More"
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Button Link</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={bannerForm.buttonLink}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, buttonLink: text })}
                  placeholder="e.g., /jobs"
                />
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Background Color</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={bannerForm.backgroundColor}
                  onChangeText={(text) => setBannerForm({ ...bannerForm, backgroundColor: text })}
                  placeholder="#4A90E2"
                />
              </View>

              <TouchableOpacity style={dynamicStyles.modalButton} onPress={handleAddBanner}>
                <Text style={dynamicStyles.modalButtonText}>Add Banner</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
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

const styles = StyleSheet.create({});

export default AdminHomepageScreen;
