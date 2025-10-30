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
  Switch,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';

const AdminLogoManagementScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('theme'); // theme, logo, favicon
  
  // Theme State
  const [theme, setTheme] = useState(null);
  const [themeColors, setThemeColors] = useState({
    primary: '#2563EB',
    secondary: '#FF6B35',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  });
  
  // Logo State
  const [logoConfig, setLogoConfig] = useState({
    logoType: 'text',
    textLogo: {
      primaryText: 'Freejob',
      secondaryText: 'wala',
      primaryColor: '#1E88E5',
      secondaryColor: '#ff6b35',
    },
    imageLogo: {
      url: '',
      altText: 'Website Logo',
      width: 40,
      height: 40,
    },
  });
  
  // Favicon State
  const [faviconUrl, setFaviconUrl] = useState('');
  const [appleTouchIconUrl, setAppleTouchIconUrl] = useState('');
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorType, setSelectedColorType] = useState('');
  const [showThemePresets, setShowThemePresets] = useState(false);

  // Theme Presets
  const themePresets = [
    {
      name: 'Ocean Blue',
      colors: {
        primary: '#2563EB',
        secondary: '#FF6B35',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      }
    },
    {
      name: 'Purple Dream',
      colors: {
        primary: '#8B5CF6',
        secondary: '#EC4899',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#8B5CF6',
      }
    },
    {
      name: 'Forest Green',
      colors: {
        primary: '#10b981',
        secondary: '#14B8A6',
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      }
    },
    {
      name: 'Sunset Orange',
      colors: {
        primary: '#F97316',
        secondary: '#FB923C',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      }
    },
    {
      name: 'Rose Pink',
      colors: {
        primary: '#EC4899',
        secondary: '#F472B6',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#EC4899',
      }
    },
    {
      name: 'Corporate Blue',
      colors: {
        primary: '#1E40AF',
        secondary: '#3B82F6',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#60A5FA',
      }
    },
  ];

  useEffect(() => {
    loadThemeAndLogo();
  }, []);

  const loadThemeAndLogo = async () => {
    try {
      // Load active theme
      const themeResponse = await api.getActiveTheme();
      if (themeResponse.success && themeResponse.theme) {
        setTheme(themeResponse.theme);
        setThemeColors(themeResponse.theme.colors);
        setFaviconUrl(themeResponse.theme.branding?.favicon || '');
        setAppleTouchIconUrl(themeResponse.theme.branding?.appleTouchIcon || '');
      }
      
      // Load active logo
      const logoResponse = await api.getActiveLogo();
      if (logoResponse.success && logoResponse.logo) {
        setLogoConfig(logoResponse.logo);
      }
    } catch (error) {
      console.error('Error loading theme and logo:', error);
      Alert.alert('Error', 'Failed to load theme and logo settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    try {
      setSaving(true);
      
      const themeData = {
        colors: themeColors,
        branding: {
          favicon: faviconUrl,
          appleTouchIcon: appleTouchIconUrl,
        }
      };
      
      let response;
      if (theme && theme._id) {
        response = await api.updateTheme(theme._id, themeData);
      } else {
        response = await api.createTheme({ ...themeData, name: 'Default Theme', isActive: true });
      }
      
      if (response.success) {
        Alert.alert('Success', 'Theme updated successfully');
        loadThemeAndLogo();
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      Alert.alert('Error', 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLogo = async () => {
    try {
      setSaving(true);
      
      let response;
      if (logoConfig._id) {
        response = await api.updateLogo(logoConfig._id, logoConfig);
      } else {
        response = await api.createLogo({ ...logoConfig, name: 'Main Logo', isActive: true });
      }
      
      if (response.success) {
        Alert.alert('Success', 'Logo updated successfully');
        loadThemeAndLogo();
      }
    } catch (error) {
      console.error('Error saving logo:', error);
      Alert.alert('Error', 'Failed to save logo');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'favicon' ? [1, 1] : [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Upload to server
        try {
          setSaving(true);
          
          // Create file object for upload
          const filename = imageUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const fileType = match ? `image/${match[1]}` : 'image/jpeg';
          
          const file = {
            uri: imageUri,
            name: filename,
            type: fileType,
          };
          
          // Determine upload type
          const uploadType = type === 'logo' ? 'logos' : 'icons';
          const uploadResponse = await api.uploadFile(file, uploadType);
          
          if (uploadResponse.success) {
            const uploadedUrl = uploadResponse.data.url;
            
            if (type === 'logo') {
              setLogoConfig({
                ...logoConfig,
                imageLogo: { ...logoConfig.imageLogo, url: uploadedUrl }
              });
              Alert.alert('Success', 'Logo image uploaded successfully');
            } else if (type === 'favicon') {
              setFaviconUrl(uploadedUrl);
              Alert.alert('Success', 'Favicon uploaded successfully');
            } else if (type === 'apple-touch-icon') {
              setAppleTouchIconUrl(uploadedUrl);
              Alert.alert('Success', 'Apple Touch Icon uploaded successfully');
            }
          } else {
            Alert.alert('Error', uploadResponse.message || 'Failed to upload image');
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('Error', 'Failed to upload image to server');
        } finally {
          setSaving(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const ColorButton = ({ label, colorKey, value }) => (
    <View style={styles.colorRow}>
      <Text style={styles.colorLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.colorButton, { backgroundColor: value }]}
        onPress={() => {
          setSelectedColorType(colorKey);
          setShowColorPicker(true);
        }}
      >
        <Text style={styles.colorCode}>{value}</Text>
      </TouchableOpacity>
    </View>
  );

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  if (loading) {
    return (
      <AdminLayout title="Logo Management" activeScreen="AdminLogoManagement" onNavigate={handleNavigate} onLogout={handleLogout}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading branding settings...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Logo Management" activeScreen="AdminLogoManagement" onNavigate={handleNavigate} onLogout={handleLogout}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Logo & Branding Management</Text>
          <Text style={styles.pageSubtitle}>Customize your website's appearance and branding</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'theme' && styles.activeTab]}
            onPress={() => setActiveTab('theme')}
          >
            <Ionicons name="color-palette" size={20} color={activeTab === 'theme' ? colors.white : colors.text} />
            <Text style={[styles.tabText, activeTab === 'theme' && styles.activeTabText]}>Theme Colors</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'logo' && styles.activeTab]}
            onPress={() => setActiveTab('logo')}
          >
            <Ionicons name="image" size={20} color={activeTab === 'logo' ? colors.white : colors.text} />
            <Text style={[styles.tabText, activeTab === 'logo' && styles.activeTabText]}>Logo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'favicon' && styles.activeTab]}
            onPress={() => setActiveTab('favicon')}
          >
            <Ionicons name="browsers" size={20} color={activeTab === 'favicon' ? colors.white : colors.text} />
            <Text style={[styles.tabText, activeTab === 'favicon' && styles.activeTabText]}>Icons</Text>
          </TouchableOpacity>
        </View>

        {/* Theme Colors Tab */}
        {activeTab === 'theme' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theme Colors</Text>
            <Text style={styles.sectionDescription}>
              Customize the color scheme of your website. Changes will be reflected across the entire platform.
            </Text>

            {/* Theme Presets */}
            <TouchableOpacity
              style={styles.presetsButton}
              onPress={() => setShowThemePresets(!showThemePresets)}
            >
              <Ionicons name="color-palette" size={20} color={colors.primary} />
              <Text style={styles.presetsButtonText}>Choose Theme Preset</Text>
              <Ionicons name={showThemePresets ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {showThemePresets && (
              <View style={styles.presetsContainer}>
                {themePresets.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.presetCard}
                    onPress={() => {
                      setThemeColors(preset.colors);
                      setShowThemePresets(false);
                      Alert.alert('Theme Applied', `${preset.name} theme has been applied`);
                    }}
                  >
                    <Text style={styles.presetName}>{preset.name}</Text>
                    <View style={styles.presetColorsPreview}>
                      <View style={[styles.presetColorDot, { backgroundColor: preset.colors.primary }]} />
                      <View style={[styles.presetColorDot, { backgroundColor: preset.colors.secondary }]} />
                      <View style={[styles.presetColorDot, { backgroundColor: preset.colors.success }]} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.divider} />

            <ColorButton label="Primary Color" colorKey="primary" value={themeColors.primary} />
            <ColorButton label="Secondary Color" colorKey="secondary" value={themeColors.secondary} />
            <ColorButton label="Success Color" colorKey="success" value={themeColors.success} />
            <ColorButton label="Error Color" colorKey="error" value={themeColors.error} />
            <ColorButton label="Warning Color" colorKey="warning" value={themeColors.warning} />
            <ColorButton label="Info Color" colorKey="info" value={themeColors.info} />

            {/* Preview */}
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.previewColors}>
                <View style={[styles.previewBox, { backgroundColor: themeColors.primary }]}>
                  <Text style={styles.previewLabel}>Primary</Text>
                </View>
                <View style={[styles.previewBox, { backgroundColor: themeColors.secondary }]}>
                  <Text style={styles.previewLabel}>Secondary</Text>
                </View>
                <View style={[styles.previewBox, { backgroundColor: themeColors.success }]}>
                  <Text style={styles.previewLabel}>Success</Text>
                </View>
                <View style={[styles.previewBox, { backgroundColor: themeColors.error }]}>
                  <Text style={styles.previewLabel}>Error</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveTheme}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  <Text style={styles.saveButtonText}>Save Theme</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Logo Tab */}
        {activeTab === 'logo' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Logo Configuration</Text>
            <Text style={styles.sectionDescription}>
              Choose between text logo, image logo, or a combination of both.
            </Text>

            {/* Logo Type Selection */}
            <Text style={styles.label}>Logo Type</Text>
            <View style={styles.logoTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.logoTypeButton,
                  logoConfig.logoType === 'text' && styles.logoTypeButtonActive
                ]}
                onPress={() => setLogoConfig({ ...logoConfig, logoType: 'text' })}
              >
                <Text style={[
                  styles.logoTypeButtonText,
                  logoConfig.logoType === 'text' && styles.logoTypeButtonTextActive
                ]}>Text Logo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.logoTypeButton,
                  logoConfig.logoType === 'image' && styles.logoTypeButtonActive
                ]}
                onPress={() => setLogoConfig({ ...logoConfig, logoType: 'image' })}
              >
                <Text style={[
                  styles.logoTypeButtonText,
                  logoConfig.logoType === 'image' && styles.logoTypeButtonTextActive
                ]}>Image Logo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.logoTypeButton,
                  logoConfig.logoType === 'combined' && styles.logoTypeButtonActive
                ]}
                onPress={() => setLogoConfig({ ...logoConfig, logoType: 'combined' })}
              >
                <Text style={[
                  styles.logoTypeButtonText,
                  logoConfig.logoType === 'combined' && styles.logoTypeButtonTextActive
                ]}>Combined</Text>
              </TouchableOpacity>
            </View>

            {/* Text Logo Configuration */}
            {(logoConfig.logoType === 'text' || logoConfig.logoType === 'combined') && (
              <View style={styles.configSection}>
                <Text style={styles.configTitle}>Text Logo Settings</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Primary Text</Text>
                  <TextInput
                    style={styles.input}
                    value={logoConfig.textLogo.primaryText}
                    onChangeText={(text) => setLogoConfig({
                      ...logoConfig,
                      textLogo: { ...logoConfig.textLogo, primaryText: text }
                    })}
                    placeholder="Freejob"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Secondary Text</Text>
                  <TextInput
                    style={styles.input}
                    value={logoConfig.textLogo.secondaryText}
                    onChangeText={(text) => setLogoConfig({
                      ...logoConfig,
                      textLogo: { ...logoConfig.textLogo, secondaryText: text }
                    })}
                    placeholder="wala"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                {/* Logo Preview */}
                <View style={styles.logoPreview}>
                  <Text style={[
                    styles.logoPreviewText,
                    { color: logoConfig.textLogo.primaryColor }
                  ]}>
                    {logoConfig.textLogo.primaryText}
                  </Text>
                  <Text style={[
                    styles.logoPreviewText,
                    { color: logoConfig.textLogo.secondaryColor }
                  ]}>
                    {logoConfig.textLogo.secondaryText}
                  </Text>
                </View>
              </View>
            )}

            {/* Image Logo Configuration */}
            {(logoConfig.logoType === 'image' || logoConfig.logoType === 'combined') && (
              <View style={styles.configSection}>
                <Text style={styles.configTitle}>Image Logo Settings</Text>
                
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => pickImage('logo')}
                >
                  <Ionicons name="cloud-upload" size={24} color={colors.white} />
                  <Text style={styles.uploadButtonText}>Upload Logo Image</Text>
                </TouchableOpacity>

                {logoConfig.imageLogo.url ? (
                  <View style={styles.imagePreview}>
                    <Text style={styles.imagePreviewText}>Image selected ✓</Text>
                  </View>
                ) : (
                  <Text style={styles.noImageText}>No image selected</Text>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Alt Text</Text>
                  <TextInput
                    style={styles.input}
                    value={logoConfig.imageLogo.altText}
                    onChangeText={(text) => setLogoConfig({
                      ...logoConfig,
                      imageLogo: { ...logoConfig.imageLogo, altText: text }
                    })}
                    placeholder="Website Logo"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveLogo}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="image" size={20} color={colors.white} />
                  <Text style={styles.saveButtonText}>Save Logo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Icons Tab */}
        {activeTab === 'favicon' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favicon & Icons</Text>
            <Text style={styles.sectionDescription}>
              Upload favicon and app icons for different platforms.
            </Text>

            {/* Favicon */}
            <View style={styles.iconSection}>
              <Text style={styles.iconTitle}>Favicon (16x16, 32x32)</Text>
              <Text style={styles.iconDescription}>
                The small icon displayed in browser tabs and bookmarks
              </Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickImage('favicon')}
              >
                <Ionicons name="browsers" size={24} color={colors.white} />
                <Text style={styles.uploadButtonText}>Upload Favicon</Text>
              </TouchableOpacity>
              {faviconUrl ? (
                <Text style={styles.uploadedText}>Favicon uploaded ✓</Text>
              ) : null}
            </View>

            {/* Apple Touch Icon */}
            <View style={styles.iconSection}>
              <Text style={styles.iconTitle}>Apple Touch Icon (180x180)</Text>
              <Text style={styles.iconDescription}>
                The icon used when adding your site to iOS home screen
              </Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickImage('apple-touch-icon')}
              >
                <Ionicons name="logo-apple" size={24} color={colors.white} />
                <Text style={styles.uploadButtonText}>Upload Apple Touch Icon</Text>
              </TouchableOpacity>
              {appleTouchIconUrl ? (
                <Text style={styles.uploadedText}>Apple Touch Icon uploaded ✓</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveTheme}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="browsers" size={20} color={colors.white} />
                  <Text style={styles.saveButtonText}>Save Icons</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Color Picker Modal */}
        <Modal
          visible={showColorPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowColorPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Color</Text>
                <TouchableOpacity onPress={() => setShowColorPicker(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.colorPickerContent}>
                <TextInput
                  style={styles.colorInput}
                  value={themeColors[selectedColorType] || '#000000'}
                  onChangeText={(text) => setThemeColors({
                    ...themeColors,
                    [selectedColorType]: text
                  })}
                  placeholder="#000000"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={7}
                />

                {/* Preset Colors */}
                <Text style={styles.presetsTitle}>Preset Colors</Text>
                <View style={styles.presetsGrid}>
                  {['#2563EB', '#FF6B35', '#10b981', '#ef4444', '#f59e0b', '#3b82f6',
                    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'].map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.presetColor, { backgroundColor: color }]}
                      onPress={() => {
                        setThemeColors({ ...themeColors, [selectedColorType]: color });
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowColorPicker(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body1,
    color: colors.textSecondary,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: {
    ...typography.h2,
    color: colors.text,
  },
  pageSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.body2,
    color: colors.text,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  colorLabel: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
  },
  colorButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  colorCode: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  previewTitle: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  previewColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  previewBox: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewLabel: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  label: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  logoTypeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  logoTypeButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  logoTypeButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  logoTypeButtonText: {
    ...typography.body2,
    color: colors.text,
  },
  logoTypeButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  configSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  configTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.text,
  },
  logoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  logoPreviewText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  uploadButtonText: {
    ...typography.button,
    color: colors.white,
  },
  imagePreview: {
    padding: spacing.md,
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  imagePreviewText: {
    ...typography.body2,
    color: colors.success,
    textAlign: 'center',
  },
  noImageText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  iconSection: {
    marginBottom: spacing.xl,
  },
  iconTitle: {
    ...typography.h6,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  iconDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  uploadedText: {
    ...typography.body2,
    color: colors.success,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
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
    ...typography.h3,
    color: colors.text,
  },
  colorPickerContent: {
    padding: spacing.lg,
  },
  colorInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  presetsTitle: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetColor: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
  },
  modalButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    ...typography.button,
    color: colors.white,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
  presetsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetsButtonText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
    marginLeft: spacing.sm,
  },
  presetsContainer: {
    marginBottom: spacing.lg,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetName: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
  },
  presetColorsPreview: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  presetColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
});

export default AdminLogoManagementScreen;
