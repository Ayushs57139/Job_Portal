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
import { useResponsive } from '../../utils/responsive';

// Define getStyles before the component to avoid hoisting issues
const getStyles = (isMobile, isTablet) => StyleSheet.create({
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
    fontSize: isMobile ? 20 : isTablet ? 22 : 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: isMobile ? 12 : 16,
    paddingVertical: isMobile ? 8 : 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: isMobile ? 16 : 20,
    gap: 12,
    backgroundColor: '#fff',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: isMobile ? 12 : 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: isMobile ? 120 : 140,
  },
  statValue: {
    fontSize: isMobile ? 20 : isTablet ? 22 : 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: isMobile ? 11 : 12,
    color: '#6B7280',
    marginTop: 4,
  },
  filtersContainer: {
    padding: isMobile ? 16 : 20,
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
    fontSize: isMobile ? 13 : 14,
    color: '#111827',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: isMobile ? 12 : 16,
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
    fontSize: isMobile ? 13 : 14,
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
    padding: isMobile ? 16 : 20,
    gap: 16,
  },
  adCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isMobile ? 12 : 16,
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
    fontSize: isMobile ? 16 : isTablet ? 17 : 18,
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
    fontSize: isMobile ? 11 : 12,
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
    fontSize: isMobile ? 13 : 14,
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
    fontSize: isMobile ? 13 : 14,
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
    fontSize: isMobile ? 18 : isTablet ? 19 : 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  performanceLabel: {
    fontSize: isMobile ? 11 : 12,
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
    paddingHorizontal: isMobile ? 12 : 16,
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
    fontSize: isMobile ? 13 : 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: isMobile ? 12 : 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? 16 : 32,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 0,
    width: '100%',
    maxWidth: 800,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 25,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: isMobile ? 20 : 44,
    paddingTop: isMobile ? 20 : 44,
    paddingBottom: isMobile ? 16 : 24,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: isMobile ? 20 : isTablet ? 22 : 24,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    width: isMobile ? 36 : 40,
    height: isMobile ? 36 : 40,
    borderRadius: isMobile ? 18 : 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }),
  },
  tabButtons: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: '#3B82F6',
  },
  tabButtonText: {
    fontSize: isMobile ? 13 : 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: isMobile ? 16 : 20,
  },
  tabContent: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: isMobile ? 16 : isTablet ? 17 : 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: isMobile ? 13 : 14,
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
    paddingVertical: isMobile ? 8 : 10,
    fontSize: isMobile ? 13 : 14,
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
    fontSize: isMobile ? 13 : 14,
    color: '#6B7280',
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
    minWidth: isMobile ? '100%' : 'auto',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  helpText: {
    fontSize: isMobile ? 11 : 12,
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
    minWidth: isMobile ? '100%' : 140,
    backgroundColor: '#F9FAFB',
    padding: isMobile ? 16 : 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  performanceCardValue: {
    fontSize: isMobile ? 24 : isTablet ? 26 : 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  performanceCardLabel: {
    fontSize: isMobile ? 12 : 14,
    color: '#6B7280',
    marginTop: 6,
  },
  modalFooter: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: isMobile ? 16 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: isMobile ? 12 : 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: isMobile ? 15 : 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: isMobile ? 12 : 10,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    fontSize: isMobile ? 15 : 16,
    fontWeight: '600',
    color: '#fff',
  },
});

const AdminAdvertisementManagementScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  
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
      <View style={dynamicStyles.statsContainer}>
        <View style={dynamicStyles.statCard}>
          <Ionicons name="megaphone" size={24} color="#3B82F6" />
          <Text style={dynamicStyles.statValue}>{stats.overview?.total || 0}</Text>
          <Text style={dynamicStyles.statLabel}>Total Ads</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={dynamicStyles.statValue}>{stats.overview?.active || 0}</Text>
          <Text style={dynamicStyles.statLabel}>Active</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Ionicons name="eye" size={24} color="#8B5CF6" />
          <Text style={dynamicStyles.statValue}>{stats.performance?.totalImpressions || 0}</Text>
          <Text style={dynamicStyles.statLabel}>Impressions</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Ionicons name="hand-left" size={24} color="#F59E0B" />
          <Text style={dynamicStyles.statValue}>{stats.performance?.totalClicks || 0}</Text>
          <Text style={dynamicStyles.statLabel}>Clicks</Text>
        </View>
      </View>
    );
  };

  const renderFilters = () => (
    <View style={dynamicStyles.filtersContainer}>
      <View style={dynamicStyles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={dynamicStyles.searchIcon} />
        <TextInput
          style={dynamicStyles.searchInput}
          placeholder="Search advertisements..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={dynamicStyles.filterButtons}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[dynamicStyles.filterButton, selectedType === 'all' && dynamicStyles.filterButtonActive]}
            onPress={() => setSelectedType('all')}
          >
            <Text style={[dynamicStyles.filterButtonText, selectedType === 'all' && dynamicStyles.filterButtonTextActive]}>
              All Types
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.filterButton, selectedType === 'banner' && dynamicStyles.filterButtonActive]}
            onPress={() => setSelectedType('banner')}
          >
            <Text style={[dynamicStyles.filterButtonText, selectedType === 'banner' && dynamicStyles.filterButtonTextActive]}>
              Banner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.filterButton, selectedType === 'adsense' && dynamicStyles.filterButtonActive]}
            onPress={() => setSelectedType('adsense')}
          >
            <Text style={[dynamicStyles.filterButtonText, selectedType === 'adsense' && dynamicStyles.filterButtonTextActive]}>
              AdSense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.filterButton, selectedType === 'admob' && dynamicStyles.filterButtonActive]}
            onPress={() => setSelectedType('admob')}
          >
            <Text style={[dynamicStyles.filterButtonText, selectedType === 'admob' && dynamicStyles.filterButtonTextActive]}>
              AdMob
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={dynamicStyles.filterButtons}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[dynamicStyles.filterButton, selectedStatus === 'all' && dynamicStyles.filterButtonActive]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={[dynamicStyles.filterButtonText, selectedStatus === 'all' && dynamicStyles.filterButtonTextActive]}>
              All Status
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.filterButton, selectedStatus === 'active' && dynamicStyles.filterButtonActive]}
            onPress={() => setSelectedStatus('active')}
          >
            <Text style={[dynamicStyles.filterButtonText, selectedStatus === 'active' && dynamicStyles.filterButtonTextActive]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.filterButton, selectedStatus === 'draft' && dynamicStyles.filterButtonActive]}
            onPress={() => setSelectedStatus('draft')}
          >
            <Text style={[dynamicStyles.filterButtonText, selectedStatus === 'draft' && dynamicStyles.filterButtonTextActive]}>
              Draft
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.filterButton, selectedStatus === 'paused' && dynamicStyles.filterButtonActive]}
            onPress={() => setSelectedStatus('paused')}
          >
            <Text style={[dynamicStyles.filterButtonText, selectedStatus === 'paused' && dynamicStyles.filterButtonTextActive]}>
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
      <View key={ad._id} style={dynamicStyles.adCard}>
        <View style={dynamicStyles.adCardHeader}>
          <View style={dynamicStyles.adCardTitleContainer}>
            <Text style={dynamicStyles.adCardTitle}>{ad.title}</Text>
            <View style={[dynamicStyles.statusBadge, { backgroundColor: getStatusColor(ad.status) }]}>
              <Ionicons name={getStatusIcon(ad.status)} size={14} color="#fff" />
              <Text style={dynamicStyles.statusBadgeText}>{ad.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={dynamicStyles.adCardActions}>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => openEditModal(ad)}
            >
              <Ionicons name="create-outline" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => handleDelete(ad)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {ad.description && (
          <Text style={dynamicStyles.adCardDescription}>{ad.description}</Text>
        )}

        <View style={dynamicStyles.adCardInfo}>
          <View style={dynamicStyles.infoItem}>
            <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
            <Text style={dynamicStyles.infoText}>Type: {ad.type}</Text>
          </View>
          <View style={dynamicStyles.infoItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={dynamicStyles.infoText}>Position: {ad.position}</Text>
          </View>
          <View style={dynamicStyles.infoItem}>
            <Ionicons name="star-outline" size={16} color="#6B7280" />
            <Text style={dynamicStyles.infoText}>Priority: {ad.priority}</Text>
          </View>
        </View>

        <View style={dynamicStyles.performanceContainer}>
          <View style={dynamicStyles.performanceItem}>
            <Text style={dynamicStyles.performanceValue}>{ad.performance?.impressions || 0}</Text>
            <Text style={dynamicStyles.performanceLabel}>Impressions</Text>
          </View>
          <View style={dynamicStyles.performanceItem}>
            <Text style={dynamicStyles.performanceValue}>{ad.performance?.clicks || 0}</Text>
            <Text style={dynamicStyles.performanceLabel}>Clicks</Text>
          </View>
          <View style={dynamicStyles.performanceItem}>
            <Text style={dynamicStyles.performanceValue}>{ctr}%</Text>
            <Text style={dynamicStyles.performanceLabel}>CTR</Text>
          </View>
        </View>

        <View style={dynamicStyles.adCardFooter}>
          <TouchableOpacity
            style={[dynamicStyles.statusActionButton, ad.status === 'active' ? dynamicStyles.pauseButton : dynamicStyles.activateButton]}
            onPress={() => handleStatusChange(ad, ad.status === 'active' ? 'paused' : 'active')}
          >
            <Ionicons 
              name={ad.status === 'active' ? 'pause' : 'play'} 
              size={16} 
              color="#fff" 
            />
            <Text style={dynamicStyles.statusActionButtonText}>
              {ad.status === 'active' ? 'Pause' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBasicTab = () => (
    <View style={dynamicStyles.tabContent}>
      <Text style={dynamicStyles.sectionTitle}>Basic Information</Text>
      
      <Text style={dynamicStyles.label}>Title *</Text>
      <TextInput
        style={dynamicStyles.input}
        placeholder="Enter advertisement title"
        value={formData.title}
        onChangeText={(value) => updateFormData('title', value)}
        placeholderTextColor="#9CA3AF"
      />

      <Text style={dynamicStyles.label}>Description</Text>
      <TextInput
        style={[dynamicStyles.input, dynamicStyles.textArea]}
        placeholder="Enter advertisement description"
        value={formData.description}
        onChangeText={(value) => updateFormData('description', value)}
        multiline
        numberOfLines={3}
        placeholderTextColor="#9CA3AF"
      />

      <Text style={dynamicStyles.label}>Type *</Text>
      <View style={dynamicStyles.pickerContainer}>
        {['banner', 'sidebar', 'footer', 'popup', 'inline', 'adsense', 'admob'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              dynamicStyles.pickerOption,
              formData.type === type && dynamicStyles.pickerOptionSelected
            ]}
            onPress={() => updateFormData('type', type)}
          >
            <Text style={[
              dynamicStyles.pickerOptionText,
              formData.type === type && dynamicStyles.pickerOptionTextSelected
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={dynamicStyles.label}>Position *</Text>
      <View style={dynamicStyles.pickerContainer}>
        {['header', 'sidebar-left', 'sidebar-right', 'footer', 'content-top', 'content-bottom', 'content-middle'].map((position) => (
          <TouchableOpacity
            key={position}
            style={[
              dynamicStyles.pickerOption,
              formData.position === position && dynamicStyles.pickerOptionSelected
            ]}
            onPress={() => updateFormData('position', position)}
          >
            <Text style={[
              dynamicStyles.pickerOptionText,
              formData.position === position && dynamicStyles.pickerOptionTextSelected
            ]}>
              {position.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={dynamicStyles.row}>
        <View style={dynamicStyles.halfWidth}>
          <Text style={dynamicStyles.label}>Status</Text>
          <View style={dynamicStyles.pickerContainer}>
            {['draft', 'active', 'paused', 'inactive'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  dynamicStyles.pickerOption,
                  formData.status === status && dynamicStyles.pickerOptionSelected
                ]}
                onPress={() => updateFormData('status', status)}
              >
                <Text style={[
                  dynamicStyles.pickerOptionText,
                  formData.status === status && dynamicStyles.pickerOptionTextSelected
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={dynamicStyles.halfWidth}>
          <Text style={dynamicStyles.label}>Priority (1-10)</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="5"
            value={String(formData.priority)}
            onChangeText={(value) => updateFormData('priority', parseInt(value) || 5)}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={dynamicStyles.switchContainer}>
        <Text style={dynamicStyles.label}>Active</Text>
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
    <ScrollView style={dynamicStyles.tabContent}>
      <Text style={dynamicStyles.sectionTitle}>Advertisement Content</Text>

      {formData.type === 'adsense' ? (
        <>
          <Text style={dynamicStyles.label}>AdSense Client ID</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            value={formData.adsense.adClient}
            onChangeText={(value) => updateNestedFormData('adsense', 'adClient', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={dynamicStyles.label}>Ad Slot ID</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="XXXXXXXXXX"
            value={formData.adsense.adSlot}
            onChangeText={(value) => updateNestedFormData('adsense', 'adSlot', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={dynamicStyles.label}>Ad Format</Text>
          <View style={dynamicStyles.pickerContainer}>
            {['auto', 'rectangle', 'vertical', 'horizontal'].map((format) => (
              <TouchableOpacity
                key={format}
                style={[
                  dynamicStyles.pickerOption,
                  formData.adsense.adFormat === format && dynamicStyles.pickerOptionSelected
                ]}
                onPress={() => updateNestedFormData('adsense', 'adFormat', format)}
              >
                <Text style={[
                  dynamicStyles.pickerOptionText,
                  formData.adsense.adFormat === format && dynamicStyles.pickerOptionTextSelected
                ]}>
                  {format.charAt(0).toUpperCase() + format.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : formData.type === 'admob' ? (
        <>
          <Text style={dynamicStyles.label}>AdMob Ad Unit ID</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
            value={formData.admob.adUnitId}
            onChangeText={(value) => updateNestedFormData('admob', 'adUnitId', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={dynamicStyles.label}>Ad Size</Text>
          <View style={dynamicStyles.pickerContainer}>
            {['banner', 'large-banner', 'medium-rectangle', 'full-banner', 'leaderboard', 'smart-banner'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  dynamicStyles.pickerOption,
                  formData.admob.adSize === size && dynamicStyles.pickerOptionSelected
                ]}
                onPress={() => updateNestedFormData('admob', 'adSize', size)}
              >
                <Text style={[
                  dynamicStyles.pickerOptionText,
                  formData.admob.adSize === size && dynamicStyles.pickerOptionTextSelected
                ]}>
                  {size.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={dynamicStyles.label}>HTML Content</Text>
          <TextInput
            style={[dynamicStyles.input, dynamicStyles.textArea]}
            placeholder="Enter custom HTML for the ad"
            value={formData.content.html}
            onChangeText={(value) => updateNestedFormData('content', 'html', value)}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={dynamicStyles.label}>Image URL</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="https://example.com/image.jpg"
            value={formData.content.imageUrl}
            onChangeText={(value) => updateNestedFormData('content', 'imageUrl', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={dynamicStyles.label}>Image Alt Text</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="Advertisement image"
            value={formData.content.imageAlt}
            onChangeText={(value) => updateNestedFormData('content', 'imageAlt', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={dynamicStyles.label}>Link URL</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="https://example.com"
            value={formData.content.linkUrl}
            onChangeText={(value) => updateNestedFormData('content', 'linkUrl', value)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={dynamicStyles.label}>Link Text</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="Learn More"
            value={formData.content.linkText}
            onChangeText={(value) => updateNestedFormData('content', 'linkText', value)}
            placeholderTextColor="#9CA3AF"
          />
        </>
      )}

      <Text style={dynamicStyles.sectionTitle}>Display Settings</Text>

      <View style={dynamicStyles.row}>
        <View style={dynamicStyles.halfWidth}>
          <Text style={dynamicStyles.label}>Width (px)</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="728"
            value={String(formData.displaySettings.width)}
            onChangeText={(value) => updateNestedFormData('displaySettings', 'width', parseInt(value) || 728)}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={dynamicStyles.halfWidth}>
          <Text style={dynamicStyles.label}>Height (px)</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="90"
            value={String(formData.displaySettings.height)}
            onChangeText={(value) => updateNestedFormData('displaySettings', 'height', parseInt(value) || 90)}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={dynamicStyles.row}>
        <View style={dynamicStyles.halfWidth}>
          <Text style={dynamicStyles.label}>Background Color</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="#ffffff"
            value={formData.displaySettings.backgroundColor}
            onChangeText={(value) => updateNestedFormData('displaySettings', 'backgroundColor', value)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={dynamicStyles.halfWidth}>
          <Text style={dynamicStyles.label}>Border Radius (px)</Text>
          <TextInput
            style={dynamicStyles.input}
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
    <ScrollView style={dynamicStyles.tabContent}>
      <Text style={dynamicStyles.sectionTitle}>Targeting Options</Text>

      <Text style={dynamicStyles.label}>Target Pages</Text>
      <View style={dynamicStyles.pickerContainer}>
        {['all', 'home', 'jobs', 'companies', 'login', 'register', 'dashboard', 'profile'].map((page) => (
          <TouchableOpacity
            key={page}
            style={[
              dynamicStyles.pickerOption,
              formData.targeting.pages.includes(page) && dynamicStyles.pickerOptionSelected
            ]}
            onPress={() => {
              const pages = formData.targeting.pages.includes(page)
                ? formData.targeting.pages.filter(p => p !== page)
                : [...formData.targeting.pages, page];
              updateNestedFormData('targeting', 'pages', pages.length > 0 ? pages : ['all']);
            }}
          >
            <Text style={[
              dynamicStyles.pickerOptionText,
              formData.targeting.pages.includes(page) && dynamicStyles.pickerOptionTextSelected
            ]}>
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={dynamicStyles.label}>Target User Types</Text>
      <View style={dynamicStyles.pickerContainer}>
        {['all', 'jobseeker', 'employer', 'consultancy'].map((userType) => (
          <TouchableOpacity
            key={userType}
            style={[
              dynamicStyles.pickerOption,
              formData.targeting.userTypes.includes(userType) && dynamicStyles.pickerOptionSelected
            ]}
            onPress={() => {
              const userTypes = formData.targeting.userTypes.includes(userType)
                ? formData.targeting.userTypes.filter(t => t !== userType)
                : [...formData.targeting.userTypes, userType];
              updateNestedFormData('targeting', 'userTypes', userTypes.length > 0 ? userTypes : ['all']);
            }}
          >
            <Text style={[
              dynamicStyles.pickerOptionText,
              formData.targeting.userTypes.includes(userType) && dynamicStyles.pickerOptionTextSelected
            ]}>
              {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={dynamicStyles.label}>Target Devices</Text>
      <View style={dynamicStyles.pickerContainer}>
        {['all', 'desktop', 'mobile', 'tablet'].map((device) => (
          <TouchableOpacity
            key={device}
            style={[
              dynamicStyles.pickerOption,
              formData.targeting.devices.includes(device) && dynamicStyles.pickerOptionSelected
            ]}
            onPress={() => {
              const devices = formData.targeting.devices.includes(device)
                ? formData.targeting.devices.filter(d => d !== device)
                : [...formData.targeting.devices, device];
              updateNestedFormData('targeting', 'devices', devices.length > 0 ? devices : ['all']);
            }}
          >
            <Text style={[
              dynamicStyles.pickerOptionText,
              formData.targeting.devices.includes(device) && dynamicStyles.pickerOptionTextSelected
            ]}>
              {device.charAt(0).toUpperCase() + device.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderScheduleTab = () => (
    <View style={dynamicStyles.tabContent}>
      <Text style={dynamicStyles.sectionTitle}>Schedule Settings</Text>

      <Text style={dynamicStyles.label}>Start Date</Text>
      <TextInput
        style={dynamicStyles.input}
        placeholder="YYYY-MM-DD"
        value={formData.schedule.startDate}
        onChangeText={(value) => updateNestedFormData('schedule', 'startDate', value)}
        placeholderTextColor="#9CA3AF"
      />

      <Text style={dynamicStyles.label}>End Date (Optional)</Text>
      <TextInput
        style={dynamicStyles.input}
        placeholder="YYYY-MM-DD"
        value={formData.schedule.endDate}
        onChangeText={(value) => updateNestedFormData('schedule', 'endDate', value)}
        placeholderTextColor="#9CA3AF"
      />

      <Text style={dynamicStyles.helpText}>
        Leave end date empty for indefinite display. The advertisement will be shown between the start and end dates.
      </Text>
    </View>
  );

  const renderPerformanceTab = () => {
    if (!editMode || !currentAd) {
      return (
        <View style={dynamicStyles.tabContent}>
          <Text style={dynamicStyles.emptyText}>Performance data available after ad is created</Text>
        </View>
      );
    }

    const ctr = currentAd.performance?.impressions > 0
      ? ((currentAd.performance.clicks / currentAd.performance.impressions) * 100).toFixed(2)
      : 0;

    return (
      <View style={dynamicStyles.tabContent}>
        <Text style={dynamicStyles.sectionTitle}>Performance Metrics</Text>

        <View style={dynamicStyles.performanceGrid}>
          <View style={dynamicStyles.performanceCard}>
            <Ionicons name="eye" size={32} color="#3B82F6" />
            <Text style={dynamicStyles.performanceCardValue}>
              {currentAd.performance?.impressions || 0}
            </Text>
            <Text style={dynamicStyles.performanceCardLabel}>Impressions</Text>
          </View>

          <View style={dynamicStyles.performanceCard}>
            <Ionicons name="hand-left" size={32} color="#10B981" />
            <Text style={dynamicStyles.performanceCardValue}>
              {currentAd.performance?.clicks || 0}
            </Text>
            <Text style={dynamicStyles.performanceCardLabel}>Clicks</Text>
          </View>

          <View style={dynamicStyles.performanceCard}>
            <Ionicons name="analytics" size={32} color="#F59E0B" />
            <Text style={dynamicStyles.performanceCardValue}>{ctr}%</Text>
            <Text style={dynamicStyles.performanceCardLabel}>CTR</Text>
          </View>

          <View style={dynamicStyles.performanceCard}>
            <Ionicons name="cash" size={32} color="#8B5CF6" />
            <Text style={dynamicStyles.performanceCardValue}>
              ${currentAd.performance?.revenue || 0}
            </Text>
            <Text style={dynamicStyles.performanceCardLabel}>Revenue</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {
        setModalVisible(false);
        resetForm();
      }}
    >
      <TouchableOpacity 
        style={dynamicStyles.modalOverlay}
        activeOpacity={1}
        onPress={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
        <View style={dynamicStyles.modalContainer}>
          <View style={dynamicStyles.modalHeader}>
            <Text style={dynamicStyles.modalTitle}>
              {editMode ? 'Edit Advertisement' : 'Create Advertisement'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              style={dynamicStyles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.tabButtons}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[dynamicStyles.tabButton, activeTab === 'basic' && dynamicStyles.tabButtonActive]}
                onPress={() => setActiveTab('basic')}
              >
                <Text style={[dynamicStyles.tabButtonText, activeTab === 'basic' && dynamicStyles.tabButtonTextActive]}>
                  Basic
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.tabButton, activeTab === 'content' && dynamicStyles.tabButtonActive]}
                onPress={() => setActiveTab('content')}
              >
                <Text style={[dynamicStyles.tabButtonText, activeTab === 'content' && dynamicStyles.tabButtonTextActive]}>
                  Content
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.tabButton, activeTab === 'targeting' && dynamicStyles.tabButtonActive]}
                onPress={() => setActiveTab('targeting')}
              >
                <Text style={[dynamicStyles.tabButtonText, activeTab === 'targeting' && dynamicStyles.tabButtonTextActive]}>
                  Targeting
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.tabButton, activeTab === 'schedule' && dynamicStyles.tabButtonActive]}
                onPress={() => setActiveTab('schedule')}
              >
                <Text style={[dynamicStyles.tabButtonText, activeTab === 'schedule' && dynamicStyles.tabButtonTextActive]}>
                  Schedule
                </Text>
              </TouchableOpacity>
              {editMode && (
                <TouchableOpacity
                  style={[dynamicStyles.tabButton, activeTab === 'performance' && dynamicStyles.tabButtonActive]}
                  onPress={() => setActiveTab('performance')}
                >
                  <Text style={[dynamicStyles.tabButtonText, activeTab === 'performance' && dynamicStyles.tabButtonTextActive]}>
                    Performance
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          <ScrollView style={dynamicStyles.modalContent} showsVerticalScrollIndicator={false}>
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'content' && renderContentTab()}
            {activeTab === 'targeting' && renderTargetingTab()}
            {activeTab === 'schedule' && renderScheduleTab()}
            {activeTab === 'performance' && renderPerformanceTab()}
          </ScrollView>

          <View style={dynamicStyles.modalFooter}>
            <TouchableOpacity
              style={dynamicStyles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.saveButton}
              onPress={editMode ? handleUpdate : handleCreate}
            >
              <Text style={dynamicStyles.saveButtonText}>
                {editMode ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </TouchableOpacity>
      </TouchableOpacity>
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
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={dynamicStyles.loadingText}>Loading advertisements...</Text>
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
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.pageTitle}>Advertisement Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>
              Manage advertisements, AdSense, and AdMob integrations
            </Text>
          </View>
          <TouchableOpacity style={dynamicStyles.addButton} onPress={openAddModal}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={dynamicStyles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {renderStats()}
        {renderFilters()}

        <ScrollView
          style={dynamicStyles.adsList}
          contentContainerStyle={dynamicStyles.adsListContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {filteredAds.length > 0 ? (
            filteredAds.map(renderAdCard)
          ) : (
            <View style={dynamicStyles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={64} color="#CCC" />
              <Text style={dynamicStyles.emptyText}>No advertisements found</Text>
              <Text style={dynamicStyles.emptySubtext}>
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

export default AdminAdvertisementManagementScreen;
