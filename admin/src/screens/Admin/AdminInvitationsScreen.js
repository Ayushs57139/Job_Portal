import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const AdminInvitationsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;

  const [loading, setLoading] = useState(false);
  const [recipientType, setRecipientType] = useState('users'); // users, companies, consultancies
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [consultancies, setConsultancies] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Message settings
  const [messageType, setMessageType] = useState('both'); // email, whatsapp, both
  const [emailSubject, setEmailSubject] = useState('Invitation to Join Our Platform');
  const [emailMessage, setEmailMessage] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalConsultancies: 0,
    selectedCount: 0,
    emailEnabled: false,
    whatsappEnabled: false
  });

  useEffect(() => {
    fetchAllData();
    checkSettings();
  }, []);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      selectedCount: selectedRecipients.length
    }));
  }, [selectedRecipients]);

  useEffect(() => {
    // Clear selection when switching recipient type
    setSelectedRecipients([]);
    setSelectAll(false);
    setSearchQuery('');
    setFilterStatus('all');
  }, [recipientType]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fetch Users
      const usersResponse = await fetch(`${API_URL}/admin/users?limit=10000`, { headers });
      const usersData = await usersResponse.json();
      setUsers(usersData.users || []);

      // Fetch Companies
      const companiesResponse = await fetch(`${API_URL}/admin/companies?limit=500`, { headers });
      const companiesData = await companiesResponse.json();
      setCompanies(companiesData.companies || []);

      // Fetch Consultancies
      const consultanciesResponse = await fetch(`${API_URL}/admin/consultancies?limit=500`, { headers });
      const consultanciesData = await consultanciesResponse.json();
      setConsultancies(consultanciesData.consultancies || []);
      
      setStats(prev => ({
        ...prev,
        totalUsers: usersData.users?.length || 0,
        totalCompanies: companiesData.companies?.length || 0,
        totalConsultancies: consultanciesData.consultancies?.length || 0
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const checkSettings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/admin/invitation-settings`, { headers });
      const data = await response.json();
      
      setStats(prev => ({
        ...prev,
        emailEnabled: data.emailEnabled || false,
        whatsappEnabled: data.whatsappEnabled || false
      }));
    } catch (error) {
      console.error('Error checking settings:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecipients([]);
    } else {
      const filtered = getFilteredRecipients();
      setSelectedRecipients(filtered.map(r => r._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRecipient = (recipientId) => {
    if (selectedRecipients.includes(recipientId)) {
      setSelectedRecipients(selectedRecipients.filter(id => id !== recipientId));
    } else {
      if (selectedRecipients.length >= 500) {
        Alert.alert('Limit Reached', 'You can select maximum 500 recipients at a time');
        return;
      }
      setSelectedRecipients([...selectedRecipients, recipientId]);
    }
  };

  const getCurrentRecipients = () => {
    if (recipientType === 'users') return users;
    if (recipientType === 'companies') return companies;
    if (recipientType === 'consultancies') return consultancies;
    return [];
  };

  const getFilteredRecipients = () => {
    let filtered = getCurrentRecipients();

    if (searchQuery) {
      filtered = filtered.filter(recipient => {
        if (recipientType === 'users') {
          return (
            recipient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipient.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipient.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          return (
            recipient.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipient.email?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(recipient => {
        if (filterStatus === 'active') return recipient.isActive;
        if (filterStatus === 'inactive') return !recipient.isActive;
        if (filterStatus === 'verified') return recipient.isVerified;
        if (filterStatus === 'unverified') return !recipient.isVerified;
        return true;
      });
    }

    return filtered;
  };

  const handleSendInvitations = async () => {
    if (selectedRecipients.length === 0) {
      Alert.alert('No Selection', `Please select at least one ${recipientType === 'users' ? 'user' : recipientType === 'companies' ? 'company' : 'consultancy'}`);
      return;
    }

    if (messageType === 'email' && !emailMessage) {
      Alert.alert('Missing Content', 'Please enter email message');
      return;
    }

    if (messageType === 'whatsapp' && !whatsappMessage) {
      Alert.alert('Missing Content', 'Please enter WhatsApp message');
      return;
    }

    if (messageType === 'both' && (!emailMessage || !whatsappMessage)) {
      Alert.alert('Missing Content', 'Please enter both email and WhatsApp messages');
      return;
    }

    Alert.alert(
      'Confirm Send',
      `Send ${messageType === 'both' ? 'Email & WhatsApp' : messageType} invitations to ${selectedRecipients.length} ${recipientType}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              };

              const response = await fetch(`${API_URL}/admin/send-bulk-invitations`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  recipientIds: selectedRecipients,
                  recipientType,
                  messageType,
                  emailSubject,
                  emailMessage,
                  whatsappMessage
                })
              });

              const data = await response.json();

              if (response.ok) {
                Alert.alert(
                  'Success',
                  `Invitations sent successfully!\n\nEmail: ${data.emailSent || 0}\nWhatsApp: ${data.whatsappSent || 0}\nFailed: ${data.failed || 0}`
                );
                setSelectedRecipients([]);
                setSelectAll(false);
              } else {
                throw new Error(data.message || 'Failed to send invitations');
              }
            } catch (error) {
              console.error('Error sending invitations:', error);
              Alert.alert('Error', error.message || 'Failed to send invitations');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const dynamicStyles = getStyles(isMobile, isTablet);
  const filteredRecipients = getFilteredRecipients();
  const currentTotal = recipientType === 'users' ? stats.totalUsers : recipientType === 'companies' ? stats.totalCompanies : stats.totalConsultancies;

  return (
    <AdminLayout
      title="Bulk Invitations"
      activeScreen="AdminInvitations"
      onNavigate={(screen) => navigation.navigate(screen)}
      onLogout={() => navigation.replace('AdminLogin')}
    >
      <ScrollView style={dynamicStyles.container}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.title}>Bulk Invitations</Text>
            <Text style={dynamicStyles.subtitle}>Send bulk email and WhatsApp invitations to companies</Text>
          </View>
          <TouchableOpacity
            style={dynamicStyles.settingsButton}
            onPress={() => navigation.navigate('AdminWhatsAppSettings')}
          >
            <Ionicons name="settings-outline" size={20} color="#FFF" />
            <Text style={dynamicStyles.settingsButtonText}>WhatsApp Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.statCard}>
            <Ionicons name="people-outline" size={24} color="#4A90E2" />
            <Text style={dynamicStyles.statValue}>{stats.totalUsers}</Text>
            <Text style={dynamicStyles.statLabel}>Total Users</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Ionicons name="business-outline" size={24} color="#9B59B6" />
            <Text style={dynamicStyles.statValue}>{stats.totalCompanies}</Text>
            <Text style={dynamicStyles.statLabel}>Total Companies</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Ionicons name="briefcase-outline" size={24} color="#E67E22" />
            <Text style={dynamicStyles.statValue}>{stats.totalConsultancies}</Text>
            <Text style={dynamicStyles.statLabel}>Total Consultancies</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#27AE60" />
            <Text style={dynamicStyles.statValue}>{stats.selectedCount}</Text>
            <Text style={dynamicStyles.statLabel}>Selected</Text>
          </View>
        </View>

        {/* Recipient Type Tabs */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Select Recipient Type</Text>
          <View style={dynamicStyles.recipientTypeContainer}>
            <TouchableOpacity
              style={[dynamicStyles.recipientTypeButton, recipientType === 'users' && dynamicStyles.recipientTypeButtonActive]}
              onPress={() => setRecipientType('users')}
            >
              <Ionicons name="people-outline" size={20} color={recipientType === 'users' ? '#FFF' : '#666'} />
              <Text style={[dynamicStyles.recipientTypeText, recipientType === 'users' && dynamicStyles.recipientTypeTextActive]}>
                Users ({stats.totalUsers})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.recipientTypeButton, recipientType === 'companies' && dynamicStyles.recipientTypeButtonActive]}
              onPress={() => setRecipientType('companies')}
            >
              <Ionicons name="business-outline" size={20} color={recipientType === 'companies' ? '#FFF' : '#666'} />
              <Text style={[dynamicStyles.recipientTypeText, recipientType === 'companies' && dynamicStyles.recipientTypeTextActive]}>
                Companies ({stats.totalCompanies})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.recipientTypeButton, recipientType === 'consultancies' && dynamicStyles.recipientTypeButtonActive]}
              onPress={() => setRecipientType('consultancies')}
            >
              <Ionicons name="briefcase-outline" size={20} color={recipientType === 'consultancies' ? '#FFF' : '#666'} />
              <Text style={[dynamicStyles.recipientTypeText, recipientType === 'consultancies' && dynamicStyles.recipientTypeTextActive]}>
                Consultancies ({stats.totalConsultancies})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Message Type Selection */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Message Type</Text>
          <View style={dynamicStyles.messageTypeContainer}>
            <TouchableOpacity
              style={[dynamicStyles.messageTypeButton, messageType === 'email' && dynamicStyles.messageTypeButtonActive]}
              onPress={() => setMessageType('email')}
            >
              <Ionicons name="mail-outline" size={20} color={messageType === 'email' ? '#FFF' : '#666'} />
              <Text style={[dynamicStyles.messageTypeText, messageType === 'email' && dynamicStyles.messageTypeTextActive]}>
                Email Only
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.messageTypeButton, messageType === 'whatsapp' && dynamicStyles.messageTypeButtonActive]}
              onPress={() => setMessageType('whatsapp')}
            >
              <Ionicons name="logo-whatsapp" size={20} color={messageType === 'whatsapp' ? '#FFF' : '#666'} />
              <Text style={[dynamicStyles.messageTypeText, messageType === 'whatsapp' && dynamicStyles.messageTypeTextActive]}>
                WhatsApp Only
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.messageTypeButton, messageType === 'both' && dynamicStyles.messageTypeButtonActive]}
              onPress={() => setMessageType('both')}
            >
              <Ionicons name="send-outline" size={20} color={messageType === 'both' ? '#FFF' : '#666'} />
              <Text style={[dynamicStyles.messageTypeText, messageType === 'both' && dynamicStyles.messageTypeTextActive]}>
                Both
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Email Message */}
        {(messageType === 'email' || messageType === 'both') && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Email Message</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Email Subject"
              value={emailSubject}
              onChangeText={setEmailSubject}
            />
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea]}
              placeholder="Email Message (supports HTML)"
              value={emailMessage}
              onChangeText={setEmailMessage}
              multiline
              numberOfLines={6}
            />
          </View>
        )}

        {/* WhatsApp Message */}
        {(messageType === 'whatsapp' || messageType === 'both') && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>WhatsApp Message</Text>
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea]}
              placeholder="WhatsApp Message (plain text only)"
              value={whatsappMessage}
              onChangeText={setWhatsappMessage}
              multiline
              numberOfLines={6}
            />
            <Text style={dynamicStyles.helperText}>
              Variables: {'{companyName}'}, {'{email}'}, {'{phone}'}
            </Text>
          </View>
        )}

        {/* Recipient Selection */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Text style={dynamicStyles.sectionTitle}>
              Select {recipientType === 'users' ? 'Users' : recipientType === 'companies' ? 'Companies' : 'Consultancies'} (Max 500)
            </Text>
            <TouchableOpacity
              style={dynamicStyles.selectAllButton}
              onPress={handleSelectAll}
            >
              <Ionicons 
                name={selectAll ? "checkbox-outline" : "square-outline"} 
                size={20} 
                color="#4A90E2" 
              />
              <Text style={dynamicStyles.selectAllText}>Select All</Text>
            </TouchableOpacity>
          </View>

          {/* Search and Filter */}
          <View style={dynamicStyles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput
              style={dynamicStyles.searchInput}
              placeholder={`Search ${recipientType}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={dynamicStyles.filterContainer}>
            {['all', 'active', 'inactive', 'verified', 'unverified'].map(status => (
              <TouchableOpacity
                key={status}
                style={[dynamicStyles.filterButton, filterStatus === status && dynamicStyles.filterButtonActive]}
                onPress={() => setFilterStatus(status)}
              >
                <Text style={[dynamicStyles.filterButtonText, filterStatus === status && dynamicStyles.filterButtonTextActive]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recipient List */}
          {loading ? (
            <View style={dynamicStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={dynamicStyles.loadingText}>Loading {recipientType}...</Text>
            </View>
          ) : filteredRecipients.length === 0 ? (
            <View style={dynamicStyles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#CCC" />
              <Text style={dynamicStyles.emptyText}>No {recipientType} found</Text>
            </View>
          ) : (
            <View style={dynamicStyles.recipientList}>
              {filteredRecipients.map(recipient => {
                const displayName = recipientType === 'users' 
                  ? (recipient.name || `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || 'N/A')
                  : recipient.companyName;
                const displayEmail = recipient.email;
                const displayRole = recipientType === 'users' ? (recipient.userType || recipient.role || 'N/A') : null;

                return (
                  <TouchableOpacity
                    key={recipient._id}
                    style={[
                      dynamicStyles.recipientItem,
                      selectedRecipients.includes(recipient._id) && dynamicStyles.recipientItemSelected
                    ]}
                    onPress={() => handleSelectRecipient(recipient._id)}
                  >
                    <Ionicons
                      name={selectedRecipients.includes(recipient._id) ? "checkbox-outline" : "square-outline"}
                      size={24}
                      color={selectedRecipients.includes(recipient._id) ? "#4A90E2" : "#CCC"}
                    />
                    <View style={dynamicStyles.recipientInfo}>
                      <Text style={dynamicStyles.recipientName}>{displayName}</Text>
                      <Text style={dynamicStyles.recipientEmail}>{displayEmail}</Text>
                      {displayRole && (
                        <Text style={dynamicStyles.recipientRole}>{displayRole}</Text>
                      )}
                      <View style={dynamicStyles.recipientBadges}>
                        {recipient.isActive && (
                          <View style={[dynamicStyles.badge, dynamicStyles.badgeActive]}>
                            <Text style={dynamicStyles.badgeText}>Active</Text>
                          </View>
                        )}
                        {recipient.isVerified && (
                          <View style={[dynamicStyles.badge, dynamicStyles.badgeVerified]}>
                            <Text style={dynamicStyles.badgeText}>Verified</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[dynamicStyles.sendButton, (loading || selectedRecipients.length === 0) && dynamicStyles.sendButtonDisabled]}
          onPress={handleSendInvitations}
          disabled={loading || selectedRecipients.length === 0}
        >
          <Ionicons name="send-outline" size={20} color="#FFF" />
          <Text style={dynamicStyles.sendButtonText}>
            {loading ? 'Sending...' : `Send to ${selectedRecipients.length} ${recipientType === 'users' ? 'Users' : recipientType === 'companies' ? 'Companies' : 'Consultancies'}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: isMobile ? 15 : 0,
  },
  title: {
    fontSize: isMobile ? 24 : 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  settingsButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  recipientTypeContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
  },
  recipientTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  recipientTypeButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  recipientTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  recipientTypeTextActive: {
    color: '#FFF',
  },
  messageTypeContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
  },
  messageTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  messageTypeButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  messageTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  messageTypeTextActive: {
    color: '#FFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#9CA3AF',
  },
  recipientList: {
    gap: 10,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  recipientItemSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#4A90E2',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recipientEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  recipientRole: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  recipientBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: '#D1FAE5',
  },
  badgeVerified: {
    backgroundColor: '#DBEAFE',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminInvitationsScreen;
