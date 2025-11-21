import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import CompanyCard from '../../components/CompanyCard';
import AdvertisementWidget from '../../components/AdvertisementWidget';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const isWeb = Platform.OS === 'web';

const CompaniesScreen = () => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);
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

      const response = await api.getCompanies(filters);
      const companiesData = response.companies || [];
      
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
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={dynamicStyles.heroSection}
        >
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
        </LinearGradient>

        {/* Search Section */}
        <View style={dynamicStyles.searchSection}>
          <View style={dynamicStyles.searchRow}>
            <View style={dynamicStyles.searchInputWrapper}>
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
                  size={isPhone ? 18 : 20} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={dynamicStyles.searchButton} onPress={handleSearch}>
              <Ionicons name="search" size={isPhone ? 18 : 20} color={colors.textWhite} />
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
                    size={isPhone ? 12 : 14}
                    color={isActive ? '#4338CA' : colors.textSecondary}
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
                <Ionicons name="sparkles" size={isPhone ? 12 : 14} color="#6366F1" />
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
                      size={isPhone ? 16 : 18} 
                      color={selectedIndustry === industry.id ? '#6366F1' : colors.text} 
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
                <React.Fragment key={company._id}>
                  <View style={dynamicStyles.companyCardWrapper}>
                    <CompanyCard company={company} />
                  </View>
                  {/* Show ad after every 6 companies */}
                  {(index + 1) % 6 === 0 && index < filteredCompanies.length - 1 && (
                    <View style={[dynamicStyles.companyCardWrapper, { width: '100%' }]}>
                      <AdvertisementWidget 
                        position="content-middle" 
                        page="companies"
                        containerStyle={dynamicStyles.adContainer}
                      />
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>
            
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
              <Ionicons name="business-outline" size={isPhone ? 64 : (isMobile ? 72 : 80)} color={colors.primary} />
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
              <Ionicons name="refresh-outline" size={isPhone ? 18 : 20} color={colors.textWhite} />
              <Text style={dynamicStyles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const getStyles = (isPhone, isMobile, isTablet, isDesktop, width) => {
  const isWeb = Platform.OS === 'web';
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
    paddingVertical: isPhone ? spacing.xl : (isMobile ? spacing.xxl : spacing.xxl * 1.5),
    paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.lg),
    alignItems: 'center',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...(isWeb && {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    }),
  },
  heroTitle: {
    fontSize: isPhone ? 24 : (isMobile ? 28 : (isTablet ? 32 : (isWeb ? 40 : 32))),
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: isWeb ? 17 : 15,
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 0.95,
    maxWidth: 600,
    marginBottom: spacing.lg,
  },
  heroStatsRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: spacing.md,
    width: '100%',
    maxWidth: 900,
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
    padding: spacing.lg,
    marginHorizontal: isWeb ? spacing.lg : spacing.sm,
    marginTop: -spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  searchRow: {
    flexDirection: isWeb && width > 768 ? 'row' : 'column',
    gap: spacing.sm,
  },
  searchInputWrapper: {
    flex: isWeb && width > 768 ? 2 : 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  dropdownWrapper: {
    flex: isWeb && width > 768 ? 1 : 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
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
    borderColor: '#C7D2FE',
  },
  quickFilterText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  quickFilterTextActive: {
    color: '#4338CA',
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
    top: isWeb ? 220 : 200,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    maxHeight: isWeb ? 400 : 300,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
    elevation: 10,
  },
  dropdownScroll: {
    maxHeight: isWeb ? 400 : 300,
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
    color: '#6366F1',
    fontWeight: '600',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flex: isWeb && width > 768 ? 0.8 : 1,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textWhite,
  },
  loadingMessage: {
    backgroundColor: '#E0E7FF',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  loadingMessageText: {
    fontSize: 15,
    color: '#4F46E5',
    fontWeight: '500',
  },
  companiesSection: {
    padding: isWeb ? spacing.xl : spacing.lg,
  },
  companiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  companyCardWrapper: {
    width: isWeb && width > 1200 ? '31%' : isWeb && width > 768 ? '47%' : '100%',
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
    backgroundColor: '#6366F1',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
    gap: spacing.sm,
    ...shadows.sm,
  },
  clearButtonText: {
    fontSize: 16,
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

