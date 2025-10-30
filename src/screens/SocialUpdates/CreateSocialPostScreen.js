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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

const CreateSocialPostScreen = ({ navigation, route }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postType: 'general',
    category: '',
    tags: '',
    visibility: 'public',
  });
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await api.getCurrentUserFromStorage();
      setCurrentUser(userData);

      // Check if user has permission to post
      const allowedTypes = ['admin', 'superadmin'];
      const allowedEmployerTypes = ['company', 'consultancy'];
      
      const isAdmin = allowedTypes.includes(userData?.userType);
      const isEmployer = userData?.userType === 'employer' && 
                         allowedEmployerTypes.includes(userData?.employerType);

      if (!isAdmin && !isEmployer) {
        Alert.alert(
          'Access Denied',
          'You do not have permission to create social posts.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data.');
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images.'
        );
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (!result.canceled) {
        if (result.assets && result.assets.length > 0) {
          setSelectedImages((prev) => [...prev, ...result.assets.slice(0, 5 - prev.length)]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your post.');
      return false;
    }

    if (formData.title.length > 200) {
      Alert.alert('Validation Error', 'Title must be less than 200 characters.');
      return false;
    }

    if (!formData.content.trim()) {
      Alert.alert('Validation Error', 'Please enter content for your post.');
      return false;
    }

    if (formData.content.length > 2000) {
      Alert.alert('Validation Error', 'Content must be less than 2000 characters.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('postType', formData.postType);
      formDataToSend.append('category', formData.category.trim());
      formDataToSend.append('visibility', formData.visibility);

      // Add tags
      if (formData.tags.trim()) {
        formDataToSend.append('tags', formData.tags);
      }

      // Add images
      if (selectedImages.length > 0) {
        selectedImages.forEach((image, index) => {
          const imageUri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
          const imageName = `image_${Date.now()}_${index}.jpg`;
          
          formDataToSend.append('media', {
            uri: imageUri,
            type: 'image/jpeg',
            name: imageName,
          });
        });
      }

      const response = await api.createSocialUpdate(formDataToSend);

      if (response && response.socialUpdate) {
        Alert.alert(
          'Success',
          'Your social post has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating social post:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create social post. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const postTypes = [
    { value: 'general', label: 'General' },
    { value: 'job_announcement', label: 'Job Announcement' },
    { value: 'company_update', label: 'Company Update' },
    { value: 'industry_news', label: 'Industry News' },
    { value: 'career_tips', label: 'Career Tips' },
    { value: 'event_announcement', label: 'Event Announcement' },
  ];

  const hideHeader = route?.params?.hideHeader === true;

  return (
    <View style={styles.container}>
      {!hideHeader && <Header />}
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.headerCard}
        >
          <Ionicons name="create" size={40} color={colors.textWhite} />
          <Text style={styles.headerTitle}>Create Social Post</Text>
          <Text style={styles.headerSubtitle}>
            Share updates, news, and announcements
          </Text>
        </LinearGradient>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Post Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a catchy title..."
              placeholderTextColor={colors.textSecondary}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              maxLength={200}
            />
            <Text style={styles.charCount}>{formData.title.length}/200</Text>
          </View>

          {/* Content Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Content <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write your post content..."
              placeholderTextColor={colors.textSecondary}
              value={formData.content}
              onChangeText={(text) => handleInputChange('content', text)}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.charCount}>{formData.content.length}/2000</Text>
          </View>

          {/* Post Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Post Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeSelector}>
                {postTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      formData.postType === type.value && styles.typeButtonActive,
                    ]}
                    onPress={() => handleInputChange('postType', type.value)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.postType === type.value && styles.typeButtonTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Category Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Technology, Marketing, Finance"
              placeholderTextColor={colors.textSecondary}
              value={formData.category}
              onChangeText={(text) => handleInputChange('category', text)}
            />
          </View>

          {/* Tags Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Separate tags with commas (e.g., hiring, jobs, career)"
              placeholderTextColor={colors.textSecondary}
              value={formData.tags}
              onChangeText={(text) => handleInputChange('tags', text)}
            />
            <Text style={styles.helperText}>
              Tags help users discover your posts
            </Text>
          </View>

          {/* Image Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Images (Optional)</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
              disabled={selectedImages.length >= 5}
            >
              <Ionicons name="image" size={24} color={colors.primary} />
              <Text style={styles.uploadButtonText}>
                Add Images ({selectedImages.length}/5)
              </Text>
            </TouchableOpacity>

            {selectedImages.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Visibility Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Visibility</Text>
            <View style={styles.visibilitySelector}>
              <TouchableOpacity
                style={[
                  styles.visibilityButton,
                  formData.visibility === 'public' && styles.visibilityButtonActive,
                ]}
                onPress={() => handleInputChange('visibility', 'public')}
              >
                <Ionicons
                  name="globe"
                  size={20}
                  color={
                    formData.visibility === 'public' ? colors.textWhite : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.visibilityButtonText,
                    formData.visibility === 'public' && styles.visibilityButtonTextActive,
                  ]}
                >
                  Public
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.visibilityButton,
                  formData.visibility === 'followers_only' && styles.visibilityButtonActive,
                ]}
                onPress={() => handleInputChange('visibility', 'followers_only')}
              >
                <Ionicons
                  name="people"
                  size={20}
                  color={
                    formData.visibility === 'followers_only'
                      ? colors.textWhite
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.visibilityButtonText,
                    formData.visibility === 'followers_only' &&
                      styles.visibilityButtonTextActive,
                  ]}
                >
                  Followers Only
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={colors.textWhite} />
                <Text style={styles.submitButtonText}>Publish Post</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.textWhite,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.textWhite,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  formSection: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.subtitle2,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    ...typography.body2,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 150,
    paddingTop: spacing.md,
  },
  charCount: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: colors.textWhite,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  uploadButtonText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
    position: 'relative',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.full,
  },
  visibilitySelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  visibilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  visibilityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  visibilityButtonText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  visibilityButtonTextActive: {
    color: colors.textWhite,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '700',
  },
});

export default CreateSocialPostScreen;

