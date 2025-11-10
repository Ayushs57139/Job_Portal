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
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';

const EmployerSocialUpdatesScreen = ({ navigation }) => {
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
        <Text style={styles.postTitle} numberOfLines={1}>{p.title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.smallBtn, styles.infoBtn]} onPress={()=>navigation.navigate('SocialUpdates') }>
            <Ionicons name="eye-outline" size={16} color={colors.white} /><Text style={styles.smallBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallBtn, styles.successBtn]} onPress={()=>openEditModal(p)}>
            <Ionicons name="create-outline" size={16} color={colors.white} /><Text style={styles.smallBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallBtn, styles.dangerBtn]} onPress={()=>handleDelete(p._id)}>
            <Ionicons name="trash-outline" size={16} color={colors.white} /><Text style={styles.smallBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.postExcerpt} numberOfLines={3}>{p.content}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}><Ionicons name="heart-outline" size={16} color={colors.error} /><Text style={styles.metaText}>{p.engagement?.likes || 0} Likes</Text></View>
        <View style={styles.metaItem}><Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.info} /><Text style={styles.metaText}>{p.engagement?.comments || 0} Comments</Text></View>
        <View style={styles.metaItem}><Ionicons name="share-social-outline" size={16} color={colors.primary} /><Text style={styles.metaText}>{p.engagement?.shares || 0} Shares</Text></View>
      </View>
      {p.tags && p.tags.length>0 && (
        <View style={styles.tagsRow}>
          {p.tags.slice(0,4).map((t,i)=>(<View key={i} style={styles.tag}><Text style={styles.tagText}>#{t}</Text></View>))}
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
      <View style={styles.sidebar}><EmployerSidebar permanent navigation={navigation} role="company" activeKey="social" /></View>
      <View style={styles.content}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Social Updates</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={()=>navigation.navigate('EmployerCreateSocialPost')}>
            <Ionicons name="add-circle-outline" size={18} color={colors.white} />
            <Text style={styles.primaryBtnText}>Create Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />}>
          {posts.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="newspaper-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySub}>Create your first social update for everyone to see</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={()=>navigation.navigate('CreateSocialPost')}>
                <Text style={styles.primaryBtnText}>Create Post</Text>
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
  page: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  sidebar: { width: 280, backgroundColor: colors.sidebarBackground },
  content: { flex: 1 },
  headerBar: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { ...typography.h3, color: colors.text, fontWeight: '700' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  primaryBtnText: { ...typography.button, color: colors.white, fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body1, color: colors.textSecondary, marginTop: spacing.sm },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h5, color: colors.text, fontWeight: '700', marginTop: spacing.md },
  emptySub: { ...typography.body1, color: colors.textSecondary, marginVertical: spacing.sm },
  card: { backgroundColor: colors.cardBackground, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  postTitle: { ...typography.h6, color: colors.text, fontWeight: '700', flex: 1, marginRight: spacing.md },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: 8 },
  smallBtnText: { ...typography.caption, color: colors.white, fontWeight: '600' },
  infoBtn: { backgroundColor: colors.info },
  successBtn: { backgroundColor: colors.success },
  dangerBtn: { backgroundColor: colors.error },
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
  removeImageButton: { position: 'absolute', top: -8, right: -8, backgroundColor: colors.white, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  addImageButton: { borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', borderRadius: borderRadius.md, padding: spacing.lg, alignItems: 'center', backgroundColor: '#F9FAFB' },
  addImageButtonText: { ...typography.body2, fontWeight: '600', color: colors.primary, marginTop: spacing.xs },
  addImageButtonSubtext: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  modalFooter: { flexDirection: 'row', padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.md },
  cancelButton: { flex: 1, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelButtonText: { ...typography.button, fontWeight: '600', color: colors.text },
  saveButton: { flex: 1, padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.primary, alignItems: 'center' },
  saveButtonText: { ...typography.button, fontWeight: '600', color: colors.white },
  postExcerpt: { ...typography.body2, color: colors.textSecondary, marginTop: spacing.xs },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: { backgroundColor: colors.primary + '12', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 12 },
  tagText: { ...typography.caption, color: colors.primary },
});

export default EmployerSocialUpdatesScreen;


