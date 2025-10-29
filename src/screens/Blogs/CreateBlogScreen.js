import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import api from '../../config/api';

const CreateBlogScreen = ({ route, navigation }) => {
  const { blog } = route.params || {};
  const isEditMode = !!blog;

  const [formData, setFormData] = useState({
    title: blog?.title || '',
    excerpt: blog?.excerpt || '',
    content: blog?.content || '',
    category: blog?.category || 'Career Tips',
    readTime: blog?.readTime || '5 min read',
    tags: blog?.tags?.join(', ') || '',
    published: blog?.published !== false,
  });

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const categories = [
    'Career Tips',
    'Interview Prep',
    'Workplace Trends',
    'Networking',
    'Resume Writing',
    'Job Search',
    'Salary Negotiation',
    'Industry News',
    'Professional Development',
    'Work-Life Balance',
  ];

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await api.get('/api/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!formData.excerpt.trim()) {
      Alert.alert('Error', 'Please enter an excerpt');
      return;
    }
    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please enter content');
      return;
    }
    if (formData.title.length > 200) {
      Alert.alert('Error', 'Title must be less than 200 characters');
      return;
    }
    if (formData.excerpt.length > 500) {
      Alert.alert('Error', 'Excerpt must be less than 500 characters');
      return;
    }

    try {
      setLoading(true);

      // Prepare data
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const blogData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        readTime: formData.readTime.trim() || '5 min read',
        tags: tagsArray,
        published: formData.published,
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/api/blogs/${blog._id}`, blogData);
      } else {
        response = await api.post('/api/blogs', blogData);
      }

      if (response.data.success) {
        Alert.alert(
          'Success',
          isEditMode ? 'Blog updated successfully' : 'Blog created successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Blogs');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const calculateReadTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const updateContent = (text) => {
    setFormData({ ...formData, content: text });
    // Auto-update read time based on content
    if (text.length > 50) {
      const readTime = calculateReadTime(text);
      setFormData(prev => ({ ...prev, content: text, readTime }));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Blog' : 'Create Blog'}
        </Text>
        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={loading}
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditMode ? 'Update' : 'Publish'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <Ionicons name="create" size={48} color="#fff" />
          <Text style={styles.heroTitle}>
            {isEditMode ? 'Edit Your Blog' : 'Share Your Insights'}
          </Text>
          <Text style={styles.heroSubtitle}>
            Write compelling content to help job seekers and employers
          </Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formSection}>
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter an engaging title..."
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholderTextColor={colors.textLight}
              maxLength={200}
            />
            <Text style={styles.charCount}>{formData.title.length}/200</Text>
          </View>

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={styles.pickerButtonText}>{formData.category}</Text>
              <Ionicons
                name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.categoryList}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryItem,
                      formData.category === cat && styles.categoryItemActive,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, category: cat });
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        formData.category === cat && styles.categoryItemTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                    {formData.category === cat && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Excerpt */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Excerpt <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helpText}>
              A brief summary that will appear in the blog list
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write a compelling excerpt..."
              value={formData.excerpt}
              onChangeText={(text) => setFormData({ ...formData, excerpt: text })}
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
            <Text style={styles.charCount}>{formData.excerpt.length}/500</Text>
          </View>

          {/* Content */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Content <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helpText}>
              The main content of your blog article
            </Text>
            <TextInput
              style={[styles.input, styles.textAreaLarge]}
              placeholder="Write your blog content here..."
              value={formData.content}
              onChangeText={updateContent}
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={15}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {formData.content.trim().split(/\s+/).length} words
            </Text>
          </View>

          {/* Read Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Read Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5 min read"
              value={formData.readTime}
              onChangeText={(text) => setFormData({ ...formData, readTime: text })}
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Tags */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tags</Text>
            <Text style={styles.helpText}>
              Separate tags with commas (e.g., career, interview, tips)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="career, interview, tips"
              value={formData.tags}
              onChangeText={(text) => setFormData({ ...formData, tags: text })}
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Published Status */}
          <View style={styles.formGroup}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFormData({ ...formData, published: !formData.published })}
            >
              <View style={[styles.checkbox, formData.published && styles.checkboxActive]}>
                {formData.published && (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
              </View>
              <View style={styles.checkboxContent}>
                <Text style={styles.checkboxLabel}>Publish immediately</Text>
                <Text style={styles.checkboxHelpText}>
                  Uncheck to save as draft
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Author Info */}
          {user && (
            <View style={styles.authorInfo}>
              <Ionicons name="information-circle" size={20} color={colors.info} />
              <Text style={styles.authorInfoText}>
                This blog will be published as{' '}
                <Text style={styles.authorName}>
                  {user.companyName || user.fullName || user.email}
                </Text>
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.publishButton, loading && styles.publishButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.publishButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.publishButtonText}>
                      {isEditMode ? 'Update Blog' : 'Publish Blog'}
                    </Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h6,
    color: colors.text,
  },
  saveButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...typography.h3,
    color: '#fff',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  formSection: {
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.h6,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  helpText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  pickerButtonText: {
    ...typography.body1,
    color: colors.text,
  },
  categoryList: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    ...shadows.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryItemActive: {
    backgroundColor: colors.background,
  },
  categoryItemText: {
    ...typography.body1,
    color: colors.text,
  },
  categoryItemTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
  },
  checkboxHelpText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  authorInfoText: {
    ...typography.body2,
    color: colors.textSecondary,
    flex: 1,
  },
  authorName: {
    color: colors.primary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text,
  },
  publishButton: {
    flex: 2,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  publishButtonText: {
    ...typography.button,
    color: '#fff',
    fontWeight: '700',
  },
});

export default CreateBlogScreen;

