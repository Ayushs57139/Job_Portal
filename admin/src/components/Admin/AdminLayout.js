import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Platform, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children, title, activeScreen, onNavigate, user, onLogout }) => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const width = dimensions?.width || Dimensions.get('window').width;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const sidebarWidth = isTablet ? 220 : 240;
  const sidebarWidthMobile = 280;

  useEffect(() => {
    // On desktop/tablet, show sidebar by default. On mobile, keep it hidden (modal only)
    if (!isMobile) {
      setSidebarVisible(true);
    } else {
      setSidebarVisible(false);
    }
  }, [isMobile]);

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
        <View style={[styles.desktopSidebar, isTablet && styles.tabletSidebar]}>
          <AdminSidebar 
            activeScreen={activeScreen} 
            onNavigate={handleNavigate}
          />
        </View>
      ) : null;
    }
  };

  const styles = getStyles(isMobile, isTablet, sidebarWidth, sidebarWidthMobile);

  return (
    <View style={styles.container}>
      {/* Desktop/Tablet Sidebar - in normal layout */}
      {!isMobile && renderSidebar()}
      
      {/* Main Content - always takes full width on mobile */}
      <View style={[
        styles.mainContent,
        !isMobile && sidebarVisible && styles.mainContentWithSidebar,
        isTablet && sidebarVisible && styles.mainContentTablet
      ]}>
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
      
      {/* Mobile Sidebar - only as modal, rendered separately */}
      {isMobile && renderSidebar()}
    </View>
  );
};

const getStyles = (isMobile, isTablet, sidebarWidth, sidebarWidthMobile) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#F7FAFC',
    }),
  },
  desktopSidebar: {
    width: sidebarWidth,
    ...(Platform.OS === 'web' && {
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      height: '100vh',
      zIndex: 1000,
    }),
  },
  tabletSidebar: {
    width: 220,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'margin-left 0.3s ease',
    }),
  },
  mainContentWithSidebar: {
    ...(Platform.OS === 'web' && {
      marginLeft: sidebarWidth,
      width: `calc(100% - ${sidebarWidth}px)`,
    }),
  },
  mainContentTablet: {
    ...(Platform.OS === 'web' && {
      marginLeft: 220,
      width: 'calc(100% - 220px)',
    }),
  },
  headerContainer: {
    ...(Platform.OS === 'web' && {
      flexShrink: 0,
    }),
  },
  contentContainer: {
    flex: 1,
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    ...(Platform.OS === 'web' && {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      maxHeight: 'calc(100vh - 70px)',
    }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isMobile ? 16 : 20,
    ...(Platform.OS === 'web' && {
      paddingBottom: isMobile ? 20 : 40,
    }),
  },
  // Mobile Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    ...(Platform.OS === 'web' && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    }),
  },
  mobileSidebarContainer: {
    width: sidebarWidthMobile,
    height: '100%',
    backgroundColor: '#2C3E50',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.3)',
    }),
  },
});

export default AdminLayout;

