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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';

const AdminEmailTemplatesScreen = ({ navigation }) => {
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
        Alert.alert(
          'Success',
          `Email template ${editMode ? 'updated' : 'created'} successfully`
        );
        setModalVisible(false);
        loadData();
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
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderTemplateCard = (template) => (
    <View key={template._id} style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={styles.templateTitleContainer}>
          <Text style={styles.templateName}>{template.name}</Text>
          <View style={styles.templateBadges}>
            <View style={[styles.badge, styles.typeBadge]}>
              <Text style={styles.badgeText}>
                {getTemplateTypeLabel(template.type)}
              </Text>
            </View>
            {template.isDefault && (
              <View style={[styles.badge, styles.defaultBadge]}>
                <Ionicons name="star" size={12} color="#FFF" />
                <Text style={styles.badgeText}>Default</Text>
              </View>
            )}
            <View
              style={[
                styles.badge,
                template.isActive ? styles.activeBadge : styles.inactiveBadge,
              ]}
            >
              <Text style={styles.badgeText}>
                {template.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.templateDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {template.subject}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="stats-chart-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            Used {template.usageCount || 0} times
          </Text>
        </View>
        {template.lastUsed && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              Last used: {new Date(template.lastUsed).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.templateActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(template)}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        {!template.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(template)}
          >
            <Ionicons name="star-outline" size={20} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(template)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <Text style={styles.actionButtonText}>Delete</Text>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading templates...</Text>
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
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Email Templates</Text>
            <Text style={styles.pageSubtitle}>
              Manage email templates for automated communications
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleInitializeDefaults}
            >
              <Ionicons name="download-outline" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Initialize Defaults</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={openCreateModal}>
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Create Template</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          {renderStatCard('Total Templates', stats.total || 0, 'mail-outline', colors.primary)}
          {renderStatCard('Active', stats.active || 0, 'checkmark-circle-outline', colors.success)}
          {renderStatCard('Inactive', stats.inactive || 0, 'close-circle-outline', colors.error)}
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <View style={styles.pickerContainer}>
              <Text style={styles.filterLabel}>Template Type</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value, page: 1 })}
                  style={styles.pickerInput}
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
        <View style={styles.templatesContainer}>
          {templates.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="mail-outline" size={64} color={colors.border} />
              <Text style={styles.emptyStateTitle}>No templates found</Text>
              <Text style={styles.emptyStateText}>
                Create your first email template to get started
              </Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={openCreateModal}>
                <Text style={styles.emptyStateButtonText}>Create Template</Text>
              </TouchableOpacity>
            </View>
          ) : (
            templates.map((template) => renderTemplateCard(template))
          )}
        </View>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationButton, filters.page === 1 && styles.paginationButtonDisabled]}
              onPress={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
            >
              <Ionicons name="chevron-back" size={20} color={filters.page === 1 ? colors.border : colors.primary} />
            </TouchableOpacity>
            <Text style={styles.paginationText}>
              Page {pagination.current} of {pagination.pages}
            </Text>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                filters.page === pagination.pages && styles.paginationButtonDisabled,
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
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editMode ? 'Edit Template' : 'Create Template'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Template Name *</Text>
              <TextInput
                style={styles.input}
                value={currentTemplate.name}
                onChangeText={(text) =>
                  setCurrentTemplate({ ...currentTemplate, name: text })
                }
                placeholder="e.g., Welcome Email for New Jobseekers"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Template Type *</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={currentTemplate.type}
                  onValueChange={(value) =>
                    setCurrentTemplate({ ...currentTemplate, type: value })
                  }
                  style={styles.pickerInput}
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Subject *</Text>
              <TextInput
                style={styles.input}
                value={currentTemplate.subject}
                onChangeText={(text) =>
                  setCurrentTemplate({ ...currentTemplate, subject: text })
                }
                placeholder="e.g., Welcome to JobWala!"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>HTML Content *</Text>
              <Text style={styles.hint}>
                Use variables: {'{'}{'{'} userName {'}'}{'}'}, {'{'}{'{'} companyName {'}'}{'}'}, {'{'}{'{'} jobTitle {'}'}{'}'}, etc.
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={currentTemplate.htmlContent}
                onChangeText={(text) =>
                  setCurrentTemplate({ ...currentTemplate, htmlContent: text })
                }
                placeholder="Enter HTML content..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Plain Text Content (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
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

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Active Template</Text>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  currentTemplate.isActive && styles.switchButtonActive,
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
                    styles.switchThumb,
                    currentTemplate.isActive && styles.switchThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editMode ? 'Update' : 'Create'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
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
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
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
});

export default AdminEmailTemplatesScreen;
