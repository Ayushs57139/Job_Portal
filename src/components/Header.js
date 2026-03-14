import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, shadows, borderRadius } from '../styles/theme';
import api from '../config/api';
import { useResponsive } from '../utils/responsive';

// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';

const Header = ({ showBack = false, title }) => {
  const navigation = useNavigation();
  const responsive = useResponsive();
  const [user, setUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Enhanced device detection
  const { width } = responsive;
  const isXsPhone = width <= 320;
  const isSmallPhone = width > 320 && width <= 375;
  const isPhone = width > 375 && width <= 414;
  const isLargePhone = width > 414 && width <= 480;
  const isMobile = width <= 480;
  const isSmallTablet = width > 480 && width <= 600;
  const isTablet = width > 600 && width <= 768;
  const isLargeTablet = width > 768 && width <= 834;
  const isTabletDevice = width > 480 && width <= 834;
  const isSmallLaptop = width > 834 && width <= 1024;
  const isLaptop = width > 1024 && width <= 1200;
  const isDesktop = width > 1200 && width <= 1440;
  const isLargeDesktop = width > 1440;
  const isDesktopDevice = width > 834;
  const showMobileMenu = width <= 768;
  const showCompactNav = width > 768 && width <= 1024;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUserFromStorage();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setMobileMenuOpen(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleDropdown = (menuName) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
  };

  const navigateTo = (screen, params = null) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    // Block employers/admin from public site; route them to their dashboards
    if (user && user.userType && user.userType !== 'jobseeker') {
      const type = user.userType;
      if (type === 'admin' || type === 'superadmin') {
        navigation.navigate('AdminDashboard');
        return;
      }
      if (type === 'company') {
        navigation.navigate('CompanyDashboard');
        return;
      }
      if (type === 'consultancy') {
        navigation.navigate('ConsultancyDashboard');
        return;
      }
    }
    if (params) navigation.navigate(screen, params); else navigation.navigate(screen);
  };

  // Navigation menu configuration
  const menuItems = [
    {
      label: 'Jobs',
      screen: 'Jobs',
      hasDropdown: true,
      items: [
        { label: 'All Jobs', screen: 'Jobs', icon: 'briefcase', params: null },
        { label: 'Work From Home Jobs', screen: 'Jobs', icon: 'home-outline', params: { filterType: 'workMode', filterValue: 'wfh', filterLabel: 'Work From Home Jobs' } },
        { label: 'Part Time Jobs', screen: 'Jobs', icon: 'time-outline', params: { filterType: 'workType', filterValue: 'parttime', filterLabel: 'Part Time Jobs' } },
        { label: 'Freshers Jobs', screen: 'Jobs', icon: 'school-outline', params: { filterType: 'experience', filterValue: 'fresher', filterLabel: 'Freshers Jobs' } },
        { label: 'Jobs for Women', screen: 'Jobs', icon: 'female-outline', params: { filterType: 'gender', filterValue: 'female', filterLabel: 'Jobs for Women' } },
        { label: 'Full Time Jobs', screen: 'Jobs', icon: 'briefcase-outline', params: { filterType: 'workType', filterValue: 'fulltime', filterLabel: 'Full Time Jobs' } },
        { label: 'Night Shift Jobs', screen: 'Jobs', icon: 'moon-outline', params: { filterType: 'workShift', filterValue: 'night', filterLabel: 'Night Shift Jobs' } },
        { label: 'Jobs By City', screen: 'Jobs', icon: 'location-outline', params: { filterType: 'location', filterValue: 'city', filterLabel: 'Jobs By City' } },
        { label: 'Jobs By Department', screen: 'Jobs', icon: 'business-outline', params: { filterType: 'department', filterValue: 'all', filterLabel: 'Jobs By Department' } },
        { label: 'Jobs By Company', screen: 'Companies', icon: 'albums-outline', params: null },
        { label: 'Jobs By Qualification', screen: 'Jobs', icon: 'ribbon-outline', params: { filterType: 'qualification', filterValue: 'all', filterLabel: 'Jobs By Qualification' } },
      ],
    },
    { label: 'Companies', screen: 'Companies', hasDropdown: false },
    {
      label: 'Services',
      screen: 'Services',
      hasDropdown: true,
      items: [
        { label: 'Job Events', screen: 'JobEvents', icon: 'calendar-outline' },
        { label: 'Resume Tools', screen: 'ResumeBuilder', icon: 'document-text-outline' },
        { label: 'Packages', screen: 'Packages', icon: 'cube-outline' },
      ],
    },
    { label: 'Blogs', screen: 'Blogs', hasDropdown: false },
    { label: 'Social Updates', screen: 'SocialUpdates', hasDropdown: false },
  ];

  // Get responsive sizes
  const getLogoSize = () => {
    if (isXsPhone) return 16;
    if (isSmallPhone) return 18;
    if (isMobile) return 20;
    if (isSmallTablet) return 22;
    if (isTablet) return 24;
    if (isLargeTablet) return 26;
    if (isSmallLaptop) return 28;
    return 30;
  };

  const getIconSize = () => {
    if (isXsPhone) return 18;
    if (isSmallPhone) return 20;
    if (isMobile) return 22;
    if (isTabletDevice) return 24;
    return 26;
  };

  const getMenuFontSize = () => {
    if (isSmallLaptop) return 13;
    if (isLaptop) return 14;
    return 15;
  };

  const dynamicStyles = getStyles(
    isXsPhone, isSmallPhone, isPhone, isLargePhone, isMobile,
    isSmallTablet, isTablet, isLargeTablet, isTabletDevice,
    isSmallLaptop, isLaptop, isDesktop, isLargeDesktop, isDesktopDevice,
    showMobileMenu, showCompactNav, width
  );

  // Render navigation menu item
  const renderMenuItem = (item, index) => {
    const isActive = activeDropdown === item.label;
    
    return (
      <View 
        key={index} 
        style={[dynamicStyles.menuItemWrapper, isActive && dynamicStyles.menuItemWrapperActive]}
      >
        <TouchableOpacity
          style={dynamicStyles.menuItem}
          onPress={() => {
            if (item.hasDropdown) {
              toggleDropdown(item.label);
            } else {
              navigateTo(item.screen);
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={dynamicStyles.menuItemText}>{item.label}</Text>
          {item.hasDropdown && (
            <Ionicons
              name={isActive ? 'chevron-up' : 'chevron-down'}
              size={showCompactNav ? 12 : 14}
              color={colors.text}
              style={dynamicStyles.menuItemIcon}
            />
          )}
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {item.hasDropdown && isActive && (
          <View style={dynamicStyles.dropdown}>
            {item.items.map((dropdownItem, dropdownIndex) => (
              <TouchableOpacity
                key={dropdownIndex}
                style={[
                  dynamicStyles.dropdownItem,
                  dropdownIndex === item.items.length - 1 && dynamicStyles.dropdownItemLast
                ]}
                onPress={() => navigateTo(dropdownItem.screen, dropdownItem.params)}
                activeOpacity={0.7}
              >
                <Ionicons name={dropdownItem.icon} size={showCompactNav ? 14 : 16} color={colors.primary} />
                <Text style={dynamicStyles.dropdownItemText}>{dropdownItem.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* Backdrop for closing dropdown */}
      {activeDropdown && (
        <TouchableOpacity
          style={dynamicStyles.backdrop}
          activeOpacity={1}
          onPress={() => setActiveDropdown(null)}
        />
      )}
      
      <View style={dynamicStyles.headerWrapper}>
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerContent}>
            {/* Left Section - Logo or Back Button */}
            <View style={dynamicStyles.leftSectionContainer}>
              {showBack ? (
                <View style={dynamicStyles.leftSection}>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={dynamicStyles.backButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-back" size={getIconSize()} color={colors.primary} />
                  </TouchableOpacity>
                  {title && <Text style={dynamicStyles.titleText} numberOfLines={1}>{title}</Text>}
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => navigateTo('Home')}
                  style={dynamicStyles.logo}
                  activeOpacity={0.8}
                >
                  <Text style={[dynamicStyles.logoText, { fontSize: getLogoSize() }]}>
                    <Text style={dynamicStyles.logoFree}>Free</Text>
                    <Text style={dynamicStyles.logoJob}>job</Text>
                    <Text style={dynamicStyles.logoWala}>wala</Text>
                  </Text>
                </TouchableOpacity>
              )}

              {/* Navigation Menu - Desktop/Tablet (only show if not showing back button) */}
              {!showBack && !showMobileMenu && (
                <View style={dynamicStyles.navMenu}>
                  {menuItems.map((item, index) => renderMenuItem(item, index))}
                </View>
              )}
            </View>

          {/* Right Section */}
          <View style={dynamicStyles.headerActions}>
            {user ? (
              <View style={dynamicStyles.userMenu}>
                <TouchableOpacity 
                  style={dynamicStyles.userAvatarContainer}
                  onPress={() => {
                    if (user.userType === 'employer') {
                      if (user.employerType === 'company') {
                        navigation.navigate('CompanyDashboard');
                      } else if (user.employerType === 'consultancy') {
                        navigation.navigate('ConsultancyDashboard');
                      }
                    } else if (user.userType === 'admin' || user.userType === 'superadmin') {
                      navigation.navigate('AdminDashboard');
                    } else {
                      navigation.navigate('UserDashboard');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={dynamicStyles.userAvatar}>
                    <Text style={dynamicStyles.userInitial}>
                      {(user.firstName || user.name || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
                {!isMobile && (
                  <TouchableOpacity
                    onPress={() => {
                      if (user.userType === 'employer') {
                        if (user.employerType === 'company') {
                          navigation.navigate('CompanyDashboard');
                        } else if (user.employerType === 'consultancy') {
                          navigation.navigate('ConsultancyDashboard');
                        }
                      } else if (user.userType === 'admin' || user.userType === 'superadmin') {
                        navigation.navigate('AdminDashboard');
                      } else {
                        navigation.navigate('UserDashboard');
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={dynamicStyles.userName} numberOfLines={1}>
                      {user.firstName || user.name}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleLogout}
                  style={dynamicStyles.logoutButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="log-out-outline" size={isMobile ? 16 : 18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={dynamicStyles.authButtons}>
                {!isXsPhone && (
                  <TouchableOpacity
                    style={dynamicStyles.loginButton}
                    onPress={() => navigateTo('Login')}
                    activeOpacity={0.8}
                  >
                    <Text style={dynamicStyles.loginButtonText}>
                      {isMobile ? 'Login' : 'Candidate Login'}
                    </Text>
                  </TouchableOpacity>
                )}
                {!isMobile && (
                  <>
                    <TouchableOpacity
                      style={dynamicStyles.postJobButton}
                      onPress={() => navigateTo('PostJob')}
                      activeOpacity={0.8}
                    >
                      <Text style={dynamicStyles.postJobButtonText}>Post Job</Text>
                    </TouchableOpacity>
                    {!showCompactNav && (
                      <TouchableOpacity
                        style={dynamicStyles.employersButton}
                        onPress={() => navigateTo('EmployerOptions')}
                        activeOpacity={0.8}
                      >
                        <Text style={dynamicStyles.employersButtonText}>Employers Login</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Mobile Menu Button */}
            {showMobileMenu && (
              <TouchableOpacity
                style={dynamicStyles.mobileMenuButton}
                onPress={() => setMobileMenuOpen(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="menu" size={getIconSize()} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Mobile Menu Modal */}
      <Modal
        visible={mobileMenuOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMobileMenuOpen(false)}
      >
        <View style={dynamicStyles.mobileMenuOverlay}>
          <View style={dynamicStyles.mobileMenuContent}>
            <View style={dynamicStyles.mobileMenuHeader}>
              <Text style={dynamicStyles.mobileMenuTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setMobileMenuOpen(false)}
                style={dynamicStyles.mobileMenuClose}
              >
                <Ionicons name="close" size={getIconSize()} color={colors.text} />
              </TouchableOpacity>
            </View>

            {menuItems.map((item, index) => (
              <View key={index} style={dynamicStyles.mobileMenuItem}>
                <TouchableOpacity
                  style={dynamicStyles.mobileMenuItemButton}
                  onPress={() => {
                    if (!item.hasDropdown) {
                      navigateTo(item.screen);
                    } else {
                      toggleDropdown(item.label);
                    }
                  }}
                >
                  <Text style={dynamicStyles.mobileMenuItemText}>{item.label}</Text>
                  {item.hasDropdown && (
                    <Ionicons
                      name={activeDropdown === item.label ? 'chevron-up' : 'chevron-down'}
                      size={isMobile ? 16 : 18}
                      color={colors.text}
                    />
                  )}
                </TouchableOpacity>

                {item.hasDropdown && activeDropdown === item.label && (
                  <View style={dynamicStyles.mobileDropdown}>
                    {item.items.map((dropdownItem, dropdownIndex) => (
                      <TouchableOpacity
                        key={dropdownIndex}
                        style={dynamicStyles.mobileDropdownItem}
                        onPress={() => navigateTo(dropdownItem.screen, dropdownItem.params)}
                      >
                        <Ionicons name={dropdownItem.icon} size={isMobile ? 14 : 16} color={colors.primary} />
                        <Text style={dynamicStyles.mobileDropdownItemText}>{dropdownItem.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {!user && (
              <View style={dynamicStyles.mobileAuthButtons}>
                <TouchableOpacity
                  style={dynamicStyles.mobileLoginButton}
                  onPress={() => navigateTo('Login')}
                >
                  <Text style={dynamicStyles.mobileLoginButtonText}>Candidate Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={dynamicStyles.mobilePostJobButton}
                  onPress={() => navigateTo('PostJob')}
                >
                  <Text style={dynamicStyles.mobilePostJobButtonText}>Post Job</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={dynamicStyles.mobileEmployersButton}
                  onPress={() => navigateTo('EmployerOptions')}
                >
                  <Text style={dynamicStyles.mobileEmployersButtonText}>Employers Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
    </>
  );
};

const getStyles = (
  isXsPhone, isSmallPhone, isPhone, isLargePhone, isMobile,
  isSmallTablet, isTablet, isLargeTablet, isTabletDevice,
  isSmallLaptop, isLaptop, isDesktop, isLargeDesktop, isDesktopDevice,
  showMobileMenu, showCompactNav, width
) => {
  // Calculate responsive values
  const headerHeight = isXsPhone ? 48 : isSmallPhone ? 52 : isMobile ? 56 : isTabletDevice ? 60 : isSmallLaptop ? 64 : 70;
  const horizontalPadding = isXsPhone ? 8 : isSmallPhone ? 10 : isMobile ? 12 : isSmallTablet ? 16 : isTablet ? 20 : isLargeTablet ? 24 : isSmallLaptop ? 32 : isLaptop ? 40 : 48;
  const menuGap = showCompactNav ? 2 : isLaptop ? 4 : 8;
  const menuPadding = showCompactNav ? 6 : isLaptop ? 8 : 12;
  
  return StyleSheet.create({
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      zIndex: 998,
      ...(isWeb && {
        position: 'fixed',
      }),
    },
    headerWrapper: {
      backgroundColor: colors.cardBackground,
      ...shadows.md,
      elevation: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 999,
      ...(isWeb && {
        position: 'relative',
      }),
    },
    header: {
      backgroundColor: colors.cardBackground,
      overflow: 'visible',
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 0,
      paddingVertical: isXsPhone ? 4 : isSmallPhone ? 6 : isMobile ? 8 : 12,
      minHeight: headerHeight,
      width: '100%',
      overflow: 'visible',
    },
    logo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoText: {
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    logoFree: {
      color: colors.text,
    },
    logoJob: {
      color: '#FF6B35',
    },
    logoWala: {
      color: colors.text,
    },
    
    // Left Section Container
    leftSectionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: isSmallLaptop ? 12 : isLaptop ? 16 : 24,
      paddingLeft: horizontalPadding,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isMobile ? 8 : 12,
      flex: 1,
    },
    backButton: {
      width: isMobile ? 32 : 40,
      height: isMobile ? 32 : 40,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    titleText: {
      fontSize: isMobile ? 16 : isTabletDevice ? 18 : 20,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    
    // Navigation Menu
    navMenu: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: menuGap,
      overflow: 'visible',
      flexWrap: showCompactNav ? 'wrap' : 'nowrap',
    },
    menuItemWrapper: {
      position: 'relative',
      overflow: 'visible',
      zIndex: 100,
    },
    menuItemWrapperActive: {
      zIndex: 9999,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: menuPadding,
      paddingVertical: showCompactNav ? 6 : 8,
      gap: 4,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    menuItemText: {
      fontSize: showCompactNav ? 12 : isLaptop ? 13 : 14,
      fontWeight: '500',
      color: colors.text,
    },
    menuItemIcon: {
      marginLeft: 2,
    },
    
    // Dropdown
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      minWidth: showCompactNav ? 180 : 220,
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      marginTop: 4,
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 9999,
      ...(isWeb ? {
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      } : {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      }),
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: showCompactNav ? 12 : 16,
      paddingVertical: showCompactNav ? 10 : 12,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.cardBackground,
      ...(isWeb && {
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }),
    },
    dropdownItemText: {
      fontSize: showCompactNav ? 12 : 13,
      color: colors.text,
      fontWeight: '500',
      flex: 1,
    },
    dropdownItemLast: {
      borderBottomWidth: 0,
    },
    
    // Header Actions
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isXsPhone ? 4 : isSmallPhone ? 6 : isMobile ? 8 : 12,
      marginLeft: 'auto',
      paddingRight: horizontalPadding,
    },
    authButtons: {
      flexDirection: 'row',
      gap: isXsPhone ? 4 : isSmallPhone ? 6 : isMobile ? 8 : showCompactNav ? 6 : 10,
      alignItems: 'center',
      flexWrap: 'nowrap',
    },
    loginButton: {
      paddingHorizontal: isMobile ? 8 : showCompactNav ? 10 : 14,
      paddingVertical: isMobile ? 6 : 8,
      borderRadius: borderRadius.md,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: '#E0E7FF',
      alignItems: 'center',
    },
    loginButtonText: {
      color: '#4F46E5',
      fontWeight: '600',
      fontSize: isMobile ? 11 : showCompactNav ? 12 : 13,
    },
    postJobButton: {
      paddingHorizontal: showCompactNav ? 10 : 14,
      paddingVertical: 8,
      borderRadius: borderRadius.md,
      backgroundColor: '#4F46E5',
      alignItems: 'center',
    },
    postJobButtonText: {
      color: colors.textWhite,
      fontWeight: '600',
      fontSize: showCompactNav ? 12 : 13,
    },
    employersButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: borderRadius.md,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: '#E0E7FF',
      alignItems: 'center',
    },
    employersButtonText: {
      color: '#4F46E5',
      fontWeight: '600',
      fontSize: 13,
    },
    
    // User Menu
    userMenu: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isMobile ? 6 : 10,
      backgroundColor: colors.background,
      paddingVertical: 4,
      paddingHorizontal: isMobile ? 8 : 12,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userAvatarContainer: {},
    userAvatar: {
      width: isMobile ? 28 : 34,
      height: isMobile ? 28 : 34,
      borderRadius: isMobile ? 14 : 17,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    userInitial: {
      color: colors.textWhite,
      fontWeight: '700',
      fontSize: isMobile ? 12 : 14,
    },
    userName: {
      color: colors.text,
      fontWeight: '600',
      maxWidth: isTabletDevice ? 80 : showCompactNav ? 100 : 140,
      fontSize: showCompactNav ? 12 : 13,
    },
    logoutButton: {
      width: isMobile ? 26 : 30,
      height: isMobile ? 26 : 30,
      borderRadius: isMobile ? 13 : 15,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    
    // Mobile Menu Button
    mobileMenuButton: {
      padding: isXsPhone ? 4 : 8,
    },
    
    // Mobile Menu Modal
    mobileMenuOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    mobileMenuContent: {
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '85%',
      paddingBottom: 24,
    },
    mobileMenuHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? 16 : 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    mobileMenuTitle: {
      fontSize: isMobile ? 18 : 20,
      fontWeight: '700',
      color: colors.text,
    },
    mobileMenuClose: {
      padding: 4,
    },
    mobileMenuItem: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    mobileMenuItemButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? 14 : 18,
    },
    mobileMenuItemText: {
      fontSize: isMobile ? 15 : 16,
      fontWeight: '500',
      color: colors.text,
    },
    mobileDropdown: {
      backgroundColor: colors.background,
      paddingVertical: 4,
    },
    mobileDropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isMobile ? 20 : 28,
      paddingVertical: isMobile ? 10 : 12,
      gap: 10,
    },
    mobileDropdownItemText: {
      fontSize: isMobile ? 13 : 14,
      color: colors.text,
    },
    mobileAuthButtons: {
      padding: isMobile ? 16 : 20,
      gap: 12,
    },
    mobileLoginButton: {
      paddingVertical: 14,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    mobileLoginButtonText: {
      color: colors.textWhite,
      fontWeight: '600',
      fontSize: 15,
    },
    mobilePostJobButton: {
      paddingVertical: 14,
      borderRadius: borderRadius.md,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
    },
    mobilePostJobButtonText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 15,
    },
    mobileEmployersButton: {
      paddingVertical: 14,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    mobileEmployersButtonText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 15,
    },
  });
};

export default Header;
