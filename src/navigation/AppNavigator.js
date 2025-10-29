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
import AdminDashboardScreen from '../screens/Dashboard/AdminDashboardScreen';

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
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboardScreen}
          options={{ title: 'Admin Dashboard' }}
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

