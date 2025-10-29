import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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
        <AdminHeader 
          title={title}
          user={user}
          onLogout={onLogout}
          onMenuToggle={toggleSidebar}
        />
        <View style={styles.contentContainer}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F6FA',
  },
  mainContent: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
});

export default AdminLayout;

