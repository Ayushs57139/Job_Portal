import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import CreateSocialPostScreen from '../SocialUpdates/CreateSocialPostScreen';
import { useResponsive } from '../../utils/responsive';

const EmployerCreateSocialPostScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const { isMobile } = responsive;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <View style={styles.page}>
      {!isMobile && (
        <View style={styles.sidebar}>
          <EmployerSidebar permanent navigation={navigation} role="company" activeKey="social" />
        </View>
      )}
      {isMobile && (
        <EmployerSidebar 
          visible={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          navigation={navigation} 
          role="company" 
          activeKey="social" 
        />
      )}
      {isMobile && (
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSidebarOpen(true)}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerBar, isMobile && styles.headerBarMobile]}
        >
          <View style={[styles.headerLeft, isMobile && styles.headerLeftMobile]}>
            <View style={[styles.headerIconContainer, isMobile && styles.headerIconContainerMobile]}>
              <Ionicons name="create" size={isMobile ? 24 : 28} color="#3B82F6" />
            </View>
            <View>
              <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>Create Social Post</Text>
              <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>Share updates, news, and announcements</Text>
            </View>
          </View>
        </LinearGradient>
        <CreateSocialPostScreen navigation={navigation} route={{ params: { hideHeader: true } }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, flexDirection: 'row', backgroundColor: '#F1F5F9' },
  sidebar: { width: 280, backgroundColor: colors.sidebarBackground },
  menuButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  content: { flex: 1 },
  headerBar: { 
    padding: spacing.xl, 
    ...shadows.md,
  },
  headerBarMobile: {
    padding: spacing.md,
    paddingTop: spacing.xl + 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerLeftMobile: {
    gap: spacing.sm,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainerMobile: {
    width: 48,
    height: 48,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerTitleMobile: {
    fontSize: 22,
  },
  headerSubtitle: { 
    fontSize: 14,
    color: '#64748B', 
    marginTop: 4,
    fontWeight: '500',
  },
  headerSubtitleMobile: {
    fontSize: 12,
  },
});

export default EmployerCreateSocialPostScreen;


