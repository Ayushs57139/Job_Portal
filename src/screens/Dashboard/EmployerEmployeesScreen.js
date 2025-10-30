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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import api from '../../config/api';

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
      <View style={styles.sidebar}><EmployerSidebar permanent navigation={navigation} role="company" activeKey="employees" /></View>
      <View style={styles.content}>
        <View style={styles.headerBar}>
          <Text style={styles.title}>Employee Management</Text>
          <View style={styles.headerActions}>
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

      {/* Invite Modal */}
      <Modal visible={inviteOpen} animationType="slide" onRequestClose={()=>setInviteOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>Add Employee</Text><TouchableOpacity onPress={()=>setInviteOpen(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
          <ScrollView style={styles.modalBody}>
            <TextInput style={styles.input} placeholder="First Name" value={inviteForm.firstName} onChangeText={(t)=>setInviteForm({...inviteForm, firstName:t})} />
            <TextInput style={styles.input} placeholder="Last Name" value={inviteForm.lastName} onChangeText={(t)=>setInviteForm({...inviteForm, lastName:t})} />
            <TextInput style={styles.input} placeholder="Work Email" keyboardType="email-address" autoCapitalize="none" value={inviteForm.email} onChangeText={(t)=>setInviteForm({...inviteForm, email:t})} />
            <Text style={styles.sectionLabel}>Permissions</Text>
            <View style={styles.permGrid}>
              {ALL_PERMISSIONS.map(p => (
                <TouchableOpacity key={p.key} style={[styles.permToggle, inviteForm.permissions.includes(p.key) && styles.permToggleOn]} onPress={()=>togglePermission(inviteForm, p.key)}>
                  <Ionicons name={inviteForm.permissions.includes(p.key)?'checkbox':'square-outline'} size={18} color={inviteForm.permissions.includes(p.key)?colors.primary:colors.textSecondary} />
                  <Text style={[styles.permToggleText, inviteForm.permissions.includes(p.key) && { color: colors.primary }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={()=>setInviteOpen(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleInvite}><Text style={styles.primaryBtnText}>Invite</Text></TouchableOpacity>
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
  content: { flex: 1 },
  headerBar: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h3, color: colors.text, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
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
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { ...typography.h4, color: colors.text, fontWeight: '700' },
  modalBody: { flex: 1, padding: spacing.lg },
  input: { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, ...typography.body1, color: colors.text, marginBottom: spacing.md },
  sectionLabel: { ...typography.h6, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  permGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  permToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8 },
  permToggleOn: { backgroundColor: colors.primary + '10', borderColor: colors.primary },
  permToggleText: { ...typography.caption, color: colors.text },
  modalFooter: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  cancelBtn: { flex: 1, backgroundColor: colors.textSecondary + '20', borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md },
  cancelBtnText: { ...typography.button, color: colors.textSecondary, fontWeight: '600' },
});

export default EmployerEmployeesScreen;


