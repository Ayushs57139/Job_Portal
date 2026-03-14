import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../config/api';

const COMPANY_TYPES = [
  'Educational',
  'Non-profit (NGO)',
  'Freelancer',
  'Individual/Self Employed',
  'Foundation/Trust',
  'Government Agency',
  'Partnership',
  'Sole Proprietorship',
  'Public Limited Company',
  'Private Limited Company',
  'Limited Liability Partnership (LLP)',
];

const KYCFormScreen = ({ route, navigation }) => {
  const { userType } = route.params || { userType: 'company' }; // company, consultancy, individual, freelancer
  
  const [companyType, setCompanyType] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState({});
  const [showCompanyTypeModal, setShowCompanyTypeModal] = useState(false);

  const isCompanyOrConsultancy = userType === 'company' || userType === 'consultancy';

  const getDocumentFields = () => {
    if (isCompanyOrConsultancy) {
      return [
        { key: 'gstCertificate', label: 'GST Certificate' },
        { key: 'certificateOfIncorporation', label: 'Certificate Of Incorporation' },
        { key: 'udyamMsmeCertificate', label: 'UDYAM / MSME Certificate' },
        { key: 'companyPanCard', label: 'Company PAN Card' },
        { key: 'companyIdCard', label: 'Company ID Card' },
        { key: 'otherDocument', label: 'Other Document' },
      ];
    } else {
      return [
        { key: 'aadharCard', label: 'Aadhar Card' },
        { key: 'panCard', label: 'PAN Card' },
        { key: 'voterId', label: 'Voter ID' },
        { key: 'otherIdDocument', label: 'Other Document' },
      ];
    }
  };

  const handleDocumentPick = async (docKey) => {
    try {
      // For web platform, use document picker directly
      if (Platform.OS === 'web') {
        try {
          const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: false, // On web, we don't need to copy to cache
          });

          if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            // On web, DocumentPicker returns a File object directly in some cases
            // Check if it's already a File object
            if (asset.file instanceof File) {
              updateDocument(docKey, asset.file);
            } else if (asset.uri) {
              // If we have a URI, try to convert it to a File
              try {
                // Check if it's a blob URL
                if (asset.uri.startsWith('blob:')) {
                  const response = await fetch(asset.uri);
                  const blob = await response.blob();
                  const file = new File([blob], asset.name || 'document', { 
                    type: asset.mimeType || blob.type || 'application/octet-stream' 
                  });
                  updateDocument(docKey, file);
                } else {
                  // For other URIs, try to fetch and convert
                  const response = await fetch(asset.uri);
                  const blob = await response.blob();
                  const file = new File([blob], asset.name || 'document', { 
                    type: asset.mimeType || blob.type || 'application/octet-stream' 
                  });
                  updateDocument(docKey, file);
                }
              } catch (fetchError) {
                console.error('Error converting file:', fetchError);
                // Fallback: store as object with uri (will be handled by API)
                updateDocument(docKey, {
                  uri: asset.uri,
                  type: asset.mimeType || 'application/octet-stream',
                  name: asset.name || 'document',
                });
              }
            } else {
              Alert.alert('Error', 'Unable to process selected file');
            }
          }
        } catch (error) {
          console.error('Document picker error:', error);
          Alert.alert('Error', 'Failed to pick document. Please try again.');
        }
        return;
      }

      // Request permissions for image picker on mobile
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Permission to access media library is required');
        return;
      }

      // Show options to pick image or document
      Alert.alert(
        'Select Document',
        'Choose how you want to upload the document',
        [
          {
            text: 'Camera',
            onPress: async () => {
              try {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                  const asset = result.assets[0];
                  const fileName = asset.uri.split('/').pop();
                  const match = /\.(\w+)$/.exec(fileName);
                  const type = match ? `image/${match[1]}` : 'image/jpeg';

                  updateDocument(docKey, {
                    uri: asset.uri,
                    type,
                    name: fileName,
                  });
                }
              } catch (error) {
                console.error('Camera error:', error);
                Alert.alert('Error', 'Failed to capture image. Please try again.');
              }
            },
          },
          {
            text: 'Gallery',
            onPress: async () => {
              try {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                  const asset = result.assets[0];
                  const fileName = asset.uri.split('/').pop();
                  const match = /\.(\w+)$/.exec(fileName);
                  const type = match ? `image/${match[1]}` : 'image/jpeg';

                  updateDocument(docKey, {
                    uri: asset.uri,
                    type,
                    name: fileName,
                  });
                }
              } catch (error) {
                console.error('Gallery error:', error);
                Alert.alert('Error', 'Failed to pick image. Please try again.');
              }
            },
          },
          {
            text: 'Document Picker',
            onPress: async () => {
              try {
                const result = await DocumentPicker.getDocumentAsync({
                  type: '*/*',
                  copyToCacheDirectory: true,
                });

                if (!result.canceled && result.assets && result.assets.length > 0) {
                  const asset = result.assets[0];
                  updateDocument(docKey, {
                    uri: asset.uri,
                    type: asset.mimeType || 'application/octet-stream',
                    name: asset.name,
                  });
                }
              } catch (error) {
                console.error('Document picker error:', error);
                Alert.alert('Error', 'Failed to pick document. Please try again.');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const updateDocument = (docKey, file) => {
    setDocuments((prev) => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        file,
      },
    }));
  };

  const updateIdNumber = (docKey, idNumber) => {
    setDocuments((prev) => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        idNumber,
      },
    }));
  };

  const validateForm = () => {
    if (isCompanyOrConsultancy && !companyType) {
      Alert.alert('Validation Error', 'Please select company type');
      return false;
    }

    // At least one document should be uploaded
    const hasDocuments = getDocumentFields().some((doc) => documents[doc.key]?.file);
    if (!hasDocuments) {
      Alert.alert('Validation Error', 'Please upload at least one document');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = {
        userType,
        companyType: isCompanyOrConsultancy ? companyType : undefined,
        documents: {},
        files: {},
      };

      // Prepare documents and files
      getDocumentFields().forEach((doc) => {
        const docData = documents[doc.key];
        if (docData) {
          // Always include document entry with idNumber (even if empty)
          formData.documents[doc.key] = {
            idNumber: docData.idNumber || '',
          };
          // Include file if it exists
          if (docData.file) {
            formData.files[doc.key] = docData.file;
          }
        }
      });

      console.log('Submitting KYC with formData:', {
        userType: formData.userType,
        companyType: formData.companyType,
        documentKeys: Object.keys(formData.documents),
        fileKeys: Object.keys(formData.files),
      });

      const response = await api.submitKYC(formData);

      console.log('KYC submission response:', response);

      // Determine dashboard route based on user type
      const dashboardRoute = userType === 'company' ? 'CompanyDashboard' : 'ConsultancyDashboard';

      // Navigate to dashboard immediately after successful submission
      if (response.isComplete) {
        // Show success message briefly, then navigate
        Alert.alert(
          'Success',
          'KYC documents submitted successfully!',
          [],
          { cancelable: false }
        );
      } else {
        // Documents saved but not complete
        Alert.alert(
          'Success', 
          'KYC documents saved. Please upload more documents to complete.',
          [],
          { cancelable: false }
        );
      }

      // Navigate to dashboard immediately (works on both web and mobile)
      setTimeout(() => {
        try {
          navigation.reset({
            index: 0,
            routes: [{ name: dashboardRoute }],
          });
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback: try regular navigate
          navigation.navigate(dashboardRoute);
        }
      }, 800);
    } catch (error) {
      console.error('KYC submission error:', error);
      const errorMessage = error.message || 'Failed to submit KYC documents. Please try again.';
      Alert.alert('Submission Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentField = (doc) => {
    const docData = documents[doc.key];
    const hasFile = !!docData?.file;

    return (
      <View key={doc.key} style={styles.documentSection}>
        <Text style={styles.documentLabel}>{doc.label}</Text>
        
        {/* ID Number Input */}
        <Text style={styles.idLabel}>Document ID Number</Text>
        <TextInput
          style={styles.idInput}
          value={docData?.idNumber || ''}
          onChangeText={(text) => updateIdNumber(doc.key, text)}
          placeholder={`Enter ${doc.label} ID`}
        />

        {/* Upload Button */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleDocumentPick(doc.key)}
        >
          <Ionicons
            name={hasFile ? 'checkmark-circle' : 'cloud-upload-outline'}
            size={24}
            color={hasFile ? '#22c55e' : '#6366f1'}
          />
          <Text style={[styles.uploadText, hasFile && styles.uploadTextSuccess]}>
            {hasFile ? 'Document Uploaded' : 'Upload Document'}
          </Text>
        </TouchableOpacity>

        {hasFile && (
          <View style={styles.fileInfo}>
            <Ionicons name="document-text-outline" size={16} color="#64748b" />
            <Text style={styles.fileName} numberOfLines={1}>
              {docData.file.name}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const newDocs = { ...documents };
                delete newDocs[doc.key];
                setDocuments(newDocs);
              }}
            >
              <Ionicons name="close-circle" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={userType === 'company' ? ['#2c3e50', '#34495e'] : ['#6366f1', '#8b5cf6']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Ionicons
          name={userType === 'company' ? 'business' : 'people'}
          size={48}
          color="#fff"
          style={styles.headerIcon}
        />
        <Text style={styles.headerTitle}>
          {userType === 'company' ? 'Company' : userType === 'consultancy' ? 'Consultancy' : 'Individual'} KYC
        </Text>
        <Text style={styles.headerSubtitle}>
          Upload your verification documents
        </Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Company Type Selection */}
        {isCompanyOrConsultancy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type of {userType === 'company' ? 'Company' : 'Consultancy'} *</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, !companyType && styles.dropdownButtonEmpty]}
              onPress={() => setShowCompanyTypeModal(true)}
            >
              <Text style={[styles.dropdownText, !companyType && styles.dropdownTextPlaceholder]}>
                {companyType || 'Select Type of ' + (userType === 'company' ? 'Company' : 'Consultancy')}
              </Text>
              <Ionicons name="chevron-down" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}

        {/* Documents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <Text style={styles.sectionSubtitle}>
            Upload at least one document to complete your KYC verification
          </Text>
          {getDocumentFields().map(renderDocumentField)}
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* Skip Button */}
          <TouchableOpacity
            style={[styles.submitButton, { flex: 1, backgroundColor: '#94a3b8' }]}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [
                  { name: userType === 'company' ? 'CompanyDashboard' : 'ConsultancyDashboard' },
                ],
              });
            }}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>Skip for Now</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { flex: 1 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Submitting...</Text>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit KYC</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Company Type Modal */}
      {showCompanyTypeModal && (
        <Modal
          visible={showCompanyTypeModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCompanyTypeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Type</Text>
                <TouchableOpacity onPress={() => setShowCompanyTypeModal(false)}>
                  <Ionicons name="close" size={28} color="#64748b" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {COMPANY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.modalOption}
                    onPress={() => {
                      setCompanyType(type);
                      setShowCompanyTypeModal(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{type}</Text>
                    {companyType === type && (
                      <Ionicons name="checkmark" size={24} color="#6366f1" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 1,
  },
  headerIcon: {
    marginTop: 10,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  dropdownButtonEmpty: {
    borderColor: '#cbd5e1',
  },
  dropdownText: {
    fontSize: 15,
    color: '#1e293b',
    flex: 1,
  },
  dropdownTextPlaceholder: {
    color: '#94a3b8',
  },
  documentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  idLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  idInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    gap: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  uploadTextSuccess: {
    color: '#22c55e',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    gap: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
});

export default KYCFormScreen;

