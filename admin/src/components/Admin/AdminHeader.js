import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminHeader = ({ title, user, onLogout, onMenuToggle }) => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const width = dimensions?.width || Dimensions.get('window').width;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
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

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: isMobile ? 12 : 15,
    paddingHorizontal: isMobile ? 12 : isTablet ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    ...(Platform.OS === 'web' && {
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  menuButton: {
    marginRight: isMobile ? 10 : 15,
    padding: 4,
  },
  title: {
    fontSize: isMobile ? 16 : isTablet ? 18 : 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
    marginRight: isTablet ? 12 : 15,
    maxWidth: isTablet ? 150 : 200,
    ...(Platform.OS === 'web' && {
      overflow: 'hidden',
    }),
  },
  userName: {
    marginLeft: 8,
    fontSize: isTablet ? 13 : 14,
    color: '#666',
    fontWeight: '500',
    ...(Platform.OS === 'web' && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: isMobile ? 6 : 8,
    paddingHorizontal: isMobile ? 10 : 15,
    borderRadius: 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#C0392B',
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

export default AdminHeader;

