import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import api from '../config/api';
import { useResponsive } from '../utils/responsive';

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

const TrendingJobRoles = ({ navigation }) => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const dynamicStyles = getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width);
  
  const [jobRoles, setJobRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingJobRoles();
  }, []);

  const loadTrendingJobRoles = async () => {
    try {
      setLoading(true);
      const response = await api.getTrendingJobRoles(12);
      console.log('Trending Job Roles API response:', response);
      if (response.success && response.jobRoles && response.jobRoles.length > 0) {
        console.log('Setting job roles:', response.jobRoles);
        setJobRoles(response.jobRoles);
      } else {
        // No data from API - set empty array for fully dynamic data
        console.log('No trending job roles found');
        setJobRoles([]);
      }
    } catch (error) {
      console.error('Error loading trending job roles:', error);
      // Don't use fallback - keep empty array for fully dynamic data
      setJobRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (category) => {
    const iconMap = {
      'Sales': 'storefront-outline',
      'Engineering': 'construct-outline',
      'Management': 'people-outline',
      'Administration': 'briefcase-outline',
      'Finance': 'cash-outline',
      'Healthcare': 'medical-outline',
      'Education': 'school-outline',
      'Technology': 'laptop-outline',
      'Operations': 'cog-outline',
      'Customer Service': 'headset-outline',
      'Marketing': 'megaphone-outline',
      'Human Resources': 'person-outline',
      'Legal': 'document-text-outline',
      'Manufacturing': 'business-outline',
      'Transportation': 'car-outline',
      'Hospitality': 'restaurant-outline',
      'Security': 'shield-outline',
      'Maintenance': 'build-outline',
      'Retail': 'basket-outline',
      'Other': 'briefcase-outline',
    };
    return iconMap[category] || 'briefcase-outline';
  };

  const getColorForCategory = (category) => {
    const colorMap = {
      'Sales': '#FF6B6B',
      'Engineering': '#4ECDC4',
      'Management': '#95E1D3',
      'Administration': '#FCE38A',
      'Finance': '#F38181',
      'Healthcare': '#AA96DA',
      'Education': '#FFD93D',
      'Technology': '#6BCB77',
      'Operations': '#4D96FF',
      'Customer Service': '#95A5A6',
      'Marketing': '#E74C3C',
      'Human Resources': '#3498DB',
      'Legal': '#9B59B6',
      'Manufacturing': '#E67E22',
      'Transportation': '#1ABC9C',
      'Hospitality': '#FF8C94',
      'Security': '#34495E',
      'Maintenance': '#F39C12',
      'Retail': '#27AE60',
      'Other': '#BDC3C7',
    };
    return colorMap[category] || colors.primary;
  };

  const handleRoleClick = (role) => {
    // Navigate to jobs screen with job role filter
    navigation.navigate('Jobs', {
      search: role.name,
    });
  };

  const renderJobRoleCard = ({ item }) => (
    <TouchableOpacity
      style={dynamicStyles.card}
      onPress={() => handleRoleClick(item)}
      activeOpacity={0.7}
    >
      <View style={dynamicStyles.cardIconContainer}>
        <View style={[dynamicStyles.iconBackground, { backgroundColor: getColorForCategory(item.category) + '20' }]}>
          <Ionicons 
            name={getIconForCategory(item.category)} 
            size={isPhone ? 18 : (isMobile ? 20 : 24)} 
            color={getColorForCategory(item.category)} 
          />
        </View>
      </View>
      <View style={dynamicStyles.cardContent}>
        <Text style={dynamicStyles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={dynamicStyles.cardCount}>
          {item.jobCount || 0} openings
        </Text>
      </View>
      <View style={dynamicStyles.cardArrow}>
        <Ionicons name="chevron-forward" size={isPhone ? 16 : (isMobile ? 18 : 20)} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (loading && jobRoles.length === 0) {
    return null;
  }

  if (jobRoles.length === 0) {
    return null;
  }

  const numColumns = isPhone 
    ? 2 
    : isMobile 
    ? 2 
    : isTablet 
    ? (responsive.width > 900 ? 3 : 2)
    : isDesktop 
    ? (responsive.width > 1400 ? 4 : responsive.width > 1200 ? 4 : 3)
    : 2;

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Trending job roles on JobWala</Text>
      </View>

      <View style={dynamicStyles.cardsContainer}>
        <FlatList
          data={jobRoles}
          renderItem={renderJobRoleCard}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          scrollEnabled={isPhone || isMobile}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={numColumns > 1 ? dynamicStyles.row : null}
          key={`${numColumns}-columns`}
        />
      </View>

      <TouchableOpacity
        style={dynamicStyles.viewAllButton}
        onPress={() => navigation.navigate('Jobs')}
        activeOpacity={0.7}
      >
        <Text style={dynamicStyles.viewAllText}>View all</Text>
        <Ionicons name="chevron-forward" size={isPhone ? 14 : 16} color="#10B981" />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (isPhone, isMobile, isTablet, isDesktop, width) => StyleSheet.create({
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
    paddingHorizontal: isPhone ? spacing.sm : (isMobile ? spacing.md : 0),
  },
  cardsContainer: {
    width: '100%',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: isPhone ? spacing.sm : spacing.md,
    gap: isPhone ? spacing.xs : (isMobile ? spacing.xs : spacing.sm),
  },
  card: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: isPhone ? spacing.sm : (isMobile ? spacing.sm : spacing.md),
    marginHorizontal: isPhone ? spacing.xs / 2 : (isMobile ? spacing.xs / 2 : spacing.xs),
    marginBottom: isPhone ? spacing.sm : spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: isPhone ? 65 : (isMobile ? 70 : 80),
    maxWidth: isPhone ? '48%' : (isMobile ? '48%' : undefined),
    ...shadows.sm,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }),
  },
  cardIconContainer: {
    marginRight: spacing.sm,
  },
  iconBackground: {
    width: isPhone ? 36 : (isMobile ? 40 : 48),
    height: isPhone ? 36 : (isMobile ? 40 : 48),
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    fontSize: isPhone ? 12 : (isMobile ? 13 : (isTablet ? 15 : 16)),
    lineHeight: isPhone ? 16 : (isMobile ? 18 : 24),
  },
  cardCount: {
    ...typography.body2,
    color: colors.textSecondary,
    fontSize: isPhone ? 10 : (isMobile ? 11 : 12),
  },
  cardArrow: {
    marginLeft: spacing.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: isPhone ? spacing.md : spacing.lg,
    paddingVertical: isPhone ? spacing.sm : spacing.md,
    paddingHorizontal: isPhone ? spacing.md : (isMobile ? spacing.lg : spacing.xl),
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: borderRadius.md,
    alignSelf: 'center',
    minWidth: isPhone ? '100%' : (isMobile ? '100%' : undefined),
    ...(isWeb && {
      cursor: 'pointer',
    }),
  },
  viewAllText: {
    ...typography.button,
    color: '#10B981',
    fontWeight: '600',
  },
});

export default TrendingJobRoles;

