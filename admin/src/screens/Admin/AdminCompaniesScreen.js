import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal, Platform, Linking } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminCompaniesScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    blocked: 0,
    verified: 0,
    unverified: 0,
  });
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [bulkActionModalVisible, setBulkActionModalVisible] = useState(false);
  const [importExportLoading, setImportExportLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchQuery, filterStatus, companies]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/admin/companies`, { headers });
      const data = await response.json();
      
      setCompanies(data.companies || []);
      calculateStats(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      Alert.alert('Error', 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (companiesData) => {
    const newStats = {
      total: companiesData.length,
      active: companiesData.filter(c => c.isActive && c.isVerified).length,
      pending: companiesData.filter(c => !c.isVerified).length,
      blocked: companiesData.filter(c => !c.isActive).length,
      verified: companiesData.filter(c => c.isVerified).length,
      unverified: companiesData.filter(c => !c.isVerified).length,
    };
    setStats(newStats);
  };

  const filterCompanies = () => {
    let filtered = [...companies];

    if (searchQuery) {
      filtered = filtered.filter(company =>
        company.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (filterStatus) {
      case 'ACTIVE':
        filtered = filtered.filter(c => c.isActive && c.isVerified);
        break;
      case 'PENDING':
        filtered = filtered.filter(c => !c.isVerified);
        break;
      case 'BLOCKED':
        filtered = filtered.filter(c => !c.isActive);
        break;
      case 'VERIFIED':
        filtered = filtered.filter(c => c.isVerified);
        break;
      case 'UNVERIFIED':
        filtered = filtered.filter(c => !c.isVerified);
        break;
      default:
        break;
    }

    setFilteredCompanies(filtered);
  };

  const toggleCompanyStatus = async (companyId, currentStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/admin/companies/${companyId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: !currentStatus })
      });
      Alert.alert('Success', 'Company status updated successfully');
      fetchCompanies();
    } catch (error) {
      console.error('Error updating company status:', error);
      Alert.alert('Error', 'Failed to update company status');
    }
  };

  const verifyCompany = async (companyId) => {
    Alert.alert(
      'Verify Company',
      'Are you sure you want to verify this company?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              await fetch(`${API_URL}/admin/companies/${companyId}/verify`, {
                method: 'PATCH',
                headers
              });
              Alert.alert('Success', 'Company verified successfully');
              fetchCompanies();
            } catch (error) {
              console.error('Error verifying company:', error);
              Alert.alert('Error', 'Failed to verify company');
            }
          }
        }
      ]
    );
  };

  const deleteCompany = async (companyId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this company? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              await fetch(`${API_URL}/admin/companies/${companyId}`, {
                method: 'DELETE',
                headers
              });
              Alert.alert('Success', 'Company deleted successfully');
              fetchCompanies();
            } catch (error) {
              console.error('Error deleting company:', error);
              Alert.alert('Error', 'Failed to delete company');
            }
          }
        }
      ]
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedCompanies.length === 0) {
      Alert.alert('Error', 'Please select at least one company');
      return;
    }

    const actionText = action === 'approve' ? 'approve' : action === 'block' ? 'block' : 'delete';
    Alert.alert(
      `Confirm Bulk ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      `Are you sure you want to ${actionText} ${selectedCompanies.length} companies?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: action === 'delete' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              await fetch(`${API_URL}/admin/companies/bulk/${action}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ companyIds: selectedCompanies })
              });
              Alert.alert('Success', `Companies ${actionText}ed successfully`);
              setSelectedCompanies([]);
              setBulkActionModalVisible(false);
              fetchCompanies();
            } catch (error) {
              console.error(`Error ${actionText}ing companies:`, error);
              Alert.alert('Error', `Failed to ${actionText} companies`);
            }
          }
        }
      ]
    );
  };

  const handleBulkExport = async () => {
    try {
      setImportExportLoading(true);
      
      const csvHeader = 'Company Name,Email,Contact Person,Phone,Address,City,State,Website,Industry,Status,Verified,Joined Date\n';
      const csvRows = companies.map(company => {
        const name = company.companyName || 'N/A';
        const email = company.email || '';
        const contact = company.contactPerson || 'N/A';
        const phone = company.phone || 'N/A';
        const address = company.address || 'N/A';
        const city = company.city || 'N/A';
        const state = company.state || 'N/A';
        const website = company.website || 'N/A';
        const industry = company.industry || 'N/A';
        const status = company.isActive ? 'ACTIVE' : 'INACTIVE';
        const verified = company.isVerified ? 'Yes' : 'No';
        const joined = formatDate(company.createdAt);
        return `"${name}","${email}","${contact}","${phone}","${address}","${city}","${state}","${website}","${industry}","${status}","${verified}","${joined}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `companies_export_${Date.now()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        Alert.alert('Success', 'Companies exported successfully');
      } else {
        const fileName = `companies_export_${Date.now()}.csv`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(filePath, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath);
          Alert.alert('Success', 'Companies exported successfully');
        } else {
          Alert.alert('Info', `File saved to: ${filePath}`);
        }
      }
    } catch (error) {
      console.error('Error exporting companies:', error);
      Alert.alert('Error', 'Failed to export companies');
    } finally {
      setImportExportLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const toggleSelectCompany = (companyId) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCompanies.length === filteredCompanies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(filteredCompanies.map(c => c._id || c.id));
    }
  };

  const dynamicStyles = getStyles(isMobile, isTablet);

  if (loading) {
    return (
      <AdminLayout
        title="Companies"
        activeScreen="AdminCompanies"
        onNavigate={(screen) => navigation.navigate(screen)}
        onLogout={() => navigation.replace('AdminLogin')}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={dynamicStyles.loadingText}>Loading companies...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Companies"
      activeScreen="AdminCompanies"
      onNavigate={(screen) => navigation.navigate(screen)}
      onLogout={() => navigation.replace('AdminLogin')}
    >
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.headerSection}>
          <View>
            <Text style={dynamicStyles.pageTitle}>Company Management</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage all registered companies</Text>
          </View>
          <View style={dynamicStyles.bulkActionsContainer}>
            {selectedCompanies.length > 0 && (
              <TouchableOpacity
                style={dynamicStyles.bulkActionButton}
                onPress={() => setBulkActionModalVisible(true)}
              >
                <Ionicons name="checkmark-done-outline" size={18} color="#FFF" />
                <Text style={dynamicStyles.bulkActionButtonText}>
                  Bulk Actions ({selectedCompanies.length})
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={dynamicStyles.exportButton}
              onPress={handleBulkExport}
              disabled={importExportLoading}
            >
              <Ionicons name="cloud-download-outline" size={18} color="#FFF" />
              <Text style={dynamicStyles.exportButtonText}>
                {importExportLoading ? 'Processing...' : 'Export CSV'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={dynamicStyles.statsCardsContainer}
          contentContainerStyle={dynamicStyles.statsCardsContent}
        >
          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterStatus === 'ALL' && dynamicStyles.statCardActive]}
            onPress={() => setFilterStatus('ALL')}
          >
            <Ionicons name="business-outline" size={24} color="#3498DB" />
            <Text style={dynamicStyles.statCardValue}>{stats.total}</Text>
            <Text style={dynamicStyles.statCardLabel}>Total Companies</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterStatus === 'ACTIVE' && dynamicStyles.statCardActive]}
            onPress={() => setFilterStatus('ACTIVE')}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#27AE60" />
            <Text style={dynamicStyles.statCardValue}>{stats.active}</Text>
            <Text style={dynamicStyles.statCardLabel}>Active</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterStatus === 'PENDING' && dynamicStyles.statCardActive]}
            onPress={() => setFilterStatus('PENDING')}
          >
            <Ionicons name="time-outline" size={24} color="#F39C12" />
            <Text style={dynamicStyles.statCardValue}>{stats.pending}</Text>
            <Text style={dynamicStyles.statCardLabel}>Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterStatus === 'BLOCKED' && dynamicStyles.statCardActive]}
            onPress={() => setFilterStatus('BLOCKED')}
          >
            <Ionicons name="ban-outline" size={24} color="#E74C3C" />
            <Text style={dynamicStyles.statCardValue}>{stats.blocked}</Text>
            <Text style={dynamicStyles.statCardLabel}>Blocked</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterStatus === 'VERIFIED' && dynamicStyles.statCardActive]}
            onPress={() => setFilterStatus('VERIFIED')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#16A085" />
            <Text style={dynamicStyles.statCardValue}>{stats.verified}</Text>
            <Text style={dynamicStyles.statCardLabel}>Verified</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.statCard, filterStatus === 'UNVERIFIED' && dynamicStyles.statCardActive]}
            onPress={() => setFilterStatus('UNVERIFIED')}
          >
            <Ionicons name="alert-circle-outline" size={24} color="#9B59B6" />
            <Text style={dynamicStyles.statCardValue}>{stats.unverified}</Text>
            <Text style={dynamicStyles.statCardLabel}>Unverified</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Search Bar */}
        <View style={dynamicStyles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={dynamicStyles.searchIcon} />
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Search by company name, email, or contact person..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Companies Table */}
        <View style={dynamicStyles.tableContainer}>
          <View style={dynamicStyles.tableHeader}>
            <TouchableOpacity 
              style={dynamicStyles.checkboxCell}
              onPress={toggleSelectAll}
            >
              <Ionicons 
                name={selectedCompanies.length === filteredCompanies.length && filteredCompanies.length > 0 ? "checkbox" : "square-outline"} 
                size={20} 
                color="#4A90E2" 
              />
            </TouchableOpacity>
            <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.nameColumn]}>Company Name</Text>
            <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.emailColumn]}>Email</Text>
            <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.contactColumn]}>Contact Person</Text>
            <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.statusColumn]}>Status</Text>
            <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.verifiedColumn]}>Verified</Text>
            <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.joinedColumn]}>Joined</Text>
            <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.actionsColumn]}>Actions</Text>
          </View>

          <ScrollView style={dynamicStyles.tableBody}>
            {filteredCompanies.length === 0 ? (
              <View style={dynamicStyles.emptyState}>
                <Ionicons name="business-outline" size={64} color="#CCC" />
                <Text style={dynamicStyles.emptyStateText}>No companies found</Text>
                <Text style={dynamicStyles.emptyStateSubtext}>
                  {searchQuery ? 'Try adjusting your search' : 'Companies will appear here once registered'}
                </Text>
              </View>
            ) : (
              filteredCompanies.map((company) => (
                <View key={company._id || company.id} style={dynamicStyles.tableRow}>
                  <TouchableOpacity 
                    style={dynamicStyles.checkboxCell}
                    onPress={() => toggleSelectCompany(company._id || company.id)}
                  >
                    <Ionicons 
                      name={selectedCompanies.includes(company._id || company.id) ? "checkbox" : "square-outline"} 
                      size={20} 
                      color="#4A90E2" 
                    />
                  </TouchableOpacity>
                  <Text style={[dynamicStyles.tableCell, dynamicStyles.nameColumn]}>{company.companyName || 'N/A'}</Text>
                  <Text style={[dynamicStyles.tableCell, dynamicStyles.emailColumn]}>{company.email || 'N/A'}</Text>
                  <Text style={[dynamicStyles.tableCell, dynamicStyles.contactColumn]}>{company.contactPerson || 'N/A'}</Text>
                  <View style={[dynamicStyles.tableCell, dynamicStyles.statusColumn]}>
                    <View style={[dynamicStyles.statusBadge, company.isActive ? dynamicStyles.statusActive : dynamicStyles.statusInactive]}>
                      <Text style={dynamicStyles.statusText}>{company.isActive ? 'Active' : 'Inactive'}</Text>
                    </View>
                  </View>
                  <View style={[dynamicStyles.tableCell, dynamicStyles.verifiedColumn]}>
                    <Ionicons 
                      name={company.isVerified ? "checkmark-circle" : "close-circle"} 
                      size={20} 
                      color={company.isVerified ? "#27AE60" : "#E74C3C"} 
                    />
                  </View>
                  <Text style={[dynamicStyles.tableCell, dynamicStyles.joinedColumn]}>{formatDate(company.createdAt)}</Text>
                  <View style={[dynamicStyles.tableCell, dynamicStyles.actionsColumn]}>
                    <TouchableOpacity
                      style={dynamicStyles.actionButton}
                      onPress={() => navigation.navigate('AdminCompanyDetails', { companyId: company._id || company.id })}
                    >
                      <Ionicons name="eye-outline" size={18} color="#4A90E2" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={dynamicStyles.actionButton}
                      onPress={() => navigation.navigate('AdminCompanyDetails', { companyId: company._id || company.id, mode: 'edit' })}
                    >
                      <Ionicons name="create-outline" size={18} color="#F39C12" />
                    </TouchableOpacity>
                    {!company.isVerified && (
                      <TouchableOpacity
                        style={dynamicStyles.actionButton}
                        onPress={() => verifyCompany(company._id || company.id)}
                      >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#27AE60" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={dynamicStyles.actionButton}
                      onPress={() => toggleCompanyStatus(company._id || company.id, company.isActive)}
                    >
                      <Ionicons name={company.isActive ? "ban-outline" : "checkmark-outline"} size={18} color={company.isActive ? "#E74C3C" : "#27AE60"} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={dynamicStyles.actionButton}
                      onPress={() => deleteCompany(company._id || company.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* Bulk Action Modal */}
        <Modal
          visible={bulkActionModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setBulkActionModalVisible(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <Text style={dynamicStyles.modalTitle}>Bulk Actions</Text>
              <Text style={dynamicStyles.modalSubtitle}>{selectedCompanies.length} companies selected</Text>
              
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.approveButton]}
                onPress={() => handleBulkAction('approve')}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={dynamicStyles.modalButtonText}>Approve All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.blockButton]}
                onPress={() => handleBulkAction('block')}
              >
                <Ionicons name="ban-outline" size={20} color="#FFF" />
                <Text style={dynamicStyles.modalButtonText}>Block All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.deleteButton]}
                onPress={() => handleBulkAction('delete')}
              >
                <Ionicons name="trash-outline" size={20} color="#FFF" />
                <Text style={dynamicStyles.modalButtonText}>Delete All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.cancelButton]}
                onPress={() => setBulkActionModalVisible(false)}
              >
                <Text style={[dynamicStyles.modalButtonText, { color: '#666' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
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
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  headerSection: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pageTitle: {
    fontSize: isMobile ? 22 : 26,
    fontWeight: '700',
    color: '#1F2937',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  bulkActionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: isMobile ? 12 : 0,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9B59B6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  bulkActionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCardsContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsCardsContent: {
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statCardActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF5FF',
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: '#4B5563',
  },
  checkboxCell: {
    width: 40,
    alignItems: 'center',
  },
  nameColumn: {
    flex: 2,
    fontWeight: '600',
    color: '#1F2937',
  },
  emailColumn: {
    flex: 2,
  },
  contactColumn: {
    flex: 1.5,
  },
  statusColumn: {
    flex: 1,
  },
  verifiedColumn: {
    flex: 0.8,
    alignItems: 'center',
  },
  joinedColumn: {
    flex: 1.2,
  },
  actionsColumn: {
    flex: 1.5,
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: isMobile ? '90%' : 400,
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#27AE60',
  },
  blockButton: {
    backgroundColor: '#F39C12',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AdminCompaniesScreen;
