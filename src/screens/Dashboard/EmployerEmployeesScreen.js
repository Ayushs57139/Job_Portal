import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const DEFAULT_PERMISSIONS = [
  'canPostJobs',
  'canManageJobs',
  'canViewApplications',
  'canManageApplications',
];

const ALL_PERMISSIONS = [
  { key: 'canPostJobs', label: 'Post Jobs' },
  { key: 'canManageJobs', label: 'Manage Jobs' },
  { key: 'canViewApplications', label: 'View Applications' },
  { key: 'canManageApplications', label: 'Manage Applications' },
  { key: 'canManageUsers', label: 'Manage Employees' },
  { key: 'canEditCompanyProfile', label: 'Edit Company Profile' },
  { key: 'canViewCandidates', label: 'Candidate Search' },
];

const EmployerEmployeesScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const { isMobile } = responsive;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subusers, setSubusers] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee',
    permissions: DEFAULT_PERMISSIONS,
  });

  const loadSubusers = async () => {
    try {
      setLoading(true);
      const data = await api.request('/subusers');
      setSubusers(data.subusers || []);
    } catch (e) {
      console.error('Load subusers error', e);
      Alert.alert('Error', 'Failed to load employees');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadSubusers(); }, []);

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.firstName) {
      Alert.alert('Validation', 'Please fill first name and email');
      return;
    }
    try {
      const payload = {
        email: inviteForm.email.trim().toLowerCase(),
        firstName: inviteForm.firstName.trim(),
        lastName: inviteForm.lastName.trim(),
        role: inviteForm.role,
        permissions: inviteForm.permissions,
      };
      const data = await api.request('/subusers/invite', { method: 'POST', body: JSON.stringify(payload) });
      setInviteOpen(false);
      setInviteForm({ firstName: '', lastName: '', email: '', role: 'employee', permissions: DEFAULT_PERMISSIONS });
      await loadSubusers();
      Alert.alert('Invited', 'Invitation sent to employee');
    } catch (e) {
      console.error('Invite error', e);
      Alert.alert('Error', e.message || 'Failed to invite employee');
    }
  };

  const handleUpdateRole = async () => {
    if (!selected) return;
    try {
      const payload = { role: selected.role || 'employee', permissions: selected.permissions || [] };
      await api.request(`/subusers/${selected.id}/role`, { method: 'PUT', body: JSON.stringify(payload) });
      setEditOpen(false);
      setSelected(null);
      await loadSubusers();
      Alert.alert('Updated', 'Employee permissions updated');
    } catch (e) {
      console.error('Update role error', e);
      Alert.alert('Error', e.message || 'Failed to update permissions');
    }
  };

  const handleRemove = async (id) => {
    Alert.alert('Remove Employee', 'Are you sure you want to deactivate this employee?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await api.request(`/subusers/${id}`, { method: 'DELETE' });
          await loadSubusers();
        } catch (e) {
          Alert.alert('Error', e.message || 'Failed to remove employee');
        }
      }}
    ]);
  };

  const togglePermission = (target, perm) => {
    const has = target.permissions.includes(perm);
    const next = has ? target.permissions.filter(p => p !== perm) : [...target.permissions, perm];
    if (target === inviteForm) {
      setInviteForm({ ...inviteForm, permissions: next });
    } else if (selected) {
      setSelected({ ...selected, permissions: next });
    }
  };

  const renderSubuserCard = (u) => (
    <View key={u.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{u.firstName} {u.lastName}</Text>
          <Text style={styles.email}>{u.email}</Text>
        </View>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: (u.invitationAccepted ? colors.success : colors.warning) + '20' }]}>
            <Text style={[styles.badgeText, { color: u.invitationAccepted ? colors.success : colors.warning }]}>
              {u.invitationAccepted ? 'Active' : 'Invited'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.row}><Ionicons name="shield-checkmark-outline" size={16} color={colors.textSecondary} /><Text style={styles.rowText}>{u.role || 'employee'}</Text></View>
      {u.permissions && u.permissions.length > 0 && (
        <View style={styles.permList}>
          {u.permissions.slice(0,5).map((p, i) => (<View key={i} style={styles.permTag}><Text style={styles.permText}>{p}</Text></View>))}
          {u.permissions.length > 5 && (<View style={styles.permTag}><Text style={styles.permText}>+{u.permissions.length - 5}</Text></View>)}
        </View>
      )}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => { setSelected({ id: u.id, role: u.role || 'employee', permissions: u.permissions || [] }); setEditOpen(true); }}>
          <Ionicons name="create-outline" size={18} color={colors.white} /><Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={() => handleRemove(u.id)}>
          <Ionicons name="trash-outline" size={18} color={colors.white} /><Text style={styles.actionText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading employees…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isMobile && (
        <View style={styles.sidebar}>
          <EmployerSidebar permanent navigation={navigation} role="company" activeKey="employees" />
        </View>
      )}
      {isMobile && (
        <EmployerSidebar 
          visible={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          navigation={navigation} 
          role="company" 
          activeKey="employees" 
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
        <View style={[styles.headerBar, isMobile && styles.headerBarMobile]}>
          <Text style={[styles.title, isMobile && styles.titleMobile]}>Employee Management</Text>
          <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
            <TouchableOpacity style={styles.primaryBtn} onPress={()=>setInviteOpen(true)}>
              <Ionicons name="person-add-outline" size={18} color={colors.white} />
              <Text style={styles.primaryBtnText}>Add Employee</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={{ flex: 1, padding: spacing.lg }}>
          {subusers.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No employees yet</Text>
              <Text style={styles.emptySub}>Invite your first employee to collaborate</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={()=>setInviteOpen(true)}>
                <Text style={styles.primaryBtnText}>Invite Employee</Text>
              </TouchableOpacity>
            </View>
          ) : (
            subusers.map(renderSubuserCard)
          )}
        </ScrollView>
      </View>

      {/* Invite Modal - Enhanced UI */}
      <Modal 
        visible={inviteOpen} 
        animationType="slide" 
        transparent={true}
        onRequestClose={()=>setInviteOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeaderGradient}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={styles.modalIconContainer}>
                    <Ionicons name="person-add" size={24} color="#3B82F6" />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Invite New Employee</Text>
                    <Text style={styles.modalSubtitle}>Add a team member to collaborate</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={()=>setInviteOpen(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={28} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView 
              style={styles.modalBody} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBodyContent}
            >
              {/* Personal Information Section */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-outline" size={20} color="#3B82F6" />
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>First Name <Text style={styles.required}>*</Text></Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Enter first name"
                      placeholderTextColor="#CBD5E1"
                      value={inviteForm.firstName} 
                      onChangeText={(t)=>setInviteForm({...inviteForm, firstName:t})}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Enter last name"
                      placeholderTextColor="#CBD5E1"
                      value={inviteForm.lastName} 
                      onChangeText={(t)=>setInviteForm({...inviteForm, lastName:t})} 
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Work Email <Text style={styles.required}>*</Text></Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="employee@company.com"
                      placeholderTextColor="#CBD5E1"
                      keyboardType="email-address" 
                      autoCapitalize="none" 
                      value={inviteForm.email} 
                      onChangeText={(t)=>setInviteForm({...inviteForm, email:t})} 
                    />
                  </View>
                </View>
              </View>

              {/* Permissions Section */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" />
                  <Text style={styles.sectionTitle}>Access Permissions</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Select the permissions you want to grant to this employee
                </Text>
                
                <View style={styles.permGrid}>
                  {ALL_PERMISSIONS.map(p => {
                    const isSelected = inviteForm.permissions.includes(p.key);
                    return (
                      <TouchableOpacity 
                        key={p.key} 
                        style={[
                          styles.permCard,
                          isSelected && styles.permCardActive
                        ]} 
                        onPress={()=>togglePermission(inviteForm, p.key)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.permCheckbox,
                          isSelected && styles.permCheckboxActive
                        ]}>
                          {isSelected && (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          )}
                        </View>
                        <Text style={[
                          styles.permLabel,
                          isSelected && styles.permLabelActive
                        ]}>
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={()=>setInviteOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.inviteButton} 
                onPress={handleInvite}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.inviteButtonGradient}
                >
                  <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.inviteButtonText}>Send Invitation</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Permissions Modal */}
      <Modal visible={editOpen} animationType="slide" onRequestClose={()=>setEditOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>Edit Permissions</Text><TouchableOpacity onPress={()=>setEditOpen(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
          <ScrollView style={styles.modalBody}>
            {selected && (
              <>
                <Text style={styles.infoText}>Employee ID: {selected.id}</Text>
                <Text style={styles.sectionLabel}>Permissions</Text>
                <View style={styles.permGrid}>
                  {ALL_PERMISSIONS.map(p => (
                    <TouchableOpacity key={p.key} style={[styles.permToggle, selected.permissions.includes(p.key) && styles.permToggleOn]} onPress={()=>togglePermission(selected, p.key)}>
                      <Ionicons name={selected.permissions.includes(p.key)?'checkbox':'square-outline'} size={18} color={selected.permissions.includes(p.key)?colors.primary:colors.textSecondary} />
                      <Text style={[styles.permToggleText, selected.permissions.includes(p.key) && { color: colors.primary }]}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={()=>setEditOpen(false)}><Text style={styles.cancelBtnText}>Close</Text></TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdateRole}><Text style={styles.primaryBtnText}>Save</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
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
  headerBar: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerBarMobile: {
    padding: spacing.md,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  title: { ...typography.h3, color: colors.text, fontWeight: '700' },
  titleMobile: {
    fontSize: 20,
  },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerActionsMobile: {
    flexWrap: 'wrap',
    width: '100%',
  },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  primaryBtnText: { ...typography.button, color: colors.white, fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body1, color: colors.textSecondary, marginTop: spacing.sm },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h5, color: colors.text, fontWeight: '700', marginTop: spacing.md },
  emptySub: { ...typography.body1, color: colors.textSecondary, marginVertical: spacing.sm },
  card: { backgroundColor: colors.cardBackground, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  name: { ...typography.h5, color: colors.text, fontWeight: '700' },
  email: { ...typography.body2, color: colors.textSecondary },
  badges: { flexDirection: 'row', gap: spacing.xs },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  badgeText: { ...typography.caption, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  rowText: { ...typography.body2, color: colors.textSecondary },
  permList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  permTag: { backgroundColor: colors.primary + '12', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 12 },
  permText: { ...typography.caption, color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  editBtn: { backgroundColor: colors.info },
  removeBtn: { backgroundColor: colors.error },
  actionText: { ...typography.button, color: colors.white, fontWeight: '600' },
  // Modal Styles - Enhanced
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  modalHeaderGradient: {
    paddingBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: spacing.xl,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: spacing.sm,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: '#1E293B',
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
    }),
  },
  permGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  permCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: '45%',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  permCardActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderColor: '#3B82F6',
  },
  permCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  permCheckboxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  permLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  permLabelActive: {
    color: '#1E293B',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  inviteButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  inviteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  inviteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Old modal styles for Edit Permissions modal (keeping for compatibility)
  modal: { flex: 1, backgroundColor: colors.background },
  sectionLabel: { ...typography.h6, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  permToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8 },
  permToggleOn: { backgroundColor: colors.primary + '10', borderColor: colors.primary },
  permToggleText: { ...typography.caption, color: colors.text },
  infoText: { ...typography.body2, color: colors.textSecondary, marginBottom: spacing.md },
});

export default EmployerEmployeesScreen;


