import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import EmployerSidebar from '../../components/EmployerSidebar';
import CreateSocialPostScreen from '../SocialUpdates/CreateSocialPostScreen';

const EmployerCreateSocialPostScreen = ({ navigation }) => {
  return (
    <View style={styles.page}>
      <View style={styles.sidebar}><EmployerSidebar permanent navigation={navigation} role="company" activeKey="social" /></View>
      <View style={styles.content}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Create Social Post</Text>
          <Text style={styles.headerSubtitle}>Share updates, news, and announcements</Text>
        </View>
        <CreateSocialPostScreen navigation={navigation} route={{ params: { hideHeader: true } }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  sidebar: { width: 280, backgroundColor: colors.sidebarBackground },
  content: { flex: 1 },
  headerBar: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { ...typography.h3, color: colors.text, fontWeight: '700' },
  headerSubtitle: { ...typography.body2, color: colors.textSecondary, marginTop: spacing.xs },
});

export default EmployerCreateSocialPostScreen;


