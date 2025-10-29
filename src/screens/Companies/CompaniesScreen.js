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
import api from '../../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const CompaniesScreen = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  const industries = [
    { id: 'all', label: 'All Industries', icon: 'business-outline' },
    { id: 'tech', label: 'Technology', icon: 'laptop-outline' },
    { id: 'finance', label: 'Finance', icon: 'cash-outline' },
    { id: 'healthcare', label: 'Healthcare', icon: 'medkit-outline' },
    { id: 'education', label: 'Education', icon: 'school-outline' },
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const filters = {};
      if (searchQuery) filters.search = searchQuery;

      const response = await api.getCompanies(filters);
      const companiesData = response.companies || [];
      
      // Add sample data for better display
      const companiesWithData = companiesData.map((company, index) => ({
        ...company,
        openPositions: Math.floor(Math.random() * 10) + 1,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        employees: ['10-50', '50-200', '200-500', '500+'][Math.floor(Math.random() * 4)],
      }));
      
      setCompanies(companiesWithData);
    } catch (error) {
      console.error('Error loading companies:', error);
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
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>{selectedIndustry === 'all' ? 'All Industries' : selectedIndustry}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
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

        {/* Companies Grid */}
        {!loading && companies.length > 0 ? (
          <View style={styles.companiesSection}>
            <View style={styles.companiesGrid}>
              {companies.map((company) => (
                <View key={company._id} style={styles.companyCardWrapper}>
                  <CompanyCard company={company} />
                </View>
              ))}
            </View>
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
});

export default CompaniesScreen;

