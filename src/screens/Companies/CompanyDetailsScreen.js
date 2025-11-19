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
  const [similarCompanies, setSimilarCompanies] = useState([]);

  useEffect(() => {
    loadCompanyDetails();
  }, [companyId]);

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getCompany(companyId);
      console.log('Company details loaded:', data);
      setCompany(data);
      
      const companyData = data.profile?.company || {};
      
      // Try to load company's jobs
      try {
        // Use the company name from the loaded data
        const companyName = data.profile?.company?.name || data.name;
        console.log('Loading jobs for company:', companyName);
        const jobsData = await api.getJobs({ search: companyName });
        setJobs(jobsData.jobs || []);
      } catch (error) {
        console.log('Could not load jobs:', error);
      }

      // Load similar companies
      try {
        const filters = { limit: 10 };
        if (companyData.industry) {
          filters.industry = companyData.industry;
        }

        const similarCompaniesData = await api.getCompanies(filters);
        let similarCompaniesList = (similarCompaniesData.companies || [])
          .filter((item) => item._id !== companyId && item._id !== data._id)
          .slice(0, 4);

        // If we don't have enough similar companies, get more recent companies
        if (similarCompaniesList.length < 4) {
          const recentCompanies = await api.getCompanies({ limit: 10 });
          const additionalCompanies = (recentCompanies.companies || [])
            .filter((item) => 
              item._id !== companyId && 
              item._id !== data._id && 
              !similarCompaniesList.some(sc => sc._id === item._id)
            )
            .slice(0, 4 - similarCompaniesList.length);
          similarCompaniesList = [...similarCompaniesList, ...additionalCompanies];
        }

        setSimilarCompanies(similarCompaniesList.slice(0, 4));
      } catch (error) {
        console.error('Error loading similar companies:', error);
        setSimilarCompanies([]);
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

  const handleSimilarCompanyClick = (similarCompanyId) => {
    if (isWeb && typeof window !== 'undefined') {
      const url = `${window.location.origin}/companies/${similarCompanyId}`;
      window.open(url, '_blank');
    } else {
      navigation.navigate('CompanyDetails', { companyId: similarCompanyId });
    }
  };

  const formatCompanyLocation = (location) => {
    if (!location) return 'Location not specified';
    if (typeof location === 'string') return location;
    const parts = [];
    if (location.locality) parts.push(location.locality);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
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
      
      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.mainColumn}>
            {/* Header Section */}
            <View style={styles.headerCard}>
              <View style={styles.headerTop}>
                <View style={styles.companyBadge}>
                  <View style={[styles.avatarContainer, { backgroundColor: getAvatarColor(companyData.name) }]}>
                    <Text style={styles.avatarText}>{getInitials(companyData.name)}</Text>
                  </View>
                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{companyData.name}</Text>
                    {companyData.companyType && (
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{companyData.companyType}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Quick Info */}
              <View style={styles.quickInfo}>
                {companyData.industry && (
                  <View style={styles.detailBadge}>
                    <View style={[styles.detailIconContainer, styles.industryIcon]}>
                      <Ionicons name="briefcase" size={18} color="#ffffff" />
                    </View>
                    <Text style={styles.detailText}>
                      {companyData.industry}
                    </Text>
                  </View>
                )}
                {companyData.size && (
                  <View style={styles.detailBadge}>
                    <View style={[styles.detailIconContainer, styles.sizeIcon]}>
                      <Ionicons name="people" size={18} color="#ffffff" />
                    </View>
                    <Text style={styles.detailText}>
                      {companyData.size}
                    </Text>
                  </View>
                )}
                {(companyData.establishedYear || company.profile?.company?.company?.foundedYear) && (
                  <View style={styles.detailBadge}>
                    <View style={[styles.detailIconContainer, styles.establishedIcon]}>
                      <Ionicons name="calendar" size={18} color="#ffffff" />
                    </View>
                    <Text style={styles.detailText}>
                      {companyData.establishedYear || company.profile?.company?.company?.foundedYear}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Description */}
            {companyData.description && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>About Company</Text>
                </View>
                <Text style={styles.sectionText}>{companyData.description}</Text>
              </View>
            )}

            {/* Location */}
            {(companyData.location?.city || companyData.location?.state) && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="location" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Location</Text>
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
            {(company.phone || companyData.website || (socialProfile && socialLink)) && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="call" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Contact & Website</Text>
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
            )}

            {/* Industries & Departments */}
            {companyData.industrySubcategories && companyData.industrySubcategories.length > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="business" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Industries</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {companyData.industrySubcategories.map((item, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {companyData.departmentSubcategories && companyData.departmentSubcategories.length > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="layers" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Departments</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {companyData.departmentSubcategories.map((item, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Additional Info for Companies */}
            {company.profile?.company?.company && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="stats-chart" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Company Information</Text>
                </View>
                {(company.profile.company.company.revenue || company.profile.company.company.employeeCount) && (
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
                )}
                {company.profile.company.company.departments && company.profile.company.company.departments.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.subsectionTitle}>Departments</Text>
                    <View style={styles.tagsContainer}>
                      {company.profile.company.company.departments.map((item, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {company.profile.company.company.benefits && company.profile.company.company.benefits.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.subsectionTitle}>Benefits</Text>
                    <View style={styles.tagsContainer}>
                      {company.profile.company.company.benefits.map((item, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {company.profile.company.company.culture && (
                  <View style={styles.textSection}>
                    <Text style={styles.subsectionTitle}>Company Culture</Text>
                    <Text style={styles.sectionText}>{company.profile.company.company.culture}</Text>
                  </View>
                )}
                {company.profile.company.company.workEnvironment && (
                  <View style={styles.textSection}>
                    <Text style={styles.subsectionTitle}>Work Environment</Text>
                    <Text style={styles.sectionText}>{company.profile.company.company.workEnvironment}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Jobs Section */}
            {jobs.length > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="briefcase" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Open Positions ({jobs.length})</Text>
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
          </View>
        </ScrollView>

        {/* Sidebar - Similar Companies */}
        {isWeb && similarCompanies.length > 0 && (
          <View style={styles.sidebar}>
            <View style={styles.similarCompaniesContainer}>
              <View style={styles.sidebarHeader}>
                <Ionicons name="business" size={22} color={colors.primary} />
                <Text style={styles.sidebarTitle}>Similar Companies</Text>
              </View>
              <ScrollView style={styles.similarCompaniesScroll} showsVerticalScrollIndicator={false}>
                {similarCompanies.map((similarCompany) => {
                  const similarCompanyName = similarCompany.name || similarCompany.profile?.company?.name || 'Company';
                  const similarCompanyLocation = similarCompany.location || similarCompany.profile?.company?.location;
                  const similarCompanyIndustry = similarCompany.industry || similarCompany.profile?.company?.industry;
                  const similarCompanySize = similarCompany.size || similarCompany.profile?.company?.size;
                  const openPositions = similarCompany.openPositions || 0;
                  
                  return (
                    <TouchableOpacity
                      key={similarCompany._id}
                      style={styles.similarCompanyCard}
                      onPress={() => handleSimilarCompanyClick(similarCompany._id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.similarCompanyHeader}>
                        <View style={[styles.similarCompanyIconContainer, { backgroundColor: getAvatarColor(similarCompanyName) }]}>
                          <Text style={styles.similarCompanyInitials}>{getInitials(similarCompanyName)}</Text>
                        </View>
                        <View style={styles.similarCompanyHeaderText}>
                          <Text style={styles.similarCompanyTitle} numberOfLines={2}>
                            {similarCompanyName}
                          </Text>
                          {similarCompanyIndustry && (
                            <Text style={styles.similarCompanyIndustry} numberOfLines={1}>
                              {similarCompanyIndustry}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.similarCompanyDetails}>
                        {similarCompanyLocation && (
                          <View style={styles.similarCompanyDetail}>
                            <Ionicons name="location" size={14} color={colors.textSecondary} />
                            <Text style={styles.similarCompanyDetailText} numberOfLines={1}>
                              {formatCompanyLocation(similarCompanyLocation)}
                            </Text>
                          </View>
                        )}
                        {similarCompanySize && (
                          <View style={styles.similarCompanyDetail}>
                            <Ionicons name="people" size={14} color={colors.textSecondary} />
                            <Text style={styles.similarCompanyDetailText} numberOfLines={1}>
                              {similarCompanySize}
                            </Text>
                          </View>
                        )}
                        {openPositions > 0 && (
                          <View style={styles.similarCompanyDetail}>
                            <Ionicons name="briefcase" size={14} color={colors.success || '#10B981'} />
                            <Text style={styles.similarCompanyDetailText} numberOfLines={1}>
                              {openPositions} Open Positions
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.similarCompanyFooter}>
                        <Text style={styles.viewCompanyText}>View Company</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: isWeb ? 'row' : 'column',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: isWeb ? spacing.xl : spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    ...(isWeb && {
      alignItems: 'flex-start',
      maxWidth: 800,
    }),
  },
  mainColumn: {
    width: '100%',
    maxWidth: isWeb ? 800 : '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.error,
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
  // Header Card Styles
  headerCard: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  headerTop: {
    marginBottom: spacing.lg,
  },
  companyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textWhite,
  },
  companyInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  companyName: {
    ...typography.h1,
    color: colors.text,
    fontSize: isWeb ? 36 : 32,
    lineHeight: 44,
  },
  typeBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignSelf: 'flex-start',
  },
  typeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  // Detail Badges
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xs,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  industryIcon: {
    backgroundColor: '#3B82F6',
  },
  sizeIcon: {
    backgroundColor: '#8B5CF6',
  },
  establishedIcon: {
    backgroundColor: '#10B981',
  },
  detailText: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
    fontSize: 15,
  },
  // Section Cards
  sectionCard: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    fontSize: 20,
  },
  sectionText: {
    ...typography.body1,
    color: colors.text,
    lineHeight: 28,
    fontSize: 16,
  },
  section: {
    marginBottom: spacing.lg,
  },
  subsectionTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
    fontSize: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.xs,
  },
  tagText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  locationDetails: {
    gap: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationText: {
    ...typography.body1,
    color: colors.text,
    fontSize: 15,
  },
  contactRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  contactText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  socialButtonText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoItem: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xs,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
  },
  textSection: {
    marginBottom: spacing.lg,
  },
  jobItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  jobItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  jobTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
  },
  jobMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jobMetaText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 13,
  },
  viewAllButton: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  viewAllText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  // Sidebar Styles (Web)
  sidebar: {
    width: isWeb ? 400 : '100%',
    backgroundColor: colors.background,
    borderLeftWidth: isWeb ? 1 : 0,
    borderLeftColor: colors.borderLight,
    padding: spacing.lg,
    ...(isWeb && {
      position: 'sticky',
      top: 0,
      height: '100vh',
      maxHeight: '100vh',
      overflowY: 'auto',
    }),
  },
  // Similar Companies Container
  similarCompaniesContainer: {
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sidebarTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    fontSize: 20,
  },
  similarCompaniesScroll: {
    flex: 1,
  },
  // Similar Company Card
  similarCompanyCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }),
  },
  similarCompanyHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  similarCompanyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    ...shadows.sm,
  },
  similarCompanyInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textWhite,
  },
  similarCompanyHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  similarCompanyTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
  },
  similarCompanyIndustry: {
    ...typography.body2,
    color: colors.textSecondary,
    fontSize: 13,
  },
  similarCompanyDetails: {
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  similarCompanyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  similarCompanyDetailText: {
    ...typography.caption,
    color: colors.text,
    fontSize: 13,
    flex: 1,
  },
  similarCompanyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  viewCompanyText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CompanyDetailsScreen;
