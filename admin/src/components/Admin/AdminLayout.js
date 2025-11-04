import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const { width } = Dimensions.get('window');

const AdminLayout = ({ children, title, activeScreen, onNavigate, user, onLogout }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <View style={styles.container}>
      {sidebarVisible && (
        <AdminSidebar
          activeScreen={activeScreen}
          onNavigate={onNavigate}
        />
      )}
      <View style={styles.mainContent}>
        <View style={styles.headerContainer}>
          <AdminHeader
            title={title}
            user={user}
            onLogout={onLogout}
            onMenuToggle={toggleSidebar}
          />
        </View>
        <ScrollView 
          style={styles.contentContainer} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F6FA',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflow: 'hidden',
    }),
  },
  mainContent: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      marginLeft: 240,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }),
  },
  headerContainer: {
    ...(Platform.OS === 'web' && {
      flexShrink: 0,
    }),
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    ...(Platform.OS === 'web' && {
      flex: 1,
      overflowY: 'scroll',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      maxHeight: 'calc(100vh - 70px)',
    }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    ...(Platform.OS === 'web' && {
      paddingBottom: 40,
    }),
  },
});

export default AdminLayout;

