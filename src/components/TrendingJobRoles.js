import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import api from '../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 768;

const TrendingJobRoles = ({ navigation }) => {
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
        console.log('No trending job roles found, trying fallback');
        // Fallback: try to get popular job roles without job counts
        try {
          const popularResponse = await api.getJobRoles(12);
          if (popularResponse.success && popularResponse.jobRoles) {
            console.log('Fallback job roles loaded:', popularResponse.jobRoles);
            setJobRoles(popularResponse.jobRoles.map(role => ({ ...role, jobCount: 0 })));
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error loading trending job roles:', error);
      // Fallback on error too
      try {
        console.log('Error occurred, trying fallback');
        const popularResponse = await api.getJobRoles(12);
        if (popularResponse.success && popularResponse.jobRoles) {
          console.log('Fallback job roles loaded after error:', popularResponse.jobRoles);
          setJobRoles(popularResponse.jobRoles.map(role => ({ ...role, jobCount: 0 })));
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
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
      style={styles.card}
      onPress={() => handleRoleClick(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardIconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: getColorForCategory(item.category) + '20' }]}>
          <Ionicons 
            name={getIconForCategory(item.category)} 
            size={isMobile ? 20 : 24} 
            color={getColorForCategory(item.category)} 
          />
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.cardCount}>
          {item.jobCount || 0} openings
        </Text>
      </View>
      <View style={styles.cardArrow}>
        <Ionicons name="chevron-forward" size={isMobile ? 18 : 20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (loading && jobRoles.length === 0) {
    return null;
  }

  if (jobRoles.length === 0) {
    return null;
  }

  const numColumns = isMobile 
    ? 2 
    : (width > 1200 ? 4 : width > 768 ? 3 : 2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trending job roles on JobWala</Text>
      </View>

      <View style={styles.cardsContainer}>
        <FlatList
          data={jobRoles}
          renderItem={renderJobRoleCard}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          scrollEnabled={false}
          columnWrapperStyle={numColumns > 1 ? styles.row : null}
          key={`${numColumns}-columns`}
        />
      </View>

      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => navigation.navigate('Jobs')}
        activeOpacity={0.7}
      >
        <Text style={styles.viewAllText}>View all</Text>
        <Ionicons name="chevron-forward" size={16} color="#10B981" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: isMobile ? spacing.xl : spacing.xxl,
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: isMobile ? 24 : (isTablet ? 28 : 36),
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    paddingHorizontal: isMobile ? spacing.md : 0,
  },
  cardsContainer: {
    width: '100%',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: isMobile ? spacing.xs : 0,
  },
  card: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: isMobile ? spacing.sm : spacing.md,
    marginHorizontal: isMobile ? spacing.xs / 2 : spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: isMobile ? 70 : 80,
    maxWidth: isMobile ? '48%' : undefined,
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
    width: isMobile ? 40 : 48,
    height: isMobile ? 40 : 48,
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
    fontSize: isMobile ? 13 : 16,
    lineHeight: isMobile ? 18 : 24,
  },
  cardCount: {
    ...typography.body2,
    color: colors.textSecondary,
    fontSize: isMobile ? 11 : 12,
  },
  cardArrow: {
    marginLeft: spacing.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: isMobile ? spacing.lg : spacing.xl,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: borderRadius.md,
    alignSelf: 'center',
    minWidth: isMobile ? '100%' : undefined,
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

