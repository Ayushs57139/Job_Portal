import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import CompanyCard from '../../components/CompanyCard';
import AdvertisementWidget from '../../components/AdvertisementWidget';
import api from '../../config/api';
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

const CompaniesScreen = () => {
  const responsive = useResponsive();
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
  
  const dynamicStyles = useMemo(() => getStyles(
    isXsPhone, isSmallPhone, isPhone, isLargePhone, isMobile,
    isSmallTablet, isTablet, isLargeTablet, isTabletDevice,
    isSmallLaptop, isLaptop, isDesktop, isLargeDesktop, isDesktopDevice, width
  ), [isXsPhone, isSmallPhone, isPhone, isLargePhone, isMobile, isSmallTablet, isTablet, isLargeTablet, isTabletDevice, isSmallLaptop, isLaptop, isDesktop, isLargeDesktop, isDesktopDevice, width]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [industries, setIndustries] = useState([
    { id: 'all', label: 'All Industries', icon: 'business-outline' }
  ]);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [companyFilter, setCompanyFilter] = useState('all');

  useEffect(() => {
    loadCompanies();
    loadIndustries();
  }, []);

  const loadIndustries = async () => {
    try {
      const response = await api.request('/industries');
      if (response.success && response.data) {
        const formattedIndustries = [
          { id: 'all', label: 'All Industries', icon: 'business-outline' },
          ...response.data.map((industry) => ({
            id: industry.name,
            label: industry.name,
            icon: 'business-outline'
          }))
        ];
        setIndustries(formattedIndustries);
      }
    } catch (error) {
      console.error('Error loading industries:', error);
      // Keep default industries if fetch fails
    }
  };

  const loadCompanies = async (industryOverride = null) => {
    try {
      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      
      const industryToUse = industryOverride !== null ? industryOverride : selectedIndustry;
      if (industryToUse && industryToUse !== 'all') {
        filters.industry = industryToUse;
      }
      
      // Set a higher limit to get more companies
      filters.limit = 100;

      const response = await api.getCompanies(filters);
      // Handle different response structures
      let companiesData = [];
      if (response) {
        if (Array.isArray(response.companies)) {
          companiesData = response.companies;
        } else if (Array.isArray(response.data)) {
          companiesData = response.data;
        } else if (Array.isArray(response)) {
          companiesData = response;
        } else if (response.companies && !Array.isArray(response.companies)) {
          // If companies is a single object, wrap it in an array
          companiesData = [response.companies];
        }
      }
      
      // Add rating for better display
      const companiesWithData = companiesData.map((company) => ({
        ...company,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
      }));
      
      setCompanies(companiesWithData);
    } catch (error) {
      console.error('Error loading companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const totalOpenPositions = companies.reduce(
    (sum, company) => sum + (company.openPositions || 0),
    0
  );

  const averageRating =
    companies.length > 0
      ? (
          companies.reduce((sum, company) => sum + parseFloat(company.rating || 0), 0) /
          companies.length
        ).toFixed(1)
      : '4.5';

  const getFilteredCompanies = () => {
    if (companyFilter === 'topRated') {
      return companies.filter((company) => parseFloat(company.rating || 0) >= 4.2);
    }
    if (companyFilter === 'activelyHiring') {
      return companies.filter((company) => (company.openPositions || 0) > 0);
    }
    return companies;
  };

  const filteredCompanies = getFilteredCompanies();

  const handleRefresh = () => {
    setRefreshing(true);
    loadCompanies();
  };

  const handleSearch = () => {
    setLoading(true);
    loadCompanies();
  };

  return (
    <View style={dynamicStyles.container}>
      <Header />
      
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={isWeb ? true : false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero Section */}
        <View style={dynamicStyles.heroSection}>
          <Text style={dynamicStyles.heroTitle}>Top Companies</Text>
          <Text style={dynamicStyles.heroSubtitle}>
            Discover opportunities from leading companies and organizations
          </Text>
          <View style={dynamicStyles.heroStatsRow}>
            <View style={dynamicStyles.heroStatCard}>
              <Text style={dynamicStyles.heroStatValue}>{companies.length}</Text>
              <Text style={dynamicStyles.heroStatLabel}>Active partners</Text>
            </View>
            <View style={dynamicStyles.heroStatCard}>
              <Text style={dynamicStyles.heroStatValue}>{totalOpenPositions}</Text>
              <Text style={dynamicStyles.heroStatLabel}>Open roles</Text>
            </View>
            <View style={dynamicStyles.heroStatCard}>
              <Text style={dynamicStyles.heroStatValue}>{averageRating}/5</Text>
              <Text style={dynamicStyles.heroStatLabel}>Avg. rating</Text>
            </View>
          </View>
        </View>

        {/* Search Section */}
        <View style={dynamicStyles.searchSection}>
          <View style={dynamicStyles.searchRow}>
            <View style={dynamicStyles.searchInputWrapper}>
              <Ionicons name="search-outline" size={isMobile ? 18 : (isTabletDevice ? 20 : 22)} color={colors.textSecondary} />
              <TextInput
                style={dynamicStyles.searchInput}
                placeholder="Search companies by name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={dynamicStyles.dropdownWrapper}>
              <TouchableOpacity 
                style={dynamicStyles.dropdown}
                onPress={() => setShowIndustryDropdown(!showIndustryDropdown)}
              >
                <Text style={dynamicStyles.dropdownText}>
                  {industries.find(ind => ind.id === selectedIndustry)?.label || 'All Industries'}
                </Text>
                <Ionicons 
                  name={showIndustryDropdown ? "chevron-up" : "chevron-down"} 
                  size={isMobile ? 18 : (isTabletDevice ? 20 : 22)} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={dynamicStyles.searchButton} onPress={handleSearch} activeOpacity={0.8}>
              <Ionicons name="search" size={isMobile ? 18 : (isTabletDevice ? 20 : 22)} color={colors.textWhite} />
              <Text style={dynamicStyles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.quickFilters}>
            {[
              { id: 'all', label: 'All companies' },
              { id: 'topRated', label: 'Top rated' },
              { id: 'activelyHiring', label: 'Actively hiring' },
            ].map((filter) => {
              const isActive = companyFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    dynamicStyles.quickFilterChip,
                    isActive && dynamicStyles.quickFilterChipActive,
                  ]}
                  onPress={() => setCompanyFilter(filter.id)}
                >
                  <Ionicons
                    name={
                      filter.id === 'topRated'
                        ? 'star'
                        : filter.id === 'activelyHiring'
                        ? 'flash'
                        : 'grid'
                    }
                    size={isMobile ? 12 : (isTabletDevice ? 14 : 16)}
                    color={isActive ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      dynamicStyles.quickFilterText,
                      isActive && dynamicStyles.quickFilterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={dynamicStyles.trendingTags}>
            {['FinTech', 'Healthcare', 'Remote friendly', 'Design leaders'].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={dynamicStyles.trendingTag}
                onPress={() => {
                  setSearchQuery(tag);
                  handleSearch();
                }}
              >
                <Ionicons name="sparkles" size={isMobile ? 12 : (isTabletDevice ? 14 : 16)} color={colors.primary} />
                <Text style={dynamicStyles.trendingTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Loading or Results Message */}
          {loading && (
            <View style={dynamicStyles.loadingMessage}>
              <Text style={dynamicStyles.loadingMessageText}>Loading companies...</Text>
            </View>
          )}
        </View>

        {/* Dropdown Menu - Positioned Outside */}
        {showIndustryDropdown && (
          <View style={dynamicStyles.dropdownMenuContainer}>
            <TouchableOpacity 
              style={dynamicStyles.dropdownOverlay}
              activeOpacity={1}
              onPress={() => setShowIndustryDropdown(false)}
            />
            <View style={dynamicStyles.dropdownMenuAbsolute}>
              <ScrollView 
                style={dynamicStyles.dropdownScroll}
                showsVerticalScrollIndicator={true}
                bounces={false}
              >
                {industries.map((industry) => (
                  <TouchableOpacity
                    key={industry.id}
                    style={[
                      dynamicStyles.dropdownItem,
                      selectedIndustry === industry.id && dynamicStyles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      setSelectedIndustry(industry.id);
                      setShowIndustryDropdown(false);
                      setLoading(true);
                      // Trigger search with new industry immediately
                      loadCompanies(industry.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={industry.icon} 
                      size={isMobile ? 16 : (isTabletDevice ? 18 : 20)} 
                      color={selectedIndustry === industry.id ? colors.primary : colors.text} 
                    />
                    <Text 
                      style={[
                        dynamicStyles.dropdownItemText,
                        selectedIndustry === industry.id && dynamicStyles.dropdownItemTextSelected
                      ]}
                    >
                      {industry.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Advertisement - Top of companies section */}
        <AdvertisementWidget 
          position="content-top" 
          page="companies"
          containerStyle={dynamicStyles.adContainer}
        />

        {/* Companies Grid */}
        {!loading && filteredCompanies.length > 0 ? (
          <View style={dynamicStyles.companiesSection}>
            <View style={dynamicStyles.companiesGrid}>
              {filteredCompanies.map((company, index) => (
                <View key={company._id} style={dynamicStyles.companyCardWrapper}>
                  <CompanyCard company={company} />
                </View>
              ))}
            </View>

            {/* Ads injected between rows, outside the flex-wrap grid */}
            {filteredCompanies.length > 6 && (
              <AdvertisementWidget
                position="content-middle"
                page="companies"
                containerStyle={dynamicStyles.adContainer}
              />
            )}
            
            {/* Advertisement - Bottom of companies section */}
            {filteredCompanies.length > 3 && (
              <AdvertisementWidget 
                position="content-bottom" 
                page="companies"
                containerStyle={dynamicStyles.adContainer}
              />
            )}
          </View>
        ) : !loading ? (
          <View style={dynamicStyles.emptyContainer}>
            <View style={dynamicStyles.emptyIconContainer}>
              <Ionicons name="business-outline" size={isMobile ? 64 : (isTabletDevice ? 72 : 80)} color={colors.primary} />
            </View>
            <Text style={dynamicStyles.emptyText}>No Companies Found</Text>
            <Text style={dynamicStyles.emptySubtext}>
              We couldn't find any companies matching your search.
            </Text>
            <Text style={dynamicStyles.emptySubtext}>Try adjusting your filters</Text>
            <TouchableOpacity 
              style={dynamicStyles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedIndustry('all');
                handleSearch();
              }}
            >
              <Ionicons name="refresh-outline" size={isMobile ? 18 : (isTabletDevice ? 20 : 22)} color={colors.textWhite} />
              <Text style={dynamicStyles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const getStyles = (
  isXsPhone, isSmallPhone, isPhone, isLargePhone, isMobile,
  isSmallTablet, isTablet, isLargeTablet, isTabletDevice,
  isSmallLaptop, isLaptop, isDesktop, isLargeDesktop, isDesktopDevice, width
) => {
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
  const horizontalPadding = isXsPhone ? 8 : isSmallPhone ? 10 : isMobile ? 12 : isSmallTablet ? 16 : isTablet ? 20 : isLargeTablet ? 24 : isSmallLaptop ? 32 : isLaptop ? 40 : 48;
  
  // Calculate grid columns
  const getGridColumns = () => {
    if (isLargeDesktop || isDesktop) return 4; // desktop: 4 cards
    if (isLaptop) return 3;
    if (isSmallLaptop) return 2;
    if (isTabletDevice) return 2;
    return 1;
  };
  
  const gridColumns = getGridColumns();
  const containerWidth = isDesktopDevice
    ? (isLargeDesktop ? 1600 : isDesktop ? 1400 : 1200)
    : width;
  const cardGap = isMobile ? spacing.md : isTabletDevice ? spacing.lg : spacing.xl;
  // Use CSS calc so desktop reliably renders 4 cards without leftover space
  const cardWidth = isDesktopDevice
    ? `calc((100% - ${(gridColumns - 1) * cardGap}px) / ${gridColumns})`
    : '100%';
  
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    paddingVertical: isMobile ? spacing.xl : spacing.xxl,
    paddingHorizontal: isMobile ? horizontalPadding : (isTabletDevice ? spacing.lg : spacing.xl),
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    maxWidth: isDesktopDevice ? (isLargeDesktop ? 1600 : isDesktop ? 1400 : 1200) : '100%',
    alignSelf: 'center',
    width: '100%',
    ...(isWeb && {
      marginBottom: spacing.lg,
    }),
  },
  heroTitle: {
    fontSize: isMobile ? 26 : (isTabletDevice ? 32 : (isDesktopDevice ? 42 : 36)),
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: isMobile ? spacing.md : 0,
  },
  heroSubtitle: {
    fontSize: isMobile ? 15 : (isTabletDevice ? 16 : 18),
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 0.95,
    maxWidth: 700,
    marginBottom: spacing.lg,
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
  },
  heroStatsRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: spacing.md,
    width: '100%',
    maxWidth: 900,
    marginTop: spacing.sm,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  heroStatLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  searchSection: {
    backgroundColor: colors.cardBackground,
    padding: isMobile ? spacing.md : (isTabletDevice ? spacing.lg : spacing.xl),
    marginHorizontal: isMobile ? horizontalPadding : (isTabletDevice ? spacing.lg : spacing.xl),
    marginTop: -spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.card,
    maxWidth: isDesktopDevice ? 1400 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  searchRow: {
    flexDirection: isDesktopDevice ? 'row' : 'column',
    gap: isMobile ? spacing.sm : spacing.md,
    alignItems: isDesktopDevice ? 'center' : 'stretch',
  },
  searchInputWrapper: {
    flex: isDesktopDevice ? 2 : 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    minHeight: isMobile ? 44 : (isTabletDevice ? 48 : 50),
  },
  searchInput: {
    flex: 1,
    paddingVertical: isMobile ? spacing.sm : spacing.md,
    fontSize: isMobile ? 14 : 15,
    color: colors.text,
  },
  dropdownWrapper: {
    flex: isDesktopDevice ? 1.2 : 1,
    position: 'relative',
    zIndex: 99999,
    elevation: 15,
    minWidth: isDesktopDevice ? 180 : '100%',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
    paddingVertical: isMobile ? spacing.sm : spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: isMobile ? 44 : (isTabletDevice ? 48 : 50),
  },
  dropdownText: {
    fontSize: isMobile ? 14 : 15,
    color: colors.text,
    flex: 1,
    marginRight: spacing.xs,
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  quickFilterChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: colors.primary,
  },
  quickFilterText: {
    fontSize: isMobile ? 12 : (isTabletDevice ? 13 : 14),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  quickFilterTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  trendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  trendingTagText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  dropdownMenuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownMenuAbsolute: {
    position: 'absolute',
    top: isDesktopDevice ? 240 : (isTabletDevice ? 220 : 200),
    left: isMobile ? horizontalPadding : (isTabletDevice ? spacing.lg : spacing.xl),
    right: isMobile ? horizontalPadding : (isTabletDevice ? spacing.lg : spacing.xl),
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    maxHeight: isMobile ? 300 : (isTabletDevice ? 350 : 400),
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.lg,
    elevation: 10,
    ...(isWeb && {
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    }),
  },
  dropdownScroll: {
    maxHeight: isMobile ? 300 : (isTabletDevice ? 350 : 400),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemSelected: {
    backgroundColor: '#E0E7FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.text,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: isMobile ? spacing.sm : spacing.md,
    paddingHorizontal: isMobile ? spacing.md : (isTabletDevice ? spacing.lg : spacing.xl),
    gap: spacing.sm,
    flex: isDesktopDevice ? 0.8 : 1,
    minWidth: isDesktopDevice ? 120 : '100%',
    minHeight: isMobile ? 44 : (isTabletDevice ? 48 : 50),
    ...shadows.sm,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  searchButtonText: {
    fontSize: isMobile ? 14 : (isTabletDevice ? 15 : 16),
    fontWeight: '600',
    color: colors.textWhite,
  },
  loadingMessage: {
    backgroundColor: '#E0E7FF',
    borderRadius: borderRadius.md,
    padding: isMobile ? spacing.sm : spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  loadingMessageText: {
    fontSize: isMobile ? 14 : 15,
    color: colors.primary,
    fontWeight: '500',
  },
  companiesSection: {
    padding: isMobile ? horizontalPadding : (isTabletDevice ? spacing.lg : spacing.xl),
    maxWidth: isDesktopDevice ? (isLargeDesktop ? 1600 : isDesktop ? 1400 : 1200) : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  companiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: cardGap,
    justifyContent: isDesktopDevice ? 'flex-start' : 'center',
    alignItems: 'flex-start',
  },
  companyCardWrapper: {
    width: cardWidth,
    flexBasis: cardWidth,
    alignSelf: 'stretch',
    ...(isDesktopDevice && {
      maxWidth: cardWidth,
    }),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  emptyText: {
    fontSize: 24,
    color: colors.text,
    marginTop: spacing.md,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: isMobile ? spacing.md : spacing.lg,
    paddingHorizontal: isMobile ? spacing.lg : spacing.xl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
    ...shadows.sm,
    minHeight: isMobile ? 44 : 48,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  clearButtonText: {
    fontSize: isMobile ? 14 : 16,
    color: colors.textWhite,
    fontWeight: '600',
  },
  adContainer: {
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  });
};

export default CompaniesScreen;

