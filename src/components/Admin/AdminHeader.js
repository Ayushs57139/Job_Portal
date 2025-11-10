import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

const AdminHeader = ({ title, user, onLogout, onMenuToggle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onMenuToggle} style={styles.menuButton}>
          <Ionicons name="menu" size={isMobile ? 22 : 24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
      </View>
      <View style={styles.rightSection}>
        {!isMobile && (
          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={isTablet ? 22 : 24} color="#666" />
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || user?.firstName || 'Super Admin'}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={isMobile ? 16 : 18} color="#FFF" />
          {!isMobile && <Text style={styles.logoutText}>Logout</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: isMobile ? 12 : isTablet ? 14 : 15,
    paddingHorizontal: isMobile ? 12 : isTablet ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: isMobile ? 56 : 60,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: isMobile ? 8 : 12,
  },
  menuButton: {
    marginRight: isMobile ? 12 : 15,
    padding: 4,
  },
  title: {
    fontSize: isMobile ? 16 : isTablet ? 18 : 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: isTablet ? 12 : 15,
    maxWidth: isTablet ? 150 : 200,
  },
  userName: {
    marginLeft: isTablet ? 6 : 8,
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#666',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: isMobile ? 6 : 8,
    paddingHorizontal: isMobile ? 10 : isTablet ? 12 : 15,
    borderRadius: 6,
    minWidth: isMobile ? 40 : 'auto',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    marginLeft: isMobile ? 0 : 6,
    fontWeight: '600',
  },
});

export default AdminHeader;

