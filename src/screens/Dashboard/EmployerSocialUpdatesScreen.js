import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const EmployerSocialUpdatesScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const { isMobile } = responsive;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postType: 'general',
    category: '',
    tags: '',
    visibility: 'public',
  });
  const [selectedImages, setSelectedImages] = useState([]);

  const loadMyPosts = async () => {
    try {
      setLoading(true);
      const res = await api.getMySocialUpdates({ limit: 50 });
      setPosts(res.socialUpdates || []);
    } catch (e) {
      console.error('Load social updates error', e);
      Alert.alert('Error', 'Failed to load your social updates');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadMyPosts(); }, []);

  const handleDelete = (id) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.deleteSocialUpdate(id);
          await loadMyPosts();
          Alert.alert('Deleted', 'Post deleted successfully');
        } catch (e) {
          Alert.alert('Error', e.message || 'Failed to delete post');
        }
      } },
    ]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMyPosts();
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
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant permission to access photos');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
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

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
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
        loadMyPosts();
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

  const renderPost = (p) => (
    <View key={p._id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.postHeaderLeft}>
          <View style={styles.postTypeBadge}>
            <Ionicons name="megaphone" size={14} color="#3B82F6" />
            <Text style={styles.postTypeText}>{p.postType?.replace('_', ' ') || 'General'}</Text>
          </View>
          <Text style={styles.postTitle} numberOfLines={2}>{p.title}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewBtn]} 
            onPress={()=>navigation.navigate('SocialUpdates')}
            activeOpacity={0.7}
          >
            <Ionicons name="eye-outline" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editBtn]} 
            onPress={()=>openEditModal(p)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteBtn]} 
            onPress={()=>handleDelete(p._id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.postExcerpt} numberOfLines={3}>{p.content}</Text>
      <View style={styles.metaRow}>
        <View style={[styles.metaItem, styles.likesItem]}>
          <Ionicons name="heart" size={18} color="#EF4444" />
          <Text style={styles.metaText}>{p.engagement?.likes || 0}</Text>
        </View>
        <View style={[styles.metaItem, styles.commentsItem]}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#3B82F6" />
          <Text style={styles.metaText}>{p.engagement?.comments || 0}</Text>
        </View>
        <View style={[styles.metaItem, styles.sharesItem]}>
          <Ionicons name="share-social" size={18} color="#8B5CF6" />
          <Text style={styles.metaText}>{p.engagement?.shares || 0}</Text>
        </View>
      </View>
      {p.tags && p.tags.length>0 && (
        <View style={styles.tagsRow}>
          {p.tags.slice(0,4).map((t,i)=>(
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>#{t}</Text>
            </View>
          ))}
          {p.tags.length > 4 && (
            <Text style={styles.moreTagsText}>+{p.tags.length - 4} more</Text>
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading social updates…</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {!isMobile && (
        <View style={styles.sidebar}>
          <EmployerSidebar permanent navigation={navigation} role="company" activeKey="social" />
        </View>
      )}
      {isMobile && (
        <EmployerSidebar 
          visible={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          navigation={navigation} 
          role="company" 
          activeKey="social" 
        />
      )}
      {isMobile && (
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSidebarOpen(true)}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <View style={[styles.content, isMobile && styles.contentMobile]}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerBar, isMobile && styles.headerBarMobile]}
        >
          <View style={[styles.headerLeft, isMobile && styles.headerLeftMobile]}>
            <View style={[styles.headerIconContainer, isMobile && styles.headerIconContainerMobile]}>
              <Ionicons name="megaphone" size={isMobile ? 24 : 28} color="#3B82F6" />
            </View>
            <View>
              <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>Social Updates</Text>
              <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>Manage and track your social posts</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={()=>navigation.navigate('EmployerCreateSocialPost')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Create Post</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={styles.scrollContent} 
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh} 
              colors={[colors.primary]} 
              tintColor={colors.primary} 
            />
          }
        >
          {posts.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="newspaper-outline" size={80} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySub}>Create your first social update for everyone to see</Text>
              <TouchableOpacity 
                style={styles.emptyButton} 
                onPress={()=>navigation.navigate('EmployerCreateSocialPost')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyButtonGradient}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyButtonText}>Create Your First Post</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            posts.map(renderPost)
          )}
        </ScrollView>
      </View>

      {/* Edit Post Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Social Update</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter post title..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Content *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                placeholder="Write your post content..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Post Type</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={formData.postType}
                  onValueChange={(value) => setFormData({ ...formData, postType: value })}
                  style={styles.pickerInput}
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="e.g., Technology, Healthcare"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.tags}
                onChangeText={(text) => setFormData({ ...formData, tags: text })}
                placeholder="e.g., hiring, remote, tech (comma separated)"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Visibility</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={formData.visibility}
                  onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                  style={styles.pickerInput}
                >
                  <Picker.Item label="Public" value="public" />
                  <Picker.Item label="Followers Only" value="followers_only" />
                  <Picker.Item label="Private" value="private" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Images (Optional)</Text>
              <Text style={styles.hint}>Add up to 5 images to your post</Text>
              
              {/* Existing Images Preview */}
              {editingPost && editingPost.media && editingPost.media.length > 0 && (
                <View style={styles.imagesPreviewContainer}>
                  {editingPost.media.map((media, index) => (
                    <View key={index} style={styles.imagePreviewWrapper}>
                      <Image source={{ uri: media.url || media }} style={styles.imagePreview} />
                    </View>
                  ))}
                </View>
              )}
              
              {/* New Image Preview */}
              {selectedImages.length > 0 && (
                <View style={styles.imagesPreviewContainer}>
                  {selectedImages.map((image, index) => (
                    <View key={`new-${index}`} style={styles.imagePreviewWrapper}>
                      <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
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
                  style={styles.addImageButton}
                  onPress={handlePickImage}
                >
                  <Ionicons name="image-outline" size={24} color={colors.primary} />
                  <Text style={styles.addImageButtonText}>
                    {selectedImages.length > 0 ? 'Add More Images' : 'Add Images'}
                  </Text>
                  <Text style={styles.addImageButtonSubtext}>
                    {selectedImages.length}/5 images
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdatePost}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Update Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, flexDirection: 'row', backgroundColor: '#F1F5F9' },
  sidebar: { width: 280, backgroundColor: colors.sidebarBackground },
  menuButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  content: { flex: 1 },
  contentMobile: {
    paddingTop: spacing.xl + 40,
  },
  headerBar: { 
    padding: spacing.xl, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    ...shadows.md,
  },
  headerBarMobile: {
    padding: spacing.md,
    paddingTop: spacing.xl + 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  headerLeftMobile: {
    gap: spacing.sm,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainerMobile: {
    width: 48,
    height: 48,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerTitleMobile: {
    fontSize: 22,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  headerSubtitleMobile: {
    fontSize: 12,
  },
  primaryBtn: { 
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primaryBtnText: { 
    fontSize: 15,
    fontWeight: '700', 
    color: '#FFFFFF',
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body1, color: colors.textSecondary, marginTop: spacing.sm },
  scrollContent: { 
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  empty: { 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: spacing.xxl,
    minHeight: 400,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: { 
    fontSize: 24,
    fontWeight: '800', 
    color: '#1E293B',
    marginBottom: spacing.sm,
  },
  emptySub: { 
    fontSize: 15,
    color: '#64748B', 
    marginBottom: spacing.xl,
    textAlign: 'center',
    maxWidth: 400,
  },
  emptyButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: borderRadius.lg, 
    padding: spacing.xl, 
    marginBottom: spacing.lg, 
    ...shadows.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: spacing.md,
  },
  postHeaderLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  postTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  postTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  postTitle: { 
    fontSize: 20,
    fontWeight: '700', 
    color: '#1E293B',
    lineHeight: 28,
  },
  headerActions: { 
    flexDirection: 'row', 
    gap: spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
  },
  viewBtn: {
    borderColor: '#DBEAFE',
  },
  editBtn: {
    borderColor: '#D1FAE5',
  },
  deleteBtn: {
    borderColor: '#FEE2E2',
  },
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { ...typography.h4, color: colors.text, fontWeight: '700' },
  modalContent: { flex: 1, padding: spacing.lg },
  inputGroup: { marginBottom: spacing.lg },
  label: { ...typography.body2, color: colors.text, fontWeight: '600', marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, ...typography.body2, color: colors.text, backgroundColor: colors.white },
  textArea: { minHeight: 120 },
  picker: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.white },
  pickerInput: { height: 48 },
  hint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm, fontStyle: 'italic' },
  imagesPreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  imagePreviewWrapper: { position: 'relative', width: 100, height: 100 },
  imagePreview: { width: '100%', height: '100%', borderRadius: borderRadius.md, backgroundColor: colors.border },
  removeImageButton: { position: 'absolute', top: -8, right: -8, backgroundColor: colors.white, borderRadius: 12, ...(Platform.OS === 'web' ? { boxShadow: '0 2px 3px rgba(0, 0, 0, 0.2)' } : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 }) },
  addImageButton: { borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', borderRadius: borderRadius.md, padding: spacing.lg, alignItems: 'center', backgroundColor: '#F9FAFB' },
  addImageButtonText: { ...typography.body2, fontWeight: '600', color: colors.primary, marginTop: spacing.xs },
  addImageButtonSubtext: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  modalFooter: { flexDirection: 'row', padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.md },
  cancelButton: { flex: 1, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelButtonText: { ...typography.button, fontWeight: '600', color: colors.text },
  saveButton: { flex: 1, padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.primary, alignItems: 'center' },
  saveButtonText: { ...typography.button, fontWeight: '600', color: colors.white },
  postExcerpt: { 
    fontSize: 15,
    color: '#64748B', 
    lineHeight: 24,
    marginTop: spacing.md,
  },
  metaRow: { 
    flexDirection: 'row', 
    gap: spacing.lg, 
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  likesItem: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  commentsItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  sharesItem: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  metaText: { 
    fontSize: 13,
    fontWeight: '700', 
    color: '#1E293B',
  },
  tagsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: spacing.sm, 
    marginTop: spacing.md,
    alignItems: 'center',
  },
  tag: { 
    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.xs, 
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  tagText: { 
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
});

export default EmployerSocialUpdatesScreen;


