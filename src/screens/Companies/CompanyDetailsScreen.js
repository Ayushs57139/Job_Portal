import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Dimensions,
  Linking,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const CompanyDetailsScreen = ({ route, navigation }) => {
  const { companyId } = route.params || {};
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadCompanyDetails();
  }, [companyId]);

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getCompany(companyId);
      setCompany(data);
      
      // Try to load company's jobs
      try {
        const jobsData = await api.getJobs({ company: data.name });
        setJobs(jobsData.jobs || []);
      } catch (error) {
        console.log('Could not load jobs:', error);
      }
    } catch (error) {
      console.error('Error loading company details:', error);
      setCompany(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCompanyDetails();
  };

  const handleSocialMediaClick = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const avatarColors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    if (!name) return avatarColors[0];
    const charCode = name.charCodeAt(0);
    return avatarColors[charCode % avatarColors.length];
  };

  const renderTags = (items, label) => {
    if (!items || items.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{label}</Text>
        <View style={styles.tagsContainer}>
          {items.map((item, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading company details...</Text>
        </View>
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Ionicons name="business-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.errorText}>Company not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const companyData = company.profile?.company || {};
  const socialProfile = companyData.socialMediaProfile;
  const socialLink = companyData.socialMediaLink;

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
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(companyData.name) }]}>
            <Text style={styles.avatarText}>{getInitials(companyData.name)}</Text>
          </View>
          <Text style={styles.companyName}>{companyData.name}</Text>
          {companyData.companyType && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{companyData.companyType}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Quick Info */}
        <View style={styles.quickInfoCard}>
          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="briefcase" size={24} color="#6366F1" />
              <Text style={styles.quickInfoLabel}>Industry</Text>
              <Text style={styles.quickInfoValue}>
                {companyData.industry || 'Not specified'}
              </Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="people" size={24} color="#6366F1" />
              <Text style={styles.quickInfoLabel}>Size</Text>
              <Text style={styles.quickInfoValue}>
                {companyData.size || 'Not specified'}
              </Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="calendar" size={24} color="#6366F1" />
              <Text style={styles.quickInfoLabel}>Established</Text>
              <Text style={styles.quickInfoValue}>
                {companyData.establishedYear || company.profile?.company?.company?.foundedYear || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {companyData.description && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>About Company</Text>
            </View>
            <Text style={styles.cardText}>{companyData.description}</Text>
          </View>
        )}

        {/* Location */}
        {(companyData.location?.city || companyData.location?.state) && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Location</Text>
            </View>
            <View style={styles.locationDetails}>
              {companyData.location?.locality && (
                <View style={styles.locationRow}>
                  <Ionicons name="home" size={18} color={colors.textSecondary} />
                  <Text style={styles.locationText}>{companyData.location.locality}</Text>
                </View>
              )}
              {(companyData.location?.city || companyData.location?.state) && (
                <View style={styles.locationRow}>
                  <Ionicons name="map" size={18} color={colors.textSecondary} />
                  <Text style={styles.locationText}>
                    {companyData.location.city}{companyData.location.city && companyData.location.state ? ', ' : ''}{companyData.location.state}
                  </Text>
                </View>
              )}
              {companyData.location?.areaPincode && (
                <View style={styles.locationRow}>
                  <Ionicons name="navigate" size={18} color={colors.textSecondary} />
                  <Text style={styles.locationText}>Pincode: {companyData.location.areaPincode}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Contact & Website */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="call" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Contact & Website</Text>
          </View>
          <View style={styles.contactRow}>
            {company.phone && (
              <TouchableOpacity style={styles.contactItem}>
                <Ionicons name="call-outline" size={20} color={colors.primary} />
                <Text style={styles.contactText}>{company.phone}</Text>
              </TouchableOpacity>
            )}
            {companyData.website && (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleSocialMediaClick(companyData.website)}
              >
                <Ionicons name="globe-outline" size={20} color={colors.primary} />
                <Text style={styles.contactText}>Website</Text>
              </TouchableOpacity>
            )}
          </View>
          {socialProfile && socialLink && (
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialMediaClick(socialLink)}
            >
              <Ionicons name="share-social" size={20} color={colors.primary} />
              <Text style={styles.socialButtonText}>{socialProfile}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Industries & Departments */}
        {renderTags(companyData.industrySubcategories, 'Industries')}
        {renderTags(companyData.departmentSubcategories, 'Departments')}

        {/* Additional Info for Companies */}
        {company.profile?.company?.company && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="stats-chart" size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Company Information</Text>
            </View>
            <View style={styles.infoGrid}>
              {company.profile.company.company.revenue && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Revenue</Text>
                  <Text style={styles.infoValue}>{company.profile.company.company.revenue}</Text>
                </View>
              )}
              {company.profile.company.company.employeeCount && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Employees</Text>
                  <Text style={styles.infoValue}>{company.profile.company.company.employeeCount}</Text>
                </View>
              )}
            </View>
            {renderTags(company.profile.company.company.departments, 'Departments')}
            {renderTags(company.profile.company.company.benefits, 'Benefits')}
            {company.profile.company.company.culture && (
              <View style={styles.textSection}>
                <Text style={styles.sectionTitle}>Company Culture</Text>
                <Text style={styles.textContent}>{company.profile.company.company.culture}</Text>
              </View>
            )}
            {company.profile.company.company.workEnvironment && (
              <View style={styles.textSection}>
                <Text style={styles.sectionTitle}>Work Environment</Text>
                <Text style={styles.textContent}>{company.profile.company.company.workEnvironment}</Text>
              </View>
            )}
          </View>
        )}

        {/* Jobs Section */}
        {jobs.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="briefcase" size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Open Positions ({jobs.length})</Text>
            </View>
            {jobs.slice(0, 5).map((job, index) => (
              <TouchableOpacity
                key={index}
                style={styles.jobItem}
                onPress={() => navigation.navigate('JobDetails', { jobId: job._id })}
              >
                <View style={styles.jobItemHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.jobMeta}>
                  <View style={styles.jobMetaItem}>
                    <Ionicons name="location" size={14} color={colors.textSecondary} />
                    <Text style={styles.jobMetaText}>
                      {job.location?.city}{job.location?.state ? `, ${job.location.state}` : ''}
                    </Text>
                  </View>
                  {job.salaryMin && (
                    <View style={styles.jobMetaItem}>
                      <Ionicons name="cash" size={14} color={colors.textSecondary} />
                      <Text style={styles.jobMetaText}>
                        {api.formatIndianCurrency(job.salaryMin)}
                        {job.salaryMax ? ` - ${api.formatIndianCurrency(job.salaryMax)}` : ' +'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            {jobs.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Jobs', { company: companyData.name })}
              >
                <Text style={styles.viewAllText}>View All Jobs ({jobs.length})</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  errorText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  heroSection: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textWhite,
  },
  companyName: {
    fontSize: isWeb ? 36 : 28,
    fontWeight: '700',
    color: colors.textWhite,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  quickInfoCard: {
    backgroundColor: colors.cardBackground,
    margin: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.md,
  },
  quickInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickInfoItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  quickInfoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  section: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  locationDetails: {
    gap: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationText: {
    fontSize: 15,
    color: colors.text,
  },
  contactRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flex: 1,
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  socialButtonText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoItem: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  textSection: {
    marginBottom: spacing.md,
  },
  textContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  jobItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  jobItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  jobMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jobMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  viewAllButton: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  viewAllText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default CompanyDetailsScreen;
