import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useResponsive } from '../../utils/responsive';

const AdminResumeSearchScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    // Redirect to Candidate Search screen
    navigation.replace('AdminCandidateSearch');
  }, []);

  return (
    <AdminLayout title="Resume Search" activeScreen="AdminResumeSearch" onNavigate={handleNavigate} onLogout={handleLogout}>
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.pageTitle}>Resume Search</Text>
        <Text style={dynamicStyles.pageSubtitle}>Search and filter candidate resumes</Text>
        <View style={dynamicStyles.infoCard}>
          <Text style={dynamicStyles.infoText}>Redirecting to Candidate Search...</Text>
        </View>
      </View>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: { 
    flex: 1, 
    padding: isMobile ? 16 : isTablet ? 20 : 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: { 
    fontSize: isMobile ? 22 : isTablet ? 26 : 28, 
    fontWeight: 'bold', 
    color: '#333',
    textAlign: 'center',
    marginBottom: isMobile ? 8 : 12,
  },
  pageSubtitle: { 
    fontSize: isMobile ? 12 : isTablet ? 13 : 14, 
    color: '#666', 
    marginTop: 4, 
    marginBottom: isMobile ? 16 : 20,
    textAlign: 'center',
  },
  infoCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: isMobile ? 16 : isTablet ? 18 : 20, 
    marginTop: isMobile ? 16 : 20,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }),
  },
  infoText: { 
    fontSize: isMobile ? 14 : isTablet ? 15 : 16, 
    color: '#666', 
    textAlign: 'center' 
  },
});

const styles = StyleSheet.create({});

export default AdminResumeSearchScreen;

