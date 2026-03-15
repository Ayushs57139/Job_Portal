import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  FlatList,
  Modal,
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
import JobAlertFormScreen from '../Jobs/JobAlertFormScreen';
import api from '../../config/api';
import { keySkillsOptions } from '../../data/jobPostFormConfig';
import { DEPARTMENTS_DATA } from '../../data/departmentsData';
import { useResponsive } from '../../utils/responsive';

// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';

const HomeScreen = ({ navigation }) => {
  const responsive = useResponsive();
  
  // Enhanced device detection
  const { width } = responsive;
  const isXsPhone = width <= 320;
  const isSmallPhone = width > 320 && width <= 375;
  const isPhone = width > 375 && width <= 414;
  const isLargePhone = width > 414 && width <= 480;
  const isMobile = width <= 480;
  const isSmallTablet = width > 480 && width <= 600;
  const isTablet = width > 600 && width <= 768;
  const isLargeTablet = width > 768 && width <= 834;
  const isTabletDevice = width > 480 && width <= 834;
  const isSmallLaptop = width > 834 && width <= 1024;
  const isLaptop = width > 1024 && width <= 1200;
  const isDesktop = width > 1200 && width <= 1440;
  const isLargeDesktop = width > 1440;
  const isDesktopDevice = width > 834;
  
  const [latestJobs, setLatestJobs] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [careerBlogs, setCareerBlogs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [homeFaqs, setHomeFaqs] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);
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
  const [showJobAlertModal, setShowJobAlertModal] = useState(false);

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

  const searchOptions = useMemo(() => {
    const skills = keySkillsOptions.map(option => option.label);
    const departments = DEPARTMENTS_DATA.map(item => item.department);
    return [...skills, ...departments];
  }, []);

  const filteredSearchOptions = useMemo(() => (
    searchOptions.filter(option =>
      option.toLowerCase().includes(searchFilter.toLowerCase())
    )
  ), [searchOptions, searchFilter]);

  useEffect(() => {
    loadHomeData();
  }, []);

  // Load FAQs independently so they always show even if loadHomeData partially fails
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const baseURL = api.baseURL;
        const res = await fetch(`${baseURL}/faqs?limit=8`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setHomeFaqs(data.data.slice(0, 8));
        }
      } catch (e) {
        console.warn('FAQ load error:', e.message);
      }
    };
    loadFAQs();
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

      // Load upcoming job events - fully dynamic from API
      try {
        const eventsResponse = await fetch(`${api.baseURL}/job-events/public?limit=6&status=active`);
        const eventsData = await eventsResponse.json();
        if (eventsData.success && eventsData.data.events && eventsData.data.events.length > 0) {
          setUpcomingEvents(eventsData.data.events);
        } else {
          setUpcomingEvents([]);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setUpcomingEvents([]);
      }

      // Load FAQs for home page - fully dynamic from API
      try {
        const faqsResponse = await fetch(`${api.baseURL}/faqs?limit=8`);
        const faqsData = await faqsResponse.json();
        if (faqsData.success && faqsData.data && faqsData.data.length > 0) {
          setHomeFaqs(faqsData.data.slice(0, 8));
        } else {
          setHomeFaqs([]);
        }
      } catch (error) {
        console.error('Error loading FAQs:', error);
        setHomeFaqs([]);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
      // On error, ensure all data is cleared
      setLatestJobs([]);
      setTopCompanies([]);
      setCareerBlogs([]);
      setUpcomingEvents([]);
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

  const dynamicStyles = getStyles(
    isXsPhone, isSmallPhone, isPhone, isLargePhone, isMobile,
    isSmallTablet, isTablet, isLargeTablet, isTabletDevice,
    isSmallLaptop, isLaptop, isDesktop, isLargeDesktop, isDesktopDevice, width
  );

  const renderHeroSection = () => (
    <View style={dynamicStyles.hero}>
      <View style={dynamicStyles.heroBadge}>
        <Ionicons name="flash" size={13} color={colors.primary} />
        <Text style={dynamicStyles.heroBadgeText}>India's #1 Free Job Portal</Text>
      </View>
      <Text style={dynamicStyles.heroTitle}>Find Your{'\n'}Dream Job Now</Text>
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
                    contentContainerStyle={dynamicStyles.optionsListContent}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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
                  <FlatList
                    data={experienceOptions}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    style={dynamicStyles.experienceMenuScroll}
                    contentContainerStyle={dynamicStyles.optionsListContent}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={25}
                    maxToRenderPerBatch={20}
                    windowSize={6}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item: option, index }) => (
                      <TouchableOpacity
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
                    )}
                  />
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
                  <FlatList
                    data={locationOptions}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    style={dynamicStyles.experienceMenuScroll}
                    contentContainerStyle={dynamicStyles.optionsListContent}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={20}
                    maxToRenderPerBatch={20}
                    windowSize={5}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item: option, index }) => (
                      <TouchableOpacity
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
                    )}
                  />
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
            onPress={() => setShowJobAlertModal(true)}
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
        <View style={dynamicStyles.sectionTitleWrap}>
          <View style={dynamicStyles.sectionAccent} />
          <View>
            <Text style={dynamicStyles.sectionTitle}>Latest Jobs</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Newest opportunities from top companies</Text>
          </View>
        </View>
        <TouchableOpacity style={dynamicStyles.viewAllButton} onPress={() => navigation.navigate('Jobs')}>
          <Text style={dynamicStyles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
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
        <View style={dynamicStyles.sectionTitleWrap}>
          <View style={dynamicStyles.sectionAccent} />
          <View>
            <Text style={dynamicStyles.sectionTitle}>Top Companies Hiring</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Join leading companies across India</Text>
          </View>
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
              style={[dynamicStyles.companyFilterChip, isActive && dynamicStyles.companyFilterChipActive]}
              onPress={() => setCompanyFilter(filter)}
              activeOpacity={0.8}
            >
              <Text style={[dynamicStyles.companyFilterText, isActive && dynamicStyles.companyFilterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <Text style={dynamicStyles.loadingText}>Loading companies...</Text>
      ) : filteredCompanies.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dynamicStyles.companyCarousel}>
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
        <View style={dynamicStyles.sectionTitleWrap}>
          <View style={dynamicStyles.sectionAccent} />
          <View>
            <Text style={dynamicStyles.sectionTitle}>Career Insights</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Latest career advice and industry trends</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <Text style={dynamicStyles.loadingText}>Loading blogs...</Text>
      ) : careerBlogs.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dynamicStyles.horizontalScroll}>
          {careerBlogs.map((blog, idx) => (
            <BlogCard key={blog._id} blog={blog} index={idx} />
          ))}
        </ScrollView>
      ) : (
        <Text style={dynamicStyles.emptyText}>No blogs available</Text>
      )}
    </View>
  );

  const renderJobEvents = () => (
    <View style={dynamicStyles.section}>
      <View style={dynamicStyles.sectionHeader}>
        <View style={dynamicStyles.sectionTitleWrap}>
          <View style={dynamicStyles.sectionAccent} />
          <View>
            <Text style={dynamicStyles.sectionTitle}>Upcoming Job Events</Text>
            <Text style={dynamicStyles.sectionSubtitle}>Job fairs, drives & career workshops</Text>
          </View>
        </View>
        <TouchableOpacity style={dynamicStyles.viewAllButton} onPress={() => navigation.navigate('JobEvents')}>
          <Text style={dynamicStyles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={dynamicStyles.loadingText}>Loading events...</Text>
      ) : upcomingEvents.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.horizontalScroll}
        >
          {upcomingEvents.map((event) => (
            <TouchableOpacity
              key={event._id}
              style={dynamicStyles.eventCard}
              onPress={() => Alert.alert('Event Details', `${event.title}\n\nEvent details screen coming soon!`)}
            >
              <View style={dynamicStyles.eventHeader}>
                <View style={dynamicStyles.eventIconContainer}>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                </View>
                <View style={dynamicStyles.eventStatusBadge}>
                  <Text style={dynamicStyles.eventStatusText}>{event.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={dynamicStyles.eventTitle} numberOfLines={2}>{event.title}</Text>
              <Text style={dynamicStyles.eventDescription} numberOfLines={2}>{event.description}</Text>
              <View style={dynamicStyles.eventDetails}>
                <View style={dynamicStyles.eventDetailItem}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                  <Text style={dynamicStyles.eventDetailText}>
                    {new Date(event.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={dynamicStyles.eventDetailItem}>
                  <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                  <Text style={dynamicStyles.eventDetailText} numberOfLines={1}>{event.city || 'N/A'}</Text>
                </View>
              </View>
              <View style={dynamicStyles.eventFooter}>
                <Text style={dynamicStyles.eventOrganizer} numberOfLines={1}>{event.organizerName}</Text>
                <TouchableOpacity style={dynamicStyles.eventButton}>
                  <Text style={dynamicStyles.eventButtonText}>Details</Text>
                  <Ionicons name="arrow-forward" size={11} color="#FFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={dynamicStyles.emptyText}>No upcoming events</Text>
      )}
    </View>
  );

  const renderFAQ = () => {
    if (homeFaqs.length === 0) return null;
    return (
      <View style={dynamicStyles.faqSection}>
      <View style={dynamicStyles.sectionHeader}>
          <View style={dynamicStyles.sectionTitleWrap}>
            <View style={dynamicStyles.sectionAccent} />
            <View>
              <Text style={dynamicStyles.sectionTitle}>Frequently Asked Questions</Text>
              <Text style={dynamicStyles.sectionSubtitle}>Everything you need to know about Freejobwala</Text>
            </View>
          </View>
          <TouchableOpacity style={dynamicStyles.viewAllButton} onPress={() => navigation.navigate('FAQs')}>
            <Text style={dynamicStyles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.faqGrid}>
          {homeFaqs.map((faq) => (
            <TouchableOpacity
              key={faq._id}
              style={[dynamicStyles.faqItem, openFaqId === faq._id && dynamicStyles.faqItemOpen]}
              onPress={() => setOpenFaqId(openFaqId === faq._id ? null : faq._id)}
              activeOpacity={0.8}
            >
              <View style={dynamicStyles.faqRow}>
                <View style={dynamicStyles.faqIconWrap}>
                  <Ionicons name="help-circle" size={18} color={colors.primary} />
                </View>
                <Text style={dynamicStyles.faqQuestion} numberOfLines={openFaqId === faq._id ? 0 : 2}>
                  {faq.question}
                </Text>
                <Ionicons
                  name={openFaqId === faq._id ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#94A3B8"
                />
              </View>
              {openFaqId === faq._id && (
                <Text style={dynamicStyles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderResumeCTA = () => (
    <View style={dynamicStyles.resumeSection}>
      <View style={dynamicStyles.resumeCTA}>
        <View style={dynamicStyles.resumeIconWrap}>
          <Ionicons name="document-text" size={28} color={colors.primary} />
        </View>
        <Text style={dynamicStyles.resumeTitle}>Need help with your resume?</Text>
        <Text style={dynamicStyles.resumeSubtitle}>
          Get professional assistance to create a standout resume
        </Text>
        <TouchableOpacity
          style={dynamicStyles.resumeButton}
          onPress={() => navigation.navigate('ResumeBuilder')}
        >
          <Ionicons name="document-text" size={18} color="#FFF" />
          <Text style={dynamicStyles.resumeButtonText}>Build Resume</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={dynamicStyles.container}>
      <Header />

      {/* Job Alert Modal */}
      <Modal
        visible={showJobAlertModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJobAlertModal(false)}
      >
        <View style={jobAlertModalStyles.overlay}>
          <TouchableOpacity
            style={jobAlertModalStyles.backdrop}
            activeOpacity={1}
            onPress={() => setShowJobAlertModal(false)}
          />
          <View style={jobAlertModalStyles.sheet}>
            {/* Modal header bar */}
            <View style={jobAlertModalStyles.sheetHeader}>
              <View style={jobAlertModalStyles.sheetHeaderLeft}>
                <View style={jobAlertModalStyles.sheetIconBox}>
                  <Ionicons name="notifications" size={18} color="#fff" />
                </View>
                <View>
                  <Text style={jobAlertModalStyles.sheetTitle}>Create Job Alert</Text>
                  <Text style={jobAlertModalStyles.sheetSubtitle}>Get notified when matching jobs are posted</Text>
                </View>
              </View>
              <TouchableOpacity
                style={jobAlertModalStyles.closeBtn}
                onPress={() => setShowJobAlertModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            {/* Render the form screen inside the modal */}
            <JobAlertFormScreen
              navigation={{ goBack: () => setShowJobAlertModal(false) }}
              isModal
            />
          </View>
        </View>
      </Modal>
      
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

        {renderJobEvents()}

        {renderFAQ()}
        
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

const getStyles = (
  isXsPhone, isSmallPhone, isPhone, isLargePhone, isMobile,
  isSmallTablet, isTablet, isLargeTablet, isTabletDevice,
  isSmallLaptop, isLaptop, isDesktop, isLargeDesktop, isDesktopDevice, width
) => {
  // Calculate responsive values
  const horizontalPadding = isXsPhone ? 8 : isSmallPhone ? 10 : isMobile ? 12 : isSmallTablet ? 16 : isTablet ? 20 : isLargeTablet ? 24 : isSmallLaptop ? 32 : isLaptop ? 40 : 48;
  const maxWidth = isDesktopDevice ? (isLargeDesktop ? 1400 : isDesktop ? 1320 : 1140) : '100%';
  
  return StyleSheet.create({
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
    backgroundColor: '#EEF2FF',
    paddingVertical: isXsPhone ? spacing.lg : isSmallPhone ? spacing.xl : isMobile ? spacing.xxl : isTabletDevice ? spacing.xxl * 1.2 : spacing.xxl * 1.5,
    paddingHorizontal: horizontalPadding,
    alignItems: 'center',
    maxWidth: maxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: isXsPhone ? 26 : isSmallPhone ? 30 : isMobile ? 34 : isSmallTablet ? 38 : isTabletDevice ? 44 : isSmallLaptop ? 52 : 60,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: isXsPhone ? 32 : isSmallPhone ? 36 : isMobile ? 42 : isTabletDevice ? 52 : 70,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: isXsPhone ? 13 : isSmallPhone ? 14 : isMobile ? 15 : isTabletDevice ? 16 : 18,
    color: '#475569',
    textAlign: 'center',
    marginBottom: isXsPhone ? spacing.lg : isMobile ? spacing.xl : spacing.xxl,
    fontWeight: '400',
  },
  searchContainer: {
    width: '100%',
    maxWidth: isDesktopDevice ? 1000 : '100%',
    paddingHorizontal: isXsPhone ? 4 : isMobile ? spacing.xs : 0,
  },
  searchRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: isXsPhone ? 6 : isMobile ? spacing.xs : spacing.sm,
    alignItems: 'stretch',
    position: 'relative',
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.sm : spacing.md),
    gap: isPhone ? spacing.xs : spacing.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
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
    color: '#0F172A',
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
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.sm : spacing.md),
    borderWidth: 1,
    borderColor: '#CBD5E1',
    height: isPhone ? 44 : (isMobile ? 46 : (isTablet ? 48 : 50)),
    minWidth: 0,
  },
  experienceText: {
    ...typography.body1,
    fontSize: isPhone ? 14 : typography.body1.fontSize,
    color: '#0F172A',
    flex: 1,
    ...(isPhone && { marginRight: spacing.xs }),
  },
  placeholderText: {
    color: '#94A3B8',
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
  optionsListContent: {
    paddingBottom: spacing.sm,
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: isPhone ? spacing.sm : spacing.md,
    paddingVertical: isPhone ? spacing.xs : spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    maxWidth: isPhone ? '48%' : undefined,
  },
  popularTagText: {
    ...typography.body2,
    fontSize: isPhone ? 12 : typography.body2.fontSize,
    color: '#475569',
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
    zIndex: 1,
    elevation: 1,
  },
  jobAlertButtonText: {
    ...typography.button,
    fontSize: isPhone ? 14 : typography.button.fontSize,
    color: '#FFFFFF',
  },
  jobAlertSubtext: {
    ...typography.body2,
    fontSize: isPhone ? 12 : typography.body2.fontSize,
    color: '#64748B',
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: isPhone ? '100%' : 400,
    paddingHorizontal: isPhone ? spacing.sm : 0,
  },
  section: {
    paddingVertical: isXsPhone ? spacing.md : isSmallPhone ? spacing.lg : isMobile ? spacing.xl : isTabletDevice ? spacing.xl : spacing.xxl,
    paddingHorizontal: horizontalPadding,
    maxWidth: maxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isXsPhone ? spacing.md : isMobile ? spacing.lg : spacing.xl,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  sectionAccent: {
    width: 4,
    height: isXsPhone ? 28 : isMobile ? 32 : 38,
    backgroundColor: colors.primary,
    borderRadius: 2,
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: isXsPhone ? 17 : isSmallPhone ? 18 : isMobile ? 20 : isSmallTablet ? 22 : isTabletDevice ? 24 : isSmallLaptop ? 26 : 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: isXsPhone ? 11 : isSmallPhone ? 12 : isMobile ? 13 : 14,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '400',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '10',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  jobsGrid: {
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    gap: isXsPhone ? 8 : isSmallPhone ? 10 : isMobile ? spacing.sm : spacing.md,
    justifyContent: isDesktopDevice ? 'flex-start' : 'center',
  },
  jobCardWrapper: {
    width: isMobile ? '100%' : 
           isSmallTablet ? '100%' : 
           isTablet ? '48%' : 
           isLargeTablet ? '48%' :
           isSmallLaptop ? '31.5%' :
           isLaptop ? '31.5%' :
           isDesktop ? '23.5%' : 
           isLargeDesktop ? '23.5%' : 
           '100%',
    flexBasis: isDesktopDevice ? (isLaptop || isSmallLaptop ? '31.5%' : '23.5%') : undefined,
    flexGrow: 0,
    flexShrink: 0,
    maxWidth: isDesktopDevice ? 'none' : undefined,
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
    paddingVertical: isPhone ? spacing.xl : (isMobile ? spacing.xxl : spacing.xxl),
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resumeCTA: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  resumeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resumeTitle: {
    fontSize: isPhone ? 20 : (isMobile ? 22 : 26),
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  resumeSubtitle: {
    fontSize: isPhone ? 14 : 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: isPhone ? spacing.lg : spacing.xl,
    lineHeight: 22,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    paddingHorizontal: isPhone ? spacing.lg : spacing.xxl,
    borderRadius: borderRadius.md,
    ...(isWeb && { boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }),
  },
  resumeButtonText: {
    fontSize: isPhone ? 14 : 15,
    fontWeight: '600',
    color: '#FFF',
  },
  adContainer: {
    paddingVertical: isPhone ? spacing.md : spacing.lg,
    paddingHorizontal: isPhone ? spacing.sm : spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  companySection: {
    backgroundColor: '#F8FAFC',
  },
  companyStatsRow: {
    flexDirection: isPhone ? 'row' : 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  companyStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  companyStatValue: {
    fontSize: isPhone ? 20 : 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  companyStatLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  companyFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  companyFilterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  companyFilterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  companyFilterText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  companyFilterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  companyCarousel: {
    paddingRight: spacing.lg,
    gap: spacing.md,
    paddingBottom: 4,
  },
  // Event Card Styles
  eventCard: {
    width: isMobile ? 260 : isTablet ? 300 : 320,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(isWeb && { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }),
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  eventStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  eventDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  eventDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  eventOrganizer: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.sm,
    fontWeight: '500',
  },
  eventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  eventButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },

  // FAQ Section Styles
  faqSection: {
    paddingVertical: isXsPhone ? spacing.md : isSmallPhone ? spacing.lg : isMobile ? spacing.xl : isTabletDevice ? spacing.xl : spacing.xxl,
    paddingHorizontal: horizontalPadding,
    backgroundColor: '#F8FAFC',
    width: '100%',
    maxWidth: maxWidth,
    alignSelf: 'center',
  },
  faqGrid: {
    gap: spacing.xs,
  },
  faqItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(isWeb && { boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }),
  },
  faqItemOpen: {
    borderColor: colors.primary + '30',
    backgroundColor: '#FAFBFF',
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  faqIconWrap: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  faqQuestion: {
    flex: 1,
    fontSize: isMobile ? 14 : 15,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: isMobile ? 13 : 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: spacing.sm,
    paddingLeft: 42,
  },
})};

export default HomeScreen;

const jobAlertModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 15, 40, 0.72)',
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  sheet: {
    width: '92%',
    maxWidth: 700,
    maxHeight: '92%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.28,
    shadowRadius: 64,
    elevation: 32,
    zIndex: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#4F46E5',
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
