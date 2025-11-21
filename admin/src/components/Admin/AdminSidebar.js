import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../utils/responsive';

// Module-level variable to persist scroll position across re-renders
let savedScrollPosition = 0;

const AdminSidebar = ({ activeScreen, onNavigate, onClose }) => {
  const responsive = useResponsive();
  const [expandedMenus, setExpandedMenus] = useState({});
  const scrollViewRef = useRef(null);
  const isScrollingRef = useRef(false);

  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;

  // Restore scroll position after navigation or component mount
  useEffect(() => {
    const restoreScroll = () => {
      if (!scrollViewRef.current || isScrollingRef.current) return;
      
      if (Platform.OS === 'web') {
        // For web, find the actual scrollable element
        const findScrollElement = (ref) => {
          if (!ref) return null;
          const node = ref.getNode ? ref.getNode() : ref;
          if (!node) return null;
          
          // Try to find the actual scrollable div
          if (node._component) {
            const component = node._component;
            if (component && component.scrollTop !== undefined) {
              return component;
            }
          }
          
          // Try direct access
          if (node.scrollTop !== undefined || node.scrollY !== undefined) {
            return node;
          }
          
          // Try to find child scrollable element
          if (node.querySelector) {
            const scrollable = node.querySelector('[data-scrollable="true"]') || node.querySelector('div[style*="overflow"]');
            if (scrollable) return scrollable;
          }
          
          return node;
        };
        
        const scrollElement = findScrollElement(scrollViewRef.current);
        if (scrollElement && savedScrollPosition > 0) {
          if (typeof scrollElement.scrollTo === 'function') {
            scrollElement.scrollTo(0, savedScrollPosition);
          } else if (scrollElement.scrollTop !== undefined) {
            scrollElement.scrollTop = savedScrollPosition;
          } else if (scrollElement.scrollY !== undefined) {
            scrollElement.scrollY = savedScrollPosition;
          }
        }
      } else {
        // For native platforms
        if (savedScrollPosition > 0) {
          scrollViewRef.current.scrollTo({
            y: savedScrollPosition,
            animated: false,
          });
        }
      }
    };

    // Restore scroll position with multiple attempts
    if (savedScrollPosition > 0) {
      // Immediate attempt
      restoreScroll();
      
      // After a microtask
      setTimeout(restoreScroll, 0);
      
      // After render
      requestAnimationFrame(() => {
        restoreScroll();
        // One more attempt after animation frame
        setTimeout(restoreScroll, 10);
      });
    }
  }, [activeScreen]);


  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'speedometer-outline', screen: 'AdminDashboard' },
    { id: 'users', label: 'Users', icon: 'people-outline', screen: 'AdminUsers' },
    { id: 'roleManagement', label: 'Role Management', icon: 'shield-checkmark-outline', screen: 'AdminRoleManagement' },
    { id: 'jobs', label: 'Jobs', icon: 'briefcase-outline', screen: 'AdminJobs' },
    { id: 'postJob', label: 'Post Job', icon: 'add-circle-outline', screen: 'AdminPostJob' },
    { id: 'applications', label: 'Applications', icon: 'document-text-outline', screen: 'AdminApplications' },
    { id: 'teamLimits', label: 'Team Limits', icon: 'people-circle-outline', screen: 'AdminTeamLimits' },
    { id: 'blogs', label: 'Blogs', icon: 'newspaper-outline', screen: 'AdminBlogs' },
    { id: 'verification', label: 'Verification', icon: 'checkmark-done-outline', screen: 'AdminVerification' },
    { id: 'kyc', label: 'KYC Management', icon: 'card-outline', screen: 'AdminKYC' },
    { id: 'salesEnquiry', label: 'Sales Enquiry', icon: 'mail-outline', screen: 'AdminSalesEnquiry' },
    { id: 'freejobwalaChat', label: 'Freejobwala Chat', icon: 'chatbubbles-outline', screen: 'AdminFreejobwalaChat' },
    { id: 'homepage', label: 'Homepage', icon: 'home-outline', screen: 'AdminHomepage' },
    { id: 'analytics', label: 'Analytics', icon: 'bar-chart-outline', screen: 'AdminAnalytics' },
    { id: 'resumeSearch', label: 'Resume Search', icon: 'search-outline', screen: 'AdminResumeSearch' },
    { id: 'resumeManagement', label: 'Resume Management', icon: 'document-outline', screen: 'AdminResumeManagement' },
    { id: 'candidateSearch', label: 'Candidate Search (Fastdex)', icon: 'people-outline', screen: 'AdminCandidateSearch' },
    { id: 'jobAlerts', label: 'Job Alerts', icon: 'notifications-outline', screen: 'AdminJobAlerts' },
    { id: 'packageManagement', label: 'Package Management', icon: 'cube-outline', screen: 'AdminPackageManagement' },
    { id: 'razorpayIntegration', label: 'Razorpay Integration', icon: 'card-outline', screen: 'AdminRazorpayIntegration' },
    { id: 'advertisementManagement', label: 'Advertisement Management', icon: 'megaphone-outline', screen: 'AdminAdvertisementManagement' },
    { id: 'liveChatSupport', label: 'Live Chat Support', icon: 'chatbox-ellipses-outline', screen: 'AdminLiveChatSupport' },
    { id: 'settings', label: 'Settings', icon: 'settings-outline', screen: 'AdminSettings' },
    { id: 'logoManagement', label: 'Logo Management', icon: 'image-outline', screen: 'AdminLogoManagement' },
    { id: 'emailTemplates', label: 'Email Templates', icon: 'mail-open-outline', screen: 'AdminEmailTemplates' },
    { id: 'smtpSettings', label: 'SMTP Settings', icon: 'server-outline', screen: 'AdminSMTPSettings' },
    { id: 'emailLogs', label: 'Email Logs', icon: 'list-outline', screen: 'AdminEmailLogs' },
    { id: 'socialUpdates', label: 'Social Updates', icon: 'share-social-outline', screen: 'AdminSocialUpdates' },
    {
      id: 'masterData',
      label: 'Master Data Management',
      icon: 'layers-outline',
      expandable: true,
      subItems: [
        { id: 'jobTitles', label: 'Job Titles', screen: 'AdminJobTitles' },
        { id: 'keySkills', label: 'Key Skills', screen: 'AdminKeySkills' },
        { id: 'industries', label: 'Industries', screen: 'AdminIndustries' },
        { id: 'subIndustries', label: 'Sub-Industries', screen: 'AdminSubIndustries' },
        { id: 'departments', label: 'Departments', screen: 'AdminDepartments' },
        { id: 'subDepartments', label: 'Sub-Departments', screen: 'AdminSubDepartments' },
        { id: 'courses', label: 'Courses', screen: 'AdminCourses' },
        { id: 'specializations', label: 'Specializations', screen: 'AdminSpecializations' },
        { id: 'educationFields', label: 'Education Fields', screen: 'AdminEducationFields' },
        { id: 'locations', label: 'Locations', screen: 'AdminLocations' },
      ]
    },
  ];

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleMenuItemPress = (item) => {
    // Save scroll position immediately before any action
    if (Platform.OS === 'web' && scrollViewRef.current) {
      try {
        const scrollElement = scrollViewRef.current?.getNode ? scrollViewRef.current.getNode() : scrollViewRef.current;
        if (scrollElement) {
          // Try multiple ways to get scroll position
          if (scrollElement.scrollTop !== undefined) {
            savedScrollPosition = scrollElement.scrollTop;
          } else if (scrollElement.scrollY !== undefined) {
            savedScrollPosition = scrollElement.scrollY;
          } else if (scrollElement._component?.scrollTop !== undefined) {
            savedScrollPosition = scrollElement._component.scrollTop;
          } else if (scrollElement.querySelector) {
            const scrollableDiv = scrollElement.querySelector('div[style*="overflow"]');
            if (scrollableDiv && scrollableDiv.scrollTop !== undefined) {
              savedScrollPosition = scrollableDiv.scrollTop;
            }
          }
        }
      } catch (e) {
        // Fallback to saved position from onScroll
      }
    }
    // For native, savedScrollPosition is already updated via onScroll
    
    if (item.expandable) {
      toggleMenu(item.id);
    } else {
      onNavigate(item.screen);
    }
  };

  const renderMenuItem = (item, isSubItem = false, styles) => {
    const isActive = activeScreen === item.screen;
    const isExpanded = expandedMenus[item.id];

    return (
      <View key={item.id}>
        <TouchableOpacity
          style={[
            styles.menuItem,
            isActive && styles.activeMenuItem,
            isSubItem && styles.subMenuItem
          ]}
          onPress={() => handleMenuItemPress(item)}
        >
          <Ionicons 
            name={item.icon} 
            size={isSubItem ? (isMobile ? 16 : 17) : (isMobile ? 20 : isTablet ? 21 : 22)} 
            color={isActive ? '#60A5FA' : 'rgba(255, 255, 255, 0.6)'} 
          />
          <Text style={[
            styles.menuLabel,
            isActive && styles.activeMenuLabel,
            isSubItem && styles.subMenuLabel
          ]}>
            {item.label}
          </Text>
          {item.expandable && (
            <Ionicons 
              name={isExpanded ? 'chevron-down' : 'chevron-forward'} 
              size={18} 
              color="rgba(255, 255, 255, 0.6)" 
              style={styles.expandIcon}
            />
          )}
        </TouchableOpacity>
        {item.expandable && isExpanded && item.subItems && (
          <View style={styles.subMenuContainer}>
            {item.subItems.map(subItem => renderMenuItem(subItem, true, styles))}
          </View>
        )}
      </View>
    );
  };

  const styles = getStyles(isMobile, isTablet);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.brandTitle}>Free job wala</Text>
          <Text style={styles.brandSubtitle}>Admin Panel</Text>
        </View>
        {isMobile && onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#E0E0E0" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.menuContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y || 0;
          savedScrollPosition = scrollY;
          isScrollingRef.current = true;
          // Reset scrolling flag after a delay
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 150);
        }}
        onScrollBeginDrag={() => {
          isScrollingRef.current = true;
        }}
        onScrollEndDrag={() => {
          isScrollingRef.current = false;
        }}
        scrollEventThrottle={16}
      >
        {menuItems.map(item => renderMenuItem(item, false, styles))}
      </ScrollView>
    </View>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    width: isMobile ? 280 : isTablet ? 220 : 240,
    backgroundColor: '#1A202C',
    flexShrink: 0,
    flexDirection: 'column',
    alignSelf: 'stretch',
    height: '100%',
    ...(Platform.OS === 'web' && {
      position: isMobile ? 'relative' : 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 12px rgba(0, 0, 0, 0.15)',
    }),
  },
  header: {
    padding: isMobile ? 18 : 22,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  headerContent: {
    flex: 1,
  },
  brandTitle: {
    fontSize: isMobile ? 20 : isTablet ? 21 : 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: isMobile ? 12 : 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    marginLeft: 10,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 10,
    ...(Platform.OS === 'web' && {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      minHeight: 0,
      maxHeight: 'calc(100vh - 90px)',
    }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isMobile ? 14 : 13,
    paddingHorizontal: isMobile ? 16 : 18,
    marginHorizontal: isMobile ? 6 : 10,
    marginVertical: 2,
    borderRadius: 10,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      },
    }),
  },
  activeMenuItem: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
    ...(Platform.OS === 'web' && {
      boxShadow: 'inset 0 0 20px rgba(74, 144, 226, 0.1)',
    }),
  },
  subMenuItem: {
    paddingLeft: 52,
    paddingVertical: 10,
    marginLeft: 10,
  },
  menuLabel: {
    fontSize: isMobile ? 13.5 : isTablet ? 14 : 14.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: isMobile ? 12 : 14,
    flex: 1,
    fontWeight: '500',
  },
  activeMenuLabel: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  subMenuLabel: {
    fontSize: 13,
  },
  expandIcon: {
    marginLeft: 'auto',
  },
  subMenuContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 8,
    paddingVertical: 4,
  },
});

export default AdminSidebar;

