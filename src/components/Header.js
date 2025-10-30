import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, shadows, borderRadius } from '../styles/theme';
import api from '../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const Header = ({ showBack = false, title }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        { 
          label: 'All Jobs', 
          screen: 'Jobs', 
          icon: 'briefcase',
          params: null
        },
        { 
          label: 'Work From Home Jobs', 
          screen: 'Jobs', 
          icon: 'home-outline',
          params: { filterType: 'workMode', filterValue: 'wfh', filterLabel: 'Work From Home Jobs' }
        },
        { 
          label: 'Part Time Jobs', 
          screen: 'Jobs', 
          icon: 'time-outline',
          params: { filterType: 'workType', filterValue: 'parttime', filterLabel: 'Part Time Jobs' }
        },
        { 
          label: 'Freshers Jobs', 
          screen: 'Jobs', 
          icon: 'school-outline',
          params: { filterType: 'experience', filterValue: 'fresher', filterLabel: 'Freshers Jobs' }
        },
        { 
          label: 'Jobs for Women', 
          screen: 'Jobs', 
          icon: 'female-outline',
          params: { filterType: 'gender', filterValue: 'female', filterLabel: 'Jobs for Women' }
        },
        { 
          label: 'Full Time Jobs', 
          screen: 'Jobs', 
          icon: 'briefcase-outline',
          params: { filterType: 'workType', filterValue: 'fulltime', filterLabel: 'Full Time Jobs' }
        },
        { 
          label: 'Night Shift Jobs', 
          screen: 'Jobs', 
          icon: 'moon-outline',
          params: { filterType: 'workShift', filterValue: 'night', filterLabel: 'Night Shift Jobs' }
        },
        { 
          label: 'Jobs By City', 
          screen: 'Jobs', 
          icon: 'location-outline',
          params: { filterType: 'location', filterValue: 'city', filterLabel: 'Jobs By City' }
        },
        { 
          label: 'Jobs By Department', 
          screen: 'Jobs', 
          icon: 'business-outline',
          params: { filterType: 'department', filterValue: 'all', filterLabel: 'Jobs By Department' }
        },
        { 
          label: 'Jobs By Company', 
          screen: 'Companies', 
          icon: 'albums-outline',
          params: null
        },
        { 
          label: 'Jobs By Qualification', 
          screen: 'Jobs', 
          icon: 'ribbon-outline',
          params: { filterType: 'qualification', filterValue: 'all', filterLabel: 'Jobs By Qualification' }
        },
      ],
    },
    {
      label: 'Companies',
      screen: 'Companies',
      hasDropdown: false,
    },
    {
      label: 'Services',
      screen: 'Services',
      hasDropdown: true,
      items: [
        { label: 'Resume Tools', screen: 'ResumeBuilder', icon: 'document-text-outline' },
        { label: 'Packages', screen: 'Packages', icon: 'cube-outline' },
      ],
    },
    {
      label: 'Blogs',
      screen: 'Blogs',
      hasDropdown: false,
    },
    {
      label: 'Social Updates',
      screen: 'SocialUpdates',
      hasDropdown: false,
    },
  ];

  // Render navigation menu item
  const renderMenuItem = (item, index) => {
    const isActive = activeDropdown === item.label;
    
    return (
      <View 
        key={index} 
        style={[
          styles.menuItemWrapper,
          isActive && styles.menuItemWrapperActive
        ]}
      >
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            if (item.hasDropdown) {
              toggleDropdown(item.label);
            } else {
              navigateTo(item.screen);
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.menuItemText}>{item.label}</Text>
          {item.hasDropdown && (
            <Ionicons
              name={isActive ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.text}
              style={styles.menuItemIcon}
            />
          )}
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {item.hasDropdown && isActive && (
          <View style={styles.dropdown}>
            {item.items.map((dropdownItem, dropdownIndex) => (
              <TouchableOpacity
                key={dropdownIndex}
                style={[
                  styles.dropdownItem,
                  dropdownIndex === item.items.length - 1 && styles.dropdownItemLast
                ]}
                onPress={() => navigateTo(dropdownItem.screen, dropdownItem.params)}
                activeOpacity={0.7}
              >
                <Ionicons name={dropdownItem.icon} size={18} color={colors.primary} />
                <Text style={styles.dropdownItemText}>{dropdownItem.label}</Text>
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
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setActiveDropdown(null)}
        />
      )}
      
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Logo or Back Button */}
            {showBack ? (
              <View style={styles.leftSection}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                {title && <Text style={styles.titleText}>{title}</Text>}
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => navigateTo('Home')}
                style={styles.logo}
                activeOpacity={0.8}
              >
                <Text style={styles.logoText}>
                  <Text style={styles.logoFree}>Free</Text>
                  <Text style={styles.logoJob}>job</Text>
                  <Text style={styles.logoWala}>wala</Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Navigation Menu - Desktop/Tablet (only show if not showing back button) */}
            {!showBack && (isWeb || width > 768) && (
              <View style={styles.navMenu}>
                {menuItems.map((item, index) => renderMenuItem(item, index))}
              </View>
            )}

          {/* Right Section */}
          <View style={styles.headerActions}>
            {user ? (
              <View style={styles.userMenu}>
                <TouchableOpacity 
                  style={styles.userAvatarContainer}
                  onPress={() => {
                    // Navigate based on user type
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
                  <View style={styles.userAvatar}>
                    <Text style={styles.userInitial}>
                      {(user.firstName || user.name || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    // Navigate based on user type
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
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.firstName || user.name}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLogout}
                  style={styles.logoutButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="log-out-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => navigateTo('Login')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.postJobButton}
                  onPress={() => navigateTo('PostJob')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.postJobButtonText}>Post Job</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.employersButton}
                  onPress={() => navigateTo('EmployerOptions')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.employersButtonText}>For Employers</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Mobile Menu Button */}
            {!isWeb && width <= 768 && (
              <TouchableOpacity
                style={styles.mobileMenuButton}
                onPress={() => setMobileMenuOpen(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="menu" size={28} color={colors.text} />
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
        <View style={styles.mobileMenuOverlay}>
          <View style={styles.mobileMenuContent}>
            <View style={styles.mobileMenuHeader}>
              <Text style={styles.mobileMenuTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setMobileMenuOpen(false)}
                style={styles.mobileMenuClose}
              >
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            {menuItems.map((item, index) => (
              <View key={index} style={styles.mobileMenuItem}>
                <TouchableOpacity
                  style={styles.mobileMenuItemButton}
                  onPress={() => {
                    if (!item.hasDropdown) {
                      navigateTo(item.screen);
                    } else {
                      toggleDropdown(item.label);
                    }
                  }}
                >
                  <Text style={styles.mobileMenuItemText}>{item.label}</Text>
                  {item.hasDropdown && (
                    <Ionicons
                      name={activeDropdown === item.label ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.text}
                    />
                  )}
                </TouchableOpacity>

                {item.hasDropdown && activeDropdown === item.label && (
                  <View style={styles.mobileDropdown}>
                    {item.items.map((dropdownItem, dropdownIndex) => (
                      <TouchableOpacity
                        key={dropdownIndex}
                        style={styles.mobileDropdownItem}
                        onPress={() => navigateTo(dropdownItem.screen, dropdownItem.params)}
                      >
                        <Ionicons name={dropdownItem.icon} size={18} color={colors.primary} />
                        <Text style={styles.mobileDropdownItemText}>{dropdownItem.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {!user && (
              <View style={styles.mobileAuthButtons}>
                <TouchableOpacity
                  style={styles.mobileLoginButton}
                  onPress={() => navigateTo('Login')}
                >
                  <Text style={styles.mobileLoginButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.mobilePostJobButton}
                  onPress={() => navigateTo('PostJob')}
                >
                  <Text style={styles.mobilePostJobButtonText}>Post Job</Text>
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

const styles = StyleSheet.create({
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 70,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    overflow: 'visible',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: isWeb ? 32 : 28,
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
  
  // Back Button & Title
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  
  // Navigation Menu
  navMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'center',
    overflow: 'visible',
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    ...(isWeb && {
      cursor: 'pointer',
    }),
  },
  menuItemText: {
    fontSize: 15,
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
    minWidth: 220,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    ...(isWeb && {
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.cardBackground,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    }),
  },
  dropdownItemText: {
    fontSize: 14,
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
    gap: spacing.sm,
  },
  authButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  loginButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    minWidth: 80,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 14,
  },
  postJobButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#4F46E5',
    minWidth: 100,
    alignItems: 'center',
  },
  postJobButtonText: {
    color: colors.textWhite,
    fontWeight: '600',
    fontSize: 14,
  },
  employersButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    minWidth: 120,
    alignItems: 'center',
  },
  employersButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // User Menu
  userMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userAvatarContainer: {
    // Container for clickable avatar
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userInitial: {
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: 16,
  },
  userName: {
    color: colors.text,
    fontWeight: '600',
    maxWidth: isWeb ? 150 : 100,
  },
  logoutButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Mobile Menu Button
  mobileMenuButton: {
    padding: spacing.sm,
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
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileMenuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  mobileMenuClose: {
    padding: spacing.xs,
  },
  mobileMenuItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  mobileMenuItemButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  mobileMenuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  mobileDropdown: {
    backgroundColor: colors.background,
    paddingVertical: spacing.xs,
  },
  mobileDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  mobileDropdownItemText: {
    fontSize: 14,
    color: colors.text,
  },
  mobileAuthButtons: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  mobileLoginButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  mobileLoginButtonText: {
    color: colors.textWhite,
    fontWeight: '600',
    fontSize: 16,
  },
  mobilePostJobButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  mobilePostJobButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Header;

