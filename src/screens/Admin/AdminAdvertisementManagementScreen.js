import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../../components/Admin/AdminLayout';
import { API_URL } from '../../config/api';

const AdminAdvertisementManagementScreen = ({ navigation }) => {
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  // State management
  const [loading, setLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // basic, content, targeting, schedule, performance
  const [stats, setStats] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'banner',
    position: 'header',
    status: 'draft',
    priority: 5,
    isActive: true,
    content: {
      html: '',
      imageUrl: '',
      imageAlt: '',
      text: '',
      linkUrl: '',
      linkText: ''
    },
    adsense: {
      adClient: '',
      adSlot: '',
      adFormat: 'auto',
      adStyle: ''
    },
    admob: {
      adUnitId: '',
      adSize: 'banner'
    },
    displaySettings: {
      width: 728,
      height: 90,
      backgroundColor: '#ffffff',
      borderColor: '#cccccc',
      borderRadius: 0,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      padding: { top: 10, right: 10, bottom: 10, left: 10 }
    },
    targeting: {
      pages: ['all'],
      userTypes: ['all'],
      devices: ['all'],
      locations: [],
      industries: []
    },
    schedule: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      timezone: 'UTC'
    }
  });

  useEffect(() => {
    fetchAdvertisements();
    fetchStats();
  }, []);

  useEffect(() => {
    filterAdvertisements();
  }, [searchQuery, selectedType, selectedStatus, advertisements]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/advertisements/admin/list?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setAdvertisements(data.data);
        setFilteredAds(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch advertisements');
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      Alert.alert('Error', 'Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/advertisements/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterAdvertisements = () => {
    let filtered = [...advertisements];

    if (searchQuery) {
      filtered = filtered.filter(ad =>
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ad.description && ad.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(ad => ad.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(ad => ad.status === selectedStatus);
    }

    setFilteredAds(filtered);
  };

  const handleCreate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/advertisements/admin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Advertisement created successfully');
        setModalVisible(false);
        resetForm();
        fetchAdvertisements();
        fetchStats();
      } else {
        Alert.alert('Error', data.message || 'Failed to create advertisement');
      }
    } catch (error) {
      console.error('Error creating advertisement:', error);
      Alert.alert('Error', 'Failed to create advertisement');
    }
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/advertisements/admin/${currentAd._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Advertisement updated successfully');
        setModalVisible(false);
        setEditMode(false);
        resetForm();
        fetchAdvertisements();
        fetchStats();
      } else {
        Alert.alert('Error', data.message || 'Failed to update advertisement');
      }
    } catch (error) {
      console.error('Error updating advertisement:', error);
      Alert.alert('Error', 'Failed to update advertisement');
    }
  };

  const handleDelete = (ad) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${ad.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${API_URL}/advertisements/admin/${ad._id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              const data = await response.json();
              if (data.success) {
                Alert.alert('Success', 'Advertisement deleted successfully');
                fetchAdvertisements();
                fetchStats();
              } else {
                Alert.alert('Error', data.message || 'Failed to delete advertisement');
              }
            } catch (error) {
              console.error('Error deleting advertisement:', error);
              Alert.alert('Error', 'Failed to delete advertisement');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (ad, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/advertisements/admin/${ad._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', `Advertisement ${newStatus} successfully`);
        fetchAdvertisements();
        fetchStats();
      } else {
        Alert.alert('Error', data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const openAddModal = () => {
    resetForm();
    setEditMode(false);
    setModalVisible(true);
  };

  const openEditModal = (ad) => {
    setCurrentAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      type: ad.type,
      position: ad.position,
      status: ad.status,
      priority: ad.priority,
      isActive: ad.isActive,
      content: ad.content || {
        html: '',
        imageUrl: '',
        imageAlt: '',
        text: '',
        linkUrl: '',
        linkText: ''
      },
      adsense: ad.adsense || {
        adClient: '',
        adSlot: '',
        adFormat: 'auto',
        adStyle: ''
      },
      admob: ad.admob || {
        adUnitId: '',
        adSize: 'banner'
      },
      displaySettings: ad.displaySettings || {
        width: 728,
        height: 90,
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 0,
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        padding: { top: 10, right: 10, bottom: 10, left: 10 }
      },
      targeting: ad.targeting || {
        pages: ['all'],
        userTypes: ['all'],
        devices: ['all'],
        locations: [],
        industries: []
      },
      schedule: ad.schedule ? {
        startDate: ad.schedule.startDate ? new Date(ad.schedule.startDate).toISOString().split('T')[0] : '',
        endDate: ad.schedule.endDate ? new Date(ad.schedule.endDate).toISOString().split('T')[0] : '',
        timezone: ad.schedule.timezone || 'UTC'
      } : {
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        timezone: 'UTC'
      }
    });
    setEditMode(true);
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'banner',
      position: 'header',
      status: 'draft',
      priority: 5,
      isActive: true,
      content: {
        html: '',
        imageUrl: '',
        imageAlt: '',
        text: '',
        linkUrl: '',
        linkText: ''
      },
      adsense: {
        adClient: '',
        adSlot: '',
        adFormat: 'auto',
        adStyle: ''
      },
      admob: {
        adUnitId: '',
        adSize: 'banner'
      },
      displaySettings: {
        width: 728,
        height: 90,
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 0,
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        padding: { top: 10, right: 10, bottom: 10, left: 10 }
      },
      targeting: {
        pages: ['all'],
        userTypes: ['all'],
        devices: ['all'],
        locations: [],
        industries: []
      },
      schedule: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        timezone: 'UTC'
      }
    });
    setCurrentAd(null);
    setActiveTab('basic');
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedFormData = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const updateDeepNestedFormData = (parent, child, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: {
          ...prev[parent][child],
          [field]: value
        }
      }
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#6B7280';
      case 'paused': return '#F59E0B';
      case 'draft': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'checkmark-circle';
      case 'inactive': return 'close-circle';
      case 'paused': return 'pause-circle';
      case 'draft': return 'document-text';
      default: return 'help-circle';
    }
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="megaphone" size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{stats.overview?.total || 0}</Text>
          <Text style={styles.statLabel}>Total Ads</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.statValue}>{stats.overview?.active || 0}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="eye" size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>{stats.performance?.totalImpressions || 0}</Text>
          <Text style={styles.statLabel}>Impressions</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="hand-left" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.performance?.totalClicks || 0}</Text>
          <Text style={styles.statLabel}>Clicks</Text>
        </View>
      </View>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search advertisements..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.filterButtons}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedType('all')}
          >
            <Text style={[styles.filterButtonText, selectedType === 'all' && styles.filterButtonTextActive]}>
              All Types
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'banner' && styles.filterButtonActive]}
            onPress={() => setSelectedType('banner')}
          >
            <Text style={[styles.filterButtonText, selectedType === 'banner' && styles.filterButtonTextActive]}>
              Banner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'adsense' && styles.filterButtonActive]}
            onPress={() => setSelectedType('adsense')}
          >
            <Text style={[styles.filterButtonText, selectedType === 'adsense' && styles.filterButtonTextActive]}>
              AdSense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'admob' && styles.filterButtonActive]}
            onPress={() => setSelectedType('admob')}
          >
            <Text style={[styles.filterButtonText, selectedType === 'admob' && styles.filterButtonTextActive]}>
              AdMob
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.filterButtons}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={[styles.filterButtonText, selectedStatus === 'all' && styles.filterButtonTextActive]}>
              All Status
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'active' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('active')}
          >
            <Text style={[styles.filterButtonText, selectedStatus === 'active' && styles.filterButtonTextActive]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'draft' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('draft')}
          >
            <Text style={[styles.filterButtonText, selectedStatus === 'draft' && styles.filterButtonTextActive]}>
              Draft
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'paused' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('paused')}
          >
            <Text style={[styles.filterButtonText, selectedStatus === 'paused' && styles.filterButtonTextActive]}>
              Paused
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderAdCard = (ad) => {
    const ctr = ad.performance?.impressions > 0 
      ? ((ad.performance.clicks / ad.performance.impressions) * 100).toFixed(2)
      : 0;

    return (
      <View key={ad._id} style={styles.adCard}>
        <View style={styles.adCardHeader}>
          <View style={styles.adCardTitleContainer}>
            <Text style={styles.adCardTitle}>{ad.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ad.status) }]}>
              <Ionicons name={getStatusIcon(ad.status)} size={14} color="#fff" />
              <Text style={styles.statusBadgeText}>{ad.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.adCardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(ad)}
            >
              <Ionicons name="create-outline" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(ad)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {ad.description && (
          <Text style={styles.adCardDescription}>{ad.description}</Text>
        )}

        <View style={styles.adCardInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>Type: {ad.type}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>Position: {ad.position}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="star-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>Priority: {ad.priority}</Text>
          </View>
        </View>

        <View style={styles.performanceContainer}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>{ad.performance?.impressions || 0}</Text>
            <Text style={styles.performanceLabel}>Impressions</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>{ad.performance?.clicks || 0}</Text>
            <Text style={styles.performanceLabel}>Clicks</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>{ctr}%</Text>
            <Text style={styles.performanceLabel}>CTR</Text>
          </View>
        </View>

        <View style={styles.adCardFooter}>
          <TouchableOpacity
            style={[styles.statusActionButton, ad.status === 'active' ? styles.pauseButton : styles.activateButton]}
            onPress={() => handleStatusChange(ad, ad.status === 'active' ? 'paused' : 'active')}
          >
            <Ionicons 
              name={ad.status === 'active' ? 'pause' : 'play'} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.statusActionButtonText}>
              {ad.status === 'active' ? 'Pause' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBasicTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter advertisement title"
        value={formData.title}
        onChangeText={(value) => updateFormData('title', value)}
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter advertisement description"
        value={formData.description}
        onChangeText={(value) => updateFormData('description', value)}
        multiline
        numberOfLines={3}
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Type *</Text>
      <View style={styles.pickerContainer}>
        {['banner', 'sidebar', 'footer', 'popup', 'inline', 'adsense', 'admob'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.pickerOption,
              formData.type === type && styles.pickerOptionSelected
            ]}
            onPress={() => updateFormData('type', type)}
          >
            <Text style={[
              styles.pickerOptionText,
              formData.type === type && styles.pickerOptionTextSelected
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Position *</Text>
      <View style={styles.pickerContainer}>
        {['header', 'sidebar-left', 'sidebar-right', 'footer', 'content-top', 'content-bottom', 'content-middle'].map((position) => (
          <TouchableOpacity
            key={position}
            style={[
              styles.pickerOption,
              formData.position === position && styles.pickerOptionSelected
            ]}
            onPress={() => updateFormData('position', position)}
          >
            <Text style={[
              styles.pickerOptionText,
              formData.position === position && styles.pickerOptionTextSelected
            ]}>
              {position.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.pickerContainer}>
            {['draft', 'active', 'paused', 'inactive'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.pickerOption,
                  formData.status === status && styles.pickerOptionSelected
                ]}
                onPress={() => updateFormData('status', status)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.status === status && styles.pickerOptionTextSelected
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.halfWidth}>
          <Text style={styles.label}>Priority (1-10)</Text>
          <TextInput
            style={styles.input}
            placeholder="5"
            value={String(formData.priority)}
            onChangeText={(value) => updateFormData('priority', parseInt(value) || 5)}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Active</Text>
        <Switch
          value={formData.isActive}
          onValueChange={(value) => updateFormData('isActive', value)}
          trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
          thumbColor={formData.isActive ? '#fff' : '#fff'}
        />
      </View>
    </View>
  );

  const renderContentTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Advertisement Content</Text>

      {formData.type === 'adsense' ? (
        <>
          <Text style={styles.label}>AdSense Client ID</Text>
          <TextInput
            style={styles.input}
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            value={formData.adsense.adClient}
            onChangeText={(value) => updateNestedFormData('adsense', 'adClient', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Ad Slot ID</Text>
          <TextInput
            style={styles.input}
            placeholder="XXXXXXXXXX"
            value={formData.adsense.adSlot}
            onChangeText={(value) => updateNestedFormData('adsense', 'adSlot', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Ad Format</Text>
          <View style={styles.pickerContainer}>
            {['auto', 'rectangle', 'vertical', 'horizontal'].map((format) => (
              <TouchableOpacity
                key={format}
                style={[
                  styles.pickerOption,
                  formData.adsense.adFormat === format && styles.pickerOptionSelected
                ]}
                onPress={() => updateNestedFormData('adsense', 'adFormat', format)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.adsense.adFormat === format && styles.pickerOptionTextSelected
                ]}>
                  {format.charAt(0).toUpperCase() + format.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : formData.type === 'admob' ? (
        <>
          <Text style={styles.label}>AdMob Ad Unit ID</Text>
          <TextInput
            style={styles.input}
            placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
            value={formData.admob.adUnitId}
            onChangeText={(value) => updateNestedFormData('admob', 'adUnitId', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Ad Size</Text>
          <View style={styles.pickerContainer}>
            {['banner', 'large-banner', 'medium-rectangle', 'full-banner', 'leaderboard', 'smart-banner'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.pickerOption,
                  formData.admob.adSize === size && styles.pickerOptionSelected
                ]}
                onPress={() => updateNestedFormData('admob', 'adSize', size)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.admob.adSize === size && styles.pickerOptionTextSelected
                ]}>
                  {size.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.label}>HTML Content</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter custom HTML for the ad"
            value={formData.content.html}
            onChangeText={(value) => updateNestedFormData('content', 'html', value)}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/image.jpg"
            value={formData.content.imageUrl}
            onChangeText={(value) => updateNestedFormData('content', 'imageUrl', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Image Alt Text</Text>
          <TextInput
            style={styles.input}
            placeholder="Advertisement image"
            value={formData.content.imageAlt}
            onChangeText={(value) => updateNestedFormData('content', 'imageAlt', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Link URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            value={formData.content.linkUrl}
            onChangeText={(value) => updateNestedFormData('content', 'linkUrl', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Link Text</Text>
          <TextInput
            style={styles.input}
            placeholder="Learn More"
            value={formData.content.linkText}
            onChangeText={(value) => updateNestedFormData('content', 'linkText', value)}
            placeholderTextColor="#9CA3AF"
          />
        </>
      )}

      <Text style={styles.sectionTitle}>Display Settings</Text>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Width (px)</Text>
          <TextInput
            style={styles.input}
            placeholder="728"
            value={String(formData.displaySettings.width)}
            onChangeText={(value) => updateNestedFormData('displaySettings', 'width', parseInt(value) || 728)}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.halfWidth}>
          <Text style={styles.label}>Height (px)</Text>
          <TextInput
            style={styles.input}
            placeholder="90"
            value={String(formData.displaySettings.height)}
            onChangeText={(value) => updateNestedFormData('displaySettings', 'height', parseInt(value) || 90)}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Background Color</Text>
          <TextInput
            style={styles.input}
            placeholder="#ffffff"
            value={formData.displaySettings.backgroundColor}
            onChangeText={(value) => updateNestedFormData('displaySettings', 'backgroundColor', value)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.halfWidth}>
          <Text style={styles.label}>Border Radius (px)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={String(formData.displaySettings.borderRadius)}
            onChangeText={(value) => updateNestedFormData('displaySettings', 'borderRadius', parseInt(value) || 0)}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderTargetingTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Targeting Options</Text>

      <Text style={styles.label}>Target Pages</Text>
      <View style={styles.pickerContainer}>
        {['all', 'home', 'jobs', 'companies', 'login', 'register', 'dashboard', 'profile'].map((page) => (
          <TouchableOpacity
            key={page}
            style={[
              styles.pickerOption,
              formData.targeting.pages.includes(page) && styles.pickerOptionSelected
            ]}
            onPress={() => {
              const pages = formData.targeting.pages.includes(page)
                ? formData.targeting.pages.filter(p => p !== page)
                : [...formData.targeting.pages, page];
              updateNestedFormData('targeting', 'pages', pages.length > 0 ? pages : ['all']);
            }}
          >
            <Text style={[
              styles.pickerOptionText,
              formData.targeting.pages.includes(page) && styles.pickerOptionTextSelected
            ]}>
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Target User Types</Text>
      <View style={styles.pickerContainer}>
        {['all', 'jobseeker', 'employer', 'consultancy'].map((userType) => (
          <TouchableOpacity
            key={userType}
            style={[
              styles.pickerOption,
              formData.targeting.userTypes.includes(userType) && styles.pickerOptionSelected
            ]}
            onPress={() => {
              const userTypes = formData.targeting.userTypes.includes(userType)
                ? formData.targeting.userTypes.filter(t => t !== userType)
                : [...formData.targeting.userTypes, userType];
              updateNestedFormData('targeting', 'userTypes', userTypes.length > 0 ? userTypes : ['all']);
            }}
          >
            <Text style={[
              styles.pickerOptionText,
              formData.targeting.userTypes.includes(userType) && styles.pickerOptionTextSelected
            ]}>
              {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Target Devices</Text>
      <View style={styles.pickerContainer}>
        {['all', 'desktop', 'mobile', 'tablet'].map((device) => (
          <TouchableOpacity
            key={device}
            style={[
              styles.pickerOption,
              formData.targeting.devices.includes(device) && styles.pickerOptionSelected
            ]}
            onPress={() => {
              const devices = formData.targeting.devices.includes(device)
                ? formData.targeting.devices.filter(d => d !== device)
                : [...formData.targeting.devices, device];
              updateNestedFormData('targeting', 'devices', devices.length > 0 ? devices : ['all']);
            }}
          >
            <Text style={[
              styles.pickerOptionText,
              formData.targeting.devices.includes(device) && styles.pickerOptionTextSelected
            ]}>
              {device.charAt(0).toUpperCase() + device.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderScheduleTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Schedule Settings</Text>

      <Text style={styles.label}>Start Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={formData.schedule.startDate}
        onChangeText={(value) => updateNestedFormData('schedule', 'startDate', value)}
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>End Date (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={formData.schedule.endDate}
        onChangeText={(value) => updateNestedFormData('schedule', 'endDate', value)}
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.helpText}>
        Leave end date empty for indefinite display. The advertisement will be shown between the start and end dates.
      </Text>
    </View>
  );

  const renderPerformanceTab = () => {
    if (!editMode || !currentAd) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.emptyText}>Performance data available after ad is created</Text>
        </View>
      );
    }

    const ctr = currentAd.performance?.impressions > 0
      ? ((currentAd.performance.clicks / currentAd.performance.impressions) * 100).toFixed(2)
      : 0;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>

        <View style={styles.performanceGrid}>
          <View style={styles.performanceCard}>
            <Ionicons name="eye" size={32} color="#3B82F6" />
            <Text style={styles.performanceCardValue}>
              {currentAd.performance?.impressions || 0}
            </Text>
            <Text style={styles.performanceCardLabel}>Impressions</Text>
          </View>

          <View style={styles.performanceCard}>
            <Ionicons name="hand-left" size={32} color="#10B981" />
            <Text style={styles.performanceCardValue}>
              {currentAd.performance?.clicks || 0}
            </Text>
            <Text style={styles.performanceCardLabel}>Clicks</Text>
          </View>

          <View style={styles.performanceCard}>
            <Ionicons name="analytics" size={32} color="#F59E0B" />
            <Text style={styles.performanceCardValue}>{ctr}%</Text>
            <Text style={styles.performanceCardLabel}>CTR</Text>
          </View>

          <View style={styles.performanceCard}>
            <Ionicons name="cash" size={32} color="#8B5CF6" />
            <Text style={styles.performanceCardValue}>
              ${currentAd.performance?.revenue || 0}
            </Text>
            <Text style={styles.performanceCardLabel}>Revenue</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setModalVisible(false);
        resetForm();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editMode ? 'Edit Advertisement' : 'Create Advertisement'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabButtons}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'basic' && styles.tabButtonActive]}
                onPress={() => setActiveTab('basic')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'basic' && styles.tabButtonTextActive]}>
                  Basic
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'content' && styles.tabButtonActive]}
                onPress={() => setActiveTab('content')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'content' && styles.tabButtonTextActive]}>
                  Content
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'targeting' && styles.tabButtonActive]}
                onPress={() => setActiveTab('targeting')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'targeting' && styles.tabButtonTextActive]}>
                  Targeting
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'schedule' && styles.tabButtonActive]}
                onPress={() => setActiveTab('schedule')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'schedule' && styles.tabButtonTextActive]}>
                  Schedule
                </Text>
              </TouchableOpacity>
              {editMode && (
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'performance' && styles.tabButtonActive]}
                  onPress={() => setActiveTab('performance')}
                >
                  <Text style={[styles.tabButtonText, activeTab === 'performance' && styles.tabButtonTextActive]}>
                    Performance
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'content' && renderContentTab()}
            {activeTab === 'targeting' && renderTargetingTab()}
            {activeTab === 'schedule' && renderScheduleTab()}
            {activeTab === 'performance' && renderPerformanceTab()}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={editMode ? handleUpdate : handleCreate}
            >
              <Text style={styles.saveButtonText}>
                {editMode ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <AdminLayout
        title="Advertisement Management"
        activeScreen="AdminAdvertisementManagement"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading advertisements...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Advertisement Management"
      activeScreen="AdminAdvertisementManagement"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Advertisement Management</Text>
            <Text style={styles.pageSubtitle}>
              Manage advertisements, AdSense, and AdMob integrations
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {renderStats()}
        {renderFilters()}

        <ScrollView
          style={styles.adsList}
          contentContainerStyle={styles.adsListContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {filteredAds.length > 0 ? (
            filteredAds.map(renderAdCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No advertisements found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first advertisement to get started'}
              </Text>
            </View>
          )}
        </ScrollView>

        {renderModal()}
      </View>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  filtersContainer: {
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  adsList: {
    flex: 1,
  },
  adsListContent: {
    padding: 20,
    gap: 16,
  },
  adCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  adCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  adCardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  adCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  adCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  adCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  adCardInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 12,
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  adCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  statusActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  activateButton: {
    backgroundColor: '#10B981',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  statusActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 800,
    maxHeight: '90%',
    overflow: 'hidden',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  tabButtons: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: '#3B82F6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  performanceCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  performanceCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  performanceCardLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AdminAdvertisementManagementScreen;
