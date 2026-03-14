import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AdminLayout from '../../components/Admin/AdminLayout';
import AdminPostCard from '../../components/SocialUpdates/AdminPostCard';
import api from '../../config/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

const AdminSocialUpdatesScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    // Comment stats
    allComments: 0,
    mineComments: 0,
    approvedComments: 0,
    unapprovedComments: 0,
    spamComments: 0,
    trashComments: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    postType: '',
    search: '',
  });

  // Comment filter
  const [commentFilter, setCommentFilter] = useState('ALL');

  // Comment date filter
  const [commentDateFilter, setCommentDateFilter] = useState('ALL_TIME');
  const [customCommentDateModalVisible, setCustomCommentDateModalVisible] = useState(false);
  const [customCommentDateRange, setCustomCommentDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Modal States
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postType: 'general',
    category: '',
    tags: '',
    visibility: 'public',
  });
  const [selectedImages, setSelectedImages] = useState([]);

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [filters.page, filters.status, filters.postType, filters.search]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Ensure API is initialized
      await api.init();
      
      // Prepare filters for API call
      const apiFilters = {
        page: filters.page || 1,
        limit: filters.limit || 10,
      };
      
      if (filters.status && filters.status !== '') {
        apiFilters.status = filters.status;
      }
      if (filters.postType && filters.postType !== '') {
        apiFilters.postType = filters.postType;
      }
      if (filters.search && filters.search.trim() !== '') {
        apiFilters.search = filters.search.trim();
      }
      
      console.log('Loading social updates with filters:', apiFilters);
      
      const [postsResponse, statsResponse] = await Promise.all([
        api.getAdminSocialUpdates(apiFilters),
        api.getSocialUpdateStats(),
      ]);

      console.log('Posts response:', postsResponse);
      console.log('Stats response:', statsResponse);

      if (postsResponse) {
        if (postsResponse.socialUpdates && Array.isArray(postsResponse.socialUpdates)) {
          setPosts(postsResponse.socialUpdates);
          calculateCommentStats(postsResponse.socialUpdates);
        } else if (Array.isArray(postsResponse)) {
          setPosts(postsResponse);
          calculateCommentStats(postsResponse);
        }
        
        if (postsResponse.pagination) {
          setPagination(postsResponse.pagination);
        } else {
          setPagination({
            currentPage: apiFilters.page,
            totalPages: 1,
            totalItems: Array.isArray(postsResponse.socialUpdates) ? postsResponse.socialUpdates.length : (Array.isArray(postsResponse) ? postsResponse.length : 0),
          });
        }
      }

      if (statsResponse) {
        setStats(prevStats => ({
          ...prevStats,
          ...statsResponse
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        endpoint: '/social-updates/admin/all',
        baseURL: api.baseURL
      });
      Alert.alert('Error', error.message || 'Failed to load social updates');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateCommentStats = (postsData) => {
    let allComments = 0;
    let mineComments = 0;
    let approvedComments = 0;
    let unapprovedComments = 0;
    let spamComments = 0;
    let trashComments = 0;

    postsData.forEach(post => {
      if (post.comments && Array.isArray(post.comments)) {
        post.comments.forEach(comment => {
          allComments++;

          // Mine/Admin comments (check if comment is from admin)
          if (comment.isAdmin || comment.user?.role === 'admin' || comment.user?.role === 'ADMIN') {
            mineComments++;
          }

          // Approved comments
          if (comment.status === 'approved' || comment.isApproved) {
            approvedComments++;
          }

          // Unapproved comments
          if (comment.status === 'pending' || comment.status === 'unapproved' || (!comment.isApproved && comment.status !== 'approved')) {
            unapprovedComments++;
          }

          // Spam comments
          if (comment.status === 'spam' || comment.isSpam) {
            spamComments++;
          }

          // Trash comments
          if (comment.status === 'trash' || comment.isDeleted || comment.deleted) {
            trashComments++;
          }
        });
      }
    });

    setStats(prevStats => ({
      ...prevStats,
      allComments,
      mineComments,
      approvedComments,
      unapprovedComments,
      spamComments,
      trashComments,
    }));
  };

  const getFilteredComments = (comments) => {
    if (!comments || !Array.isArray(comments)) return [];

    // First filter by status
    let filtered = comments;
    switch (commentFilter) {
      case 'MINE':
        filtered = comments.filter(c => c.isAdmin || c.user?.role === 'admin' || c.user?.role === 'ADMIN');
        break;
      case 'APPROVED':
        filtered = comments.filter(c => c.status === 'approved' || c.isApproved);
        break;
      case 'UNAPPROVED':
        filtered = comments.filter(c => c.status === 'pending' || c.status === 'unapproved' || (!c.isApproved && c.status !== 'approved'));
        break;
      case 'SPAM':
        filtered = comments.filter(c => c.status === 'spam' || c.isSpam);
        break;
      case 'TRASH':
        filtered = comments.filter(c => c.status === 'trash' || c.isDeleted || c.deleted);
        break;
      case 'ALL':
      default:
        filtered = comments;
    }

    // Then filter by date
    return filterCommentsByDate(filtered);
  };

  const filterCommentsByDate = (comments) => {
    if (commentDateFilter === 'ALL_TIME') {
      return comments;
    }

    const now = new Date();
    let startDate;

    switch (commentDateFilter) {
      case 'LAST_24_HOURS':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'LAST_7_DAYS':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_14_DAYS':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_30_DAYS':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_90_DAYS':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_120_DAYS':
        startDate = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_6_MONTHS':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_9_MONTHS':
        startDate = new Date(now.getTime() - 270 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_12_MONTHS':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'CUSTOM':
        if (customCommentDateRange.startDate && customCommentDateRange.endDate) {
          const customStart = new Date(customCommentDateRange.startDate);
          const customEnd = new Date(customCommentDateRange.endDate);
          customEnd.setHours(23, 59, 59, 999);
          return comments.filter(comment => {
            const commentDate = new Date(comment.createdAt);
            return commentDate >= customStart && commentDate <= customEnd;
          });
        }
        return comments;
      default:
        return comments;
    }

    return comments.filter(comment => {
      const commentDate = new Date(comment.createdAt);
      return commentDate >= startDate;
    });
  };

  const handleCustomCommentDateApply = () => {
    if (!customCommentDateRange.startDate || !customCommentDateRange.endDate) {
      Alert.alert('Validation Error', 'Please select both start and end dates');
      return;
    }

    const start = new Date(customCommentDateRange.startDate);
    const end = new Date(customCommentDateRange.endDate);

    if (start > end) {
      Alert.alert('Validation Error', 'Start date must be before end date');
      return;
    }

    setCommentDateFilter('CUSTOM');
    setCustomCommentDateModalVisible(false);
  };

  const getCommentDateFilterLabel = () => {
    switch (commentDateFilter) {
      case 'LAST_24_HOURS': return 'Last 24 Hours';
      case 'LAST_7_DAYS': return 'Last 7 Days';
      case 'LAST_14_DAYS': return 'Last 14 Days';
      case 'LAST_30_DAYS': return 'Last 30 Days';
      case 'LAST_90_DAYS': return 'Last 90 Days';
      case 'LAST_120_DAYS': return 'Last 120 Days';
      case 'LAST_6_MONTHS': return 'Last 6 Months';
      case 'LAST_9_MONTHS': return 'Last 9 Months';
      case 'LAST_12_MONTHS': return 'Last 12 Months';
      case 'CUSTOM': return 'Custom Date';
      case 'ALL_TIME':
      default: return 'All Time';
    }
  };


  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };


  const openCreateModal = () => {
    setFormData({
      title: '',
      content: '',
      postType: 'general',
      category: '',
      tags: '',
      visibility: 'public',
    });
    setSelectedImages([]);
    setEditingPost(null);
    setCreateModalVisible(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      postType: post.postType || 'general',
      category: post.category || '',
      tags: post.tags ? (Array.isArray(post.tags) ? post.tags.join(', ') : post.tags) : '',
      visibility: post.visibility || 'public',
    });
    setSelectedImages([]);
    setEditModalVisible(true);
  };

  const handlePickImage = async () => {
    try {
      // Request permission
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant permission to access photos');
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        // Add new images to existing ones (max 5 images)
        const newImages = result.assets.slice(0, 5 - selectedImages.length);
        setSelectedImages([...selectedImages, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    try {
      // Validation
      if (!formData.title.trim()) {
        Alert.alert('Validation Error', 'Please enter a title');
        return;
      }
      if (!formData.content.trim()) {
        Alert.alert('Validation Error', 'Please enter content');
        return;
      }

      setSaving(true);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('postType', formData.postType);
      formDataToSend.append('category', formData.category.trim());
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('visibility', formData.visibility);

      // Add images to form data
      if (selectedImages.length > 0) {
        selectedImages.forEach((image, index) => {
          const uriParts = image.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          
          formDataToSend.append('media', {
            uri: image.uri,
            name: `image_${index}.${fileType}`,
            type: `image/${fileType}`,
          });
        });
      }

      const response = await api.createSocialUpdate(formDataToSend);

      if (response && response.socialUpdate) {
        Alert.alert('Success', 'Social update posted successfully');
        setCreateModalVisible(false);
        setSelectedImages([]);
        loadData();
      } else {
        Alert.alert('Error', response.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
      // Validation
      if (!formData.title.trim()) {
        Alert.alert('Validation Error', 'Please enter a title');
        return;
      }
      if (!formData.content.trim()) {
        Alert.alert('Validation Error', 'Please enter content');
        return;
      }

      setSaving(true);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('postType', formData.postType);
      formDataToSend.append('category', formData.category.trim());
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('visibility', formData.visibility);

      // Add images to form data
      if (selectedImages.length > 0) {
        selectedImages.forEach((image, index) => {
          const uriParts = image.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          
          formDataToSend.append('media', {
            uri: image.uri,
            name: `image_${index}.${fileType}`,
            type: `image/${fileType}`,
          });
        });
      }

      const response = await api.updateSocialUpdate(editingPost._id, formDataToSend);

      if (response && response.socialUpdate) {
        Alert.alert('Success', 'Social update updated successfully');
        setEditModalVisible(false);
        setEditingPost(null);
        setSelectedImages([]);
        loadData();
      } else {
        Alert.alert('Error', response.message || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', error.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (post) => {
    setSelectedPost(post);
    setDetailModalVisible(true);
  };

  const handleModerate = (action) => {
    if (!selectedPost) return;

    const actionText = action.charAt(0).toUpperCase() + action.slice(1);
    Alert.alert(
      `${actionText} Post`,
      `Are you sure you want to ${action} this post?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText,
          onPress: async () => {
            try {
              const response = await api.moderateSocialUpdate(selectedPost._id, action);
              if (response) {
                Alert.alert('Success', `Post ${action}ed successfully`);
                setDetailModalVisible(false);
                loadData();
              }
            } catch (error) {
              console.error('Error moderating post:', error);
              Alert.alert('Error', 'Failed to moderate post');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (post) => {
    Alert.alert(
      'Delete Post',
      `Are you sure you want to delete "${post.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteSocialUpdate(post._id);
              Alert.alert('Success', 'Post deleted successfully');
              if (detailModalVisible) {
                setDetailModalVisible(false);
              }
              loadData();
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPostTypeLabel = (type) => {
    const labels = {
      job_announcement: 'Job Announcement',
      company_update: 'Company Update',
      industry_news: 'Industry News',
      career_tips: 'Career Tips',
      event_announcement: 'Event Announcement',
      general: 'General',
    };
    return labels[type] || type;
  };

  const renderStatCard = (title, value, icon, color) => (
    <View style={[dynamicStyles.statCard, { borderLeftColor: color }]}>
      <View style={[dynamicStyles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={dynamicStyles.statContent}>
        <Text style={dynamicStyles.statValue}>{value}</Text>
        <Text style={dynamicStyles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderPostCard = (post) => (
    <AdminPostCard
      key={post._id}
      post={post}
      onUpdate={loadData}
      onEdit={() => openEditModal(post)}
      onDelete={() => handleDelete(post)}
      onViewDetails={() => handleViewDetails(post)}
    />
  );

  if (loading && !refreshing) {
    return (
      <AdminLayout
        title="Social Updates"
        activeScreen="AdminSocialUpdates"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading social updates...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Social Updates"
      activeScreen="AdminSocialUpdates"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <ScrollView
        style={dynamicStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.pageTitle}>Social Updates</Text>
            <Text style={dynamicStyles.pageSubtitle}>
              Manage social media posts and interactions
            </Text>
          </View>
          <TouchableOpacity style={dynamicStyles.primaryButton} onPress={openCreateModal}>
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={dynamicStyles.primaryButtonText}>Create Post</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.statsRow}>
            {renderStatCard('Total Posts', stats.total || 0, 'newspaper-outline', colors.primary)}
            {renderStatCard('Published', stats.published || 0, 'checkmark-circle-outline', colors.success)}
          </View>
          <View style={dynamicStyles.statsRow}>
            {renderStatCard('Total Likes', stats.totalLikes || 0, 'heart-outline', colors.error)}
            {renderStatCard('Total Comments', stats.totalComments || 0, 'chatbubble-outline', '#6366F1')}
          </View>
          <View style={dynamicStyles.statsRow}>
            {renderStatCard('Total Shares', stats.totalShares || 0, 'share-social-outline', '#10B981')}
            {renderStatCard('Total Reposts', posts.reduce((sum, p) => sum + (p.repostCount || 0), 0), 'repeat-outline', '#8B5CF6')}
          </View>
        </View>

        {/* Comment Statistics */}
        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.sectionHeaderRow}>
            <Text style={dynamicStyles.sectionTitle}>Comment Statistics</Text>
            <View style={dynamicStyles.dateFilterContainer}>
              <Ionicons name="calendar-outline" size={16} color="#64748B" />
              <Text style={dynamicStyles.dateFilterLabel}>{getCommentDateFilterLabel()}</Text>
            </View>
          </View>

          {/* Date Filter Options */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={dynamicStyles.dateFilterScroll}
            contentContainerStyle={dynamicStyles.dateFilterContent}
          >
            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'ALL_TIME' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('ALL_TIME')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'ALL_TIME' && dynamicStyles.dateFilterChipTextActive]}>
                All Time
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_24_HOURS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_24_HOURS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_24_HOURS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 24 Hours
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_7_DAYS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_7_DAYS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_7_DAYS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 7 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_14_DAYS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_14_DAYS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_14_DAYS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 14 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_30_DAYS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_30_DAYS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_30_DAYS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 30 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_90_DAYS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_90_DAYS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_90_DAYS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 90 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_120_DAYS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_120_DAYS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_120_DAYS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 120 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_6_MONTHS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_6_MONTHS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_6_MONTHS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 6 Months
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_9_MONTHS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_9_MONTHS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_9_MONTHS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 9 Months
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_12_MONTHS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_12_MONTHS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_12_MONTHS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 12 Months
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'CUSTOM' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCustomCommentDateModalVisible(true)}
            >
              <Ionicons name="calendar" size={14} color={commentDateFilter === 'CUSTOM' ? '#FFF' : '#4A90E2'} />
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'CUSTOM' && dynamicStyles.dateFilterChipTextActive]}>
                Custom Date
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={dynamicStyles.commentStatsScroll}
            contentContainerStyle={dynamicStyles.commentStatsContent}
          >
            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'ALL' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('ALL')}
            >
              <Ionicons name="chatbubbles-outline" size={24} color={commentFilter === 'ALL' ? '#FFF' : '#3498DB'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'ALL' && dynamicStyles.commentStatValueActive]}>
                {stats.allComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'ALL' && dynamicStyles.commentStatLabelActive]}>
                All Comments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'MINE' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('MINE')}
            >
              <Ionicons name="person-outline" size={24} color={commentFilter === 'MINE' ? '#FFF' : '#9B59B6'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'MINE' && dynamicStyles.commentStatValueActive]}>
                {stats.mineComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'MINE' && dynamicStyles.commentStatLabelActive]}>
                Mine/Admin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'APPROVED' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('APPROVED')}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={commentFilter === 'APPROVED' ? '#FFF' : '#27AE60'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'APPROVED' && dynamicStyles.commentStatValueActive]}>
                {stats.approvedComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'APPROVED' && dynamicStyles.commentStatLabelActive]}>
                Approved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'UNAPPROVED' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('UNAPPROVED')}
            >
              <Ionicons name="time-outline" size={24} color={commentFilter === 'UNAPPROVED' ? '#FFF' : '#F39C12'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'UNAPPROVED' && dynamicStyles.commentStatValueActive]}>
                {stats.unapprovedComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'UNAPPROVED' && dynamicStyles.commentStatLabelActive]}>
                Unapproved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'SPAM' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('SPAM')}
            >
              <Ionicons name="warning-outline" size={24} color={commentFilter === 'SPAM' ? '#FFF' : '#E67E22'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'SPAM' && dynamicStyles.commentStatValueActive]}>
                {stats.spamComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'SPAM' && dynamicStyles.commentStatLabelActive]}>
                Spam
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'TRASH' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('TRASH')}
            >
              <Ionicons name="trash-outline" size={24} color={commentFilter === 'TRASH' ? '#FFF' : '#E74C3C'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'TRASH' && dynamicStyles.commentStatValueActive]}>
                {stats.trashComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'TRASH' && dynamicStyles.commentStatLabelActive]}>
                Trash
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Filters */}
        <View style={dynamicStyles.filtersContainer}>
          <Text style={dynamicStyles.filtersTitle}>Filters</Text>
          
          <View style={dynamicStyles.filterRow}>
            <TextInput
              style={dynamicStyles.searchInput}
              value={filters.search || ''}
              onChangeText={(text) => setFilters({ ...filters, search: text, page: 1 })}
              placeholder="Search posts..."
              placeholderTextColor={colors.textSecondary}
              onSubmitEditing={() => loadData()}
            />
          </View>

          <View style={dynamicStyles.filterRow}>
            <View style={dynamicStyles.filterItem}>
              <Text style={dynamicStyles.filterLabel}>Status</Text>
              <View style={dynamicStyles.picker}>
                <Picker
                  selectedValue={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value, page: 1 })
                  }
                  style={dynamicStyles.pickerInput}
                >
                  <Picker.Item label="All Statuses" value="" />
                  <Picker.Item label="Published" value="published" />
                  <Picker.Item label="Draft" value="draft" />
                  <Picker.Item label="Archived" value="archived" />
                </Picker>
              </View>
            </View>

            <View style={dynamicStyles.filterItem}>
              <Text style={dynamicStyles.filterLabel}>Post Type</Text>
              <View style={dynamicStyles.picker}>
                <Picker
                  selectedValue={filters.postType}
                  onValueChange={(value) =>
                    setFilters({ ...filters, postType: value, page: 1 })
                  }
                  style={dynamicStyles.pickerInput}
                >
                  <Picker.Item label="All Types" value="" />
                  <Picker.Item label="Job Announcement" value="job_announcement" />
                  <Picker.Item label="Company Update" value="company_update" />
                  <Picker.Item label="Industry News" value="industry_news" />
                  <Picker.Item label="Career Tips" value="career_tips" />
                  <Picker.Item label="Event" value="event_announcement" />
                  <Picker.Item label="General" value="general" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Posts List */}
        <View style={dynamicStyles.postsContainer}>
          <Text style={dynamicStyles.postsTitle}>
            Posts ({pagination.totalItems} total)
          </Text>
          {posts.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="newspaper-outline" size={64} color={colors.border} />
              <Text style={dynamicStyles.emptyStateTitle}>No posts found</Text>
              <Text style={dynamicStyles.emptyStateText}>
                Create your first social update to get started
              </Text>
              <TouchableOpacity style={dynamicStyles.emptyStateButton} onPress={openCreateModal}>
                <Text style={dynamicStyles.emptyStateButtonText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            posts.map((post) => renderPostCard(post))
          )}
        </View>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <View style={dynamicStyles.paginationContainer}>
            <TouchableOpacity
              style={[
                dynamicStyles.paginationButton,
                filters.page === 1 && dynamicStyles.paginationButtonDisabled,
              ]}
              onPress={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={filters.page === 1 ? colors.border : colors.primary}
              />
            </TouchableOpacity>
            <Text style={dynamicStyles.paginationText}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </Text>
            <TouchableOpacity
              style={[
                dynamicStyles.paginationButton,
                filters.page === pagination.totalPages && dynamicStyles.paginationButtonDisabled,
              ]}
              onPress={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.totalPages}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={
                  filters.page === pagination.totalPages ? colors.border : colors.primary
                }
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <TouchableOpacity 
            style={dynamicStyles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setCreateModalVisible(false)}
          />
          <View style={dynamicStyles.modalContainer}>
            {/* Enhanced Header with Gradient Effect */}
            <View style={dynamicStyles.modalHeader}>
              <View style={dynamicStyles.modalHeaderContent}>
                <View style={dynamicStyles.modalIconContainer}>
                  <Ionicons name="create-outline" size={28} color="#4A90E2" />
                </View>
                <View style={dynamicStyles.modalTitleContainer}>
                  <Text style={dynamicStyles.modalTitle}>Create Social Update</Text>
                  <Text style={dynamicStyles.modalSubtitle}>Share your thoughts with the community</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setCreateModalVisible(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={dynamicStyles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Title Input with Icon */}
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="text-outline" size={18} color="#4A90E2" />
                  <Text style={dynamicStyles.label}>Title</Text>
                  <View style={dynamicStyles.requiredBadge}>
                    <Text style={dynamicStyles.requiredText}>Required</Text>
                  </View>
                </View>
                <View style={dynamicStyles.inputWrapper}>
                  <TextInput
                    style={dynamicStyles.input}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    placeholder="Enter an engaging title..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Content Input with Icon */}
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="document-text-outline" size={18} color="#4A90E2" />
                  <Text style={dynamicStyles.label}>Content</Text>
                  <View style={dynamicStyles.requiredBadge}>
                    <Text style={dynamicStyles.requiredText}>Required</Text>
                  </View>
                </View>
                <View style={dynamicStyles.inputWrapper}>
                  <TextInput
                    style={[dynamicStyles.input, dynamicStyles.textArea]}
                    value={formData.content}
                    onChangeText={(text) => setFormData({ ...formData, content: text })}
                    placeholder="Share your story, announcement, or update..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                  />
                  <Text style={dynamicStyles.charCount}>{formData.content.length} characters</Text>
                </View>
              </View>

              {/* Two Column Layout for Selects */}
              <View style={dynamicStyles.twoColumnRow}>
                {/* Post Type */}
                <View style={[dynamicStyles.inputGroup, dynamicStyles.halfWidth]}>
                  <View style={dynamicStyles.labelRow}>
                    <Ionicons name="pricetag-outline" size={18} color="#4A90E2" />
                    <Text style={dynamicStyles.label}>Post Type</Text>
                  </View>
                  <View style={dynamicStyles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.postType}
                      onValueChange={(value) => setFormData({ ...formData, postType: value })}
                      style={dynamicStyles.pickerInput}
                    >
                      <Picker.Item label="General" value="general" />
                      <Picker.Item label="Job Announcement" value="job_announcement" />
                      <Picker.Item label="Company Update" value="company_update" />
                      <Picker.Item label="Industry News" value="industry_news" />
                      <Picker.Item label="Career Tips" value="career_tips" />
                      <Picker.Item label="Event" value="event_announcement" />
                    </Picker>
                  </View>
                </View>

                {/* Visibility */}
                <View style={[dynamicStyles.inputGroup, dynamicStyles.halfWidth]}>
                  <View style={dynamicStyles.labelRow}>
                    <Ionicons name="eye-outline" size={18} color="#4A90E2" />
                    <Text style={dynamicStyles.label}>Visibility</Text>
                  </View>
                  <View style={dynamicStyles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.visibility}
                      onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                      style={dynamicStyles.pickerInput}
                    >
                      <Picker.Item label="🌍 Public" value="public" />
                      <Picker.Item label="👥 Followers Only" value="followers_only" />
                      <Picker.Item label="🔒 Private" value="private" />
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Category Input */}
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="folder-outline" size={18} color="#4A90E2" />
                  <Text style={dynamicStyles.label}>Category</Text>
                  <Text style={dynamicStyles.optionalText}>Optional</Text>
                </View>
                <View style={dynamicStyles.inputWrapper}>
                  <TextInput
                    style={dynamicStyles.input}
                    value={formData.category}
                    onChangeText={(text) => setFormData({ ...formData, category: text })}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Tags Input */}
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="pricetags-outline" size={18} color="#4A90E2" />
                  <Text style={dynamicStyles.label}>Tags</Text>
                  <Text style={dynamicStyles.optionalText}>Optional</Text>
                </View>
                <View style={dynamicStyles.inputWrapper}>
                  <TextInput
                    style={dynamicStyles.input}
                    value={formData.tags}
                    onChangeText={(text) => setFormData({ ...formData, tags: text })}
                    placeholder="hiring, remote, tech, career (comma separated)"
                    placeholderTextColor="#94A3B8"
                  />
                  <Text style={dynamicStyles.hint}>💡 Use relevant tags to increase discoverability</Text>
                </View>
              </View>

              {/* Images Section */}
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="images-outline" size={18} color="#4A90E2" />
                  <Text style={dynamicStyles.label}>Media</Text>
                  <Text style={dynamicStyles.optionalText}>Optional</Text>
                </View>
                
                {/* Image Preview Grid */}
                {selectedImages.length > 0 && (
                  <View style={dynamicStyles.imagesPreviewContainer}>
                    {selectedImages.map((image, index) => (
                      <View key={index} style={dynamicStyles.imagePreviewWrapper}>
                        <Image source={{ uri: image.uri }} style={dynamicStyles.imagePreview} />
                        <TouchableOpacity
                          style={dynamicStyles.removeImageButton}
                          onPress={() => handleRemoveImage(index)}
                        >
                          <Ionicons name="close-circle" size={28} color="#EF4444" />
                        </TouchableOpacity>
                        <View style={dynamicStyles.imageIndexBadge}>
                          <Text style={dynamicStyles.imageIndexText}>{index + 1}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add Image Button */}
                {selectedImages.length < 5 && (
                  <TouchableOpacity
                    style={dynamicStyles.addImageButton}
                    onPress={handlePickImage}
                  >
                    <View style={dynamicStyles.addImageIconContainer}>
                      <Ionicons name="cloud-upload-outline" size={32} color="#4A90E2" />
                    </View>
                    <Text style={dynamicStyles.addImageButtonText}>
                      {selectedImages.length > 0 ? 'Add More Images' : 'Upload Images'}
                    </Text>
                    <Text style={dynamicStyles.addImageButtonSubtext}>
                      {selectedImages.length}/5 images • PNG, JPG up to 10MB
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            {/* Enhanced Footer */}
            <View style={dynamicStyles.modalFooter}>
              <TouchableOpacity
                style={dynamicStyles.cancelButton}
                onPress={() => setCreateModalVisible(false)}
              >
                <Ionicons name="close-outline" size={20} color="#64748B" />
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.saveButton, saving && dynamicStyles.saveButtonDisabled]}
                onPress={handleCreatePost}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={dynamicStyles.saveButtonText}>Publishing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <Text style={dynamicStyles.saveButtonText}>Publish Post</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <TouchableOpacity 
            style={dynamicStyles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          />
          <View style={dynamicStyles.modalContainer}>
            {/* Enhanced Header */}
            <View style={dynamicStyles.modalHeader}>
              <View style={dynamicStyles.modalHeaderContent}>
                <View style={dynamicStyles.modalIconContainer}>
                  <Ionicons name="create" size={28} color="#10B981" />
                </View>
                <View style={dynamicStyles.modalTitleContainer}>
                  <Text style={dynamicStyles.modalTitle}>Edit Social Update</Text>
                  <Text style={dynamicStyles.modalSubtitle}>Update your post content and settings</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={dynamicStyles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Title Input with Icon */}
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="text-outline" size={18} color="#10B981" />
                  <Text style={dynamicStyles.label}>Title</Text>
                  <View style={dynamicStyles.requiredBadge}>
                    <Text style={dynamicStyles.requiredText}>Required</Text>
                  </View>
                </View>
                <View style={dynamicStyles.inputWrapper}>
                  <TextInput
                    style={dynamicStyles.input}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    placeholder="Enter an engaging title..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Content Input with Icon */}
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="document-text-outline" size={18} color="#10B981" />
                  <Text style={dynamicStyles.label}>Content</Text>
                  <View style={dynamicStyles.requiredBadge}>
                    <Text style={dynamicStyles.requiredText}>Required</Text>
                  </View>
                </View>
                <View style={dynamicStyles.inputWrapper}>
                  <TextInput
                    style={[dynamicStyles.input, dynamicStyles.textArea]}
                    value={formData.content}
                    onChangeText={(text) => setFormData({ ...formData, content: text })}
                    placeholder="Share your story, announcement, or update..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                  />
                  <Text style={dynamicStyles.charCount}>{formData.content.length} characters</Text>
                </View>
              </View>

              {/* Two Column Layout for Selects */}
              <View style={dynamicStyles.twoColumnRow}>
                {/* Post Type */}
                <View style={[dynamicStyles.inputGroup, dynamicStyles.halfWidth]}>
                  <View style={dynamicStyles.labelRow}>
                    <Ionicons name="pricetag-outline" size={18} color="#10B981" />
                    <Text style={dynamicStyles.label}>Post Type</Text>
                  </View>
                  <View style={dynamicStyles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.postType}
                      onValueChange={(value) => setFormData({ ...formData, postType: value })}
                      style={dynamicStyles.pickerInput}
                    >
                      <Picker.Item label="General" value="general" />
                      <Picker.Item label="Job Announcement" value="job_announcement" />
                      <Picker.Item label="Company Update" value="company_update" />
                      <Picker.Item label="Industry News" value="industry_news" />
                      <Picker.Item label="Career Tips" value="career_tips" />
                      <Picker.Item label="Event" value="event_announcement" />
                    </Picker>
                  </View>
                </View>

                {/* Visibility */}
                <View style={[dynamicStyles.inputGroup, dynamicStyles.halfWidth]}>
                  <View style={dynamicStyles.labelRow}>
                    <Ionicons name="eye-outline" size={18} color="#10B981" />
                    <Text style={dynamicStyles.label}>Visibility</Text>
                  </View>
                  <View style={dynamicStyles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.visibility}
                      onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                      style={dynamicStyles.pickerInput}
                    >
                      <Picker.Item label="🌍 Public" value="public" />
                      <Picker.Item label="👥 Followers Only" value="followers_only" />
                      <Picker.Item label="🔒 Private" value="private" />
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Category Input */}
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="folder-outline" size={18} color="#10B981" />
                  <Text style={dynamicStyles.label}>Category</Text>
                  <Text style={dynamicStyles.optionalText}>Optional</Text>
                </View>
                <View style={dynamicStyles.inputWrapper}>
                  <TextInput
                    style={dynamicStyles.input}
                    value={formData.category}
                    onChangeText={(text) => setFormData({ ...formData, category: text })}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Tags Input */}
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="pricetags-outline" size={18} color="#10B981" />
                  <Text style={dynamicStyles.label}>Tags</Text>
                  <Text style={dynamicStyles.optionalText}>Optional</Text>
                </View>
                <View style={dynamicStyles.inputWrapper}>
                  <TextInput
                    style={dynamicStyles.input}
                    value={formData.tags}
                    onChangeText={(text) => setFormData({ ...formData, tags: text })}
                    placeholder="hiring, remote, tech, career (comma separated)"
                    placeholderTextColor="#94A3B8"
                  />
                  <Text style={dynamicStyles.hint}>💡 Use relevant tags to increase discoverability</Text>
                </View>
              </View>

              {/* Images Section */}
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="images-outline" size={18} color="#10B981" />
                  <Text style={dynamicStyles.label}>Media</Text>
                  <Text style={dynamicStyles.optionalText}>Optional</Text>
                </View>
                
                {/* Image Preview Grid */}
                {selectedImages.length > 0 && (
                  <View style={dynamicStyles.imagesPreviewContainer}>
                    {selectedImages.map((image, index) => (
                      <View key={index} style={dynamicStyles.imagePreviewWrapper}>
                        <Image source={{ uri: image.uri }} style={dynamicStyles.imagePreview} />
                        <TouchableOpacity
                          style={dynamicStyles.removeImageButton}
                          onPress={() => handleRemoveImage(index)}
                        >
                          <Ionicons name="close-circle" size={28} color="#EF4444" />
                        </TouchableOpacity>
                        <View style={dynamicStyles.imageIndexBadge}>
                          <Text style={dynamicStyles.imageIndexText}>{index + 1}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add Image Button */}
                {selectedImages.length < 5 && (
                  <TouchableOpacity
                    style={dynamicStyles.addImageButton}
                    onPress={handlePickImage}
                  >
                    <View style={dynamicStyles.addImageIconContainer}>
                      <Ionicons name="cloud-upload-outline" size={32} color="#10B981" />
                    </View>
                    <Text style={dynamicStyles.addImageButtonText}>
                      {selectedImages.length > 0 ? 'Add More Images' : 'Upload Images'}
                    </Text>
                    <Text style={dynamicStyles.addImageButtonSubtext}>
                      {selectedImages.length}/5 images • PNG, JPG up to 10MB
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            {/* Enhanced Footer */}
            <View style={dynamicStyles.modalFooter}>
              <TouchableOpacity
                style={dynamicStyles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Ionicons name="close-outline" size={20} color="#64748B" />
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.saveButton, saving && dynamicStyles.saveButtonDisabled]}
                onPress={handleUpdatePost}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={dynamicStyles.saveButtonText}>Updating...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <Text style={dynamicStyles.saveButtonText}>Update Post</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDetailModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Post Details</Text>
              <TouchableOpacity 
                onPress={() => setDetailModalVisible(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

          {selectedPost && (
            <ScrollView style={dynamicStyles.modalContent}>
              {/* Post Info */}
              <View style={dynamicStyles.detailSection}>
                <Text style={dynamicStyles.detailSectionTitle}>Post Information</Text>
                
                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>Title:</Text>
                  <Text style={dynamicStyles.detailValue}>{selectedPost.title}</Text>
                </View>

                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>Author:</Text>
                  <Text style={dynamicStyles.detailValue}>{selectedPost.authorName}</Text>
                </View>

                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>Type:</Text>
                  <Text style={dynamicStyles.detailValue}>
                    {getPostTypeLabel(selectedPost.postType)}
                  </Text>
                </View>

                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>Status:</Text>
                  <Text style={dynamicStyles.detailValue}>{selectedPost.status}</Text>
                </View>

                <View style={dynamicStyles.detailRow}>
                  <Text style={dynamicStyles.detailLabel}>Created:</Text>
                  <Text style={dynamicStyles.detailValue}>{formatDate(selectedPost.createdAt)}</Text>
                </View>
              </View>

              {/* Content */}
              <View style={dynamicStyles.detailSection}>
                <Text style={dynamicStyles.detailSectionTitle}>Content</Text>
                <Text style={dynamicStyles.detailContentText}>{selectedPost.content}</Text>
              </View>

              {/* Engagement Stats */}
              <View style={dynamicStyles.detailSection}>
                <Text style={dynamicStyles.detailSectionTitle}>Engagement</Text>
                
                <View style={dynamicStyles.statsGrid}>
                  <View style={dynamicStyles.statItem}>
                    <Ionicons name="heart" size={24} color={colors.error} />
                    <Text style={dynamicStyles.statItemValue}>{selectedPost.engagement?.likes || 0}</Text>
                    <Text style={dynamicStyles.statItemLabel}>Likes</Text>
                  </View>
                  <View style={dynamicStyles.statItem}>
                    <Ionicons name="chatbubble" size={24} color={colors.primary} />
                    <Text style={dynamicStyles.statItemValue}>{selectedPost.engagement?.comments || 0}</Text>
                    <Text style={dynamicStyles.statItemLabel}>Comments</Text>
                  </View>
                  <View style={dynamicStyles.statItem}>
                    <Ionicons name="share-social" size={24} color={colors.success} />
                    <Text style={dynamicStyles.statItemValue}>{selectedPost.engagement?.shares || 0}</Text>
                    <Text style={dynamicStyles.statItemLabel}>Shares</Text>
                  </View>
                  <View style={dynamicStyles.statItem}>
                    <Ionicons name="eye" size={24} color={colors.info} />
                    <Text style={dynamicStyles.statItemValue}>{selectedPost.engagement?.views || 0}</Text>
                    <Text style={dynamicStyles.statItemLabel}>Views</Text>
                  </View>
                </View>
              </View>

              {/* Comments */}
              {selectedPost.comments && selectedPost.comments.length > 0 && (
                <View style={dynamicStyles.detailSection}>
                  <Text style={dynamicStyles.detailSectionTitle}>
                    Comments ({getFilteredComments(selectedPost.comments).length})
                    {commentFilter !== 'ALL' && ` - ${commentFilter}`}
                  </Text>
                  {getFilteredComments(selectedPost.comments).map((comment, index) => (
                    <View key={index} style={dynamicStyles.commentCard}>
                      <View style={dynamicStyles.commentHeader}>
                        <View style={dynamicStyles.commentAuthorRow}>
                          <Text style={dynamicStyles.commentAuthor}>
                            {comment.user?.firstName} {comment.user?.lastName}
                          </Text>
                          {(comment.isAdmin || comment.user?.role === 'admin' || comment.user?.role === 'ADMIN') && (
                            <View style={dynamicStyles.adminBadge}>
                              <Text style={dynamicStyles.adminBadgeText}>Admin</Text>
                            </View>
                          )}
                          {comment.status && (
                            <View style={[
                              dynamicStyles.commentStatusBadge,
                              comment.status === 'approved' && dynamicStyles.approvedBadge,
                              comment.status === 'pending' && dynamicStyles.pendingBadge,
                              comment.status === 'spam' && dynamicStyles.spamBadge,
                              comment.status === 'trash' && dynamicStyles.trashBadge,
                            ]}>
                              <Text style={dynamicStyles.commentStatusText}>{comment.status}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={dynamicStyles.commentDate}>
                          {formatDate(comment.createdAt)}
                        </Text>
                      </View>
                      <Text style={dynamicStyles.commentContent}>{comment.content}</Text>
                      {comment.likes > 0 && (
                        <View style={dynamicStyles.commentLikes}>
                          <Ionicons name="heart" size={14} color={colors.error} />
                          <Text style={dynamicStyles.commentLikesText}>{comment.likes} likes</Text>
                        </View>
                      )}
                    </View>
                  ))}
                  {getFilteredComments(selectedPost.comments).length === 0 && (
                    <Text style={dynamicStyles.noCommentsText}>
                      No {commentFilter.toLowerCase()} comments found
                    </Text>
                  )}
                </View>
              )}

              {/* Moderation Actions */}
              <View style={dynamicStyles.detailSection}>
                <Text style={dynamicStyles.detailSectionTitle}>Moderation Actions</Text>
                <View style={dynamicStyles.moderationActions}>
                  <TouchableOpacity
                    style={[dynamicStyles.moderationButton, dynamicStyles.pinButton]}
                    onPress={() => handleModerate('pin')}
                  >
                    <Ionicons
                      name={selectedPost.isPinned ? 'pin' : 'pin-outline'}
                      size={20}
                      color="#FFF"
                    />
                    <Text style={dynamicStyles.moderationButtonText}>
                      {selectedPost.isPinned ? 'Unpin' : 'Pin'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[dynamicStyles.moderationButton, dynamicStyles.featureButton]}
                    onPress={() => handleModerate('feature')}
                  >
                    <Ionicons
                      name={selectedPost.isFeatured ? 'star' : 'star-outline'}
                      size={20}
                      color="#FFF"
                    />
                    <Text style={dynamicStyles.moderationButtonText}>
                      {selectedPost.isFeatured ? 'Unfeature' : 'Feature'}
                    </Text>
                  </TouchableOpacity>

                  {selectedPost.status !== 'published' && (
                    <TouchableOpacity
                      style={[dynamicStyles.moderationButton, dynamicStyles.approveButton]}
                      onPress={() => handleModerate('approve')}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                      <Text style={dynamicStyles.moderationButtonText}>Approve</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[dynamicStyles.moderationButton, dynamicStyles.deleteButton]}
                    onPress={() => handleDelete(selectedPost)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FFF" />
                    <Text style={dynamicStyles.moderationButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
          </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Custom Comment Date Filter Modal */}
      <Modal
        visible={customCommentDateModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCustomCommentDateModalVisible(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <TouchableOpacity 
            style={dynamicStyles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setCustomCommentDateModalVisible(false)}
          />
          <View style={dynamicStyles.customDateModalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <View style={dynamicStyles.modalHeaderContent}>
                <View style={dynamicStyles.modalIconContainer}>
                  <Ionicons name="calendar" size={28} color="#4A90E2" />
                </View>
                <View style={dynamicStyles.modalTitleContainer}>
                  <Text style={dynamicStyles.modalTitle}>Custom Date Range</Text>
                  <Text style={dynamicStyles.modalSubtitle}>Filter comments by date range</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setCustomCommentDateModalVisible(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.customDateModalContent}>
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="calendar-outline" size={18} color="#4A90E2" />
                  <Text style={dynamicStyles.label}>Start Date</Text>
                </View>
                <TextInput
                  style={dynamicStyles.input}
                  value={customCommentDateRange.startDate}
                  onChangeText={(text) => setCustomCommentDateRange({ ...customCommentDateRange, startDate: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="calendar-outline" size={18} color="#4A90E2" />
                  <Text style={dynamicStyles.label}>End Date</Text>
                </View>
                <TextInput
                  style={dynamicStyles.input}
                  value={customCommentDateRange.endDate}
                  onChangeText={(text) => setCustomCommentDateRange({ ...customCommentDateRange, endDate: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Text style={dynamicStyles.hint}>
                💡 Enter dates in YYYY-MM-DD format (e.g., 2024-01-15)
              </Text>
            </View>

            <View style={dynamicStyles.modalFooter}>
              <TouchableOpacity
                style={dynamicStyles.cancelButton}
                onPress={() => setCustomCommentDateModalVisible(false)}
              >
                <Ionicons name="close-outline" size={20} color="#64748B" />
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={dynamicStyles.saveButton}
                onPress={handleCustomCommentDateApply}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={dynamicStyles.saveButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? spacing.md : isTablet ? spacing.lg : spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'flex-start',
    padding: isMobile ? spacing.md : isTablet ? spacing.lg - 4 : spacing.lg,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: isMobile ? spacing.md : 0,
  },
  pageTitle: {
    fontSize: isMobile ? 22 : isTablet ? 26 : 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: colors.textSecondary,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }),
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }),
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  postsContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }),
    overflow: 'hidden',
  },
  postHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  postTitleContainer: {},
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  postBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  typeBadge: {
    backgroundColor: '#E0E7FF',
  },
  pinnedBadge: {
    backgroundColor: '#F59E0B',
  },
  featuredBadge: {
    backgroundColor: '#8B5CF6',
  },
  publishedBadge: {
    backgroundColor: '#10B981',
  },
  draftBadge: {
    backgroundColor: '#6B7280',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  postBody: {
    padding: spacing.md,
  },
  postMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  postContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  engagementStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyStateButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  paginationButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  paginationButtonDisabled: {
    borderColor: colors.border,
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    color: colors.text,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: isMobile ? '95%' : isTablet ? '85%' : '90%',
    maxWidth: 800,
    maxHeight: '92%',
    overflow: 'hidden',
    ...shadows.lg,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    }),
    ...(Platform.OS !== 'web' && {
      elevation: 25,
    }),
  },
  customDateModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: isMobile ? '95%' : isTablet ? '70%' : '50%',
    maxWidth: 500,
    overflow: 'hidden',
    ...shadows.lg,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    }),
    ...(Platform.OS !== 'web' && {
      elevation: 25,
    }),
  },
  customDateModalContent: {
    padding: spacing.xl,
    backgroundColor: '#FAFBFC',
  },
  modalHeader: {
    backgroundColor: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: isMobile ? 12 : 14,
    color: '#64748B',
    fontWeight: '400',
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalContent: {
    padding: spacing.xl,
    backgroundColor: '#FAFBFC',
  },
  inputGroup: {
    marginBottom: spacing.lg + 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  requiredBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: spacing.xs,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#DC2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionalText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: spacing.md + 2,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
      transition: 'all 0.2s ease',
    }),
  },
  textArea: {
    minHeight: 140,
    paddingTop: spacing.md + 2,
  },
  charCount: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontSize: 11,
    color: '#94A3B8',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  twoColumnRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  halfWidth: {
    flex: 1,
    marginBottom: 0,
  },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...shadows.sm,
  },
  pickerInput: {
    height: 52,
    color: '#1E293B',
  },
  hint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  imagesPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: isMobile ? 100 : 120,
    height: isMobile ? 100 : 120,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    ...shadows.lg,
  },
  imageIndexBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addImageButton: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  addImageIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addImageButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A90E2',
    marginTop: spacing.sm,
  },
  addImageButtonSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg + 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md + 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: spacing.xs,
    ...shadows.sm,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md + 4,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    gap: spacing.xs,
    ...shadows.md,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Detail Modal Styles
  detailSection: {
    marginBottom: spacing.xl,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  detailContentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  statItemValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statItemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  commentCard: {
    backgroundColor: '#F9FAFB',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  commentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commentContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  commentLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  commentLikesText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moderationActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moderationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  pinButton: {
    backgroundColor: '#F59E0B',
  },
  featureButton: {
    backgroundColor: '#8B5CF6',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  moderationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  dateFilterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  dateFilterScroll: {
    marginBottom: spacing.md,
  },
  dateFilterContent: {
    paddingRight: spacing.md,
    gap: 8,
  },
  dateFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 4,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  dateFilterChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  dateFilterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  dateFilterChipTextActive: {
    color: '#FFFFFF',
  },
  commentStatsScroll: {
    marginTop: spacing.sm,
  },
  commentStatsContent: {
    paddingRight: spacing.md,
    gap: 12,
  },
  commentStatCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
        borderColor: '#4A90E2',
      },
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    }),
  },
  commentStatCardActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#4A90E2',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 8px rgba(74, 144, 226, 0.2)',
    } : {
      elevation: 4,
    }),
  },
  commentStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  commentStatValueActive: {
    color: '#FFF',
  },
  commentStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  commentStatLabelActive: {
    color: '#FFF',
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  adminBadge: {
    backgroundColor: '#9B59B6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  commentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  approvedBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  spamBadge: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
  },
  trashBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  commentStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  noCommentsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
    fontStyle: 'italic',
  },
});

const styles = StyleSheet.create({});

export default AdminSocialUpdatesScreen;
