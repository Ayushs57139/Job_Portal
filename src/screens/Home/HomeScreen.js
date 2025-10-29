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
import api from '../../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

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
      
      // Add sample data for display
      const companiesWithData = companies.map((company, index) => ({
        ...company,
        openPositions: Math.floor(Math.random() * 5) + 1,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
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
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter skills / designations / companies"
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
              >
                {experience}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            {showExperienceMenu && (
              <View style={styles.experienceMenu}>
                {experienceOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.experienceOption}
                    onPress={() => {
                      setExperience(option);
                      setShowExperienceMenu(false);
                    }}
                  >
                    <Text style={styles.experienceOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Location Input */}
          <View style={[styles.searchInputContainer, styles.locationInput]}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
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
            <Text style={styles.popularTagText}>business development, delhi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.popularTag}
            onPress={() => setSearchQuery('software developer, noida')}
          >
            <Text style={styles.popularTagText}>software developer, noida</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.popularTag}
            onPress={() => setSearchQuery('web development, delhi')}
          >
            <Text style={styles.popularTagText}>web development, delhi</Text>
          </TouchableOpacity>
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
        {renderLatestJobs()}
        {renderTopCompanies()}
        {renderCareerInsights()}
        {renderResumeCTA()}
        <Footer />
      </ScrollView>

      {/* Floating Chat Button */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate('Chat')}
      >
        <View style={styles.chatBadge}>
          <Text style={styles.chatBadgeText}>1</Text>
        </View>
        <Ionicons name="chatbubbles" size={28} color={colors.textWhite} />
      </TouchableOpacity>
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
    paddingVertical: spacing.xxl * 1.5,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: isWeb ? 48 : 36,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.h5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  searchContainer: {
    width: '100%',
    maxWidth: 1000,
  },
  searchRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
  },
  flexInput: {
    flex: isWeb ? 2 : 1,
  },
  locationInput: {
    flex: isWeb ? 1 : 1,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
    outlineStyle: 'none',
  },
  experienceContainer: {
    position: 'relative',
    flex: isWeb ? 1 : 1,
  },
  experienceDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
  },
  experienceText: {
    ...typography.body1,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textLight,
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
    zIndex: 1000,
    borderWidth: 1,
    borderColor: colors.border,
  },
  experienceOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  experienceOptionText: {
    ...typography.body1,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    minWidth: isWeb ? 120 : undefined,
  },
  searchButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  popularSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  popularTag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  popularTagText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  section: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeader: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: isWeb ? 36 : 28,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  jobsGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  jobCardWrapper: {
    width: isWeb ? (width > 1200 ? '32%' : width > 768 ? '48%' : '100%') : '100%',
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    backgroundColor: '#10B981',
  },
  resumeCTA: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  resumeTitle: {
    fontSize: isWeb ? 32 : 24,
    fontWeight: '700',
    color: colors.textWhite,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  resumeSubtitle: {
    ...typography.h6,
    color: colors.textWhite,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.textWhite,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  resumeButtonText: {
    ...typography.button,
    color: '#10B981',
  },
  chatButton: {
    position: isWeb ? 'fixed' : 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  chatBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  chatBadgeText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default HomeScreen;
