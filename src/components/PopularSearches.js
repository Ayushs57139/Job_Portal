import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import api from '../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isPhone = width <= 480;
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

const PopularSearches = ({ navigation }) => {
  const [popularSearches, setPopularSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularSearches();
  }, []);

  const loadPopularSearches = async () => {
    try {
      setLoading(true);
      const response = await api.getPopularSearches(5);
      if (response.success && response.popularSearches) {
        setPopularSearches(response.popularSearches);
      }
    } catch (error) {
      console.error('Error loading popular searches:', error);
      // Load default popular searches if API fails
      setPopularSearches(getDefaultPopularSearches());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPopularSearches = () => {
    return [
      {
        _id: '1',
        title: 'Jobs for Freshers',
        searchQuery: '',
        searchParams: {
          search: '',
          experience: 'Fresher (0-1 year)',
        },
        trendingRank: 1,
        icon: 'school-outline',
        color: '#FFB84D',
      },
      {
        _id: '2',
        title: 'Work from Home Jobs',
        searchQuery: '',
        searchParams: {
          search: '',
          workMode: 'Work From Home',
        },
        trendingRank: 2,
        icon: 'home-outline',
        color: '#4ECDC4',
      },
      {
        _id: '3',
        title: 'Part Time Jobs',
        searchQuery: '',
        searchParams: {
          search: '',
          jobType: 'Part Time',
        },
        trendingRank: 3,
        icon: 'time-outline',
        color: '#95E1D3',
      },
      {
        _id: '4',
        title: 'Jobs for Women',
        searchQuery: 'jobs for women',
        searchParams: {
          search: 'jobs for women',
        },
        trendingRank: 4,
        icon: 'people-outline',
        color: '#F38181',
      },
      {
        _id: '5',
        title: 'Full Time Jobs',
        searchQuery: '',
        searchParams: {
          search: '',
          jobType: 'Full Time',
        },
        trendingRank: 5,
        icon: 'briefcase-outline',
        color: '#AA96DA',
      },
    ];
  };

  const handleSearchClick = async (search) => {
    try {
      // Track click if it's from backend (not default)
      const isDefault = ['1', '2', '3', '4', '5'].includes(search._id?.toString());
      if (search._id && !isDefault) {
        await api.trackPopularSearchClick(search._id);
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Build navigation params
    const navParams = {
      search: search.searchParams?.search || search.searchQuery || '',
      location: search.searchParams?.location || '',
    };

    // Add experience if provided
    if (search.searchParams?.experience) {
      navParams.experience = search.searchParams.experience;
    }

    // Add workMode if provided
    if (search.searchParams?.workMode) {
      navParams.workMode = search.searchParams.workMode;
    }

    // Add jobType if provided
    if (search.searchParams?.jobType) {
      navParams.jobType = search.searchParams.jobType;
    }

    // Navigate to jobs screen with search parameters
    navigation.navigate('Jobs', navParams);
  };

  if (loading && popularSearches.length === 0) {
    return null;
  }

  const searchesToDisplay = popularSearches.length > 0 ? popularSearches : getDefaultPopularSearches();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular Searches on JobWala</Text>
      </View>

      <View style={styles.cardsContainer}>
        {searchesToDisplay.map((search, index) => (
          <TouchableOpacity
            key={search._id || index}
            style={styles.card}
            onPress={() => handleSearchClick(search)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.trendingBadge}>
                  TRENDING AT #{search.trendingRank || index + 1}
                </Text>
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{search.title}</Text>
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    onPress={() => handleSearchClick(search)}
                    style={styles.viewAllButton}
                  >
                    <Text style={styles.viewAllText}>View all</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={[styles.cardIconContainer, { backgroundColor: search.color || colors.primary + '20' }]}>
              <Ionicons 
                name={search.icon || 'briefcase-outline'} 
                size={40} 
                color={search.color || colors.primary} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: isPhone ? spacing.lg : (isMobile ? spacing.xl : isTablet ? spacing.xl : spacing.xxl),
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : isTablet ? spacing.lg : spacing.xl),
    maxWidth: isDesktop ? (width > 1400 ? 1400 : 1200) : '100%',
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: isPhone ? spacing.lg : spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: isPhone ? 20 : (isMobile ? 24 : (isTablet ? 28 : (isDesktop ? 36 : 32))),
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    paddingHorizontal: isPhone ? spacing.sm : 0,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isPhone ? spacing.sm : (isMobile ? spacing.md : spacing.lg),
    justifyContent: isDesktop ? 'flex-start' : 'center',
  },
  card: {
    width: isPhone ? '100%' : 
           isMobile ? '100%' : 
           isTablet ? (width > 900 ? '48%' : '100%') : 
           isDesktop ? (width > 1400 ? '31%' : width > 1200 ? '30%' : '48%') : 
           '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: isPhone ? spacing.md : spacing.lg,
    marginBottom: isPhone ? spacing.sm : spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
    minHeight: isPhone ? 180 : 200,
    overflow: 'hidden',
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }),
  },
  cardContent: {
    flex: 1,
    zIndex: 2,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  trendingBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: isPhone ? 16 : (isMobile ? 18 : (isTablet ? 20 : 22)),
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: isPhone ? spacing.sm : spacing.md,
    lineHeight: isPhone ? 22 : 28,
  },
  cardFooter: {
    marginTop: 'auto',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  viewAllText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
  },
  cardIconContainer: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.15,
    zIndex: 1,
  },
});

export default PopularSearches;

