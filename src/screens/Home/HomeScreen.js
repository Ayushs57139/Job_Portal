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
import { keySkillsOptions } from '../../data/jobPostFormConfig';
import { DEPARTMENTS_DATA } from '../../data/departmentsData';
import { useResponsive } from '../../utils/responsive';

const isWeb = Platform.OS === 'web';

const HomeScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const isLargeDesktop = responsive.width > 1400;
  
  const [latestJobs, setLatestJobs] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [careerBlogs, setCareerBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [experience, setExperience] = useState('Select experience');
  const [loading, setLoading] = useState(true);
  const [showExperienceMenu, setShowExperienceMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showSearchMenu, setShowSearchMenu] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [companyFilter, setCompanyFilter] = useState('All industries');

  const experienceOptions = [
    'Fresher',
    '1 Month',
    '2 Months',
    '3 Months',
    '6 Months',
    '9 Months',
    '1 Year',
    '1.5 Years',
    '2 Years',
    '2.5 Years',
    '3 Years',
    '3.5 Years',
    '4 Years',
    '4.5 Years',
    '5 Years',
    '5.5 Years',
    '6 Years',
    '6.5 Years',
    '7 Years',
    '7.5 Years',
    '8 Years',
    '8.5 Years',
    '9 Years',
    '9.5 Years',
    '10 Years',
    '10.5 Years',
    '11 Years',
    '11.5 Years',
    '12 Years',
    '12.5 Years',
    '13 Years',
    '13.5 Years',
    '14 Years',
    '14.5 Years',
    '15 Years',
    '15.5 Years',
    '16 Years',
    '16.5 Years',
    '17 Years',
    '17.5 Years',
    '18 Years',
    '18.5 Years',
    '19 Years',
    '19.5 Years',
    '20 Years',
    '20.5 Years',
    '21 Years',
    '21.5 Years',
    '22 Years',
    '22.5 Years',
    '23 Years',
    '23.5 Years',
    '24 Years',
    '24.5 Years',
    '25 Years',
    '25.5 Years',
    '26 Years',
    '26.5 Years',
    '27 Years',
    '27.5 Years',
    '28 Years',
    '28.5 Years',
    '29 Years',
    '29.5 Years',
    '30 Years',
    '30.5 Years',
    '31 Years',
    '31.5 Years',
    '32 Years',
    '32.5 Years',
    '33 Years',
    '33.5 Years',
    '34 Years',
    '34.5 Years',
    '35 Years',
    '35.5 Years',
    '36 Years',
    '36 Years Plus',
  ];

  const locationOptions = [
    'Delhi, Delhi',
    'Mumbai, Maharashtra',
    'Bengaluru, Karnataka',
    'Hyderabad, Telangana',
    'Chennai, Tamil Nadu',
    'Pune, Maharashtra',
    'Kolkata, West Bengal',
    'Ahmedabad, Gujarat',
    'Jaipur, Rajasthan',
    'Noida, Uttar Pradesh',
    'Gurugram, Haryana',
    'Chandigarh, Punjab',
    'Indore, Madhya Pradesh',
    'Lucknow, Uttar Pradesh',
    'Surat, Gujarat',
  ];

  const skillOptions = keySkillsOptions.map(option => option.label);
  const departmentOptions = DEPARTMENTS_DATA.map(item => item.department);
  const searchOptions = [...skillOptions, ...departmentOptions];
  const filteredSearchOptions = searchOptions.filter(option =>
    option.toLowerCase().includes(searchFilter.toLowerCase())
  );

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Clear previous data
      setLatestJobs([]);
      setTopCompanies([]);
      setCareerBlogs([]);
      
      // Load latest jobs - fully dynamic from API
      const jobsResponse = await api.getJobs({ limit: 8, sort: '-createdAt' });
      let jobs = [];
      if (jobsResponse && jobsResponse.jobs) {
        jobs = jobsResponse.jobs;
      }
      
      // Add dummy jobs if needed to make it 8 total
      if (jobs.length < 8) {
        const dummyJobs = [
          {
            _id: 'dummy-job-1',
            title: 'Product Manager',
            company: { name: 'Tech Solutions Inc' },
            location: {
              city: 'Bangalore',
              state: 'Karnataka',
              locality: ''
            },
            salary: { min: 1500000, max: 2500000 },
            totalExperience: { min: '3 Years', max: '5 Years' },
            keySkills: ['Product Management', 'Agile', 'Scrum', 'Analytics'],
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'dummy-job-2',
            title: 'UI/UX Designer',
            company: { name: 'Creative Studio' },
            location: {
              city: 'Pune',
              state: 'Maharashtra',
              locality: ''
            },
            salary: { min: 800000, max: 1500000 },
            totalExperience: { min: '2 Years', max: '4 Years' },
            keySkills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
            createdAt: new Date().toISOString(),
          },
        ];
        
        // Add only the number of dummy jobs needed to reach 8
        const neededDummyJobs = 8 - jobs.length;
        jobs = [...jobs, ...dummyJobs.slice(0, neededDummyJobs)];
      }
      
      setLatestJobs(jobs);

      // Load top companies - fully dynamic from API
      const companiesResponse = await api.getCompanies({ limit: 6 });
      if (companiesResponse && companiesResponse.companies && companiesResponse.companies.length > 0) {
        // Use real data from backend only - no static data
        setTopCompanies(companiesResponse.companies);
      } else {
        setTopCompanies([]);
      }

      // Load career blogs - fully dynamic from API
      const blogsResponse = await api.getBlogs({ limit: 6 });
      if (blogsResponse && blogsResponse.blogs && blogsResponse.blogs.length > 0) {
        // Use real data from backend only - no static data
        setCareerBlogs(blogsResponse.blogs);
      } else {
        setCareerBlogs([]);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
      // On error, ensure all data is cleared
      setLatestJobs([]);
      setTopCompanies([]);
      setCareerBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const searchValue = selectedSkills.length > 0 ? selectedSkills.join(', ') : searchQuery;
    navigation.navigate('Jobs', {
      search: searchValue,
      location: locationQuery,
      experience: experience !== 'Select experience' ? experience : undefined,
    });
  };

  const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop, isLargeDesktop, responsive.width);

  const renderHeroSection = () => (
    <View style={dynamicStyles.hero}>
      <Text style={dynamicStyles.heroTitle}>Find your dream job now</Text>
      <Text style={dynamicStyles.heroSubtitle}>5 lakh+ jobs for you to explore</Text>

      {/* Search Container */}
      <View style={dynamicStyles.searchContainer}>
        <View style={dynamicStyles.searchRow}>
          {/* Skills/Designations Input */}
          <View style={dynamicStyles.experienceContainer}>
            <TouchableOpacity
              style={dynamicStyles.experienceDropdown}
              onPress={() => {
                setShowSearchMenu(!showSearchMenu);
                setShowExperienceMenu(false);
                setShowLocationMenu(false);
              }}
            >
              <Text
                style={[
                  dynamicStyles.experienceText,
                  selectedSkills.length === 0 && dynamicStyles.placeholderText,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedSkills.length > 0
                  ? selectedSkills.join(', ')
                  : (isPhone ? 'Enter skills / companies' : 'Enter skills / designations / companies')}
              </Text>
              <Ionicons name="search-outline" size={isPhone ? 18 : 20} color={colors.textSecondary} />
            </TouchableOpacity>

            {showSearchMenu && (
              <>
                <View style={dynamicStyles.experienceMenu}>
                  <View style={dynamicStyles.searchFilterInput}>
                    <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
                    <TextInput
                      style={dynamicStyles.searchFilterText}
                      placeholder="Search skills or departments"
                      placeholderTextColor={colors.textLight}
                      value={searchFilter}
                      onChangeText={setSearchFilter}
                      autoFocus={true}
                    />
                  </View>
                  <ScrollView
                    style={dynamicStyles.experienceMenuScroll}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                  >
                    {filteredSearchOptions.length > 0 ? (
                      filteredSearchOptions.map((option, index) => (
                        <TouchableOpacity
                          key={`${option}-${index}`}
                          style={[
                            dynamicStyles.experienceOption,
                            index === filteredSearchOptions.length - 1 && dynamicStyles.experienceOptionLast,
                            selectedSkills.includes(option) && dynamicStyles.experienceOptionActive,
                          ]}
                          onPress={() => {
                            setSelectedSkills((prev) => {
                              const exists = prev.includes(option);
                              if (exists) {
                                const updated = prev.filter(item => item !== option);
                                setSearchQuery(updated.join(', '));
                                return updated;
                              }
                              if (prev.length >= 12) return prev;
                              const updated = [...prev, option];
                              setSearchQuery(updated.join(', '));
                              return updated;
                            });
                            setSearchFilter('');
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              dynamicStyles.experienceOptionText,
                              selectedSkills.includes(option) && dynamicStyles.experienceOptionTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={dynamicStyles.noResultsContainer}>
                        <Text style={dynamicStyles.noResultsText}>No results found</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
                <TouchableOpacity
                  style={dynamicStyles.dropdownBackdrop}
                  activeOpacity={1}
                  onPress={() => {
                    setShowSearchMenu(false);
                    setSearchFilter('');
                  }}
                />
              </>
            )}
          </View>

          {/* Experience Dropdown */}
          <View style={dynamicStyles.experienceContainer}>
            <TouchableOpacity
              style={dynamicStyles.experienceDropdown}
              onPress={() => {
                setShowExperienceMenu(!showExperienceMenu);
                setShowLocationMenu(false);
              }}
            >
              <Text
                style={[
                  dynamicStyles.experienceText,
                  experience === 'Select experience' && dynamicStyles.placeholderText,
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
                <View style={dynamicStyles.experienceMenu}>
                  <ScrollView
                    style={dynamicStyles.experienceMenuScroll}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                  >
                    {experienceOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          dynamicStyles.experienceOption,
                          index === experienceOptions.length - 1 && dynamicStyles.experienceOptionLast,
                          experience === option && dynamicStyles.experienceOptionActive,
                        ]}
                        onPress={() => {
                          setExperience(option);
                          setShowExperienceMenu(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          dynamicStyles.experienceOptionText,
                          experience === option && dynamicStyles.experienceOptionTextActive,
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <TouchableOpacity
                  style={dynamicStyles.dropdownBackdrop}
                  activeOpacity={1}
                  onPress={() => setShowExperienceMenu(false)}
                />
              </>
            )}
          </View>

          {/* Location Input */}
          <View style={dynamicStyles.experienceContainer}>
            <TouchableOpacity
              style={dynamicStyles.experienceDropdown}
              onPress={() => {
                setShowLocationMenu(!showLocationMenu);
                setShowExperienceMenu(false);
              }}
            >
              <Text
                style={[
                  dynamicStyles.experienceText,
                  !locationQuery && dynamicStyles.placeholderText,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {locationQuery || 'Enter location'}
              </Text>
              <Ionicons name="chevron-down" size={isPhone ? 18 : 20} color={colors.textSecondary} />
            </TouchableOpacity>

            {showLocationMenu && (
              <>
                <View style={dynamicStyles.experienceMenu}>
                  <ScrollView
                    style={dynamicStyles.experienceMenuScroll}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                  >
                    {locationOptions.map((option, index) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          dynamicStyles.experienceOption,
                          index === locationOptions.length - 1 && dynamicStyles.experienceOptionLast,
                          locationQuery === option && dynamicStyles.experienceOptionActive,
                        ]}
                        onPress={() => {
                          setLocationQuery(option);
                          setShowLocationMenu(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                          dynamicStyles.experienceOptionText,
                          locationQuery === option && dynamicStyles.experienceOptionTextActive,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <TouchableOpacity
                  style={dynamicStyles.dropdownBackdrop}
                  activeOpacity={1}
                  onPress={() => setShowLocationMenu(false)}
                />
              </>
            )}
          </View>

          {/* Search Button */}
          <TouchableOpacity style={dynamicStyles.searchButton} onPress={handleSearch}>
            <Text style={dynamicStyles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Searches */}
        <View style={dynamicStyles.popularSearches}>
          <TouchableOpacity
            style={dynamicStyles.popularTag}
            onPress={() => {
              setSelectedSkills([]);
              setSearchQuery('business development, delhi');
            }}
          >
            <Text style={dynamicStyles.popularTagText} numberOfLines={isPhone ? 1 : undefined} ellipsizeMode="tail">business development, delhi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={dynamicStyles.popularTag}
            onPress={() => {
              setSelectedSkills([]);
              setSearchQuery('software developer, noida');
            }}
          >
            <Text style={dynamicStyles.popularTagText} numberOfLines={isPhone ? 1 : undefined} ellipsizeMode="tail">software developer, noida</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={dynamicStyles.popularTag}
            onPress={() => {
              setSelectedSkills([]);
              setSearchQuery('web development, delhi');
            }}
          >
            <Text style={dynamicStyles.popularTagText} numberOfLines={isPhone ? 1 : undefined} ellipsizeMode="tail">web development, delhi</Text>
          </TouchableOpacity>
        </View>

        {/* Job Alert Button */}
        <View style={dynamicStyles.jobAlertContainer}>
          <TouchableOpacity
            style={dynamicStyles.jobAlertButton}
            onPress={() => navigation.navigate('JobAlertForm')}
          >
            <Ionicons name="notifications" size={isPhone ? 18 : 20} color={colors.textWhite} />
            <Text style={dynamicStyles.jobAlertButtonText}>Job Alert</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.jobAlertSubtext}>
            Get notified about new job opportunities matching your preferences
          </Text>
        </View>
      </View>
    </View>
  );

  const renderLatestJobs = () => (
    <View style={dynamicStyles.section}>
      <View style={dynamicStyles.sectionHeader}>
        <View>
          <Text style={dynamicStyles.sectionTitle}>Latest Jobs to Apply</Text>
          <Text style={dynamicStyles.sectionSubtitle}>
            Discover the newest opportunities from top companies
          </Text>
        </View>
      </View>

      {loading ? (
        <Text style={dynamicStyles.loadingText}>Loading jobs...</Text>
      ) : latestJobs.length > 0 ? (
        <View style={dynamicStyles.jobsGrid}>
          {latestJobs.map((job) => (
            <View key={job._id} style={dynamicStyles.jobCardWrapper}>
              <JobCard job={job} />
            </View>
          ))}
        </View>
      ) : (
        <Text style={dynamicStyles.emptyText}>No jobs available at the moment</Text>
      )}
    </View>
  );

  const getFilteredCompanies = () => {
    if (companyFilter === 'Top rated') {
      return topCompanies.filter((company) => {
        const rating = company.rating || company.profile?.company?.rating || 0;
        return rating >= 4;
      });
    }
    if (companyFilter === 'Actively hiring') {
      return topCompanies.filter((company) => (company.openPositions || 0) > 0);
    }
    return topCompanies;
  };

  const renderTopCompanies = () => {
    const filteredCompanies = getFilteredCompanies();

    return (
    <View style={[dynamicStyles.section, dynamicStyles.companySection]}>
      <View style={dynamicStyles.sectionHeader}>
        <View>
          <Text style={dynamicStyles.sectionTitle}>Top Companies Hiring Right Now</Text>
          <Text style={dynamicStyles.sectionSubtitle}>
            Join thousands of professionals at leading companies
          </Text>
        </View>
      </View>

      <View style={dynamicStyles.companyStatsRow}>
        <View style={dynamicStyles.companyStatCard}>
          <Text style={dynamicStyles.companyStatValue}>{topCompanies.length || 0}</Text>
          <Text style={dynamicStyles.companyStatLabel}>Featured partners</Text>
        </View>
        <View style={dynamicStyles.companyStatCard}>
          <Text style={dynamicStyles.companyStatValue}>500+</Text>
          <Text style={dynamicStyles.companyStatLabel}>Live openings</Text>
        </View>
        <View style={dynamicStyles.companyStatCard}>
          <Text style={dynamicStyles.companyStatValue}>4.7/5</Text>
          <Text style={dynamicStyles.companyStatLabel}>Avg. rating</Text>
        </View>
      </View>

      <View style={dynamicStyles.companyFilterRow}>
        {['All industries', 'Top rated', 'Actively hiring'].map((filter) => {
          const isActive = companyFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[
                dynamicStyles.companyFilterChip,
                isActive && dynamicStyles.companyFilterChipActive,
              ]}
              onPress={() => setCompanyFilter(filter)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  dynamicStyles.companyFilterText,
                  isActive && dynamicStyles.companyFilterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <Text style={dynamicStyles.loadingText}>Loading companies...</Text>
      ) : filteredCompanies.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.companyCarousel}
        >
          {filteredCompanies.map((company) => (
            <CompanyCard key={company._id} company={company} />
          ))}
        </ScrollView>
      ) : (
        <Text style={dynamicStyles.emptyText}>No companies available</Text>
      )}
    </View>
  );
  };

  const renderCareerInsights = () => (
    <View style={dynamicStyles.section}>
      <View style={dynamicStyles.sectionHeader}>
        <View>
          <Text style={dynamicStyles.sectionTitle}>Career Insights & Tips</Text>
          <Text style={dynamicStyles.sectionSubtitle}>
            Stay updated with the latest career advice and industry trends
          </Text>
        </View>
      </View>

      {loading ? (
        <Text style={dynamicStyles.loadingText}>Loading blogs...</Text>
      ) : careerBlogs.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.horizontalScroll}
        >
          {careerBlogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </ScrollView>
      ) : (
        <Text style={dynamicStyles.emptyText}>No blogs available</Text>
      )}
    </View>
  );

  const renderResumeCTA = () => (
    <View style={dynamicStyles.resumeSection}>
      <View style={dynamicStyles.resumeCTA}>
        <Text style={dynamicStyles.resumeTitle}>Need help with your resume?</Text>
        <Text style={dynamicStyles.resumeSubtitle}>
          Get professional assistance to create a standout resume
        </Text>
        <TouchableOpacity
          style={dynamicStyles.resumeButton}
          onPress={() => navigation.navigate('ResumeBuilder')}
        >
          <Ionicons name="document-text" size={20} color={colors.textWhite} />
          <Text style={dynamicStyles.resumeButtonText}>Build Resume</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={dynamicStyles.container}>
      <Header />
      
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
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
          containerStyle={dynamicStyles.adContainer}
        />
        
        {renderLatestJobs()}
        
        {/* Advertisement - Middle Content */}
        <AdvertisementWidget 
          position="content-middle" 
          page="home"
          containerStyle={dynamicStyles.adContainer}
        />
        
        {renderTopCompanies()}
        
        {/* Advertisement - Middle Content 2 */}
        <AdvertisementWidget 
          position="content-middle" 
          page="home"
          containerStyle={dynamicStyles.adContainer}
        />
        
        {/* Trending Job Roles Section */}
        <TrendingJobRoles navigation={navigation} />
        
        {renderCareerInsights()}
        
        {/* Advertisement - Bottom Content */}
        <AdvertisementWidget 
          position="content-bottom" 
          page="home"
          containerStyle={dynamicStyles.adContainer}
        />
        
        {renderResumeCTA()}
        <Footer />
      </ScrollView>
    </View>
  );
};

const getStyles = (isPhone, isMobile, isTablet, isDesktop, isLargeDesktop, width) => StyleSheet.create({
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
  searchFilterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: isPhone ? spacing.md : spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchFilterText: {
    flex: 1,
    ...typography.body1,
    fontSize: isPhone ? 14 : typography.body1.fontSize,
    color: colors.text,
    outlineStyle: 'none',
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
  noResultsContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    ...typography.body2,
    color: colors.textSecondary,
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
           isDesktop ? '23.5%' : 
           '100%',
    flexBasis: isDesktop ? '23.5%' : undefined,
    flexGrow: 0,
    flexShrink: 0,
    maxWidth: isDesktop ? 'none' : undefined,
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
  companySection: {
    backgroundColor: isWeb ? '#F8FAFF' : colors.cardBackground,
    borderRadius: isPhone ? borderRadius.lg : borderRadius.xl,
    ...(isWeb && {
      boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
    }),
  },
  companyStatsRow: {
    flexDirection: isPhone ? 'column' : 'row',
    gap: isPhone ? spacing.sm : spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  companyStatCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E4E7FB',
    ...(isWeb && {
      backdropFilter: 'blur(8px)',
    }),
  },
  companyStatValue: {
    fontSize: isPhone ? 20 : 26,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: spacing.xs,
  },
  companyStatLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  companyFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  companyFilterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E4E7FB',
    backgroundColor: colors.cardBackground,
  },
  companyFilterChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  companyFilterText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  companyFilterTextActive: {
    color: '#4338CA',
  },
  companyCarousel: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
});

export default HomeScreen;
