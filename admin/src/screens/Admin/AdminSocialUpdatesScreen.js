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
  }, [filters.page, filters.status, filters.postType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsResponse, statsResponse] = await Promise.all([
        api.getAdminSocialUpdates(filters),
        api.getSocialUpdateStats(),
      ]);

      if (postsResponse && postsResponse.socialUpdates) {
        setPosts(postsResponse.socialUpdates);
        setPagination(postsResponse.pagination);
      }

      if (statsResponse) {
        setStats(statsResponse);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load social updates');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
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
    <TouchableOpacity
      key={post._id}
      style={dynamicStyles.postCard}
      onPress={() => handleViewDetails(post)}
      activeOpacity={0.7}
    >
      <View style={dynamicStyles.postHeader}>
        <View style={dynamicStyles.postTitleContainer}>
          <Text style={dynamicStyles.postTitle} numberOfLines={2}>
            {post.title}
          </Text>
          <View style={dynamicStyles.postBadges}>
            <View style={[dynamicStyles.badge, dynamicStyles.typeBadge]}>
              <Text style={dynamicStyles.badgeText}>{getPostTypeLabel(post.postType)}</Text>
            </View>
            {post.isPinned && (
              <View style={[dynamicStyles.badge, dynamicStyles.pinnedBadge]}>
                <Ionicons name="pin" size={12} color="#FFF" />
                <Text style={dynamicStyles.badgeText}>Pinned</Text>
              </View>
            )}
            {post.isFeatured && (
              <View style={[dynamicStyles.badge, dynamicStyles.featuredBadge]}>
                <Ionicons name="star" size={12} color="#FFF" />
                <Text style={dynamicStyles.badgeText}>Featured</Text>
              </View>
            )}
            <View
              style={[
                dynamicStyles.badge,
                post.status === 'published' ? dynamicStyles.publishedBadge : dynamicStyles.draftBadge,
              ]}
            >
              <Text style={dynamicStyles.badgeText}>
                {post.status === 'published' ? 'Published' : 'Draft'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={dynamicStyles.postBody}>
        <View style={dynamicStyles.postMeta}>
          <View style={dynamicStyles.metaItem}>
            <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
            <Text style={dynamicStyles.metaText}>{post.authorName}</Text>
          </View>
          <View style={dynamicStyles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={dynamicStyles.metaText}>{formatDate(post.createdAt)}</Text>
          </View>
        </View>

        <Text style={dynamicStyles.postContent} numberOfLines={3}>
          {post.content}
        </Text>

        <View style={dynamicStyles.engagementStats}>
          <View style={dynamicStyles.engagementItem}>
            <Ionicons name="heart" size={16} color={colors.error} />
            <Text style={dynamicStyles.engagementText}>{post.engagement?.likes || 0}</Text>
          </View>
          <View style={dynamicStyles.engagementItem}>
            <Ionicons name="chatbubble" size={16} color={colors.primary} />
            <Text style={dynamicStyles.engagementText}>{post.engagement?.comments || 0}</Text>
          </View>
          <View style={dynamicStyles.engagementItem}>
            <Ionicons name="share-social" size={16} color={colors.success} />
            <Text style={dynamicStyles.engagementText}>{post.engagement?.shares || 0}</Text>
          </View>
          <View style={dynamicStyles.engagementItem}>
            <Ionicons name="eye" size={16} color={colors.info} />
            <Text style={dynamicStyles.engagementText}>{post.engagement?.views || 0}</Text>
          </View>
        </View>
      </View>

      <View style={dynamicStyles.postActions}>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleViewDetails(post);
          }}
        >
          <Ionicons name="eye-outline" size={18} color={colors.primary} />
          <Text style={dynamicStyles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            openEditModal(post);
          }}
        >
          <Ionicons name="create-outline" size={18} color={colors.success} />
          <Text style={dynamicStyles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(post);
          }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={dynamicStyles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
        </View>

        {/* Filters */}
        <View style={dynamicStyles.filtersContainer}>
          <Text style={dynamicStyles.filtersTitle}>Filters</Text>
          
          <View style={dynamicStyles.filterRow}>
            <TextInput
              style={dynamicStyles.searchInput}
              value={filters.search}
              onChangeText={(text) => setFilters({ ...filters, search: text })}
              placeholder="Search posts..."
              placeholderTextColor={colors.textSecondary}
              onSubmitEditing={handleSearch}
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
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCreateModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Create Social Update</Text>
              <TouchableOpacity 
                onPress={() => setCreateModalVisible(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

          <ScrollView style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Title *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter post title..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Content *</Text>
              <TextInput
                style={[dynamicStyles.input, dynamicStyles.textArea]}
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                placeholder="Write your post content..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Post Type</Text>
              <View style={dynamicStyles.picker}>
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
                  <Picker.Item label="Event Announcement" value="event_announcement" />
                </Picker>
              </View>
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Category (Optional)</Text>
              <TextInput
                style={dynamicStyles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="e.g., Technology, Healthcare"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Tags (Optional)</Text>
              <TextInput
                style={dynamicStyles.input}
                value={formData.tags}
                onChangeText={(text) => setFormData({ ...formData, tags: text })}
                placeholder="e.g., hiring, remote, tech (comma separated)"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Visibility</Text>
              <View style={dynamicStyles.picker}>
                <Picker
                  selectedValue={formData.visibility}
                  onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                  style={dynamicStyles.pickerInput}
                >
                  <Picker.Item label="Public" value="public" />
                  <Picker.Item label="Followers Only" value="followers_only" />
                  <Picker.Item label="Private" value="private" />
                </Picker>
              </View>
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Images (Optional)</Text>
              <Text style={dynamicStyles.hint}>Add up to 5 images to your post</Text>
              
              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <View style={dynamicStyles.imagesPreviewContainer}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={dynamicStyles.imagePreviewWrapper}>
                      <Image source={{ uri: image.uri }} style={dynamicStyles.imagePreview} />
                      <TouchableOpacity
                        style={dynamicStyles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color={colors.error} />
                      </TouchableOpacity>
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
                  <Ionicons name="image-outline" size={24} color={colors.primary} />
                  <Text style={dynamicStyles.addImageButtonText}>
                    {selectedImages.length > 0 ? 'Add More Images' : 'Add Images'}
                  </Text>
                  <Text style={dynamicStyles.addImageButtonSubtext}>
                    {selectedImages.length}/5 images
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          <View style={dynamicStyles.modalFooter}>
            <TouchableOpacity
              style={dynamicStyles.cancelButton}
              onPress={() => setCreateModalVisible(false)}
            >
              <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.saveButton}
              onPress={handleCreatePost}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={dynamicStyles.saveButtonText}>Publish Post</Text>
              )}
            </TouchableOpacity>
          </View>
          </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        visible={editModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Edit Social Update</Text>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

          <ScrollView style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Title *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter post title..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Content *</Text>
              <TextInput
                style={[dynamicStyles.input, dynamicStyles.textArea]}
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                placeholder="Write your post content..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Post Type</Text>
              <View style={dynamicStyles.picker}>
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
                  <Picker.Item label="Event Announcement" value="event_announcement" />
                </Picker>
              </View>
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Category (Optional)</Text>
              <TextInput
                style={dynamicStyles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="e.g., Technology, Healthcare"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Tags (Optional)</Text>
              <TextInput
                style={dynamicStyles.input}
                value={formData.tags}
                onChangeText={(text) => setFormData({ ...formData, tags: text })}
                placeholder="e.g., hiring, remote, tech (comma separated)"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Visibility</Text>
              <View style={dynamicStyles.picker}>
                <Picker
                  selectedValue={formData.visibility}
                  onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                  style={dynamicStyles.pickerInput}
                >
                  <Picker.Item label="Public" value="public" />
                  <Picker.Item label="Followers Only" value="followers_only" />
                  <Picker.Item label="Private" value="private" />
                </Picker>
              </View>
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Images (Optional)</Text>
              <Text style={dynamicStyles.hint}>Add up to 5 images to your post</Text>
              
              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <View style={dynamicStyles.imagesPreviewContainer}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={dynamicStyles.imagePreviewWrapper}>
                      <Image source={{ uri: image.uri }} style={dynamicStyles.imagePreview} />
                      <TouchableOpacity
                        style={dynamicStyles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color={colors.error} />
                      </TouchableOpacity>
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
                  <Ionicons name="image-outline" size={24} color={colors.primary} />
                  <Text style={dynamicStyles.addImageButtonText}>
                    {selectedImages.length > 0 ? 'Add More Images' : 'Add Images'}
                  </Text>
                  <Text style={dynamicStyles.addImageButtonSubtext}>
                    {selectedImages.length}/5 images
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          <View style={dynamicStyles.modalFooter}>
            <TouchableOpacity
              style={dynamicStyles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.saveButton}
              onPress={handleUpdatePost}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={dynamicStyles.saveButtonText}>Update Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        </TouchableOpacity>
      </TouchableOpacity>
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
                    Comments ({selectedPost.comments.length})
                  </Text>
                  {selectedPost.comments.map((comment, index) => (
                    <View key={index} style={dynamicStyles.commentCard}>
                      <View style={dynamicStyles.commentHeader}>
                        <Text style={dynamicStyles.commentAuthor}>
                          {comment.user?.firstName} {comment.user?.lastName}
                        </Text>
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
  picker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFF',
  },
  pickerInput: {
    height: 48,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg + 8,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl + 16,
    padding: 0,
    width: '100%',
    maxWidth: 680,
    maxHeight: '90%',
    ...shadows.lg,
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
    borderTopLeftRadius: borderRadius.xl + 16,
    borderTopRightRadius: borderRadius.xl + 16,
    paddingHorizontal: spacing.xl + 20,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.lg + 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    ...typography.h4,
    color: '#0F172A',
    marginBottom: 0,
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalContent: {
    padding: spacing.xl + 20,
    maxHeight: '60vh',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      maxHeight: 'calc(85vh - 200px)',
    }),
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 120,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
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
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  imagesPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 3px rgba(0, 0, 0, 0.2)',
    } : {
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    }),
  },
  addImageButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  addImageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  addImageButtonSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

const styles = StyleSheet.create({});

export default AdminSocialUpdatesScreen;
