// Admin-only navigation setup
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../styles/theme';

// Auth Screen
import AdminLoginScreen from '../screens/AdminLoginScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/Admin/AdminUsersScreen';
import AdminJobsScreen from '../screens/Admin/AdminJobsScreen';
import AdminJobDetailsScreen from '../screens/Admin/AdminJobDetailsScreen';
import AdminApplicationsScreen from '../screens/Admin/AdminApplicationsScreen';
import AdminApplicationDetailsScreen from '../screens/Admin/AdminApplicationDetailsScreen';
import AdminRoleManagementScreen from '../screens/Admin/AdminRoleManagementScreen';
import AdminTeamLimitsScreen from '../screens/Admin/AdminTeamLimitsScreen';
import AdminBlogsScreen from '../screens/Admin/AdminBlogsScreen';
import AdminFAQsScreen from '../screens/Admin/AdminFAQsScreen';
import AdminVerificationScreen from '../screens/Admin/AdminVerificationScreen';
import AdminKYCScreen from '../screens/Admin/AdminKYCManagementScreen';
import AdminSalesEnquiryScreen from '../screens/Admin/AdminSalesEnquiryScreen';
import AdminAnalyticsScreen from '../screens/Admin/AdminAnalyticsScreen';
import AdminSettingsScreen from '../screens/Admin/AdminSettingsScreen';
import GeneralSettingsScreen from '../screens/Admin/Settings/GeneralSettingsScreen';
import SecuritySettingsScreen from '../screens/Admin/Settings/SecuritySettingsScreen';
import EmailConfigurationScreen from '../screens/Admin/Settings/EmailConfigurationScreen';
import PaymentSettingsScreen from '../screens/Admin/Settings/PaymentSettingsScreen';
import NotificationSettingsScreen from '../screens/Admin/Settings/NotificationSettingsScreen';
import AdminEmailTemplatesScreen from '../screens/Admin/AdminEmailTemplatesScreen';
import AdminSMTPSettingsScreen from '../screens/Admin/AdminSMTPSettingsScreen';
import AdminEmailLogsScreen from '../screens/Admin/AdminEmailLogsScreen';
import AdminLoginSecurityScreen from '../screens/Admin/AdminLoginSecurityScreen';
import AdminSocialUpdatesScreen from '../screens/Admin/AdminSocialUpdatesScreen';
import AdminPackageManagementScreen from '../screens/Admin/AdminPackageManagementScreen';
import AdminRazorpayIntegrationScreen from '../screens/Admin/AdminRazorpayIntegrationScreen';
import AdminPaymentOptionsScreen from '../screens/Admin/AdminPaymentOptionsScreen';
import AdminApiSettingsScreen from '../screens/Admin/AdminApiSettingsScreen';
import AdminAdvertisementManagementScreen from '../screens/Admin/AdminAdvertisementManagementScreen';
import AdminLiveChatSupportScreen from '../screens/Admin/AdminLiveChatSupportScreen';
import AdminResumeSearchScreen from '../screens/Admin/AdminResumeSearchScreen';
import AdminResumeManagementScreen from '../screens/Admin/AdminResumeManagementScreen';
import AdminJobAlertsScreen from '../screens/Admin/AdminJobAlertsScreen';
import AdminCandidateSearchScreen from '../screens/Admin/AdminCandidateSearchScreen';
import AdminCandidateDetailsScreen from '../screens/Admin/AdminCandidateDetailsScreen';
import AdminEditCandidateScreen from '../screens/Admin/AdminEditCandidateScreen';
import AdminHomepageScreen from '../screens/Admin/AdminHomepageScreen';
import AdminFreejobwalaChatScreen from '../screens/Admin/AdminFreejobwalaChatScreen';
import AdminChatTemplatesScreen from '../screens/Admin/AdminChatTemplatesScreen';
import AdminLogoManagementScreen from '../screens/Admin/AdminLogoManagementScreen';
import AdminPostJobScreen from '../screens/Admin/AdminPostJobScreen';
import AdminJobEventsScreen from '../screens/Admin/AdminJobEventsScreen';
import AdminEventRegistrationsScreen from '../screens/Admin/AdminEventRegistrationsScreen';
import AdminCompaniesScreen from '../screens/Admin/AdminCompaniesScreen';
import AdminCompanyDetailsScreen from '../screens/Admin/AdminCompanyDetailsScreen';
import AdminConsultanciesScreen from '../screens/Admin/AdminConsultanciesScreen';
import AdminConsultancyDetailsScreen from '../screens/Admin/AdminConsultancyDetailsScreen';
// Import ChatConversationScreen from admin screens
import ChatConversationScreen from '../screens/Chat/ChatConversationScreen';
// Import Invitation Screens
import AdminInvitationsScreen from '../screens/Admin/AdminInvitationsScreen';
import AdminWhatsAppSettingsScreen from '../screens/Admin/AdminWhatsAppSettingsScreen';
// Import Location Editor
import AdminLocationEditorScreen from '../screens/Admin/AdminLocationEditorScreen';

// Admin Master Data Screens
import AdminJobTitlesScreen from '../screens/Admin/MasterData/AdminJobTitlesScreen';
import AdminKeySkillsScreen from '../screens/Admin/MasterData/AdminKeySkillsScreen';
import AdminIndustriesScreen from '../screens/Admin/MasterData/AdminIndustriesScreen';
import AdminSubIndustriesScreen from '../screens/Admin/MasterData/AdminSubIndustriesScreen';
import AdminDepartmentsScreen from '../screens/Admin/MasterData/AdminDepartmentsScreen';
import AdminSubDepartmentsScreen from '../screens/Admin/MasterData/AdminSubDepartmentsScreen';
import AdminCoursesScreen from '../screens/Admin/MasterData/AdminCoursesScreen';
import AdminSpecializationsScreen from '../screens/Admin/MasterData/AdminSpecializationsScreen';
import AdminEducationFieldsScreen from '../screens/Admin/MasterData/AdminEducationFieldsScreen';
import AdminLocationsScreen from '../screens/Admin/MasterData/AdminLocationsScreen';

const Stack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AdminLogin"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.textWhite,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Admin Login */}
        <Stack.Screen 
          name="AdminLogin" 
          component={AdminLoginScreen}
          options={{ 
            title: 'Admin Login',
            headerShown: false
          }}
        />
        
        {/* Admin Dashboard */}
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboardScreen}
          options={{ 
            title: 'Admin Dashboard',
            headerShown: false
          }}
        />
        
        {/* Admin Management Screens */}
        <Stack.Screen 
          name="AdminUsers" 
          component={AdminUsersScreen}
          options={{ title: 'Users Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminJobs" 
          component={AdminJobsScreen}
          options={{ title: 'Jobs Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminJobDetails" 
          component={AdminJobDetailsScreen}
          options={{ title: 'Job Details', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminApplications" 
          component={AdminApplicationsScreen}
          options={{ title: 'Applications Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminApplicationDetails" 
          component={AdminApplicationDetailsScreen}
          options={{ title: 'Application Details', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminRoleManagement" 
          component={AdminRoleManagementScreen}
          options={{ title: 'Role Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminTeamLimits" 
          component={AdminTeamLimitsScreen}
          options={{ title: 'Team Limits', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminBlogs" 
          component={AdminBlogsScreen}
          options={{ title: 'Blogs Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminFAQs" 
          component={AdminFAQsScreen}
          options={{ title: 'FAQ Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminVerification" 
          component={AdminVerificationScreen}
          options={{ title: 'Verification', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminKYC" 
          component={AdminKYCScreen}
          options={{ title: 'KYC Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminSalesEnquiry" 
          component={AdminSalesEnquiryScreen}
          options={{ title: 'Sales Enquiry', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminAnalytics" 
          component={AdminAnalyticsScreen}
          options={{ title: 'Analytics', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminSettings" 
          component={AdminSettingsScreen}
          options={{ title: 'Settings', headerShown: false }}
        />
        <Stack.Screen 
          name="GeneralSettings" 
          component={GeneralSettingsScreen}
          options={{ title: 'General Settings', headerShown: false }}
        />
        <Stack.Screen 
          name="SecuritySettings" 
          component={SecuritySettingsScreen}
          options={{ title: 'Security Settings', headerShown: false }}
        />
        <Stack.Screen 
          name="EmailConfiguration" 
          component={EmailConfigurationScreen}
          options={{ title: 'Email Configuration', headerShown: false }}
        />
        <Stack.Screen 
          name="PaymentSettings" 
          component={PaymentSettingsScreen}
          options={{ title: 'Payment Settings', headerShown: false }}
        />
        <Stack.Screen 
          name="NotificationSettings" 
          component={NotificationSettingsScreen}
          options={{ title: 'Notification Settings', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminEmailTemplates" 
          component={AdminEmailTemplatesScreen}
          options={{ title: 'Email Templates', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminSMTPSettings" 
          component={AdminSMTPSettingsScreen}
          options={{ title: 'SMTP Settings', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminEmailLogs" 
          component={AdminEmailLogsScreen}
          options={{ title: 'Email Logs', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminLoginSecurity" 
          component={AdminLoginSecurityScreen}
          options={{ title: 'Login Security', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminSocialUpdates" 
          component={AdminSocialUpdatesScreen}
          options={{ title: 'Social Updates', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminPackageManagement" 
          component={AdminPackageManagementScreen}
          options={{ title: 'Package Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminRazorpayIntegration" 
          component={AdminRazorpayIntegrationScreen}
          options={{ title: 'Razorpay Integration', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminPaymentOptions" 
          component={AdminPaymentOptionsScreen}
          options={{ title: 'Payment Options', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminApiSettings" 
          component={AdminApiSettingsScreen}
          options={{ title: 'API Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminAdvertisementManagement" 
          component={AdminAdvertisementManagementScreen}
          options={{ title: 'Advertisement Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminLiveChatSupport" 
          component={AdminLiveChatSupportScreen}
          options={{ title: 'Live Chat Support', headerShown: false }}
        />
        <Stack.Screen 
          name="ChatConversation" 
          component={ChatConversationScreen}
          options={{ 
            title: 'Chat',
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textWhite,
          }}
        />
        <Stack.Screen 
          name="AdminResumeSearch" 
          component={AdminResumeSearchScreen}
          options={{ title: 'Resume Search', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminResumeManagement" 
          component={AdminResumeManagementScreen}
          options={{ title: 'Resume Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminCandidateSearch" 
          component={AdminCandidateSearchScreen}
          options={{ title: 'Candidate Search', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminCandidateDetails" 
          component={AdminCandidateDetailsScreen}
          options={{ title: 'Candidate Details', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminEditCandidate" 
          component={AdminEditCandidateScreen}
          options={{ title: 'Edit Candidate', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminJobAlerts" 
          component={AdminJobAlertsScreen}
          options={{ title: 'Job Alerts', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminHomepage" 
          component={AdminHomepageScreen}
          options={{ title: 'Homepage Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminFreejobwalaChat" 
          component={AdminFreejobwalaChatScreen}
          options={{ title: 'Freejobwala Chat', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminChatTemplates" 
          component={AdminChatTemplatesScreen}
          options={{ title: 'Chat Templates', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminLogoManagement" 
          component={AdminLogoManagementScreen}
          options={{ title: 'Logo Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminPostJob" 
          component={AdminPostJobScreen}
          options={{ title: 'Post Job', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminJobEvents" 
          component={AdminJobEventsScreen}
          options={{ title: 'Job Events Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminEventRegistrations" 
          component={AdminEventRegistrationsScreen}
          options={{ title: 'Event Registrations', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminCompanies" 
          component={AdminCompaniesScreen}
          options={{ title: 'Companies Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminCompanyDetails" 
          component={AdminCompanyDetailsScreen}
          options={{ title: 'Company Details', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminConsultancies" 
          component={AdminConsultanciesScreen}
          options={{ title: 'Consultancies Management', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminConsultancyDetails" 
          component={AdminConsultancyDetailsScreen}
          options={{ title: 'Consultancy Details', headerShown: false }}
        />
        
        {/* Invitation Management Screens */}
        <Stack.Screen 
          name="AdminInvitations" 
          component={AdminInvitationsScreen}
          options={{ title: 'Bulk Invitations', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminWhatsAppSettings" 
          component={AdminWhatsAppSettingsScreen}
          options={{ title: 'WhatsApp Settings', headerShown: false }}
        />
        
        {/* Location Editor */}
        <Stack.Screen 
          name="AdminLocationEditor" 
          component={AdminLocationEditorScreen}
          options={{ title: 'Location Editor', headerShown: false }}
        />
        
        {/* Admin Master Data Screens */}
        <Stack.Screen 
          name="AdminJobTitles" 
          component={AdminJobTitlesScreen}
          options={{ title: 'Job Titles', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminKeySkills" 
          component={AdminKeySkillsScreen}
          options={{ title: 'Key Skills', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminIndustries" 
          component={AdminIndustriesScreen}
          options={{ title: 'Industries', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminSubIndustries" 
          component={AdminSubIndustriesScreen}
          options={{ title: 'Sub-Industries', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminDepartments" 
          component={AdminDepartmentsScreen}
          options={{ title: 'Departments', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminSubDepartments" 
          component={AdminSubDepartmentsScreen}
          options={{ title: 'Sub-Departments', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminCourses" 
          component={AdminCoursesScreen}
          options={{ title: 'Courses', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminSpecializations" 
          component={AdminSpecializationsScreen}
          options={{ title: 'Specializations', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminEducationFields" 
          component={AdminEducationFieldsScreen}
          options={{ title: 'Education Fields', headerShown: false }}
        />
        <Stack.Screen 
          name="AdminLocations" 
          component={AdminLocationsScreen}
          options={{ title: 'Locations', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AdminNavigator;

