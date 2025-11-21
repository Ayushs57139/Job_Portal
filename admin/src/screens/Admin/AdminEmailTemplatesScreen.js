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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

const AdminEmailTemplatesScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: '',
    search: '',
  });
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [modalTab, setModalTab] = useState('create'); // 'create' or 'upload'
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [currentTemplate, setCurrentTemplate] = useState({
    name: '',
    type: 'jobseeker_welcome',
    subject: '',
    htmlContent: '',
    textContent: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    loadData();
  }, [filters.page, filters.type]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesResponse, statsResponse] = await Promise.all([
        api.getEmailTemplates(filters),
        api.getEmailTemplateStats(),
      ]);

      if (templatesResponse.success) {
        setTemplates(templatesResponse.data);
        setPagination(templatesResponse.pagination);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      Alert.alert('Error', 'Failed to load email templates');
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
    setEditMode(false);
    setModalTab('create');
    setUploadedFile(null);
    setCurrentTemplate({
      name: '',
      type: 'jobseeker_welcome',
      subject: '',
      htmlContent: '',
      textContent: '',
      isActive: true,
    });
    setModalVisible(true);
  };

  const handleFileUpload = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web file upload using input element
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.html,.htm,.txt';
          input.style.display = 'none';
          document.body.appendChild(input);
          
          input.onchange = async (e) => {
            const file = e.target.files[0];
            document.body.removeChild(input);
            
            if (!file) {
              resolve();
              return;
            }

            setUploading(true);
            setUploadedFile({ name: file.name, size: file.size });

            const reader = new FileReader();
            reader.onload = (event) => {
              const fileContent = event.target.result;
              processFileContent(fileContent, file.name, file.type);
              resolve();
            };
            reader.onerror = () => {
              Alert.alert('Error', 'Failed to read file.');
              setUploading(false);
              resolve();
            };
            reader.readAsText(file);
          };
          
          input.oncancel = () => {
            document.body.removeChild(input);
            resolve();
          };
          
          input.click();
        });
      } else {
        // Native file picker
        const result = await DocumentPicker.getDocumentAsync({
          type: ['text/html', 'text/plain', 'application/html'],
          copyToCacheDirectory: true,
        });

        if (result.type === 'cancel') {
          return;
        }

        setUploading(true);
        setUploadedFile(result);

        const fileContent = await FileSystem.readAsStringAsync(result.uri);
        processFileContent(fileContent, result.name, result.mimeType);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
      setUploading(false);
    }
  };

  const processFileContent = (fileContent, fileName, mimeType) => {
    try {
      // Extract HTML content
      let htmlContent = '';
      let textContent = '';
      
      if (mimeType === 'text/html' || fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        htmlContent = fileContent;
        // Extract text from HTML (basic extraction)
        textContent = fileContent.replace(/<[^>]*>/g, '').trim();
      } else {
        textContent = fileContent;
        htmlContent = fileContent.replace(/\n/g, '<br>');
      }

      // Try to extract subject from file name or content
      let subject = fileName.replace(/\.(html|htm|txt)$/i, '');
      const subjectMatch = fileContent.match(/<title[^>]*>(.*?)<\/title>/i) || 
                          fileContent.match(/Subject:\s*(.+)/i);
      if (subjectMatch) {
        subject = subjectMatch[1].trim();
      }

      setCurrentTemplate({
        ...currentTemplate,
        name: subject || fileName.replace(/\.(html|htm|txt)$/i, ''),
        subject: subject || 'Email Subject',
        htmlContent: htmlContent,
        textContent: textContent,
      });

      Alert.alert('Success', 'Template file loaded successfully!');
    } catch (error) {
      console.error('Error processing file:', error);
      Alert.alert('Error', 'Failed to process file content.');
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (template) => {
    setEditMode(true);
    setCurrentTemplate({
      id: template._id,
      name: template.name,
      type: template.type,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || '',
      isActive: template.isActive,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!currentTemplate.name.trim()) {
        Alert.alert('Validation Error', 'Please enter template name');
        return;
      }
      if (!currentTemplate.subject.trim()) {
        Alert.alert('Validation Error', 'Please enter email subject');
        return;
      }
      if (!currentTemplate.htmlContent.trim()) {
        Alert.alert('Validation Error', 'Please enter email content');
        return;
      }

      setSaving(true);

      const templateData = {
        name: currentTemplate.name.trim(),
        type: currentTemplate.type,
        subject: currentTemplate.subject.trim(),
        htmlContent: currentTemplate.htmlContent.trim(),
        textContent: currentTemplate.textContent.trim(),
        isActive: currentTemplate.isActive,
      };

      let response;
      if (editMode) {
        response = await api.updateEmailTemplate(currentTemplate.id, templateData);
      } else {
        response = await api.createEmailTemplate(templateData);
      }

      if (response.success) {
        setModalVisible(false);
        setUploadedFile(null);
        // Reset filters to show all templates
        const resetFilters = { page: 1, limit: 10, type: '', search: '' };
        setFilters(resetFilters);
        // Reload data with reset filters
        try {
          setLoading(true);
          const [templatesResponse, statsResponse] = await Promise.all([
            api.getEmailTemplates(resetFilters),
            api.getEmailTemplateStats(),
          ]);

          if (templatesResponse.success) {
            setTemplates(templatesResponse.data);
            setPagination(templatesResponse.pagination);
          }

          if (statsResponse.success) {
            setStats(statsResponse.data);
          }
        } catch (error) {
          console.error('Error loading templates:', error);
        } finally {
          setLoading(false);
        }
        
        Alert.alert(
          'Success',
          `Email template ${editMode ? 'updated' : 'created'} successfully`
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      Alert.alert('Error', error.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (template) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.deleteEmailTemplate(template._id);
              if (response.success) {
                Alert.alert('Success', 'Template deleted successfully');
                loadData();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete template');
              }
            } catch (error) {
              console.error('Error deleting template:', error);
              Alert.alert('Error', 'Failed to delete template');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (template) => {
    try {
      const response = await api.setDefaultEmailTemplate(template._id);
      if (response.success) {
        Alert.alert('Success', 'Template set as default successfully');
        loadData();
      } else {
        Alert.alert('Error', response.message || 'Failed to set default template');
      }
    } catch (error) {
      console.error('Error setting default template:', error);
      Alert.alert('Error', 'Failed to set default template');
    }
  };

  const handleInitializeDefaults = () => {
    Alert.alert(
      'Initialize Default Templates',
      'This will create default email templates for all types. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Initialize',
          onPress: async () => {
            try {
              const response = await api.initializeDefaultEmailTemplates();
              if (response.success) {
                Alert.alert('Success', 'Default templates initialized successfully');
                loadData();
              } else {
                Alert.alert('Error', response.message || 'Failed to initialize templates');
              }
            } catch (error) {
              console.error('Error initializing templates:', error);
              Alert.alert('Error', 'Failed to initialize templates');
            }
          },
        },
      ]
    );
  };

  const getTemplateTypeLabel = (type) => {
    const labels = {
      job_apply_invite: 'Job Apply Invite',
      employer_confirmation: 'Employer Confirmation',
      employer_welcome: 'Employer Welcome',
      jobseeker_welcome: 'Jobseeker Welcome',
      company_welcome: 'Company Welcome',
      consultancy_welcome: 'Consultancy Welcome',
    };
    return labels[type] || type;
  };

  const renderStatCard = (title, value, icon, color) => (
    <View style={[dynamicStyles.statCard, { borderLeftColor: color }]}>
      <View style={dynamicStyles.statIconContainer}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={dynamicStyles.statContent}>
        <Text style={dynamicStyles.statValue}>{value}</Text>
        <Text style={dynamicStyles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderTemplateCard = (template) => (
    <View key={template._id} style={dynamicStyles.templateCard}>
      <View style={dynamicStyles.templateHeader}>
        <View style={dynamicStyles.templateTitleContainer}>
          <Text style={dynamicStyles.templateName}>{template.name}</Text>
          <View style={dynamicStyles.templateBadges}>
            <View style={[dynamicStyles.badge, dynamicStyles.typeBadge]}>
              <Text style={dynamicStyles.badgeText}>
                {getTemplateTypeLabel(template.type)}
              </Text>
            </View>
            {template.isDefault && (
              <View style={[dynamicStyles.badge, dynamicStyles.defaultBadge]}>
                <Ionicons name="star" size={12} color="#FFF" />
                <Text style={dynamicStyles.badgeText}>Default</Text>
              </View>
            )}
            <View
              style={[
                dynamicStyles.badge,
                template.isActive ? dynamicStyles.activeBadge : dynamicStyles.inactiveBadge,
              ]}
            >
              <Text style={dynamicStyles.badgeText}>
                {template.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={dynamicStyles.templateDetails}>
        <View style={dynamicStyles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
          <Text style={dynamicStyles.detailText} numberOfLines={1}>
            {template.subject}
          </Text>
        </View>
        <View style={dynamicStyles.detailRow}>
          <Ionicons name="stats-chart-outline" size={16} color={colors.textSecondary} />
          <Text style={dynamicStyles.detailText}>
            Used {template.usageCount || 0} times
          </Text>
        </View>
        {template.lastUsed && (
          <View style={dynamicStyles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={dynamicStyles.detailText}>
              Last used: {new Date(template.lastUsed).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={dynamicStyles.templateActions}>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={() => openEditModal(template)}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={dynamicStyles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        {!template.isDefault && (
          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={() => handleSetDefault(template)}
          >
            <Ionicons name="star-outline" size={20} color="#F59E0B" />
            <Text style={dynamicStyles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={() => handleDelete(template)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <Text style={dynamicStyles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <AdminLayout
        title="Email Templates"
        activeScreen="AdminEmailTemplates"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading templates...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Email Templates"
      activeScreen="AdminEmailTemplates"
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
            <Text style={dynamicStyles.pageTitle}>Email Templates</Text>
            <Text style={dynamicStyles.pageSubtitle}>
              Manage email templates for automated communications
            </Text>
          </View>
          <View style={dynamicStyles.headerActions}>
            <TouchableOpacity
              style={dynamicStyles.secondaryButton}
              onPress={handleInitializeDefaults}
            >
              <Ionicons name="download-outline" size={20} color={colors.primary} />
              <Text style={dynamicStyles.secondaryButtonText}>Initialize Defaults</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.primaryButton} onPress={openCreateModal}>
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={dynamicStyles.primaryButtonText}>Create Template</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={dynamicStyles.statsContainer}>
          {renderStatCard('Total Templates', stats.total || 0, 'mail-outline', colors.primary)}
          {renderStatCard('Active', stats.active || 0, 'checkmark-circle-outline', colors.success)}
          {renderStatCard('Inactive', stats.inactive || 0, 'close-circle-outline', colors.error)}
        </View>

        {/* Filters */}
        <View style={dynamicStyles.filtersContainer}>
          <View style={dynamicStyles.filterRow}>
            <View style={dynamicStyles.pickerContainer}>
              <Text style={dynamicStyles.filterLabel}>Template Type</Text>
              <View style={dynamicStyles.picker}>
                <Picker
                  selectedValue={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value, page: 1 })}
                  style={dynamicStyles.pickerInput}
                >
                  <Picker.Item label="All Types" value="" />
                  <Picker.Item label="Jobseeker Welcome" value="jobseeker_welcome" />
                  <Picker.Item label="Employer Welcome" value="employer_welcome" />
                  <Picker.Item label="Company Welcome" value="company_welcome" />
                  <Picker.Item label="Consultancy Welcome" value="consultancy_welcome" />
                  <Picker.Item label="Job Apply Invite" value="job_apply_invite" />
                  <Picker.Item label="Employer Confirmation" value="employer_confirmation" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Templates List */}
        <View style={dynamicStyles.templatesContainer}>
          {templates.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="mail-outline" size={64} color={colors.border} />
              <Text style={dynamicStyles.emptyStateTitle}>No templates found</Text>
              <Text style={dynamicStyles.emptyStateText}>
                Create your first email template to get started
              </Text>
              <TouchableOpacity style={dynamicStyles.emptyStateButton} onPress={openCreateModal}>
                <Text style={dynamicStyles.emptyStateButtonText}>Create Template</Text>
              </TouchableOpacity>
            </View>
          ) : (
            templates.map((template) => renderTemplateCard(template))
          )}
        </View>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <View style={dynamicStyles.paginationContainer}>
            <TouchableOpacity
              style={[dynamicStyles.paginationButton, filters.page === 1 && dynamicStyles.paginationButtonDisabled]}
              onPress={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
            >
              <Ionicons name="chevron-back" size={20} color={filters.page === 1 ? colors.border : colors.primary} />
            </TouchableOpacity>
            <Text style={dynamicStyles.paginationText}>
              Page {pagination.current} of {pagination.pages}
            </Text>
            <TouchableOpacity
              style={[
                dynamicStyles.paginationButton,
                filters.page === pagination.pages && dynamicStyles.paginationButtonDisabled,
              ]}
              onPress={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.pages}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={filters.page === pagination.pages ? colors.border : colors.primary}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
            setUploadedFile(null);
          }}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>
                {editMode ? 'Edit Template' : 'Create Template'}
              </Text>
              <TouchableOpacity 
                style={dynamicStyles.modalCloseButton}
                onPress={() => {
                  setModalVisible(false);
                  setUploadedFile(null);
                }}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {!editMode && (
              <View style={dynamicStyles.modalTabs}>
                <TouchableOpacity
                  style={[dynamicStyles.modalTab, modalTab === 'create' && dynamicStyles.modalTabActive]}
                  onPress={() => setModalTab('create')}
                >
                  <Ionicons 
                    name="create-outline" 
                    size={20} 
                    color={modalTab === 'create' ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[dynamicStyles.modalTabText, modalTab === 'create' && dynamicStyles.modalTabTextActive]}>
                    Create Custom
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.modalTab, modalTab === 'upload' && dynamicStyles.modalTabActive]}
                  onPress={() => setModalTab('upload')}
                >
                  <Ionicons 
                    name="cloud-upload-outline" 
                    size={20} 
                    color={modalTab === 'upload' ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[dynamicStyles.modalTabText, modalTab === 'upload' && dynamicStyles.modalTabTextActive]}>
                    Upload Template
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          <ScrollView style={dynamicStyles.modalContent} showsVerticalScrollIndicator={false}>
            {modalTab === 'upload' && !editMode && (
              <View style={dynamicStyles.uploadSection}>
                <View style={dynamicStyles.uploadBox}>
                  {uploadedFile ? (
                    <View style={dynamicStyles.uploadedFileInfo}>
                      <Ionicons name="document-text" size={48} color={colors.primary} />
                      <Text style={dynamicStyles.uploadedFileName}>{uploadedFile.name}</Text>
                      <Text style={dynamicStyles.uploadedFileSize}>
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </Text>
                      <TouchableOpacity
                        style={dynamicStyles.removeFileButton}
                        onPress={() => {
                          setUploadedFile(null);
                          setCurrentTemplate({
                            ...currentTemplate,
                            name: '',
                            subject: '',
                            htmlContent: '',
                            textContent: '',
                          });
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color={colors.error} />
                        <Text style={dynamicStyles.removeFileText}>Remove File</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={64} color={colors.textSecondary} />
                      <Text style={dynamicStyles.uploadTitle}>Upload Template File</Text>
                      <Text style={dynamicStyles.uploadSubtitle}>
                        Select an HTML or text file to import as template
                      </Text>
                      <TouchableOpacity
                        style={dynamicStyles.uploadButton}
                        onPress={handleFileUpload}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                          <>
                            <Ionicons name="folder-open-outline" size={20} color={colors.white} />
                            <Text style={dynamicStyles.uploadButtonText}>Choose File</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <Text style={dynamicStyles.uploadHint}>
                        Supported formats: .html, .htm, .txt
                      </Text>
                    </>
                  )}
                </View>
              </View>
            )}

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Template Name *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={currentTemplate.name}
                onChangeText={(text) =>
                  setCurrentTemplate({ ...currentTemplate, name: text })
                }
                placeholder="e.g., Welcome Email for New Jobseekers"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Template Type *</Text>
              <View style={dynamicStyles.picker}>
                <Picker
                  selectedValue={currentTemplate.type}
                  onValueChange={(value) =>
                    setCurrentTemplate({ ...currentTemplate, type: value })
                  }
                  style={dynamicStyles.pickerInput}
                >
                  <Picker.Item label="Jobseeker Welcome" value="jobseeker_welcome" />
                  <Picker.Item label="Employer Welcome" value="employer_welcome" />
                  <Picker.Item label="Company Welcome" value="company_welcome" />
                  <Picker.Item label="Consultancy Welcome" value="consultancy_welcome" />
                  <Picker.Item label="Job Apply Invite" value="job_apply_invite" />
                  <Picker.Item label="Employer Confirmation" value="employer_confirmation" />
                </Picker>
              </View>
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Email Subject *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={currentTemplate.subject}
                onChangeText={(text) =>
                  setCurrentTemplate({ ...currentTemplate, subject: text })
                }
                placeholder="e.g., Welcome to JobWala!"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <View style={dynamicStyles.labelRow}>
                <Text style={dynamicStyles.label}>HTML Content *</Text>
                <View style={dynamicStyles.variablesContainer}>
                  <Text style={dynamicStyles.variablesLabel}>Variables:</Text>
                  <View style={dynamicStyles.variablesList}>
                    {['userName', 'companyName', 'jobTitle', 'email', 'phone'].map((varName) => (
                      <TouchableOpacity
                        key={varName}
                        style={dynamicStyles.variableTag}
                        onPress={() => {
                          const currentContent = currentTemplate.htmlContent || '';
                          const newContent = currentContent + `{{ ${varName} }}`;
                          setCurrentTemplate({ ...currentTemplate, htmlContent: newContent });
                        }}
                      >
                        <Text style={dynamicStyles.variableText}>{`{{ ${varName} }}`}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              <Text style={dynamicStyles.hint}>
                Click on variables above to insert them into your template
              </Text>
              <TextInput
                style={[dynamicStyles.input, dynamicStyles.textArea]}
                value={currentTemplate.htmlContent}
                onChangeText={(text) =>
                  setCurrentTemplate({ ...currentTemplate, htmlContent: text })
                }
                placeholder="Enter HTML content..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={12}
                textAlignVertical="top"
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Plain Text Content (Optional)</Text>
              <TextInput
                style={[dynamicStyles.input, dynamicStyles.textArea]}
                value={currentTemplate.textContent}
                onChangeText={(text) =>
                  setCurrentTemplate({ ...currentTemplate, textContent: text })
                }
                placeholder="Enter plain text content..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>

            <View style={dynamicStyles.switchRow}>
              <Text style={dynamicStyles.switchLabel}>Active Template</Text>
              <TouchableOpacity
                style={[
                  dynamicStyles.switchButton,
                  currentTemplate.isActive && dynamicStyles.switchButtonActive,
                ]}
                onPress={() =>
                  setCurrentTemplate({
                    ...currentTemplate,
                    isActive: !currentTemplate.isActive,
                  })
                }
              >
                <View
                  style={[
                    dynamicStyles.switchThumb,
                    currentTemplate.isActive && dynamicStyles.switchThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={dynamicStyles.modalFooter}>
            <TouchableOpacity
              style={dynamicStyles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={dynamicStyles.saveButtonText}>
                  {editMode ? 'Update' : 'Create'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  pageTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 14,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.xs,
    ...shadows.xs,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7FA',
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
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pickerContainer: {
    flex: 1,
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
  templatesContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  templateCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  templateHeader: {
    marginBottom: spacing.md,
  },
  templateTitleContainer: {
    marginBottom: spacing.sm,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  templateBadges: {
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
  defaultBadge: {
    backgroundColor: '#F59E0B',
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  templateDetails: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  templateActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
    maxWidth: 800,
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
  modalTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  modalTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginBottom: -1,
  },
  modalTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  modalTabText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modalTabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  uploadSection: {
    marginBottom: spacing.lg,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background,
    minHeight: 200,
    justifyContent: 'center',
  },
  uploadTitle: {
    ...typography.h6,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  uploadSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  uploadButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 14,
  },
  uploadHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  uploadedFileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  uploadedFileName: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  uploadedFileSize: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  removeFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: '#FEE2E2',
  },
  removeFileText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  labelRow: {
    marginBottom: spacing.xs,
  },
  variablesContainer: {
    marginTop: spacing.sm,
  },
  variablesLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  variablesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  variableTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  variableText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
    maxHeight: 500,
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
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.text,
    backgroundColor: colors.white,
    fontSize: 15,
    ...shadows.xs,
  },
  textArea: {
    minHeight: 200,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  switchButton: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchButtonActive: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFF',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
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
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.white,
    ...shadows.xs,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
    fontSize: 15,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...shadows.md,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: isMobile ? 14 : isTablet ? 14.5 : 15,
  },
});

export default AdminEmailTemplatesScreen;
