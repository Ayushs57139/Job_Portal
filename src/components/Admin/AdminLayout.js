import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const { width } = Dimensions.get('window');
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

const AdminLayout = ({ children, title, activeScreen, onNavigate, user, onLogout }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    // On desktop/tablet, show sidebar by default. On mobile, keep it hidden (modal only)
    if (!isMobile) {
      setSidebarVisible(true);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  const handleNavigate = (screen) => {
    onNavigate(screen);
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const renderSidebar = () => {
    if (isMobile) {
      // On mobile, sidebar is ALWAYS a modal, never in normal layout
      return (
        <Modal
          visible={sidebarVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeSidebar}
        >
          <TouchableWithoutFeedback onPress={closeSidebar}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.mobileSidebarContainer}>
                  <AdminSidebar 
                    activeScreen={activeScreen} 
                    onNavigate={handleNavigate}
                    onClose={closeSidebar}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      );
    } else {
      // On tablet/desktop, sidebar is in normal layout
      return sidebarVisible ? (
        <View style={styles.desktopSidebar}>
          <AdminSidebar 
            activeScreen={activeScreen} 
            onNavigate={handleNavigate}
          />
        </View>
      ) : null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Desktop/Tablet Sidebar - in normal layout */}
      {!isMobile && renderSidebar()}
      
      {/* Main Content - always takes full width on mobile */}
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
      
      {/* Mobile Sidebar - only as modal, rendered separately */}
      {isMobile && renderSidebar()}
    </View>
  );
};

const sidebarWidth = isTablet ? 220 : 240;
const mobileSidebarWidth = Math.min(width * 0.8, 300);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: isMobile ? 'column' : 'row',
    backgroundColor: '#F5F6FA',
    width: '100%',
  },
  desktopSidebar: {
    width: sidebarWidth,
    flexShrink: 0,
  },
  mainContent: {
    flex: 1,
    width: isMobile ? '100%' : undefined,
    minWidth: 0, // Allows flex to shrink properly
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    padding: isMobile ? 8 : isTablet ? 12 : 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  mobileSidebarContainer: {
    width: mobileSidebarWidth,
    height: '100%',
    backgroundColor: '#2C3E50',
  },
});

export default AdminLayout;

