import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminSidebar = ({ activeScreen, onNavigate, onClose }) => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const width = dimensions?.width || Dimensions.get('window').width;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

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
        { id: 'departments', label: 'Departments', screen: 'AdminDepartments' },
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
          onPress={() => {
            if (item.expandable) {
              toggleMenu(item.id);
            } else {
              onNavigate(item.screen);
            }
          }}
        >
          <Ionicons 
            name={item.icon} 
            size={isSubItem ? (isMobile ? 15 : 16) : (isMobile ? 18 : isTablet ? 19 : 20)} 
            color={isActive ? '#4A90E2' : '#B0B0B0'} 
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
              size={16} 
              color="#B0B0B0" 
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
        style={styles.menuContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {menuItems.map(item => renderMenuItem(item, false, styles))}
      </ScrollView>
    </View>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    width: isMobile ? 280 : isTablet ? 220 : 240,
    backgroundColor: '#2C3E50',
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
    }),
  },
  header: {
    padding: isMobile ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  brandTitle: {
    fontSize: isMobile ? 18 : isTablet ? 19 : 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  brandSubtitle: {
    fontSize: isMobile ? 11 : 12,
    color: '#B0B0B0',
    marginTop: 4,
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
    paddingVertical: isMobile ? 14 : 12,
    paddingHorizontal: isMobile ? 16 : 20,
    marginHorizontal: isMobile ? 4 : 8,
    borderRadius: 6,
  },
  activeMenuItem: {
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
  },
  subMenuItem: {
    paddingLeft: 50,
    paddingVertical: 10,
  },
  menuLabel: {
    fontSize: isMobile ? 13 : isTablet ? 13.5 : 14,
    color: '#E0E0E0',
    marginLeft: isMobile ? 10 : 12,
    flex: 1,
  },
  activeMenuLabel: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  subMenuLabel: {
    fontSize: 13,
  },
  expandIcon: {
    marginLeft: 'auto',
  },
  subMenuContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});

export default AdminSidebar;

