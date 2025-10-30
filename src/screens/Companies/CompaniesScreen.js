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

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const CompaniesScreen = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [industries, setIndustries] = useState([
    { id: 'all', label: 'All Industries', icon: 'business-outline' }
  ]);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

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

  const handleRefresh = () => {
    setRefreshing(true);
    loadCompanies();
  };

  const handleSearch = () => {
    setLoading(true);
    loadCompanies();
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Top Companies</Text>
          <Text style={styles.heroSubtitle}>
            Discover opportunities from leading companies and organizations
          </Text>
        </LinearGradient>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search companies by name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.dropdownWrapper}>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowIndustryDropdown(!showIndustryDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {industries.find(ind => ind.id === selectedIndustry)?.label || 'All Industries'}
                </Text>
                <Ionicons 
                  name={showIndustryDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Ionicons name="search" size={20} color={colors.textWhite} />
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Loading or Results Message */}
          {loading && (
            <View style={styles.loadingMessage}>
              <Text style={styles.loadingMessageText}>Loading companies...</Text>
            </View>
          )}
        </View>

        {/* Dropdown Menu - Positioned Outside */}
        {showIndustryDropdown && (
          <View style={styles.dropdownMenuContainer}>
            <TouchableOpacity 
              style={styles.dropdownOverlay}
              activeOpacity={1}
              onPress={() => setShowIndustryDropdown(false)}
            />
            <View style={styles.dropdownMenuAbsolute}>
              <ScrollView 
                style={styles.dropdownScroll}
                showsVerticalScrollIndicator={true}
                bounces={false}
              >
                {industries.map((industry) => (
                  <TouchableOpacity
                    key={industry.id}
                    style={[
                      styles.dropdownItem,
                      selectedIndustry === industry.id && styles.dropdownItemSelected
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
                      size={18} 
                      color={selectedIndustry === industry.id ? '#6366F1' : colors.text} 
                    />
                    <Text 
                      style={[
                        styles.dropdownItemText,
                        selectedIndustry === industry.id && styles.dropdownItemTextSelected
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
          containerStyle={styles.adContainer}
        />

        {/* Companies Grid */}
        {!loading && companies.length > 0 ? (
          <View style={styles.companiesSection}>
            <View style={styles.companiesGrid}>
              {companies.map((company, index) => (
                <React.Fragment key={company._id}>
                  <View style={styles.companyCardWrapper}>
                    <CompanyCard company={company} />
                  </View>
                  {/* Show ad after every 6 companies */}
                  {(index + 1) % 6 === 0 && index < companies.length - 1 && (
                    <View style={[styles.companyCardWrapper, { width: '100%' }]}>
                      <AdvertisementWidget 
                        position="content-middle" 
                        page="companies"
                        containerStyle={styles.adContainer}
                      />
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>
            
            {/* Advertisement - Bottom of companies section */}
            {companies.length > 3 && (
              <AdvertisementWidget 
                position="content-bottom" 
                page="companies"
                containerStyle={styles.adContainer}
              />
            )}
          </View>
        ) : !loading ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="business-outline" size={80} color={colors.primary} />
            </View>
            <Text style={styles.emptyText}>No Companies Found</Text>
            <Text style={styles.emptySubtext}>
              We couldn't find any companies matching your search.
            </Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedIndustry('all');
                handleSearch();
              }}
            >
              <Ionicons name="refresh-outline" size={20} color={colors.textWhite} />
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
    paddingVertical: spacing.xxl * 1.5,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: isWeb ? 40 : 32,
    fontWeight: '700',
    color: colors.textWhite,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: isWeb ? 17 : 15,
    color: colors.textWhite,
    textAlign: 'center',
    opacity: 0.95,
  },
  searchSection: {
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    ...shadows.md,
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
    padding: spacing.lg,
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

export default CompaniesScreen;

