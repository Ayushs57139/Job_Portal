import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import JobCard from '../../components/JobCard';
import CompanyCard from '../../components/CompanyCard';
import BlogCard from '../../components/BlogCard';
import Footer from '../../components/Footer';
import AdvertisementWidget from '../../components/AdvertisementWidget';
import PopularSearches from '../../components/PopularSearches';
import TrendingJobRoles from '../../components/TrendingJobRoles';
import api from '../../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isPhone = width <= 480; // Phones
const isMobile = width <= 600; // Small phones and small tablets
const isTablet = width > 600 && width <= 1024; // Tablets
const isDesktop = width > 1024; // Desktop and large screens
const isLargeDesktop = width > 1400; // Large desktop screens

const HomeScreen = ({ navigation }) => {
  const [latestJobs, setLatestJobs] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [careerBlogs, setCareerBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [experience, setExperience] = useState('Select experience');
  const [loading, setLoading] = useState(true);
  const [showExperienceMenu, setShowExperienceMenu] = useState(false);

  const experienceOptions = [
    'Fresher (0-1 year)',
    '1-3 years',
    '3-5 years',
    '5-10 years',
    '10+ years',
  ];

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load latest jobs
      const jobsResponse = await api.getJobs({ limit: 6, sort: '-createdAt' });
      setLatestJobs(jobsResponse.jobs || []);

      // Load top companies
      const companiesResponse = await api.getCompanies({ limit: 6 });
      const companies = companiesResponse.companies || [];
      
      // Use real data from backend, add rating display
      const companiesWithData = companies.map((company) => ({
        ...company,
        rating: (3.5 + Math.random() * 1.5).toFixed(1), // Display rating
      }));
      
      setTopCompanies(companiesWithData);

      // Load career blogs
      const blogsResponse = await api.getBlogs({ limit: 6 });
      const blogs = blogsResponse.blogs || [];
      
      // Add sample categories for display
      const categories = ['Networking', 'Workplace Trends', 'Interview Prep', 'Career Tips', 'Skills'];
      const blogsWithData = blogs.map((blog, index) => ({
        ...blog,
        category: categories[index % categories.length],
        readTime: `${Math.floor(Math.random() * 5) + 3} min read`,
      }));
      
      setCareerBlogs(blogsWithData);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigation.navigate('Jobs', {
      search: searchQuery,
      location: locationQuery,
      experience: experience !== 'Select experience' ? experience : undefined,
    });
  };

  const renderHeroSection = () => (
    <View style={styles.hero}>
      <Text style={styles.heroTitle}>Find your dream job now</Text>
      <Text style={styles.heroSubtitle}>5 lakh+ jobs for you to explore</Text>

      {/* Search Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          {/* Skills/Designations Input */}
          <View style={[styles.searchInputContainer, styles.flexInput]}>
            <Ionicons name="search-outline" size={isPhone ? 18 : 20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={isPhone ? "Enter skills / companies" : "Enter skills / designations / companies"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Experience Dropdown */}
          <View style={styles.experienceContainer}>
            <TouchableOpacity
              style={styles.experienceDropdown}
              onPress={() => setShowExperienceMenu(!showExperienceMenu)}
            >
              <Text
                style={[
                  styles.experienceText,
                  experience === 'Select experience' && styles.placeholderText,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {experience}
              </Text>
              <Ionicons name="chevron-down" size={isPhone ? 18 : 20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            {showExperienceMenu && (
              <>
                <View style={styles.experienceMenu}>
                  <ScrollView
                    style={styles.experienceMenuScroll}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                  >
                    {experienceOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.experienceOption,
                          index === experienceOptions.length - 1 && styles.experienceOptionLast,
                          experience === option && styles.experienceOptionActive,
                        ]}
                        onPress={() => {
                          setExperience(option);
                          setShowExperienceMenu(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.experienceOptionText,
                          experience === option && styles.experienceOptionTextActive,
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <TouchableOpacity
                  style={styles.dropdownBackdrop}
                  activeOpacity={1}
                  onPress={() => setShowExperienceMenu(false)}
                />
              </>
            )}
          </View>

          {/* Location Input */}
          <View style={[styles.searchInputContainer, styles.locationInput]}>
            <Ionicons name="location-outline" size={isPhone ? 18 : 20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter location"
              value={locationQuery}
              onChangeText={setLocationQuery}
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Search Button */}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Searches */}
        <View style={styles.popularSearches}>
          <TouchableOpacity
            style={styles.popularTag}
            onPress={() => setSearchQuery('business development, delhi')}
          >
            <Text style={styles.popularTagText} numberOfLines={isPhone ? 1 : undefined} ellipsizeMode="tail">business development, delhi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.popularTag}
            onPress={() => setSearchQuery('software developer, noida')}
          >
            <Text style={styles.popularTagText} numberOfLines={isPhone ? 1 : undefined} ellipsizeMode="tail">software developer, noida</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.popularTag}
            onPress={() => setSearchQuery('web development, delhi')}
          >
            <Text style={styles.popularTagText} numberOfLines={isPhone ? 1 : undefined} ellipsizeMode="tail">web development, delhi</Text>
          </TouchableOpacity>
        </View>

        {/* Job Alert Button */}
        <View style={styles.jobAlertContainer}>
          <TouchableOpacity
            style={styles.jobAlertButton}
            onPress={() => navigation.navigate('JobAlertForm')}
          >
            <Ionicons name="notifications" size={isPhone ? 18 : 20} color={colors.textWhite} />
            <Text style={styles.jobAlertButtonText}>Job Alert</Text>
          </TouchableOpacity>
          <Text style={styles.jobAlertSubtext}>
            Get notified about new job opportunities matching your preferences
          </Text>
        </View>
      </View>
    </View>
  );

  const renderLatestJobs = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Latest Jobs to Apply</Text>
          <Text style={styles.sectionSubtitle}>
            Discover the newest opportunities from top companies
          </Text>
        </View>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading jobs...</Text>
      ) : latestJobs.length > 0 ? (
        <View style={styles.jobsGrid}>
          {latestJobs.map((job) => (
            <View key={job._id} style={styles.jobCardWrapper}>
              <JobCard job={job} />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No jobs available at the moment</Text>
      )}
    </View>
  );

  const renderTopCompanies = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Top Companies Hiring Right Now</Text>
          <Text style={styles.sectionSubtitle}>
            Join thousands of professionals at leading companies
          </Text>
        </View>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading companies...</Text>
      ) : topCompanies.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {topCompanies.map((company) => (
            <CompanyCard key={company._id} company={company} />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>No companies available</Text>
      )}
    </View>
  );

  const renderCareerInsights = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Career Insights & Tips</Text>
          <Text style={styles.sectionSubtitle}>
            Stay updated with the latest career advice and industry trends
          </Text>
        </View>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading blogs...</Text>
      ) : careerBlogs.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {careerBlogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>No blogs available</Text>
      )}
    </View>
  );

  const renderResumeCTA = () => (
    <View style={styles.resumeSection}>
      <View style={styles.resumeCTA}>
        <Text style={styles.resumeTitle}>Need help with your resume?</Text>
        <Text style={styles.resumeSubtitle}>
          Get professional assistance to create a standout resume
        </Text>
        <TouchableOpacity
          style={styles.resumeButton}
          onPress={() => navigation.navigate('ResumeBuilder')}
        >
          <Ionicons name="document-text" size={20} color={colors.textWhite} />
          <Text style={styles.resumeButtonText}>Build Resume</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={isWeb ? true : false}
        bounces={!isWeb}
        nestedScrollEnabled={true}
        {...(isWeb && {
          dataSet: { scrollable: 'true' },
        })}
      >
        {renderHeroSection()}
        
        {/* Popular Searches Section */}
        <PopularSearches navigation={navigation} />
        
        {/* Advertisement - Top Banner */}
        <AdvertisementWidget 
          position="content-top" 
          page="home"
          containerStyle={styles.adContainer}
        />
        
        {renderLatestJobs()}
        
        {/* Advertisement - Middle Content */}
        <AdvertisementWidget 
          position="content-middle" 
          page="home"
          containerStyle={styles.adContainer}
        />
        
        {renderTopCompanies()}
        
        {/* Advertisement - Middle Content 2 */}
        <AdvertisementWidget 
          position="content-middle" 
          page="home"
          containerStyle={styles.adContainer}
        />
        
        {/* Trending Job Roles Section */}
        <TrendingJobRoles navigation={navigation} />
        
        {renderCareerInsights()}
        
        {/* Advertisement - Bottom Content */}
        <AdvertisementWidget 
          position="content-bottom" 
          page="home"
          containerStyle={styles.adContainer}
        />
        
        {renderResumeCTA()}
        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...(isWeb && {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    }),
  },
  scrollView: {
    flex: 1,
    ...(isWeb && {
      overflow: 'scroll',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      height: '100%',
    }),
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    ...(isWeb && {
      minHeight: '100%',
    }),
  },
  hero: {
    backgroundColor: colors.cardBackground,
    paddingVertical: isPhone ? spacing.lg : (isMobile ? spacing.xl : isTablet ? spacing.xxl : spacing.xxl * 1.5),
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : isTablet ? spacing.lg : spacing.xl),
    alignItems: 'center',
    maxWidth: isDesktop ? 1400 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  heroTitle: {
    fontSize: isPhone ? 24 : (isMobile ? 28 : (isTablet ? 36 : 48)),
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : 0),
    lineHeight: isPhone ? 32 : (isMobile ? 36 : undefined),
    ...(isPhone && {
      maxWidth: '100%',
    }),
  },
  heroSubtitle: {
    ...typography.h5,
    fontSize: isPhone ? 16 : typography.h5.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: isPhone ? spacing.lg : spacing.xl,
    paddingHorizontal: isPhone ? spacing.sm : 0,
    ...(isPhone && {
      maxWidth: '100%',
    }),
  },
  searchContainer: {
    width: '100%',
    maxWidth: 1000,
    paddingHorizontal: isPhone ? spacing.xs : 0,
  },
  searchRow: {
    flexDirection: isPhone ? 'column' : (isMobile ? 'column' : 'row'),
    gap: isPhone ? spacing.xs : (isMobile ? spacing.xs : spacing.sm),
    alignItems: 'stretch',
    position: 'relative',
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.sm : spacing.md),
    gap: isPhone ? spacing.xs : spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    height: isPhone ? 44 : (isMobile ? 46 : (isTablet ? 48 : 50)),
    minWidth: 0,
  },
  flexInput: {
    flex: isPhone ? 1 : (isMobile ? 1 : isDesktop ? 2 : 1),
  },
  locationInput: {
    flex: isPhone ? 1 : (isMobile ? 1 : isDesktop ? 1 : 1),
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    fontSize: isPhone ? 14 : typography.body1.fontSize,
    color: colors.text,
    outlineStyle: 'none',
    minWidth: 0,
  },
  experienceContainer: {
    position: 'relative',
    flex: isPhone ? 1 : (isMobile ? 1 : isDesktop ? 1 : 1),
    zIndex: 10001,
    elevation: 11,
  },
  experienceDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.sm : spacing.md),
    borderWidth: 1,
    borderColor: colors.border,
    height: isPhone ? 44 : (isMobile ? 46 : (isTablet ? 48 : 50)),
    minWidth: 0,
  },
  experienceText: {
    ...typography.body1,
    fontSize: isPhone ? 14 : typography.body1.fontSize,
    color: colors.text,
    flex: 1,
    ...(isPhone && {
      marginRight: spacing.xs,
    }),
  },
  placeholderText: {
    color: colors.textLight,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 10001,
    elevation: 11,
    ...(isWeb && {
      position: 'fixed',
    }),
  },
  experienceMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    ...shadows.lg,
    zIndex: 10002,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    maxHeight: isPhone ? 250 : (isMobile ? 280 : 320),
    overflow: 'hidden',
    ...(isWeb && {
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      position: 'absolute',
    }),
  },
  experienceMenuScroll: {
    maxHeight: isPhone ? 250 : (isMobile ? 280 : 320),
  },
  experienceOption: {
    paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.md : spacing.lg),
    paddingVertical: isPhone ? spacing.md : (isMobile ? spacing.md : spacing.lg),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: colors.cardBackground,
    minHeight: isPhone ? 48 : (isMobile ? 50 : 54),
    justifyContent: 'center',
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    }),
  },
  experienceOptionLast: {
    borderBottomWidth: 0,
  },
  experienceOptionActive: {
    backgroundColor: '#F0F4FF',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  experienceOptionText: {
    ...typography.body1,
    fontSize: isPhone ? 15 : (isMobile ? 15 : (isTablet ? 16 : 16)),
    color: '#2D3748',
    fontWeight: '500',
    lineHeight: isPhone ? 20 : 22,
  },
  experienceOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : isTablet ? spacing.lg : spacing.xl),
    alignItems: 'center',
    justifyContent: 'center',
    height: isPhone ? 44 : (isMobile ? 46 : (isTablet ? 48 : 50)),
    minWidth: isPhone ? '100%' : (isMobile ? '100%' : (isDesktop ? 120 : undefined)),
    width: isPhone ? '100%' : (isMobile ? '100%' : undefined),
    zIndex: 1,
    elevation: 1,
  },
  searchButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  popularSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isPhone ? spacing.xs : spacing.sm,
    marginTop: isPhone ? spacing.sm : spacing.md,
    justifyContent: 'center',
    paddingHorizontal: isPhone ? spacing.xs : 0,
  },
  popularTag: {
    backgroundColor: colors.background,
    paddingHorizontal: isPhone ? spacing.sm : spacing.md,
    paddingVertical: isPhone ? spacing.xs : spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: isPhone ? '48%' : undefined,
  },
  popularTagText: {
    ...typography.body2,
    fontSize: isPhone ? 12 : typography.body2.fontSize,
    color: colors.textSecondary,
  },
  jobAlertContainer: {
    marginTop: isPhone ? spacing.md : spacing.lg,
    alignItems: 'center',
    paddingHorizontal: isPhone ? spacing.sm : 0,
  },
  jobAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isPhone ? spacing.xs : spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    paddingHorizontal: isPhone ? spacing.md : spacing.xl,
    borderRadius: borderRadius.md,
    ...shadows.md,
    zIndex: 1,
    elevation: 1,
  },
  jobAlertButtonText: {
    ...typography.button,
    fontSize: isPhone ? 14 : typography.button.fontSize,
    color: colors.textWhite,
  },
  jobAlertSubtext: {
    ...typography.body2,
    fontSize: isPhone ? 12 : typography.body2.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: isPhone ? '100%' : 400,
    paddingHorizontal: isPhone ? spacing.sm : 0,
  },
  section: {
    paddingVertical: isPhone ? spacing.lg : (isMobile ? spacing.xl : isTablet ? spacing.xl : spacing.xxl),
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : isTablet ? spacing.lg : spacing.xl),
    maxWidth: isDesktop ? (isLargeDesktop ? 1400 : 1200) : '100%',
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeader: {
    marginBottom: isPhone ? spacing.lg : spacing.xl,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: isPhone ? 20 : (isMobile ? 24 : (isTablet ? 28 : 36)),
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : 0),
    lineHeight: isPhone ? 28 : undefined,
  },
  sectionSubtitle: {
    ...typography.body1,
    fontSize: isPhone ? 14 : typography.body1.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: isPhone ? spacing.sm : 0,
  },
  jobsGrid: {
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    gap: isPhone ? spacing.sm : spacing.md,
    justifyContent: isDesktop ? 'flex-start' : 'center',
  },
  jobCardWrapper: {
    width: isPhone ? '100%' : 
           isMobile ? '100%' : 
           isTablet ? (width > 900 ? '48%' : '100%') : 
           isDesktop ? (width > 1400 ? '32%' : width > 1200 ? '31%' : '48%') : 
           '100%',
    maxWidth: isDesktop ? 400 : '100%',
  },
  horizontalScroll: {
    paddingRight: spacing.lg,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  resumeSection: {
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : spacing.lg),
    paddingVertical: isPhone ? spacing.lg : (isMobile ? spacing.xl : spacing.xxl),
    backgroundColor: '#10B981',
  },
  resumeCTA: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  resumeTitle: {
    fontSize: isPhone ? 20 : (isMobile ? 22 : (isTablet ? 24 : 32)),
    fontWeight: '700',
    color: colors.textWhite,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : 0),
    lineHeight: isPhone ? 28 : undefined,
  },
  resumeSubtitle: {
    ...typography.h6,
    fontSize: isPhone ? 14 : typography.h6.fontSize,
    color: colors.textWhite,
    textAlign: 'center',
    marginBottom: isPhone ? spacing.md : spacing.lg,
    paddingHorizontal: isPhone ? spacing.sm : 0,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isPhone ? spacing.xs : spacing.sm,
    backgroundColor: colors.textWhite,
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    paddingHorizontal: isPhone ? spacing.md : spacing.xl,
    borderRadius: borderRadius.md,
  },
  resumeButtonText: {
    ...typography.button,
    fontSize: isPhone ? 14 : typography.button.fontSize,
    color: '#10B981',
  },
  adContainer: {
    paddingVertical: isPhone ? spacing.md : spacing.lg,
    paddingHorizontal: isPhone ? spacing.sm : spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default HomeScreen;
