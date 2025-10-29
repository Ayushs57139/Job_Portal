// Main navigation setup
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Platform } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import AdminLoginScreen from '../screens/Auth/AdminLoginScreen';
import EmployerOptionsScreen from '../screens/Auth/EmployerOptionsScreen';
import CompanyRegisterScreen from '../screens/Auth/CompanyRegisterScreen';
import ConsultancyRegisterScreen from '../screens/Auth/ConsultancyRegisterScreen';

// Main Screens
import HomeScreen from '../screens/Home/HomeScreen';
import JobsScreen from '../screens/Jobs/JobsScreen';
import JobDetailsScreen from '../screens/Jobs/JobDetailsScreen';
import JobApplicationScreen from '../screens/Jobs/JobApplicationScreen';
import PostJobScreen from '../screens/Jobs/PostJobScreen';

// Dashboard Screens
import UserDashboardScreen from '../screens/Dashboard/UserDashboardScreen';
import CompanyDashboardScreen from '../screens/Dashboard/CompanyDashboardScreen';
import ConsultancyDashboardScreen from '../screens/Dashboard/ConsultancyDashboardScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/Admin/AdminUsersScreen';
import AdminJobsScreen from '../screens/Admin/AdminJobsScreen';
import AdminApplicationsScreen from '../screens/Admin/AdminApplicationsScreen';
import AdminRoleManagementScreen from '../screens/Admin/AdminRoleManagementScreen';
import AdminTeamLimitsScreen from '../screens/Admin/AdminTeamLimitsScreen';
import AdminBlogsScreen from '../screens/Admin/AdminBlogsScreen';
import AdminVerificationScreen from '../screens/Admin/AdminVerificationScreen';
import AdminKYCScreen from '../screens/Admin/AdminKYCScreen';
import AdminSalesEnquiryScreen from '../screens/Admin/AdminSalesEnquiryScreen';
import AdminAnalyticsScreen from '../screens/Admin/AdminAnalyticsScreen';
import AdminSettingsScreen from '../screens/Admin/AdminSettingsScreen';
import AdminEmailTemplatesScreen from '../screens/Admin/AdminEmailTemplatesScreen';
import AdminSMTPSettingsScreen from '../screens/Admin/AdminSMTPSettingsScreen';
import AdminEmailLogsScreen from '../screens/Admin/AdminEmailLogsScreen';
import AdminSocialUpdatesScreen from '../screens/Admin/AdminSocialUpdatesScreen';
import AdminPackageManagementScreen from '../screens/Admin/AdminPackageManagementScreen';
import AdminAdvertisementManagementScreen from '../screens/Admin/AdminAdvertisementManagementScreen';
import AdminLiveChatSupportScreen from '../screens/Admin/AdminLiveChatSupportScreen';
import AdminResumeSearchScreen from '../screens/Admin/AdminResumeSearchScreen';
import AdminResumeManagementScreen from '../screens/Admin/AdminResumeManagementScreen';
import AdminJobAlertsScreen from '../screens/Admin/AdminJobAlertsScreen';
import AdminHomepageScreen from '../screens/Admin/AdminHomepageScreen';
import AdminFreejobwalaChatScreen from '../screens/Admin/AdminFreejobwalaChatScreen';
import AdminLogoManagementScreen from '../screens/Admin/AdminLogoManagementScreen';
import AdminPostJobScreen from '../screens/Admin/AdminPostJobScreen';

// Admin Master Data Screens
import AdminJobTitlesScreen from '../screens/Admin/MasterData/AdminJobTitlesScreen';
import AdminKeySkillsScreen from '../screens/Admin/MasterData/AdminKeySkillsScreen';
import AdminIndustriesScreen from '../screens/Admin/MasterData/AdminIndustriesScreen';
import AdminDepartmentsScreen from '../screens/Admin/MasterData/AdminDepartmentsScreen';
import AdminCoursesScreen from '../screens/Admin/MasterData/AdminCoursesScreen';
import AdminSpecializationsScreen from '../screens/Admin/MasterData/AdminSpecializationsScreen';
import AdminEducationFieldsScreen from '../screens/Admin/MasterData/AdminEducationFieldsScreen';
import AdminLocationsScreen from '../screens/Admin/MasterData/AdminLocationsScreen';

// Profile Screens
import UserProfileScreen from '../screens/Profile/UserProfileScreen';
import CompanyProfileScreen from '../screens/Profile/CompanyProfileScreen';
import ResumeBuilderScreen from '../screens/Profile/ResumeBuilderScreen';

// Other Screens
import CompaniesScreen from '../screens/Companies/CompaniesScreen';
import CompanyDetailsScreen from '../screens/Companies/CompanyDetailsScreen';
import ServicesScreen from '../screens/Services/ServicesScreen';
import BlogsScreen from '../screens/Blogs/BlogsScreen';
import BlogDetailScreen from '../screens/Blogs/BlogDetailScreen';
import CreateBlogScreen from '../screens/Blogs/CreateBlogScreen';
import SocialUpdatesScreen from '../screens/SocialUpdates/SocialUpdatesScreen';
import CreateSocialPostScreen from '../screens/SocialUpdates/CreateSocialPostScreen';
import PackagesScreen from '../screens/Packages/PackagesScreen';
import SavedJobsScreen from '../screens/Jobs/SavedJobsScreen';
import ChatScreen from '../screens/Chat/ChatScreen';

// Import colors from theme
import { colors } from '../styles/theme';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setUserToken(token);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const containerStyle = {
    flex: 1,
    ...(Platform.OS === 'web' && {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    }),
  };

  // Deep linking configuration
  const linking = {
    prefixes: ['http://localhost:8081', 'http://localhost:19006', 'jobwala://'],
    config: {
      screens: {
        Home: '',
        AdminLogin: 'admin',
        AdminDashboard: 'admin/dashboard',
        CompanyDashboard: 'company/dashboard',
        ConsultancyDashboard: 'consultancy/dashboard',
        UserDashboard: 'dashboard',
        Login: 'login',
        Register: 'register',
        Jobs: 'jobs',
        JobDetails: 'jobs/:id',
        Companies: 'companies',
        CompanyDetails: 'companies/:id',
        Services: 'services',
        Blogs: 'blogs',
        BlogDetail: 'blogs/:slug',
        SocialUpdates: 'social-updates',
        CreateSocialPost: 'create-post',
        Packages: 'packages',
        PostJob: 'post-job',
        EmployerOptions: 'employer-options',
        CompanyRegister: 'company/register',
        ConsultancyRegister: 'consultancy/register',
      },
    },
  };

  return (
    <View style={containerStyle}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            headerStyle: {
              backgroundColor: colors.primary,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: colors.textWhite,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
            headerBackTitleVisible: false,
            ...(Platform.OS === 'web' && {
              cardStyle: { flex: 1, height: '100%' },
            }),
          }}
        >
        {/* Main Screens */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        
        {/* Auth Screens */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ title: 'Register' }}
        />
        <Stack.Screen 
          name="AdminLogin" 
          component={AdminLoginScreen}
          options={{ title: 'Admin Login' }}
        />
        <Stack.Screen 
          name="EmployerOptions" 
          component={EmployerOptionsScreen}
          options={{ title: 'For Employers' }}
        />
        <Stack.Screen 
          name="CompanyRegister" 
          component={CompanyRegisterScreen}
          options={{ title: 'Company Registration' }}
        />
        <Stack.Screen 
          name="ConsultancyRegister" 
          component={ConsultancyRegisterScreen}
          options={{ title: 'Consultancy Registration' }}
        />
        
        {/* Job Screens */}
        <Stack.Screen 
          name="Jobs" 
          component={JobsScreen}
          options={{ title: 'Browse Jobs' }}
        />
        <Stack.Screen 
          name="JobDetails" 
          component={JobDetailsScreen}
          options={{ title: 'Job Details' }}
        />
        <Stack.Screen 
          name="JobApplication" 
          component={JobApplicationScreen}
          options={{ title: 'Apply for Job' }}
        />
        <Stack.Screen 
          name="PostJob" 
          component={PostJobScreen}
          options={{ title: 'Post a Job' }}
        />
        
        {/* Dashboard Screens */}
        <Stack.Screen 
          name="UserDashboard" 
          component={UserDashboardScreen}
          options={{ title: 'My Dashboard' }}
        />
        <Stack.Screen 
          name="CompanyDashboard" 
          component={CompanyDashboardScreen}
          options={{ title: 'Company Dashboard' }}
        />
        <Stack.Screen 
          name="ConsultancyDashboard" 
          component={ConsultancyDashboardScreen}
          options={{ title: 'Consultancy Dashboard' }}
        />
        
        {/* Admin Screens */}
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboardScreen}
          options={{ title: 'Admin Dashboard' }}
        />
        <Stack.Screen 
          name="AdminUsers" 
          component={AdminUsersScreen}
          options={{ title: 'Users Management' }}
        />
        <Stack.Screen 
          name="AdminJobs" 
          component={AdminJobsScreen}
          options={{ title: 'Jobs Management' }}
        />
        <Stack.Screen 
          name="AdminApplications" 
          component={AdminApplicationsScreen}
          options={{ title: 'Applications Management' }}
        />
        <Stack.Screen 
          name="AdminRoleManagement" 
          component={AdminRoleManagementScreen}
          options={{ title: 'Role Management' }}
        />
        <Stack.Screen 
          name="AdminTeamLimits" 
          component={AdminTeamLimitsScreen}
          options={{ title: 'Team Limits' }}
        />
        <Stack.Screen 
          name="AdminBlogs" 
          component={AdminBlogsScreen}
          options={{ title: 'Blogs Management' }}
        />
        <Stack.Screen 
          name="AdminVerification" 
          component={AdminVerificationScreen}
          options={{ title: 'Verification' }}
        />
        <Stack.Screen 
          name="AdminKYC" 
          component={AdminKYCScreen}
          options={{ title: 'KYC Management' }}
        />
        <Stack.Screen 
          name="AdminSalesEnquiry" 
          component={AdminSalesEnquiryScreen}
          options={{ title: 'Sales Enquiry' }}
        />
        <Stack.Screen 
          name="AdminAnalytics" 
          component={AdminAnalyticsScreen}
          options={{ title: 'Analytics' }}
        />
        <Stack.Screen 
          name="AdminSettings" 
          component={AdminSettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen 
          name="AdminEmailTemplates" 
          component={AdminEmailTemplatesScreen}
          options={{ title: 'Email Templates' }}
        />
        <Stack.Screen 
          name="AdminSMTPSettings" 
          component={AdminSMTPSettingsScreen}
          options={{ title: 'SMTP Settings' }}
        />
        <Stack.Screen 
          name="AdminEmailLogs" 
          component={AdminEmailLogsScreen}
          options={{ title: 'Email Logs' }}
        />
        <Stack.Screen 
          name="AdminSocialUpdates" 
          component={AdminSocialUpdatesScreen}
          options={{ title: 'Social Updates' }}
        />
        <Stack.Screen 
          name="AdminPackageManagement" 
          component={AdminPackageManagementScreen}
          options={{ title: 'Package Management' }}
        />
        <Stack.Screen 
          name="AdminAdvertisementManagement" 
          component={AdminAdvertisementManagementScreen}
          options={{ title: 'Advertisement Management' }}
        />
        <Stack.Screen 
          name="AdminLiveChatSupport" 
          component={AdminLiveChatSupportScreen}
          options={{ title: 'Live Chat Support' }}
        />
        <Stack.Screen 
          name="AdminResumeSearch" 
          component={AdminResumeSearchScreen}
          options={{ title: 'Resume Search' }}
        />
        <Stack.Screen 
          name="AdminResumeManagement" 
          component={AdminResumeManagementScreen}
          options={{ title: 'Resume Management' }}
        />
        <Stack.Screen 
          name="AdminJobAlerts" 
          component={AdminJobAlertsScreen}
          options={{ title: 'Job Alerts' }}
        />
        <Stack.Screen 
          name="AdminHomepage" 
          component={AdminHomepageScreen}
          options={{ title: 'Homepage Management' }}
        />
        <Stack.Screen 
          name="AdminFreejobwalaChat" 
          component={AdminFreejobwalaChatScreen}
          options={{ title: 'Freejobwala Chat' }}
        />
        <Stack.Screen 
          name="AdminLogoManagement" 
          component={AdminLogoManagementScreen}
          options={{ title: 'Logo Management' }}
        />
        <Stack.Screen 
          name="AdminPostJob" 
          component={AdminPostJobScreen}
          options={{ title: 'Post Job' }}
        />
        
        {/* Admin Master Data Screens */}
        <Stack.Screen 
          name="AdminJobTitles" 
          component={AdminJobTitlesScreen}
          options={{ title: 'Job Titles' }}
        />
        <Stack.Screen 
          name="AdminKeySkills" 
          component={AdminKeySkillsScreen}
          options={{ title: 'Key Skills' }}
        />
        <Stack.Screen 
          name="AdminIndustries" 
          component={AdminIndustriesScreen}
          options={{ title: 'Industries' }}
        />
        <Stack.Screen 
          name="AdminDepartments" 
          component={AdminDepartmentsScreen}
          options={{ title: 'Departments' }}
        />
        <Stack.Screen 
          name="AdminCourses" 
          component={AdminCoursesScreen}
          options={{ title: 'Courses' }}
        />
        <Stack.Screen 
          name="AdminSpecializations" 
          component={AdminSpecializationsScreen}
          options={{ title: 'Specializations' }}
        />
        <Stack.Screen 
          name="AdminEducationFields" 
          component={AdminEducationFieldsScreen}
          options={{ title: 'Education Fields' }}
        />
        <Stack.Screen 
          name="AdminLocations" 
          component={AdminLocationsScreen}
          options={{ title: 'Locations' }}
        />
        
        {/* Profile Screens */}
        <Stack.Screen 
          name="UserProfile" 
          component={UserProfileScreen}
          options={{ title: 'My Profile' }}
        />
        <Stack.Screen 
          name="CompanyProfile" 
          component={CompanyProfileScreen}
          options={{ title: 'Company Profile' }}
        />
        <Stack.Screen 
          name="ResumeBuilder" 
          component={ResumeBuilderScreen}
          options={{ title: 'Resume Builder' }}
        />
        
        {/* Other Screens */}
        <Stack.Screen 
          name="Companies" 
          component={CompaniesScreen}
          options={{ title: 'Companies' }}
        />
        <Stack.Screen 
          name="CompanyDetails" 
          component={CompanyDetailsScreen}
          options={{ title: 'Company Details' }}
        />
        <Stack.Screen 
          name="Services" 
          component={ServicesScreen}
          options={{ title: 'Services' }}
        />
        <Stack.Screen 
          name="Blogs" 
          component={BlogsScreen}
          options={{ title: 'Blogs' }}
        />
        <Stack.Screen 
          name="BlogDetail" 
          component={BlogDetailScreen}
          options={{ title: 'Blog Post' }}
        />
        <Stack.Screen 
          name="CreateBlog" 
          component={CreateBlogScreen}
          options={{ title: 'Write Blog' }}
        />
        <Stack.Screen 
          name="SocialUpdates" 
          component={SocialUpdatesScreen}
          options={{ title: 'Social Updates' }}
        />
        <Stack.Screen 
          name="CreateSocialPost" 
          component={CreateSocialPostScreen}
          options={{ title: 'Create Social Post' }}
        />
        <Stack.Screen 
          name="Packages" 
          component={PackagesScreen}
          options={{ title: 'Packages' }}
        />
        <Stack.Screen 
          name="SavedJobs" 
          component={SavedJobsScreen}
          options={{ title: 'Saved Jobs' }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ title: 'Messages' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </View>
  );
};

export default AppNavigator;

