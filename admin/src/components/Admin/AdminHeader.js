import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../utils/responsive';

// Define getStyles before the component to avoid hoisting issues
const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: isMobile ? 14 : 16,
    paddingHorizontal: isMobile ? 16 : isTablet ? 20 : 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    elevation: 3,
    ...(Platform.OS === 'web' ? {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
      backdropFilter: 'blur(10px)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  menuButton: {
    marginRight: isMobile ? 12 : 16,
    padding: 8,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      transition: 'background-color 0.2s',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  title: {
    fontSize: isMobile ? 18 : isTablet ? 20 : 22,
    fontWeight: '700',
    color: '#1A202C',
    flex: 1,
    letterSpacing: -0.3,
    ...(Platform.OS === 'web' && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: isTablet ? 14 : 18,
    maxWidth: isTablet ? 150 : 200,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 144, 226, 0.08)',
    ...(Platform.OS === 'web' && {
      overflow: 'hidden',
      transition: 'background-color 0.2s',
      cursor: 'default',
    }),
  },
  userName: {
    marginLeft: 8,
    fontSize: isTablet ? 13 : 14,
    color: '#2D3748',
    fontWeight: '600',
    ...(Platform.OS === 'web' && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: isMobile ? 8 : 10,
    paddingHorizontal: isMobile ? 12 : 16,
    borderRadius: 10,
    gap: 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
      ':hover': {
        backgroundColor: '#DC2626',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)',
      },
      ':active': {
        transform: 'translateY(0)',
      },
    }),
  },
  logoutText: {
    color: '#FFF',
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    marginLeft: isMobile ? 4 : 6,
    fontWeight: '600',
  },
});

const AdminHeader = ({ title, user, onLogout, onMenuToggle }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const styles = getStyles(isMobile, isTablet);

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
            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
              {user?.name || 'Super Admin'}
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

export default AdminHeader;

